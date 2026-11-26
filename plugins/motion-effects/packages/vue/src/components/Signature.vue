<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useSignature } from '../composables/useSignature'
import type { SignaturePen, SignatureStrokes, SignatureTheme } from '../types'
import { DEFAULT_STROKES } from './signatureStrokes'

type Mode = 'play' | 'sign'

interface Props {
  mode?: Mode
  strokes?: SignatureStrokes
  text?: string
  pen?: SignaturePen
  thickness?: number
  speed?: number
  autoplay?: boolean
  loop?: boolean
  pause?: number
  frame?: boolean
  line?: boolean
  name?: string
  role?: string
  placeholder?: string
  aspect?: number
  intro?: boolean
  theme?: SignatureTheme
  inkColor?: string
  surfaceColor?: string
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'play',
  strokes: () => DEFAULT_STROKES,
  text: undefined,
  pen: 'fountain',
  thickness: 1,
  speed: 1,
  autoplay: true,
  loop: false,
  pause: 2400,
  frame: true,
  line: true,
  name: undefined,
  role: undefined,
  placeholder: 'Sign here',
  aspect: 2.4,
  intro: true,
  theme: 'auto',
  inkColor: undefined,
  surfaceColor: undefined,
  className: '',
  style: () => ({})
})

const emit = defineEmits<{
  change: [strokes: SignatureStrokes]
  complete: []
}>()

const root = useTemplateRef<HTMLElement>('root')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

const {
  hasInk, drawn, reveal, dark,
  play, clear, undo, getStrokes, toSVG, toDataURL,
  onDown, onMove, onUp
} = useSignature({
  root,
  canvas,
  mode: () => props.mode,
  strokes: () => props.strokes,
  text: () => props.text,
  pen: () => props.pen,
  thickness: () => props.thickness,
  speed: () => props.speed,
  autoplay: () => props.autoplay,
  loop: () => props.loop,
  pause: () => props.pause,
  inkColor: () => props.inkColor,
  theme: () => props.theme,
  aspect: () => props.aspect,
  onChange: strokes => emit('change', strokes),
  onComplete: () => emit('complete')
})

defineExpose({ play, clear, undo, getStrokes, toSVG, toDataURL })

const surface = computed(() => props.surfaceColor ?? (dark.value ? '#141416' : '#ffffff'))
const stageHeight = computed(() => Math.round(720 / Math.max(0.1, props.aspect)))
const rootStyle = computed(() => ({
  width: '100%',
  maxWidth: '720px',
  fontFamily: '"Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif',
  ...props.style
}))
const stageStyle = computed(() => ({
  position: 'relative' as const,
  height: `${stageHeight.value}px`,
  background: props.frame ? surface.value : 'transparent',
  border: props.frame ? `1px solid ${dark.value ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.09)'}` : 'none',
  borderRadius: props.frame ? '18px' : '0',
  boxShadow: props.frame ? `0 16px 40px -24px rgba(0,0,0,${dark.value ? 0.9 : 0.28})` : 'none',
  padding: props.frame ? '22px 26px 18px' : '8px 0',
  boxSizing: 'border-box' as const,
  opacity: props.intro && !drawn.value ? 0 : 1,
  transition: props.intro ? 'opacity .5s ease' : undefined
}))
const canvasStyle = computed(() => ({
  width: '100%',
  height: 'calc(100% - 44px)',
  display: 'block',
  touchAction: 'none' as const,
  cursor: props.mode === 'sign' ? 'crosshair' : 'default',
  clipPath: props.text && props.mode === 'play' && drawn.value
    ? `inset(0 ${((1 - reveal.value) * 100).toFixed(2)}% 0 0)`
    : undefined
}))
</script>

<template>
  <div ref="root" :class="['signature', className]" :style="rootStyle">
    <div :style="stageStyle">
      <canvas
        ref="canvas"
        :style="canvasStyle"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      />
      <span
        v-if="mode === 'sign' && !hasInk"
        :style="{
          position: 'absolute', left: 0, right: 0, top: '46%', textAlign: 'center',
          color: dark ? 'rgba(228,232,242,.32)' : 'rgba(0,0,0,.32)', fontSize: 14, pointerEvents: 'none'
        }"
      >{{ placeholder }}</span>
      <div
        v-if="line"
        :style="{
          height: 1,
          background: dark ? 'rgba(228,232,242,.22)' : 'rgba(0,0,0,.18)',
          transformOrigin: 'left center',
          animation: intro ? 'sig-line .8s ease both' : undefined
        }"
      />
      <div v-if="name || role" :style="{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }">
        <span
          v-if="name"
          :style="{ color: dark ? '#E4E8F2' : '#18181b', fontSize: 13, fontWeight: 600, letterSpacing: '.01em' }"
        >{{ name }}</span>
        <span v-if="role" :style="{ color: dark ? 'rgba(228,232,242,.5)' : 'rgba(0,0,0,.5)', fontSize: 12 }">{{ role }}</span>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes sig-line {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
</style>
