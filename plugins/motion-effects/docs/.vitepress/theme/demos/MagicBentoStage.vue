<script setup lang="ts">
import { computed } from 'vue'
import { MagicBento } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const props = computed(() =>
  pick(values, [
    'theme', 'columns', 'rowHeight', 'gap', 'radius', 'spotlightRadius', 'particleCount',
    'textAutoHide', 'enableBorderGlow', 'enableSpotlight', 'enableStars', 'enableTilt',
    'enableMagnetism', 'clickEffect', 'intro', 'disableAnimations', 'glowColor'
  ])
)
</script>

<template>
  <div class="mb-root">
    <MagicBento v-bind="props" />
    <p class="stage-status">悬停看聚光 / 边框光，点击看波纹与内置可视化重播；缩窄预览会自动减少列数</p>
  </div>
</template>

<style scoped>
.mb-root { width: 100%; padding: 24px; }
</style>
