/** GlassFolder 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'GlassFolder',
  deps: [],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    label: "文件夹名称",
    meta: "副标题",
    tone: "色调",
    art: "封面画预设",
    seed: "随机种子",
    image: "自定义封面图",
    action: "操作按钮",
    labelPlacement: "名称位置",
    width: "文件夹宽度",
    appear: "入场动画",
    appearDelay: "入场延时",
    files: "文件列表",
    menu: "菜单项",
    open: "展开状态",
    defaultOpen: "默认展开",
    className: "根类名"
  },
  props: [
    p('label', 'string', 'My Files', '正面标题', 'text'),
    p('meta', 'string', undefined, '第二行；默认按文件数量生成'),
    p('tone', '"light" | "dark"', 'light', '奶白 / 烟熏玻璃', 'select', { options: [{ value: 'light', label: '浅色' }, { value: 'dark', label: '深色' }] }),
    p('art', 'ArtPreset | ArtRecipe | "none"', 'aurora', '背板封面画；none 为纯磨砂', 'select', {
      options: [
          { value: 'aurora', label: '极光' },
          { value: 'ember', label: '余烬' },
          { value: 'dusk', label: '暮色' },
          { value: 'glacier', label: '冰川' },
          { value: 'verdant', label: '翠绿' },
          { value: 'none', label: '无' }
        ]
    }),
    p('seed', 'number', 3, '封面画随机种子', 'number', { min: 0, max: 99, step: 1 }),
    p('image', 'string', undefined, '自定义背板图片'),
    p('action', '"add" | "more" | "none"', 'add', '右下角按键行为', 'select', { options: [
          { value: 'add', label: '添加' },
          { value: 'more', label: '更多' },
          { value: 'none', label: '无' }
        ] }),
    p('labelPlacement', '"bottom-left" | "top-left" | "top-right"', 'bottom-left', '标签位置', 'select', {
      options: [
          { value: 'bottom-left', label: '左下' },
          { value: 'top-left', label: '左上' },
          { value: 'top-right', label: '右上' }
        ]
    }),
    p('width', 'number', 340, '文件夹宽度，高度按比例缩放', 'number', { min: 220, max: 520, step: 20, unit: 'px' }),
    p('appear', 'boolean', true, '首次滚入视口时组装入场', 'switch'),
    p('appearDelay', 'number', 0, '入场延迟', 'number', { min: 0, max: 2000, step: 100, unit: 'ms' }),
    p('files', 'GlassFolderFile[]', 'SAMPLE_FILES', '文件内容'),
    p('menu', 'GlassFolderMenuItem[]', '[]', 'more 菜单项'),
    p('open', 'boolean', undefined, '受控开合（v-model:open）'),
    p('defaultOpen', 'boolean', false, '非受控初始状态'),
    p('className', 'string', '', '根元素的额外 class')
  ],
  events: [
    { name: 'update:open', args: '[open: boolean]', desc: '配合 v-model:open 受控开合' },
    { name: 'files-change', args: '[files: GlassFolderFile[]]', desc: '文件内容变化' },
    { name: 'file-select', args: '[file, index]', desc: '选中文件' },
    { name: 'open-change', args: '[open: boolean]', desc: '对应 onOpenChange' }
  ]
}
