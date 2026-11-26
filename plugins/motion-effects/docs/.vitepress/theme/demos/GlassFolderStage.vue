<script setup lang="ts">
import { computed } from 'vue'
import { GlassFolder } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const props = computed(() =>
  pick(values, [
    'label', 'meta', 'tone', 'art', 'seed', 'image', 'action', 'labelPlacement',
    'width', 'appear', 'appearDelay', 'files', 'menu'
  ])
)
</script>

<template>
  <div class="gf-root-stage">
    <GlassFolder v-bind="props" />
    <p class="stage-status">点玻璃面板开合文件夹，右下角键添加文件或打开菜单；指针移动时玻璃反光跟随</p>
  </div>
</template>

<style scoped>
.gf-root-stage { display: grid; place-items: center; width: 100%; padding: 24px; }
</style>
