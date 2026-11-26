import type { Component } from 'vue'

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
