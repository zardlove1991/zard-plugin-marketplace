/** Dock 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'Dock',
  deps: ['@hugeicons/vue'],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    items: '导航项',
    position: '停靠位置',
    theme: '主题',
    baseItemSize: '图标大小',
    magnification: '放大上限',
    distance: '影响距离',
    panelHeight: '条子厚度',
    gap: '图标间距',
    roundness: '圆角',
    spring: '弹簧参数',
    bounce: '点击弹跳',
    autoHide: '自动收起',
    tiles: '图标底板',
    showLabels: '名称提示',
    showIndicators: '运行中圆点',
    showBadges: '通知角标',
    badgeColor: '角标颜色',
    accentColor: '强调色'
  },
  props: [
    p('items', 'DockItem[]', [], '导航项：{ icon?, label?, onClick?, active?, badge?, menu? }；插入 { separator: true } 分组'),
    p('position', '"bottom" | "top" | "left" | "right"', 'bottom', '停靠在父容器的哪条边', 'select', {
      options: [
        { value: 'bottom', label: '底部' },
        { value: 'top', label: '顶部' },
        { value: 'left', label: '左侧' },
        { value: 'right', label: '右侧' }
      ]
    }),
    p('theme', '"dark" | "light"', 'dark', '面板与图标的配色', 'select', {
      options: [
        { value: 'dark', label: '深色' },
        { value: 'light', label: '浅色' }
      ]
    }),
    p('baseItemSize', 'number', 50, '静止时图标大小（px）', 'number', { min: 24, max: 90, step: 2, unit: 'px' }),
    p('magnification', 'number', 70, '指针下的图标大小（px）', 'number', { min: 24, max: 140, step: 2, unit: 'px' }),
    p('distance', 'number', 200, '指针多远内图标还会放大（px）', 'number', { min: 60, max: 360, step: 10, unit: 'px' }),
    p('panelHeight', 'number', 68, 'dock 条的厚度（px）', 'number', { min: 40, max: 120, step: 2, unit: 'px' }),
    p('gap', 'number', 10, '图标间距（px）', 'number', { min: 0, max: 32, step: 1, unit: 'px' }),
    p('roundness', 'number', 0.5, '图标与条子的圆角 0–1', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('spring', '{ mass?, stiffness?, damping? }', '{ mass: 0.1, stiffness: 150, damping: 12 }', '放大用的弹簧参数'),
    p('bounce', 'boolean', true, '点击时图标弹跳', 'switch'),
    p('autoHide', 'boolean', false, '指针离开后自动收起', 'switch'),
    p('tiles', 'boolean', true, '图标后面画圆角底板', 'switch'),
    p('showLabels', 'boolean', true, '悬停时显示名称', 'switch'),
    p('showIndicators', 'boolean', true, '运行中的项目显示小圆点', 'switch'),
    p('showBadges', 'boolean', true, '显示通知角标', 'switch'),
    p('badgeColor', 'string', '#ff453a', '角标颜色', 'color'),
    p('accentColor', 'string', '#0a84ff', '菜单高亮与键盘焦点的颜色', 'color')
  ],
  events: [
    { name: 'select', args: '[index: number, item: DockItem]', desc: '点了某一项' }
  ]
}
