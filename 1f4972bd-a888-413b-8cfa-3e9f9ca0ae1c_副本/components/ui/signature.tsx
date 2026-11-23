"use client"

/**
 * Signature — an equivalent implementation of the documented React Bits Pro
 * component, written from its public docs. No licence key or registry needed.
 * The original Pro source is not bundled here.
 */
import * as React from "react"

export type SignaturePoint = { x: number; y: number; t?: number; p?: number }
export type SignatureStrokes = SignaturePoint[][]
export type SignaturePen = "fountain" | "ballpoint" | "marker"

export interface SignatureHandle {
  play: () => void
  clear: () => void
  undo: () => void
  getStrokes: () => SignatureStrokes
  toSVG: () => string
  toDataURL: () => string
}

export interface SignatureProps {
  mode?: "play" | "sign"
  strokes?: SignatureStrokes
  /** When set in play mode, the ink writes out this text instead of the built-in strokes. */
  text?: string
  pen?: SignaturePen
  thickness?: number
  speed?: number
  autoplay?: boolean
  loop?: boolean
  pause?: number
  frame?: boolean
  line?: boolean
  name?: string
  role?: string
  placeholder?: string
  aspect?: number
  intro?: boolean
  theme?: "auto" | "light" | "dark"
  inkColor?: string
  surfaceColor?: string
  onChange?: (strokes: SignatureStrokes) => void
  onComplete?: () => void
  className?: string
  style?: React.CSSProperties
}

// A flowing, made-up signature used by play mode. Coordinates are normalised.
const DEFAULT_STROKES: SignatureStrokes = [
  [
    { x: 0.08, y: 0.66 }, { x: 0.14, y: 0.46 }, { x: 0.2, y: 0.33 }, { x: 0.26, y: 0.4 },
    { x: 0.22, y: 0.64 }, { x: 0.3, y: 0.5 }, { x: 0.36, y: 0.36 }, { x: 0.42, y: 0.48 },
    { x: 0.4, y: 0.62 },
  ],
  [
    { x: 0.43, y: 0.6 }, { x: 0.5, y: 0.4 }, { x: 0.56, y: 0.3 }, { x: 0.58, y: 0.45 },
    { x: 0.53, y: 0.62 }, { x: 0.62, y: 0.5 }, { x: 0.7, y: 0.36 }, { x: 0.74, y: 0.5 },
    { x: 0.7, y: 0.63 },
  ],
  [
    { x: 0.5, y: 0.54 }, { x: 0.62, y: 0.58 }, { x: 0.76, y: 0.56 }, { x: 0.88, y: 0.5 },
  ],
  [
    { x: 0.78, y: 0.62 }, { x: 0.86, y: 0.42 }, { x: 0.92, y: 0.6 },
  ],
  [
    { x: 0.1, y: 0.76 }, { x: 0.3, y: 0.73 }, { x: 0.52, y: 0.75 }, { x: 0.74, y: 0.72 }, { x: 0.9, y: 0.74 },
  ],
]

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

function widthAt(pen: SignaturePen, base: number, angle: number, speedRatio: number) {
  if (pen === "ballpoint") return base * 1.5
  if (pen === "marker") return base * 4.2
  // Fountain: swell on downstrokes, thin on upstrokes.
  const down = clamp(Math.abs(Math.sin(angle)) * 1.6, 0.55, 1.7)
  return base * (2.6 * down) * (1 - 0.35 * clamp(speedRatio, 0, 1))
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  pts: SignaturePoint[],
  pen: SignaturePen,
  ink: string,
  base: number,
  w: number,
  h: number,
  upto = pts.length,
) {
  if (pts.length < 2) return
  ctx.strokeStyle = ink
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  for (let i = 1; i < Math.min(upto, pts.length); i++) {
    const a = pts[i - 1], b = pts[i]
    const dx = (b.x - a.x) * w, dy = (b.y - a.y) * h
    const angle = Math.atan2(dy, dx)
    const seg = Math.hypot(dx, dy)
    ctx.lineWidth = widthAt(pen, base, angle, clamp(seg / 26, 0, 1)) * (b.p ?? 1)
    ctx.beginPath()
    ctx.moveTo(a.x * w, a.y * h)
    ctx.lineTo(b.x * w, b.y * h)
    ctx.stroke()
  }
}

const Signature = React.forwardRef<SignatureHandle, SignatureProps>(function Signature(
  {
    mode = "play",
    strokes = DEFAULT_STROKES,
    text,
    pen = "fountain",
    thickness = 1,
    speed = 1,
    autoplay = true,
    loop = false,
    pause = 2400,
    frame = true,
    line = true,
    name,
    role,
    placeholder = "Sign here",
    aspect = 2.4,
    intro = true,
    theme = "auto",
    inkColor,
    surfaceColor,
    onChange,
    onComplete,
    className = "",
    style,
  },
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rafRef = React.useRef(0)
  const genRef = React.useRef(0)
  const strokesRef = React.useRef<SignatureStrokes>(mode === "sign" ? [] : strokes)
  const drawingRef = React.useRef<SignatureStrokes>([])
  const activeRef = React.useRef(0)
  const [hasInk, setHasInk] = React.useState(mode === "play")
  const [drawn, setDrawn] = React.useState(mode === "play")
  const [reveal, setReveal] = React.useState(0)
  const [dark, setDark] = React.useState(true)

  const ink = inkColor ?? (dark ? "#E4E8F2" : "#1b1b1f")
  const surface = surfaceColor ?? (dark ? "#141416" : "#ffffff")

  const fit = React.useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const rect = cv.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h }
    const ctx = cv.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    const current = mode === "sign" ? drawingRef.current : strokesRef.current
    if (!drawn) return
    if (text && mode === "play") {
      const size = Math.min(rect.height * 0.8, (rect.width / Math.max(3, text.length)) * 1.15)
      ctx.font = `600 ${size}px "Kaiti SC", "STKaiti", "KaiTi", "Songti SC", serif`
      ctx.fillStyle = ink
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(text, rect.width / 2, rect.height / 2)
      return
    }
    current.forEach((s) => drawStroke(ctx, s, pen, ink, thickness, rect.width, rect.height, s.length))
  }, [mode, pen, ink, thickness, drawn, text])

  React.useEffect(() => { fit() }, [fit])

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const parent = el.parentElement
    if (theme !== "auto") { setDark(theme === "dark"); return }
    const bg = parent ? getComputedStyle(parent).backgroundColor : ""
    const m = bg.match(/[\d.]+/g)
    const lum = m && m.length >= 3 ? (0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2]) / 255 : 1
    setDark(lum < 0.5)
  }, [theme])

  const paintProgress = React.useCallback((
    progress: number,
  ) => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext("2d")
    if (!ctx) return
    const rect = cv.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)
    const list = mode === "sign" ? drawingRef.current : strokesRef.current
    const total = list.reduce((n, s) => n + s.length, 0)
    let left = progress * total
    for (const s of list) {
      if (left <= 0) break
      const take = Math.min(s.length, left)
      if (take >= 1) drawStroke(ctx, s, pen, ink, thickness, rect.width, rect.height, Math.ceil(take))
      left -= s.length
    }
  }, [mode, pen, ink, thickness])

  const play = React.useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    const gen = ++genRef.current
    strokesRef.current = strokes
    setDrawn(true)
    if (text && mode === "play") {
      const duration = (text.length * 360) / Math.max(0.1, speed)
      setReveal(0)
      const start = performance.now()
      const tick = (now: number) => {
        if (gen !== genRef.current) return
        const t = clamp((now - start) / duration, 0, 1)
        setReveal(t)
        if (t < 1) rafRef.current = requestAnimationFrame(tick)
        else onComplete?.()
      }
      rafRef.current = requestAnimationFrame(tick)
      return
    }
    const total = strokes.reduce((n, s) => n + s.length, 0) || 1
    const duration = (total / 26 / Math.max(0.1, speed)) * 1000
    const start = performance.now()
    const tick = (now: number) => {
      if (gen !== genRef.current) return
      const t = clamp((now - start) / duration, 0, 1)
      paintProgress(t)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else onComplete?.()
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [strokes, text, mode, speed, paintProgress, onComplete])

  React.useEffect(() => {
    if (mode !== "play") return
    if (!autoplay) { setDrawn(true); fit(); return }
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === "undefined") { play(); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); window.setTimeout(play, 260) }
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [mode, autoplay, play, fit])

  React.useEffect(() => {
    if (mode !== "play" || !loop || !autoplay) return
    let timer = 0
    const check = () => { timer = window.setTimeout(() => { play(); check() }, durationOf(strokes, speed) + pause) }
    check()
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, loop, autoplay, pause, strokes, speed, play])

  React.useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  React.useImperativeHandle(ref, () => ({
    play,
    clear() {
      cancelAnimationFrame(rafRef.current)
      genRef.current += 1
      drawingRef.current = []
      strokesRef.current = []
      setHasInk(false)
      setDrawn(false)
      const cv = canvasRef.current
      cv?.getContext("2d")?.clearRect(0, 0, cv.width, cv.height)
      onChange?.([])
    },
    undo() {
      drawingRef.current = drawingRef.current.slice(0, -1)
      strokesRef.current = drawingRef.current.slice()
      setHasInk(drawingRef.current.length > 0)
      fit()
      onChange?.(strokesRef.current)
    },
    getStrokes: () => (mode === "sign" ? drawingRef.current : strokesRef.current).map((s) => s.map((p) => ({ ...p }))),
    toSVG() {
      const list = mode === "sign" ? drawingRef.current : strokesRef.current
      const w = 600, h = Math.round(w / aspect)
      const paths = list.map((s) => {
        const d = s.map((p, i) => `${i ? "L" : "M"}${(p.x * w).toFixed(2)},${(p.y * h).toFixed(2)}`).join(" ")
        return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${(thickness * 2.4).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`
      }).join("")
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${paths}</svg>`
    },
    toDataURL() { return canvasRef.current?.toDataURL("image/png") ?? "" },
  }), [play, mode, aspect, ink, thickness, onChange, fit])

  const local = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) }
  }
  const onDown = (e: React.PointerEvent) => {
    if (mode !== "sign") return
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    const p = local(e)
    const point = { ...p, t: performance.now(), p: e.pressure && e.pressure > 0 ? e.pressure : 1 }
    activeRef.current = drawingRef.current.length
    drawingRef.current = [...drawingRef.current, [point]]
    setHasInk(true)
    setDrawn(true)
    fit()
  }
  const onMove = (e: React.PointerEvent) => {
    if (mode !== "sign" || !e.currentTarget.hasPointerCapture(e.pointerId)) return
    const p = local(e)
    const point = { ...p, t: performance.now(), p: e.pressure && e.pressure > 0 ? e.pressure : 1 }
    const list = drawingRef.current.slice()
    const i = activeRef.current
    if (!list[i]) return
    list[i] = [...list[i], point]
    drawingRef.current = list
    strokesRef.current = list
    fit()
  }
  const onUp = (e: React.PointerEvent) => {
    if (mode !== "sign") return
    try { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    onChange?.(drawingRef.current.map((s) => s.map((p) => ({ ...p }))))
  }

  const h = Math.round(720 / aspect)

  return (
    <div
      ref={rootRef}
      className={`signature ${className}`}
      style={{
        width: "100%",
        maxWidth: 720,
        fontFamily: '"Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif',
        ...style,
      } as React.CSSProperties}
    >
      <div style={{
        position: "relative",
        height: h,
        background: frame ? surface : "transparent",
        border: frame ? `1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.09)"}` : "none",
        borderRadius: frame ? 18 : 0,
        boxShadow: frame ? `0 16px 40px -24px rgba(0,0,0,${dark ? 0.9 : 0.28})` : "none",
        padding: frame ? "22px 26px 18px" : "8px 0",
        boxSizing: "border-box",
        opacity: intro && !drawn ? 0 : 1,
        transition: intro ? "opacity .5s ease" : undefined,
      }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            width: "100%", height: "calc(100% - 44px)", display: "block", touchAction: "none",
            cursor: mode === "sign" ? "crosshair" : "default",
            clipPath: text && mode === "play" && drawn ? `inset(0 ${((1 - reveal) * 100).toFixed(2)}% 0 0)` : undefined,
          }}
        />
        {mode === "sign" && !hasInk && (
          <span style={{
            position: "absolute", left: 0, right: 0, top: "46%", textAlign: "center",
            color: dark ? "rgba(228,232,242,.32)" : "rgba(0,0,0,.32)", fontSize: 14, pointerEvents: "none",
          }}>{placeholder}</span>
        )}
        {line && (
          <div style={{
            height: 1,
            background: dark ? "rgba(228,232,242,.22)" : "rgba(0,0,0,.18)",
            transformOrigin: "left center",
            animation: intro ? "sig-line .8s ease both" : undefined,
          }} />
        )}
        {(name || role) && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
            {name && <span style={{ color: dark ? "#E4E8F2" : "#18181b", fontSize: 13, fontWeight: 600, letterSpacing: ".01em" }}>{name}</span>}
            {role && <span style={{ color: dark ? "rgba(228,232,242,.5)" : "rgba(0,0,0,.5)", fontSize: 12 }}>{role}</span>}
          </div>
        )}
      </div>
      <style>{`@keyframes sig-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  )
})

function durationOf(strokes: SignatureStrokes, speed: number) {
  const total = strokes.reduce((n, s) => n + s.length, 0) || 1
  return (total / 26 / Math.max(0.1, speed)) * 1000 + 400
}

export { Signature }
export default Signature
