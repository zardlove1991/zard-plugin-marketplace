/** ClickSpark 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'ClickSpark',
  deps: [],
  slot: '<button>点一下</button>',
  props: [
    p('sparkColor', 'string | string[]', '#fff', '火花颜色，单色或一组颜色（按顺序轮换）', 'color'),
    p('shape', '"line" | "streak" | "dot" | "star"', 'line', '火花形状', 'select', { options: ['line', 'streak', 'dot', 'star'] }),
    p('sparkCount', 'number', 8, '每次爆出的火花数', 'slider', { min: 1, max: 32, step: 1 }),
    p('sparkRadius', 'number', 30, '扩散半径（px）', 'slider', { min: 8, max: 140, step: 2, unit: 'px' }),
    p('sparkSize', 'number', 14, '火花长度 / 星形半径', 'slider', { min: 4, max: 40, step: 1, unit: 'px' }),
    p('sparkWidth', 'number', 2, '线条粗细', 'slider', { min: 0.5, max: 6, step: 0.5, unit: 'px' }),
    p('duration', 'number', 500, '单次爆点的存活时长（ms）', 'slider', { min: 200, max: 1400, step: 20, unit: 'ms' }),
    p('easing', '"linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring"', 'ease-out', '缓动', 'select', { options: ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'spring'] }),
    p('randomness', 'number', 0.2, '随机抖动强度 0–1', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('gravity', 'number', 0, '重力，0 为悬浮', 'slider', { min: 0, max: 1.4, step: 0.05 }),
    p('spread', 'number', 360, '扇形张角（度），360 为整圈', 'slider', { min: 20, max: 360, step: 10, unit: '°' }),
    p('direction', 'number', 0, '主方向（度，0 向上）', 'slider', { min: 0, max: 360, step: 15, unit: '°' }),
    p('glow', 'number', 0, '辉光强度 0–1', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('ring', 'boolean', false, '是否画出扩散光环', 'switch'),
    p('layer', '"front" | "back"', 'front', '火花层：front 在内容之上，back 在内容之下', 'select', { options: ['front', 'back'] }),
    p('disabled', 'boolean', false, '关闭点击触发', 'switch'),
    p('extraScale', 'number', 1, '扩散半径的额外倍率', 'slider', { min: 0.5, max: 3, step: 0.1 })
  ],
  events: [],
  expose: [{ name: 'spark', desc: '在组件内手动爆一次火花（参数为相对组件的坐标）' }]
}
