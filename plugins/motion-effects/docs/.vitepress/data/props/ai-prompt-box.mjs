/** AIPromptBox 的 props 清单：Customize 面板、Props 表和用法代码都由它驱动。 */
import { p } from './define.mjs'

export default {
  component: 'AIPromptBox',
  deps: ['motion-v', '@lucide/vue'],
  slot: null,
  // 中文显示名：面板与属性表用它，prop.name 仍是真实属性名
  labels: {
    placeholder: "占位文案",
    isLoading: "生成中",
    disabled: "禁用",
    maxHeight: "输入框最大高度",
    showUpload: "显示上传按钮",
    showVoice: "显示语音按钮",
    showToggles: "显示模式开关",
    visualizerBars: "录音可视化柱数",
    accept: "接受的文件类型",
    maxFileSize: "单文件体积上限",
    modelValue: "输入文本",
    mode: "当前模式",
    labels: "文案覆盖"
  },
  props: [
    p('placeholder', 'string', 'Type your message here...', '默认占位文案；选中模式时改用对应模式的 placeholder', 'text'),
    p('isLoading', 'boolean', false, '生成中：输入框锁定、主按钮变停止', 'switch'),
    p('disabled', 'boolean', false, '禁用整个输入框', 'switch'),
    p('maxHeight', 'number | string', 240, '输入框最大高度，数字按 px 处理', 'number', { min: 80, max: 600, step: 20, unit: 'px' }),
    p('showUpload', 'boolean', true, '显示图片上传按钮', 'switch'),
    p('showVoice', 'boolean', true, '无内容时显示语音按钮', 'switch'),
    p('showToggles', 'boolean', true, '显示联网 / 思考 / 画板三个模式开关', 'switch'),
    p('visualizerBars', 'number', 32, '录音可视化柱数量', 'slider', { min: 8, max: 64, step: 4 }),
    p('accept', 'string', 'image/*', '文件选择框的 accept 规则', 'text'),
    p('maxFileSize', 'number', 10485760, '单文件体积上限（字节）', 'number', { min: 1024, max: 52428800, step: 1048576 }),
    p('modelValue', 'string', undefined, '输入文本（v-model）'),
    p('mode', '"search" | "think" | "canvas" | null', undefined, '当前模式（v-model:mode）'),
    p('labels', 'Partial<AIPromptBoxLabels>', undefined, '覆盖默认英文文案，例如中文界面')
  ],
  events: [
    { name: 'send', args: '[message: string, files: File[]]', desc: '发送文本或语音占位消息' },
    { name: 'stop', args: '[]', desc: '点击停止生成' },
    { name: 'files-change', args: '[files: File[]]', desc: '附件变化' },
    { name: 'file-error', args: '[reason, file]', desc: '文件被拒绝或读取失败' },
    { name: 'recording-start', args: '[]', desc: '开始录音' },
    { name: 'recording-stop', args: '[duration: number]', desc: '停止录音' },
    { name: 'mode-change', args: '[mode: AIPromptMode | null]', desc: '模式切换' }
  ]
}
