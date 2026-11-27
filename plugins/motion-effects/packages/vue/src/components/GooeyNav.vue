<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { activeInkOf, pillColorOf, useGooeyNav } from '../composables/useGooeyNav'
import type { GooeyNavItem, GooeyNavSettings, GooeyNavSize, GooeyNavTheme } from '../composables/useGooeyNav'

interface Props {
  /** 导航项：{ label?, href?, icon? }；没有 href 的渲染成按钮 */
  items?: GooeyNavItem[]
  /** 非受控时的初始选中项 */
  initialActiveIndex?: number
  /** 受控的选中项（配合 update:active） */
  activeIndex?: number
  theme?: GooeyNavTheme
  /** 胶囊颜色 */
  color?: string
  /** 胶囊里的文字色 */
  activeTextColor?: string
  /** 液滴颜色；为空时用胶囊色 */
  colors?: string[]
  size?: GooeyNavSize
  /** 显示磨砂外框 */
  frame?: boolean
  /** 液滴飞到新项的时长（ms） */
  animationTime?: number
  /** 胶囊碎成的液滴数 */
  particleCount?: number
  /** 液滴飞散的距离（px） */
  spread?: number
  /** 每滴液滴的随机时间差（ms） */
  timeVariance?: number
  /** 液体融合的程度 0–1 */
  gooeyness?: number
  /** 新胶囊成形时的晃动 0–1 */
  wobble?: number
  /** 悬停高亮 */
  hoverEffect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  initialActiveIndex: 0,
  activeIndex: undefined,
  theme: 'dark',
  color: undefined,
  activeTextColor: undefined,
  colors: () => [],
  size: 'md',
  frame: true,
  animationTime: 600,
  particleCount: 15,
  timeVariance: 300,
  spread: 56,
  gooeyness: 0.5,
  wobble: 0.5,
  hoverEffect: true
})

const emit = defineEmits<{
  'update:activeIndex': [index: number]
  change: [index: number, item: GooeyNavItem]
}>()

const stage = useTemplateRef<HTMLElement>('stage')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const list = useTemplateRef<HTMLElement>('list')
const overlay = useTemplateRef<HTMLElement>('overlay')
const fallback = useTemplateRef<HTMLElement>('fallback')

/** 内部（非受控）选中项 */
const innerIndex = ref(props.initialActiveIndex)
const current = computed(() =>
  Math.min(Math.max(0, props.activeIndex ?? innerIndex.value), Math.max(0, props.items.length - 1))
)

const getSettings = (): GooeyNavSettings => ({
  theme: props.theme,
  color: props.color,
  activeTextColor: props.activeTextColor,
  colors: props.colors,
  size: props.size,
  frame: props.frame,
  animationTime: props.animationTime,
  particleCount: props.particleCount,
  timeVariance: props.timeVariance,
  spread: props.spread,
  gooeyness: props.gooeyness,
  wobble: props.wobble,
  hoverEffect: props.hoverEffect
})

const { go } = useGooeyNav({
  stage,
  canvas,
  list,
  overlay,
  fallback,
  getSettings,
  getCurrent: () => current.value,
  getItemCount: () => props.items.length
})

function select(index: number) {
  if (index === current.value) return
  if (props.activeIndex === undefined) innerIndex.value = index
  emit('update:activeIndex', index)
  emit('change', index, props.items[index])
}

const THEMES = {
  dark: {
    '--gn-frame': 'rgba(38, 35, 46, 0.66)',
    '--gn-frame-edge': 'rgba(255, 255, 255, 0.08)',
    '--gn-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--gn-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--gn-ink': '#f4f4f5',
    '--gn-muted': 'rgba(244, 244, 245, 0.62)'
  },
  light: {
    '--gn-frame': 'rgba(240, 240, 243, 0.8)',
    '--gn-frame-edge': 'rgba(24, 24, 27, 0.07)',
    '--gn-frame-highlight': 'rgba(255, 255, 255, 0.95)',
    '--gn-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--gn-ink': '#27272a',
    '--gn-muted': 'rgba(39, 39, 42, 0.62)'
  }
}

const SIZES = { sm: 'gooey-nav--sm', md: 'gooey-nav--md', lg: 'gooey-nav--lg' }

const rootStyle = computed(() => ({
  ...(THEMES[props.theme] ?? THEMES.dark),
  '--gn-pill': pillColorOf(getSettings()),
  '--gn-active-ink': activeInkOf(getSettings())
}))

const rootClass = computed(() =>
  [SIZES[props.size] ?? SIZES.md, props.frame ? 'gooey-nav--framed' : ''].filter(Boolean).join(' ')
)

function onItemClick(index: number, event: MouseEvent) {
  const item = props.items[index]
  if (!item?.href || item.href === '#') event.preventDefault()
  select(index)
}

defineExpose({ go })
</script>

<template>
  <nav class="gooey-nav" :class="rootClass" :style="rootStyle">
    <span v-if="frame" class="gooey-nav__rim" />
    <div ref="stage" class="gooey-nav__stage">
      <canvas ref="canvas" class="gooey-nav__canvas" aria-hidden="true" />
      <span ref="fallback" class="gooey-nav__fallback" aria-hidden="true" />
      <ul ref="list" class="gooey-nav__list">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="gooey-nav__item"
          :data-gooey-index="index"
          :data-active="index === current ? '' : undefined"
        >
          <a
            v-if="item.href"
            class="gooey-nav__link"
            :href="item.href"
            :aria-current="index === current ? 'page' : undefined"
            @click="onItemClick(index, $event)"
          >
            <span v-if="item.icon" class="gooey-nav__icon"><component :is="item.icon" /></span>
            <span v-if="item.label" class="gooey-nav__label">{{ item.label }}</span>
          </a>
          <button
            v-else
            type="button"
            class="gooey-nav__link"
            :aria-current="index === current ? 'page' : undefined"
            @click="onItemClick(index, $event)"
          >
            <span v-if="item.icon" class="gooey-nav__icon"><component :is="item.icon" /></span>
            <span v-if="item.label" class="gooey-nav__label">{{ item.label }}</span>
          </button>
        </li>
      </ul>
      <ul ref="overlay" class="gooey-nav__list gooey-nav__list--active" aria-hidden="true">
        <li v-for="(item, index) in items" :key="index" class="gooey-nav__item">
          <span class="gooey-nav__link">
            <span v-if="item.icon" class="gooey-nav__icon"><component :is="item.icon" /></span>
            <span v-if="item.label" class="gooey-nav__label">{{ item.label }}</span>
          </span>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style src="./GooeyNav.css"></style>
