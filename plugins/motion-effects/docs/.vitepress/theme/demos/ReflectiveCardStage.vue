<script setup lang="ts">
import { computed } from 'vue'
import { ReflectiveCard } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const props = computed(() =>
  pick(values, [
    'theme', 'name', 'role', 'badge', 'status', 'statusColor', 'idLabel', 'idValue',
    'width', 'height', 'radius', 'tint', 'metalness', 'roughness', 'blurStrength',
    'grayscale', 'warp', 'warpScale', 'shine', 'bevel', 'glare', 'enableTilt',
    'tiltStrength', 'intro', 'webcam'
  ])
)
</script>

<template>
  <div class="rc-root">
    <ReflectiveCard v-bind="props" />
    <p class="stage-status">移动指针：金属表面按姿态反射页面背景并产生眩光；可打开 webcam 用摄像头作为反射源，无 WebGL2 时只显示卡面</p>
  </div>
</template>

<style scoped>
.rc-root { display: grid; place-items: center; width: 100%; padding: 24px; }
</style>
