<script setup lang="ts">
import { computed } from 'vue'
import GlassIconReveal from './GlassIconReveal.vue'
import { MARK_21ST } from '../composables/liquidGlassMark'

interface Props {
  tuning?: Record<string, unknown>
  look?: 'light' | 'dark'
  background?: string
  logoColor?: string
  plateColor?: string
  iconPlate?: boolean
  keepPlate?: boolean
  originalColors?: boolean
  tileSize?: number
  logoScale?: number
  finalScale?: number
  logoOffset?: [number, number]
  loop?: boolean
  hold?: number
  speed?: number
  time?: number
  label?: string
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  tuning: undefined,
  look: 'light',
  background: undefined,
  logoColor: '#0045ff',
  plateColor: undefined,
  iconPlate: undefined,
  keepPlate: undefined,
  originalColors: undefined,
  tileSize: undefined,
  logoScale: 0.6,
  finalScale: 0.8,
  logoOffset: undefined,
  loop: true,
  hold: undefined,
  speed: 1,
  time: undefined,
  label: '21st.dev',
  className: '',
  style: () => ({})
})

const mergedTuning = computed(() => ({ startZoom: 2.3, ...(props.tuning ?? {}) }))
</script>

<template>
  <GlassIconReveal
    :logo="MARK_21ST"
    :label="label"
    :look="look"
    :logo-color="logoColor"
    :logo-scale="logoScale"
    :final-scale="finalScale"
    :plate-color="plateColor"
    :icon-plate="iconPlate"
    :keep-plate="keepPlate"
    :original-colors="originalColors"
    :background="background"
    :tile-size="tileSize"
    :logo-offset="logoOffset"
    :loop="loop"
    :hold="hold"
    :speed="speed"
    :time="time"
    :tuning="mergedTuning"
    :class-name="className"
    :style="style"
  />
</template>
