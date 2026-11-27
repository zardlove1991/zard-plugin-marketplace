<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import DockMenu from './DockMenu.vue'
import { useDock } from '../composables/useDock'
import type { DockItem, DockMenuRow, DockSettings, DockSide, DockTheme } from '../composables/useDock'

interface Props {
  /** 应用项：图标、名称、点击回调，可选角标 / 运行中圆点 / 右键菜单 */
  items?: DockItem[]
  /** 停靠在父容器的哪条边 */
  position?: DockSide
  theme?: DockTheme
  /** 静止时图标大小（px） */
  baseItemSize?: number
  /** 指针下的图标大小（px），等于 baseItemSize 即关闭放大 */
  magnification?: number
  /** 指针多远内图标还会放大（px） */
  distance?: number
  /** dock 条的厚度（px） */
  panelHeight?: number
  /** 图标间距（px） */
  gap?: number
  /** 图标与条子的圆角 0–1 */
  roundness?: number
  /** 放大用的弹簧参数 */
  spring?: { mass?: number; stiffness?: number; damping?: number }
  /** 点击时图标弹跳 */
  bounce?: boolean
  /** 指针离开后自动收起 */
  autoHide?: boolean
  /** 图标后面画圆角底板 */
  tiles?: boolean
  /** 悬停时显示名称 */
  showLabels?: boolean
  /** 运行中的项目显示小圆点 */
  showIndicators?: boolean
  /** 显示通知角标 */
  showBadges?: boolean
  badgeColor?: string
  accentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  position: 'bottom',
  theme: 'dark',
  baseItemSize: 50,
  magnification: 70,
  distance: 200,
  panelHeight: 68,
  gap: 10,
  roundness: 0.5,
  spring: () => ({ mass: 0.1, stiffness: 150, damping: 12 }),
  bounce: true,
  autoHide: false,
  tiles: true,
  showLabels: true,
  showIndicators: true,
  showBadges: true,
  badgeColor: '#ff453a',
  accentColor: '#0a84ff'
})

const emit = defineEmits<{
  select: [index: number, item: DockItem]
}>()

const root = useTemplateRef<HTMLElement>('root')
const itemEls: (HTMLElement | null)[] = []

function setItem(index: number, el: unknown) {
  itemEls[index] = (el as HTMLElement) ?? null
}

const getSettings = (): DockSettings => ({
  items: props.items,
  position: props.position,
  theme: props.theme,
  baseItemSize: props.baseItemSize,
  magnification: props.magnification,
  distance: props.distance,
  panelHeight: props.panelHeight,
  gap: props.gap,
  roundness: props.roundness,
  spring: props.spring,
  bounce: props.bounce,
  autoHide: props.autoHide,
  tiles: props.tiles,
  showLabels: props.showLabels,
  showIndicators: props.showIndicators,
  showBadges: props.showBadges,
  badgeColor: props.badgeColor,
  accentColor: props.accentColor
})

const {
  menu,
  side,
  vertical,
  tokens,
  styleVars,
  openMenu,
  closeMenu,
  finishMenu,
  startPress,
  endPress,
  hop,
  focusItem,
  getSkipIndex,
  setSkipIndex
} = useDock({ root, itemEls, getSettings })

const rootStyle = computed(() => ({ ...tokens(), ...styleVars() }))
const openIndex = computed(() => (menu.value && !menu.value.closing ? menu.value.index : -1))
const menuRows = computed<DockMenuRow[]>(() => menu.value?.rows ?? props.items[menu.value?.index ?? -1]?.menu ?? [])

function onItemFocus(event: FocusEvent, index: number) {
  const el = event.currentTarget as HTMLElement | null
  if (el && el.matches(':focus-visible')) focusItem(index)
}

function onItemKeyDown(event: KeyboardEvent, index: number) {
  const toward = { bottom: 'ArrowUp', top: 'ArrowDown', left: 'ArrowRight', right: 'ArrowLeft' }[side()]
  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10') || event.key === toward) {
    if (openMenu(index, 'keyboard')) event.preventDefault()
    return
  }
  const order = props.items.flatMap((item, i) => (item?.separator ? [] : [i]))
  const at = order.indexOf(index)
  const keys = vertical() ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
  let next: number | undefined
  if (event.key === keys[0]) next = order[(at - 1 + order.length) % order.length]
  else if (event.key === keys[1]) next = order[(at + 1) % order.length]
  else if (event.key === 'Home') next = order[0]
  else if (event.key === 'End') next = order[order.length - 1]
  if (next === undefined) return
  event.preventDefault()
  itemEls[next]?.focus()
}
</script>

<template>
  <div
    ref="root"
    class="dock"
    :class="[`dock--${side()}`, tiles ? '' : 'dock--bare']"
    role="toolbar"
    aria-label="Dock"
    :aria-orientation="vertical() ? 'vertical' : 'horizontal'"
    :style="rootStyle"
  >
    <template v-for="(item, index) in items" :key="index">
      <span v-if="item?.separator" class="dock-separator" aria-hidden="true" />
      <button
        v-else
        :ref="el => setItem(index, el)"
        type="button"
        class="dock-item"
        :class="item.className"
        :aria-label="item.label"
        :aria-haspopup="item.menu?.length ? 'menu' : undefined"
        :aria-expanded="item.menu?.length ? openIndex === index : undefined"
        :data-open="openIndex === index ? '' : undefined"
        @pointerdown="
          event => {
            setSkipIndex(-1)
            const current = menu
            if (current && !current.closing) {
              if (event.button === 2 || event.ctrlKey) return
              setSkipIndex(index)
              closeMenu(false)
              return
            }
            if (item.menu?.length && event.button === 0 && !event.ctrlKey) startPress(event, index)
          }
        "
        @contextmenu="
          event => {
            if (!item.menu?.length) return
            event.preventDefault()
            endPress()
            openMenu(index, 'pointer')
          }
        "
        @click="
          () => {
            if (getSkipIndex() === index) {
              setSkipIndex(-1)
              return
            }
            hop(index)
            item.onClick?.()
            emit('select', index, item)
          }
        "
        @focus="event => onItemFocus(event, index)"
        @blur="focusItem(-1)"
        @keydown="event => onItemKeyDown(event, index)"
      >
        <span class="dock-tile">
          <span class="dock-face">
            <component :is="item.icon" v-if="item.icon" />
          </span>
          <span v-if="showBadges && item.badge !== undefined && item.badge !== null && item.badge !== false" class="dock-badge">
            {{ item.badge === true ? '' : item.badge }}
          </span>
        </span>
        <span v-if="showIndicators && item.active" class="dock-dot" aria-hidden="true" />
        <span v-if="showLabels && item.label && !menu" class="dock-label" aria-hidden="true">{{ item.label }}</span>
      </button>
    </template>

    <DockMenu
      v-if="menu"
      :key="menu.id"
      :rows="menuRows"
      :label="items[menu.index]?.label"
      :side="side()"
      :point="menu.point"
      :tokens="tokens()"
      :focus-first="menu.keyboard"
      :closing="menu.closing"
      @select="
        (row, keyboard) => {
          closeMenu(keyboard || Boolean(menu?.keyboard))
          row.onClick?.()
        }
      "
      @dismiss="closeMenu"
      @exited="finishMenu"
    />
  </div>
</template>

<style src="./Dock.css"></style>
