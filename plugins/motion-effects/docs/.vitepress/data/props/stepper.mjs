/** Stepper 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'Stepper',
  deps: ['@hugeicons/vue'],
  slot: '<template #step="{ index }">步骤 {{ index + 1 }}</template>',
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    steps: "步骤列表",
    indicator: "指示器样式",
    orientation: "布局方向",
    transition: "切换动画",
    linear: "线性模式",
    disableStepIndicators: "禁用指示器跳步",
    showFooter: "显示底部按钮",
    backButtonText: "上一步文案",
    nextButtonText: "下一步文案",
    completeButtonText: "完成文案",
    completedContent: "完成后的内容",
    theme: "主题",
    accentColor: "强调色",
    frame: "磨砂面板",
    radius: "面板圆角",
    width: "面板最大宽度",
    step: "当前步",
    initialStep: "起始步"
  },
  props: [
    p('steps', 'StepperStep[]', [], '步骤列表：{ title?, description?, icon?, content? }'),
    p('indicator', '"numbers" | "dots" | "bars"', 'numbers', '指示器样式', 'select', { options: [
          { value: 'numbers', label: '数字' },
          { value: 'dots', label: '圆点' },
          { value: 'bars', label: '条形' }
        ] }),
    p('orientation', '"horizontal" | "vertical"', 'horizontal', '布局：横向指示器在上，纵向指示器在左侧', 'select', { options: [{ value: 'horizontal', label: '横向' }, { value: 'vertical', label: '纵向' }] }),
    p('transition', '"slide" | "fade" | "none"', 'slide', '内容切换动画；高度始终会动', 'select', { options: [
          { value: 'slide', label: '滑动' },
          { value: 'fade', label: '淡入' },
          { value: 'none', label: '无动画' }
        ] }),
    p('linear', 'boolean', false, '只允许点回走过的步骤', 'switch'),
    p('disableStepIndicators', 'boolean', false, '禁止点击指示器跳步', 'switch'),
    p('showFooter', 'boolean', true, '显示上一步 / 下一步按钮', 'switch'),
    p('backButtonText', 'string', '上一步', '返回按钮文案', 'text'),
    p('nextButtonText', 'string', '下一步', '下一步按钮文案', 'text'),
    p('completeButtonText', 'string', '完成', '最后一步的下一步按钮文案', 'text'),
    p('completedContent', 'string', undefined, '最后一步之后展示的文案'),
    p('theme', '"dark" | "light"', 'dark', '面板与控件配色', 'select', { options: [{ value: 'dark', label: '深色' }, { value: 'light', label: '浅色' }] }),
    p('accentColor', 'string', undefined, '完成态、进度线与主按钮的颜色', 'color'),
    p('frame', 'boolean', true, '显示磨砂面板', 'switch'),
    p('radius', 'number', 24, '面板圆角（px）', 'slider', { min: 0, max: 48, step: 2, unit: 'px' }),
    p('width', 'number | string', 440, '面板最大宽度', 'number', { min: 280, max: 900, step: 20, unit: 'px' }),
    p('step', 'number', undefined, '当前步（v-model:step）'),
    p('initialStep', 'number', 1, '非受控时的起始步')
  ],
  events: [
    { name: 'update:step', args: '[step: number]', desc: '步序变化（配合 v-model:step）' },
    { name: 'step-change', args: '[step: number]', desc: '步序变化' },
    { name: 'final-step-completed', args: '[]', desc: '走完最后一步' }
  ]
}
