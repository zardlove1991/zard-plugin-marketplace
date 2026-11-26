/** ReflectiveCard 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'ReflectiveCard',
  deps: [],
  slot: '<h3>Alexander Doe</h3><p>Senior Developer</p>',
  props: [
    p('theme', '"dark" | "light"', 'dark', '预设配色', 'select', { options: ['dark', 'light'] }),
    p('name', 'string', 'Alexander Doe', '姓名', 'text'),
    p('role', 'string', 'Senior Developer', '身份', 'text'),
    p('badge', 'string', 'Verified', '认证徽标', 'text'),
    p('status', 'string', 'Active', '状态文案', 'text'),
    p('statusColor', 'string', '#22c55e', '状态色', 'color'),
    p('idLabel', 'string', 'ID number', '编号标题', 'text'),
    p('idValue', 'string', '8901 2345 6789', '编号', 'text'),
    p('width', 'number | string', 320, '卡片宽度', 'number', { min: 200, max: 520, step: 20, unit: 'px' }),
    p('height', 'number | string', 500, '卡片高度', 'number', { min: 300, max: 700, step: 20, unit: 'px' }),
    p('radius', 'number', 24, '圆角', 'number', { min: 0, max: 60, step: 2, unit: 'px' }),
    p('tint', 'string', '#ffffff', '金属色调', 'color'),
    p('metalness', 'number', 1, '金属感', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('roughness', 'number', 0.3, '粗糙度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('blurStrength', 'number', 6, '环境模糊', 'slider', { min: 0, max: 40, step: 1 }),
    p('grayscale', 'number', 1, '反射去色程度', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('warp', 'number', 0.6, '表面扭曲', 'slider', { min: 0, max: 2, step: 0.05 }),
    p('warpScale', 'number', 1, '扭曲尺度', 'slider', { min: 0.2, max: 4, step: 0.1 }),
    p('shine', 'number', 1, '高光强度', 'slider', { min: 0, max: 3, step: 0.1 }),
    p('bevel', 'number', 3, '倒角宽度', 'slider', { min: 0, max: 16, step: 1, unit: 'px' }),
    p('glare', 'number', 0.5, '指针眩光', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('enableTilt', 'boolean', true, '指针倾斜', 'switch'),
    p('tiltStrength', 'number', 12, '最大倾角', 'slider', { min: 0, max: 30, step: 1, unit: '°' }),
    p('intro', 'boolean', true, '入场动画', 'switch'),
    p('videoSrc', 'string', undefined, '反射源视频（同源或 CORS）'),
    p('webcam', 'boolean', false, '用摄像头作为反射源', 'switch'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'webcam-error', args: '[error: Error]', desc: '摄像头不可用或被拒绝' }
  ]
}
