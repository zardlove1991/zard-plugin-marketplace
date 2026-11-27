<script setup lang="ts">
import { computed, ref } from 'vue'
import { ClickSpark } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const lastEvent = ref('在方框里任意位置点击，就会炸出火花')
const sparkRef = ref<{ spark: (x?: number, y?: number) => void } | null>(null)

const props = computed(() =>
  pick(values, [
    'sparkColor', 'shape', 'sparkCount', 'sparkRadius', 'sparkSize', 'sparkWidth',
    'duration', 'easing', 'randomness', 'gravity', 'spread', 'direction', 'glow',
    'ring', 'layer', 'disabled', 'extraScale'
  ])
)

function onClick() {
  lastEvent.value = '触发了一次点击火花'
}
</script>

<template>
  <div class="spark-stage">
    <ClickSpark ref="sparkRef" v-bind="props" class="spark-stage__spark" @click="onClick">
      <div class="spark-stage__area">
        <p class="spark-stage__hint">在方框里任意位置点击</p>
        <button class="spark-stage__btn" type="button" @click.stop="sparkRef?.spark()">
          用 API 触发一次
        </button>
      </div>
    </ClickSpark>
    <p class="spark-stage__log">{{ lastEvent }}</p>
    <p class="stage-status">每次点击按需建一张小画布 · 画完即移除 · 最多并发 32 次爆点 · prefers-reduced-motion 下缩短到 320ms</p>
  </div>
</template>

<style scoped>
.spark-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  padding: 24px;
}
.spark-stage__spark {
  width: min(100%, 620px);
  height: 300px;
}
.spark-stage__area {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  border-radius: var(--me-r-lg);
  background: radial-gradient(120% 120% at 50% 0%, #2b2b31, #16161a 72%);
  cursor: crosshair;
}
.spark-stage__hint {
  margin: 0;
  font-size: 13px;
  color: var(--me-muted);
  pointer-events: none;
  user-select: none;
}
.spark-stage__btn {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: #e7e7ea;
  color: #16161a;
  font: 600 13px/1 inherit;
  cursor: pointer;
}
.spark-stage__btn:active {
  transform: translateX(-50%) scale(0.96);
}
.spark-stage__log {
  margin: 0;
  font: 500 12px/1.5 ui-monospace, monospace;
  color: var(--me-muted);
}
</style>
