import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { animate, useMotionValue, useReducedMotion, useTransform } from 'motion-v'
import type { RubberSegmentItem } from '../types'

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const SPRING_UI = { type: 'spring' as const, duration: 0.3, bounce: 0 }
const SPRING_MOMENTUM = { type: 'spring' as const, duration: 0.4, bounce: 0.2 }
const SPRING_RELAX = { type: 'spring' as const, duration: 0.16, bounce: 0 }
const DILATE = 0.19
const HANDOFF = 0.15
const FLICK = 110
const MAX_VELOCITY = 2000
const DEADZONE = 4
const SLOP = 10
const RUBBER = 0.55

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const rubber = (over: number, dim: number) => (over * dim * RUBBER) / (dim + RUBBER * Math.abs(over))
const project = (v: number, glide: number) => {
  const d = 1 - 0.1 * Math.pow(0.05, glide / 100)
  return ((v / 1000) * d) / (1 - d)
}
const velocityOf = (hist: Array<[number, number]>, now: number) => {
  const recent = hist.filter(([t]) => now - t <= 100)
  if (recent.length < 2) return 0
  const [t0, x0] = recent[0]!
  const [t1, x1] = recent[recent.length - 1]!
  return t1 - t0 >= 8 ? ((x1 - x0) / (t1 - t0)) * 1000 : 0
}
const nearestSlot = (slots: Array<{ l: number; r: number }>, x: number) => {
  let best = 0
  for (let i = 1; i < slots.length; i++) {
    if (Math.abs((slots[i]!.l + slots[i]!.r) / 2 - x) < Math.abs((slots[best]!.l + slots[best]!.r) / 2 - x)) best = i
  }
  return best
}

export interface UseRubberSegmentOptions {
  track: Ref<HTMLElement | null>
  items: () => RubberSegmentItem[]
  index: () => number
  disabled: () => boolean
  draggable: () => boolean
  inset: () => number
  radius: () => number
  equalSlots: () => boolean
  stretch: () => number
  squash: () => number
  speed: () => number
  glide: () => number
  commit: (i: number) => void
}

interface Drag {
  id: number
  x0: number
  slot: number
  onThumb: boolean
  live: boolean
  offset: number
  w: number
  hist: Array<[number, number]>
}

export function useRubberSegment(options: UseRubberSegmentOptions) {
  const {
    track, items, index, disabled, draggable, inset, radius, equalSlots,
    stretch, squash, speed, glide, commit
  } = options

  const reduce = useReducedMotion()
  const edgeL = useMotionValue(0)
  const edgeR = useMotionValue(0)
  const innerW = useMotionValue(0)
  const clipPath = useTransform(
    () => `inset(0 ${Math.max(0, innerW.get() - edgeR.get())}px 0 ${Math.max(0, edgeL.get())}px round ${Math.max(0, radius() - inset())}px)`
  )
  const t = (seconds: number) => seconds / Math.max(0.1, speed())

  let itemEls: (HTMLButtonElement | null)[] = []
  const setItemRef = (i: number) => (el: unknown) => { itemEls[i] = (el as HTMLButtonElement | null) ?? null }
  let slots: Array<{ l: number; r: number }> = []
  let box: DOMRect | null = null
  let committed = index()
  let handoff = 0
  let drag: Drag | null = null
  let gen = 0

  const jumpTo = (i: number) => {
    const s = slots[i]
    if (!s) return
    window.clearTimeout(handoff)
    gen += 1
    edgeL.jump(s.l)
    edgeR.jump(s.r)
  }

  const measure = () => {
    const element = track.value
    if (!element) return
    const rect = element.getBoundingClientRect()
    box = rect
    slots = items().map((_, i) => {
      const el = itemEls[i]
      if (!el) return { l: 0, r: 0 }
      const r = el.getBoundingClientRect()
      return { l: r.left - rect.left - inset(), r: r.right - rect.left - inset() }
    })
    innerW.set(rect.width - inset() * 2)
    jumpTo(committed)
  }

  const land = (to: number, v: number | null, flick: boolean, withSquash: boolean) => {
    const b = slots[to]
    if (!b) return
    const g = ++gen
    const dir = Math.sign((b.l + b.r) / 2 - (edgeL.get() + edgeR.get()) / 2) || 1
    const [lead, leadTo, trail, trailTo]: [typeof edgeL, number, typeof edgeR, number] =
      dir > 0 ? [edgeR, b.r, edgeL, b.l] : [edgeL, b.l, edgeR, b.r]
    const velocityFor = (mv: typeof edgeL) => clamp(v === null ? mv.getVelocity() : v, -MAX_VELOCITY, MAX_VELOCITY)
    animate(lead, leadTo, {
      ...(flick ? SPRING_MOMENTUM : SPRING_UI),
      duration: t(flick ? 0.4 : 0.3),
      velocity: velocityFor(lead)
    })
    const trailVelocity = velocityFor(trail)
    if (!withSquash || squash() <= 0) {
      animate(trail, trailTo, { ...SPRING_UI, duration: t(0.3), velocity: trailVelocity })
      return
    }
    animate(trail, trailTo + dir * squash(), { ...SPRING_UI, duration: t(0.3), velocity: trailVelocity }).then(() => {
      if (gen === g) animate(trail, trailTo, { ...SPRING_RELAX, duration: t(0.16) })
    })
  }

  const travel = (from: number, to: number) => {
    const a = slots[from]
    const b = slots[to]
    if (!a || !b) return
    window.clearTimeout(handoff)
    gen += 1
    if (reduce.value) {
      edgeL.jump(b.l)
      edgeR.jump(b.r)
      return
    }
    const u = stretch() / 100
    const tween = { duration: t(DILATE), ease: EASE_OUT }
    animate(edgeL, b.l + (Math.min(a.l, b.l) - b.l) * u, tween)
    animate(edgeR, b.r + (Math.max(a.r, b.r) - b.r) * u, tween)
    handoff = window.setTimeout(() => land(to, null, false, true), t(HANDOFF) * 1000)
  }

  const localX = (e: PointerEvent) => e.clientX - (box ? box.left : 0) - inset()

  const handlePointerDown = (e: PointerEvent, i: number) => {
    if (disabled() || drag || e.button !== 0) return
    const element = track.value
    if (!element) return
    box = element.getBoundingClientRect()
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* 忽略 */ }
    const x = localX(e)
    const onThumb = draggable() && x >= edgeL.get() && x <= edgeR.get()
    drag = { id: e.pointerId, x0: x, slot: i, onThumb, live: false, offset: 0, w: 0, hist: [[e.timeStamp, x]] }
    if (onThumb) {
      window.clearTimeout(handoff)
      gen += 1
      edgeL.stop()
      edgeR.stop()
    } else if (!reduce.value) {
      (e.currentTarget as HTMLElement).dataset.pressed = ''
    }
  }

  const handlePointerMove = (e: PointerEvent) => {
    const d = drag
    if (!d || e.pointerId !== d.id || !d.onThumb) return
    const x = localX(e)
    d.hist.push([e.timeStamp, x])
    if (d.hist.length > 8) d.hist.shift()
    if (!d.live) {
      if (Math.abs(x - d.x0) < DEADZONE) return
      d.live = true
      d.offset = x - edgeL.get()
      d.w = edgeR.get() - edgeL.get()
      if (track.value) track.value.dataset.held = ''
    }
    const width = innerW.get()
    const l = x - d.offset
    const maxL = width - d.w
    if (reduce.value) {
      const c = clamp(l, 0, maxL)
      edgeL.set(c)
      edgeR.set(c + d.w)
    } else if (l < 0) {
      edgeL.set(0)
      edgeR.set(d.w - rubber(-l, d.w))
    } else if (l > maxL) {
      edgeR.set(width)
      edgeL.set(maxL + rubber(l - maxL, d.w))
    } else {
      edgeL.set(l)
      edgeR.set(l + d.w)
    }
  }

  const release = () => {
    const d = drag
    drag = null
    if (track.value) delete track.value.dataset.held
    const el = itemEls[d!.slot]
    if (el) delete el.dataset.pressed
    return d!
  }

  const handlePointerUp = (e: PointerEvent) => {
    const d = drag
    if (!d || e.pointerId !== d.id) return
    release()
    const x = localX(e)
    if (!d.live) {
      if (Math.abs(x - d.x0) <= SLOP && d.slot !== committed) {
        const from = committed
        commit(d.slot)
        committed = d.slot
        travel(from, d.slot)
      }
      return
    }
    const v = velocityOf(d.hist, e.timeStamp)
    const flick = Math.abs(v) > FLICK
    let to = nearestSlot(slots, (edgeL.get() + edgeR.get()) / 2 + project(v, glide()))
    if (flick && to === committed) to = clamp(to + Math.sign(v), 0, items().length - 1)
    commit(to)
    committed = to
    if (reduce.value) jumpTo(to)
    else land(to, v, flick, flick)
  }

  const handlePointerCancel = (e: PointerEvent) => {
    const d = drag
    if (!d || e.pointerId !== d.id) return
    release()
    if (!d.live) return
    if (reduce.value) jumpTo(committed)
    else land(committed, null, false, false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled()) return
    const last = items().length - 1
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(last, index() + 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, index() - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    if (next === index()) return
    commit(next)
    committed = next
    jumpTo(next)
    itemEls[next]?.focus()
  }

  onMounted(() => {
    measure()
    const observer = new ResizeObserver(measure)
    if (track.value) observer.observe(track.value)
    if (document.fonts) document.fonts.ready.then(measure).catch(() => {})
    observerCleanup = () => observer.disconnect()
  })
  let observerCleanup: (() => void) | null = null

  // 受控值 / 列表变化时重新定位（对应 React 每次 render 后的 effect）
  watch(
    () => [index(), items().map(item => item.value).join('|'), inset(), equalSlots()] as const,
    () => {
      if (!drag && committed !== index()) {
        committed = index()
        jumpTo(index())
      } else {
        measure()
      }
    }
  )

  onBeforeUnmount(() => {
    window.clearTimeout(handoff)
    edgeL.stop()
    edgeR.stop()
    observerCleanup?.()
  })

  return {
    clipPath,
    setItemRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown
  }
}
