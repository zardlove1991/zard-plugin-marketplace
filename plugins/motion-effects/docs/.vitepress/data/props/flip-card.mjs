/** FlipCard 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'FlipCard',
  deps: [],
  slot: '<strong>Front face</strong>',
  props: [
    p('axis', '"x" | "y"', 'y', '翻转轴', 'select', { options: ['y', 'x'] }),
    p('defaultFlipped', 'boolean', false, '非受控时的初始面', 'switch'),
    p('width', 'number', 300, '卡片宽度', 'number', { min: 160, max: 480, step: 20, unit: 'px' }),
    p('height', 'number', 400, '卡片高度', 'number', { min: 200, max: 560, step: 20, unit: 'px' }),
    p('radius', 'number', 22, '圆角', 'number', { min: 0, max: 60, step: 2, unit: 'px' }),
    p('tiltMax', 'number', 12, '悬停倾斜的最大角度', 'slider', { min: 0, max: 30, step: 1, unit: '°' }),
    p('glareOpacity', 'number', 0.22, '眩光强度', 'slider', { min: 0, max: 0.6, step: 0.02 }),
    p('hoverScale', 'number', 1.03, '悬停时的放大倍数', 'slider', { min: 1, max: 1.2, step: 0.01 }),
    p('perspective', 'number', 1100, '透视距离，越小 3D 感越强', 'number', { min: 400, max: 2000, step: 100, unit: 'px' }),
    p('stiffness', 'number', 170, '翻面弹簧刚度', 'slider', { min: 60, max: 400, step: 10 }),
    p('damping', 'number', 20, '翻面弹簧阻尼', 'slider', { min: 5, max: 50, step: 1 }),
    p('dragDistance', 'number', 0, '拖拽量程；0 时用宽 / 高', 'number', { min: 0, max: 600, step: 20, unit: 'px' }),
    p('flipOnClick', 'boolean', true, '轻点（未拖动）时翻面', 'switch'),
    p('draggable', 'boolean', true, '按住拖拽甩动翻面', 'switch'),
    p('tilt', 'boolean', true, '指针跟随的倾斜', 'switch'),
    p('glare', 'boolean', true, '跟随指针的眩光', 'switch'),
    p('shadow', 'boolean', true, '卡片投影', 'switch'),
    p('disabled', 'boolean', false, '禁用交互', 'switch'),
    p('background', 'string', '#27272a', '卡片底色', 'color'),
    p('color', 'string', '#f5f5f5', '卡片文字色', 'color'),
    p('shadowColor', 'string', '#000000', '投影颜色', 'color'),
    p('shadowOpacity', 'number', 0.45, '投影不透明度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('ariaLabel', 'string', 'Flip card', '无障碍标签'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'update:flipped', args: '[value: boolean]', desc: '配合 v-model:flipped 受控正反面' },
    { name: 'flip-change', args: '[value: boolean]', desc: '对应 React 的 onFlipChange' }
  ]
}
