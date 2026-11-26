<script setup lang="ts">
import type { CSSProperties } from 'vue'

withDefaults(
  defineProps<{
    depth?: number
    className?: string
    style?: CSSProperties
  }>(),
  { depth: 20, className: '', style: () => ({}) }
)
</script>

<template>
  <div class="tilted-card__layer" :class="className" :style="{ '--tc-depth': depth, ...style }">
    <slot />
  </div>
</template>
