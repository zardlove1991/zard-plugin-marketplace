<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { BOX, LOOKS } from '../composables/liquidGlassRevealEngine'
import { useLiquidGlassReveal } from '../composables/useLiquidGlassReveal'

interface Props {
  logo: string
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
  tuning?: Record<string, unknown>
  label?: string
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  look: 'light',
  background: undefined,
  logoColor: undefined,
  plateColor: undefined,
  iconPlate: undefined,
  keepPlate: undefined,
  originalColors: undefined,
  tileSize: undefined,
  logoScale: undefined,
  finalScale: undefined,
  logoOffset: undefined,
  loop: true,
  hold: undefined,
  speed: 1,
  time: undefined,
  tuning: undefined,
  label: 'Logo',
  className: '',
  style: () => ({})
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()
const wrap = useTemplateRef<HTMLElement>('wrap')

const settings = computed(() => {
  const own: Record<string, unknown> = {
    background: props.background,
    logoColor: props.logoColor,
    plateColor: props.plateColor,
    iconPlate: props.iconPlate,
    keepPlate: props.keepPlate,
    originalColors: props.originalColors,
    tileSize: props.tileSize,
    logoScale: props.logoScale,
    finalScale: props.finalScale,
    hold: props.hold
  }
  const set = Object.fromEntries(Object.entries(own).filter(([, value]) => value !== undefined))
  if (props.logoOffset) set.logoOffset = props.logoOffset
  return { ...LOOKS[props.look], ...set, ...(props.tuning ?? {}) } as Record<string, unknown>
})

const { fallback, replay, fallbackUrl } = useLiquidGlassReveal({
  wrap,
  settings: () => settings.value,
  loop: () => props.loop,
  speed: () => props.speed,
  time: () => props.time,
  logo: () => props.logo
})

const fallbackStyle = computed(() => {
  const s = settings.value
  const size = Number(s.tileSize) * Number(s.logoScale) * Number(s.finalScale) * BOX
  const url = fallbackUrl()
  return {
    width: `${size}px`,
    height: `${size}px`,
    maxWidth: '40%',
    maxHeight: '40%',
    backgroundColor: String(s.logoColor ?? ''),
    maskImage: `url("${url}")`,
    WebkitMaskImage: `url("${url}")`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center'
  }
})
const rootStyle = computed(() => ({ backgroundColor: String(settings.value.background ?? ''), ...props.style }))

function onClick(event: MouseEvent) {
  replay()
  emit('click', event)
}
</script>

<template>
  <div
    ref="wrap"
    role="img"
    :aria-label="label"
    :class="['lgr-root', className].filter(Boolean)"
    :style="rootStyle"
    @click="onClick"
  >
    <span v-if="fallback" aria-hidden="true" class="lgr-fallback" :style="fallbackStyle" />
  </div>
</template>

<style scoped>
.lgr-root { position: relative; isolation: isolate; cursor: pointer; overflow: hidden; user-select: none; }
.lgr-fallback { position: absolute; inset: 0; margin: auto; display: block; }
</style>
