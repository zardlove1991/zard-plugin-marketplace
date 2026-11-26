/** TiltedCard 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'TiltedCard',
  deps: [],
  slot: '<strong>Front face</strong>',
  props: [
    p('imageSrc', 'string', undefined, '正面图片地址；留空则用默认插槽内容', 'text'),
    p('altText', 'string', 'Tilted card image', '图片替代文本'),
    p('captionText', 'string', '', '悬停时跟随指针的提示文案'),
    p('containerWidth', 'number | string', '100%', '容器宽度'),
    p('containerHeight', 'number | string', '300px', '容器高度'),
    p('imageWidth', 'number | string', '300px', '卡片宽度'),
    p('imageHeight', 'number | string', '300px', '卡片高度'),
    p('scaleOnHover', 'number', 1.05, '悬停放大倍数', 'slider', { min: 1, max: 1.3, step: 0.01 }),
    p('rotateAmplitude', 'number', 12, '最大倾斜角', 'slider', { min: 0, max: 60, step: 1, unit: '°' }),
    p('smoothness', 'number', 0.6, '弹簧平滑度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('glare', 'number', 0.5, '眩光强度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('glareColor', 'string', '#ffffff', '眩光颜色', 'color'),
    p('shadow', 'number', 0.5, '投影强度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('parallax', 'number', 1, '图层视差强度', 'slider', { min: 0, max: 3, step: 0.1 }),
    p('radius', 'number', 15, '圆角', 'number', { min: 0, max: 60, step: 1, unit: 'px' }),
    p('perspective', 'number', 800, '透视距离', 'number', { min: 200, max: 2000, step: 100, unit: 'px' }),
    p('axis', '"both" | "horizontal" | "vertical"', 'both', '允许的旋转轴', 'select', {
      options: ['both', 'horizontal', 'vertical']
    }),
    p('reverse', 'boolean', false, '反转倾斜方向', 'switch'),
    p('floating', 'boolean', false, '无指针时自动漂浮', 'switch'),
    p('trackWindow', 'boolean', false, '跟随整窗指针', 'switch'),
    p('gyroscope', 'boolean', true, '触屏设备使用陀螺仪', 'switch'),
    p('intro', 'boolean', true, '滚入视口时播放入场', 'switch'),
    p('showTooltip', 'boolean', true, '显示跟随提示', 'switch'),
    p('flipOnClick', 'boolean', true, '点击翻面（需提供 #back 插槽）', 'switch'),
    p('displayOverlayContent', 'boolean', false, '显示浮层', 'switch'),
    p('overlayDepth', 'number', 30, '浮层深度', 'slider', { min: 0, max: 100, step: 5, unit: 'px' }),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'update:flipped', args: '[value: boolean]', desc: '配合 v-model:flipped 受控正反面' },
    { name: 'flip', args: '[value: boolean]', desc: '对应 React 的 onFlip' }
  ]
}
