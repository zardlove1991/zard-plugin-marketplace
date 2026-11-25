/**
 * SwipeRow 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。
 * value 是组件的真实默认值；control 为空的 prop 只进 Props 表，不进 Customize。
 */
import { p } from './define.mjs'

export default {
  component: 'SwipeRow',
  deps: [],
  slot: '<div>Design review notes</div>',
  props: [
    p('height', 'number', 64, '行高', 'slider', { min: 44, max: 96, step: 2, unit: 'px' }),
    p('radius', 'number', 16, '圆角半径', 'slider', { min: 0, max: 28, step: 1, unit: 'px' }),
    p('actionWidth', 'number', 80, '每个操作按钮的宽度', 'slider', { min: 56, max: 140, step: 2, unit: 'px' }),
    p('direction', '"left" | "right"', 'left', 'left：向左滑出，操作区在右侧；right 相反', 'select', { options: ['left', 'right'] }),
    p('actionColor', 'string', '#e5484d', '主操作按钮的颜色', 'color'),
    p('drawerColor', 'string', '#3f3f46', '操作区抽屉的底色', 'color'),
    p('rowColor', 'string', '#27272a', '行内容的底色', 'color'),
    p('textColor', 'string', '#f5f5f5', '行文字颜色', 'color'),
    p('snapBounce', 'number', 0.2, '吸附到展开位时的回弹幅度', 'slider', { min: 0, max: 0.6, step: 0.01 }),
    p('resistance', 'number', 0.55, '反向拖拽与越过边界时的阻力', 'slider', { min: 0.1, max: 0.95, step: 0.01 }),
    p('collapseMs', 'number', 200, '整行提交后收起行的时长', 'slider', { min: 80, max: 600, step: 10, unit: 'ms' }),
    p('commitAt', 'number', 0.6, '拖到操作区宽度的多少比例算整行提交', 'slider', { min: 0.3, max: 1, step: 0.01 }),
    p('fullSwipe', 'boolean', true, '允许一直拖到底提交整行', 'switch'),
    p('closeOnAction', 'boolean', true, '点击操作后收起抽屉', 'switch'),
    p('haptic', 'boolean', true, '到位时调用 navigator.vibrate（不支持则静默）', 'switch'),
    p('disabled', 'boolean', false, '禁用滑动与键盘操作', 'switch')
  ],
  events: [
    { name: 'update:open', args: '[open: boolean]', desc: '配合 v-model:open 受控展开状态' },
    { name: 'open-change', args: '[open: boolean]', desc: '展开状态变化（React 式事件）' },
    { name: 'action', args: '[action: SwipeAction]', desc: '点击了某个操作' },
    { name: 'commit', args: '[action: SwipeAction]', desc: '整行滑到底提交；从数据里移除该行由父级完成' }
  ]
}
