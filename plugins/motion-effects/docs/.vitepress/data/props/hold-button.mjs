/**
 * HoldButton 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。
 * value 是组件的真实默认值；control 为空的 prop 只进 Props 表，不进 Customize。
 */
import { p } from './define.mjs'

export default {
  component: 'HoldButton',
  deps: [],
  slot: 'Hold to delete',
  props: [
    p('doneLabel', 'string', 'Deleted', '完成态文案', 'text'),
    p('backgroundColor', 'string', '#27272a', '按钮底色', 'color'),
    p('fillColor', 'string', '#5227FF', '填充色', 'color'),
    p('textColor', 'string', '#f5f5f5', '文字颜色', 'color'),
    p('fillTextColor', 'string', '#ffffff', '填充掠过后的文字颜色', 'color'),
    p('size', '"sm" | "md" | "lg"', 'md', '高度、内边距与字号预设', 'select', { options: ['sm', 'md', 'lg'] }),
    p('radius', 'number', 14, '圆角半径', 'slider', { min: 0, max: 40, step: 1, unit: 'px' }),
    p('fillDirection', '"right" | "up"', 'right', '填充从右侧扫入，还是从底部升起', 'select', { options: ['right', 'up'] }),
    p('holdTime', 'number', 2000, '需要按住多久才算确认；填充匀速走完', 'slider', { min: 600, max: 4000, step: 100, unit: 'ms' }),
    p('releaseTime', 'number', 200, '提前松手时填充回弹的时长；0 表示立刻复位', 'slider', { min: 0, max: 800, step: 10, unit: 'ms' }),
    p('pressScale', 'number', 0.97, '按住时的缩放；1 关闭', 'slider', { min: 0.8, max: 1.05, step: 0.005 }),
    p('wave', 'boolean', true, '填充前沿带一道滚动的液面', 'switch'),
    p('waveAmplitude', 'number', 6, '液面波峰高度', 'slider', { min: 0, max: 16, step: 0.5, unit: 'px' }),
    p('glow', 'boolean', true, '按住时积聚发光，完成时脉冲一次', 'switch'),
    p('resetAfter', 'number', 1200, '完成态停留多久后复位；0 表示保持', 'slider', { min: 0, max: 5000, step: 100, unit: 'ms' }),
    p('disabled', 'boolean', false, '禁用按钮并忽略输入', 'switch')
  ],
  events: [
    { name: 'hold', args: '[]', desc: '按满 holdTime、填充走完时触发一次' },
    { name: 'tap', args: '[]', desc: '按住不足 holdTime 就松开时触发' }
  ]
}
