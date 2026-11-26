import { h, markRaw, type Component, type FunctionalComponent, type VNode } from 'vue'
import type { LiquidNavItem } from '../types'

/**
 * LiquidNavbar 内置的 5 个图标，与 React 原件的 NimbusIcons 是同一组路径。
 * 用渲染函数而不是 SFC：它们要作为普通组件放进 items 里，也能被换成项目自己的图标。
 */

const SVG_ATTRS = {
  viewBox: '0 0 24 24',
  width: '18',
  height: '18',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.8',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true'
} as const

const path = (d: string, className?: string) => h('path', { d, class: className })
const circle = (cx: number, cy: number, r: number) => h('circle', { cx, cy, r })

function icon(name: string, nodes: VNode[]): Component {
  const component: FunctionalComponent = () => h('svg', SVG_ATTRS, nodes)
  // 给开发者工具留个名字；函数的 name 是只读的，所以用 defineProperty
  Object.defineProperty(component, 'name', { value: name })
  // 放进 items（响应式数据）时不该被代理，否则 <component :is> 会告警
  return markRaw(component)
}

export const NimbusIcons = {
  home: icon('NimbusHome', [
    path('M3.5 11.2 12 4l8.5 7.2'),
    path('M6 9.6V20h12V9.6'),
    // 门：glow 动画会把它点亮
    path('M10 20v-5h4v5Z', 'nv-door')
  ]),
  globe: icon('NimbusGlobe', [
    circle(12, 12, 8.5),
    path('M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17')
  ]),
  plane: icon('NimbusPlane', [path('M21 12.2 3.6 5.4l2.7 6.8-2.7 6.4L21 12.2Zm-14.7 0H13')]),
  drop: icon('NimbusDrop', [path('M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z')]),
  user: icon('NimbusUser', [circle(12, 8.5, 3.8), path('M4.8 20c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5')])
}

/** 组件的默认条目：每项配一个内置图标和它点击时的小动画 */
export const LIQUID_NAVBAR_ITEMS: LiquidNavItem[] = [
  { label: 'Home', icon: NimbusIcons.home, fx: 'glow' },
  { label: 'Explore', icon: NimbusIcons.globe, fx: 'spin' },
  { label: 'Flights', icon: NimbusIcons.plane, fx: 'plane' },
  { label: 'Weather', icon: NimbusIcons.drop, fx: 'drop' },
  { label: 'Profile', icon: NimbusIcons.user, fx: 'wave' }
]
