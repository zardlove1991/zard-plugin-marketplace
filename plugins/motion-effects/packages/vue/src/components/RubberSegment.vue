<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { motion } from 'motion-v'
import { useRubberSegment } from '../composables/useRubberSegment'
import type { RubberSegmentItem, RubberSegmentSize } from '../types'

const SIZES: Record<RubberSegmentSize, { height: number; font: number; pad: number; min: number }> = {
  sm: { height: 28, font: 12, pad: 10, min: 36 },
  md: { height: 36, font: 13, pad: 14, min: 44 },
  lg: { height: 44, font: 14, pad: 18, min: 48 }
}

interface Props {
  items: Array<string | RubberSegmentItem>
  defaultValue?: string
  trackColor?: string
  thumbColor?: string
  textColor?: string
  activeTextColor?: string
  size?: RubberSegmentSize
  radius?: number
  inset?: number
  equalSlots?: boolean
  stretch?: number
  squash?: number
  speed?: number
  glide?: number
  draggable?: boolean
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: undefined,
  trackColor: '#27272a',
  thumbColor: '#fafafa',
  textColor: '#fafafa',
  activeTextColor: '#18181b',
  size: 'md',
  radius: 10,
  inset: 3,
  equalSlots: true,
  stretch: 100,
  squash: 3,
  speed: 1,
  glide: 75,
  draggable: true,
  disabled: false,
  className: '',
  ariaLabel: 'Segmented control'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string, index: number]
}>()
const model = defineModel<string | undefined>()
const inner = ref(props.defaultValue)
const list = computed<RubberSegmentItem[]>(() =>
  props.items.map(item => (typeof item === 'string' ? { value: item, label: item } : item))
)
const current = computed(() => model.value ?? inner.value ?? list.value[0]?.value)
const index = computed(() => Math.max(0, list.value.findIndex(item => item.value === current.value)))
const track = useTemplateRef<HTMLElement>('track')

const commit = (i: number) => {
  const item = list.value[i]
  if (!item) return
  if (model.value === undefined) inner.value = item.value
  model.value = item.value
  emit('change', item.value, i)
}

const { clipPath, setItemRef, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel, handleKeyDown } =
  useRubberSegment({
    track,
    items: () => list.value,
    index: () => index.value,
    disabled: () => props.disabled,
    draggable: () => props.draggable,
    inset: () => props.inset,
    radius: () => props.radius,
    equalSlots: () => props.equalSlots,
    stretch: () => props.stretch,
    squash: () => props.squash,
    speed: () => props.speed,
    glide: () => props.glide,
    commit
  })

const preset = computed(() => SIZES[props.size] ?? SIZES.md)
const trackStyle = computed(() => ({
  '--rs-track': props.trackColor,
  '--rs-thumb': props.thumbColor,
  '--rs-ink': props.textColor,
  '--rs-ink-active': props.activeTextColor,
  '--rs-radius': `${props.radius}px`,
  '--rs-inset': `${props.inset}px`,
  '--rs-thumb-radius': `${Math.max(0, props.radius - props.inset)}px`,
  '--rs-h': `${preset.value.height}px`,
  '--rs-font': `${preset.value.font}px`,
  '--rs-pad': `${preset.value.pad}px`,
  '--rs-min': `${preset.value.min}px`
}))
</script>

<template>
  <div
    ref="track"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :data-equal="equalSlots ? '' : undefined"
    :data-draggable="draggable && !disabled ? '' : undefined"
    :class="['rubber-segment', className]"
    :style="trackStyle"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @lostpointercapture="handlePointerCancel"
  >
    <button
      v-for="(item, i) in list"
      :key="item.value"
      :ref="setItemRef(i)"
      type="button"
      role="radio"
      :aria-checked="i === index"
      :tabindex="i === index ? 0 : -1"
      :disabled="disabled"
      class="rubber-segment__item"
      @pointerdown="handlePointerDown($event, i)"
      @keydown="handleKeyDown"
    >
      <component :is="item.icon" v-if="item.icon" />
      {{ item.label }}
    </button>
    <motion.div class="rubber-segment__thumb" aria-hidden="true" :style="{ clipPath }">
      <span v-for="item in list" :key="item.value" class="rubber-segment__item rubber-segment__copy">
        <component :is="item.icon" v-if="item.icon" />
        {{ item.label }}
      </span>
    </motion.div>
  </div>
</template>

<style src="./RubberSegment.css"></style>
