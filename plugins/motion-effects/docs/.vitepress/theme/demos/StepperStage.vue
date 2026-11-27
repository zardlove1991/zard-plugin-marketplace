<script setup lang="ts">
import { computed, ref } from 'vue'
import { Stepper } from '@motion-effects/vue'
import type { StepperStep } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const lastEvent = ref('点 Continue 往前走，或直接点指示器')

const steps: StepperStep[] = [
  { title: 'Welcome', description: 'Set up your workspace in a few quick steps.' },
  { title: 'Plan', description: 'Choose a plan that fits your team.' },
  { title: 'Profile', description: 'Tell us who you are.' },
  { title: 'Review', description: 'Check everything before you start.' }
]

const panels = [
  { title: '欢迎 aboard', text: '几步就能把工作区搭好。' },
  { title: '选择一个方案', text: '随时都可以改。' },
  { title: '我们该怎么称呼你？', text: '填个名字就行。' },
  { title: '看起来不错', text: '完成设置就能开工。' }
]

const props = computed(() =>
  pick(values, [
    'indicator', 'orientation', 'transition', 'linear', 'disableStepIndicators',
    'showFooter', 'backButtonText', 'nextButtonText', 'completeButtonText',
    'theme', 'accentColor', 'frame', 'radius', 'width'
  ])
)

const light = computed(() => values.theme === 'light')
</script>

<template>
  <div class="stepper-stage">
    <div class="stepper-stage__box" :class="{ 'is-light': light }">
      <Stepper
        :steps="steps"
        v-bind="props"
        @step-change="step => (lastEvent = `step-change · 第 ${step} 步`)"
        @final-step-completed="lastEvent = 'final-step-completed · 全部完成'"
      >
        <template #step="{ index }">
          <h3 class="stepper-stage__title">{{ panels[index]?.title }}</h3>
          <p class="stepper-stage__text">{{ panels[index]?.text }}</p>
        </template>
        <template #completed>
          <h3 class="stepper-stage__title">全部完成</h3>
          <p class="stepper-stage__text">工作区已经准备好了。</p>
        </template>
      </Stepper>
    </div>
    <p class="stepper-stage__log">{{ lastEvent }}</p>
    <p class="stage-status">当前步的指示器是禁用的 · linear 打开时只能点回走过的步骤 · 纵向布局在窄屏自动折叠</p>
  </div>
</template>

<style scoped>
.stepper-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  padding: 24px;
}
.stepper-stage__box {
  width: min(100%, 620px);
  padding: 20px;
  border-radius: var(--me-r-lg);
  background: radial-gradient(120% 120% at 50% 0%, #2b2b31, #16161a 72%);
}
.stepper-stage__box.is-light {
  background: radial-gradient(120% 120% at 50% 0%, #f6f6f8, #e7e7ea 72%);
}
.stepper-stage__title {
  margin: 0 0 6px;
  font-size: 16px;
  letter-spacing: -0.01em;
}
.stepper-stage__text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  opacity: 0.68;
}
.stepper-stage__log {
  margin: 0;
  font: 500 12px/1.5 ui-monospace, monospace;
  color: var(--me-muted);
}
</style>
