/**
 * SpecularButton 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。
 * value 是组件的真实默认值；control 为空的 prop 只进 Props 表，不进 Customize。
 */
import { p } from './define.mjs'

export default {
  component: 'SpecularButton',
  deps: [],
  slot: 'Get Started',
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    size: "尺寸",
    radius: "圆角",
    tint: "高光色调",
    tintOpacity: "色调透明度",
    blur: "模糊强度",
    textColor: "文字颜色",
    lineColor: "描边颜色",
    baseColor: "底色",
    intensity: "高光强度",
    idleIntensity: "静置强度",
    shineSize: "高光宽度",
    shineFade: "高光衰减",
    thickness: "描边粗细",
    glow: "外发光",
    speed: "扫光速度",
    followMouse: "跟随鼠标",
    proximity: "鼠标邻近距离",
    autoAnimate: "自动扫光",
    disabled: "禁用",
    type: "按钮类型"
  },
  props: [
    p('size', '"sm" | "md" | "lg"', 'lg', '尺寸预设', 'select', { options: [{ value: 'sm', label: '小' }, { value: 'md', label: '中' }, { value: 'lg', label: '大' }] }),
    p('radius', 'number', 18, '圆角半径', 'slider', { min: 0, max: 36, step: 1, unit: 'px' }),
    p('tint', 'string', '#ffffff', '高光颜色', 'color'),
    p('tintOpacity', 'number', 0.04, '按钮内部着色的不透明度', 'slider', { min: 0, max: 0.3, step: 0.005 }),
    p('blur', 'number', 0, '高光的模糊半径', 'slider', { min: 0, max: 20, step: 0.5, unit: 'px' }),
    p('textColor', 'string', '#f5f5f5', '文字颜色', 'color'),
    p('lineColor', 'string', '#ffffff', '描边线的颜色', 'color'),
    p('baseColor', 'string', '#525252', '按钮基色', 'color'),
    p('intensity', 'number', 1, '高光强度', 'slider', { min: 0, max: 3, step: 0.05 }),
    p('idleIntensity', 'number', 0.35, '没有高光时的静息亮度', 'slider', { min: 0, max: 1, step: 0.01 }),
    p('shineSize', 'number', 10, '高光带的宽度', 'slider', { min: 2, max: 40, step: 1 }),
    p('shineFade', 'number', 34, '高光带边缘的衰减距离', 'slider', { min: 4, max: 80, step: 1 }),
    p('thickness', 'number', 1.2, '描边粗细', 'slider', { min: 0.4, max: 4, step: 0.1, unit: 'px' }),
    p('glow', 'number', 1, '高光向外泛光的强度；0 关闭', 'slider', { min: 0, max: 3, step: 0.05 }),
    p('speed', 'number', 0.35, '自动扫光的速度', 'slider', { min: 0.05, max: 2, step: 0.05 }),
    p('followMouse', 'boolean', true, '高光跟随鼠标', 'switch'),
    p('proximity', 'number', 250, '鼠标离按钮多远以内开始跟随', 'slider', { min: 40, max: 600, step: 10, unit: 'px' }),
    p('autoAnimate', 'boolean', false, '没有鼠标时自动扫光（触屏、展台场景）', 'switch', { demo: true }),
    p('disabled', 'boolean', false, '禁用按钮', 'switch'),
    p('type', '"button" | "submit" | "reset"', 'button', '原生按钮类型', null, { usage: false })
  ],
  events: [{ name: 'click', args: '[event: MouseEvent]', desc: '透传的原生点击事件' }]
}
