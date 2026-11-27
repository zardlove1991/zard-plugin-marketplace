/** GridMotion 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'GridMotion',
  deps: [],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    rows: "行数",
    aspectRatio: "格子宽高比",
    gap: "间距",
    radius: "圆角",
    angle: "倾斜角度",
    tilt: "透视倾斜",
    speed: "滚动速度",
    direction: "滚动方向",
    parallax: "视差强度",
    spotlight: "聚光强度",
    dim: "暗化程度",
    fade: "边缘渐隐",
    grayscale: "灰度",
    theme: "主题",
    items: "内容列表",
    tileColor: "文字块颜色",
    textColor: "文字颜色",
    className: "根类名",
    style: "行内样式"
  },
  props: [
    p('rows', 'number', 4, '行数，夹在 1–12', 'slider', { min: 1, max: 12, step: 1 }),
    p('aspectRatio', 'number', 1.33, '单个格子的宽高比', 'slider', { min: 0.5, max: 3, step: 0.05 }),
    p('gap', 'number', 16, '格子间距', 'slider', { min: 0, max: 48, step: 2, unit: 'px' }),
    p('radius', 'number', 14, '格子圆角', 'number', { min: 0, max: 40, step: 2, unit: 'px' }),
    p('angle', 'number', -12, '整面的旋转角', 'slider', { min: -45, max: 45, step: 1, unit: '°' }),
    p('tilt', 'number', 0, '前后倾斜角；大于 0 时启用透视', 'slider', { min: 0, max: 75, step: 1, unit: '°' }),
    p('speed', 'number', 24, '滚动速度', 'slider', { min: 0, max: 120, step: 2 }),
    p('direction', '"alternate" | "left" | "right"', 'alternate', '漂移方向；alternate 为相邻行反向', 'select', {
      options: [
          { value: 'alternate', label: '往返' },
          { value: 'left', label: '向左' },
          { value: 'right', label: '向右' }
        ]
    }),
    p('parallax', 'number', 0.5, '指针视差强度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('spotlight', 'number', 0.6, '聚光强度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('dim', 'number', 0.35, '非聚光区域的暗化', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('fade', 'number', 0.5, '四边羽化强度；0 关闭', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('grayscale', 'boolean', false, '非聚光区域去色', 'switch'),
    p('theme', '"dark" | "light"', 'dark', '预设配色', 'select', { options: [{ value: 'dark', label: '深色' }, { value: 'light', label: '浅色' }] }),
    p('items', 'GridMotionItem[]', '[]', '字符串 / { src, alt }；节点用 #tile 插槽'),
    p('tileColor', 'string', undefined, '格子底色', 'color'),
    p('textColor', 'string', undefined, '文字颜色', 'color'),
    p('className', 'string', '', '根元素的额外 class'),
    p('style', 'object', '{}', '根元素的内联样式')
  ]
}
