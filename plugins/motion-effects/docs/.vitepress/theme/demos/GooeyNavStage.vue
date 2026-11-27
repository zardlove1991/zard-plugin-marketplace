<script setup lang="ts">
import { computed, ref } from 'vue'
import { GooeyNav } from '@motion-effects/vue'
import type { GooeyNavItem } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const lastEvent = ref('点一项，胶囊会碎成液滴飞过去')

const items: GooeyNavItem[] = [
  { label: '首页', href: '#' },
  { label: '作品', href: '#' },
  { label: '关于', href: '#' },
  { label: '联系', href: '#' }
]

const props = computed(() =>
  pick(values, [
    'theme', 'color', 'activeTextColor', 'colors', 'size', 'frame',
    'animationTime', 'particleCount', 'spread', 'timeVariance', 'gooeyness', 'wobble', 'hoverEffect'
  ])
)
</script>

<template>
  <div class="gooey-stage">
    <GooeyNav
      :items="items"
      v-bind="props"
      @change="(index, item) => (lastEvent = `change · 选中「${item.label}」（第 ${index + 1} 项）`)"
    />
    <p class="gooey-stage__log">{{ lastEvent }}</p>
    <p class="stage-status">WebGL2 + SDF 着色器 · 没有 WebGL2 时退回 CPU 等值线 + clip-path · prefers-reduced-motion 下直接切换</p>
  </div>
</template>

<style scoped>
.gooey-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 48px 24px;
}
.gooey-stage__log {
  margin: 0;
  font: 500 12px/1.5 ui-monospace, monospace;
  color: var(--me-muted);
}
</style>
