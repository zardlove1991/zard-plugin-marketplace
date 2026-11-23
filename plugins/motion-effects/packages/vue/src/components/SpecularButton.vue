<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { useSpecularLight, type SpecularSettings } from '../composables/useSpecularLight'
import type { SpecularButtonSize } from '../types'

interface Props {
  size?: SpecularButtonSize
  radius?: number
  tint?: string
  tintOpacity?: number
  blur?: number
  textColor?: string
  lineColor?: string
  baseColor?: string
  intensity?: number
  idleIntensity?: number
  shineSize?: number
  shineFade?: number
  thickness?: number
  glow?: number
  speed?: number
  followMouse?: boolean
  proximity?: number
  autoAnimate?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  radius: 18,
  tint: '#ffffff',
  tintOpacity: 0.04,
  blur: 0,
  textColor: '#f5f5f5',
  lineColor: '#ffffff',
  baseColor: '#525252',
  intensity: 1,
  idleIntensity: 0.35,
  shineSize: 10,
  shineFade: 34,
  thickness: 1.2,
  glow: 1,
  speed: 0.35,
  followMouse: true,
  proximity: 250,
  autoAnimate: false,
  disabled: false,
  type: 'button',
  className: ''
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonRef = useTemplateRef<HTMLButtonElement>('button')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getSettings = (): SpecularSettings => ({
  radius: Math.max(0, props.radius),
  lineColor: String(props.lineColor),
  baseColor: String(props.baseColor),
  intensity: Math.max(0, props.intensity),
  idleIntensity: clamp(props.idleIntensity, 0, 1),
  shineSize: Math.max(0, props.shineSize),
  shineFade: Math.max(0, props.shineFade),
  thickness: Math.max(0, props.thickness),
  glow: Math.max(0, props.glow),
  speed: props.speed,
  followMouse: props.followMouse,
  proximity: Math.max(1, props.proximity),
  autoAnimate: props.autoAnimate,
  disabled: props.disabled
})

const { wake } = useSpecularLight({
  button: buttonRef,
  canvas: canvasRef,
  getSettings,
  disabled: () => props.disabled
})

watch(getSettings, () => wake(), { deep: true })

const styleVars = computed(() => ({
  '--sb-radius': `${props.radius}px`,
  '--sb-tint': props.tint,
  '--sb-tint-opacity': String(props.tintOpacity),
  '--sb-blur': `${props.blur}px`,
  '--sb-text-color': props.textColor
}))
</script>

<template>
  <button
    ref="button"
    :type="type"
    :disabled="disabled"
    :class="['specular-button', `specular-button--${size}`, className]"
    :style="styleVars"
    @click="emit('click', $event)"
  >
    <canvas ref="canvas" class="specular-button__light" aria-hidden="true" />
    <span class="specular-button__label"><slot>Get Started</slot></span>
  </button>
</template>

<style src="./SpecularButton.css"></style>