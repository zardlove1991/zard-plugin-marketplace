/**
 * LiquidNavbar 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。
 * value 是组件的真实默认值；control 为空的 prop 只进 Props 表，不进 Customize。
 */
import { p } from './define.mjs'

export default {
  component: 'LiquidNavbar',
  deps: [],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    tone: "色调",
    compact: "紧凑模式",
    sound: "点击音效",
    defaultActive: "默认选中项",
    items: "导航项"
  },
  props: [
    p('tone', '"light" | "dark"', 'light', '水的色调：light 给亮背景用，dark 给深色背景用', 'select', {
      options: [{ value: 'light', label: '浅色' }, { value: 'dark', label: '深色' }]
    }),
    p('compact', 'boolean', undefined, '只显示图标。不传时 520px 以下自动收成纯图标', 'select', {
      options: [
        { value: undefined, label: '自动（窄屏收起）' },
        { value: true, label: '开' },
        { value: false, label: '关' }
      ]
    }),
    p('sound', 'boolean', false, '点击时一声合成的"叮"，不加载音频文件；浏览器要等用户手势之后才出声', 'switch'),
    p('defaultActive', 'number', 0, '非受控时的初始项；只在挂载时生效'),
    p(
      'items',
      'LiquidNavItem[]',
      'LIQUID_NAVBAR_ITEMS',
      '导航项 { label, href?, icon?, fx? }：带 href 渲染成链接；icon 传 Vue 组件（放进响应式数据要 markRaw）；fx 是点击时图标的小动画，不传时有图标用 pop、没图标不播'
    )
  ],
  events: [
    {
      name: 'update:active',
      args: '[index: number]',
      desc: '配合 v-model:active 受控当前项；点击条目或按左右方向键切换时触发'
    }
  ]
}
