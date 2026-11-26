<script setup lang="ts">
import { computed } from 'vue'
import { GlassIconReveal } from '@motion-effects/vue'
import { MARK_21ST } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const props = computed(() =>
  pick(values, [
    'look', 'background', 'logoColor', 'plateColor', 'iconPlate', 'keepPlate',
    'originalColors', 'tileSize', 'logoScale', 'finalScale', 'loop', 'hold', 'speed'
  ])
)
</script>

<template>
  <div class="glr-root">
    <GlassIconReveal :logo="MARK_21ST" v-bind="props" />
    <p class="stage-status">玻璃抬起 Logo 并在边缘折射出色散；点击可重播，调 time 可冻结到某一帧</p>
  </div>
</template>

<style scoped>
.glr-root {
  display: grid;
  place-items: center;
  width: 100%;
  padding: 24px;
  background: radial-gradient(120% 120% at 50% 0%, #e7ebf5, #c8d0e2 72%);
  border-radius: var(--me-r-lg);
  min-height: 360px;
}
</style>
