<script setup lang="ts">
import { EFFECTS } from '../../data/effects.mjs'
import { REPO } from '../../data/nav.mjs'
</script>

<template>
  <footer class="shell__footer">
    <span>
      Motion Effects · {{ EFFECTS.length }} 个特效 · Vue 3 优先，从 React 源码与 vanilla 演示出发做保真移植
    </span>
    <a :href="REPO" target="_blank" rel="noopener">GitHub ↗</a>
  </footer>
</template>
