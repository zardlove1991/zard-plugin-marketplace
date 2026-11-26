<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { usePaperCrumple } from '../composables/usePaperCrumple'
import { clamp, finite } from '../composables/paperCrumplePhysics'

interface Props {
  src?: string
  alt?: string
  backSrc?: string
  width?: number
  height?: number
  sceneHeight?: number | string
  imageFit?: 'cover' | 'contain'
  releaseBehavior?: 'restore' | 'creased' | 'stay'
  crumpleAmount?: number
  crumpleDuration?: number
  releaseDuration?: number
  foldCount?: number
  foldSharpness?: number
  wrinkleDepth?: number
  creaseStrength?: number
  paperColor?: string
  roughness?: number
  paperTexture?: number
  lightIntensity?: number
  lightAngle?: number
  shadow?: boolean
  shadowOpacity?: number
  draggable?: boolean
  dragRotation?: number
  dragRadius?: number
  returnToOrigin?: boolean
  rotation?: number
  seed?: number
  detail?: number
  disabled?: boolean
  resetKey?: number
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  src: undefined,
  alt: 'Crumplable image',
  backSrc: '',
  width: 320,
  height: 400,
  sceneHeight: 560,
  imageFit: 'cover',
  releaseBehavior: 'restore',
  crumpleAmount: 0.85,
  crumpleDuration: 0.55,
  releaseDuration: 0.4,
  foldCount: 6,
  foldSharpness: 0.6,
  wrinkleDepth: 0.65,
  creaseStrength: 0.18,
  paperColor: '#f4f0e8',
  roughness: 0.92,
  paperTexture: 0.08,
  lightIntensity: 1.8,
  lightAngle: -35,
  shadow: true,
  shadowOpacity: 0.08,
  draggable: true,
  dragRotation: 10,
  dragRadius: 180,
  returnToOrigin: true,
  rotation: 0,
  seed: 7,
  detail: 64,
  disabled: false,
  resetKey: 0,
  className: '',
  style: () => ({})
})

const emit = defineEmits<{
  'state-change': [state: string]
  error: [error: Error]
}>()

const root = useTemplateRef<HTMLElement>('root')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const hit = useTemplateRef<HTMLButtonElement>('hit')

const { status, reset, cancel } = usePaperCrumple({
  root,
  canvas,
  hit,
  src: () => props.src,
  backSrc: () => props.backSrc,
  width: () => props.width,
  height: () => props.height,
  imageFit: () => props.imageFit,
  releaseBehavior: () => props.releaseBehavior,
  crumpleAmount: () => props.crumpleAmount,
  crumpleDuration: () => props.crumpleDuration,
  releaseDuration: () => props.releaseDuration,
  foldCount: () => props.foldCount,
  foldSharpness: () => props.foldSharpness,
  wrinkleDepth: () => props.wrinkleDepth,
  creaseStrength: () => props.creaseStrength,
  paperColor: () => props.paperColor,
  roughness: () => props.roughness,
  paperTexture: () => props.paperTexture,
  lightIntensity: () => props.lightIntensity,
  lightAngle: () => props.lightAngle,
  shadow: () => props.shadow,
  shadowOpacity: () => props.shadowOpacity,
  draggable: () => props.draggable,
  dragRotation: () => props.dragRotation,
  dragRadius: () => props.dragRadius,
  returnToOrigin: () => props.returnToOrigin,
  rotation: () => props.rotation,
  seed: () => props.seed,
  detail: () => props.detail,
  disabled: () => props.disabled,
  resetKey: () => props.resetKey,
  onStateChange: state => emit('state-change', state),
  onError: error => emit('error', error)
})

defineExpose({ reset, cancel })

const shadowFilter = computed(() =>
  props.shadow
    ? `drop-shadow(0 6px 10px rgb(0 0 0 / ${clamp(finite(props.shadowOpacity, 0.08), 0, 1)}))`
    : undefined
)
const rootStyle = computed(() => ({ height: `${props.sceneHeight}px`, ...props.style }))
const ariaLabel = computed(() =>
  `${props.alt}. Hold to crumple and drag. Keyboard: hold Space or Enter, arrow keys to move, Escape to reset.`
)
const srText = computed(() =>
  status.value === 'loading'
    ? 'Loading interactive paper.'
    : status.value === 'error'
      ? 'Interactive paper unavailable. Showing the original image.'
      : ''
)
</script>

<template>
  <div ref="root" :class="['paper-crumple', className]" :style="rootStyle" :data-status="status">
    <canvas
      ref="canvas"
      class="paper-crumple-canvas"
      aria-hidden="true"
      :style="{ visibility: status === 'ready' ? 'visible' : 'hidden', filter: shadowFilter }"
    />
    <img
      v-if="status !== 'ready'"
      class="paper-crumple-fallback"
      :src="src || undefined"
      :alt="alt"
      draggable="false"
      :style="{
        objectFit: imageFit,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        filter: shadowFilter
      }"
    />
    <button
      ref="hit"
      type="button"
      class="paper-crumple-hit"
      :disabled="disabled || status !== 'ready'"
      :aria-label="ariaLabel"
      aria-pressed="false"
      :style="{ visibility: status === 'ready' ? 'visible' : 'hidden' }"
    />
    <span class="paper-crumple-focus" aria-hidden="true" />
    <span class="paper-crumple-sr" role="status">{{ srText }}</span>
  </div>
</template>

<style src="./PaperCrumple.css"></style>
