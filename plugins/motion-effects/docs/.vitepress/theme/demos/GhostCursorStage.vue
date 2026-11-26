<script setup lang="ts">
import { computed } from 'vue'
import { GhostCursor } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const props = computed(() =>
  pick(values, [
    'color', 'theme', 'size', 'trailLength', 'inertia', 'turbulence', 'drift', 'detail',
    'grainIntensity', 'bloomStrength', 'bloomRadius', 'bloomThreshold', 'edgeIntensity',
    'brightness', 'clickPuff', 'zIndex', 'maxDevicePixelRatio'
  ])
)
</script>

<template>
  <div class="gc-root">
    <div class="gc-stage">
      <p>在下方移动指针，点击喷一团墨。光标层覆盖整个视口，不会挡住交互。</p>
    </div>
    <GhostCursor v-bind="props" />
    <p class="stage-status">需要 WebGL2 + 浮点颜色缓冲；无 GPU 的浏览器不会显示光标</p>
  </div>
</template>

<style scoped>
.gc-root { width: 100%; padding: 24px; }
.gc-stage {
  display: grid;
  place-items: center;
  min-height: 300px;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: var(--me-r-lg);
  background: radial-gradient(120% 120% at 30% 0%, #202033, #0a0b12 72%);
  color: rgb(255 255 255 / 0.7);
  text-align: center;
}
</style>
