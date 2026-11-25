/**
 * 预览台与 Customize 面板共享的「当前参数值」。
 * EffectPage 以 props 清单的默认值建一份 reactive 并 provide，预览台按需取用。
 */
import { inject, provide, reactive, type InjectionKey } from 'vue'

export type Values = Record<string, unknown>

export const VALUES: InjectionKey<Values> = Symbol('motion-effects:values')

export function provideValues(defaults: Values): Values {
  const values = reactive<Values>({ ...defaults })
  provide(VALUES, values)
  return values
}

/** 没有 Customize 的组件也能挂预览台：给一份空的 reactive，读到的都是 undefined */
export function useValues(): Values {
  return inject(VALUES, reactive<Values>({}))
}

/** 只取这个组件用得到的 prop。整包 v-bind 会把无关的参数当成 attribute 落到根元素上。 */
export function pick(values: Values, keys: readonly string[]) {
  const out: Values = {}
  for (const key of keys) {
    if (values[key] !== undefined && values[key] !== '') out[key] = values[key]
  }
  return out
}
