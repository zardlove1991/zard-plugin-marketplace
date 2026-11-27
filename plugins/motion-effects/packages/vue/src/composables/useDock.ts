// @ts-nocheck
/**
 * Dock 的引擎：指针靠近时图标按弹簧放大、点击时弹跳、菜单的打开 / 关闭与长按判定。
 *
 * 逐段照搬 React 原件，差别只有两处：
 * 1) 指针坐标换算成宿主内的**布局像素**——页面被 CSS zoom 放大时
 *    getBoundingClientRect 返回的是放大后的值，跟布局坐标混用会让放大范围整体偏移
 * 2) 参数从取值器读，不依赖 React 的 settingsRef
 */
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export type DockSide = 'bottom' | 'top' | 'left' | 'right'
export type DockTheme = 'dark' | 'light'

export interface DockMenuRow {
  label?: string
  onClick?: () => void
  icon?: unknown
  checked?: boolean
  disabled?: boolean
  shortcut?: string
  items?: DockMenuRow[]
  separator?: boolean
}

export interface DockItem {
  icon?: unknown
  label?: string
  active?: boolean
  badge?: string | number | boolean
  className?: string
  onClick?: () => void
  menu?: DockMenuRow[]
  separator?: boolean
}

export interface DockSettings {
  items: DockItem[]
  position: DockSide
  theme: DockTheme
  baseItemSize: number
  magnification: number
  distance: number
  panelHeight: number
  gap: number
  roundness: number
  spring: { mass?: number; stiffness?: number; damping?: number }
  bounce: boolean
  autoHide: boolean
  tiles: boolean
  showLabels: boolean
  showIndicators: boolean
  showBadges: boolean
  badgeColor: string
  accentColor: string
}

export interface DockMenuState {
  id: number
  index: number
  point: { x: number; y: number }
  keyboard: boolean
  closing: boolean
  restore: boolean
  rows: DockMenuRow[]
}

const SIDES: DockSide[] = ['bottom', 'top', 'left', 'right']
const EDGE = 12
const HOP = 0.4
const HOP_TIME = 0.38
const HOLD_TIME = 450
const MENU_GAP = 8
const POP = 'cubic-bezier(0.2, 1.25, 0.4, 1)'

export const DOCK_THEMES: Record<DockTheme, Record<string, string>> = {
  dark: {
    '--dock-panel': 'rgba(38, 35, 46, 0.66)',
    '--dock-panel-edge': 'rgba(255, 255, 255, 0.08)',
    '--dock-panel-highlight': 'rgba(255, 255, 255, 0.07)',
    '--dock-panel-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--dock-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--dock-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--dock-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--dock-ink': '#f4f4f5',
    '--dock-muted': 'rgba(244, 244, 245, 0.55)',
    '--dock-menu': 'rgba(30, 28, 38, 0.82)',
    '--dock-menu-edge': 'rgba(255, 255, 255, 0.1)',
    '--dock-menu-ink': '#f4f4f5',
    '--dock-menu-muted': 'rgba(244, 244, 245, 0.55)'
  },
  light: {
    '--dock-panel': 'rgba(240, 240, 243, 0.8)',
    '--dock-panel-edge': 'rgba(24, 24, 27, 0.07)',
    '--dock-panel-highlight': 'rgba(255, 255, 255, 0.95)',
    '--dock-panel-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--dock-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--dock-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--dock-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
    '--dock-ink': '#27272a',
    '--dock-muted': 'rgba(39, 39, 42, 0.55)',
    '--dock-menu': 'rgba(252, 252, 253, 0.86)',
    '--dock-menu-edge': 'rgba(24, 24, 27, 0.08)',
    '--dock-menu-ink': '#27272a',
    '--dock-menu-muted': 'rgba(39, 39, 42, 0.55)'
  }
}

export const DOCK_MENU_GAP = MENU_GAP

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

export const hasDockBadge = (badge: unknown) => badge !== undefined && badge !== null && badge !== false

export const usableDockRow = (row: DockMenuRow | undefined) =>
  !!row && !row.separator && !row.disabled

export interface UseDockOptions {
  root: Ref<HTMLElement | null>
  /** 每个图标的 DOM 节点（模板 ref 收集） */
  itemEls: (HTMLElement | null)[]
  getSettings: () => DockSettings
}

export function useDock({ root, itemEls, getSettings }: UseDockOptions) {
  const menu = ref<DockMenuState | null>(null)
  const fit = ref(1)
  let serial = 0
  let pressRef: { id: number; timer: number; cleanup: () => void } | null = null
  let pressing = false
  let skipIndex = -1

  const settings = () => {
    const s = getSettings()
    const side = SIDES.includes(s.position) ? s.position : 'bottom'
    const vertical = side === 'left' || side === 'right'
    const rawBase = Math.max(16, s.baseItemSize)
    const rawPeak = Math.max(rawBase, s.magnification)
    const rawThickness = Math.max(rawBase, s.panelHeight)
    const rawGap = Math.max(0, s.gap)
    const length =
      s.items.reduce((sum, item) => sum + (item?.separator ? 1 : rawBase), 0) +
      rawGap * Math.max(0, s.items.length - 1) +
      rawThickness -
      rawBase
    const scale = fit.value
    return {
      items: s.items,
      side,
      vertical,
      length: length + rawPeak - rawBase,
      base: rawBase * scale,
      peak: rawPeak * scale,
      thickness: rawThickness * scale,
      gap: rawGap * scale,
      rawGap,
      distance: Math.max(1, s.distance) * scale,
      mass: Math.max(0.01, s.spring?.mass ?? 0.1),
      stiffness: Math.max(1, s.spring?.stiffness ?? 150),
      damping: Math.max(0, s.spring?.damping ?? 12),
      bounce: s.bounce,
      autoHide: s.autoHide
    }
  }

  const tokens = () => {
    const s = getSettings()
    const theme = s.theme === 'light' ? 'light' : 'dark'
    return {
      ...(DOCK_THEMES[theme] ?? DOCK_THEMES.dark),
      '--dock-accent': s.accentColor,
      '--dock-badge': s.badgeColor
    }
  }

  const styleVars = () => {
    const s = settings()
    const raw = getSettings()
    return {
      '--dock-base': `${s.base}px`,
      '--dock-thickness': `${s.thickness}px`,
      '--dock-gap': `${s.rawGap * fit.value}px`,
      '--dock-pad': `${(s.thickness - s.base) / 2}px`,
      '--dock-reach': `${s.peak - s.base}px`,
      '--dock-round': clamp(raw.roundness, 0, 1)
    }
  }

  /* ---------------- 引擎 ---------------- */

  let raf = 0
  let alive = true
  let last = 0
  let lastBase = 0
  let focused = -1
  let held: number | null = null
  let lastFocus: number | null = null
  let lastRest: number[] = []
  let hidden = false
  let hiding = false
  let hideTimer = 0
  const motion = new Map<number, any>()
  const pointer = { x: 0, y: 0, inside: false }

  const entry = (index: number) => {
    let state = motion.get(index)
    if (!state) {
      state = { size: settings().base, velocity: 0, lift: 0, rise: 0, launch: 0, gravity: 0, hopping: false, drawn: '', node: null }
      motion.set(index, state)
    }
    return state
  }

  const tick = () => {
    raf = 0
    if (!alive) return
    const s = settings()
    const dt = Math.min(1 / 30, Math.max(0.001, (performance.now() - last) / 1000))
    last = performance.now()
    if (s.base !== lastBase) {
      const ratio = s.base / lastBase
      motion.forEach(state => {
        state.size *= ratio
        state.velocity *= ratio
      })
      lastBase = s.base
    }
    const host = root.value
    if (!host) return
    const rect = host.getBoundingClientRect()
    // 指针换算成宿主内的布局像素：页面被 CSS zoom 放大时 rect 是放大后的值
    const zoom = host.offsetWidth ? rect.width / host.offsetWidth : 1
    const center = s.vertical ? host.offsetHeight / 2 : host.offsetWidth / 2
    const spans = s.items.map(item => (item?.separator ? 1 : s.base))
    let cursor = -(spans.reduce((sum, span) => sum + span, 0) + s.gap * Math.max(0, spans.length - 1)) / 2
    const rest = spans.map(span => {
      const middle = cursor + span / 2
      cursor += span + s.gap
      return middle
    })
    let focus: number | null = null
    if (held !== null) focus = held
    else if (pointer.inside) {
      const local = s.vertical ? (pointer.y - rect.top) / zoom : (pointer.x - rect.left) / zoom
      focus = local - center
    } else if (rest[focused] !== undefined) focus = rest[focused]
    lastFocus = focus
    lastRest = rest
    const steps = Math.max(1, Math.ceil(dt * 240))
    const h = dt / steps
    const k = s.stiffness / s.mass
    const c = s.damping / s.mass
    let moving = false

    s.items.forEach((item, index) => {
      const node = itemEls[index]
      if (!node || item?.separator) return
      const state = entry(index)
      const reach = focus === null ? 1 : Math.abs(focus - rest[index]) / s.distance
      const target = s.base + (s.peak - s.base) * (reach < 1 ? Math.cos((reach * Math.PI) / 2) ** 2 : 0)
      if (reduceMotion) {
        state.size = target
        state.velocity = 0
      } else {
        for (let i = 0; i < steps; i++) {
          state.velocity = (state.velocity + h * k * (target - state.size)) / (1 + h * c + h * h * k)
          state.size += state.velocity * h
          if (!state.hopping) continue
          state.rise -= state.gravity * h
          state.lift += state.rise * h
          if (state.lift > 0) continue
          state.lift = 0
          state.rise *= -0.36
          if (state.rise < state.launch * 0.2) {
            state.rise = 0
            state.hopping = false
            node.removeAttribute('data-hop')
          }
        }
      }
      if (Math.abs(state.velocity) < 0.01 && Math.abs(target - state.size) < 0.01) {
        state.size = target
        state.velocity = 0
      } else {
        moving = true
      }
      if (state.hopping) moving = true
      const size = Math.max(1, state.size)
      const drawn = `${size.toFixed(2)} ${state.lift.toFixed(2)} ${s.side}`
      if (drawn === state.drawn && node === state.node) return
      state.drawn = drawn
      state.node = node
      const lift = s.side === 'bottom' || s.side === 'right' ? -state.lift : state.lift
      const tile = node.firstElementChild
      node.style.width = `${size}px`
      node.style.height = `${size}px`
      if (tile) {
        tile.style.transform = `translate(${s.vertical ? `${lift}px, 0` : `0, ${lift}px`}) scale(${size / s.base})`
      }
    })

    if (moving) raf = requestAnimationFrame(tick)
  }

  const wake = () => {
    if (raf || !alive) return
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  let reduceMotion = false

  const show = () => {
    window.clearTimeout(hideTimer)
    hideTimer = 0
    if (!hidden) return
    hidden = false
    root.value?.removeAttribute('data-hidden')
  }

  const hide = () => {
    window.clearTimeout(hideTimer)
    hideTimer = 0
    const host = root.value
    const blocked = pointer.inside || held !== null || (host ? host.contains(document.activeElement) : false)
    if (hidden || !settings().autoHide || blocked) return
    hidden = true
    host?.setAttribute('data-hidden', '')
  }

  const hideLater = () => {
    if (hidden || hideTimer || !settings().autoHide) return
    hideTimer = window.setTimeout(hide, 600)
  }

  const hop = (index: number) => {
    const node = itemEls[index]
    if (reduceMotion || !settings().bounce || !node) return
    const state = entry(index)
    if (state.hopping) return
    const height = state.size * HOP
    state.gravity = (8 * height) / (HOP_TIME * HOP_TIME)
    state.launch = (state.gravity * HOP_TIME) / 2
    state.rise = state.launch
    state.hopping = true
    node.setAttribute('data-hop', '')
    wake()
  }

  const focusItem = (index: number) => {
    focused = index
    wake()
  }

  const hold = (index: number | null) => {
    if (index === null) {
      held = null
      wake()
      hideLater()
      return
    }
    held = lastFocus ?? lastRest[index] ?? 0
    show()
    wake()
  }

  /* ---------------- 菜单 ---------------- */

  const closeMenu = (restore: boolean) => {
    const current = menu.value
    if (!current || current.closing) return
    const rows = settings().items[current.index]?.menu ?? []
    menu.value = { ...current, closing: true, restore, rows }
  }

  const finishMenu = () => {
    const current = menu.value
    menu.value = null
    hold(null)
    if (current?.restore) itemEls[current.index]?.focus({ preventScroll: true })
  }

  const openMenu = (index: number, mode: 'keyboard' | 'pointer' | 'press') => {
    const node = itemEls[index]
    const items = settings().items
    if (!node || !items[index]?.menu?.length) return false
    const current = menu.value
    if (current && current.index === index && !current.closing) return true
    hold(index)
    const side = settings().side
    const rect = node.getBoundingClientRect()
    const point = {
      bottom: { x: rect.left + rect.width / 2, y: rect.top - MENU_GAP },
      top: { x: rect.left + rect.width / 2, y: rect.bottom + MENU_GAP },
      left: { x: rect.right + MENU_GAP, y: rect.top + rect.height / 2 },
      right: { x: rect.left - MENU_GAP, y: rect.top + rect.height / 2 }
    }[side]
    serial += 1
    menu.value = {
      id: serial,
      index,
      point,
      keyboard: mode === 'keyboard',
      closing: false,
      restore: false,
      rows: items[index]?.menu ?? []
    }
    return true
  }

  const endPress = () => {
    const press = pressRef
    if (!press) return
    window.clearTimeout(press.timer)
    press.cleanup()
    pressRef = null
  }

  const startPress = (event: PointerEvent, index: number) => {
    endPress()
    const target = event.currentTarget as HTMLElement
    const press = { id: event.pointerId, x: event.clientX, y: event.clientY, timer: 0, cleanup: () => {} }
    if (target.hasPointerCapture?.(event.pointerId)) target.releasePointerCapture(event.pointerId)
    const onMove = (moved: PointerEvent) => {
      if (moved.pointerId !== press.id) return
      if (Math.hypot(moved.clientX - press.x, moved.clientY - press.y) > 8) endPress()
    }
    const onUp = (released: PointerEvent) => {
      if (released.pointerId === press.id) endPress()
    }
    press.cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    press.timer = window.setTimeout(() => {
      press.cleanup()
      pressRef = null
      if (!openMenu(index, 'press')) return
      skipIndex = index
      pressing = true
      window.addEventListener(
        'pointerup',
        () => {
          pressing = false
        },
        { once: true }
      )
    }, HOLD_TIME)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    pressRef = press
  }

  /* ---------------- 事件绑定 ---------------- */

  const onMove = (event: PointerEvent) => {
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.inside = true
    show()
    wake()
  }

  const onLeave = () => {
    pointer.inside = false
    wake()
    hideLater()
  }

  const onWindowMove = (event: PointerEvent) => {
    const s = settings()
    if (!s.autoHide || pointer.inside) return
    const host = root.value
    const rect = host?.offsetParent
      ? (host.offsetParent as HTMLElement).getBoundingClientRect()
      : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
    const zone = EDGE + s.thickness * 0.6
    const x = event.clientX
    const y = event.clientY
    const within = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    const near = {
      bottom: y >= rect.bottom - zone,
      top: y <= rect.top + zone,
      left: x <= rect.left + zone,
      right: x >= rect.right - zone
    }[s.side]
    if (within && near) show()
    else hideLater()
  }

  onMounted(() => {
    const host = root.value
    if (!host) return
    reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lastBase = settings().base
    // autoHide 打开时先收起来（对应上游挂载时的 data-hidden）
    hiding = settings().autoHide
    if (hiding) hide()

    // 面板放不下时整体等比缩小
    const measure = () => {
      const s = settings()
      const parent = host.offsetParent ?? document.documentElement
      const room = (s.vertical ? parent.clientHeight : parent.clientWidth) - EDGE * 2
      const next = s.length > 0 ? Math.min(1, Math.max(0.4, room / s.length)) : 1
      fit.value = Math.round(next * 1000) / 1000
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host.offsetParent ?? document.body)
    ;(host as any)._dockObserver = observer

    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerdown', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointercancel', onLeave)
    host.addEventListener('focusin', show)
    host.addEventListener('focusout', () => hideLater())
    window.addEventListener('pointermove', onWindowMove)
    window.addEventListener('pointerdown', onWindowMove)
    wake()
  })

  onBeforeUnmount(() => {
    alive = false
    cancelAnimationFrame(raf)
    window.clearTimeout(hideTimer)
    const host = root.value
    if (host) {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerdown', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointercancel', onLeave)
    }
    window.removeEventListener('pointermove', onWindowMove)
    window.removeEventListener('pointerdown', onWindowMove)
    endPress()
  })

  // 参数变了就重算并唤醒
  watch(
    () => {
      const s = getSettings()
      return [s.items.length, s.baseItemSize, s.magnification, s.distance, s.panelHeight, s.gap, s.autoHide]
    },
    () => {
      const enabled = getSettings().autoHide
      if (enabled !== hiding) {
        hiding = enabled
        if (enabled) hide()
        else show()
      }
      wake()
    },
    { flush: 'post' }
  )

  return {
    menu,
    fit,
    side: () => settings().side,
    vertical: () => settings().vertical,
    tokens,
    styleVars,
    openMenu,
    closeMenu,
    finishMenu,
    startPress,
    endPress,
    hop,
    focusItem,
    hold,
    getSkipIndex: () => skipIndex,
    setSkipIndex: (value: number) => {
      skipIndex = value
    },
    isPressing: () => pressing,
    setPressing: (value: boolean) => {
      pressing = value
    }
  }
}
