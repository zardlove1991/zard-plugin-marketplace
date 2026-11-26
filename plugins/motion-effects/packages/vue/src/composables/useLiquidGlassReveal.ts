// @ts-nocheck
// WebGL2 Logo 揭示引擎：结构性改写成 Vue 生命周期，时间曲线逐段照搬 React 原件。
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { BOX, LOOKS, OUTRO, clamp01, createRenderer, endOf, frameAt, loadLogo, logoUrl } from './liquidGlassRevealEngine'

export interface UseLiquidGlassRevealOptions {
  wrap: Ref<HTMLElement | null>
  settings: () => Record<string, unknown>
  loop: () => boolean
  speed: () => number
  time: () => number | undefined
  logo: () => string
}

export function startEngine(wrap, live) {
  const canvas = document.createElement("canvas")
  canvas.setAttribute("aria-hidden", "true")
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block"
  wrap.appendChild(canvas)

  let renderer = null
  try {
    renderer = createRenderer(canvas)
  } catch (err) {
    console.error(err)
  }
  if (!renderer) {
    canvas.remove()
    return null
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let logo = null
  let time = reduceMotion ? 1.4 : 0 // a still frame with the glass on
  let playing = !reduceMotion
  let pauseLeft = 0
  let outro = 0
  let dirty = true
  let visible = false
  let lost = false
  let raf = 0
  let last = 0

  function tick(now: number) {
    raf = 0
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    const { settings: P, loop, speed, time: fixed } = live.current
    const end = endOf(P)
    if (fixed !== undefined) {
      // Past the end, the frozen time runs on through the loop pause and the blur-out.
      playing = false
      time = fixed
      outro = clamp01((fixed - end - Math.max(0.05, P.hold)) / OUTRO)
    } else if (playing && logo) {
      if (pauseLeft > 0) {
        // Loop pause: hold the finished logo (nothing to redraw), then blur it away so the next
        // reveal starts empty.
        pauseLeft -= dt
        const was = outro
        outro = clamp01(1 - pauseLeft / OUTRO)
        if (pauseLeft <= 0) {
          pauseLeft = 0
          outro = 0
          time = 0
        }
        if (outro !== was || time === 0) dirty = true
      } else {
        time += dt * speed
        if (time >= end) {
          time = end
          if (loop) pauseLeft = Math.max(0.05, P.hold) + OUTRO
          else playing = false
        }
        dirty = true
      }
    }
    if (dirty && logo && renderer && !lost) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      const w = Math.max(1, Math.round(cw * dpr))
      const h = Math.max(1, Math.round(ch * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      const tile = Math.min(P.tileSize, Math.min(cw, ch) / 1.75)
      renderer.render(frameAt(Math.min(time, end), P, outro), w, h, tile * dpr)
      dirty = false
    }
    if (visible && playing && logo && !lost) raf = requestAnimationFrame(tick)
  }

  function kick() {
    if (raf || !visible || lost) return
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) kick()
    else if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  })
  io.observe(wrap)
  const ro = new ResizeObserver(() => {
    dirty = true
    kick()
  })
  ro.observe(wrap)

  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
  }
  const onRestored = () => {
    lost = false
    try {
      renderer = createRenderer(canvas)
      if (renderer && logo) renderer.setLogo(logo)
    } catch (err) {
      console.error(err)
    }
    dirty = true
    kick()
  }
  canvas.addEventListener("webglcontextlost", onLost)
  canvas.addEventListener("webglcontextrestored", onRestored)

  return {
    setLogo(data: LogoData) {
      logo = data
      renderer?.setLogo(data)
      if (!reduceMotion) {
        time = 0
        playing = true
        pauseLeft = 0
        outro = 0
      }
      dirty = true
      kick()
    },
    replay() {
      time = 0
      playing = true
      pauseLeft = 0
      outro = 0
      dirty = true
      kick()
    },
    invalidate() {
      dirty = true
      kick()
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      renderer?.dispose()
      canvas.remove()
    },
  }
}

/* ------------------------------------------------------------------ *
 * GlassReveal21st
 * ------------------------------------------------------------------ */

export function useLiquidGlassReveal(options: UseLiquidGlassRevealOptions) {
  const { wrap, settings, loop, speed, time, logo } = options
  const fallback = ref(false)
  let engine: ReturnType<typeof createEngine> | null = null
  let teardown: (() => void) | null = null
  const live = { current: { settings: settings(), loop: loop(), speed: speed(), time: time() } }

  onMounted(() => {
    const element = wrap.value
    if (!element) return
    engine = startEngine(element, live)
    if (!engine) { fallback.value = true; return }
    teardown = () => { engine?.dispose(); engine = null }
    let cancelled = false
    loadLogo(logo()).then(data => { if (!cancelled) engine?.setLogo(data) }, err => console.error(err))
    logoCleanup = () => { cancelled = true }
  })
  let logoCleanup: (() => void) | null = null

  watch([settings, loop, speed, time], () => {
    live.current = { settings: settings(), loop: loop(), speed: speed(), time: time() }
    engine?.invalidate()
  }, { flush: 'post' })
  watch(logo, value => {
    logoCleanup?.()
    let cancelled = false
    loadLogo(value).then(data => { if (!cancelled) engine?.setLogo(data) }, err => console.error(err))
    logoCleanup = () => { cancelled = true }
  }, { flush: 'post' })

  const replay = () => engine?.replay()
  const fallbackUrl = () => (fallback.value ? logoUrl(logo()) : '')

  onBeforeUnmount(() => { logoCleanup?.(); teardown?.() })
  return { fallback, replay, fallbackUrl }
}

