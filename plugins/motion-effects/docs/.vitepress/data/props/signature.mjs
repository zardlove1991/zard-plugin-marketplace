/** Signature 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'Signature',
  deps: [],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    mode: "模式",
    pen: "笔型",
    theme: "主题",
    text: "文字内容",
    thickness: "笔画粗细",
    speed: "书写速度",
    autoplay: "自动播放",
    loop: "循环播放",
    pause: "暂停时长",
    frame: "显示边框",
    line: "显示基线",
    intro: "入场动画",
    aspect: "画布宽高比",
    name: "姓名",
    role: "职位",
    placeholder: "占位文案",
    inkColor: "墨色",
    surfaceColor: "底色",
    strokes: "笔迹数据",
    className: "根类名"
  },
  props: [
    p('mode', '"play" | "sign"', 'play', '播放示例笔迹或手写输入', 'select', { options: [{ value: 'play', label: '播放笔迹' }, { value: 'sign', label: '手写' }] }),
    p('pen', '"fountain" | "ballpoint" | "marker"', 'fountain', '笔型：钢笔按下变粗、圆珠笔等宽、马克笔最粗', 'select', {
      options: [
          { value: 'fountain', label: '钢笔' },
          { value: 'ballpoint', label: '圆珠笔' },
          { value: 'marker', label: '马克笔' }
        ]
    }),
    p('theme', '"auto" | "light" | "dark"', 'auto', 'auto 时从父元素背景色推断明暗', 'select', {
      options: [
          { value: 'auto', label: '自动' },
          { value: 'light', label: '浅色' },
          { value: 'dark', label: '深色' }
        ]
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
