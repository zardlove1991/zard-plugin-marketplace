/** Signature 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'Signature',
  deps: [],
  slot: null,
  props: [
    p('mode', '"play" | "sign"', 'play', '播放示例笔迹或手写输入', 'select', { options: ['play', 'sign'] }),
    p('pen', '"fountain" | "ballpoint" | "marker"', 'fountain', '笔型：钢笔按下变粗、圆珠笔等宽、马克笔最粗', 'select', {
      options: ['fountain', 'ballpoint', 'marker']
    }),
    p('theme', '"auto" | "light" | "dark"', 'auto', 'auto 时从父元素背景色推断明暗', 'select', {
      options: ['auto', 'light', 'dark']
    }),
    p('text', 'string', undefined, '播放模式下写出这段文字，替代内置笔迹', 'text'),
    p('thickness', 'number', 1, '笔迹基础粗细倍率', 'slider', { min: 0.4, max: 3, step: 0.1 }),
    p('speed', 'number', 1, '播放速度', 'slider', { min: 0.25, max: 4, step: 0.25 }),
    p('autoplay', 'boolean', true, '滚入视口后自动播放', 'switch'),
    p('loop', 'boolean', false, '播放完后按 pause 间隔循环', 'switch'),
    p('pause', 'number', 2400, '循环间隔', 'number', { min: 200, max: 10000, step: 200, unit: 'ms' }),
    p('frame', 'boolean', true, '外层相框', 'switch'),
    p('line', 'boolean', true, '签名横线', 'switch'),
    p('intro', 'boolean', true, '入场过渡', 'switch'),
    p('aspect', 'number', 2.4, '画面宽高比；高度 = 720 / aspect', 'slider', { min: 1.5, max: 4, step: 0.1 }),
    p('name', 'string', undefined, '署名', 'text'),
    p('role', 'string', undefined, '署名下的身份说明', 'text'),
    p('placeholder', 'string', 'Sign here', '手写模式未落笔时的提示'),
    p('inkColor', 'string', undefined, '墨色', 'color'),
    p('surfaceColor', 'string', undefined, '相框底色', 'color'),
    p('strokes', 'SignatureStrokes', 'DEFAULT_STROKES', '归一化笔迹点数组（播放模式）'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'change', args: '[strokes: SignatureStrokes]', desc: '手写笔迹变化或清空时触发' },
    { name: 'complete', args: '[]', desc: '播放结束时触发' }
  ]
}
