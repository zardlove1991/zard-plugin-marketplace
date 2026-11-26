<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { fadeMask, useGridMotion } from '../composables/useGridMotion'
import type { GridMotionDirection, GridMotionItem, GridMotionSettings } from '../types'

type Theme = 'dark' | 'light'
const THEMES: Record<Theme, { tile: string; text: string; border: string }> = {
  dark: { tile: '#1b1922', text: 'rgba(255, 255, 255, 0.78)', border: 'rgba(255, 255, 255, 0.07)' },
  light: { tile: '#f4f4f5', text: '#3f3f46', border: 'rgba(24, 24, 27, 0.08)' }
}

interface Props {
  items?: GridMotionItem[]
  rows?: number
  aspectRatio?: number
  gap?: number
  angle?: number
  tilt?: number
  speed?: number
  direction?: GridMotionDirection
  parallax?: number
  spotlight?: number
  dim?: number
  fade?: number
  radius?: number
  grayscale?: boolean
  tileColor?: string
  textColor?: string
  theme?: Theme
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  rows: 4,
  aspectRatio: 1.33,
  gap: 16,
  radius: 14,
  angle: -12,
  tilt: 0,
  speed: 24,
  direction: 'alternate',
  parallax: 0.5,
  spotlight: 0.6,
  dim: 0.35,
  grayscale: false,
  fade: 0.5,
  tileColor: undefined,
  textColor: undefined,
  theme: 'dark',
  className: '',
  style: () => ({})
})

const root = useTemplateRef<HTMLElement>('root')
const plane = useTemplateRef<HTMLElement>('plane')
const { config, layout, tiles } = useGridMotion({
  root,
  plane,
  settings: props as Required<GridMotionSettings>
})

const palette = computed(() => THEMES[props.theme] ?? THEMES.dark)
const mask = computed(() => fadeMask(config.value.fade))
const rootStyle = computed(() => ({
  '--gm-tile': props.tileColor ?? palette.value.tile,
  '--gm-text': props.textColor ?? palette.value.text,
  '--gm-border': palette.value.border,
  '--gm-radius': `${Math.max(0, props.radius)}px`,
  '--gm-dim': config.value.dim,
  perspective: layout.value && config.value.tilt > 0 ? `${layout.value.perspective}px` : undefined,
  maskImage: mask.value,
  WebkitMaskImage: mask.value,
  maskComposite: mask.value ? 'intersect' : undefined,
  WebkitMaskComposite: mask.value ? 'source-in' : undefined,
  ...props.style
}))
const planeStyle = computed(() => {
  const box = layout.value
  if (!box) return {}
  return {
    width: `${box.planeWidth}px`,
    height: `${box.planeHeight}px`,
    transform: `translate(-50%, -50%) rotateX(${config.value.tilt}deg) rotateZ(${config.value.angle}deg)`,
    '--gm-gap': `${config.value.gap}px`,
    '--gm-tile-w': `${box.tileWidth}px`,
    '--gm-tile-h': `${box.tileHeight}px`,
    '--gm-font': `${Math.min(32, Math.max(12, box.tileHeight * 0.12))}px`
  }
})
const rowStyle = (r: number) => {
  const box = layout.value
  if (!box) return {}
  return { top: `${box.top + r * (box.tileHeight + config.value.gap)}px` }
}
const rowTiles = computed(() => {
  const box = layout.value
  if (!box) return []
  return Array.from({ length: config.value.rows }, (_, r) =>
    Array.from({ length: box.copies * box.perRow }, (_, k) => tiles.value[(r * box.perRow + k) % tiles.value.length])
  )
})
</script>

<template>
  <div ref="root" :class="['gm-root', className].filter(Boolean)" :style="rootStyle">
    <div v-if="layout" ref="plane" class="gm-plane" aria-hidden="true" :style="planeStyle">
      <div v-for="(sequence, r) in rowTiles" :key="r" class="gm-row" :style="rowStyle(r)">
        <div
          v-for="(tile, k) in sequence"
          :key="k"
          class="gm-tile"
          :class="{ 'gm-tile--gray': grayscale }"
        >
          <slot name="tile" :tile="tile" :index="k">
            <img v-if="tile?.kind === 'image'" :src="tile.src" :alt="tile.alt || ''" draggable="false" decoding="async" />
            <span v-else-if="tile?.kind === 'text'" class="gm-pad">{{ tile.text }}</span>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./GridMotion.css"></style>
