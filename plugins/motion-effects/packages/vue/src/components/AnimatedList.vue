<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, withDefaults } from 'vue'
import { FADE_MASK, useAnimatedList } from '../composables/useAnimatedList'
import { ANIMATED_LIST_ITEMS } from './animatedListIcons'
import type { AnimatedListItem, AnimatedListAnimation, AnimatedListSettings } from '../types'

type Theme = 'dark' | 'light'

const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--al-frame': 'rgba(38, 35, 46, 0.66)',
    '--al-frame-edge': 'rgba(255, 255, 255, 0.08)',
    '--al-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--al-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--al-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--al-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--al-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--al-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--al-well': 'rgba(255, 255, 255, 0.08)',
    '--al-ink': '#f4f4f5',
    '--al-muted': 'rgba(244, 244, 245, 0.55)',
    '--al-thumb': 'rgba(255, 255, 255, 0.16)',
    '--al-ring': 'rgba(244, 244, 245, 0.3)',
    '--al-ring-fill': 'rgba(244, 244, 245, 0.05)',
    '--al-hover': 'brightness(1.12)',
    '--al-press': 'brightness(0.85)',
    '--al-active': 'brightness(1.16)'
  },
  light: {
    '--al-frame': 'rgba(240, 240, 243, 0.8)',
    '--al-frame-edge': 'rgba(24, 24, 27, 0.07)',
    '--al-frame-highlight': 'rgba(255, 255, 255, 0.95)',
    '--al-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--al-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--al-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--al-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--al-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
    '--al-well': 'rgba(24, 24, 27, 0.05)',
    '--al-ink': '#27272a',
    '--al-muted': 'rgba(39, 39, 42, 0.55)',
    '--al-thumb': 'rgba(24, 24, 27, 0.16)',
    '--al-ring': 'rgba(24, 24, 27, 0.28)',
    '--al-ring-fill': 'transparent',
    '--al-hover': 'brightness(0.97)',
    '--al-press': 'brightness(0.92)',
    '--al-active': 'none'
  }
}

const size = (value: number | string) => (typeof value === 'number' ? `${value}px` : value)

interface Props {
  items?: AnimatedListItem[]
  animation?: AnimatedListAnimation
  animateOnce?: boolean
  stagger?: number
  selectOnHover?: boolean
  enableArrowNavigation?: boolean
  loop?: boolean
  showGradients?: boolean
  fadeSize?: number
  maxHeight?: number | string
  gap?: number
  initialSelectedIndex?: number
  displayScrollbar?: boolean
  frame?: boolean
  theme?: Theme
  accentColor?: string
  radius?: number
  width?: number | string
  className?: string
  itemClassName?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  items: () => ANIMATED_LIST_ITEMS,
  initialSelectedIndex: -1,
  selectOnHover: true,
  enableArrowNavigation: true,
  loop: false,
  animation: 'pop',
  animateOnce: false,
  stagger: 0.05,
  showGradients: true,
  fadeSize: 56,
  displayScrollbar: true,
  frame: true,
  theme: 'dark',
  accentColor: undefined,
  radius: 14,
  gap: 8,
  width: 420,
  maxHeight: 440,
  className: '',
  itemClassName: '',
  style: () => ({})
})

const emit = defineEmits<{
  select: [item: AnimatedListItem, index: number]
}>()

const selected = ref(props.initialSelectedIndex)
const baseId = useId()

const root = useTemplateRef<HTMLElement>('root')
const viewport = useTemplateRef<HTMLElement>('viewport')
const track = useTemplateRef<HTMLElement>('track')
const indicator = useTemplateRef<HTMLElement>('indicator')
const ring = useTemplateRef<HTMLElement>('ring')
const itemEls: (HTMLElement | null)[] = []
const itemRef = (index: number) => (el: unknown) => {
  itemEls[index] = (el as HTMLElement | null) ?? null
}

const { hover, choose } = useAnimatedList({
  root,
  viewport,
  track,
  indicator,
  ring,
  itemEls,
  settings: props as Required<AnimatedListSettings>,
  selected,
  onSelect: (item, index) => emit('select', item, index)
})

const rootStyle = computed<Record<string, string | number>>(() => ({
  ...(THEMES[props.theme] ?? THEMES.dark),
  '--al-radius': `${Math.max(0, props.radius)}px`,
  '--al-gap': `${Math.max(0, props.gap)}px`,
  '--al-width': size(props.width),
  '--al-accent': props.accentColor || 'var(--al-ink)',
  ...(props.accentColor
    ? {
        '--al-ring': props.accentColor,
        '--al-ring-fill': `color-mix(in srgb, ${props.accentColor} 8%, transparent)`
      }
    : {}),
  ...props.style
}))

const viewportStyle = computed(() => ({
  maxHeight: size(props.maxHeight),
  maskImage: props.showGradients ? FADE_MASK : undefined,
  WebkitMaskImage: props.showGradients ? FADE_MASK : undefined
}))

const entryOf = (item: AnimatedListItem) =>
  item !== null && typeof item === 'object' ? item : { title: item }

const keyOf = (item: AnimatedListItem, index: number) => entryOf(item).id ?? index
</script>

<template>
  <div
    ref="root"
    :class="['animated-list', frame ? 'animated-list--framed' : '', className].filter(Boolean)"
    :data-animated="animation !== 'none' ? '' : undefined"
    :style="rootStyle"
  >
    <div
      ref="viewport"
      class="animated-list__viewport"
      :class="{ 'animated-list__viewport--bare': !displayScrollbar }"
      role="listbox"
      tabindex="0"
      :aria-activedescendant="selected >= 0 && selected < items.length ? `${baseId}-${selected}` : undefined"
      :style="viewportStyle"
    >
      <div ref="track" class="animated-list__track">
        <div
          v-for="(item, index) in items"
          :key="keyOf(item, index)"
          :ref="itemRef(index)"
          :id="`${baseId}-${index}`"
          :class="['animated-list__item', itemClassName].filter(Boolean)"
          role="option"
          :aria-selected="index === selected"
          :data-index="index"
          :data-selected="index === selected ? '' : undefined"
          @pointerenter="selectOnHover && hover(index)"
          @click="choose(item, index)"
        >
          <slot name="item" :item="item" :index="index" :selected="index === selected">
            <template v-if="entryOf(item).image || entryOf(item).icon">
              <span class="animated-list__lead">
                <img v-if="entryOf(item).image" :src="entryOf(item).image" alt="" draggable="false" />
                <component v-else :is="entryOf(item).icon" />
              </span>
            </template>
            <span class="animated-list__text">
              <span class="animated-list__title">{{ entryOf(item).title }}</span>
              <span v-if="entryOf(item).description" class="animated-list__description">{{ entryOf(item).description }}</span>
            </span>
            <span v-if="entryOf(item).meta" class="animated-list__meta">{{ entryOf(item).meta }}</span>
          </slot>
          <span class="animated-list__rim" aria-hidden="true" />
        </div>
        <span ref="indicator" class="animated-list__indicator" aria-hidden="true">
          <span ref="ring" class="animated-list__ring" />
        </span>
      </div>
    </div>
    <span v-if="frame" class="animated-list__frame-rim" aria-hidden="true" />
  </div>
</template>

<style src="./AnimatedList.css"></style>
