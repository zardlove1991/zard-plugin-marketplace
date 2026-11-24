<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import {
  SPOTLIGHT_NOISE,
  SPOTLIGHT_THEMES,
  useSpotlightCard,
  type SpotlightCardSettings
} from '../composables/useSpotlightCard'

type Props = SpotlightCardSettings

const props = withDefaults(defineProps<Props>(), {
  theme: 'dark',
  intensity: 0.15,
  spotlightSize: 240,
  softness: 0.7,
  shape: 'circle',
  borderGlow: 0.6,
  proximity: 80,
  ambient: false,
  flare: true,
  grain: 0,
  className: ''
})

const root = useTemplateRef<HTMLDivElement>('root')
const light = useTemplateRef<HTMLSpanElement>('light')
const grain = useTemplateRef<HTMLSpanElement>('grain')
const edge = useTemplateRef<HTMLSpanElement>('edge')

const getSettings = (): SpotlightCardSettings => ({
  theme: props.theme,
  spotlightColor: props.spotlightColor,
  intensity: props.intensity,
  spotlightSize: props.spotlightSize,
  softness: props.softness,
  shape: props.shape,
  borderGlow: props.borderGlow,
  proximity: props.proximity,
  smoothing: props.smoothing,
  ambient: props.ambient,
  flare: props.flare,
  grain: props.grain,
  className: props.className
})

useSpotlightCard({ root, light, grain, edge, getSettings })

const palette = computed(() => SPOTLIGHT_THEMES[props.theme] ?? SPOTLIGHT_THEMES.dark)
const cssVars = computed(() => ({
  '--spotlight-card-surface': palette.value.surface,
  '--spotlight-card-border': palette.value.border,
  '--spotlight-card-shadow': palette.value.shadow
}))
</script>

<template>
  <div
    ref="root"
    :class="['spotlight-card', className]"
    :style="cssVars"
    :data-theme="theme"
  >
    <span ref="light" class="spotlight-card__light" aria-hidden="true" />
    <span
      ref="grain"
      class="spotlight-card__grain"
      :style="{ backgroundImage: SPOTLIGHT_NOISE }"
      aria-hidden="true"
    />
    <slot />
    <span class="spotlight-card__border" aria-hidden="true" />
    <span ref="edge" class="spotlight-card__edge" aria-hidden="true" />
  </div>
</template>

<style src="./SpotlightCard.css"></style>
