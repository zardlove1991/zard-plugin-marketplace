<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { PaperCrumple } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const props = computed(() =>
  pick(values, [
    'width', 'height', 'sceneHeight', 'imageFit', 'releaseBehavior', 'crumpleAmount',
    'crumpleDuration', 'releaseDuration', 'foldCount', 'foldSharpness', 'wrinkleDepth',
    'creaseStrength', 'paperColor', 'roughness', 'paperTexture', 'lightIntensity',
    'lightAngle', 'shadow', 'shadowOpacity', 'draggable', 'dragRotation', 'dragRadius',
    'returnToOrigin', 'rotation', 'seed', 'detail', 'disabled'
  ])
)
</script>

<template>
  <div class="pc-root">
    <PaperCrumple :src="withBase('/demos/assets/city-poster.jpg')" v-bind="props" />
    <p class="stage-status">按住纸张揉成团并拖动，松手按 releaseBehavior 恢复或留折痕；空格 / Enter 也能揉，Escape 复位</p>
  </div>
</template>

<style scoped>
.pc-root { display: grid; place-items: center; width: 100%; padding: 24px; }
</style>
