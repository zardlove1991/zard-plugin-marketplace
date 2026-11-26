<script setup lang="ts">
import { computed } from 'vue'
import { GridMotion } from '@motion-effects/vue'
import { withBase } from 'vitepress'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const photos = ['city-poster.jpg', 'landscape.jpg', 'sunset.jpg'].map(name => ({
  src: withBase(`/demos/assets/${name}`), alt: name
}))
const items = [...photos, '维链通', '品牌 CI', ...photos]
const props = computed(() =>
  pick(values, [
    'rows', 'aspectRatio', 'gap', 'radius', 'angle', 'tilt', 'speed', 'direction',
    'parallax', 'spotlight', 'dim', 'fade', 'grayscale', 'theme', 'tileColor', 'textColor'
  ])
)
</script>

<template>
  <div class="grid-root">
    <div class="grid-stage">
      <GridMotion v-bind="props" :items="items" />
    </div>
    <p class="stage-status">移动指针点亮聚光；相邻行反向漂移，边缘羽化融入页面</p>
  </div>
</template>

<style scoped>
.grid-root { display: flex; flex-direction: column; gap: 18px; width: 100%; padding: 24px; }
.grid-stage { height: 380px; border-radius: var(--me-r-lg); overflow: hidden; background: #0d0c11; }
</style>
