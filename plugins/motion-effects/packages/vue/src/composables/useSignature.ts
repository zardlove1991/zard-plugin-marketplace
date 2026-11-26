import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { SignaturePen, SignaturePoint, SignatureStrokes } from '../types'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

function widthAt(pen: SignaturePen, base: number, angle: number, speedRatio: number) {
  if (pen === 'ballpoint') return base * 1.5
  if (pen === 'marker') return base * 4.2
  const down = clamp(Math.abs(Math.sin(angle)) * 1.6, 0.55, 1.7)
  return base * 2.6 * down * (1 - 0.35 * clamp(speedRatio, 0, 1))
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  pts: SignaturePoint[],
  pen: SignaturePen,
  ink: string,
  base: number,
  w: number,
  h: number,
  upto = pts.length
) {
  if (pts.length < 2) return
  ctx.strokeStyle = ink
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let i = 1; i < Math.min(upto, pts.length); i++) {
    const a = pts[i - 1]!
    const b = pts[i]!
    const dx = (b.x - a.x) * w
    const dy = (b.y - a.y) * h
    const angle = Math.atan2(dy, dx)
    const seg = Math.hypot(dx, dy)
    ctx.lineWidth = widthAt(pen, base, angle, clamp(seg / 26, 0, 1)) * (b.p ?? 1)
    ctx.beginPath()
    ctx.moveTo(a.x * w, a.y * h)
    ctx.lineTo(b.x * w, b.y * h)
    ctx.stroke()
  }
}

const durationOf = (strokes: SignatureStrokes, speed: number) =>
  ((strokes.reduce((n, s) => n + s.length, 0) || 1) / 26 / Math.max(0.1, speed)) * 1000 + 400

export interface UseSignatureOptions {
  root: Ref<HTMLElement | null>
  canvas: Ref<HTMLCanvasElement | null>
  mode: () => 'play' | 'sign'
  strokes: () => SignatureStrokes
  text: () => string | undefined
  pen: () => SignaturePen
  thickness: () => number
  speed: () => number
  autoplay: () => boolean
  loop: () => boolean
  pause: () => number
  inkColor: () => string | undefined
  theme: () => 'auto' | 'light' | 'dark'
  aspect: () => number
  onChange: (strokes: SignatureStrokes) => void
  onComplete: () => void
}

export function useSignature(options: UseSignatureOptions) {
  const {
    root, canvas, mode, strokes, text, pen, thickness, speed, autoplay,
    loop, pause, inkColor, theme, aspect, onChange, onComplete
  } = options

  const ink = () => inkColor() ?? (dark.value ? '#E4E8F2' : '#1b1b1f')

  const hasInk = ref(mode() === 'play')
  const drawn = ref(mode() === 'play')
  const reveal = ref(0)
  const dark = ref(true)

  let raf = 0
  let gen = 0
  let loopTimer = 0
  let strokesData: SignatureStrokes = mode() === 'sign' ? [] : strokes()
  let drawing: SignatureStrokes = []
  let active = 0

  const fit = () => {
    const cv = canvas.value
    if (!cv) return
    const rect = cv.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (cv.width !== w || cv.height !== h) {
      cv.width = w
      cv.height = h
    }
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    const current = mode() === 'sign' ? drawing : strokesData
    if (!drawn.value) return
    const label = text()
    if (label && mode() === 'play') {
      const size = Math.min(rect.height * 0.8, (rect.width / Math.max(3, label.length)) * 1.15)
      ctx.font = `600 ${size}px "Kaiti SC", "STKaiti", "KaiTi", "Songti SC", serif`
      ctx.fillStyle = ink()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, rect.width / 2, rect.height / 2)
      return
    }
    current.forEach(s => drawStroke(ctx, s, pen(), ink(), thickness(), rect.width, rect.height, s.length))
  }

  const paintProgress = (progress: number) => {
    const cv = canvas.value
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const rect = cv.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    const list = mode() === 'sign' ? drawing : strokesData
    const total = list.reduce((n, s) => n + s.length, 0)
    let left = progress * total
    for (const s of list) {
      if (left <= 0) break
      const take = Math.min(s.length, left)
      if (take >= 1) drawStroke(ctx, s, pen(), ink(), thickness(), rect.width, rect.height, Math.ceil(take))
      left -= s.length
    }
  }

  const play = () => {
    cancelAnimationFrame(raf)
    const g = ++gen
    strokesData = strokes()
    drawn.value = true
    const label = text()
    if (label && mode() === 'play') {
      const duration = (label.length * 360) / Math.max(0.1, speed())
      reveal.value = 0
      const start = performance.now()
      const tick = (now: number) => {
        if (g !== gen) return
        const t = clamp((now - start) / duration, 0, 1)
        reveal.value = t
        if (t < 1) raf = requestAnimationFrame(tick)
        else onComplete()
      }
      raf = requestAnimationFrame(tick)
      return
    }
    const total = strokesData.reduce((n, s) => n + s.length, 0) || 1
    const duration = (total / 26 / Math.max(0.1, speed())) * 1000
    const start = performance.now()
    const tick = (now: number) => {
      if (g !== gen) return
      const t = clamp((now - start) / duration, 0, 1)
      paintProgress(t)
      if (t < 1) raf = requestAnimationFrame(tick)
      else onComplete()
    }
    raf = requestAnimationFrame(tick)
  }

  const clear = () => {
    cancelAnimationFrame(raf)
    gen += 1
    drawing = []
    strokesData = []
    hasInk.value = false
    drawn.value = false
    const cv = canvas.value
    cv?.getContext('2d')?.clearRect(0, 0, cv.width, cv.height)
    onChange([])
  }

  const undo = () => {
    drawing = drawing.slice(0, -1)
    strokesData = drawing.slice()
    hasInk.value = drawing.length > 0
    fit()
    onChange(strokesData)
  }

  const getStrokes = (): SignatureStrokes =>
    (mode() === 'sign' ? drawing : strokesData).map(s => s.map(p => ({ ...p })))

  const toSVG = () => {
    const list = mode() === 'sign' ? drawing : strokesData
    const w = 600
    const height = Math.round(w / Math.max(0.1, aspect()))
    const paths = list
      .map(s => {
        const d = s.map((p, i) => `${i ? 'L' : 'M'}${(p.x * w).toFixed(2)},${(p.y * height).toFixed(2)}`).join(' ')
        return `<path d="${d}" fill="none" stroke="${ink()}" stroke-width="${(thickness() * 2.4).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`
      })
      .join('')
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${height}">${paths}</svg>`
  }

  const toDataURL = () => canvas.value?.toDataURL('image/png') ?? ''

  const local = (e: PointerEvent) => {
    const rect = canvas.value!.getBoundingClientRect()
    return {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1)
    }
  }
  const onDown = (e: PointerEvent) => {
    if (mode() !== 'sign') return
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* 忽略 */ }
    const p = local(e)
    const point: SignaturePoint = { ...p, t: performance.now(), p: e.pressure && e.pressure > 0 ? e.pressure : 1 }
    active = drawing.length
    drawing = [...drawing, [point]]
    hasInk.value = true
    drawn.value = true
    fit()
  }
  const onMove = (e: PointerEvent) => {
    if (mode() !== 'sign' || !(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return
    const p = local(e)
    const point: SignaturePoint = { ...p, t: performance.now(), p: e.pressure && e.pressure > 0 ? e.pressure : 1 }
    const list = drawing.slice()
    const i = active
    if (!list[i]) return
    list[i] = [...list[i]!, point]
    drawing = list
    strokesData = list
    fit()
  }
  const onUp = (e: PointerEvent) => {
    if (mode() !== 'sign') return
    try {
      const el = e.currentTarget as HTMLElement
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    } catch { /* 忽略 */ }
    onChange(drawing.map(s => s.map(p => ({ ...p }))))
  }

  // theme="auto" 时从父元素背景推断明暗；挂载与运行中改 theme 都要重算。
  const syncDark = () => {
    if (theme() !== 'auto') {
      dark.value = theme() === 'dark'
      return
    }
    const el = root.value
    const parent = el?.parentElement
    const bg = parent ? getComputedStyle(parent).backgroundColor : ''
    const m = bg.match(/[\d.]+/g)
    const lum = m && m.length >= 3 ? (0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2]) / 255 : 1
    dark.value = lum < 0.5
  }

  onMounted(() => {
    fit()
    syncDark()
    startAutoplay()
  })

  watch(
    () => [mode(), pen(), ink(), thickness(), drawn.value, text(), theme()] as const,
    () => {
      syncDark()
      fit()
    }
  )

  let intersection: IntersectionObserver | null = null
  const startAutoplay = () => {
    intersection?.disconnect()
    intersection = null
    if (mode() !== 'play') return
    if (!autoplay()) {
      drawn.value = true
      fit()
      return
    }
    const el = root.value
    if (!el || typeof IntersectionObserver === 'undefined') {
      play()
      return
    }
    const io = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        io.disconnect()
        window.setTimeout(play, 260)
      }
    }, { threshold: 0.25 })
    io.observe(el)
    intersection = io
  }
  watch(
    () => [mode(), autoplay(), text(), strokes(), speed()] as const,
    startAutoplay,
    { flush: 'post' }
  )

  watch(
    () => [mode(), loop(), autoplay(), pause(), strokes(), speed()] as const,
    () => {
      window.clearTimeout(loopTimer)
      if (mode() !== 'play' || !loop() || !autoplay()) return
      const schedule = () => {
        loopTimer = window.setTimeout(() => {
          play()
          schedule()
        }, durationOf(strokes(), speed()) + pause())
      }
      schedule()
    }
  )

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.clearTimeout(loopTimer)
    intersection?.disconnect()
  })

  return { hasInk, drawn, reveal, dark, play, clear, undo, getStrokes, toSVG, toDataURL, fit, onDown, onMove, onUp }
}
