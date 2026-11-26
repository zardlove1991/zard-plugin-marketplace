import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

const FLIP_THRESHOLD = 6
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smoother = (t: number) => {
  const x = clamp(t, 0, 1)
  return x * x * x * (x * (x * 6 - 15) + 10)
}
const step = (state: Record<string, number>, key: string, target: number, omega: number, zeta: number, dt: number) => {
  const velocity = `v${key}`
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)))
  const h = dt / steps
  for (let index = 0; index < steps; index++) {
    state[velocity]! += (omega * omega * (target - state[key]!) - 2 * zeta * omega * state[velocity]!) * h
    state[key]! += state[velocity]! * h
  }
  const settled = Math.abs(target - state[key]!) < 0.001 && Math.abs(state[velocity]!) < 0.01
  if (settled) {
    state[key] = target
    state[velocity] = 0
  }
  return !settled
}

export interface UseTiltedCardOptions {
  figure: Ref<HTMLElement | null>
  body: Ref<HTMLElement | null>
  shadow: Ref<HTMLElement | null>
  caption: Ref<HTMLElement | null>
  amplitude: () => number
  scale: () => number
  smoothness: () => number
  glare: () => number
  shadowStrength: () => number
  parallax: () => number
  axis: () => 'both' | 'horizontal' | 'vertical'
  reverse: () => boolean
  trackWindow: () => boolean
  floating: () => boolean
  gyroscope: () => boolean
  intro: () => boolean
  introDelay: () => number
  flippable: () => boolean
  interactive: () => boolean
  flipped: () => boolean
  tooltip: () => boolean
}

export function useTiltedCard(options: UseTiltedCardOptions) {
  const {
    figure, body, shadow, caption, amplitude, scale, smoothness, glare, shadowStrength,
    parallax, axis, reverse, trackWindow, floating, gyroscope, intro, introDelay,
    flippable, interactive, flipped, tooltip
  } = options

  const wakeRef: { current: (() => void) | null } = { current: null }
  const flipRef: { current: (() => boolean) | null } = { current: null }
  const canFlip = () => flipRef.current?.() ?? true

  let teardown: (() => void) | null = null

  const start = () => {
    teardown?.()
    teardown = null
    const host = figure.value
    const surface = body.value
    if (!host || !surface) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const s = {
      amplitude: clamp(amplitude(), 0, 60),
      scale: Math.max(0.5, scale()),
      smoothness: clamp(smoothness(), 0, 1),
      glare: clamp(glare(), 0, 1),
      shadow: clamp(shadowStrength(), 0, 1),
      parallax: Math.max(0, parallax()),
      axis: axis(),
      reverse: reverse(),
      trackWindow: trackWindow(),
      floating: floating(),
      gyroscope: gyroscope(),
      intro: intro(),
      introDelay: Math.max(0, introDelay()),
      flippable: flippable(),
      interactive: interactive(),
      flipped: flipped(),
      tooltip: tooltip()
    }
    const state: Record<string, number> = {
      rx: 0, vrx: 0, ry: 0, vry: 0, lift: 0, vlift: 0, ty: 0, vty: 0,
      flip: 0, vflip: 0, press: 0, vpress: 0, tip: 0, vtip: 0,
      shown: 0, vshown: 0, tx: 0, tyy: 0
    }
    const pointer = { nx: 0, ny: 0, x: 0, y: 0, inside: false, mouse: false, seen: false, vx: 0, last: 0 }
    const press = { active: false, x: 0, y: 0, moved: false }
    const tilt = { gamma: 0, beta: 0, baseGamma: 0, baseBeta: 0, calibrated: false, live: false, asked: false }
    let opacity = 1
    let entered = true
    let introAt = -1
    let time = 0.37
    let focused = false
    let raf = 0
    let last = 0
    let visible = true

    if (s.intro && !reduced) {
      entered = false
      opacity = 0
      state.rx = 16
      state.ty = 22
      surface.style.opacity = '0'
    }

    const frame = (now: number) => {
      raf = 0
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05)
      last = Math.max(last, now)
      time += dt
      let busy = false

      const amp = s.amplitude * (reduced ? 0.3 : 1)
      const hovering = pointer.inside && pointer.mouse
      const touching = press.active && !pointer.mouse
      const following = hovering || touching || (s.trackWindow && pointer.seen && !coarse)
      let inputX = 0
      let inputY = 0
      if (following) {
        inputX = pointer.nx
        inputY = pointer.ny
      } else if (tilt.live && s.gyroscope) {
        inputX = clamp((tilt.gamma - tilt.baseGamma) / 22, -1, 1)
        inputY = clamp((tilt.beta - tilt.baseBeta) / 22, -1, 1)
        tilt.baseGamma += (tilt.gamma - tilt.baseGamma) * (1 - Math.exp(-dt / 4))
        tilt.baseBeta += (tilt.beta - tilt.baseBeta) * (1 - Math.exp(-dt / 4))
        busy = true
      } else if (s.floating && !reduced && visible) {
        inputX = 0.32 * Math.sin(time * 0.62) + 0.12 * Math.sin(time * 1.31 + 0.7)
        inputY = 0.26 * Math.sin(time * 0.83 + 1.9) + 0.1 * Math.sin(time * 1.57)
        busy = true
      }
      if (s.axis === 'horizontal') inputY = 0
      if (s.axis === 'vertical') inputX = 0
      const sign = s.reverse ? -1 : 1

      const omega = 20 * Math.pow(0.2, s.smoothness)
      const zeta = 1 - 0.3 * s.smoothness
      const lifted = hovering || touching || focused ? 1 : 0

      if (!entered && introAt >= 0 && now >= introAt) entered = true
      const settle = entered || !s.intro || reduced
      busy = step(state, 'rx', settle ? -inputY * amp * sign : state.rx!, omega, zeta, dt) || busy
      busy = step(state, 'ry', settle ? inputX * amp * sign : state.ry!, omega, zeta, dt) || busy
      busy =
        step(
          state, 'ty',
          settle ? (s.floating && !following && !reduced ? -4 * Math.sin(time * 0.9) : 0) : state.ty!,
          omega * 0.8, 0.9, dt
        ) || busy
      busy = step(state, 'lift', lifted, omega, Math.max(zeta, 0.85), dt) || busy
      busy = step(state, 'flip', s.flipped ? 180 : 0, reduced ? 18 : 9.5, 0.72, dt) || busy
      busy = step(state, 'press', press.active && !press.moved && s.interactive ? 1 : 0, 26, 0.8, dt) || busy
      if (settle && opacity < 1) {
        opacity = Math.min(1, opacity + dt / 0.45)
        busy = true
      }

      const active = lifted > 0 || state.lift! > 0.01
      if (active !== host.hasAttribute('data-active')) host.toggleAttribute('data-active', active)
      const scaleNow = 1 + (s.scale - 1) * state.lift! - 0.02 * state.press!
      const rx = state.rx!
      const ry = state.ry!
      const radiansX = (rx * Math.PI) / 180
      const radiansY = (ry * Math.PI) / 180
      surface.style.transform = `translate3d(0, ${state.ty!.toFixed(2)}px, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${(ry + state.flip!).toFixed(3)}deg) scale(${scaleNow.toFixed(4)})`
      surface.style.opacity = opacity < 1 ? smoother(opacity).toFixed(3) : ''
      surface.style.setProperty('--tc-px', (Math.sin(radiansY) * s.parallax).toFixed(4))
      surface.style.setProperty('--tc-py', (-Math.sin(radiansX) * s.parallax).toFixed(4))
      const reach = Math.max(amp, 1)
      surface.style.setProperty('--tc-gx', `${(50 + (ry / reach) * 46).toFixed(2)}%`)
      surface.style.setProperty('--tc-gy', `${(50 - (rx / reach) * 46).toFixed(2)}%`)
      const energy = Math.min(1, Math.hypot(rx, ry) / reach)
      surface.style.setProperty(
        '--tc-glare',
        (s.glare * Math.max(state.lift!, energy) * (opacity < 1 ? smoother(opacity) : 1)).toFixed(3)
      )

      const shade = shadow.value
      if (shade) {
        const strength = s.shadow * (opacity < 1 ? smoother(opacity) : 1)
        const offsetX = -Math.sin(radiansY) * 22
        const offsetY = 12 + 16 * state.lift! + Math.sin(radiansX) * 18 - state.ty! * 0.6
        const turn = Math.abs(Math.cos((state.flip! * Math.PI) / 180))
        const spread = scaleNow * (0.86 + 0.04 * state.lift!)
        shade.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0) scale(${(spread * (0.2 + 0.8 * turn)).toFixed(4)}, ${spread.toFixed(4)})`
        shade.style.opacity = (strength * (0.6 + 0.4 * state.lift!)).toFixed(3)
      }

      const tip = caption.value
      if (tip) {
        const show = s.tooltip && hovering ? 1 : 0
        busy = step(state, 'shown', show, 16, 1, dt) || busy
        const follow = 1 - Math.exp(-dt / 0.035)
        state.tx! += (pointer.x - state.tx!) * follow
        state.tyy! += (pointer.y - state.tyy!) * follow
        if (Math.abs(pointer.x - state.tx!) + Math.abs(pointer.y - state.tyy!) > 0.2) busy = true
        pointer.vx *= Math.exp(-dt / 0.08)
        busy = step(state, 'tip', reduced ? 0 : clamp(-pointer.vx * 0.012, -14, 14), 18, 0.62, dt) || busy
        tip.style.transform = `translate3d(${state.tx!.toFixed(1)}px, ${state.tyy!.toFixed(1)}px, 0) rotate(${state.tip!.toFixed(2)}deg)`
        tip.style.opacity = Math.max(0, state.shown!).toFixed(3)
      }

      if ((busy || (!settle && s.intro)) && visible) raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (raf || !visible) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    wakeRef.current = wake

    const locate = (event: PointerEvent, area: HTMLElement) => {
      const rect = area.getBoundingClientRect()
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height)
      }
    }
    const track = (event: PointerEvent) => {
      const spot = locate(event, host)
      const now = performance.now()
      const elapsed = Math.max(8, now - (pointer.last || now - 16)) / 1000
      const dx = spot.x - pointer.x
      pointer.vx += (dx / elapsed - pointer.vx) * 0.5
      pointer.last = now
      pointer.x = spot.x
      pointer.y = spot.y
      pointer.nx = clamp((spot.x - spot.width / 2) / (spot.width / 2), -1, 1)
      pointer.ny = clamp((spot.y - spot.height / 2) / (spot.height / 2), -1, 1)
    }
    const onEnter = (event: PointerEvent) => {
      pointer.inside = true
      pointer.mouse = event.pointerType === 'mouse' || event.pointerType === 'pen'
      const spot = locate(event, host)
      pointer.x = spot.x
      pointer.y = spot.y
      state.tx = spot.x
      state.tyy = spot.y
      pointer.vx = 0
      track(event)
      wake()
    }
    const onMove = (event: PointerEvent) => {
      pointer.mouse = event.pointerType === 'mouse' || event.pointerType === 'pen'
      if (!pointer.inside && pointer.mouse) {
        pointer.inside = true
        const spot = locate(event, host)
        pointer.x = spot.x
        pointer.y = spot.y
        state.tx = spot.x
        state.tyy = spot.y
        pointer.vx = 0
      }
      track(event)
      if (press.active && Math.hypot(event.clientX - press.x, event.clientY - press.y) > FLIP_THRESHOLD) press.moved = true
      wake()
    }
    const onLeave = () => {
      pointer.inside = false
      pointer.vx = 0
      wake()
    }
    const onWindowMove = (event: PointerEvent) => {
      if (pointer.inside && pointer.mouse && !host.contains(event.target as Node)) onLeave()
      if (s.trackWindow === false || pointer.inside) return
      const rect = host.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      pointer.seen = true
      pointer.nx = clamp((event.clientX - cx) / Math.max(1, window.innerWidth / 2), -1, 1)
      pointer.ny = clamp((event.clientY - cy) / Math.max(1, window.innerHeight / 2), -1, 1)
      wake()
    }
    const onWindowLeave = () => { pointer.seen = false; wake() }
    const askMotion = () => {
      if (!s.gyroscope || !coarse || tilt.asked) return
      tilt.asked = true
      const request = (window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<void> })?.requestPermission
      if (typeof request === 'function') request.call(window.DeviceOrientationEvent).catch(() => {})
    }
    const onDown = (event: PointerEvent) => {
      press.active = true
      press.moved = false
      press.x = event.clientX
      press.y = event.clientY
      pointer.mouse = event.pointerType === 'mouse' || event.pointerType === 'pen'
      if (!pointer.mouse) {
        pointer.inside = true
        track(event)
      }
      askMotion()
      wake()
    }
    const onUp = (event: PointerEvent) => {
      if (!press.active) return
      press.active = false
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') pointer.inside = false
      wake()
    }
    const onCancel = () => {
      press.active = false
      press.moved = true
      pointer.inside = false
      wake()
    }
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return
      tilt.gamma = event.gamma
      tilt.beta = event.beta
      if (!tilt.calibrated) {
        tilt.baseGamma = event.gamma
        tilt.baseBeta = event.beta
        tilt.calibrated = true
      }
      tilt.live = coarse
      wake()
    }
    flipRef.current = () => !press.moved
    const onFocus = () => { focused = host.matches(':focus-visible'); wake() }
    const onBlur = () => { focused = false; wake() }

    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('focus', onFocus)
    host.addEventListener('blur', onBlur)
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onCancel, { passive: true })
    window.addEventListener('pointermove', onWindowMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onWindowLeave)
    window.addEventListener('deviceorientation', onOrientation)

    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting)
      if (visible && !entered && introAt < 0) introAt = performance.now() + s.introDelay
      wake()
    })
    observer.observe(host)
    wake()

    teardown = () => {
      cancelAnimationFrame(raf)
      wakeRef.current = null
      flipRef.current = null
      observer.disconnect()
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('focus', onFocus)
      host.removeEventListener('blur', onBlur)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('pointermove', onWindowMove)
      document.documentElement.removeEventListener('pointerleave', onWindowLeave)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }

  onMounted(start)
  watch(
    () => [
      amplitude(), scale(), smoothness(), glare(), shadowStrength(), parallax(),
      axis(), reverse(), trackWindow(), floating(), gyroscope(), intro(), introDelay(),
      flippable(), interactive(), flipped(), tooltip()
    ],
    () => {
      start()
      wakeRef.current?.()
    }
  )
  onBeforeUnmount(() => teardown?.())

  return { canFlip }
}
