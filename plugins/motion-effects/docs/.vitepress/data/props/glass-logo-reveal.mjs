/** GlassIconReveal 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'GlassIconReveal',
  deps: [],
  slot: null,
  props: [
    p('look', '"light" | "dark"', 'light', '浅色玻璃 / 深色带托板的玻璃', 'select', { options: ['light', 'dark'] }),
    p('logo', 'string', 'MARK_21ST', 'SVG 标记或图片 URL；GlassReveal21st 内置 21st 标记'),
    p('background', 'string', undefined, '背景色（画布会按它上色）', 'color'),
    p('logoColor', 'string', undefined, 'Logo 颜色', 'color'),
    p('plateColor', 'string', undefined, '托板颜色', 'color'),
    p('iconPlate', 'boolean', undefined, '显示 logo 背后的托板', 'switch'),
    p('keepPlate', 'boolean', undefined, '结束时保留托板', 'switch'),
    p('originalColors', 'boolean', undefined, '保留 logo 自身颜色', 'switch'),
    p('tileSize', 'number', undefined, '最大玻璃尺寸', 'number', { min: 120, max: 800, step: 20, unit: 'px' }),
    p('logoScale', 'number', undefined, 'Logo 相对玻璃的尺寸', 'slider', { min: 0.2, max: 1.2, step: 0.05 }),
    p('finalScale', 'number', undefined, '结束时的尺寸倍率', 'slider', { min: 0.4, max: 1.4, step: 0.05 }),
    p('loop', 'boolean', true, '循环播放', 'switch'),
    p('hold', 'number', undefined, '循环前的停留秒数', 'slider', { min: 0, max: 4, step: 0.1, unit: 's' }),
    p('speed', 'number', 1, '播放速度', 'slider', { min: 0.2, max: 3, step: 0.1 }),
    p('time', 'number', undefined, '冻结到指定秒数（滚动驱动 / 静态）'),
    p('label', 'string', 'Logo', '无障碍标签'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'click', args: '[event: MouseEvent]', desc: '点击时重播揭示动画' }
  ]
}
