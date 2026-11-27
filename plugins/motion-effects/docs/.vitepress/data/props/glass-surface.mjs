/**
 * GlassSurface 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。
 * value 是组件的真实默认值，demo 是预览台的初始值。
 */
import { p } from './define.mjs'

export default {
  component: 'GlassSurface',
  deps: [],
  slot: '<strong>折射玻璃面板</strong>',
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    width: "面板宽度",
    height: "面板高度",
    borderRadius: "圆角",
    borderWidth: "描边粗细",
    blur: "模糊强度",
    displace: "置换强度",
    brightness: "亮度",
    opacity: "不透明度",
    backgroundOpacity: "背景不透明度",
    saturation: "饱和度",
    distortionScale: "扭曲强度",
    redOffset: "红色通道偏移",
    greenOffset: "绿色通道偏移",
    blueOffset: "蓝色通道偏移",
    xChannel: "X 通道",
    yChannel: "Y 通道",
    refraction: "启用折射",
    renderer: "渲染路径",
    backdrop: "背后画面",
    shape: "自定义形状",
    className: "根类名",
    style: "行内样式"
  },
  props: [
    p('width', 'number | string', 200, '面板宽度；数字按 px 处理，字符串（如 "60%"）原样使用', 'number', { demo: 320, min: 80, max: 480, step: 10, unit: 'px' }),
    p('height', 'number | string', 80, '面板高度；数字按 px 处理', 'number', { demo: 190, min: 40, max: 360, step: 10, unit: 'px' }),
    p('borderRadius', 'number', 20, '圆角，单位 px', 'number', { min: 0, max: 120, step: 2, unit: 'px' }),
    p('borderWidth', 'number', 0.07, '边缘折射带的宽度，取容器短边的该比例', 'slider', { min: 0, max: 0.25, step: 0.01 }),
    p('blur', 'number', 11, '置换贴图的高斯模糊半径，越大边缘越柔', 'slider', { min: 0, max: 30, step: 1 }),
    p('displace', 'number', 0, '色散扩散强度；0 走单点采样，大于 0 做 5×5 加权采样', 'slider', { demo: 0.35, min: 0, max: 2, step: 0.05 }),
    p('brightness', 'number', 50, '边缘描边的明度（hsl 的 lightness）', 'slider', { min: 0, max: 100, step: 1 }),
    p('opacity', 'number', 0.93, '边缘描边的不透明度', 'slider', { min: 0, max: 1, step: 0.01 }),
    p('backgroundOpacity', 'number', 0, '玻璃自身底色（--glass-frost）', 'slider', { demo: 0.08, min: 0, max: 0.6, step: 0.01 }),
    p('saturation', 'number', 1, '饱和度；0 为灰度', 'slider', { min: 0, max: 2, step: 0.05 }),
    p('distortionScale', 'number', -180, '基础折射位移，负值把背景向内拉', 'number', { min: -400, max: 400, step: 10 }),
    p('redOffset', 'number', 0, '红通道在 distortionScale 上的额外偏移', 'number', { min: -200, max: 200, step: 5 }),
    p('greenOffset', 'number', 10, '绿通道在 distortionScale 上的额外偏移', 'number', { min: -200, max: 200, step: 5 }),
    p('blueOffset', 'number', 20, '蓝通道在 distortionScale 上的额外偏移', 'number', { min: -200, max: 200, step: 5 }),
    p('xChannel', '"R" | "G" | "B" | "A"', 'R', '置换贴图的横向取样通道', 'select', { options: [
          { value: 'R', label: '红' },
          { value: 'G', label: '绿' },
          { value: 'B', label: '蓝' },
          { value: 'A', label: '透明通道' }
        ] }),
    p('yChannel', '"R" | "G" | "B" | "A"', 'G', '置换贴图的纵向取样通道', 'select', { options: [
          { value: 'R', label: '红' },
          { value: 'G', label: '绿' },
          { value: 'B', label: '蓝' },
          { value: 'A', label: '透明通道' }
        ] }),
    p('refraction', 'boolean', true, '是否做折射；关掉就是雾面玻璃', 'switch'),
    p('renderer', '"auto" | "webgl" | "svg"', 'auto', '渲染路径；auto 在 Chromium 用 SVG，其余浏览器有 backdrop 时用 WebGL2', 'select', {
      options: [
          { value: 'auto', label: '自动' },
          { value: 'webgl', label: 'WebGL 渲染' },
          { value: 'svg', label: 'SVG 滤镜' }
        ]
    }),
    p('backdrop', 'HTMLElement | Ref', null, '背后的图片 / 视频 / canvas 或其模板 ref；WebGL2 路径需要它'),
    p('shape', 'string', null, '同源轮廓图（data URL 或图片地址），从 alpha 通道描出描边与发光'),
    p('className', 'string', '', '额外的根元素 class'),
    p('style', 'object', '{}', '根元素的内联样式')
  ]
}
