/** PillNav 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'PillNav',
  deps: [],
  slot: null,
  props: [
    p('theme', '"dark" | "light"', 'dark', '预设配色', 'select', { options: ['dark', 'light'] }),
    p('size', '"sm" | "md" | "lg"', 'md', '导航尺寸', 'select', { options: ['sm', 'md', 'lg'] }),
    p('layout', '"split" | "joined"', 'split', 'logo 与胶囊是否合为一体', 'select', { options: ['split', 'joined'] }),
    p('surface', '"glass" | "solid" | "none"', 'glass', '表面材质', 'select', { options: ['glass', 'solid', 'none'] }),
    p('itemStyle', '"pill" | "underline"', 'pill', '条目样式', 'select', { options: ['pill', 'underline'] }),
    p('hoverEffect', '"fill" | "glide"', 'fill', '悬停效果：填充或滑动', 'select', { options: ['fill', 'glide'] }),
    p('indicator', '"dot" | "pill"', 'dot', '当前项指示器', 'select', { options: ['dot', 'pill'] }),
    p('collapse', '"auto" | "always" | "never"', 'auto', '窄屏折叠策略', 'select', { options: ['auto', 'always', 'never'] }),
    p('bounce', 'number', 0.3, '指示条弹性', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('stretch', 'number', 0.5, '指示条前后缘拉伸', 'slider', { min: 0, max: 1, step: 0.05 }),
    p('intro', 'boolean', true, '入场动画', 'switch'),
    p('logo', 'string', undefined, 'logo 图片地址；也可用 #logo 插槽'),
    p('logoAlt', 'string', 'Logo', 'logo 替代文本'),
    p('items', 'PillNavItem[]', 'DEFAULT_ITEMS', '{ label, href?, icon?, ariaLabel? }'),
    p('activeHref', 'string', undefined, '当前项 href（v-model:activeHref）'),
    p('defaultActiveIndex', 'number', 0, '非受控时的初始项'),
    p('highlightColor', 'string', undefined, '高亮色', 'color'),
    p('highlightTextColor', 'string', undefined, '高亮文字色', 'color'),
    p('barColor', 'string', undefined, '轨道底色', 'color'),
    p('textColor', 'string', undefined, '文字颜色', 'color'),
    p('ariaLabel', 'string', 'Main', '无障碍标签'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'update:activeHref', args: '[href: string]', desc: '配合 v-model:activeHref 受控当前项' },
    { name: 'item-click', args: '[item, index, event]', desc: '点击条目' },
    { name: 'menu-toggle', args: '[open: boolean]', desc: '折叠菜单开合' }
  ]
}
