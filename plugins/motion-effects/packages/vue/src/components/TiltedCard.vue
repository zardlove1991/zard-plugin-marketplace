<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, useTemplateRef } from 'vue'
import { useTiltedCard } from '../composables/useTiltedCard'

type Axis = 'both' | 'horizontal' | 'vertical'

const parseColor = (value: string): number[] | null => {
  const text = String(value || '').trim()
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)
  if (hex) {
    const full = hex[1]!.length === 3 ? hex[1]!.replace(/./g, digit => digit + digit) : hex[1]!
    return [0, 2, 4].map(index => Number.parseInt(full!.slice(index, index + 2), 16))
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text)
  if (rgb) return [rgb[1]!, rgb[2]!, rgb[3]!].map(channel =>
    Math.min(255, Math.max(0, Math.round(Number.parseFloat(channel))))
  )
  return null
}
const toLength = (value: number | string) => (typeof value === 'number' ? `${value}px` : value)

interface Props {
  imageSrc?: string
  altText?: string
  captionText?: string
  containerHeight?: number | string
  containerWidth?: number | string
  imageHeight?: number | string
  imageWidth?: number | string
  scaleOnHover?: number
  rotateAmplitude?: number
  showTooltip?: boolean
  overlayDepth?: number
  displayOverlayContent?: boolean
  flipped?: boolean
  flipOnClick?: boolean
  radius?: number
  perspective?: number
  smoothness?: number
  glare?: number
  glareColor?: string
  shadow?: number
  parallax?: number
  axis?: Axis
  reverse?: boolean
  trackWindow?: boolean
  floating?: boolean
  gyroscope?: boolean
  intro?: boolean
  introDelay?: number
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  imageSrc: undefined,
  altText: 'Tilted card image',
  captionText: '',
  containerHeight: '300px',
  containerWidth: '100%',
  imageHeight: '300px',
  imageWidth: '300px',
  scaleOnHover: 1.05,
  rotateAmplitude: 12,
  showTooltip: true,
  overlayDepth: 30,
  displayOverlayContent: false,
  flipped: undefined,
  flipOnClick: true,
  radius: 15,
  perspective: 800,
  smoothness: 0.6,
  glare: 0.5,
  glareColor: '#ffffff',
  shadow: 0.5,
  parallax: 1,
  axis: 'both',
  reverse: false,
  trackWindow: false,
  floating: false,
  gyroscope: true,
  intro: true,
  introDelay: 0,
  className: '',
  style: () => ({})
})

const emit = defineEmits<{ flip: [value: boolean] }>()
const flippedModel = defineModel<boolean | undefined>('flipped')
const attrs = useAttrs()
const slots = useSlots()
const inner = ref(false)
const controlled = computed(() => flippedModel.value !== undefined)
const isFlipped = computed(() => Boolean(slots.back) && (controlled.value ? flippedModel.value! : inner.value))
const flippable = computed(() => Boolean(slots.back) && props.flipOnClick)
const interactive = computed(() => flippable.value || Boolean(attrs.onClick))

const figure = useTemplateRef<HTMLElement>('figure')
const body = useTemplateRef<HTMLElement>('body')
const shadow = useTemplateRef<HTMLElement>('shadow')
const caption = useTemplateRef<HTMLElement>('caption')

const { canFlip } = useTiltedCard({
  figure, body, shadow, caption,
  amplitude: () => props.rotateAmplitude,
  scale: () => props.scaleOnHover,
  smoothness: () => props.smoothness,
  glare: () => props.glare,
  shadowStrength: () => props.shadow,
  parallax: () => props.parallax,
  axis: () => props.axis,
  reverse: () => props.reverse,
  trackWindow: () => props.trackWindow,
  floating: () => props.floating,
  gyroscope: () => props.gyroscope,
  intro: () => props.intro,
  introDelay: () => props.introDelay,
  flippable: () => flippable.value,
  interactive: () => interactive.value,
  flipped: () => isFlipped.value,
  tooltip: () => props.showTooltip && Boolean(props.captionText)
})

const toggle = () => {
  const next = !isFlipped.value
  if (!controlled.value) inner.value = next
  flippedModel.value = next
  emit('flip', next)
}
const activate = () => {
  if (!canFlip()) return
  if (flippable.value) toggle()
}
const onKeyDown = (event: KeyboardEvent) => {
  if (!interactive.value || event.target !== event.currentTarget) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  if (event.repeat) return
  activate()
}

const corner = computed(() => toLength(props.radius))
const glareRgb = computed(() => (parseColor(props.glareColor) ?? [255, 255, 255]).join(', '))
const bleed = computed(() =>
  Math.ceil(Math.sin((Math.min(60, Math.max(0, props.rotateAmplitude)) * Math.PI) / 180) * 24 * Math.max(0, props.parallax)) + 1
)
const figureStyle = computed(() => ({
  width: toLength(props.containerWidth),
  height: toLength(props.containerHeight),
  perspective: toLength(props.perspective),
  ...props.style
}))
const shadowStyle = computed(() => ({
  width: toLength(props.imageWidth),
  height: toLength(props.imageHeight),
  borderRadius: corner.value
}))
const bodyStyle = computed(() => ({
  width: toLength(props.imageWidth),
  height: toLength(props.imageHeight),
  '--tc-radius': corner.value,
  '--tc-glare-rgb': glareRgb.value
}))
const imageStyle = computed(() => ({
  '--tc-depth': -24,
  top: `-${bleed.value}px`,
  left: `-${bleed.value}px`,
  width: `calc(100% + ${bleed.value * 2}px)`,
  height: `calc(100% + ${bleed.value * 2}px)`
}))
</script>

<template>
  <figure
    ref="figure"
    :class="['tilted-card', className]"
    :style="figureStyle"
    :data-interactive="interactive ? '' : undefined"
    :data-flipped="isFlipped ? '' : undefined"
    :tabindex="interactive ? 0 : undefined"
    :role="interactive ? 'button' : undefined"
    :aria-pressed="flippable ? isFlipped : undefined"
    :aria-label="interactive ? captionText || altText : undefined"
    @click="activate"
    @keydown="onKeyDown"
  >
    <div ref="shadow" class="tilted-card__shadow" aria-hidden="true" :style="shadowStyle" />
    <div ref="body" class="tilted-card__body" :style="bodyStyle">
      <div class="tilted-card__face tilted-card__front">
        <img v-if="imageSrc" class="tilted-card__img" :src="imageSrc" :alt="altText" draggable="false" :style="imageStyle" />
        <slot />
        <span class="tilted-card__glare" aria-hidden="true" />
        <span class="tilted-card__rim" aria-hidden="true" />
        <span class="tilted-card__edge" aria-hidden="true" />
      </div>
      <div v-if="slots.back" class="tilted-card__face tilted-card__back" :aria-hidden="!isFlipped">
        <slot name="back" />
        <span class="tilted-card__glare" aria-hidden="true" />
        <span class="tilted-card__rim" aria-hidden="true" />
        <span class="tilted-card__edge" aria-hidden="true" />
      </div>
      <div v-if="displayOverlayContent && slots.overlay" class="tilted-card__overlay" :style="{ '--tc-lift': `${overlayDepth}px` }">
        <slot name="overlay" />
      </div>
    </div>
    <figcaption v-if="showTooltip && captionText" ref="caption" class="tilted-card__caption">
      {{ captionText }}
    </figcaption>
  </figure>
</template>

<style src="./TiltedCard.css"></style>
