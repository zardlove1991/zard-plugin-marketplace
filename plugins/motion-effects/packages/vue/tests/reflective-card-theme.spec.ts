import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

// theme 映射的回归：把引擎 mock 掉，捕获传给 renderPlate 的 settings.theme。
// vi.mock 会被 hoist 到 import 之前，确保组件拿到的就是 mock。
const seen: number[] = []
vi.mock('../src/composables/reflectiveCardEngine', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/composables/reflectiveCardEngine')>()
  return {
    ...actual,
    createRenderer: () => ({
      upload: () => true,
      renderEnv: () => {},
      renderPlate: (args: { settings: { theme: number } }) => seen.push(args.settings.theme),
      dispose: () => {}
    })
  }
})

// mock 之后才导入组件
import ReflectiveCard from '../src/components/ReflectiveCard.vue'

const mounted: VueWrapper[] = []
afterEach(() => { mounted.splice(0).forEach(w => w.unmount()) })

describe('ReflectiveCard theme uniform', () => {
  it('maps dark/light theme prop to uTheme 0/1', async () => {
    seen.length = 0
    mounted.push(mount(ReflectiveCard, { attachTo: document.body, props: { theme: 'dark' } }))
    mounted.push(mount(ReflectiveCard, { attachTo: document.body, props: { theme: 'light' } }))
    // 等一帧 rAF，让渲染循环把 settings 送到 mock
    await new Promise(r => setTimeout(r, 40))
    expect(seen).toContain(0)
    expect(seen).toContain(1)
  })
})
