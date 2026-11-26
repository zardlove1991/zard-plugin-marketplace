<script setup lang="ts">
import { computed, ref } from 'vue'
import { AIPromptBox } from '@motion-effects/vue'
import type { AIPromptMode } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const text = ref('')
const mode = ref<AIPromptMode | null>(null)
const lastEvent = ref('试试输入文字后按 Enter，或点下面的模式按钮')
const props = computed(() =>
  pick(values, [
    'placeholder', 'isLoading', 'disabled', 'maxHeight', 'showUpload', 'showVoice',
    'showToggles', 'visualizerBars', 'accept', 'maxFileSize'
  ])
)
function onSend(message: string, files: File[]) {
  lastEvent.value = `send · "${message}" · ${files.length} 个附件`
}
</script>

<template>
  <div class="aip-stage">
    <div class="aip-stage__box">
      <AIPromptBox
        v-model="text"
        v-model:mode="mode"
        v-bind="props"
        @send="onSend"
        @stop="lastEvent = 'stop · 已停止生成'"
        @file-error="reason => lastEvent = `file-error · ${reason}`"
        @recording-start="lastEvent = 'recording-start'"
        @recording-stop="d => lastEvent = `recording-stop · ${d}s`"
      />
    </div>
    <p class="aip-stage__log">{{ lastEvent }}</p>
    <p class="stage-status">Enter 发送 · Shift+Enter 换行 · 模式互斥 · 可粘贴 / 拖拽图片 · 点麦克风录音</p>
  </div>
</template>

<style scoped>
.aip-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  padding: 24px;
}
.aip-stage__box {
  width: min(100%, 620px);
  padding: 20px;
  border-radius: var(--me-r-lg);
  background: radial-gradient(120% 120% at 50% 0%, #2b2b31, #16161a 72%);
}
.aip-stage__log {
  margin: 0;
  font: 500 12px/1.5 ui-monospace, monospace;
  color: var(--me-muted);
}
</style>
