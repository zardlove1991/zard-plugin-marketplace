import { h, onBeforeUnmount, onMounted, shallowRef, watch, type Ref, type VNode } from 'vue'
import type { TerminalStep } from '../types'

export const PROJECT_SETUP_SCRIPT: TerminalStep[] = [
  { type: 'command', text: 'npx create-next-app@latest weiliantong --typescript --tailwind', directory: '~' },
  { type: 'output', lines: ['[muted]✓[/] 创建项目目录 weiliantong', '[muted]✓[/] 安装依赖中…'], delay: 90 },
  { type: 'spinner', text: '正在安装依赖', duration: 1400, done: '[success]依赖安装完成[/]', status: 'success' },
  { type: 'command', text: 'cd weiliantong && npm run dev', directory: '~' },
  { type: 'output', lines: ['[accent]▲[/] Next.js 15.2.0', '[success]✓[/] 本地服务已启动', '[muted]→[/] http://localhost:3000'] },
  { type: 'progress', text: '构建设计令牌', duration: 1500, done: '[success]设计令牌已生成[/]' },
  { type: 'pause', duration: 300 },
  { type: 'command', text: 'git status --short', directory: '~/weiliantong' },
  { type: 'output', lines: ['[success] M[/] app/globals.css', '[info]??[/] components/ui/terminal-replay.tsx'], delay: 80 }
]

const TAG_COLORS: Record<string, string> = {
  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  accent: 'var(--tr-accent)',
  muted: 'rgba(231,231,234,.62)',
  dim: 'rgba(231,231,234,.4)',
  bold: 'inherit'
}
export { TAG_COLORS }

// 上游的正则要求闭合标签带名字（`[/success]`），而它的脚本数据全用 `[/]`，所以标签从来没被解析过。
// 这里两种闭合都认。
const TAG_PATTERN = /\[(success|error|warning|info|accent|muted|dim|bold)\]([\s\S]*?)\[\/(?:\1)?\]/g

/** 把 `[tag]文字[/tag]` 渲染成带颜色的 span，其余部分保持纯文本节点（不经过 innerHTML） */
function inline(text: string, accent: string): (VNode | string)[] {
  const out: (VNode | string)[] = []
  TAG_PATTERN.lastIndex = 0
  let last = 0
  let match: RegExpExecArray | null
  while ((match = TAG_PATTERN.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index))
    const key = match[1]!
    out.push(
      h(
        'span',
        {
          key: match.index,
          style: { color: key === 'accent' ? accent : TAG_COLORS[key], fontWeight: key === 'bold' ? 700 : undefined }
        },
        match[2]!
      )
    )
    last = match.index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/** 行内标签的函数式组件：`<InlineText :text="line.text" :accent="accentColor" />` */
export const InlineText = (props: { text: string; accent: string }) => inline(props.text, props.accent)
InlineText.props = { text: String, accent: String }

export interface TerminalLine {
  id: number
  kind: 'command' | 'output' | 'status'
  text: string
  dir?: string
  status?: string
}

export interface TerminalActive {
  kind: 'spinner' | 'progress'
  text: string
  frame?: string
  pct?: number
}

interface UseTerminalReplayOptions {
  root: Ref<HTMLElement | null>
  scroll: Ref<HTMLElement | null>
  script: () => TerminalStep[]
  directory: () => string
  theme: () => string
  typingSpeed: () => number
  variance: () => number
  lineDelay: () => number
  startDelay: () => number
  hold: () => number
  loop: () => boolean
  autoplay: () => boolean
  interactive: () => boolean
  onComplete: () => void
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/**
 * 终端回放的状态机：逐字输入、输出、spinner / progress、跳过与重播。
 * 脚本与参数在每次回放开始时取一份快照，回放途中改 props 不影响当前这一轮。
 */
export function useTerminalReplay(options: UseTerminalReplayOptions) {
  const lines = shallowRef<TerminalLine[]>([])
  const typing = shallowRef<{ dir: string; text: string } | null>(null)
  const active = shallowRef<TerminalActive | null>(null)
  const finished = shallowRef(false)
  const dark = shallowRef(true)

  // 代数令牌：每次开始新一轮回放 +1，旧的异步流程发现代数不对就自行退出
  let generation = 0
  let skip = false
  let wake: (() => void) | null = null
  let seq = 0
  let visible = !options.autoplay()
  let observer: IntersectionObserver | null = null

  const nextId = () => ++seq

  const wait = (ms: number) =>
    new Promise<void>(resolve => {
      if (skip || ms <= 0) {
        resolve()
        return
      }
      // 只在 wake 仍指向自己时才清空：上一轮遗留的计时器到点时，不能把新一轮的唤醒入口清掉
      let settled = false
      const settle = () => {
        if (settled) return
        settled = true
        if (wake === settle) wake = null
        resolve()
      }
      wake = settle
      window.setTimeout(settle, ms)
    })

  const run = async (gen: number) => {
    const config = {
      script: options.script(),
      directory: options.directory(),
      typingSpeed: options.typingSpeed(),
      variance: options.variance(),
      lineDelay: options.lineDelay(),
      startDelay: options.startDelay(),
      hold: options.hold(),
      loop: options.loop()
    }
    lines.value = []
    typing.value = null
    active.value = null
    finished.value = false
    skip = false
    await wait(config.startDelay)
    for (const step of config.script) {
      if (generation !== gen) return
      skip = false
      if (step.type === 'command') {
        const dir = step.directory ?? config.directory
        const gap = 1000 / Math.max(1, config.typingSpeed)
        for (let i = 0; i <= step.text.length; i++) {
          if (generation !== gen) return
          typing.value = { dir, text: step.text.slice(0, i) }
          const jitter = 1 + (Math.random() - 0.5) * config.variance
          await wait(gap * jitter)
        }
        typing.value = null
        lines.value = [...lines.value, { id: nextId(), kind: 'command', text: step.text, dir }]
      } else if (step.type === 'output') {
        for (const text of step.lines) {
          if (generation !== gen) return
          lines.value = [...lines.value, { id: nextId(), kind: 'output', text }]
          await wait(step.delay ?? config.lineDelay)
        }
      } else if (step.type === 'spinner') {
        const end = performance.now() + (step.duration ?? 1200)
        let index = 0
        active.value = { kind: 'spinner', text: step.text, frame: SPINNER_FRAMES[0] }
        // 上游在跳过时仍会原地空转到 duration 结束；这里直接结束当前步骤
        while (performance.now() < end && !skip) {
          if (generation !== gen) return
          await wait(80)
          index = (index + 1) % SPINNER_FRAMES.length
          active.value = { kind: 'spinner', text: step.text, frame: SPINNER_FRAMES[index] }
        }
        active.value = null
        lines.value = [
          ...lines.value,
          { id: nextId(), kind: 'status', text: step.done ?? step.text, status: step.status ?? 'success' }
        ]
      } else if (step.type === 'progress') {
        const duration = step.duration ?? 1200
        const end = performance.now() + duration
        active.value = { kind: 'progress', text: step.text, pct: 0 }
        while (performance.now() < end && !skip) {
          if (generation !== gen) return
          await wait(60)
          const pct = Math.min(100, Math.round(((performance.now() - (end - duration)) / duration) * 100))
          active.value = { kind: 'progress', text: step.text, pct }
        }
        active.value = null
        lines.value = [...lines.value, { id: nextId(), kind: 'status', text: step.done ?? step.text, status: 'success' }]
      } else if (step.type === 'pause') {
        await wait(step.duration ?? 300)
      } else if (step.type === 'clear') {
        lines.value = []
      }
    }
    if (generation !== gen) return
    finished.value = true
    options.onComplete()
    await wait(config.hold)
    if (config.loop && generation === gen) {
      generation += 1
      void run(generation)
    }
  }

  const play = () => {
    generation += 1
    void run(generation)
  }

  /** 点击 / 回车：回放中跳过当前这一步，结束后从头重播 */
  const interact = () => {
    if (!options.interactive()) return
    if (finished.value) {
      play()
      return
    }
    skip = true
    wake?.()
  }

  // theme="auto" 要读父元素的背景色，所以必须在挂载后执行；watch 默认不会立即执行
  const syncTheme = () => {
    const theme = options.theme()
    const element = options.root.value
    if (theme !== 'auto' || !element) {
      dark.value = theme === 'dark'
      return
    }
    const parent = element.parentElement
    const background = parent ? getComputedStyle(parent).backgroundColor : ''
    const channels = background.match(/[\d.]+/g)
    const luminance =
      channels && channels.length >= 3
        ? (0.2126 * Number(channels[0]) + 0.7152 * Number(channels[1]) + 0.0722 * Number(channels[2])) / 255
        : 1
    dark.value = luminance < 0.5
  }

  // autoplay 只决定离屏时是否暂停；两种模式都在挂载时开始播放
  const observe = () => {
    const element = options.root.value
    if (!options.autoplay() || !element || typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting && !visible) {
          visible = true
          play()
        } else if (!entry.isIntersecting && visible) {
          // 离屏：中止当前这轮，回到视口后从头重播
          visible = false
          generation += 1
          wake?.()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(element)
  }

  onMounted(() => {
    syncTheme()
    observe()
    // 挂载即播放，所以 observer 的首次回调不算"进入视口"
    visible = true
    play()
  })

  watch(() => options.theme(), syncTheme)

  watch(() => options.autoplay(), () => {
    observer?.disconnect()
    observer = null
    observe()
    play()
  })

  // 新内容出现后把滚动区贴到底部；flush: 'post' 保证读到的是提交后的 scrollHeight
  watch(
    [lines, typing, active],
    () => {
      const element = options.scroll.value
      if (element) element.scrollTop = element.scrollHeight
    },
    { flush: 'post' }
  )

  onBeforeUnmount(() => {
    generation += 1
    wake?.()
    observer?.disconnect()
    observer = null
  })

  return { lines, typing, active, finished, dark, play, interact }
}
