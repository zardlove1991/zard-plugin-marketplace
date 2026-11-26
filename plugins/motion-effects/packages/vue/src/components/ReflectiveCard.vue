<script setup lang="ts">
import { computed, useSlots, useTemplateRef } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { CheckmarkBadge01Icon, FingerPrintIcon } from '@hugeicons/core-free-icons'
import { useReflectiveCard } from '../composables/useReflectiveCard'
import { clamp, toPx } from '../composables/reflectiveCardEngine'

type Theme = 'dark' | 'light'
const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--rc-base': '#1d1c22',
    '--rc-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--rc-ink': '#f4f4f5',
    '--rc-muted': 'rgba(244, 244, 245, 0.6)',
    '--rc-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--rc-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--rc-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--rc-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--rc-rim': 'rgba(255, 255, 255, 0.07)',
    '--rc-rim-highlight': 'rgba(255, 255, 255, 0.1)'
  },
  light: {
    '--rc-base': '#e7e7ea',
    '--rc-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--rc-ink': '#18181b',
    '--rc-muted': 'rgba(24, 24, 27, 0.6)',
    '--rc-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--rc-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--rc-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--rc-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
    '--rc-rim': 'rgba(24, 24, 27, 0.08)',
    '--rc-rim-highlight': 'rgba(255, 255, 255, 0.8)'
  }
}

interface Props {
  name?: string
  role?: string
  badge?: string
  status?: string
  statusColor?: string
  idLabel?: string
  idValue?: string
  theme?: Theme
  videoSrc?: string
  webcam?: boolean
  tint?: string
  metalness?: number
  roughness?: number
  blurStrength?: number
  grayscale?: number
  warp?: number
  warpScale?: number
  shine?: number
  bevel?: number
  glare?: number
  enableTilt?: boolean
  tiltStrength?: number
  intro?: boolean
  width?: number | string
  height?: number | string
  radius?: number
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  name: 'Alexander Doe',
  role: 'Senior Developer',
  badge: 'Verified',
  status: 'Active',
  statusColor: '#22c55e',
  idLabel: 'ID number',
  idValue: '8901 2345 6789',
  theme: 'dark',
  videoSrc: undefined,
  webcam: false,
  tint: '#ffffff',
  metalness: 1,
  roughness: 0.3,
  blurStrength: 6,
  grayscale: 1,
  warp: 0.6,
  warpScale: 1,
  shine: 1,
  bevel: 3,
  glare: 0.5,
  enableTilt: true,
  tiltStrength: 12,
  intro: true,
  width: 320,
  height: 500,
  radius: 24,
  className: '',
  style: () => ({})
})

const emit = defineEmits<{ 'webcam-error': [error: Error] }>()
const slots = useSlots()
const root = useTemplateRef<HTMLElement>('root')
const body = useTemplateRef<HTMLElement>('body')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const video = useTemplateRef<HTMLVideoElement>('video')
const cam = useTemplateRef<HTMLVideoElement>('cam')

useReflectiveCard({
  root, body, canvas, video, cam,
  videoSrc: () => props.videoSrc,
  webcam: () => props.webcam,
  onWebcamError: error => emit('webcam-error', error),
  tint: () => props.tint,
  metalness: () => props.metalness,
  roughness: () => props.roughness,
  blurStrength: () => props.blurStrength,
  grayscale: () => props.grayscale,
  warp: () => props.warp,
  warpScale: () => props.warpScale,
  shine: () => props.shine,
  bevel: () => props.bevel,
  glare: () => props.glare,
  enableTilt: () => props.enableTilt,
  tiltStrength: () => props.tiltStrength,
  intro: () => props.intro,
  radius: () => props.radius
})

const palette = computed(() => THEMES[props.theme] ?? THEMES.dark)
const corner = computed(() => Math.max(0, props.radius))
const cardStyle = computed(() => ({
  ...palette.value,
  '--rc-width': toPx(props.width),
  '--rc-height': toPx(props.height),
  '--rc-radius': `${corner.value}px`,
  '--rc-pad': `${Math.round(clamp(corner.value * 0.8, 16, 22))}px`,
  '--rc-tile-radius': `${Math.round(clamp(corner.value * 0.5, 8, 14))}px`,
  '--rc-status': props.statusColor,
  ...props.style
}))
</script>

<template>
  <div ref="root" :class="['reflective-card', className]" :style="cardStyle">
    <div ref="body" class="reflective-card__body">
      <canvas ref="canvas" class="reflective-card__canvas" aria-hidden="true" />
      <div class="reflective-card__content">
        <slot>
          <div v-if="badge || status" class="reflective-card__header">
            <span v-if="badge" class="reflective-card__badge">
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="16" :stroke-width="1.8" />
              {{ badge }}
            </span>
            <span v-if="status" class="reflective-card__status">
              <span class="reflective-card__dot" />
              {{ status }}
            </span>
          </div>
          <div class="reflective-card__identity">
            <h3 v-if="name" class="reflective-card__name">{{ name }}</h3>
            <p v-if="role" class="reflective-card__role">{{ role }}</p>
          </div>
          <div v-if="idLabel || idValue" class="reflective-card__footer">
            <div class="reflective-card__id">
              <span v-if="idLabel" class="reflective-card__label">{{ idLabel }}</span>
              <span v-if="idValue" class="reflective-card__value">{{ idValue }}</span>
            </div>
            <span class="reflective-card__tile">
              <HugeiconsIcon :icon="FingerPrintIcon" :size="22" :stroke-width="1.6" />
            </span>
          </div>
        </slot>
      </div>
      <span class="reflective-card__rim" />
    </div>
    <video ref="video" class="reflective-card__media" muted loop playsinline crossorigin="anonymous" aria-hidden="true" />
    <video ref="cam" class="reflective-card__media" muted playsinline aria-hidden="true" />
  </div>
</template>

<style src="./ReflectiveCard.css"></style>
