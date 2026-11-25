/**
 * TerminalReplay 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。
 * value 是组件的真实默认值；control 为空的 prop 只进 Props 表，不进 Customize。
 */
import { p } from './define.mjs'

export default {
  component: 'TerminalReplay',
  deps: [],
  slot: null,
  props: [
    p('title', 'string', 'weiliantong — zsh', '窗口标题栏文案', 'text'),
    p('prompt', 'string', '❯', '命令提示符', 'text'),
    p('directory', 'string', '~', '每条命令前显示的目录', 'text'),
    p('chrome', '"window" | "minimal" | "none"', 'window', '窗口装饰：完整标题栏 / 只有标题 / 都不要', 'select', { options: ['window', 'minimal', 'none'] }),
    p('frame', '"solid" | "inset"', 'inset', '屏幕区是嵌在框里，还是通铺到底', 'select', { options: ['solid', 'inset'] }),
    p('dots', '"mono" | "color"', 'mono', '左上角三个圆点：单色还是红黄绿', 'select', { options: ['mono', 'color'] }),
    p('theme', '"auto" | "light" | "dark"', 'auto', '配色：跟随系统或固定明暗', 'select', { options: ['auto', 'light', 'dark'] }),
    p('accentColor', 'string', '#2563eb', '提示符、光标与状态标签的强调色', 'color'),
    p('fontSize', 'number', 13, '正文字号', 'slider', { min: 11, max: 18, step: 0.5, unit: 'px' }),
    p('lineHeight', 'number', 1.7, '行高倍数', 'slider', { min: 1.3, max: 2.2, step: 0.05 }),
    p('height', 'number', 360, '终端窗口高度', 'slider', { min: 220, max: 640, step: 10, unit: 'px' }),
    p('radius', 'number', 16, '圆角半径', 'slider', { min: 0, max: 32, step: 1, unit: 'px' }),
    p('typingSpeed', 'number', 26, '每个字符的打字间隔', 'slider', { min: 6, max: 80, step: 1, unit: 'ms' }),
    p('variance', 'number', 0.5, '打字间隔的随机抖动，让节奏不像机器', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('lineDelay', 'number', 70, '输出行之间的间隔', 'slider', { min: 0, max: 400, step: 10, unit: 'ms' }),
    p('startDelay', 'number', 700, '开始播放前等多久', 'slider', { min: 0, max: 2000, step: 50, unit: 'ms' }),
    p('hold', 'number', 3200, '播完后停留多久再循环', 'slider', { min: 400, max: 8000, step: 100, unit: 'ms' }),
    p('loop', 'boolean', true, '播完后从头循环', 'switch'),
    p('autoplay', 'boolean', true, '只决定离开视口时是否暂停；挂载即开始播放', 'switch'),
    p('cursor', '"block" | "bar" | "underline"', 'block', '光标形态', 'select', { options: ['block', 'bar', 'underline'] }),
    p('copyable', 'boolean', true, '悬停命令行时显示复制按钮', 'switch'),
    p('interactive', 'boolean', true, '可聚焦；点击或回车 / 空格跳过当前步骤，播完后重播', 'switch'),
    p('script', 'TerminalStep[]', 'PROJECT_SETUP_SCRIPT', '回放脚本：command / output / spinner / progress / pause / clear', null, { usage: false }),
    p('windowColor', 'string', undefined, '屏幕底色；默认跟随主题'),
    p('textColor', 'string', undefined, '正文颜色；默认跟随主题'),
    p('fontFamily', 'string', undefined, '等宽字体栈')
  ],
  events: [{ name: 'complete', args: '[]', desc: '一轮脚本播完时触发（循环模式下每轮一次）' }],
  expose: [{ name: 'play', desc: '通过 ref 调用，从头重播' }]
}
