/**
 * 用法代码的生成与高亮：不解析字符串，直接按 props 清单和当前值拼出带类型的 token。
 * token 类名沿用 landing.css 里的 .tok-kw / .tok-tag / .tok-attr / .tok-str / .tok-val。
 */
import { computed, ref, type ComputedRef } from 'vue'

export type Tok = [cls: string, text: string]

const kw = (v: string): Tok => ['kw', v]
const tag = (v: string): Tok => ['tag', v]
const attr = (v: string): Tok => ['attr', v]
const str = (v: string): Tok => ['str', v]
const val = (v: string): Tok => ['val', v]
const plain = (v: string): Tok => ['', v]

// <script setup> 里不能出现闭合标签的字面量，它会把 SFC 的 script 块提前结束
const SCRIPT_OPEN = '<' + 'script'
const SCRIPT_CLOSE = `</${'script'}>`
const TEMPLATE_OPEN = '<' + 'template>'
const TEMPLATE_CLOSE = `</${'template'}>`

const kebab = (name: string) => name.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)

/** 属性值在模板里怎么写：字符串用引号，数字和布尔值用绑定 */
function attrTokens(name: string, value: unknown): Tok[] {
  const key = kebab(name)
  const lead = plain('    ')
  if (typeof value === 'string') {
    const quote = value.includes('"') && !value.includes("'") ? "'" : '"'
    return [lead, attr(key), plain('='), str(`${quote}${value}${quote}`)]
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return [lead, attr(`:${key}`), plain('='), val(`"${value}"`)]
  }
  return []
}

const same = (a: unknown, b: unknown) => String(a) === String(b)

export interface PropDef {
  name: string
  type: string
  value: unknown
  desc: string
  control?: string | null
  usage?: boolean
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: readonly string[]
  /** 文档预览台的初始值；与组件默认值不同时，用法代码里会把这一项写出来 */
  demo?: unknown
}

export interface UsageOptions {
  schema: {
    component: string
    import?: string
    slot?: string | null
    props: PropDef[]
    events?: { name: string; args?: string; desc: string }[]
  }
  values: Record<string, unknown>
  /** true 时写出全部可调参数；false 时只写与默认值不同的 */
  all: ComputedRef<boolean>
}

const handlerOf = (event: string) =>
  `on${event.charAt(0).toUpperCase()}${event.slice(1).replace(/[:-]/g, '')}`

export function useUsage({ schema, values, all }: UsageOptions) {
  const lines = computed<Tok[][]>(() => {
    const shown = schema.props.filter(
      prop => prop.control && prop.usage !== false && (all.value || !same(values[prop.name], prop.value))
    )
    const out: Tok[][] = [
      [kw(SCRIPT_OPEN), plain(' setup'), kw('>')],
      [kw('import'), plain(` { ${schema.component} } `), kw('from'), str(" '@motion-effects/vue'")],
      [kw(SCRIPT_CLOSE)],
      [],
      [kw(TEMPLATE_OPEN)]
    ]
    const attrs: Tok[][] = [
      ...shown.map(prop => attrTokens(prop.name, values[prop.name] ?? prop.value)),
      ...(schema.events ?? []).map(
        event =>
          [
            plain('    '),
            attr(`@${event.name}`),
            plain('='),
            str(`"${handlerOf(event.name)}"`)
          ] as Tok[]
      )
    ]
    const open = plain('  ')
    if (!attrs.length) {
      // 没有要写的参数：自闭合，或直接包住插槽内容
      if (schema.slot) {
        out.push([open, tag(`<${schema.component}`), tag('>')])
        out.push([plain('    '), plain(schema.slot)])
        out.push([plain('  '), tag(`</${schema.component}>`)])
      } else {
        out.push([open, tag(`<${schema.component} />`)])
      }
    } else {
      out.push([open, tag(`<${schema.component}`)])
      out.push(...attrs)
      if (schema.slot) {
        out[out.length - 1].push(tag('>'))
        out.push([plain('    '), plain(schema.slot)])
        out.push([plain('  '), tag(`</${schema.component}>`)])
      } else {
        out.push([plain('  '), tag('/>')])
      }
    }
    out.push([kw(TEMPLATE_CLOSE)])
    return out
  })

  const text = computed(() => lines.value.map(line => line.map(([, text]) => text).join('')).join('\n'))
  return { lines, text }
}

/** 复制按钮的通用状态：copied 是最近一次复制成功的键名，1.6 秒后清空 */
export function useCopy() {
  const copied = ref('')
  async function copy(content: string, key: string) {
    try {
      await navigator.clipboard.writeText(content)
      copied.value = key
      setTimeout(() => {
        if (copied.value === key) copied.value = ''
      }, 1600)
    } catch {
      /* 剪贴板不可用或被拒绝：保持原状 */
    }
  }
  return { copied, copy }
}
