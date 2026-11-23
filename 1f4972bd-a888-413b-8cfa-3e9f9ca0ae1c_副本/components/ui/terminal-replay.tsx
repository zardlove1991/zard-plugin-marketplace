"use client"

/**
 * Terminal Replay — an equivalent implementation of the documented React Bits
 * Pro component, written from its public docs. No licence key or registry is
 * required. The original Pro source is not bundled here.
 */
import * as React from "react"

export type TerminalStep =
  | { type: "command"; text: string; directory?: string }
  | { type: "output"; lines: string[]; delay?: number }
  | { type: "spinner"; text: string; duration?: number; done?: string; status?: "success" | "error" | "warning" }
  | { type: "progress"; text: string; duration?: number; done?: string }
  | { type: "pause"; duration?: number }
  | { type: "clear" }

export interface TerminalReplayProps {
  script?: TerminalStep[]
  title?: string
  prompt?: string
  directory?: string
  chrome?: "window" | "minimal" | "none"
  frame?: "solid" | "inset"
  dots?: "mono" | "color"
  theme?: "auto" | "light" | "dark"
  accentColor?: string
  windowColor?: string
  textColor?: string
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  height?: number | string
  radius?: number
  typingSpeed?: number
  variance?: number
  lineDelay?: number
  startDelay?: number
  hold?: number
  loop?: boolean
  autoplay?: boolean
  cursor?: "block" | "bar" | "underline"
  copyable?: boolean
  interactive?: boolean
  onComplete?: () => void
  className?: string
  style?: React.CSSProperties
}

export const PROJECT_SETUP_SCRIPT: TerminalStep[] = [
  { type: "command", text: "npx create-next-app@latest weiliantong --typescript --tailwind", directory: "~" },
  { type: "output", lines: ["[muted]✓[/] 创建项目目录 weiliantong", "[muted]✓[/] 安装依赖中…"], delay: 90 },
  { type: "spinner", text: "正在安装依赖", duration: 1400, done: "[success]依赖安装完成[/]", status: "success" },
  { type: "command", text: "cd weiliantong && npm run dev", directory: "~" },
  { type: "output", lines: ["[accent]▲[/] Next.js 15.2.0", "[success]✓[/] 本地服务已启动", "[muted]→[/] http://localhost:3000"] },
  { type: "progress", text: "构建设计令牌", duration: 1500, done: "[success]设计令牌已生成[/]" },
  { type: "pause", duration: 300 },
  { type: "command", text: "git status --short", directory: "~/weiliantong" },
  { type: "output", lines: ["[success] M[/] app/globals.css", "[info]??[/] components/ui/terminal-replay.tsx"], delay: 80 },
]

const TAG_COLORS: Record<string, string> = {
  success: "#4ADE80",
  error: "#F87171",
  warning: "#FBBF24",
  info: "#60A5FA",
  accent: "var(--tr-accent)",
  muted: "rgba(231,231,234,.62)",
  dim: "rgba(231,231,234,.4)",
  bold: "inherit",
}

function inline(text: string, accent: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const re = /\[(success|error|warning|info|accent|muted|dim|bold)\]([\s\S]*?)\[\/\1\]/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = m[1]
    const color = key === "accent" ? accent : TAG_COLORS[key]
    out.push(
      <span key={m.index} style={{ color, fontWeight: key === "bold" ? 700 : undefined }}>
        {m[2]}
      </span>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

type Line = { id: number; kind: "command" | "output" | "status"; text: string; dir?: string; status?: string }

export default function TerminalReplay({
  script = PROJECT_SETUP_SCRIPT,
  title = "weiliantong — zsh",
  prompt = "❯",
  directory = "~",
  chrome = "window",
  frame = "inset",
  dots = "mono",
  theme = "auto",
  accentColor = "#2563eb",
  windowColor,
  textColor,
  fontFamily,
  fontSize = 13,
  lineHeight = 1.7,
  height = 360,
  radius = 16,
  typingSpeed = 26,
  variance = 0.5,
  lineDelay = 70,
  startDelay = 700,
  hold = 3200,
  loop = true,
  autoplay = true,
  cursor = "block",
  copyable = true,
  interactive = true,
  onComplete,
  className = "",
  style,
}: TerminalReplayProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const genRef = useRef(0)
  const skipRef = useRef(false)
  const wakeRef = React.useRef<(() => void) | null>(null)
  const visibleRef = useRef(!autoplay)
  const [lines, setLines] = React.useState<Line[]>([])
  const [typing, setTyping] = React.useState<{ dir: string; text: string } | null>(null)
  const [active, setActive] = React.useState<{ kind: "spinner" | "progress"; text: string; frame?: string; pct?: number } | null>(null)
  const [finished, setFinished] = React.useState(false)
  const seq = React.useRef(0)
  const [dark, setDark] = React.useState(true)

  const nextId = () => ++seq.current

  const wait = React.useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      if (skipRef.current || ms <= 0) { resolve(); return }
      const id = window.setTimeout(() => { wakeRef.current = null; resolve() }, ms)
      wakeRef.current = () => { window.clearTimeout(id); wakeRef.current = null; resolve() }
    })
  }, [])

  const run = React.useCallback(async (generation: number) => {
    setLines([]); setTyping(null); setActive(null); setFinished(false)
    skipRef.current = false
    await wait(startDelay)
    for (const step of script) {
      if (genRef.current !== generation) return
      skipRef.current = false
      if (step.type === "command") {
        const dir = step.directory ?? directory
        const gap = 1000 / Math.max(1, typingSpeed)
        for (let i = 0; i <= step.text.length; i++) {
          if (genRef.current !== generation) return
          setTyping({ dir, text: step.text.slice(0, i) })
          const jitter = 1 + (Math.random() - 0.5) * variance
          await wait(skipRef.current ? 0 : gap * jitter)
        }
        setTyping(null)
        setLines((prev) => [...prev, { id: nextId(), kind: "command", text: step.text, dir }])
      } else if (step.type === "output") {
        for (const text of step.lines) {
          if (genRef.current !== generation) return
          setLines((prev) => [...prev, { id: nextId(), kind: "output", text }])
          await wait(step.delay ?? lineDelay)
        }
      } else if (step.type === "spinner") {
        const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
        const dur = step.duration ?? 1200
        const end = performance.now() + dur
        let i = 0
        setActive({ kind: "spinner", text: step.text, frame: frames[0] })
        while (performance.now() < end) {
          if (genRef.current !== generation) return
          await wait(80)
          i = (i + 1) % frames.length
          setActive({ kind: "spinner", text: step.text, frame: frames[i] })
        }
        setActive(null)
        setLines((prev) => [...prev, { id: nextId(), kind: "status", text: step.done ?? step.text, status: step.status ?? "success" }])
      } else if (step.type === "progress") {
        const dur = step.duration ?? 1200
        const end = performance.now() + dur
        setActive({ kind: "progress", text: step.text, pct: 0 })
        while (performance.now() < end) {
          if (genRef.current !== generation) return
          await wait(60)
          const pct = Math.min(100, Math.round(((performance.now() - (end - dur)) / dur) * 100))
          setActive({ kind: "progress", text: step.text, pct })
        }
        setActive(null)
        setLines((prev) => [...prev, { id: nextId(), kind: "status", text: step.done ?? step.text, status: "success" }])
      } else if (step.type === "pause") {
        await wait(step.duration ?? 300)
      } else if (step.type === "clear") {
        setLines([])
      }
    }
    if (genRef.current !== generation) return
    setFinished(true)
    onComplete?.()
    await wait(hold)
    if (loop && genRef.current === generation) {
      genRef.current += 1
      void run(genRef.current)
    }
  }, [script, directory, typingSpeed, variance, lineDelay, startDelay, hold, loop, onComplete, wait])

  React.useEffect(() => {
    if (!autoplay) return
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === "undefined") {
      visibleRef.current = true
      genRef.current += 1
      void run(genRef.current)
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visibleRef.current) {
        visibleRef.current = true
        genRef.current += 1
        void run(genRef.current)
      } else if (!entry.isIntersecting && visibleRef.current) {
        visibleRef.current = false
        genRef.current += 1
        wakeRef.current?.()
      }
    }, { threshold: 0.25 })
    io.observe(el)
    // Start on mount; the observer only pauses and resumes playback afterwards.
    genRef.current += 1
    void run(genRef.current)
    return () => io.disconnect()
  }, [autoplay, run])

  React.useEffect(() => {
    if (autoplay) return
    genRef.current += 1
    void run(genRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay])

  React.useEffect(() => {
    return () => { genRef.current += 1; wakeRef.current?.() }
  }, [])

  React.useEffect(() => {
    const sc = scrollRef.current
    if (sc) sc.scrollTop = sc.scrollHeight
  }, [lines, typing, active])

  React.useEffect(() => {
    if (theme !== "auto" || !rootRef.current) { setDark(theme === "dark"); return }
    const parent = rootRef.current.parentElement
    const bg = parent ? getComputedStyle(parent).backgroundColor : ""
    const m = bg.match(/[\d.]+/g)
    const lum = m && m.length >= 3 ? (0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2]) / 255 : 1
    setDark(lum < 0.5)
  }, [theme])

  const interact = React.useCallback(() => {
    if (!interactive) return
    if (finished) {
      genRef.current += 1
      void run(genRef.current)
    } else {
      skipRef.current = true
      wakeRef.current?.()
    }
  }, [interactive, finished, run])

  const copy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try { void navigator.clipboard?.writeText(text) } catch { /* clipboard unavailable */ }
  }

  const win = windowColor ?? (dark ? "#111113" : "#ffffff")
  const ink = textColor ?? (dark ? "#E7E7EA" : "#18181b")
  const font = fontFamily ?? "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
  const h = typeof height === "number" ? `${height}px` : height
  const cr = chrome === "window" || chrome === "minimal"
  const dotColors = dots === "color" ? ["#FF5F57", "#FEBC2E", "#28C840"] : ["rgba(128,128,128,.55)", "rgba(128,128,128,.55)", "rgba(128,128,128,.55)"]

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-label="Terminal session playback. Press Enter to skip or restart."
      onClick={interact}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); interact() } }}
      className={className}
      style={{
        "--tr-accent": accentColor,
        "--tr-window": win,
        "--tr-ink": ink,
        "--tr-frame": dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.045)",
        "--tr-panel": dark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.02)",
        width: "100%",
        maxWidth: 720,
        height: h,
        borderRadius: radius,
        overflow: "hidden",
        background: "var(--tr-frame)",
        border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.1)"}`,
        fontFamily: font,
        fontSize,
        lineHeight,
        color: ink,
        cursor: interactive ? "pointer" : "default",
        outline: "none",
        ...style,
      } as React.CSSProperties}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}` }}>
        {chrome === "window" && (
          <span style={{ display: "flex", gap: 7 }}>
            {dotColors.map((c, i) => <span key={i} style={{ width: 11, height: 11, borderRadius: 9, background: c }} />)}
          </span>
        )}
        {cr && <span style={{ margin: "0 auto", fontSize: 11, letterSpacing: "0.02em", opacity: 0.62 }}>{title}</span>}
      </div>
      <div
        ref={scrollRef}
        style={{
          position: "relative",
          height: cr ? `calc(100% - 38px)` : "100%",
          overflow: "hidden",
          background: frame === "inset" ? "var(--tr-window)" : "transparent",
          borderRadius: frame === "inset" ? Math.max(0, radius - 10) : 0,
          margin: frame === "inset" ? 8 : 0,
          padding: "14px 16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {lines.map((line) => (
            <div key={line.id} style={{ display: "flex", alignItems: "baseline", gap: 8, minHeight: `${fontSize * lineHeight}px` }}>
              {line.kind === "command" ? (
                <>
                  <span style={{ color: "var(--tr-accent)", flex: "none" }}>{prompt}</span>
                  <span style={{ color: ink, opacity: 0.55, flex: "none" }}>{line.dir}</span>
                  <span style={{ color: ink }}>{inline(line.text, accentColor)}</span>
                  {copyable && (
                    <button
                      type="button"
                      title="复制命令"
                      onClick={(e) => copy(line.text, e)}
                      style={{ marginLeft: "auto", opacity: 0, border: 0, background: "none", color: ink, fontSize: 11, cursor: "pointer", fontFamily: font }}
                      className="tr-copy"
                    >
                      复制
                    </button>
                  )}
                </>
              ) : (
                <span style={{ color: line.kind === "status" ? TAG_COLORS[line.status ?? "success"] : ink, opacity: line.kind === "output" ? 0.86 : 1 }}>
                  {inline(line.text, accentColor)}
                </span>
              )}
            </div>
          ))}
          {typing && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: "var(--tr-accent)" }}>{prompt}</span>
              <span style={{ opacity: 0.55 }}>{typing.dir}</span>
              <span>{typing.text}</span>
              <span style={{
                display: "inline-block",
                width: cursor === "block" ? "0.62em" : cursor === "bar" ? 2 : "0.62em",
                height: cursor === "underline" ? 2 : "1.05em",
                background: "var(--tr-accent)",
                verticalAlign: cursor === "underline" ? "text-bottom" : "middle",
                animation: "tr-blink 1s steps(1) infinite",
              }} />
            </div>
          )}
          {active && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--tr-accent)" }}>{active.kind === "spinner" ? active.frame : "▍"}</span>
              <span>{inline(active.text, accentColor)}</span>
              {active.kind === "progress" && (
                <span style={{ color: "var(--tr-accent)" }}>
                  [{"█".repeat(Math.floor((active.pct ?? 0) / 5))}{"·".repeat(20 - Math.floor((active.pct ?? 0) / 5))}] {active.pct}%
                </span>
              )}
            </div>
          )}
        </div>
        <style>{`
          @keyframes tr-blink { 50% { opacity: 0; } }
          .tr-copy { transition: opacity .18s ease; }
          [role="button"]:hover .tr-copy, .tr-copy:focus-visible { opacity: .7 !important; }
        `}</style>
      </div>
    </div>
  )
}
