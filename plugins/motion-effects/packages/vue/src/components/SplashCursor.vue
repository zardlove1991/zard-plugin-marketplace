<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useSplashCursor, type SplashCursorSettings } from '../composables/useSplashCursor'

type Props = SplashCursorSettings

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#4f8cff', '#2dd4bf', '#ffd166'],
  rainbow: true,
  colorSpeed: 1,
  intensity: 1,
  size: 1,
  force: 1,
  swirl: 3,
  trail: 1,
  momentum: 1,
  shading: 1,
  glow: 0,
  quality: 'high',
  clickSplash: true,
  intro: true,
  contained: false,
  theme: 'dark',
  zIndex: 50,
  className: ''
})

const root = useTemplateRef<HTMLDivElement>('root')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

const getSettings = (): SplashCursorSettings => ({
  colors: props.colors,
  rainbow: props.rainbow,
  colorSpeed: props.colorSpeed,
  intensity: props.intensity,
  size: props.size,
  force: props.force,
  swirl: props.swirl,
  trail: props.trail,
  momentum: props.momentum,
  shading: props.shading,
  glow: props.glow,
  quality: props.quality,
  clickSplash: props.clickSplash,
  intro: props.intro,
  contained: props.contained,
  theme: props.theme
})

const { supported } = useSplashCursor({ root, canvas, getSettings })

const rootStyle = computed(() => ({ zIndex: props.zIndex, ...props.style }))
</script>

<template>
  <div
    ref="root"
    :class="['splash-cursor', className]"
    :style="rootStyle"
    :data-contained="contained ? '' : undefined"
    aria-hidden="true"
  >
    <canvas ref="canvas" class="splash-cursor__canvas" />
    <p v-if="!supported" class="splash-cursor__fallback">
      当前浏览器 / 设备不支持 WebGL2 浮点纹理，已跳过流体渲染（静态降级）。
    </p>
  </div>
</template>

<style src="./SplashCursor.css"></style>
