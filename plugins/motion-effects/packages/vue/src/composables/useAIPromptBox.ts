/**
 * AIPromptBox 的无 UI 逻辑，按职责拆成三段：
 *
 * - useAIPromptRecorder   录音计时 + 可视化柱（随机值在开始录音时生成一次，不逐帧进响应式）
 * - usePromptDialog       图片预览弹层（Escape 关闭、锁 body 滚动、焦点归还）
 * - usePromptAttachments  图片附件（accept / 体积校验、data URL 预览、移除、清空）
 * - usePromptDrop         拖拽进入 / 离开 / 放下（只认带文件的拖拽，不吞页面内其它拖动）
 *
 * 浏览器 API 只在调用方挂载后或事件处理器里访问，SSR 安全。
 */
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { AIPromptBoxLabels, PromptAttachment, PromptFileError } from '../types'

/** 与 React 原件一致的默认文案（英文），按需用 `labels` 覆盖 */
export const DEFAULT_LABELS: AIPromptBoxLabels = {
  inputLabel: 'Message',
  upload: 'Upload image',
  search: 'Search',
  think: 'Think',
  canvas: 'Canvas',
  stopGeneration: 'Stop generation',
  stopRecording: 'Stop recording',
  sendMessage: 'Send message',
  voiceMessage: 'Voice message',
  recording: 'Recording voice message',
  imagePreview: 'Image preview',
  close: 'Close',
  removeFile: 'Remove image',
  searchPlaceholder: 'Search the web...',
  thinkPlaceholder: 'Think deeply...',
  canvasPlaceholder: 'Create on canvas...',
  voiceMessageTemplate: '[Voice message - {duration} seconds]'
}

/** 与 React 原件一致：单文件 10MB */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024

export interface RecorderBar {
  /** 柱高（百分比） */
  height: number
  delay: number
  duration: number
}

/* ------------------------------------------------------------------ */
/* 录音                                                                */
/* ------------------------------------------------------------------ */

export function useAIPromptRecorder(options: {
  bars?: () => number | undefined
  onStart?: () => void
  onStop?: (duration: number) => void
} = {}) {
  const isRecording = ref(false)
  const elapsed = ref(0)
  const bars = shallowRef<RecorderBar[]>([])
  let timer: ReturnType<typeof setInterval> | null = null
  let startedAt = 0

  const clock = computed(() => {
    const mins = Math.floor(elapsed.value / 60)
    const secs = elapsed.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  function buildBars(count: number) {
    const total = Math.max(1, Math.floor(count ?? 32) || 32)
    const list: RecorderBar[] = []
    for (let i = 0; i < total; i += 1) {
      list.push({
        height: Math.max(15, Math.random() * 100),
        delay: i * 0.05,
        duration: 0.5 + Math.random() * 0.5
      })
    }
    bars.value = list
  }

  function start() {
    if (isRecording.value) return
    isRecording.value = true
    startedAt = Date.now()
    elapsed.value = 0
    buildBars(options.bars?.() ?? 32)
    options.onStart?.()
    timer = setInterval(() => {
      elapsed.value = Math.floor((Date.now() - startedAt) / 1000)
    }, 1000)
  }

  function stop() {
    if (!isRecording.value) return
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    const duration = elapsed.value
    isRecording.value = false
    elapsed.value = 0
    bars.value = []
    options.onStop?.(duration)
  }

  function toggle() {
    if (isRecording.value) stop()
    else start()
  }

  // 卸载时只清计时器，不触发 onStop（避免卸载时向父级发一条语音消息）
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    timer = null
  })

  return { isRecording, elapsed, clock, bars, start, stop, toggle }
}

/* ------------------------------------------------------------------ */
/* 图片预览弹层                                                        */
/* ------------------------------------------------------------------ */

export function usePromptFileDialog(panel?: { value: HTMLElement | null }) {
  const image = shallowRef<string | null>(null)
  const isOpen = computed(() => image.value !== null)
  let lastFocus: HTMLElement | null = null
  let previousOverflow: string | null = null

  function lockScroll() {
    if (typeof document === 'undefined' || previousOverflow !== null) return
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function unlockScroll() {
    if (typeof document === 'undefined' || previousOverflow === null) return
    document.body.style.overflow = previousOverflow
    previousOverflow = null
  }

  function open(source: string) {
    if (typeof document !== 'undefined') {
      lastFocus = document.activeElement as HTMLElement | null
    }
    image.value = source
    lockScroll()
  }

  function close() {
    if (!isOpen.value) return
    image.value = null
    unlockScroll()
    const target = lastFocus
    lastFocus = null
    target?.focus?.()
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    close()
  }

  watch(isOpen, async open => {
    if (typeof document === 'undefined') return
    if (!open) {
      document.removeEventListener('keydown', onKeydown)
      return
    }
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    panel?.value?.focus?.()
  })

  onBeforeUnmount(() => {
    if (typeof document === 'undefined') return
    document.removeEventListener('keydown', onKeydown)
    if (isOpen.value) {
      image.value = null
      unlockScroll()
    }
  })

  return { image, isOpen, open, close }
}

/* ------------------------------------------------------------------ */
/* 附件                                                                */
/* ------------------------------------------------------------------ */

export function matchesAccept(file: File, accept: string | undefined) {
  const rules = (accept ?? 'image/*').trim()
  if (!rules || rules === '*/*') return true
  return rules.split(',').some(rule => {
    const value = rule.trim().toLowerCase()
    if (!value) return false
    if (value.startsWith('.')) return file.name.toLowerCase().endsWith(value)
    if (value.endsWith('/*')) return file.type.toLowerCase().startsWith(value.slice(0, -1))
    return file.type.toLowerCase() === value
  })
}

export function usePromptAttachments(options: {
  accept?: () => string | undefined
  maxSize?: () => number | undefined
  onChange?: (files: File[]) => void
  onError?: (reason: PromptFileError, file: File) => void
} = {}) {
  const entries = shallowRef<PromptAttachment[]>([])
  const files = computed(() => entries.value.map(entry => entry.file))
  /** 最近一次被拒绝的原因；成功添加后清空 */
  const error = ref<PromptFileError | null>(null)
  let counter = 0

  function fail(reason: PromptFileError, file: File) {
    error.value = reason
    options.onError?.(reason, file)
  }

  /** 与 React 原件一致：一次只保留一张图，新图替换旧图 */
  function add(file: File) {
    if (!matchesAccept(file, options.accept?.())) {
      fail('type', file)
      return false
    }
    const max = options.maxSize?.() ?? DEFAULT_MAX_FILE_SIZE
    if (file.size > max) {
      fail('size', file)
      return false
    }

    const entry: PromptAttachment = { id: `aip-file-${++counter}`, file, preview: null }
    entries.value = [entry]
    error.value = null
    options.onChange?.(files.value)

    if (typeof FileReader === 'undefined') return true
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      entries.value = entries.value.map(item =>
        item.id === entry.id ? { ...item, preview: reader.result as string } : item
      )
    }
    reader.onerror = () => fail('read', file)
    reader.readAsDataURL(file)
    return true
  }

  /** 粘贴 / 拖拽 / 文件选择框的入口：取第一张合法图片，其余忽略 */
  function addMany(list: FileList | File[] | undefined | null) {
    const all = Array.from(list ?? [])
    if (!all.length) return false
    const accepted = all.find(
      file => matchesAccept(file, options.accept?.()) && file.size <= (options.maxSize?.() ?? DEFAULT_MAX_FILE_SIZE)
    )
    if (!accepted) {
      fail(matchesAccept(all[0]!, options.accept?.()) ? 'size' : 'type', all[0]!)
      return false
    }
    return add(accepted)
  }

  function remove(index: number) {
    const next = entries.value.filter((_, i) => i !== index)
    if (next.length === entries.value.length) return
    entries.value = next
    options.onChange?.(files.value)
  }

  function clear() {
    if (!entries.value.length) return
    entries.value = []
    options.onChange?.(files.value)
  }

  onBeforeUnmount(clear)

  return { entries, files, error, add, addMany, remove, clear }
}

/* ------------------------------------------------------------------ */
/* 拖拽                                                                */
/* ------------------------------------------------------------------ */

function carriesFiles(event: DragEvent) {
  const types = event.dataTransfer?.types
  if (!types) return false
  for (let i = 0; i < types.length; i += 1) {
    if (types[i] === 'Files') return true
  }
  return false
}

export function usePromptDrop(onFiles: (files: File[]) => void) {
  const isDragging = ref(false)
  let depth = 0

  function onDragEnter(event: DragEvent) {
    if (!carriesFiles(event)) return
    event.preventDefault()
    event.stopPropagation()
    depth += 1
    isDragging.value = true
  }

  function onDragOver(event: DragEvent) {
    if (!carriesFiles(event)) return
    event.preventDefault()
    event.stopPropagation()
  }

  function onDragLeave(event: DragEvent) {
    if (!carriesFiles(event)) return
    event.preventDefault()
    event.stopPropagation()
    depth = Math.max(0, depth - 1)
    if (depth === 0) isDragging.value = false
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    depth = 0
    isDragging.value = false
    const list = Array.from(event.dataTransfer?.files ?? [])
    if (list.length) onFiles(list)
  }

  return { isDragging, onDragEnter, onDragOver, onDragLeave, onDrop }
}
