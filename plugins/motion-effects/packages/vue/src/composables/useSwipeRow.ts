import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useId,
  watch,
  type Ref
} from 'vue'
import { animate, useMotionValue, useReducedMotion, useTransform } from 'motion-v'
import type { SwipeAction, SwipeDirection } from '../types'

const HYST = 10
const FLICK = 110
const DECEL = 0.998
const VMAX = 1500
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const SPRING_UI = { type: 'spring' as const, duration: 0.3, bounce: 0 }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const rubber = (offset: number, dim: number, c: number) =>
  (offset * dim * c) / (dim + c * Math.abs(offset))
const unrubber = (value: number, dim: number, c: number) =>
  (value * dim) / (c * Math.max(1, dim - Math.abs(value)))
const project = (velocity: number) => ((velocity / 1000) * DECEL) / (1 - DECEL)
const velocityOf = (history: Array<[number, number]>) => {
  if (history.length < 2) return 0
  const first = history[0]!
  const last = history[history.length - 1]!
  return ((last[1] - first[1]) / Math.max(1, last[0] - first[0])) * 1000
}

const onColor = (hex: string) => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return '#ffffff'
  const value = match[1]!.length === 3
    ? [...match[1]!].map(char => char + char).join('')
    : match[1]!
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? '#111111' : '#ffffff'
}

interface Grip {
  id: number
  x0: number
  y0: number
  grab: number | null
  moved: boolean
  hist: Array<[number, number]>
  touch: boolean
}

interface LiveHandlers {
  move: (event: PointerEvent) => void
  up: (event: PointerEvent) => void
}

interface UseSwipeRowOptions {
  root: Ref<HTMLElement | null>
  surface: Ref<HTMLElement | null>
  actions: () => SwipeAction[]
  actionWidth: () => number
  direction: () => SwipeDirection
  resistance: () => number
  commitAt: () => number
  fullSwipe: () => boolean
  snapBounce: () => number
  collapseMs: () => number
  disabled: () => boolean
  haptic: () => boolean
  closeOnAction: () => boolean
  open: () => boolean
  setOpen: (next: boolean) => void
  emitAction: (action: SwipeAction) => void
  emitCommit: (action: SwipeAction) => void
}

export function useSwipeRow(options: UseSwipeRowOptions) {
  const uid = useId()
  const reduce = useReducedMotion()
  const phase = shallowRef<'idle' | 'committing' | 'collapsing'>('idle')
  const say = shallowRef('')

  const w = { current: 360 }
  let grip: Grip | null = null
  let unwatch: (() => void) | null = null
  let foldTimer: number | undefined
  let heading: number | null = null
  let observer: ResizeObserver | null = null

  const live: LiveHandlers = { move: () => {}, up: () => {} }

  const sign = computed(() => (options.direction() === 'left' ? -1 : 1))
  const actionWidth = computed(() => options.actionWidth())
  const actionCount = computed(() => options.actions().length)
  const drawerWidth = computed(() => actionCount.value * actionWidth.value)
  const primary = computed(() => options.actions()[0])
  const secondaryActions = computed(() => options.actions().slice(1))
  const open = computed(() => options.open())
  const railId = `${uid}-rail`

  const x = useMotionValue(0)
  const spread = useMotionValue(0)
  const landed = useMotionValue(0)

  // 读到了 computed 的派生值必须用函数形式：useTransform(input, fn) 只在输入的 MotionValue 变化时重算，
  // 不追踪 Vue 响应式，direction / actions / actionWidth 变了也会停在旧值
  const exposed = useTransform(() => sign.value * x.get())
  const surfaceXf = useTransform(x, value => `translateX(${value}px)`)
  const railXf = useTransform(
    () => `translateX(${-sign.value * Math.max(0, drawerWidth.value - exposed.get())}px)`
  )
  const shift = useTransform(() => spread.get() * Math.max(0, exposed.get() - actionWidth.value))
  const blockXf = useTransform(() => `translateX(${sign.value * shift.get()}px)`)
  const glyphXf = useTransform(
    () =>
      `translateX(${-sign.value * landed.get() * (shift.get() - (w.current - actionWidth.value) / 2)}px)`
  )

  const commitPoint = () =>
    Math.max(options.commitAt() * w.current, drawerWidth.value + actionWidth.value / 2)
  const canCommit = () =>
    options.fullSwipe() && actionCount.value > 0 && commitPoint() <= w.current

  const map = (raw: number) => {
    const width = w.current
    const c = clamp(options.resistance(), 0.05, 1)
    const drawer = drawerWidth.value
    if (raw < 0) return rubber(raw, width, c)
    if (raw <= drawer) return raw
    if (!canCommit()) return drawer + rubber(raw - drawer, width, c)
    const point = commitPoint()
    const knee = drawer + (point - drawer) / c
    return raw <= knee ? drawer + c * (raw - drawer) : point + rubber(raw - knee, width, c)
  }

  const inv = (value: number) => {
    const width = w.current
    const c = clamp(options.resistance(), 0.05, 1)
    const drawer = drawerWidth.value
    if (value < 0) return unrubber(value, width, c)
    if (value <= drawer) return value
    if (!canCommit()) return drawer + unrubber(value - drawer, width, c)
    const point = commitPoint()
    const knee = drawer + (point - drawer) / c
    return value <= point ? drawer + (value - drawer) / c : knee + unrubber(value - point, width, c)
  }

  const settle = (target: number, velocity = 0) => {
    heading = target
    if (reduce.value) {
      animate(x, sign.value * target, { duration: 0.2, ease: EASE_OUT })
      return
    }
    const flick = Math.abs(velocity) >= FLICK
    animate(
      x,
      sign.value * target,
      flick
        ? {
            type: 'spring',
            duration: 0.4,
            bounce: options.snapBounce(),
            velocity: sign.value * clamp(velocity, -VMAX, VMAX)
          }
        : { ...SPRING_UI, velocity: sign.value * velocity }
    )
  }

  const setSpread = (on: boolean) => {
    if ((spread.get() === 1) === on) return
    if (reduce.value) spread.set(on ? 1 : 0)
    else animate(spread, on ? 1 : 0, SPRING_UI)
    if (on && primary.value) {
      say.value = `Release to ${primary.value.label}`
      if (options.haptic() && grip?.touch) navigator.vibrate?.(8)
    }
  }

  const commit = (action: SwipeAction, viaKey: boolean, velocity = 0) => {
    const leap = action === primary.value
    phase.value = 'committing'
    say.value = action.label
    options.setOpen(false)

    const fold = () => {
      phase.value = 'collapsing'
      foldTimer = window.setTimeout(() => {
        options.emitCommit(action)
        action.onSelect?.()
      }, options.collapseMs())
    }

    if (viaKey || reduce.value) {
      if (leap) {
        spread.set(1)
        landed.set(1)
      }
      if (viaKey) {
        x.set(sign.value * w.current)
        fold()
      } else {
        animate(x, sign.value * w.current, { duration: 0.2, ease: EASE_OUT }).then(fold)
      }
      return
    }

    if (leap) {
      if (spread.get() < 1) animate(spread, 1, SPRING_UI)
      animate(landed, 1, SPRING_UI)
    }
    animate(x, sign.value * w.current, { ...SPRING_UI, velocity: sign.value * velocity }).then(fold)
  }

  const watchWindow = (handlers: LiveHandlers) => {
    const onMove = (event: PointerEvent) => handlers.move(event)
    const onUp = (event: PointerEvent) => handlers.up(event)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }

  const down = (event: PointerEvent) => {
    if (
      options.disabled() ||
      actionCount.value === 0 ||
      phase.value !== 'idle' ||
      grip ||
      event.button !== 0
    ) {
      return
    }
    x.stop()
    heading = null
    grip = {
      id: event.pointerId,
      x0: event.clientX,
      y0: event.clientY,
      grab: null,
      moved: false,
      hist: [],
      touch: event.pointerType === 'touch'
    }
    try {
      options.surface.value?.setPointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
    unwatch?.()
    unwatch = watchWindow(live)
  }

  const move = (event: PointerEvent) => {
    const current = grip
    if (!current || current.id !== event.pointerId) return

    if (current.grab === null) {
      const dx = event.clientX - current.x0
      const dy = event.clientY - current.y0
      if (Math.abs(dx) < HYST || Math.abs(dx) < Math.abs(dy)) return
      current.grab = sign.value * (current.x0 + Math.sign(dx) * HYST) - inv(sign.value * x.get())
      current.moved = true
      options.root.value?.setAttribute('data-dragging', '')
    }

    const exposedValue = map(sign.value * event.clientX - (current.grab as number))
    x.set(sign.value * exposedValue)
    current.hist.push([performance.now(), exposedValue])
    if (current.hist.length > 4) current.hist.shift()
    setSpread(canCommit() && exposedValue >= commitPoint())
  }

  const up = (event: PointerEvent) => {
    const current = grip
    if (!current || current.id !== event.pointerId) return
    grip = null
    unwatch?.()
    unwatch = null
    options.root.value?.removeAttribute('data-dragging')
    try {
      options.surface.value?.releasePointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }

    const exposedValue = sign.value * x.get()
    const velocity = velocityOf(current.hist)
    if (!current.moved) {
      if (open.value) {
        options.setOpen(false)
        settle(0)
      }
      return
    }

    if (primary.value && canCommit() && exposedValue >= commitPoint()) {
      commit(primary.value, false, velocity)
      return
    }

    const target =
      Math.abs(velocity) >= FLICK
        ? velocity > 0
          ? drawerWidth.value
          : 0
        : exposedValue + project(velocity) > drawerWidth.value / 2
          ? drawerWidth.value
          : 0
    setSpread(false)
    options.setOpen(target === drawerWidth.value)
    settle(target, velocity)
  }

  live.move = move
  live.up = up

  const act = (action: SwipeAction, event: MouseEvent) => {
    if (phase.value !== 'idle') return
    options.emitAction(action)
    if (action === primary.value || action.dismiss) {
      commit(action, event.detail === 0)
      return
    }
    action.onSelect?.()
    if (!options.closeOnAction()) return
    options.setOpen(false)
    if (event.detail === 0) {
      heading = 0
      x.set(0)
    } else {
      settle(0)
    }
  }

  const openNow = () => {
    heading = drawerWidth.value
    x.set(sign.value * drawerWidth.value)
    options.setOpen(true)
    say.value = `${actionCount.value} actions revealed`
  }

  const closeNow = () => {
    heading = 0
    x.set(0)
    options.setOpen(false)
  }

  const onToggleClick = (event: MouseEvent) => {
    if (event.detail !== 0 || options.disabled() || phase.value !== 'idle' || actionCount.value === 0) {
      return
    }
    if (open.value) closeNow()
    else openNow()
  }

  const onToggleKey = (event: KeyboardEvent) => {
    if (options.disabled() || phase.value !== 'idle' || actionCount.value === 0) return
    const openKey = sign.value < 0 ? 'ArrowLeft' : 'ArrowRight'
    const closeKey = sign.value < 0 ? 'ArrowRight' : 'ArrowLeft'
    const toggle = event.key === 'Enter' || event.key === ' '

    if (event.key === openKey || (toggle && !open.value)) {
      event.preventDefault()
      openNow()
    } else if (event.key === closeKey || event.key === 'Escape' || (toggle && open.value)) {
      event.preventDefault()
      closeNow()
    } else if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      open.value &&
      primary.value &&
      canCommit()
    ) {
      event.preventDefault()
      commit(primary.value, true)
    }
  }

  const syncOpen = (next: boolean, width = drawerWidth.value) => {
    if (phase.value !== 'idle' || grip) return
    const target = next ? width : 0
    if (heading === target) return
    if (Math.abs(sign.value * x.get() - target) > 0.5) settle(target)
  }

  watch([open, drawerWidth, sign], ([next, width, direction], previous) => {
    // 方向变了，之前记下的目标位置不再对应现实，按实际位置重新判断
    if (previous && previous[2] !== direction) heading = null
    syncOpen(next, width)
  })

  onMounted(() => {
    const element = options.root.value
    if (!element) return
    w.current = element.offsetWidth || w.current
    // watch 默认不会立即执行：受控 open 的初始值要在挂载时同步一次
    syncOpen(open.value)
    if (typeof ResizeObserver === 'undefined') return
    observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width
      if (width) w.current = width
    })
    observer.observe(element)
  })

  onBeforeUnmount(() => {
    window.clearTimeout(foldTimer)
    unwatch?.()
    unwatch = null
    observer?.disconnect()
    observer = null
    x.stop()
    spread.stop()
    landed.stop()
  })

  return {
    phase,
    say,
    open,
    primary,
    secondaryActions,
    railId,
    sign,
    actionWidth,
    actionCount,
    drawerWidth,
    surfaceXf,
    railXf,
    blockXf,
    glyphXf,
    onColor,
    down,
    act,
    onToggleClick,
    onToggleKey
  }
}