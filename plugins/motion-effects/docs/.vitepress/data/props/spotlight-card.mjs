/**
 * SpotlightCard 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。
 * value 是组件的真实默认值；control 为空的 prop 只进 Props 表，不进 Customize。
 */
import { p } from './define.mjs'

export default {
  component: 'SpotlightCard',
  deps: [],
  slot: '<h3>Ethan Harrison</h3>',
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    theme: "主题",
    spotlightColor: "光斑颜色",
    intensity: "光斑强度",
    spotlightSize: "光斑半径",
    softness: "边缘柔和度",
    shape: "光斑形状",
    borderGlow: "边缘辉光",
    proximity: "邻近感应距离",
    smoothing: "跟随黏滞度",
    ambient: "环境漂移",
    flare: "按压膨胀",
    grain: "胶片颗粒"
  },
  props: [
    p('theme', '"dark" | "light"', 'dark', '卡片底色主题', 'select', { options: [{ value: 'dark', label: '深色' }, { value: 'light', label: '浅色' }] }),
    p('spotlightColor', 'string', '#ffffff', '光斑颜色；默认深色卡用白、浅色卡用近黑', 'color'),
    p('intensity', 'number', 0.15, '光斑强度', 'slider', { min: 0, max: 1, step: 0.01 }),
    p('spotlightSize', 'number', 240, '光斑半径', 'slider', { min: 80, max: 600, step: 10, unit: 'px' }),
    p('softness', 'number', 0.7, '光斑边缘的柔和程度', 'slider', { min: 0, max: 1, step: 0.01 }),
    p('shape', '"circle" | "beam"', 'circle', '圆形光斑，还是一条斜向光束', 'select', { options: [{ value: 'circle', label: '圆形' }, { value: 'beam', label: '光束' }] }),
    p('borderGlow', 'number', 0.6, '光斑靠近时边缘被照亮的程度；0 关闭', 'slider', { min: 0, max: 1, step: 0.01 }),
    p('proximity', 'number', 80, '指针离卡片多远以内，边缘提前亮起', 'slider', { min: 0, max: 240, step: 5, unit: 'px' }),
    p('smoothing', 'number', 0.3, '光斑落后指针的程度，越大越黏滞', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('ambient', 'boolean', false, '没有指针时光斑缓慢漂移', 'switch'),
    p('flare', 'boolean', true, '按住时光斑膨胀变亮', 'switch'),
    p('grain', 'number', 0, '胶片颗粒强度', 'slider', { min: 0, max: 1, step: 0.01 })
  ],
  events: []
}
