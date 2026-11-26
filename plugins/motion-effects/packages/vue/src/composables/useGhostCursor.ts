import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { BLUR, COMPOSITE, DOWN, SHADE, SIM, VERTEX } from './ghostCursorShaders'
import type { GhostCursorSettings } from '../types'

const INTRO_MS = 1900
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const parseColor = (value: string): number[] => {
  const text = String(value || '').trim()
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)
  if (hex) {
    const full = hex[1]!.length === 3 ? hex[1]!.replace(/./g, digit => digit + digit) : hex[1]!
    return [0, 2, 4].map(index => Number.parseInt(full!.slice(index, index + 2), 16) / 255)
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text)
  if (rgb) return [rgb[1]!, rgb[2]!, rgb[3]!].map(channel => clamp(Number.parseFloat(channel) / 255, 0, 1))
  return [0.706, 0.592, 0.812]
}

interface Resolved {
  color: number[]
  brightness: number
  size: number
  trail: number
  inertia: number
  turbulence: number
  drift: number
  detail: number
  grain: number
  bloom: number
  bloomRadius: number
  threshold: number
  edge: number
  clickPuff: boolean
  intro: boolean
  theme: number
  fadeDelay: number
  fadeDuration: number
  maxRatio: number
  budget: number
}

interface Program {
  program: WebGLProgram
  fragment: WebGLShader | null
  uniforms: Record<string, WebGLUniformLocation | null>
}

interface Target {
  texture: WebGLTexture | null
  framebuffer: WebGLFramebuffer | null
  width: number
  height: number
}

const compile = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

const link = (gl: WebGL2RenderingContext, vertex: WebGLShader | null, source: string): Program | null => {
  const fragment = compile(gl, gl.FRAGMENT_SHADER, source)
  if (!vertex || !fragment) {
    if (fragment) gl.deleteShader(fragment)
    return null
  }
  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(fragment)
    return null
  }
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.bindAttribLocation(program, 0, 'aPosition')
  gl.linkProgram(program)
  return { program, fragment, uniforms: {} }
}

const inspect = (gl: WebGL2RenderingContext, vertex: WebGLShader, item: Program): boolean => {
  const linked = Boolean(gl.getProgramParameter(item.program, gl.LINK_STATUS))
  if (linked) {
    const count = Number(gl.getProgramParameter(item.program, gl.ACTIVE_UNIFORMS))
    for (let index = 0; index < count; index++) {
      const info = gl.getActiveUniform(item.program, index)
      if (info) item.uniforms[info.name] = gl.getUniformLocation(item.program, info.name)
    }
  } else {
    const failed = [vertex, item.fragment].filter(shader => !shader || !gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    if (failed.length) failed.forEach(shader => shader && console.error(gl.getShaderInfoLog(shader)))
    else console.error(gl.getProgramInfoLog(item.program))
  }
  return linked
}

export interface UseGhostCursorOptions {
  root: Ref<HTMLElement | null>
  canvas: Ref<HTMLCanvasElement | null>
  settings: GhostCursorSettings
}

export function useGhostCursor({ root, canvas, settings }: UseGhostCursorOptions) {
  const generation = ref(0)
  const touch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0)

  const resolve = (): Resolved => {
    const light = settings.theme === 'light'
    return {
      color: parseColor(settings.color ?? '#B497CF').map(channel => Math.pow(channel, 2.2)),
      brightness: Math.max(0, settings.brightness ?? 1),
      size: Math.max(8, settings.size ?? 80),
      trail: clamp(settings.trailLength ?? 50, 1, 200),
      inertia: clamp(settings.inertia ?? 0.5, 0, 0.99),
      turbulence: clamp(settings.turbulence ?? 0.5, 0, 2),
      drift: settings.drift ?? 0.3,
      detail: clamp(settings.detail ?? 1, 0, 1),
      grain: clamp(settings.grainIntensity ?? 0.05, 0, 1),
      bloom: Math.max(0, settings.bloomStrength ?? 0.6),
      bloomRadius: clamp(settings.bloomRadius ?? 1, 0, 3),
      threshold: Math.max(0, settings.bloomThreshold ?? 0.025),
      edge: clamp(settings.edgeIntensity ?? 0, 0, 1),
      clickPuff: settings.clickPuff ?? true,
      intro: settings.intro ?? true,
      theme: light ? 1 : 0,
      fadeDelay: Math.max(0, settings.fadeDelayMs ?? (touch ? 500 : 1000)),
      fadeDuration: Math.max(1, settings.fadeDurationMs ?? (touch ? 1000 : 1500)),
      maxRatio: clamp(settings.maxDevicePixelRatio ?? 2, 0.25, 3),
      budget: Math.max(5e4, settings.targetPixels ?? (touch ? 3e5 : 6e5))
    }
  }
  let live = resolve()
  let wake: (() => void) | null = null
  let releaseTimer = 0

  /** 引擎：整体重放，generation 变化时（上下文恢复）重建 */
  watch(generation, () => start())

  onMounted(() => {
    start()
    // props 变化：更新 settings 并唤醒帧循环（对应 React 每次 render 后的 wakeRef?.()）
    watch(
      () => [
        settings.color, settings.brightness, settings.size, settings.trailLength,
        settings.inertia, settings.turbulence, settings.drift, settings.detail,
        settings.grainIntensity, settings.bloomStrength, settings.bloomRadius,
        settings.bloomThreshold, settings.edgeIntensity, settings.clickPuff,
        settings.intro, settings.theme, settings.fadeDelayMs, settings.fadeDurationMs,
        settings.maxDevicePixelRatio, settings.targetPixels
      ],
      () => {
        live = resolve()
        wake?.()
      }
    )
  })

  function start() {
    const container = root.value
    const surface = canvas.value
    const parent = container?.parentElement
    if (!container || !surface || !parent) return

    window.clearTimeout(releaseTimer)
    const previousPosition = parent.style.position
    const reposition = getComputedStyle(parent).position === 'static'
    if (reposition) parent.style.position = 'relative'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const gl = surface.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'default'
    }) as WebGL2RenderingContext | null
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
      if (reposition) parent.style.position = previousPosition
      return
    }

    const parallel = gl.getExtension('KHR_parallel_shader_compile') as { COMPLETION_STATUS_KHR: number } | null
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const linked = [
      link(gl, vertex, SIM),
      link(gl, vertex, SHADE),
      link(gl, vertex, DOWN),
      link(gl, vertex, BLUR),
      link(gl, vertex, COMPOSITE)
    ]
    let ready = false
    let broken = false
    let disposed = false

    const complete = () =>
      !parallel || linked.every(item => !item || Boolean(gl.getProgramParameter(item.program, parallel.COMPLETION_STATUS_KHR)))

    const discard = () => {
      if (gl.isContextLost()) return
      if (!ready && !complete()) {
        requestAnimationFrame(discard)
        return
      }
      for (const item of linked) {
        if (!item) continue
        if (item.fragment) gl.deleteShader(item.fragment)
        gl.deleteProgram(item.program)
      }
      if (vertex) gl.deleteShader(vertex)
    }

    if (!vertex || linked.some(item => !item)) {
      discard()
      if (reposition) parent.style.position = previousPosition
      return
    }
    const programs = {
      sim: linked[0]!,
      shade: linked[1]!,
      down: linked[2]!,
      blur: linked[3]!,
      composite: linked[4]!
    }

    const finish = () => {
      if (!complete()) return false
      for (const item of Object.values(programs)) if (!inspect(gl, vertex, item)) broken = true
      ready = true
      return true
    }
    if (!parallel) finish()
    if (broken) {
      discard()
      if (reposition) parent.style.position = previousPosition
      return
    }

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.disable(gl.BLEND)
    gl.disable(gl.DEPTH_TEST)

    const createTarget = (): Target => {
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return { texture, framebuffer: gl.createFramebuffer(), width: 0, height: 0 }
    }
    const allocate = (target: Target, w: number, h: number) => {
      if (target.width === w && target.height === h) return false
      target.width = w
      target.height = h
      gl.bindTexture(gl.TEXTURE_2D, target.texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      return true
    }

    const sims = [createTarget(), createTarget()]
    const shade = createTarget()
    const downs = [createTarget(), createTarget(), createTarget()]
    const blurs = [createTarget(), createTarget(), createTarget()]

    const pass = (target: Target | null, program: Program) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null)
      gl.viewport(0, 0, target ? target.width : surface.width, target ? target.height : surface.height)
      gl.useProgram(program.program)
      return program.uniforms
    }
    const bind = (unit: number, texture: WebGLTexture | null) => {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, texture)
    }

    const view = { width: 1, height: 1, ratio: 1, sim: 0.25, shade: 1 }
    const ghost = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, ready: false }
    const pointer = { x: 0, y: 0, inside: false, moved: -1e9 }
    const flow = { y: 0 }
    const puffs: Array<{ x: number; y: number }> = []
    let presence = 0
    let current = 0
    let raf = 0
    let last = 0
    let clock = 0
    let visible = true
    let pageVisible = document.visibilityState !== 'hidden'
    let lost = false
    let dirty = true
    let introLive = live.intro && !reduced && generation.value === 0
    let introStart = -1

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const ratio = Math.min(window.devicePixelRatio || 1, live.maxRatio)
      view.width = width
      view.height = height
      view.ratio = ratio
      const cw = Math.max(1, Math.round(width * ratio))
      const ch = Math.max(1, Math.round(height * ratio))
      if (surface.width !== cw || surface.height !== ch) {
        surface.width = cw
        surface.height = ch
      }
      view.shade = Math.min(1, Math.sqrt(live.budget / (width * height)))
      const sw = Math.max(8, Math.round(width * view.shade))
      const sh = Math.max(8, Math.round(height * view.shade))
      allocate(shade, sw, sh)
      let w = Math.max(4, Math.round(sw / 2))
      let h = Math.max(4, Math.round(sh / 2))
      for (let i = 0; i < 3; i++) {
        allocate(downs[i]!, w, h)
        allocate(blurs[i]!, w, h)
        w = Math.max(2, Math.round(w / 2))
        h = Math.max(2, Math.round(h / 2))
      }
      view.sim = Math.min(0.35, 220 / Math.max(width, height))
      const simW = Math.max(16, Math.round(width * view.sim))
      const simH = Math.max(16, Math.round(height * view.sim))
      allocate(sims[0]!, simW, simH)
      allocate(sims[1]!, simW, simH)
      dirty = true
    }

    const simulate = (dt: number, active: boolean) => {
      const src = sims[current]!
      const dst = sims[1 - current]!
      const scale = view.sim
      const sigma = live.size * scale * 0.3
      const decay = Math.exp(-dt / (0.12 + live.trail * 0.022))
      const u = pass(dst, programs.sim)
      bind(0, src.texture)
      gl.uniform1i(u.uState, 0)
      gl.uniform2f(u.uSize, dst.width, dst.height)
      gl.uniform1f(u.uDt, dt)
      gl.uniform1f(u.uTime, clock)
      gl.uniform1f(u.uDecay, decay)
      gl.uniform1f(u.uDrag, Math.exp(-dt * 2.4))
      gl.uniform2f(u.uDrift, 0, live.drift * 110 * scale)
      gl.uniform1f(u.uTurbulence, live.turbulence * 70 * scale)
      gl.uniform1f(u.uSwirl, 1 / Math.max(1, live.size * scale * 2.2))
      gl.uniform2f(u.uFrom, ghost.px * scale, (view.height - ghost.py) * scale)
      gl.uniform2f(u.uTo, ghost.x * scale, (view.height - ghost.y) * scale)
      gl.uniform1f(u.uRadius, sigma)
      gl.uniform1f(u.uTrail, active ? 0.42 * presence : 0)
      gl.uniform1f(u.uIdle, active ? 0.22 * presence : 0)
      gl.uniform2f(u.uVelocity, ghost.vx * scale * 0.5, -ghost.vy * scale * 0.5)
      const puff = puffs.shift()
      if (puff) gl.uniform4f(u.uPuff, puff.x * scale, (view.height - puff.y) * scale, sigma * 1.4, 0.9)
      else gl.uniform4f(u.uPuff, 0, 0, 1, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      current = 1 - current
    }

    const render = () => {
      let u = pass(shade, programs.shade)
      bind(0, sims[current]!.texture)
      gl.uniform1i(u.uState, 0)
      gl.uniform2f(u.uSimSize, sims[current]!.width, sims[current]!.height)
      gl.uniform2f(u.uView, view.width, view.height)
      gl.uniform2f(u.uHead, ghost.x, view.height - ghost.y)
      gl.uniform1f(u.uHeadSize, live.size * 0.38)
      gl.uniform1f(u.uHeadAmount, ghost.ready ? 0.8 * presence : 0)
      gl.uniform1f(u.uTime, clock)
      gl.uniform3fv(u.uColor, live.color)
      gl.uniform1f(u.uDetail, live.detail)
      gl.uniform1f(u.uNoiseScale, 2.4 / Math.max(20, live.size * 2.6))
      gl.uniform2f(u.uFlow, 0, flow.y)
      gl.uniform1f(u.uBrightness, live.brightness)
      gl.uniform1f(u.uTheme, live.theme)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      let source = shade
      for (let i = 0; i < 3; i++) {
        u = pass(downs[i]!, programs.down)
        bind(0, source.texture)
        gl.uniform1i(u.uSource, 0)
        gl.uniform2f(u.uTexel, 1 / source.width, 1 / source.height)
        gl.uniform1f(u.uThreshold, i === 0 ? live.threshold : 0)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        u = pass(blurs[i]!, programs.blur)
        bind(0, downs[i]!.texture)
        gl.uniform1i(u.uSource, 0)
        gl.uniform2f(u.uDirection, 1 / downs[i]!.width, 0)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        u = pass(downs[i]!, programs.blur)
        bind(0, blurs[i]!.texture)
        gl.uniform1i(u.uSource, 0)
        gl.uniform2f(u.uDirection, 0, 1 / blurs[i]!.height)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        source = downs[i]!
      }

      u = pass(null, programs.composite)
      bind(0, shade.texture)
      bind(1, downs[0]!.texture)
      bind(2, downs[1]!.texture)
      bind(3, downs[2]!.texture)
      gl.uniform1i(u.uShade, 0)
      gl.uniform1i(u.uBloom0, 1)
      gl.uniform1i(u.uBloom1, 2)
      gl.uniform1i(u.uBloom2, 3)
      gl.uniform2f(u.uShadeSize, shade.width, shade.height)
      const spread = live.bloomRadius
      gl.uniform3f(u.uWeights, 1, 0.6 + 0.4 * spread, 0.25 + 0.75 * Math.min(1, spread * spread * 0.5))
      gl.uniform1f(u.uBloom, live.bloom)
      gl.uniform1f(u.uPresence, presence)
      gl.uniform1f(u.uGrain, live.grain)
      gl.uniform1f(u.uEdge, live.edge)
      gl.uniform1f(u.uTime, clock)
      gl.uniform1f(u.uTheme, live.theme)
      gl.uniform3fv(u.uColor, live.color)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const hold = () => {
      last = performance.now()
      if (pointer.moved > -1e9) pointer.moved = last
      if (ghost.ready && pointer.inside) {
        ghost.x = ghost.px = pointer.x
        ghost.y = ghost.py = pointer.y
        ghost.vx = ghost.vy = 0
      }
    }

    const frame = (now: number) => {
      raf = 0
      if (lost || disposed) return
      if (!ready) {
        if (gl.isContextLost()) return
        if (!finish()) {
          hold()
          if (visible && pageVisible) raf = requestAnimationFrame(frame)
          return
        }
        if (broken) {
          dispose()
          return
        }
      }
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05)
      last = Math.max(last, now)
      clock += dt
      if (dirty) resize()
      dirty = false

      if (introLive) {
        if (introStart < 0) introStart = now + 280
        const t = (now - introStart) / INTRO_MS
        if (t >= 0) {
          const e = t < 1 ? t * t * (3 - 2 * t) : 1
          const x = view.width * (0.16 + 0.44 * e + 0.05 * Math.sin(e * Math.PI))
          const y = view.height * (0.7 - 0.24 * e - 0.1 * Math.sin(e * Math.PI * 2))
          if (!ghost.ready) {
            ghost.x = ghost.px = x
            ghost.y = ghost.py = y
            ghost.vx = ghost.vy = 0
            ghost.ready = true
          }
          pointer.x = x
          pointer.y = y
          pointer.inside = true
          pointer.moved = now
          if (t >= 1) introLive = false
        }
      }

      const idle = now - pointer.moved
      const target = !ghost.ready ? 0 : idle < live.fadeDelay ? 1 : Math.max(0, 1 - (idle - live.fadeDelay) / live.fadeDuration)
      presence += (target - presence) * (1 - Math.exp(-dt / (target > presence ? 0.12 : 0.08)))
      if (Math.abs(target - presence) < 0.002) presence = target

      ghost.px = ghost.x
      ghost.py = ghost.y
      if (ghost.ready) {
        if (pointer.inside) {
          const stiffness = 520 * Math.pow(1 - live.inertia, 2) + 26
          const damping = 2 * Math.sqrt(stiffness) * 0.92
          const steps = Math.max(1, Math.ceil(dt / (1 / 240)))
          const h = dt / steps
          for (let i = 0; i < steps; i++) {
            ghost.vx += (stiffness * (pointer.x - ghost.x) - damping * ghost.vx) * h
            ghost.vy += (stiffness * (pointer.y - ghost.y) - damping * ghost.vy) * h
            ghost.x += ghost.vx * h
            ghost.y += ghost.vy * h
          }
        } else {
          const glide = Math.pow(live.inertia, dt * 60)
          ghost.vx *= glide
          ghost.vy *= glide
          ghost.x += ghost.vx * dt
          ghost.y += ghost.vy * dt
        }
      }
      flow.y -= live.drift * 110 * dt

      simulate(dt, presence > 0.01)
      render()

      const busy = introLive || target > 0 || presence > 0.001 || puffs.length > 0
      if (!busy) {
        for (const t of sims) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, t.framebuffer)
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, surface.width, surface.height)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        return
      }
      if (visible && pageVisible) raf = requestAnimationFrame(frame)
    }

    wake = () => {
      if (raf || lost || !visible || !pageVisible || disposed) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height }
    }
    const onLeave = () => {
      const now = performance.now()
      if (pointer.inside && now - pointer.moved < live.fadeDelay) pointer.moved = now
      pointer.inside = false
      wake?.()
    }
    const onPointerMove = (event: PointerEvent) => {
      const spot = locate(event)
      if (spot.inside) introLive = false
      if (!spot.inside) {
        if (pointer.inside) onLeave()
        return
      }
      if (!pointer.inside && !ghost.ready) {
        ghost.x = ghost.px = spot.x
        ghost.y = ghost.py = spot.y
        ghost.vx = ghost.vy = 0
        ghost.ready = true
      } else if (!pointer.inside && presence < 0.05) {
        ghost.x = ghost.px = spot.x
        ghost.y = ghost.py = spot.y
        ghost.vx = ghost.vy = 0
      }
      pointer.x = spot.x
      pointer.y = spot.y
      pointer.inside = true
      pointer.moved = performance.now()
      wake?.()
    }
    const onPointerDown = (event: PointerEvent) => {
      const spot = locate(event)
      if (!spot.inside) return
      onPointerMove(event)
      if (live.clickPuff) {
        puffs.push({ x: spot.x, y: spot.y })
        wake?.()
      }
    }
    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      cancelAnimationFrame(raf)
      raf = 0
    }
    // 上游靠 generation state 重建；Vue 直接 ref++，watch 会重放整个引擎
    const onRestored = () => { generation.value += 1 }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    surface.addEventListener('webglcontextlost', onLost)
    surface.addEventListener('webglcontextrestored', onRestored)

    const resizeObserver = new ResizeObserver(() => {
      dirty = true
      wake?.()
    })
    resizeObserver.observe(container)
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting)
      wake?.()
    })
    intersection.observe(container)
    const onVisibility = () => {
      pageVisible = document.visibilityState !== 'hidden'
      wake?.()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const dispose = () => {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(raf)
      wake = null
      resizeObserver.disconnect()
      intersection.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      surface.removeEventListener('webglcontextlost', onLost)
      surface.removeEventListener('webglcontextrestored', onRestored)
      if (!gl.isContextLost()) {
        for (const target of [...sims, shade, ...downs, ...blurs]) {
          gl.deleteFramebuffer(target.framebuffer)
          gl.deleteTexture(target.texture)
        }
        gl.deleteBuffer(buffer)
        gl.deleteVertexArray(vao)
        discard()
      }
      if (reposition) parent.style.position = previousPosition
    }

    // 把 dispose 暴露给外层：卸载与下一次 start 前都要清掉
    teardown = dispose
    resize()
    if (introLive) wake?.()
  }

  let teardown: (() => void) | null = null

  const stop = () => {
    teardown?.()
    teardown = null
    window.clearTimeout(releaseTimer)
  }

  // generation 变化前先清理上一轮
  watch(generation, () => stop(), { flush: 'sync' })

  onBeforeUnmount(() => {
    stop()
    const surface = canvas.value
    // 上游延后一帧释放上下文，避免 React 卸载时 canvas 还在用；Vue 同样的时序
    releaseTimer = window.setTimeout(() => {
      if (surface && !surface.isConnected) {
        const gl = surface.getContext('webgl2') as WebGL2RenderingContext | null
        if (gl && !gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    }, 0)
  })

  return { generation }
}
