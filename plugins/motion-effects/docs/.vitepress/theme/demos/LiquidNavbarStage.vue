<script setup lang="ts">
import { computed, ref } from 'vue'
import { LiquidNavbar } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const active = ref(0)

// compact 不传时是 undefined：pick 会把它丢掉，组件就走"窄屏自动收起"
const props = computed(() => pick(values, ['tone', 'compact', 'sound']))
const tone = computed(() => (values.tone === 'dark' ? 'dark' : 'light'))
</script>

<template>
  <div class="ln-root">
    <div class="ln-stage" :data-tone="tone">
      <!-- 导航条背后的色块：玻璃的模糊与折射要有内容才看得出来 -->
      <div class="ln-stage__backdrop" aria-hidden="true">
        <i class="ln-stage__blob is-a"></i>
        <i class="ln-stage__blob is-b"></i>
        <i class="ln-stage__blob is-c"></i>
      </div>
      <LiquidNavbar v-model:active="active" v-bind="props" />
    </div>
    <p class="stage-status">
      点击条目或按左右方向键：水团滑向新条目，跳得远会甩出小水珠；鼠标移入抬起来弯，按下激起一圈波纹
    </p>
  </div>
</template>

<style scoped>
.ln-root {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  padding: 36px 24px 32px;
}

.ln-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 260px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.16);
  border-radius: var(--me-r-lg);
  background: linear-gradient(160deg, #eef6fc, #cfe3f2);
  transition: background 0.4s var(--me-ease);
}

.ln-stage[data-tone='dark'] {
  border-color: rgb(255 255 255 / 0.08);
  background: radial-gradient(120% 110% at 82% 0%, #16345f, #070d1a 72%);
}

.ln-stage__backdrop {
  position: absolute;
  inset: -12%;
  filter: blur(30px);
}

.ln-stage__blob {
  position: absolute;
  border-radius: 50%;
}

.is-a {
  top: -6%;
  left: 8%;
  width: 34%;
  aspect-ratio: 1;
  background: #ffa98f;
}

.is-b {
  top: 16%;
  left: 44%;
  width: 28%;
  aspect-ratio: 1;
  background: #8fd3ff;
}

.is-c {
  top: -14%;
  right: 6%;
  width: 30%;
  aspect-ratio: 1;
  background: #c9b8ff;
}

[data-tone='dark'] .is-a {
  background: #d4634f;
}

[data-tone='dark'] .is-b {
  background: #1f6fb8;
}

[data-tone='dark'] .is-c {
  background: #5b49c9;
}
</style>
