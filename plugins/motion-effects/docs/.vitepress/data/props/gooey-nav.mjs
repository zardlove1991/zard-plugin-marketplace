/** GooeyNav 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'GooeyNav',
  deps: [],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    items: '导航项',
    initialActiveIndex: '初始选中项',
    activeIndex: '当前选中项',
    theme: '主题',
    color: '胶囊颜色',
    activeTextColor: '胶囊文字色',
    colors: '液滴颜色',
    size: '尺寸',
    frame: '磨砂外框',
    animationTime: '动画时长',
    particleCount: '液滴数量',
    spread: '飞散距离',
    timeVariance: '时间抖动',
    gooeyness: '融合程度',
    wobble: '成形晃动',
    hoverEffect: '悬停高亮'
  },
  props: [
    p('items', 'GooeyNavItem[]', [], '导航项：{ label?, href?, icon? }；没有 href 的渲染成按钮'),
    p('initialActiveIndex', 'number', 0, '非受控时的初始选中项', 'number', { min: 0, max: 8, step: 1 }),
    p('activeIndex', 'number', undefined, '受控的当前选中项（v-model:activeIndex）'),
    p('theme', '"dark" | "light"', 'dark', '面板与文字配色', 'select', {
      options: [
        { value: 'dark', label: '深色' },
        { value: 'light', label: '浅色' }
      ]
    }),
    p('color', 'string', undefined, '胶囊颜色；不传时按主题取高对比色', 'color'),
    p('activeTextColor', 'string', undefined, '胶囊里的文字色；不传时按胶囊色亮度自动选', 'color'),
    p('colors', 'string[]', [], '液滴颜色；为空时用胶囊色', 'text'),
    p('size', '"sm" | "md" | "lg"', 'md', '尺寸', 'select', {
      options: [
        { value: 'sm', label: '小' },
        { value: 'md', label: '中' },
        { value: 'lg', label: '大' }
      ]
    }),
    p('frame', 'boolean', true, '显示磨砂外框', 'switch'),
    p('animationTime', 'number', 600, '液滴飞到新项的时长（ms）', 'slider', { min: 200, max: 1400, step: 20, unit: 'ms' }),
    p('particleCount', 'number', 15, '胶囊碎成的液滴数', 'slider', { min: 4, max: 32, step: 1 }),
    p('spread', 'number', 56, '液滴飞散距离（px）', 'slider', { min: 0, max: 160, step: 4, unit: 'px' }),
    p('timeVariance', 'number', 300, '每滴液滴的随机时间差（ms）', 'slider', { min: 0, max: 800, step: 20, unit: 'ms' }),
    p('gooeyness', 'number', 0.5, '液体融合程度 0–1', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('wobble', 'number', 0.5, '新胶囊成形时的晃动 0–1', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('hoverEffect', 'boolean', true, '悬停时的高亮', 'switch')
  ],
  events: [
    { name: 'update:activeIndex', args: '[index: number]', desc: '选中项变化（配合 v-model:activeIndex）' },
    { name: 'change', args: '[index: number, item: GooeyNavItem]', desc: '选中某一项' }
  ],
  expose: [{ name: 'go', desc: '手动把胶囊搬到指定项（参数为项的下标）' }]
}
