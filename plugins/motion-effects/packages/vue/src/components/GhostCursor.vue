<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useGhostCursor } from '../composables/useGhostCursor'
import type { GhostCursorSettings } from '../types'

const props = withDefaults(defineProps<GhostCursorSettings>(), {
  color: '#B497CF',
  brightness: 1,
  size: 80,
  trailLength: 50,
  inertia: 0.5,
  turbulence: 0.5,
  drift: 0.3,
  detail: 1,
  grainIntensity: 0.05,
  bloomStrength: 0.6,
  bloomRadius: 1,
  bloomThreshold: 0.025,
  edgeIntensity: 0,
  clickPuff: true,
  intro: true,
  theme: 'dark',
  mixBlendMode: undefined,
  fadeDelayMs: undefined,
  fadeDurationMs: undefined,
  maxDevicePixelRatio: 2,
  targetPixels: undefined,
  zIndex: 10,
  className: '',
  style: () => ({})
})

const root = useTemplateRef<HTMLElement>('root')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
useGhostCursor({ root, canvas, settings: props })

const blend = computed(() => props.mixBlendMode ?? (props.theme === 'light' ? 'normal' : 'screen'))
const rootStyle = computed(() => ({ zIndex: props.zIndex, ...props.style }))
const canvasStyle = computed(() => ({ mixBlendMode: blend.value } as never))
</script>

<template>
  <div ref="root" :class="['ghost-cursor', className].filter(Boolean)" :style="rootStyle">
    <canvas ref="canvas" class="ghost-cursor__canvas" :style="canvasStyle" aria-hidden="true" />
  </div>
</template>

<style src="./GhostCursor.css"></style>
