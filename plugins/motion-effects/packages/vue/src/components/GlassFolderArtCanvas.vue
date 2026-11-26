<script setup lang="ts">
import { onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { paint, recipeOf } from '../composables/glassFolderArt'
import type { GlassFolderArt, GlassFolderArtPreset } from '../types'

const props = defineProps<{
  art: GlassFolderArtPreset | Record<string, unknown>
  seed: number
  w: number
  h: number
  density: number
  priority: number
  className?: string
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const ready = ref(false)
const pw = Math.max(1, Math.round(props.w * props.density))
const ph = Math.max(1, Math.round(props.h * props.density))
let alive = true

watch(
  () => [JSON.stringify(recipeOf(props.art as never)), props.seed, pw, ph, props.priority] as const,
  ([recipe, seed]) => {
    alive = true
    ready.value = false
    paint(JSON.parse(recipe) as never, seed, pw, ph, props.priority).then(src => {
      const element = canvas.value
      if (!alive || !element) return
      element.width = src.width
      element.height = src.height
      element.getContext('2d')?.drawImage(src, 0, 0)
      ready.value = true
    })
  },
  { immediate: true, flush: 'post' }
)

onBeforeUnmount(() => { alive = false })
</script>

<template>
  <canvas
    ref="canvas"
    aria-hidden="true"
    :class="className"
    :data-ready="ready ? '' : undefined"
    :style="{ width: `${w}px`, height: `${h}px`, maxWidth: 'none' }"
  />
</template>
