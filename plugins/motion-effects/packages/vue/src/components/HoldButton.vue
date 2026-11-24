<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue'
import { useHoldGesture } from '../composables/useHoldGesture'
import type { HoldButtonDirection, HoldButtonSize } from '../types'
import HoldButtonLabel from './HoldButtonLabel.vue'

interface Props {
  doneLabel?: string
  backgroundColor?: string
  fillColor?: string
  textColor?: string
  fillTextColor?: string
  size?: HoldButtonSize
  radius?: number
  fillDirection?: HoldButtonDirection
  holdTime?: number
  releaseTime?: number
  pressScale?: number
  wave?: boolean
  waveAmplitude?: number
  glow?: boolean
  resetAfter?: number
  disabled?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  doneLabel: 'Deleted',
  backgroundColor: '#27272a',
  fillColor: '#5227FF',
  textColor: '#f5f5f5',
  fillTextColor: '#ffffff',
  size: 'md',
  radius: 14,
  fillDirection: 'right',
  holdTime: 2000,
  releaseTime: 200,
  pressScale: 0.97,
  wave: true,
  waveAmplitude: 6,
  glow: true,
  resetAfter: 1200,
  disabled: false,
  className: ''
})

const emit = defineEmits<{
  hold: []
  tap: []
}>()

const hintId = useId()
const buttonRef = useTemplateRef<HTMLButtonElement>('button')

const {
  phase,
  input,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handlePointerCancel,
  handleLostPointerCapture,
  handlePointerLeave,
  handleKeyDown,
  handleKeyUp
} = useHoldGesture({
  button: buttonRef,
  holdTime: () => props.holdTime,
  releaseTime: () => props.releaseTime,
  resetAfter: () => props.resetAfter,
  disabled: () => props.disabled,
  onHold: () => emit('hold'),
  onTap: () => emit('tap')
})

const direction = computed(() => (props.fillDirection === 'up' ? 'up' : 'right'))
const holdSeconds = computed(() => Math.round(props.holdTime / 100) / 10)

const styleVars = computed(() => ({
  '--hb-radius': `${props.radius}px`,
  '--hb-bg': props.backgroundColor,
  '--hb-fill': props.fillColor,
  '--hb-text': props.textColor,
  '--hb-fill-text': props.fillTextColor,
  '--hb-hold': `${props.holdTime}ms`,
  '--hb-cycles': String(props.holdTime / 1100),
  '--hb-release': `${props.releaseTime}ms`,
  '--hb-press': String(props.pressScale),
  '--hb-wave': `${props.wave ? props.waveAmplitude : 0}px`
}))
</script>

<template>
  <button
    ref="button"
    type="button"
    :disabled="disabled"
    :class="['hold-button', `hold-button--${size}`, className]"
    :data-phase="phase"
    :data-input="input ?? undefined"
    :data-direction="direction"
    :data-glow="glow ? 'true' : undefined"
    :aria-describedby="hintId"
    :style="styleVars"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @lostpointercapture="handleLostPointerCapture"
    @pointerleave="handlePointerLeave"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
    @contextmenu.prevent
  >
    <span class="hold-button__pulse" aria-hidden="true" />

    <!-- 只转发调用方实际传入的插槽：HoldButtonLabel 用 $slots.icon 判断是否渲染图标容器，
         无条件转发会多出空容器，占掉文案前的 gap -->
    <HoldButtonLabel :done="phase === 'done'" :done-label="doneLabel">
      <template v-if="$slots.icon" #icon><slot name="icon" /></template>
      <template v-if="$slots['done-icon']" #done-icon><slot name="done-icon" /></template>
      <slot />
    </HoldButtonLabel>

    <span class="hold-button__clip" aria-hidden="true">
      <span class="hold-button__fill">
        <HoldButtonLabel
          fill
          hidden
          :done="phase === 'done'"
          :done-label="doneLabel"
        >
          <template v-if="$slots.icon" #icon><slot name="icon" /></template>
          <template v-if="$slots['done-icon']" #done-icon><slot name="done-icon" /></template>
          <slot />
        </HoldButtonLabel>
      </span>
      <span class="hold-button__crest" aria-hidden="true">
        <HoldButtonLabel
          fill
          hidden
          :done="phase === 'done'"
          :done-label="doneLabel"
        >
          <template v-if="$slots.icon" #icon><slot name="icon" /></template>
          <template v-if="$slots['done-icon']" #done-icon><slot name="done-icon" /></template>
          <slot />
        </HoldButtonLabel>
      </span>
    </span>

    <span :id="hintId" class="hold-button__sr">
      Press and hold for {{ holdSeconds }} seconds to confirm
    </span>
  </button>
</template>

<style src="./HoldButton.css"></style>