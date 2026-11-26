<script setup lang="ts">
import { computed, ref } from 'vue'
import { TiltedCard, TiltedCardLayer } from '@motion-effects/vue'
import { withBase } from 'vitepress'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const flipped = ref(false)
const props = computed(() =>
  pick(values, [
    'containerWidth', 'containerHeight', 'imageWidth', 'imageHeight', 'scaleOnHover',
    'rotateAmplitude', 'smoothness', 'glare', 'glareColor', 'shadow', 'parallax',
    'radius', 'perspective', 'axis', 'reverse', 'floating', 'trackWindow',
    'gyroscope', 'intro', 'showTooltip', 'flipOnClick'
  ])
)
</script>

<template>
  <div class="tc-root">
    <TiltedCard
      v-model:flipped="flipped"
      :image-src="withBase('/demos/assets/landscape.jpg')"
      alt-text="Landscape"
      caption-text="悬停看看"
      v-bind="props"
    >
      <TiltedCardLayer :depth="28" class="tc-badge">维链通</TiltedCardLayer>
      <template #back>
        <div class="tc-back"><strong>Back face</strong><span>点一下翻回来</span></div>
      </template>
    </TiltedCard>
    <p class="stage-status">移动指针或点按卡片：倾斜 / 眩光跟随，点一下翻面，提示文字带惯性摆动</p>
  </div>
</template>

<style scoped>
.tc-root { display: grid; place-items: center; width: 100%; padding: 24px; }
.tc-badge {
  position: absolute;
  top: 18px;
  left: 18px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.45);
  color: #fff;
  font-size: 12px;
}
.tc-back {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  background: linear-gradient(150deg, #3b3357, #1b1a24);
  color: #fff;
}
.tc-back span { font-size: 13px; opacity: 0.7; }
</style>
