import { onBeforeUnmount, ref, shallowRef, watch, type Ref } from 'vue'
import {
  animate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion-v'

const SLOP = { fine: 4, coarse: 8 }
const TILT_SPRING = { stiffness: 240, damping: 24, mass: 0.6 }
const LIFT_SPRING = { stiffness: 320, damping: 26 }
const FLING = 0.16
const HISTORY_MS = 90

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const snap = (deg: number) => Math.round(deg / 180) * 180
const isBack = (deg: number) => Math.abs(Math.round(deg / 180)) % 2 === 1

export interface UseFlipCardOptions {
  root: Ref<HTMLElement | null>
  /** 当前展示的正反面（受控取 v-model，非受控取内部状态） */
  shown: () => boolean
  /** 受控值；undefined 表示非受控，只有它变化时才补翻转 */
  flipped: () => boolean | undefined
  /** 更新展示面 */
  setShown: (next: boolean) => void
  emitFlip: (next: boolean) => void
  axis: () => 'x' | 'y'
  flipOnClick: () => boolean
  draggable: () => boolean
  dragDistance: () => number
  tilt: () => boolean
  tiltMax: () => number
  hoverScale: () => number
  perspective: () => number
  stiffness: () => number
  damping: () => number
  width: () => number
  height: () => number
  disabled: () => boolean
}

interface Grip {
  id: number
  x: number
  y: number
  base: number
  moved: boolean
  slop: number
  hist: Array<{ t: number; v: number }>
}

export function useFlipCard(options: UseFlipCardOptions) {
  const {
    root, shown, flipped, setShown, emitFlip, axis, flipOnClick, draggable, dragDistance,
    tilt, tiltMax, hoverScale, perspective, stiffness, damping, width, height, disabled
  } = options

  const reduce = useReducedMotion()
  const dragging = shallowRef(false)
  const turn = useMotionValue(shown() ? 180 : 0)
  const tiltX = useSpring(0, TILT_SPRING)
  const tiltY = useSpring(0, TILT_SPRING)
  const lift = useSpring(1, LIFT_SPRING)
  const sheen = useSpring(0, LIFT_SPRING)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)

  // 函数形式：useTransform 只追踪 MotionValue，props 要在这里显式 .get() / 读取才能响应变化（vue-porting §5）
  const facing = useTransform(() => Math.abs(Math.cos((turn.get() * Math.PI) / 180)))
  const spread = useTransform(() => 0.08 + 0.92 * facing.get())
  const shade = useTransform(() => 0.1 + 0.9 * facing.get() ** 2)
  const rotorStyle = useTransform(() => {
    const scale = lift.get()
    if (axis() === 'x') {
      return `perspective(${perspective()}px) scale(${scale}) rotateY(${tiltY.get()}deg) rotateX(${turn.get() + tiltX.get()}deg)`
    }
    return `perspective(${perspective()}px) scale(${scale}) rotateX(${tiltX.get()}deg) rotateY(${turn.get() + tiltY.get()}deg)`
  })
  const gxPct = useTransform(() => `${gx.get()}%`)
  const gyPct = useTransform(() => `${gy.get()}%`)

  let grip: Grip | null = null
  let target = shown() ? 180 : 0
  let shownRef = shown()

  const rest = () => {
    tiltX.set(0)
    tiltY.set(0)
    sheen.set(0)
    lift.set(1)
  }

  const settle = (to: number, velocity: number, instant: boolean) => {
    turn.stop()
    target = to
    if (instant || reduce.value) turn.jump(to)
    else animate(turn, to, { type: 'spring', stiffness: stiffness(), damping: damping(), velocity, restDelta: 0.05 })
    const next = isBack(to)
    if (next === shownRef) return
    shownRef = next
    setShown(next)
    emitFlip(next)
  }

  const flip = (instant: boolean) => {
    const base = snap(turn.get())
    settle(isBack(base) ? base - 180 : base + 180, 0, instant)
  }

  // 受控值变化：只有方向真的不一致时才补一次翻转（对应 React 对 flipped 的 effect）
  watch(flipped, value => {
    if (value === undefined || isBack(target) === value) return
    const base = target
    turn.stop()
    target = isBack(base) ? base - 180 : base + 180
    shownRef = value
    if (reduce.value) turn.jump(target)
    else animate(turn, target, { type: 'spring', stiffness: stiffness(), damping: damping(), restDelta: 0.05 })
  })

  watch(disabled, value => {
    if (value) rest()
  })

  const onPointerDown = (event: PointerEvent) => {
    if (disabled() || event.button !== 0 || grip) return
    const element = event.currentTarget as HTMLElement
    try { element.setPointerCapture(event.pointerId) } catch { /* jsdom / 不支持时忽略 */ }
    turn.stop()
    grip = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      base: turn.get(),
      moved: false,
      slop: event.pointerType === 'touch' ? SLOP.coarse : SLOP.fine,
      hist: []
    }
    if (!reduce.value) lift.set(hoverScale())
  }

  const onPointerMove = (event: PointerEvent) => {
    const g = grip
    if (g && g.id === event.pointerId) {
      const d = axis() === 'x' ? event.clientY - g.y : event.clientX - g.x
      if (!g.moved) {
        if (Math.abs(d) < g.slop || !draggable() || reduce.value) return
        g.moved = true
        dragging.value = true
        tiltX.set(0)
        tiltY.set(0)
        sheen.set(0)
      }
      const span = dragDistance() > 0 ? dragDistance() : axis() === 'x' ? height() : width()
      const deg = g.base + (axis() === 'x' ? -1 : 1) * (d / span) * 180
      turn.set(deg)
      const now = performance.now()
      g.hist.push({ t: now, v: deg })
      while (g.hist.length > 2 && now - g.hist[0]!.t > HISTORY_MS) g.hist.shift()
      return
    }
    if (!tilt() || reduce.value || disabled() || event.pointerType === 'touch') return
    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()
    const px = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const py = clamp((event.clientY - rect.top) / rect.height, 0, 1)
    tiltX.set((0.5 - py) * 2 * tiltMax())
    tiltY.set((px - 0.5) * 2 * tiltMax())
    gx.set(px * 100)
    gy.set(py * 100)
    sheen.set(1)
  }

  const release = (event: PointerEvent, cancelled: boolean) => {
    const g = grip
    if (!g || g.id !== event.pointerId) return
    grip = null
    const element = event.currentTarget as HTMLElement
    try {
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    } catch { /* 同上 */ }
    dragging.value = false
    if (event.pointerType === 'touch' || !root.value?.matches(':hover')) rest()
    if (!g.moved) {
      if (!cancelled && flipOnClick()) flip(false)
      else settle(target, 0, false)
      return
    }
    const here = turn.get()
    let velocity = 0
    const a = g.hist[0]
    const b = g.hist[g.hist.length - 1]
    if (!cancelled && a && b && b.t > a.t && performance.now() - b.t < 60) {
      velocity = ((b.v - a.v) / (b.t - a.t)) * 1000
    }
    const to = cancelled ? snap(g.base) : clamp(snap(here + velocity * FLING), snap(here) - 180, snap(here) + 180)
    settle(to, velocity, false)
  }

  const onPointerEnter = (event: PointerEvent) => {
    if (!reduce.value && !disabled() && event.pointerType !== 'touch') lift.set(hoverScale())
  }
  const onPointerLeave = () => {
    if (!grip) rest()
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled() || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    if (!event.repeat) flip(true)
  }
  const onClick = (event: MouseEvent) => {
    if (!disabled() && event.detail === 0) flip(true)
  }
  const onDragStart = (event: Event) => event.preventDefault()

  onBeforeUnmount(() => {
    turn.stop()
    tiltX.stop()
    tiltY.stop()
    lift.stop()
    sheen.stop()
  })

  return {
    reduce,
    dragging,
    sheen,
    facing,
    spread,
    shade,
    rotorStyle,
    gxPct,
    gyPct,
    flip,
    onPointerDown,
    onPointerMove,
    onPointerUp: (event: PointerEvent) => release(event, false),
    onPointerCancel: (event: PointerEvent) => release(event, true),
    onLostPointerCapture: (event: PointerEvent) => release(event, true),
    onPointerEnter,
    onPointerLeave,
    onKeyDown,
    onClick,
    onDragStart
  }
}
