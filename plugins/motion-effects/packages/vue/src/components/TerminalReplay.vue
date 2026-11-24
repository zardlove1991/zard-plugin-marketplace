<script setup lang="ts">
import { computed, useTemplateRef, type CSSProperties } from 'vue'
import {
  InlineText,
  PROJECT_SETUP_SCRIPT,
  TAG_COLORS,
  useTerminalReplay
} from '../composables/useTerminalReplay'
import type { TerminalStep } from '../types'

interface Props {
  script?: TerminalStep[]
  title?: string
  prompt?: string
  directory?: string
  chrome?: 'window' | 'minimal' | 'none'
  frame?: 'solid' | 'inset'
  dots?: 'mono' | 'color'
  theme?: 'auto' | 'light' | 'dark'
  accentColor?: string
  windowColor?: string
  textColor?: string
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  height?: number | string
  radius?: number
  typingSpeed?: number
  variance?: number
  lineDelay?: number
  startDelay?: number
  hold?: number
  loop?: boolean
  autoplay?: boolean
  cursor?: 'block' | 'bar' | 'underline'
  copyable?: boolean
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  script: () => PROJECT_SETUP_SCRIPT,
  title: 'weiliantong — zsh',
  prompt: '❯',
  directory: '~',
  chrome: 'window',
  frame: 'inset',
  dots: 'mono',
  theme: 'auto',
  accentColor: '#2563eb',
  fontSize: 13,
  lineHeight: 1.7,
  height: 360,
  radius: 16,
  typingSpeed: 26,
  variance: 0.5,
  lineDelay: 70,
  startDelay: 700,
  hold: 3200,
  loop: true,
  autoplay: true,
  cursor: 'block',
  copyable: true,
  interactive: true
})

const emit = defineEmits<{
  complete: []
}>()

const rootRef = useTemplateRef<HTMLElement>('root')
const scrollRef = useTemplateRef<HTMLElement>('scroll')

const { lines, typing, active, dark, play, interact } = useTerminalReplay({
  root: rootRef,
  scroll: scrollRef,
  script: () => props.script,
  directory: () => props.directory,
  theme: () => props.theme,
  typingSpeed: () => props.typingSpeed,
  variance: () => props.variance,
  lineDelay: () => props.lineDelay,
  startDelay: () => props.startDelay,
  hold: () => props.hold,
  loop: () => props.loop,
  autoplay: () => props.autoplay,
  interactive: () => props.interactive,
  onComplete: () => emit('complete')
})

/** 手动从头重播 */
defineExpose({ play })

const ink = computed(() => props.textColor ?? (dark.value ? '#E7E7EA' : '#18181b'))
const font = computed(
  () => props.fontFamily ?? "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
)
const hasBar = computed(() => props.chrome === 'window' || props.chrome === 'minimal')
const dotColors = computed(() =>
  props.dots === 'color'
    ? ['#FF5F57', '#FEBC2E', '#28C840']
    : ['rgba(128,128,128,.55)', 'rgba(128,128,128,.55)', 'rgba(128,128,128,.55)']
)
const hairline = computed(() => (dark.value ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'))
const lineHeightPx = computed(() => `${props.fontSize * props.lineHeight}px`)

// Vue 的 :style 不会像 React 那样给数字补 px，非无单位的值都要自己带单位
const rootStyle = computed<CSSProperties>(() => ({
  '--tr-accent': props.accentColor,
  '--tr-window': props.windowColor ?? (dark.value ? '#111113' : '#ffffff'),
  '--tr-ink': ink.value,
  '--tr-frame': dark.value ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.045)',
  '--tr-panel': dark.value ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,.02)',
  width: '100%',
  maxWidth: '720px',
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: `${props.radius}px`,
  overflow: 'hidden',
  background: 'var(--tr-frame)',
  border: `1px solid ${dark.value ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.1)'}`,
  fontFamily: font.value,
  fontSize: `${props.fontSize}px`,
  lineHeight: props.lineHeight,
  color: ink.value,
  cursor: props.interactive ? 'pointer' : 'default',
  outline: 'none'
}))

const scrollStyle = computed<CSSProperties>(() => ({
  height: hasBar.value ? 'calc(100% - 38px)' : '100%',
  background: props.frame === 'inset' ? 'var(--tr-window)' : 'transparent',
  borderRadius: props.frame === 'inset' ? `${Math.max(0, props.radius - 10)}px` : '0',
  margin: props.frame === 'inset' ? '8px' : '0'
}))

const lineStyle = (line: { kind: 'command' | 'output' | 'status'; status?: string }): CSSProperties => ({
  color: line.kind === 'status' ? TAG_COLORS[line.status ?? 'success'] : ink.value,
  opacity: line.kind === 'output' ? 0.86 : 1
})

const cursorStyle = computed<CSSProperties>(() => ({
  width: props.cursor === 'bar' ? '2px' : '0.62em',
  height: props.cursor === 'underline' ? '2px' : '1.05em',
  verticalAlign: props.cursor === 'underline' ? 'text-bottom' : 'middle'
}))

/** 进度条：每 5% 一格，共 20 格 */
const progressText = (pct: number) => {
  const filled = Math.floor(pct / 5)
  return `[${'█'.repeat(filled)}${'·'.repeat(20 - filled)}] ${pct}%`
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  interact()
}

const copy = (text: string, event: MouseEvent) => {
  event.stopPropagation()
  try {
    void navigator.clipboard?.writeText(text)
  } catch {
    /* 剪贴板不可用 */
  }
}
</script>

<template>
  <div
    ref="root"
    class="tr-root"
    role="button"
    :tabindex="interactive ? 0 : -1"
    aria-label="Terminal session playback. Press Enter to skip or restart."
    :style="rootStyle"
    @click="interact"
    @keydown="onKeydown"
  >
    <div class="tr-bar" :style="{ borderBottom: `1px solid ${hairline}` }">
      <span v-if="chrome === 'window'" class="tr-dots">
        <span
          v-for="(color, index) in dotColors"
          :key="index"
          class="tr-dot"
          :style="{ background: color }"
          data-dot
        />
      </span>
      <span v-if="hasBar" class="tr-title">{{ title }}</span>
    </div>

    <div ref="scroll" class="tr-scroll" :style="scrollStyle">
      <div class="tr-lines">
        <div
          v-for="line in lines"
          :key="line.id"
          class="tr-line"
          :data-line="line.kind"
          :style="{ minHeight: lineHeightPx }"
        >
          <template v-if="line.kind === 'command'">
            <span class="tr-accent tr-fixed">{{ prompt }}</span>
            <span class="tr-dir tr-fixed">{{ line.dir }}</span>
            <span>
              <InlineText :text="line.text" :accent="accentColor" />
            </span>
            <button
              v-if="copyable"
              type="button"
              class="tr-copy"
              title="复制命令"
              :style="{ color: ink, fontFamily: font }"
              @click="copy(line.text, $event)"
            >
              复制
            </button>
          </template>
          <span v-else :style="lineStyle(line)">
            <InlineText :text="line.text" :accent="accentColor" />
          </span>
        </div>

        <div v-if="typing" class="tr-line tr-typing" data-typing>
          <span class="tr-accent">{{ prompt }}</span>
          <span class="tr-dir">{{ typing.dir }}</span>
          <span>{{ typing.text }}</span>
          <span class="tr-cursor" :style="cursorStyle" />
        </div>

        <div v-if="active" class="tr-active" :data-active="active.kind">
          <span class="tr-accent">{{ active.kind === 'spinner' ? active.frame : '▍' }}</span>
          <span>
            <InlineText :text="active.text" :accent="accentColor" />
          </span>
          <span v-if="active.kind === 'progress'" class="tr-accent">
            {{ progressText(active.pct ?? 0) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- 上游是行内样式；这里把其中不随 props 变化的部分落成带前缀的全局规则 -->
<style>
.tr-root,
.tr-root *,
.tr-root *::before,
.tr-root *::after {
  box-sizing: border-box;
}

.tr-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
}

.tr-dots {
  display: flex;
  gap: 7px;
}

.tr-dot {
  width: 11px;
  height: 11px;
  border-radius: 9px;
}

.tr-title {
  margin: 0 auto;
  font-size: 11px;
  letter-spacing: 0.02em;
  opacity: 0.62;
}

.tr-scroll {
  position: relative;
  overflow: hidden;
  padding: 14px 16px;
}

.tr-lines {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tr-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.tr-active {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tr-accent {
  color: var(--tr-accent);
}

.tr-fixed {
  flex: none;
}

.tr-dir {
  opacity: 0.55;
}

.tr-copy {
  margin-left: auto;
  padding: 0;
  opacity: 0;
  border: 0;
  border-radius: 0;
  background: none;
  font-size: 11px;
  line-height: inherit;
  cursor: pointer;
  transition: opacity 0.18s ease;
}

.tr-root:hover .tr-copy,
.tr-copy:focus-visible {
  opacity: 0.7;
}

.tr-cursor {
  display: inline-block;
  background: var(--tr-accent);
  animation: tr-blink 1s steps(1) infinite;
}

@keyframes tr-blink {
  50% {
    opacity: 0;
  }
}
</style>
