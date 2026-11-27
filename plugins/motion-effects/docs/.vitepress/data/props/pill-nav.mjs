/** PillNav 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'PillNav',
  deps: [],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    theme: "主题",
    size: "尺寸",
    layout: "布局方式",
    surface: "表面样式",
    itemStyle: "条目样式",
    hoverEffect: "悬停效果",
    indicator: "指示器样式",
    collapse: "折叠策略",
    bounce: "回弹幅度",
    stretch: "拉伸幅度",
    intro: "入场动画",
    logo: "Logo 图片",
    logoAlt: "Logo 替代文本",
    items: "导航项",
    activeHref: "当前项",
    defaultActiveIndex: "默认选中项",
    highlightColor: "高亮色",
    highlightTextColor: "高亮文字色",
    barColor: "轨道颜色",
    textColor: "文字颜色",
    ariaLabel: "无障碍名称",
    className: "根类名"
  },
  props: [
    p('theme', '"dark" | "light"', 'dark', '预设配色', 'select', { options: [{ value: 'dark', label: '深色' }, { value: 'light', label: '浅色' }] }),
    p('size', '"sm" | "md" | "lg"', 'md', '导航尺寸', 'select', { options: [{ value: 'sm', label: '小' }, { value: 'md', label: '中' }, { value: 'lg', label: '大' }] }),
    p('layout', '"split" | "joined"', 'split', 'logo 与胶囊是否合为一体', 'select', { options: [{ value: 'split', label: '左右分置' }, { value: 'joined', label: '连体' }] }),
    p('surface', '"glass" | "solid" | "none"', 'glass', '表面材质', 'select', { options: [
          { value: 'glass', label: '玻璃' },
          { value: 'solid', label: '实心' },
          { value: 'none', label: '无' }
        ] }),
    p('itemStyle', '"pill" | "underline"', 'pill', '条目样式', 'select', { options: [{ value: 'pill', label: '胶囊' }, { value: 'underline', label: '下划线' }] }),
    p('hoverEffect', '"fill" | "glide"', 'fill', '悬停效果：填充或滑动', 'select', { options: [{ value: 'fill', label: '填充' }, { value: 'glide', label: '滑行' }] }),
    p('indicator', '"dot" | "pill"', 'dot', '当前项指示器', 'select', { options: [{ value: 'dot', label: '圆点' }, { value: 'pill', label: '胶囊' }] }),
    p('collapse', '"auto" | "always" | "never"', 'auto', '窄屏折叠策略', 'select', { options: [
          { value: 'auto', label: '自动' },
          { value: 'always', label: '总是' },
          { value: 'never', label: '从不' }
        ] }),
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
