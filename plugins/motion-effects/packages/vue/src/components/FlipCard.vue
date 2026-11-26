<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { motion } from 'motion-v'
import { useFlipCard } from '../composables/useFlipCard'

interface Props {
  /** 受控正反面；不传则用 defaultFlipped 起步 */
  flipped?: boolean
  defaultFlipped?: boolean
  axis?: 'x' | 'y'
  flipOnClick?: boolean
  draggable?: boolean
  dragDistance?: number
  tilt?: boolean
  tiltMax?: number
  glare?: boolean
  glareOpacity?: number
  hoverScale?: number
  perspective?: number
  stiffness?: number
  damping?: number
  width?: number
  height?: number
  radius?: number
  background?: string
  color?: string
  shadow?: boolean
  shadowColor?: string
  shadowOpacity?: number
  disabled?: boolean
  ariaLabel?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultFlipped: false,
  axis: 'y',
  flipOnClick: true,
  draggable: true,
  dragDistance: 0,
  tilt: true,
  tiltMax: 12,
  glare: true,
  glareOpacity: 0.22,
  hoverScale: 1.03,
  perspective: 1100,
  stiffness: 170,
  damping: 20,
  width: 300,
  height: 400,
  radius: 22,
  background: '#27272a',
  color: '#f5f5f5',
  shadow: true,
  shadowColor: '#000000',
  shadowOpacity: 0.45,
  disabled: false,
  ariaLabel: 'Flip card',
  className: ''
})

const emit = defineEmits<{
  'flip-change': [value: boolean]
}>()
const flippedModel = defineModel<boolean | undefined>('flipped')
const inner = ref(props.defaultFlipped)
const shown = computed(() => flippedModel.value ?? inner.value)
const root = useTemplateRef<HTMLElement>('root')

const {
  reduce, dragging, sheen, spread, shade, rotorStyle, gxPct, gyPct,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel,
  onLostPointerCapture, onPointerEnter, onPointerLeave,
  onKeyDown, onClick, onDragStart
} = useFlipCard({
  root,
  shown: () => shown.value,
  flipped: () => flippedModel.value,
  setShown: next => {
    inner.value = next
    flippedModel.value = next
  },
  emitFlip: next => emit('flip-change', next),
  axis: () => props.axis,
  flipOnClick: () => props.flipOnClick,
  draggable: () => props.draggable,
  dragDistance: () => props.dragDistance,
  tilt: () => props.tilt,
  tiltMax: () => props.tiltMax,
  hoverScale: () => props.hoverScale,
  perspective: () => props.perspective,
  stiffness: () => props.stiffness,
  damping: () => props.damping,
  width: () => props.width,
  height: () => props.height,
  disabled: () => props.disabled
})

const cssVars = computed(() => ({
  '--fc-w': `${props.width}px`,
  '--fc-h': `${props.height}px`,
  '--fc-radius': `${props.radius}px`,
  '--fc-bg': props.background,
  '--fc-ink': props.color,
  '--fc-shadow': props.shadowColor,
  '--fc-shadow-o': props.shadowOpacity,
  '--fc-glare': props.glareOpacity
}))
const shadowStyle = computed(() =>
  props.axis === 'x' ? { scaleY: spread, opacity: shade } : { scaleX: spread, opacity: shade }
)
const rotorValues = computed(() => ({
  transform: rotorStyle,
  '--fc-gx': gxPct,
  '--fc-gy': gyPct,
  '--fc-sheen': sheen
}))
</script>

<template>
  <div
    ref="root"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-pressed="shown"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :class="['flip-card', className]"
    :data-axis="axis"
    :data-draggable="draggable && !disabled && !reduce ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-fade="reduce ? (shown ? 'back' : 'front') : undefined"
    :style="cssVars"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @lostpointercapture="onLostPointerCapture"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @keydown="onKeyDown"
    @click="onClick"
    @dragstart="onDragStart"
  >
    <motion.span v-if="shadow" class="flip-card__shadow" aria-hidden="true" :style="shadowStyle" />
    <motion.div class="flip-card__rotor" :style="reduce ? undefined : rotorValues">
      <div class="flip-card__face flip-card__face--front" :aria-hidden="shown" :inert="shown">
        <slot name="front" />
        <span v-if="glare" class="flip-card__glare" aria-hidden="true" />
      </div>
      <div class="flip-card__face flip-card__face--back" :aria-hidden="!shown" :inert="!shown">
        <slot name="back" />
        <span v-if="glare" class="flip-card__glare" aria-hidden="true" />
      </div>
    </motion.div>
  </div>
</template>

<style src="./FlipCard.css"></style>
