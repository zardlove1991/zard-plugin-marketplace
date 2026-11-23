import { onBeforeUnmount, onMounted, shallowRef, type Ref } from 'vue'

export type HoldPhase = 'idle' | 'holding' | 'done'
export type HoldInput = 'pointer' | 'key' | null

const TAP_MS = 250
const HIT_PAD = 10
const LINEAR = (t: number) => t
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3)

interface UseHoldGestureOptions {
  button: Ref<HTMLElement | null>
  holdTime: () => number
  releaseTime: () => number
  resetAfter: () => number
  disabled: () => boolean
  onHold: () => void
  onTap: () => void
}

interface GestureState {
  pointerId: number | null
  start: number
  rect: DOMRect | null
}

interface MotionState {
  raf: number
  p: number
  from: number
  to: number
  start: number
}

const raf = (cb: FrameRequestCallback): number =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(cb)
    : (setTimeout(() => cb(performance.now()), 16) as unknown as number)

const caf = (id: number): void => {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id)
  else clearTimeout(id)
}

/**
 * 长按手势引擎：阶段、进度填充、指针/键盘输入、取消与清理。
 * 逐帧进度直接写 CSS 变量，不进入 Vue 响应式。
 */
export function useHoldGesture(options: UseHoldGestureOptions) {
  const phase = shallowRef<HoldPhase>('idle')
  const input = shallowRef<HoldInput>(null)

  const gesture: GestureState = { pointerId: null, start: 0, rect: null }
  const timers = { complete: 0, reset: 0 }
  const motion: MotionState = { raf: 0, p: 0, from: 0, to: 0, start: 0 }
  let observer: ResizeObserver | null = null

  const go = (next: HoldPhase, kind: HoldInput = null) => {
    phase.value = next
    input.value = kind
  }

  const clearTimers = () => {
    clearTimeout(timers.complete)
    clearTimeout(timers.reset)
    timers.complete = 0
    timers.reset = 0
  }

  const drive = (to: number, duration: number, ease: (t: number) => number) => {
    caf(motion.raf)
    motion.from = motion.p
    motion.to = to
    motion.start = performance.now()

    const step = (now: number) => {
      const t = duration > 0 ? Math.min(1, (now - motion.start) / duration) : 1
      motion.p = motion.from + (motion.to - motion.from) * ease(t)
      options.button.value?.style.setProperty('--hb-p', motion.p.toFixed(4))
      if (t < 1) {
        motion.raf = raf(step)
        return
      }
      motion.raf = 0
      if (motion.to === 1) complete()
    }

    motion.raf = raf(step)
  }

  const complete = () => {
    if (phase.value !== 'holding') return
    if (performance.now() - gesture.start < options.holdTime() - 50) return
    clearTimers()
    go('done', input.value)
    options.onHold()
    const resetAfter = options.resetAfter()
    if (resetAfter > 0) {
      timers.reset = setTimeout(() => {
        go('idle')
        drive(0, options.releaseTime(), EASE_OUT)
      }, resetAfter) as unknown as number
    }
  }

  const begin = (kind: HoldInput) => {
    if (options.disabled() || phase.value !== 'idle') return false
    const button = options.button.value
    if (!button) return false
    gesture.start = performance.now()
    gesture.rect = button.getBoundingClientRect()
    go('holding', kind)
    drive(1, options.holdTime(), LINEAR)
    timers.complete = setTimeout(complete, options.holdTime() + 100) as unknown as number
    return true
  }

  const release = ({ drifted = false } = {}) => {
    if (phase.value !== 'holding') return
    clearTimers()
    const held = performance.now() - gesture.start
    go('idle')
    drive(0, options.releaseTime(), EASE_OUT)
    if (!drifted && held < TAP_MS) options.onTap()
  }

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || !event.isPrimary || gesture.pointerId !== null) return
    if (!begin('pointer')) return
    gesture.pointerId = event.pointerId
    try {
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
  }

  const endPointer = (event: PointerEvent, config: { drifted?: boolean } = {}) => {
    if (event.pointerId !== gesture.pointerId) return
    gesture.pointerId = null
    const target = event.currentTarget as HTMLElement
    try {
      if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
    release(config)
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== gesture.pointerId) return
    const rect = gesture.rect
    if (!rect) return
    const out =
      event.clientX < rect.left - HIT_PAD ||
      event.clientX > rect.right + HIT_PAD ||
      event.clientY < rect.top - HIT_PAD ||
      event.clientY > rect.bottom + HIT_PAD
    if (out) endPointer(event, { drifted: true })
  }

  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') endPointer(event, { drifted: true })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (input.value === 'key') release({ drifted: true })
      return
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (!event.repeat) begin('key')
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (input.value === 'key') release()
    }
  }

  const measure = () => {
    const button = options.button.value
    if (!button) return
    button.style.setProperty('--hb-w', `${button.offsetWidth}px`)
    button.style.setProperty('--hb-h', `${button.offsetHeight}px`)
  }

  const cancel = () => release({ drifted: true })
  const onVisibility = () => {
    if (document.hidden) cancel()
  }

  onMounted(() => {
    measure()
    if (typeof ResizeObserver !== 'undefined' && options.button.value) {
      observer = new ResizeObserver(measure)
      observer.observe(options.button.value)
    }
    window.addEventListener('blur', cancel)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    clearTimers()
    caf(motion.raf)
    observer?.disconnect()
    observer = null
    window.removeEventListener('blur', cancel)
    document.removeEventListener('visibilitychange', onVisibility)
  })

  return {
    phase,
    input,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: (event: PointerEvent) => endPointer(event),
    handlePointerCancel: (event: PointerEvent) => endPointer(event, { drifted: true }),
    handleLostPointerCapture: (event: PointerEvent) => endPointer(event, { drifted: true }),
    handlePointerLeave,
    handleKeyDown,
    handleKeyUp
  }
}