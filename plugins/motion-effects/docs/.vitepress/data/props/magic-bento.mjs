/** MagicBento 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'MagicBento',
  deps: [],
  slot: null,
  props: [
    p('theme', '"dark" | "light"', 'dark', '预设配色', 'select', { options: ['dark', 'light'] }),
    p('columns', 'number', 4, '网格列数', 'slider', { min: 1, max: 8, step: 1 }),
    p('rowHeight', 'number', 200, '行高', 'number', { min: 120, max: 400, step: 20, unit: 'px' }),
    p('gap', 'number', 12, '磁贴间距', 'slider', { min: 0, max: 40, step: 2, unit: 'px' }),
    p('radius', 'number', 20, '圆角', 'number', { min: 0, max: 60, step: 2, unit: 'px' }),
    p('spotlightRadius', 'number', 300, '聚光半径', 'slider', { min: 40, max: 600, step: 20, unit: 'px' }),
    p('particleCount', 'number', 24, '粒子数量（需 enableStars）', 'slider', { min: 0, max: 120, step: 4 }),
    p('textAutoHide', 'boolean', true, '小屏自动隐藏文字', 'switch'),
    p('enableBorderGlow', 'boolean', true, '边缘光', 'switch'),
    p('enableSpotlight', 'boolean', true, '指针聚光', 'switch'),
    p('enableStars', 'boolean', false, '粒子层', 'switch'),
    p('enableTilt', 'boolean', false, '指针倾斜', 'switch'),
    p('enableMagnetism', 'boolean', false, '文字磁吸', 'switch'),
    p('clickEffect', 'boolean', true, '点击波纹', 'switch'),
    p('intro', 'boolean', true, '入场动画', 'switch'),
    p('disableAnimations', 'boolean', false, '关闭全部动效', 'switch'),
    p('glowColor', 'string', undefined, '聚光 / 边框光颜色', 'color'),
    p('items', 'MagicBentoItem[]', 'DEFAULT_ITEMS', '磁贴数据，支持 colSpan / rowSpan / visual / image'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'item-click', args: '[item: MagicBentoItem, index: number]', desc: '点击磁贴' }
  ]
}
