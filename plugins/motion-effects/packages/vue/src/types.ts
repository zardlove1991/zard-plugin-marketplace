import type { Component, Ref } from 'vue'

export type HoldButtonSize = 'sm' | 'md' | 'lg'
export type HoldButtonDirection = 'right' | 'up'

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
