<script setup lang="ts">
/**
 * Dock 的右键 / 长按菜单：玻璃质感的圆角面板 + 小尾巴，带子菜单与键盘导航。
 *
 * 逐段照搬 React 原件的 DockMenu 组件，改成 Vue 的 Teleport + 组合式 API。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usableDockRow, type DockMenuRow } from '../composables/useDock'

const props = withDefaults(
  defineProps<{
    rows: DockMenuRow[]
    label?: string
    side?: 'bottom' | 'top' | 'left' | 'right' | null
    point?: { x: number; y: number }
    edge?: { left: number; right: number; top: number }
    tokens?: Record<string, string>
    nested?: boolean
    focusFirst?: boolean
    closing?: boolean
    onSelect?: (row: DockMenuRow, keyboard: boolean) => void
    onDismiss?: (restore: boolean) => void
    onBack?: () => void
    onEnter?: () => void
    onExited?: () => void
  }>(),
  {
    label: undefined,
    side: null,
    point: () => ({ x: 0, y: 0 }),
    edge: undefined,
    tokens: () => ({}),
    nested: false,
    focusFirst: false,
    closing: false,
    onSelect: undefined,
    onDismiss: undefined,
    onBack: undefined,
    onEnter: undefined,
    onExited: undefined
  }
)

const TAIL = 9
const TAIL_HALF = 9
const MENU_RADIUS = 10
const MARGIN = 8
const POP = 'cubic-bezier(0.2, 1.25, 0.4, 1)'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

function menuPath(width: number, height: number, side: string | null, at: number) {
  const r = MENU_RADIUS
  const p = (x: number, y: number) => `${(x + TAIL).toFixed(2)} ${(y + TAIL).toFixed(2)}`
  const tail = (x: number, y: number, dx: number, dy: number, nx: number, ny: number) => {
    const q = (u: number, v: number) => p(x + dx * u + nx * v, y + dy * u + ny * v)
    return `L ${q(-TAIL_HALF, 0)} L ${q(-TAIL_HALF * 0.18, TAIL * 0.82)} Q ${q(0, TAIL)} ${q(
      TAIL_HALF * 0.18,
      TAIL * 0.82
    )} L ${q(TAIL_HALF, 0)}`
  }
  return [
    `M ${p(r, 0)}`,
    side === 'top' ? tail(at, 0, 1, 0, 0, -1) : '',
    `L ${p(width - r, 0)} A ${r} ${r} 0 0 1 ${p(width, r)}`,
    side === 'right' ? tail(width, at, 0, 1, 1, 0) : '',
    `L ${p(width, height - r)} A ${r} ${r} 0 0 1 ${p(width - r, height)}`,
    side === 'bottom' ? tail(at, height, -1, 0, 0, 1) : '',
    `L ${p(r, height)} A ${r} ${r} 0 0 1 ${p(0, height - r)}`,
    side === 'left' ? tail(0, at, 0, -1, -1, 0) : '',
    `L ${p(0, r)} A ${r} ${r} 0 0 1 ${p(r, 0)} Z`
  ].join(' ')
}

const outer = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const glass = ref<HTMLElement | null>(null)
const shape = ref<SVGElement | null>(null)
const path = ref<SVGPathElement | null>(null)
const highlight = ref<HTMLElement | null>(null)
const rowEls: (HTMLElement | null)[] = []

const active = ref(-1)
const sub = ref<{ index: number; keyboard: boolean; edge: { left: number; right: number; top: number } } | null>(null)
const blink = ref(false)
const chosen = ref(false)
const reduce = ref(false)
let timer = 0
let alive = true

const checks = computed(() => props.rows.some(row => row && !row.separator && row.checked !== undefined))
const subIndex = computed(() => sub.value?.index ?? -1)
const subRows = computed(() => (subIndex.value >= 0 ? props.rows[subIndex.value]?.items ?? [] : []))
const subLabel = computed(() =>
  subIndex.value >= 0 && typeof props.rows[subIndex.value]?.label === 'string'
    ? props.rows[subIndex.value]?.label
    : undefined
)

function setRow(index: number, el: unknown) {
  rowEls[index] = (el as HTMLElement) ?? null
}

onMounted(async () => {
  await nextTick()
  const outerEl = outer.value
  const listEl = list.value
  const glassEl = glass.value
  const shapeEl = shape.value
  if (!outerEl || !listEl || !glassEl || !shapeEl) return
  alive = true
  const layers = [outerEl.firstElementChild, glassEl, shapeEl, listEl].filter(Boolean) as HTMLElement[]
  const { x, y } = props.point ?? { x: 0, y: 0 }
  const box = props.edge ?? { left: 0, right: 0, top: 0 }
  reduce.value =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const width = listEl.offsetWidth
  const height = listEl.offsetHeight
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight
  let left: number
  let top: number
  let at = 0
  let origin: string
  if (props.side === 'bottom' || props.side === 'top') {
    left = clamp(x - width / 2, MARGIN, vw - MARGIN - width)
    top = props.side === 'bottom' ? y - TAIL - height : y + TAIL
    at = clamp(x - left, MENU_RADIUS + TAIL_HALF, width - MENU_RADIUS - TAIL_HALF)
    origin = `${at}px ${props.side === 'bottom' ? height + TAIL : -TAIL}px`
  } else if (props.side === 'left' || props.side === 'right') {
    top = clamp(y - height / 2, MARGIN, vh - MARGIN - height)
    left = props.side === 'right' ? x - TAIL - width : x + TAIL
    at = clamp(y - top, MENU_RADIUS + TAIL_HALF, height - MENU_RADIUS - TAIL_HALF)
    origin = `${props.side === 'right' ? width + TAIL : -TAIL}px ${at}px`
  } else {
    const flip = box.right - 4 + width > vw - MARGIN && box.left + 4 - width >= MARGIN
    left = flip ? box.left + 4 - width : box.right - 4
    top = clamp(box.top - 5, MARGIN, vh - MARGIN - height)
    origin = flip ? 'right top' : 'left top'
  }
  const d = menuPath(width, height, props.side, at)
  outerEl.style.left = `${left}px`
  outerEl.style.top = `${top}px`
  outerEl.style.transformOrigin = origin
  outerEl.style.visibility = 'visible'
  glassEl.style.clipPath = `path('${d}')`
  shapeEl.setAttribute('d', d)
  const canAnimate = typeof outerEl.animate === 'function'
  if (reduce.value || !canAnimate) {
    layers.forEach(layer =>
      typeof layer.animate === 'function'
        ? layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: 'ease-out' })
        : null
    )
  } else {
    outerEl.animate(
      [{ transform: `scale(${props.nested ? 0.94 : 0.82})` }, { transform: 'scale(1)' }],
      { duration: props.nested ? 220 : 340, easing: POP }
    )
    layers.forEach(layer =>
      layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: props.nested ? 120 : 160, easing: 'ease-out' })
    )
  }
  const first = props.rows.findIndex(usableDockRow)
  if (props.focusFirst && first >= 0) {
    active.value = first
    rowEls[first]?.focus({ preventScroll: true })
  } else {
    listEl.focus({ preventScroll: true })
  }
})

watch(
  () => props.closing,
  closing => {
    if (!closing) return
    const outerEl = outer.value
    const layers = [outerEl?.firstElementChild, glass.value, shape.value, list.value].filter(Boolean) as HTMLElement[]
    const duration = reduce.value ? 100 : 150
    let done = false
    const finish = () => {
      if (done || !alive) return
      done = true
      props.onExited?.()
    }
    if (outerEl && !reduce.value && typeof outerEl.animate === 'function') {
      outerEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }], {
        duration,
        easing: 'ease-in',
        fill: 'forwards'
      })
    }
    layers.forEach(layer =>
      typeof layer.animate === 'function'
        ? layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: 'ease-in', fill: 'forwards' })
        : null
    )
    timer = window.setTimeout(finish, duration)
  }
)

watch([active, blink], () => {
  const mark = highlight.value
  if (!mark) return
  const row = rowEls[active.value]
  if (!row || blink.value) {
    if (blink.value) mark.style.transition = 'none'
    mark.style.opacity = '0'
    return
  }
  const jump = mark.style.opacity !== '1' || reduce.value
  if (jump) mark.style.transition = 'none'
  mark.style.transform = `translateY(${row.offsetTop}px)`
  mark.style.height = `${row.offsetHeight}px`
  mark.style.opacity = '1'
  if (jump) {
    void mark.offsetHeight
    mark.style.transition = ''
  }
})

function activate(index: number) {
  active.value = index
  rowEls[index]?.focus({ preventScroll: true })
}

function openSub(index: number, keyboard: boolean) {
  window.clearTimeout(timer)
  const outerEl = outer.value
  const row = rowEls[index]
  if (!outerEl || !row) return
  sub.value = {
    index,
    keyboard,
    edge: { left: parseFloat(outerEl.style.left) || 0, right: (parseFloat(outerEl.style.left) || 0) + outerEl.offsetWidth, top: (parseFloat(outerEl.style.top) || 0) + row.offsetTop }
  }
}

function clearSubTimer() {
  window.clearTimeout(timer)
}

function closeSub() {
  clearSubTimer()
  sub.value = null
}

function choose(index: number, keyboard: boolean) {
  if (chosen.value) return
  const row = props.rows[index]
  chosen.value = true
  active.value = index
  window.clearTimeout(timer)
  if (reduce.value) {
    props.onSelect?.(row, keyboard)
    return
  }
  blink.value = true
  window.setTimeout(() => alive && (blink.value = false), 70)
  window.setTimeout(() => alive && props.onSelect?.(row, keyboard), 150)
}

function enterRow(index: number) {
  if (chosen.value || active.value === index || !usableDockRow(props.rows[index])) return
  activate(index)
  window.clearTimeout(timer)
  if (props.rows[index].items?.length) {
    if (sub.value?.index !== index) timer = window.setTimeout(() => openSub(index, false), 120)
  } else if (sub.value) {
    timer = window.setTimeout(closeSub, 220)
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (chosen.value) return
  const { key } = event
  const order = props.rows.flatMap((row, i) => (usableDockRow(row) ? [i] : []))
  let handled = true
  if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
    if (order.length) {
      const at = order.indexOf(active.value)
      let next = order[0]
      if (key === 'End') next = order[order.length - 1]
      else if (key === 'ArrowDown') next = order[(at + 1) % order.length]
      else if (key === 'ArrowUp') next = order[at <= 0 ? order.length - 1 : at - 1]
      if (sub.value) closeSub()
      activate(next)
    }
  } else if (key === 'ArrowRight' && props.rows[active.value]?.items?.length) {
    openSub(active.value, true)
  } else if ((key === 'ArrowLeft' || key === 'Escape') && props.nested) {
    props.onBack?.()
  } else if (key === 'Escape' || key === 'Tab') {
    props.onDismiss?.(true)
  } else {
    handled = false
  }
  if (handled) {
    event.preventDefault()
    event.stopPropagation()
  }
}

onBeforeUnmount(() => {
  alive = false
  window.clearTimeout(timer)
})
</script>

<template>
  <Teleport to="body">
    <div ref="outer" class="dock-menu" :style="tokens" data-dock-menu>
      <span class="dock-menu-shadow" />
      <span ref="glass" class="dock-menu-glass" />
      <svg ref="shape" class="dock-menu-shape" aria-hidden="true">
        <path ref="path" />
      </svg>
      <div
        ref="list"
        class="dock-menu-list"
        role="menu"
        :aria-label="label"
        tabindex="-1"
        @keydown="onKeyDown"
        @pointerenter="onEnter?.()"
        @pointerleave="
          () => {
            if (sub || chosen) return
            active = -1
            list?.focus({ preventScroll: true })
          }
        "
      >
        <span ref="highlight" class="dock-menu-highlight" />
        <template v-for="(row, index) in rows" :key="index">
          <span v-if="row?.separator" class="dock-menu-separator" role="separator" />
          <button
            v-else-if="row"
            :ref="el => setRow(index, el)"
            type="button"
            class="dock-menu-row"
            :role="row.checked !== undefined ? 'menuitemcheckbox' : 'menuitem'"
            :aria-checked="row.checked !== undefined ? Boolean(row.checked) : undefined"
            :aria-disabled="row.disabled ? true : undefined"
            :aria-haspopup="row.items?.length ? 'menu' : undefined"
            :aria-expanded="row.items?.length ? sub?.index === index : undefined"
            tabindex="-1"
            :data-dock-row="index"
            :data-active="index === active && !blink ? '' : undefined"
            @pointermove="enterRow(index)"
            @click="
              event => {
                if (chosen || !usableDockRow(row)) return
                if (row.items?.length) openSub(index, event.detail === 0)
                else choose(index, event.detail === 0)
              }
            "
          >
            <span v-if="checks" class="dock-menu-check">
              <svg
                v-if="row.checked"
                viewBox="0 0 16 16"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3.5 8.5l3 3 6-7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span v-if="row.icon" class="dock-menu-icon">
              <component :is="row.icon" />
            </span>
            <span class="dock-menu-text">{{ row.label }}</span>
            <span v-if="row.shortcut" class="dock-menu-shortcut">{{ row.shortcut }}</span>
            <span v-if="row.items?.length" class="dock-menu-chevron">
              <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 3.5L10.5 8 6 12.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </button>
        </template>
      </div>
    </div>

    <DockMenu
      v-if="sub"
      :key="sub.index"
      :rows="subRows"
      :label="subLabel"
      :edge="sub.edge"
      :tokens="tokens"
      nested
      :focus-first="sub.keyboard"
      :closing="closing"
      @select="(row, keyboard) => onSelect?.(row, keyboard)"
      @dismiss="restore => onDismiss?.(restore)"
      @back="
        () => {
          closeSub()
          activate(subIndex)
        }
      "
      @enter="
        () => {
          clearSubTimer()
          active = subIndex
        }
      "
    />
  </Teleport>
</template>
