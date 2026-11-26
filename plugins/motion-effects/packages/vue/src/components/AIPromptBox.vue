<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { AnimatePresence, motion, useReducedMotion } from 'motion-v'
import { ArrowUp, BrainCog, FolderCode, Globe, Mic, Paperclip, Square, StopCircle, X } from '@lucide/vue'
import {
  DEFAULT_LABELS,
  useAIPromptRecorder,
  usePromptAttachments,
  usePromptFileDialog,
  usePromptDrop
} from '../composables/useAIPromptBox'
import type { AIPromptBoxSettings, AIPromptMode } from '../types'

const props = withDefaults(defineProps<AIPromptBoxSettings>(), {
  isLoading: false,
  placeholder: 'Type your message here...',
  maxHeight: 240,
  disabled: false,
  accept: 'image/*',
  maxFileSize: 10 * 1024 * 1024,
  showUpload: true,
  showVoice: true,
  showToggles: true,
  visualizerBars: 32,
  labels: () => ({})
})

const emit = defineEmits<{
  send: [message: string, files: File[]]
  stop: []
  'files-change': [files: File[]]
  'file-error': [reason: 'type' | 'size' | 'read', file: File]
  'recording-start': []
  'recording-stop': [duration: number]
  'mode-change': [mode: AIPromptMode | null]
}>()

/** v-model：输入框文本 */
const model = defineModel<string>()
/** v-model:mode：search / think / canvas；null 表示都不开 */
const modeModel = defineModel<AIPromptMode | null>('mode')

const root = useTemplateRef<HTMLDivElement>('root')
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const dialogPanel = useTemplateRef<HTMLElement>('dialogPanel')

const labels = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }))

/* ---------- 文本 ---------- */

const innerText = ref('')
const text = computed(() => model.value ?? innerText.value)

function setText(value: string) {
  innerText.value = value
  // 没绑 v-model 时也发一次，父级可以只监听 update:modelValue
  model.value = value
}

const placeholder = computed(() => {
  if (currentMode.value === 'search') return labels.value.searchPlaceholder
  if (currentMode.value === 'think') return labels.value.thinkPlaceholder
  if (currentMode.value === 'canvas') return labels.value.canvasPlaceholder
  return props.placeholder
})

/* ---------- 模式 ---------- */

const innerMode = ref<AIPromptMode | null>(null)
const currentMode = computed(() => modeModel.value ?? innerMode.value)

function toggleMode(mode: AIPromptMode) {
  if (props.disabled) return
  const next = currentMode.value === mode ? null : mode
  innerMode.value = next
  modeModel.value = next
  emit('mode-change', next)
}

/* ---------- 附件 ---------- */

const attachments = usePromptAttachments({
  accept: () => props.accept,
  maxSize: () => props.maxFileSize,
  onChange: files => emit('files-change', files),
  onError: (reason, file) => emit('file-error', reason, file)
})

const drop = usePromptDrop(files => attachments.addMany(files))

function pickFile() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) attachments.addMany(input.files)
  input.value = ''
}

function onPaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (item && item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        event.preventDefault()
        attachments.add(file)
        break
      }
    }
  }
}

/* ---------- 录音 ---------- */

const recorder = useAIPromptRecorder({
  bars: () => props.visualizerBars,
  onStart: () => emit('recording-start'),
  onStop: duration => {
    emit('recording-stop', duration)
    // 与 React 原件一致：停录后把占位消息当作一条消息发出
    emit('send', labels.value.voiceMessageTemplate.replace('{duration}', String(duration)), [])
  }
})

/* ---------- 图片预览 ---------- */

const dialog = usePromptFileDialog(dialogPanel)
const reduce = useReducedMotion()
const dialogTransition = computed(() =>
  reduce.value ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const }
)

/* ---------- 发送 ---------- */

const hasContent = computed(() => text.value.trim() !== '' || attachments.files.value.length > 0)
const isLocked = computed(() => props.disabled || props.isLoading || recorder.isRecording.value)

function submit() {
  if (isLocked.value || !hasContent.value) return
  const mode = currentMode.value
  const prefix =
    mode === 'search' ? '[Search: ' : mode === 'think' ? '[Think: ' : mode === 'canvas' ? '[Canvas: ' : ''
  emit('send', prefix ? `${prefix}${text.value}]` : text.value, attachments.files.value.slice())
  setText('')
  attachments.clear()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey) return
  // 输入法组字中的 Enter 不发送
  if (event.isComposing || event.keyCode === 229) return
  event.preventDefault()
  submit()
}

/* ---------- 主按钮 ---------- */

const mainLabel = computed(() => {
  if (props.isLoading) return labels.value.stopGeneration
  if (recorder.isRecording.value) return labels.value.stopRecording
  if (hasContent.value) return labels.value.sendMessage
  return labels.value.voiceMessage
})

const mainDisabled = computed(
  () => props.disabled || (!props.isLoading && !recorder.isRecording.value && !hasContent.value && !props.showVoice)
)

const mainClass = computed(() => ({
  'aip-btn--recording': recorder.isRecording.value,
  'aip-btn--solid': props.isLoading || (!recorder.isRecording.value && hasContent.value),
  'aip-btn--idle': !props.isLoading && !recorder.isRecording.value && !hasContent.value
}))

function onMainClick() {
  if (props.disabled) return
  if (props.isLoading) {
    emit('stop')
    return
  }
  if (recorder.isRecording.value) {
    recorder.stop()
    return
  }
  if (hasContent.value) {
    submit()
    return
  }
  if (props.showVoice) recorder.start()
}

/* ---------- 自适应高度 ---------- */

function resize() {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height =
    typeof props.maxHeight === 'number'
      ? `${Math.min(el.scrollHeight, props.maxHeight)}px`
      : `min(${el.scrollHeight}px, ${props.maxHeight})`
}

let observer: ResizeObserver | null = null
let lastWidth = 0

onMounted(() => {
  resize()
  document.addEventListener('paste', onPaste)
  if (typeof ResizeObserver !== 'undefined' && root.value) {
    lastWidth = root.value.clientWidth
    // 只在宽度变化时重算，避免自己改高度又把自己触发一遍
    observer = new ResizeObserver(() => {
      const width = root.value?.clientWidth ?? 0
      if (width === lastWidth) return
      lastWidth = width
      resize()
    })
    observer.observe(root.value)
  }
})

watch([text, () => props.maxHeight], () => nextTick(resize), { flush: 'post' })

onBeforeUnmount(() => {
  document.removeEventListener('paste', onPaste)
  observer?.disconnect()
  observer = null
})

defineExpose({
  focus: () => textarea.value?.focus(),
  submit,
  clear: () => {
    setText('')
    attachments.clear()
  }
})
</script>

<template>
  <div
    ref="root"
    :class="[
      'aip',
      {
        'is-loading': isLoading,
        'is-recording': recorder.isRecording.value,
        'is-dragging': drop.isDragging.value
      }
    ]"
    :data-mode="currentMode ?? undefined"
    :data-disabled="disabled ? '' : undefined"
    @dragenter="drop.onDragEnter"
    @dragover="drop.onDragOver"
    @dragleave="drop.onDragLeave"
    @drop="drop.onDrop"
  >
    <div v-if="attachments.entries.value.length && !recorder.isRecording.value" class="aip__files">
      <div v-for="(entry, index) in attachments.entries.value" :key="entry.id" class="aip__file">
        <button
          type="button"
          class="aip__file-hit"
          :aria-label="labels.imagePreview"
          :disabled="!entry.preview"
          @click="entry.preview && dialog.open(entry.preview)"
        >
          <img v-if="entry.preview" :src="entry.preview" :alt="entry.file.name" />
          <span v-else class="aip__file-pending" aria-hidden="true"></span>
        </button>
        <button
          type="button"
          class="aip__file-remove"
          :aria-label="labels.removeFile"
          @click.stop="attachments.remove(index)"
        >
          <X :size="12" />
        </button>
      </div>
    </div>

    <div class="aip__field" :class="{ 'is-hidden': recorder.isRecording.value }">
      <textarea
        ref="textarea"
        class="aip__textarea"
        :value="text"
        :placeholder="placeholder"
        :aria-label="labels.inputLabel"
        :disabled="isLocked"
        rows="1"
        @input="setText(($event.target as HTMLTextAreaElement).value)"
        @keydown="onKeydown"
      ></textarea>
    </div>

    <div
      v-if="recorder.isRecording.value"
      class="aip__recorder"
      role="status"
      :aria-label="labels.recording"
    >
      <div class="aip__recorder-head">
        <span class="aip__dot" aria-hidden="true"></span>
        <span class="aip__clock">{{ recorder.clock.value }}</span>
      </div>
      <div class="aip__bars" aria-hidden="true">
        <span
          v-for="(bar, index) in recorder.bars.value"
          :key="index"
          class="aip__bar"
          :style="{
            height: `${bar.height}%`,
            animationDelay: `${bar.delay}s`,
            animationDuration: `${bar.duration}s`
          }"
        ></span>
      </div>
    </div>

    <div class="aip__actions">
      <div class="aip__tools" :class="{ 'is-hidden': recorder.isRecording.value }">
        <template v-if="showUpload">
          <span class="aip-tip" :data-tip="labels.upload">
            <button
              type="button"
              class="aip-btn"
              :aria-label="labels.upload"
              :disabled="disabled || recorder.isRecording.value"
              @click="pickFile"
            >
              <Paperclip :size="20" />
            </button>
          </span>
          <input ref="fileInput" type="file" class="aip__input" :accept="accept" @change="onFileChange" />
        </template>

        <div v-if="showToggles" class="aip__toggles">
          <button
            type="button"
            class="aip-toggle aip-toggle--search"
            :class="{ 'is-on': currentMode === 'search' }"
            :aria-pressed="currentMode === 'search'"
            :aria-label="labels.search"
            :disabled="disabled"
            @click="toggleMode('search')"
          >
            <span class="aip-toggle__icon">
              <motion.div
                class="aip-toggle__glyph"
                :animate="{ rotate: currentMode === 'search' ? 360 : 0, scale: currentMode === 'search' ? 1.1 : 1 }"
                :while-hover="{
                  rotate: currentMode === 'search' ? 360 : 15,
                  scale: 1.1,
                  transition: { type: 'spring', stiffness: 300, damping: 10 }
                }"
                :transition="{ type: 'spring', stiffness: 260, damping: 25 }"
              >
                <Globe :size="16" />
              </motion.div>
            </span>
            <AnimatePresence>
              <motion.span
                v-if="currentMode === 'search'"
                class="aip-toggle__label"
                :initial="{ width: 0, opacity: 0 }"
                :animate="{ width: 'auto', opacity: 1 }"
                :exit="{ width: 0, opacity: 0 }"
                :transition="{ duration: 0.2 }"
              >
                {{ labels.search }}
              </motion.span>
            </AnimatePresence>
          </button>

          <span class="aip-divider" aria-hidden="true"></span>

          <button
            type="button"
            class="aip-toggle aip-toggle--think"
            :class="{ 'is-on': currentMode === 'think' }"
            :aria-pressed="currentMode === 'think'"
            :aria-label="labels.think"
            :disabled="disabled"
            @click="toggleMode('think')"
          >
            <span class="aip-toggle__icon">
              <motion.div
                class="aip-toggle__glyph"
                :animate="{ rotate: currentMode === 'think' ? 360 : 0, scale: currentMode === 'think' ? 1.1 : 1 }"
                :while-hover="{
                  rotate: currentMode === 'think' ? 360 : 15,
                  scale: 1.1,
                  transition: { type: 'spring', stiffness: 300, damping: 10 }
                }"
                :transition="{ type: 'spring', stiffness: 260, damping: 25 }"
              >
                <BrainCog :size="16" />
              </motion.div>
            </span>
            <AnimatePresence>
              <motion.span
                v-if="currentMode === 'think'"
                class="aip-toggle__label"
                :initial="{ width: 0, opacity: 0 }"
                :animate="{ width: 'auto', opacity: 1 }"
                :exit="{ width: 0, opacity: 0 }"
                :transition="{ duration: 0.2 }"
              >
                {{ labels.think }}
              </motion.span>
            </AnimatePresence>
          </button>

          <span class="aip-divider" aria-hidden="true"></span>

          <button
            type="button"
            class="aip-toggle aip-toggle--canvas"
            :class="{ 'is-on': currentMode === 'canvas' }"
            :aria-pressed="currentMode === 'canvas'"
            :aria-label="labels.canvas"
            :disabled="disabled"
            @click="toggleMode('canvas')"
          >
            <span class="aip-toggle__icon">
              <motion.div
                class="aip-toggle__glyph"
                :animate="{ rotate: currentMode === 'canvas' ? 360 : 0, scale: currentMode === 'canvas' ? 1.1 : 1 }"
                :while-hover="{
                  rotate: currentMode === 'canvas' ? 360 : 15,
                  scale: 1.1,
                  transition: { type: 'spring', stiffness: 300, damping: 10 }
                }"
                :transition="{ type: 'spring', stiffness: 260, damping: 25 }"
              >
                <FolderCode :size="16" />
              </motion.div>
            </span>
            <AnimatePresence>
              <motion.span
                v-if="currentMode === 'canvas'"
                class="aip-toggle__label"
                :initial="{ width: 0, opacity: 0 }"
                :animate="{ width: 'auto', opacity: 1 }"
                :exit="{ width: 0, opacity: 0 }"
                :transition="{ duration: 0.2 }"
              >
                {{ labels.canvas }}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <span class="aip-tip" :data-tip="mainLabel">
        <button
          type="button"
          class="aip-btn aip-btn--main"
          :class="mainClass"
          :aria-label="mainLabel"
          :disabled="mainDisabled"
          @click="onMainClick"
        >
          <Square v-if="isLoading" :size="16" class="aip-glyph aip-glyph--fill is-pulse" />
          <StopCircle v-else-if="recorder.isRecording.value" :size="20" class="aip-glyph aip-glyph--danger" />
          <ArrowUp v-else-if="hasContent" :size="16" class="aip-glyph aip-glyph--ink" />
          <Mic v-else :size="20" class="aip-glyph aip-glyph--ink" />
        </button>
      </span>
    </div>
  </div>

  <Teleport to="body">
    <AnimatePresence>
      <div v-if="dialog.isOpen.value" class="aip-dialog" @click.self="dialog.close">
        <motion.div
          class="aip-dialog__panel"
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.95 }"
          :transition="dialogTransition"
        >
          <div
            ref="dialogPanel"
            class="aip-dialog__inner"
            role="dialog"
            aria-modal="true"
            :aria-label="labels.imagePreview"
            tabindex="-1"
          >
            <img :src="dialog.image.value ?? undefined" :alt="labels.imagePreview" class="aip-dialog__img" />
            <button type="button" class="aip-dialog__close" :aria-label="labels.close" @click="dialog.close">
              <X :size="20" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  </Teleport>
</template>

<style src="./AIPromptBox.css"></style>
