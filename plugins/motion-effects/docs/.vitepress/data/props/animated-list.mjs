/** AnimatedList 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'AnimatedList',
  deps: [],
  slot: '<strong>Brand assets</strong><span>24 files</span>',
  props: [
    p('animation', '"pop" | "slide" | "fade" | "none"', 'pop', '逐项入场形态；none 关掉入场动画并立即显示全部', 'select', {
      options: ['pop', 'slide', 'fade', 'none']
    }),
    p('theme', '"dark" | "light"', 'dark', '预设配色', 'select', { options: ['dark', 'light'] }),
    p('width', 'number | string', 420, '列表宽度；数字按 px 处理', 'number', { min: 200, max: 560, step: 20, unit: 'px' }),
    p('maxHeight', 'number | string', 440, '滚动视口的最大高度', 'number', { min: 180, max: 640, step: 20, unit: 'px' }),
    p('radius', 'number', 14, '条目圆角', 'number', { min: 0, max: 40, step: 2, unit: 'px' }),
    p('gap', 'number', 8, '条目间距', 'slider', { min: 0, max: 24, step: 2, unit: 'px' }),
    p('fadeSize', 'number', 56, '上下渐隐遮罩的高度', 'slider', { min: 0, max: 120, step: 8, unit: 'px' }),
    p('stagger', 'number', 0.05, '入场时逐项延迟', 'slider', { min: 0, max: 0.2, step: 0.01, unit: 's' }),
    p('selectOnHover', 'boolean', true, '指针经过条目时把它设为选中项', 'switch'),
    p('enableArrowNavigation', 'boolean', true, '上下 / Home / End 键切换选中项', 'switch'),
    p('loop', 'boolean', false, '键盘导航到头后从另一端继续', 'switch'),
    p('animateOnce', 'boolean', false, '滚入过的条目不再重新播放入场', 'switch'),
    p('showGradients', 'boolean', true, '滚动视口上下加渐隐遮罩', 'switch'),
    p('displayScrollbar', 'boolean', true, '显示滚动条', 'switch'),
    p('frame', 'boolean', true, '外层玻璃边框', 'switch'),
    p('initialSelectedIndex', 'number', -1, '非受控的初始选中项', 'number', { min: -1, max: 14, step: 1 }),
    p('accentColor', 'string', undefined, '选中环与焦点描边的颜色', 'color'),
    p('items', 'AnimatedListItem[]', 'ANIMATED_LIST_ITEMS', '条目列表：字符串或 { id?, icon?, image?, title, description?, meta? }；icon 传 Vue 组件'),
    p('itemClassName', 'string', '', '每个条目的额外 class'),
    p('className', 'string', '', '根元素的额外 class'),
    p('style', 'object', '{}', '根元素的内联样式')
  ],
  events: [
    { name: 'select', args: '[item: AnimatedListItem, index: number]', desc: '点击条目或聚焦列表后按 Enter 触发' }
  ]
}
