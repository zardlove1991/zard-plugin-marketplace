<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { PillNav } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const active = ref('#')
const props = computed(() =>
  pick(values, [
    'theme', 'size', 'layout', 'surface', 'itemStyle', 'hoverEffect', 'indicator',
    'collapse', 'bounce', 'stretch', 'intro', 'highlightColor', 'highlightTextColor',
    'barColor', 'textColor', 'ariaLabel'
  ])
)
const items = [
  { label: 'Home', href: '#' }, { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }
]
</script>

<template>
  <div class="pn-root">
    <PillNav v-model:active-href="active" :logo="withBase('/demos/assets/logo.png')" :items="items" v-bind="props" />
    <p class="stage-status">悬停 / 点击切换高亮，弹簧指示条跟随；缩窄预览或用 collapse 看折叠菜单</p>
  </div>
</template>

<style scoped>
.pn-root { display: flex; flex-direction: column; align-items: center; gap: 18px; width: 100%; padding: 24px; }
</style>
