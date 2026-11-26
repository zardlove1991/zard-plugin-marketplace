/** GhostCursor 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'GhostCursor',
  deps: [],
  slot: null,
  props: [
    p('color', 'string', '#B497CF', '光标颜色（自动做 2.2 次幂的线性化）', 'color'),
    p('theme', '"dark" | "light"', 'dark', '暗色是发光墨迹，亮色是吸收型墨迹', 'select', { options: ['dark', 'light'] }),
    p('size', 'number', 80, '光标半径，越大拖尾越粗', 'slider', { min: 20, max: 200, step: 10, unit: 'px' }),
    p('trailLength', 'number', 50, '拖尾保留时间', 'slider', { min: 1, max: 200, step: 5 }),
    p('inertia', 'number', 0.5, '惯性；越大跟手越松', 'slider', { min: 0, max: 0.99, step: 0.05 }),
    p('turbulence', 'number', 0.5, '涡流强度', 'slider', { min: 0, max: 2, step: 0.1 }),
    p('drift', 'number', 0.3, '背景流动速度', 'slider', { min: -1, max: 1, step: 0.1 }),
    p('detail', 'number', 1, '烟雾细节强度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('grainIntensity', 'number', 0.05, '颗粒强度', 'slider', { min: 0, max: 0.4, step: 0.01 }),
    p('bloomStrength', 'number', 0.6, '辉光强度', 'slider', { min: 0, max: 2, step: 0.1 }),
    p('bloomRadius', 'number', 1, '辉光扩散半径', 'slider', { min: 0, max: 3, step: 0.1 }),
    p('bloomThreshold', 'number', 0.025, '第一级 bloom 的亮度阈值', 'slider', { min: 0, max: 0.2, step: 0.005 }),
    p('edgeIntensity', 'number', 0, '四周的暗角强度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('brightness', 'number', 1, '整体亮度', 'slider', { min: 0, max: 3, step: 0.1 }),
    p('clickPuff', 'boolean', true, '按下时喷一团墨', 'switch'),
    p('intro', 'boolean', true, '首次挂载时自动画一笔', 'switch'),
    p('zIndex', 'number', 10, '根元素层级', 'number', { min: 0, max: 100, step: 1 }),
    p('maxDevicePixelRatio', 'number', 2, 'DPR 上限；弱机可降到 1–1.5', 'slider', { min: 0.25, max: 3, step: 0.25 }),
    p('mixBlendMode', 'string', undefined, 'canvas 的混合模式；默认暗色 screen / 亮色 normal'),
    p('fadeDelayMs', 'number', undefined, '指针静止多久后开始淡出'),
    p('fadeDurationMs', 'number', undefined, '淡出时长'),
    p('targetPixels', 'number', undefined, 'shade 通道的像素预算，越小越省 GPU'),
    p('className', 'string', '', '根元素的额外 class'),
    p('style', 'object', '{}', '根元素的内联样式')
  ]
}
