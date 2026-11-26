/** RubberSegment 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'RubberSegment',
  deps: [],
  slot: null,
  props: [
    p('size', '"sm" | "md" | "lg"', 'md', '控件尺寸', 'select', { options: ['sm', 'md', 'lg'] }),
    p('radius', 'number', 10, '轨道圆角', 'number', { min: 0, max: 30, step: 1, unit: 'px' }),
    p('inset', 'number', 3, '滑块与轨道的内缩', 'number', { min: 0, max: 10, step: 1, unit: 'px' }),
    p('equalSlots', 'boolean', true, '各选项等宽', 'switch'),
    p('stretch', 'number', 100, '交接动画的拉伸比例', 'slider', { min: 0, max: 200, step: 10 }),
    p('squash', 'number', 3, '落位时的挤压幅度', 'slider', { min: 0, max: 20, step: 1, unit: 'px' }),
    p('speed', 'number', 1, '动画速度倍率', 'slider', { min: 0.5, max: 3, step: 0.1 }),
    p('glide', 'number', 75, '甩动落点的投影距离', 'slider', { min: 0, max: 150, step: 5 }),
    p('draggable', 'boolean', true, '可拖拽滑块', 'switch'),
    p('disabled', 'boolean', false, '禁用', 'switch'),
    p('trackColor', 'string', '#27272a', '轨道颜色', 'color'),
    p('thumbColor', 'string', '#fafafa', '滑块颜色', 'color'),
    p('textColor', 'string', '#fafafa', '文字颜色', 'color'),
    p('activeTextColor', 'string', '#18181b', '选中项文字颜色', 'color'),
    p('ariaLabel', 'string', 'Segmented control', '无障碍标签'),
    p('defaultValue', 'string', undefined, '非受控时的初始值'),
    p('items', 'string[] | RubberSegmentItem[]', '[]', '{ value, label, icon? }；字符串自动展开为 value/label'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'update:modelValue', args: '[value: string]', desc: '配合 v-model 受控选中值' },
    { name: 'change', args: '[value: string, index: number]', desc: '对应 React 的 onChange' }
  ]
}
