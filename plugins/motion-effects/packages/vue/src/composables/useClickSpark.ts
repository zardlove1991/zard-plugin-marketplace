import { onBeforeUnmount, onMounted } from 'vue'
import type { Ref } from 'vue'

/** 火花形状：短线 / 拖尾 / 圆点 / 星形 */
export type ClickSparkShape = 'line' | 'streak' | 'dot' | 'star'

/** 缓动名，与 React 原件的 EASINGS 表一致 */
export type ClickSparkEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring'

/** 火花层：front 在内容之上，back 在内容之下 */
export type ClickSparkLayer = 'front' | 'back'

export interface ClickSparkSettings {
  /** 火花颜色，单色或一组颜色（按顺序轮换） */
  sparkColor?: string | string[]
  /** 火花长度 / 星形半径 */
  sparkSize?: number
  /** 扩散半径（px） */
  sparkRadius?: number
  /** 每次爆出的火花数 */
  sparkCount?: number
  /** 线条粗细 */
  sparkWidth?: number
  /** 单次爆点的存活时长（ms） */
  duration?: number
  /** 缓动 */
  easing?: ClickSparkEasing
  /** 扩散半径的额外倍率 */
  extraScale?: number
  /** 形状 */
  shape?: ClickSparkShape
  /** 随机抖动强度 0–1 */
  randomness?: number
  /** 重力，0 为悬浮 */
  gravity?: number
  /** 扇形张角（度），360 为整圈 */
  spread?: number
  /** 主方向（度，0 向上） */
  direction?: number
  /** 辉光强度 0–1 */
  glow?: number
  /** 是否画出扩散光环 */
  ring?: boolean
  /** 火花层 */
  layer?: ClickSparkLayer
  /** 关闭点击触发 */
  disabled?: boolean
}

export interface ClickSparkOptions {
  /** 组件根节点 */
  root: Ref<HTMLElement | null>
  /** 火花画布的挂载层 */
  layer: Ref<HTMLElement | null>
  /** 读取当前参数 */
  getSettings: () => ClickSparkSettings
}

const EASINGS: Record<ClickSparkEasing, (t: number) => number> = {
  linear: t => t,
  'ease-in': t => t * t,
  'ease-out': t => 1 - Math.pow(1 - t, 3),
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)
}

const SHAPES: ClickSparkShape[] = ['line', 'streak', 'dot', 'star']
const MAX_BURSTS = 32
const GRAVITY = 500
const REDUCED_MS = 320

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

const toColors = (value: string | string[] | undefined) => {
  const list = (Array.isArray(value) ? value : [value]).filter(Boolean) as string[]
  return list.length ? list : ['#ffffff']
}

interface Spark {
  angle: number
  reach: number
  scale: number
  life: number
  spin: number
  color: string
  clear: string
  glow: number
}

/** props 归一化后的引擎参数 */
interface ResolvedSettings {
  colors: string[]
  size: number
  radius: number
  count: number
  width: number
  duration: number
  ease: (t: number) => number
  shape: ClickSparkShape
  randomness: number
  gravity: number
  spread: number
  direction: number
  glow: number
  ring: boolean
  disabled: boolean
}

interface Burst {
  x: number
  y: number
  start: number
  sparks: Spark[]
  settings: ResolvedSettings
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  ratio: number
  left: number
  top: number
}

function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rotation: number) {
  const pinch = radius * 0.16
  ctx.beginPath()
  ctx.moveTo(x + Math.cos(rotation) * radius, y + Math.sin(rotation) * radius)
  for (let i = 1; i <= 4; i++) {
    const a = rotation + (i * Math.PI) / 2
    const mid = a - Math.PI / 4
    ctx.quadraticCurveTo(
      x + Math.cos(mid) * pinch,
      y + Math.sin(mid) * pinch,
      x + Math.cos(a) * radius,
      y + Math.sin(a) * radius
    )
  }
  ctx.closePath()
}

function channels(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color
  const normal = String(ctx.fillStyle)
  const hex = /^#([0-9a-f]{6})$/i.exec(normal)
  if (hex) {
    const value = parseInt(hex[1], 16)
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(normal)
  if (rgb)
    return rgb[1]
      .split(',')
      .slice(0, 3)
      .map(part => parseFloat(part))
  return [0, 0, 0]
}

/**
 * ClickSpark 的引擎：从 React 原件的 effect 逐段搬过来。
 *
 * 逐帧状态（爆点数组、动画时间）都在普通对象里，不进响应式；
 * 每次点击按需建一张 canvas，画完即从 DOM 移除。
 */
export function useClickSpark({ root, layer, getSettings }: ClickSparkOptions) {
  let raf = 0
  let reduced = false
  let lastPress = { time: -1e9, x: 0, y: 0 }
  const bursts: Burst[] = []

  const settings = (): ResolvedSettings => {
    const raw = getSettings()
    const easing = (raw.easing ?? 'ease-out') as ClickSparkEasing
    return {
      colors: toColors(raw.sparkColor),
      size: Math.max(0, raw.sparkSize ?? 14),
      radius: Math.max(0, raw.sparkRadius ?? 30) * Math.max(0, raw.extraScale ?? 1),
      count: clamp(Math.round(raw.sparkCount ?? 8), 1, 64),
      width: Math.max(0.5, raw.sparkWidth ?? 2),
      duration: Math.max(60, raw.duration ?? 500),
      ease: EASINGS[easing] ?? EASINGS['ease-out'],
      shape: SHAPES.includes(raw.shape as ClickSparkShape) ? (raw.shape as ClickSparkShape) : 'line',
      randomness: clamp(raw.randomness ?? 0.2, 0, 1),
      gravity: Math.max(0, raw.gravity ?? 0),
      spread: clamp(raw.spread ?? 360, 0, 360),
      direction: raw.direction ?? 0,
      glow: clamp(raw.glow ?? 0, 0, 1),
      ring: raw.ring ?? false,
      disabled: raw.disabled ?? false
    }
  }

  const drop = (s: ResolvedSettings, seconds: number) => 0.5 * s.gravity * GRAVITY * seconds * seconds

  const position = (burst: Burst, spark: Spark, distance: number, seconds: number) => [
    burst.x + Math.cos(spark.angle) * distance,
    burst.y + Math.sin(spark.angle) * distance + drop(burst.settings, seconds)
  ]

  const drawSpark = (ctx: CanvasRenderingContext2D, burst: Burst, spark: Spark, elapsed: number) => {
    const s = burst.settings
    const life = reduced ? REDUCED_MS : s.duration * spark.life
    const p = elapsed / life
    if (p >= 1) return false
    const e = reduced ? 0.55 : s.ease(clamp(p, 0, 1))
    const seconds = reduced ? 0 : elapsed / 1000
    const distance = s.radius * spark.reach * e
    const width = s.width * spark.scale
    const fade = reduced ? 1 - p : 1 - smoothstep(s.shape === 'line' ? 0.55 : 0.7, 1, p)
    if (fade <= 0) return true
    ctx.strokeStyle = spark.color
    ctx.fillStyle = spark.color

    if (s.shape === 'line') {
      const length = s.size * spark.scale * (reduced ? 0.5 : Math.pow(1 - p, 1.6))
      const [x1, y1] = position(burst, spark, distance, seconds)
      const [x2, y2] = position(burst, spark, distance + Math.max(0.01, length), seconds)
      ctx.lineCap = 'round'
      if (spark.glow > 0) {
        ctx.globalAlpha = fade * 0.14 * spark.glow
        ctx.lineWidth = width * 4.5
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      ctx.globalAlpha = fade
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      return true
    }

    if (s.shape === 'streak') {
      const lag = reduced ? 0 : Math.min(elapsed, 70 + s.size * 4 * spark.scale)
      const back = reduced ? 0.4 : s.ease(clamp((elapsed - lag) / life, 0, 1))
      const [hx, hy] = position(burst, spark, distance, seconds)
      const [tx, ty] = position(burst, spark, s.radius * spark.reach * back, Math.max(0, seconds - lag / 1000))
      const dx = hx - tx
      const dy = hy - ty
      const length = Math.hypot(dx, dy) || 1
      const nx = (-dy / length) * width * 0.5
      const ny = (dx / length) * width * 0.5
      const paint = (spreadWidth: number, alpha: number) => {
        const gradient = ctx.createLinearGradient(tx, ty, hx, hy)
        gradient.addColorStop(0, spark.clear)
        gradient.addColorStop(1, spark.color)
        ctx.globalAlpha = alpha
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(hx + nx * spreadWidth, hy + ny * spreadWidth)
        ctx.lineTo(hx - nx * spreadWidth, hy - ny * spreadWidth)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = spark.color
        ctx.beginPath()
        ctx.arc(hx, hy, width * 0.5 * spreadWidth, 0, Math.PI * 2)
        ctx.fill()
      }
      if (spark.glow > 0) paint(3.2, fade * 0.16 * spark.glow)
      paint(1, fade)
      return true
    }

    if (s.shape === 'dot') {
      const [x, y] = position(burst, spark, distance, seconds)
      const radius = width * 1.25 * (1 - 0.5 * e)
      if (spark.glow > 0) {
        ctx.globalAlpha = fade * 0.18 * spark.glow
        ctx.beginPath()
        ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = fade
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      return true
    }

    const [x, y] = position(burst, spark, distance, seconds)
    const twinkle = reduced ? 1 - p : Math.pow(Math.sin(Math.PI * clamp(p * 1.1, 0, 1)), 0.7)
    const radius = s.size * 0.6 * spark.scale * twinkle
    const rotation = spark.angle + spark.spin * p * Math.PI * 0.5
    if (radius <= 0.05) return true
    if (spark.glow > 0) {
      ctx.globalAlpha = fade * 0.2 * spark.glow
      ctx.beginPath()
      ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = fade
    starPath(ctx, x, y, radius, rotation)
    ctx.fill()
    return true
  }

  const drawRing = (ctx: CanvasRenderingContext2D, burst: Burst, elapsed: number) => {
    const s = burst.settings
    const life = reduced ? REDUCED_MS : s.duration * 0.8
    const p = elapsed / life
    if (p >= 1) return false
    const radius = 2 + s.radius * 0.6 * (reduced ? 0.6 : EASINGS['ease-out'](p))
    ctx.globalAlpha = Math.pow(1 - p, 2) * 0.7
    ctx.strokeStyle = burst.sparks[0]?.color ?? s.colors[0]
    ctx.lineWidth = Math.max(0.5, s.width * (1 - p) * 0.9)
    ctx.beginPath()
    ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2)
    ctx.stroke()
    return true
  }

  const remove = (burst: Burst) => {
    burst.canvas.remove()
    const index = bursts.indexOf(burst)
    if (index >= 0) bursts.splice(index, 1)
  }

  // 帧时间统一取 performance.now()：上游用的是 rAF 回调的时间戳，
  // 在 jsdom 等测试环境里两者不同源，会算出负的 elapsed
  const frame = () => {
    raf = 0
    const now = performance.now()
    for (const burst of [...bursts]) {
      const elapsed = now - burst.start
      const ctx = burst.ctx
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, burst.canvas.width, burst.canvas.height)
      ctx.setTransform(burst.ratio, 0, 0, burst.ratio, -burst.left * burst.ratio, -burst.top * burst.ratio)
      let alive = false
      if (burst.settings.ring && drawRing(ctx, burst, elapsed)) alive = true
      for (const spark of burst.sparks) {
        if (drawSpark(ctx, burst, spark, elapsed)) alive = true
      }
      ctx.globalAlpha = 1
      if (!alive) remove(burst)
    }
    if (bursts.length) raf = requestAnimationFrame(frame)
  }

  const spawn = (clientX: number, clientY: number) => {
    const s = settings()
    if (s.disabled) return
    const host = root.value
    const target = layer.value
    if (!host || !target) return
    const rect = host.getBoundingClientRect()
    // 页面被 CSS zoom 放大时 getBoundingClientRect 返回的是放大后的值，
    // 而画布的 CSS 尺寸走的是布局像素——不换算的话画布会整体错位。
    // zoom = 视觉宽度 / 布局宽度，再把点击点换算成宿主内的布局坐标。
    const zoom = host.offsetWidth ? rect.width / host.offsetWidth : 1
    const localX = (clientX - rect.left) / zoom
    const localY = (clientY - rect.top) / zoom
    const offset = Math.floor(Math.random() * s.colors.length)
    const full = s.spread >= 359.5
    const arc = (s.spread * Math.PI) / 180
    const heading = ((s.direction - 90) * Math.PI) / 180
    const step = full ? (Math.PI * 2) / s.count : s.count > 1 ? arc / (s.count - 1) : 0
    const sparks: Spark[] = Array.from({ length: s.count }, (_, i) => {
      const base = full ? heading + step * i : s.count > 1 ? heading - arc / 2 + step * i : heading
      const jitter = (Math.random() - 0.5) * s.randomness
      return {
        angle: base + jitter * (step || arc || 1) * 0.9,
        reach: 1 + (Math.random() - 0.5) * 0.7 * s.randomness,
        scale: 1 + (Math.random() - 0.5) * 0.8 * s.randomness,
        life: 1 + (Math.random() - 0.5) * 0.5 * s.randomness,
        spin: Math.random() - 0.5,
        color: s.colors[(i + offset) % s.colors.length],
        clear: '',
        glow: 0
      }
    })
    const longest = s.duration * (1 + 0.25 * s.randomness)
    const fall = drop(s, longest / 1000)
    const reach =
      s.radius * (1 + 0.35 * s.randomness) * (s.ease === EASINGS.spring ? 1.15 : 1) +
      s.size * (1 + 0.4 * s.randomness) +
      s.width * (s.glow > 0 ? 6 : 2) +
      6
    const box = {
      left: Math.max(localX - reach, -rect.left / zoom),
      top: Math.max(localY - reach, -rect.top / zoom),
      right: Math.min(localX + reach, (window.innerWidth - rect.left) / zoom),
      bottom: Math.min(localY + reach + fall, (window.innerHeight - rect.top) / zoom)
    }
    if (box.right - box.left < 1 || box.bottom - box.top < 1) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil((box.right - box.left) * ratio)
    canvas.height = Math.ceil((box.bottom - box.top) * ratio)
    Object.assign(canvas.style, {
      position: 'absolute',
      // box 已经是宿主内的布局坐标，画布直接挂在火花层上，不用再减一次
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.right - box.left}px`,
      height: `${box.bottom - box.top}px`,
      display: 'block',
      pointerEvents: 'none'
    })
    canvas.setAttribute('aria-hidden', 'true')
    target.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      canvas.remove()
      return
    }
    for (const spark of sparks) {
      const [r, g, b] = channels(ctx, spark.color)
      spark.clear = `rgba(${r}, ${g}, ${b}, 0)`
      spark.glow = s.glow * (0.35 + 0.65 * ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255))
    }
    bursts.push({
      x: localX,
      y: localY,
      start: performance.now(),
      sparks,
      settings: s,
      canvas,
      ctx,
      ratio,
      left: box.left,
      top: box.top
    })
    while (bursts.length > MAX_BURSTS) remove(bursts[0])
    if (!raf) raf = requestAnimationFrame(frame)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    lastPress = { time: performance.now(), x: event.clientX, y: event.clientY }
    spawn(event.clientX, event.clientY)
  }

  const onClick = (event: MouseEvent) => {
    if ('pointerType' in event && (event as PointerEvent).pointerType === 'mouse') return
    if (event.detail === 0) {
      const host = root.value
      const target = event.target instanceof Element ? event.target : host
      if (!target) return
      const rect = target.getBoundingClientRect()
      spawn(rect.left + rect.width / 2, rect.top + rect.height / 2)
      return
    }
    const recent =
      performance.now() - lastPress.time < 700 &&
      Math.hypot(event.clientX - lastPress.x, event.clientY - lastPress.y) < 12
    if (!recent) spawn(event.clientX, event.clientY)
  }

  /** 手动爆一次火花（对应 React 的 ref.spark(x, y)） */
  function spark(x?: number, y?: number) {
    const host = root.value
    if (!host) return
    const rect = host.getBoundingClientRect()
    spawn(rect.left + (x ?? rect.width / 2), rect.top + (y ?? rect.height / 2))
  }

  onMounted(() => {
    const host = root.value
    if (!host) return
    reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    host.addEventListener('pointerdown', onPointerDown)
    host.addEventListener('click', onClick)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    root.value?.removeEventListener('pointerdown', onPointerDown)
    root.value?.removeEventListener('click', onClick)
    for (const burst of [...bursts]) remove(burst)
  })

  return { spark }
}
