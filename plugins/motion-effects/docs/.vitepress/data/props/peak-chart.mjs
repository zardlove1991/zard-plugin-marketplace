/**
 * PeakChart 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。
 * value 是组件的真实默认值；control 为空的 prop 只进 Props 表，不进 Customize。
 */
import { p } from './define.mjs'

export default {
  component: 'PeakChart',
  deps: [],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    value: "当前值",
    valueSuffix: "数值后缀",
    decimals: "小数位数",
    title: "标题",
    caption: "副标题",
    updatedText: "更新时间文案",
    trend: "趋势",
    accent: "强调色",
    width: "卡片宽度",
    loop: "循环秒数",
    backdrop: "背景图",
    data: "数据序列",
    labels: "坐标标签",
    periods: "可选周期",
    defaultPeriod: "默认周期",
    formatValue: "数值格式化",
    font: "字体"
  },
  props: [
    p('value', 'number', 400, 'headline 数字：揭示时从 0 滚上来，变化时重新滚动', 'slider', { min: 0, max: 10000, step: 10 }),
    p('valueSuffix', 'string', '%', '紧跟在数字后面的单位', 'text'),
    p('decimals', 'number', 0, '数字的小数位', 'slider', { min: 0, max: 3, step: 1 }),
    p('title', 'string', 'Conversion rate', '数字上方的小标题', 'text'),
    p('caption', 'string', 'Increase vs last month', '数字下方的说明', 'text'),
    p('updatedText', 'string', 'Data updated 2h ago', '左上角的状态文案', 'text'),
    p('trend', '"up" | "down" | "none"', 'up', '数字旁的趋势箭头：向上绿、向下红，或不显示', 'select', { options: [
          { value: 'up', label: '上升' },
          { value: 'down', label: '下降' },
          { value: 'none', label: '持平' }
        ] }),
    p('accent', 'string', '#4f8ef7', '辉光颜色；偏离参考蓝时整块画布做色相偏移', 'color'),
    p('width', 'number', 420, '卡片宽度，高度按 540:696 跟随，所有尺寸随之缩放', 'slider', { min: 220, max: 520, step: 10, unit: 'px' }),
    p('loop', 'number', 0, '每轮揭示的秒数（最小 6）；0 表示滚入视口播一次后静息呼吸', 'slider', { min: 0, max: 14, step: 0.5, unit: 's' }),
    p('backdrop', 'boolean', false, '绘制颗粒感深色背景并居中卡片，撑满父级', 'switch'),
    p('data', 'number[]', undefined, '曲线数据，从旧到新；不传时按当前周期用内置演示数据。变化时曲线 morph'),
    p('labels', 'string[]', undefined, 'hover 读数的点标签，与数据点一一对应'),
    p('periods', 'string[]', "['Weekly', 'Monthly', 'Yearly']", '周期下拉的选项', null, { usage: false }),
    p('defaultPeriod', 'string', 'Monthly', '非受控时的初始周期；受控请用 v-model:period', null, { usage: false }),
    p('formatValue', '(value: number) => string', undefined, 'hover 读数的格式化；默认是四舍五入值加 valueSuffix', null, { usage: false }),
    p('font', 'string', undefined, '所有文字的字体栈')
  ],
  events: [{ name: 'update:period', args: '[period: string]', desc: '配合 v-model:period 受控周期' }]
}
