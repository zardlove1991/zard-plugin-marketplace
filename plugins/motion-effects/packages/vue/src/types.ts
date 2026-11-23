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