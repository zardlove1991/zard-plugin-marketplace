<script setup lang="ts">
import { computed } from 'vue'
import { AnimatedList } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const props = computed(() =>
  pick(values, [
    'animation', 'theme', 'width', 'maxHeight', 'radius', 'gap', 'fadeSize', 'stagger',
    'selectOnHover', 'enableArrowNavigation', 'loop', 'animateOnce', 'showGradients',
    'displayScrollbar', 'frame', 'initialSelectedIndex', 'accentColor'
  ])
)
</script>

<template>
  <div class="al-root">
    <AnimatedList v-bind="props" />
    <p class="stage-status">悬停选中、点击回调；聚焦列表后 ↑ / ↓ / Home / End 切换，Enter 确认</p>
  </div>
</template>

<style scoped>
.al-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  padding: 24px;
}
</style>
