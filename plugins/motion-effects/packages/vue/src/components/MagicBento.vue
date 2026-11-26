<script setup lang="ts">
import { computed, getCurrentInstance, ref, useSlots, useTemplateRef } from 'vue'
import { useMagicBento } from '../composables/useMagicBento'
import { DEFAULT_ITEMS, INK, clamp, inkFor, parseRgb, vars } from '../composables/magicBentoHelpers'
import MagicBentoVisual from './MagicBentoVisual.vue'
import type { MagicBentoItem } from '../types'

type Theme = 'dark' | 'light'

const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--mb-surface': 'rgba(38, 35, 46, 0.66)', '--mb-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--mb-ink': '#f4f4f5', '--mb-muted': 'rgba(244, 244, 245, 0.6)',
    '--mb-edge': 'rgba(255, 255, 255, 0.08)', '--mb-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8)'
  },
  light: {
    '--mb-surface': 'rgba(240, 240, 243, 0.8)', '--mb-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--mb-ink': '#18181b', '--mb-muted': 'rgba(24, 24, 27, 0.6)',
    '--mb-edge': 'rgba(24, 24, 27, 0.08)', '--mb-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3)'
  }
}

interface Props {
  items?: MagicBentoItem[]
  columns?: number
  rowHeight?: number
  gap?: number
  radius?: number
  theme?: Theme
  glowColor?: string
  textAutoHide?: boolean
  enableBorderGlow?: boolean
  enableSpotlight?: boolean
  spotlightRadius?: number
  enableStars?: boolean
  particleCount?: number
  enableTilt?: boolean
  enableMagnetism?: boolean
  clickEffect?: boolean
  intro?: boolean
  disableAnimations?: boolean
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  items: () => DEFAULT_ITEMS,
  columns: 4,
  rowHeight: 200,
  gap: 12,
  radius: 20,
  theme: 'dark',
  glowColor: undefined,
  textAutoHide: true,
  enableBorderGlow: true,
  enableSpotlight: true,
  spotlightRadius: 300,
  enableStars: false,
  particleCount: 24,
  enableTilt: false,
  enableMagnetism: false,
  clickEffect: true,
  intro: true,
  disableAnimations: false,
  className: '',
  style: () => ({})
})

const emit = defineEmits<{ 'item-click': [item: MagicBentoItem, index: number] }>()
const slots = useSlots()
const root = useTemplateRef<HTMLElement>('root')
const cellEls: (HTMLElement | null)[] = []
const cardEls: (HTMLElement | null)[] = []
const starEls: (HTMLElement | null)[][] = []
const setCellRef = (index: number) => (el: unknown) => { cellEls[index] = (el as HTMLElement | null) ?? null }
const setCardRef = (index: number) => (el: unknown) => { cardEls[index] = (el as HTMLElement | null) ?? null }
const setStarRef = (index: number) => (el: unknown) => { starEls[index] = [(el as HTMLElement | null) ?? null] }
const cols = ref(Math.max(1, Math.round(props.columns)))

const { engine } = useMagicBento({
  root, cellEls, cardEls, starEls, cols,
  items: () => props.items,
  columns: () => props.columns,
  gap: () => props.gap,
  enableBorderGlow: () => props.enableBorderGlow,
  enableSpotlight: () => props.enableSpotlight,
  spotlightRadius: () => props.spotlightRadius,
  enableStars: () => props.enableStars,
  particleCount: () => props.particleCount,
  enableTilt: () => props.enableTilt,
  enableMagnetism: () => props.enableMagnetism,
  clickEffect: () => props.clickEffect,
  intro: () => props.intro,
  disableAnimations: () => props.disableAnimations,
  glow: () => parseRgb(props.glowColor) ?? INK[props.theme === 'light' ? 'light' : 'dark'],
  onItemClick: (item, index) => emit('item-click', item as MagicBentoItem, index as number)
})

const palette = computed(() => props.theme === 'light' ? 'light' : 'dark')
const glow = computed(() => parseRgb(props.glowColor) ?? INK[palette.value])
const accent = computed(() => glow.value)
const corner = computed(() => Math.max(0, props.radius))
const span = computed(() => Math.max(1, cols.value))
const rootStyle = computed(() => ({
  ...vars({
    ...THEMES[palette.value],
    '--mb-glow-rgb': glow.value.join(', '),
    '--mb-accent-rgb': accent.value.join(', '),
    '--mb-accent-ink': inkFor(accent.value),
    '--mb-radius': `${corner.value}px`,
    '--mb-inner-radius': `${Math.round(clamp(corner.value * 0.5, 6, 12))}px`,
    '--mb-pad': `${Math.round(clamp(corner.value * 0.85, 14, 20))}px`,
    '--mb-spot-size': `${Math.max(40, props.spotlightRadius)}px`,
    '--mb-border-size': `${Math.round(Math.max(40, props.spotlightRadius) * 0.75)}px`
  }),
  gridTemplateColumns: `repeat(${span.value}, minmax(0, 1fr))`,
  gridAutoRows: span.value === 1 ? `minmax(${props.rowHeight}px, auto)` : `${props.rowHeight}px`,
  gap: `${Math.max(0, props.gap)}px`,
  ...props.style
}))
const entryOf = (item: MagicBentoItem) => item ?? {}
const cellStyle = (entry: MagicBentoItem) => ({
  gridColumn: `span ${Math.min(span.value, Math.max(1, Math.round(entry.colSpan ?? 1)))}`,
  gridRow: `span ${Math.max(1, Math.round(entry.rowSpan ?? 1))}`
})
// 对齐 React 的 Boolean(entry.href || entry.onClick || onItemClick)：
// 在 Vue 里 item-click 是 emit，监听器落在实例 vnode props 的 onItemClick 上。
const hasItemClick = Boolean(getCurrentInstance()?.vnode.props?.onItemClick)
const clickable = (entry: MagicBentoItem) => Boolean(entry.href || hasItemClick)
const onCardClick = (entry: MagicBentoItem, index: number) => emit('item-click', entry, index)
</script>

<template>
  <div
    ref="root"
    :class="['magic-bento', className].filter(Boolean)"
    :data-autohide="textAutoHide ? '' : undefined"
    :data-motion="disableAnimations ? undefined : ''"
    :data-intro="intro && !disableAnimations ? '' : undefined"
    :style="rootStyle"
  >
    <div
      v-for="(item, index) in items"
      :key="entryOf(item).id ?? index"
      :ref="setCellRef(index)"
      class="magic-bento__cell"
      :style="cellStyle(entryOf(item))"
    >
      <component
        :is="entryOf(item).href ? 'a' : 'div'"
        :ref="setCardRef(index)"
        class="magic-bento__card"
        :href="entryOf(item).href"
        :target="entryOf(item).target"
        :rel="entryOf(item).rel"
        :data-clickable="clickable(entryOf(item)) ? '' : undefined"
        :data-image="entryOf(item).image ? '' : undefined"
        :role="!entryOf(item).href && clickable(entryOf(item)) ? 'button' : undefined"
        :tabindex="!entryOf(item).href && clickable(entryOf(item)) ? 0 : undefined"
        :aria-label="!entryOf(item).href && clickable(entryOf(item)) ? entryOf(item).title : undefined"
        @click="onCardClick(entryOf(item), index)"
      >
        <img v-if="entryOf(item).image" class="magic-bento__image" :src="entryOf(item).image" alt="" draggable="false" />
        <span v-if="entryOf(item).image" class="magic-bento__scrim" />
        <span v-if="enableSpotlight" class="magic-bento__light" />
        <canvas v-if="enableStars" :ref="setStarRef(index)" class="magic-bento__stars" aria-hidden="true" />
        <div class="magic-bento__content">
          <slot name="item" :item="item" :index="index">
            <template v-if="entryOf(item).content">
              <component :is="entryOf(item).content" v-if="typeof entryOf(item).content === 'object'" />
              <template v-else>{{ entryOf(item).content }}</template>
            </template>
            <template v-else>
              <div v-if="entryOf(item).icon || entryOf(item).label" class="magic-bento__header">
                <span v-if="entryOf(item).icon" class="magic-bento__icon">
                  <component :is="entryOf(item).icon" v-if="typeof entryOf(item).icon === 'object'" />
                  <template v-else>{{ entryOf(item).icon }}</template>
                </span>
                <span v-if="entryOf(item).label" class="magic-bento__label">{{ entryOf(item).label }}</span>
              </div>
              <div v-if="entryOf(item).visual" class="magic-bento__visual" aria-hidden="true">
                <MagicBentoVisual
                  v-if="typeof entryOf(item).visual === 'string'"
                  :kind="entryOf(item).visual as 'analytics'"
                />
                <component v-else :is="entryOf(item).visual" />
              </div>
              <div v-if="entryOf(item).title || entryOf(item).description" class="magic-bento__text">
                <h3 v-if="entryOf(item).title" class="magic-bento__title">{{ entryOf(item).title }}</h3>
                <p v-if="entryOf(item).description" class="magic-bento__description">{{ entryOf(item).description }}</p>
              </div>
            </template>
          </slot>
        </div>
        <span class="magic-bento__rim" />
        <span class="magic-bento__border" />
      </component>
    </div>
  </div>
</template>

<style src="./MagicBento.css"></style>
