<script setup lang="ts">
import { computed, ref } from 'vue'
import { FlipCard } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const flipped = ref(false)
const props = computed(() =>
  pick(values, [
    'axis', 'width', 'height', 'radius', 'tiltMax', 'glareOpacity', 'hoverScale',
    'perspective', 'stiffness', 'damping', 'dragDistance', 'flipOnClick',
    'draggable', 'tilt', 'glare', 'shadow', 'disabled', 'background', 'color',
    'shadowColor', 'shadowOpacity'
  ])
)
</script>

<template>
  <div class="fc-root">
    <FlipCard v-model:flipped="flipped" v-bind="props">
      <template #front>
        <div class="fc-face">
          <span class="fc-kicker">FRONT</span>
          <strong>悬停倾斜 · 拖拽翻面</strong>
          <span>点一下，或者按住甩出去</span>
        </div>
      </template>
      <template #back>
        <div class="fc-face is-back">
          <span class="fc-kicker">BACK</span>
          <strong>另一面也支持眩光</strong>
          <span>按 Enter / 空格也能翻回来</span>
        </div>
      </template>
    </FlipCard>
    <p class="stage-status">点击 / Enter 翻面；按住拖拽并快速松开可按角速度甩动</p>
  </div>
</template>

<style scoped>
.fc-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  padding: 24px;
}
.fc-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  padding: 24px;
  text-align: center;
}
.fc-face strong { font-size: 20px; font-weight: 650; }
.fc-face span { font-size: 13px; opacity: 0.7; }
.fc-kicker { font-size: 10.5px; letter-spacing: 0.28em; opacity: 0.55; }
.fc-face.is-back { background: linear-gradient(150deg, #37324d, #1b1a24); }
</style>
