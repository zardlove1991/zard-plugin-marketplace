import type { Component, Ref } from 'vue'

export type HoldButtonSize = 'sm' | 'md' | 'lg'
export type HoldButtonDirection = 'right' | 'up'

/** AIPromptBox 的三种模式：联网搜索 / 深度思考 / 画板 */
export type AIPromptMode = 'search' | 'think' | 'canvas'

/** AIPromptBox 的全部文案；只覆盖需要改的字段即可 */
export interface AIPromptBoxLabels {
  /** 输入框的无障碍名称 */
  inputLabel: string
  upload: string
  search: string
  think: string
  canvas: string
  stopGeneration: string
  stopRecording: string
  sendMessage: string
  voiceMessage: string
  /** 录音状态的屏幕阅读器文案 */
  recording: string
  imagePreview: string
  close: string
  removeFile: string
  searchPlaceholder: string
  thinkPlaceholder: string
  canvasPlaceholder: string
  /** 语音占位消息模板，`{duration}` 会换成秒数 */
  voiceMessageTemplate: string
}

/** AIPromptBox 的 props（`v-model` / `v-model:mode` 由 defineModel 声明，不在这里） */
export interface AIPromptBoxSettings {
  isLoading?: boolean
  placeholder?: string
  maxHeight?: number | string
  disabled?: boolean
  /** 文件选择框的 accept 规则，默认只收图片 */
  accept?: string
  /** 单文件体积上限（字节），默认 10MB */
  maxFileSize?: number
  showUpload?: boolean
  showVoice?: boolean
  showToggles?: boolean
  /** 录音可视化柱数量 */
  visualizerBars?: number
  labels?: Partial<AIPromptBoxLabels>
}

export type PromptFileError = 'type' | 'size' | 'read'

/** AIPromptBox 内部的一条附件（当前只保留一张图） */
export interface PromptAttachment {
  id: string
  file: File
  /** FileReader 读出的 data URL；读取失败或环境不支持时为 null */
  preview: string | null
}

export type SwipeDirection = 'left' | 'right'

export interface SwipeAction {
  id: string
  label: string
  /** 图标组件；不传时主操作使用默认垃圾桶图标 */
  icon?: Component | null
  /** 覆盖该操作的背景色 */
  color?: string
  /** 点击后走提交路径（折叠整行），主操作默认如此 */
  dismiss?: boolean
  /** 操作被触发时调用；提交路径在 collapse 结束后调用 */
  onSelect?: () => void
}

export type SpecularButtonSize = 'sm' | 'md' | 'lg'

export type TerminalStep =
  | { type: 'command'; text: string; directory?: string }
  | { type: 'output'; lines: string[]; delay?: number }
  | {
      type: 'spinner'
      text: string
      duration?: number
      done?: string
      status?: 'success' | 'error' | 'warning'
    }
  | { type: 'progress'; text: string; duration?: number; done?: string }
  | { type: 'pause'; duration?: number }
  | { type: 'clear' }

export interface ScrollLockedVideoSignature {
  name: string
  url: string
}

export type PeakChartTrend = 'up' | 'down' | 'none'

export type LiquidNavbarFx = 'plane' | 'drop' | 'spin' | 'glow' | 'wave' | 'pop' | 'none'

export type LiquidNavbarTone = 'light' | 'dark'

export interface LiquidNavItem {
  label: string
  /** 传了就渲染成链接，否则是按钮 */
  href?: string
  /** 图标组件。放进响应式数据时要 markRaw，否则 <component :is> 拿到的是被代理的组件 */
  icon?: Component
  /** 点击时图标播放的小动画；不传时，有图标用 pop，没图标用 none */
  fx?: LiquidNavbarFx
}

/** 折射通道；A 只作占位，SVG/WebGL 都把它当 0 用 */
export type GlassSurfaceChannel = 'R' | 'G' | 'B' | 'A'

export type GlassSurfaceRenderer = 'auto' | 'webgl' | 'svg'

/** 玻璃背后的同源图 / 视频 / canvas。Vue 的模板 ref 在模板里会自动解包成 DOM。 */
export type GlassBackdrop =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | Ref<HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null>
  | { current: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null }
  | null


export type RubberSegmentSize = 'sm' | 'md' | 'lg'



export type GlassFolderArtPreset = 'aurora' | 'ember' | 'dusk' | 'glacier' | 'verdant'

export interface GlassFolderArtRecipe {
  [key: string]: unknown
}

export type GlassFolderArt = GlassFolderArtPreset | GlassFolderArtRecipe | 'none'

export interface GlassFolderFile {
  name: string
  meta?: string
  art?: GlassFolderArtPreset | GlassFolderArtRecipe
  image?: string
  href?: string
}

export interface GlassFolderMenuItem {
  label: string
  onSelect?: () => void
  danger?: boolean
}

export interface MagicBentoItem {
  id?: string | number
  title?: string
  description?: string
  label?: string
  icon?: unknown
  image?: string
  href?: string
  target?: string
  rel?: string
  visual?: string | unknown
  content?: unknown
  colSpan?: number
  rowSpan?: number
}

export interface PillNavItem {
  label: string
  href?: string
  icon?: Component | null
  ariaLabel?: string
}

export interface SignaturePoint {
  x: number
  y: number
  t?: number
  p?: number
}

export type SignatureStrokes = SignaturePoint[][]
export type SignaturePen = 'fountain' | 'ballpoint' | 'marker'
export type SignatureMode = 'play' | 'sign'
export type SignatureTheme = 'auto' | 'light' | 'dark'

export interface RubberSegmentItem {
  value: string
  label: string
  icon?: Component | null
}

export type GridMotionDirection = 'alternate' | 'left' | 'right'

export type GridMotionItem = string | { src: string; alt?: string } | null | false

export interface GridMotionTile {
  kind: 'empty' | 'image' | 'text'
  src?: string
  alt?: string
  text?: string
}

export interface GridMotionSettings {
  items: GridMotionItem[]
  rows: number
  aspectRatio: number
  gap: number
  angle: number
  tilt: number
  speed: number
  direction: GridMotionDirection
  parallax: number
  spotlight: number
  dim: number
  fade: number
}

export type GhostCursorTheme = 'dark' | 'light'

export interface GhostCursorSettings {
  color?: string
  brightness?: number
  size?: number
  trailLength?: number
  inertia?: number
  turbulence?: number
  drift?: number
  detail?: number
  grainIntensity?: number
  bloomStrength?: number
  bloomRadius?: number
  bloomThreshold?: number
  edgeIntensity?: number
  clickPuff?: boolean
  intro?: boolean
  theme?: GhostCursorTheme
  mixBlendMode?: string
  fadeDelayMs?: number
  fadeDurationMs?: number
  maxDevicePixelRatio?: number
  targetPixels?: number
  zIndex?: number
  className?: string
  style?: Record<string, string | number>
}

export interface AnimatedListEntry {
  id?: string | number
  /** 图标组件；与 image 二选一 */
  icon?: Component | null
  /** 缩略图地址 */
  image?: string
  title: string
  description?: string
  meta?: string
}

export type AnimatedListItem = AnimatedListEntry | string

export type AnimatedListAnimation = 'pop' | 'slide' | 'fade' | 'none'

/** useAnimatedList 直接读取的 props 子集 */
export interface AnimatedListSettings {
  items: AnimatedListItem[]
  animation: AnimatedListAnimation
  animateOnce: boolean
  stagger: number
  selectOnHover: boolean
  enableArrowNavigation: boolean
  loop: boolean
  showGradients: boolean
  fadeSize: number
  maxHeight: number | string
  gap: number
}

/** GlassSurface 的全部入参，composable 直接读这个响应式 props 对象 */
export interface GlassSurfaceSettings {
  width?: number | string
  height?: number | string
  borderRadius?: number
  borderWidth?: number
  brightness?: number
  opacity?: number
  blur?: number
  displace?: number
  backgroundOpacity?: number
  saturation?: number
  distortionScale?: number
  redOffset?: number
  greenOffset?: number
  blueOffset?: number
  xChannel?: GlassSurfaceChannel
  yChannel?: GlassSurfaceChannel
  mixBlendMode?: string
  refraction?: boolean
  renderer?: GlassSurfaceRenderer
  backdrop?: GlassBackdrop
  /** 自定义轮廓图（同源 data URL / 图片地址）；描边、发光与遮罩都从它生成 */
  shape?: string | null
  className?: string
  style?: Record<string, string | number>
}
