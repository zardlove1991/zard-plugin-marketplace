<script setup lang="ts">
import { computed, ref } from 'vue'
import { RubberSegment } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const value = ref('Day')
const props = computed(() =>
  pick(values, [
    'size', 'radius', 'inset', 'equalSlots', 'stretch', 'squash', 'speed', 'glide',
    'draggable', 'disabled', 'trackColor', 'thumbColor', 'textColor', 'activeTextColor'
  ])
)
</script>

<template>
  <div class="rs-root">
    <RubberSegment v-model="value" :items="['Day', 'Week', 'Month']" v-bind="props" />
    <p class="stage-status">拖动滑块越过边界会橡皮筋回拉，快速甩可跳一格；方向键也能切换</p>
  </div>
</template>

<style scoped>
.rs-root { display: flex; flex-direction: column; align-items: center; gap: 18px; width: 100%; padding: 24px; }
</style>
