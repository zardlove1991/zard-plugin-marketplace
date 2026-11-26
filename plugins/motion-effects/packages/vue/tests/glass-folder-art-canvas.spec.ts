import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

// 用一个可控的 paint mock：每次调用返回一个 defer，能按任意顺序 resolve。
type Deferred = {
  resolve: (value: { width: number; height: number }) => void
  recipe: unknown
  seed: number
}
const calls: Deferred[] = []
vi.mock('../src/composables/glassFolderArt', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/composables/glassFolderArt')>()
  return {
    ...actual,
    paint: (recipe: unknown, seed: number) =>
      new Promise<{ width: number; height: number }>(resolve => {
        calls.push({ resolve, recipe, seed })
      })
  }
})

import GlassFolderArtCanvas from '../src/components/GlassFolderArtCanvas.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(w => w.unmount())
  calls.length = 0
})

describe('GlassFolderArtCanvas paint race', () => {
  it('ignores a stale paint result that resolves after a newer one', async () => {
    const wrapper = mount(GlassFolderArtCanvas, {
      attachTo: document.body,
      props: { art: 'aurora', seed: 1, w: 40, h: 40, density: 1, priority: 0 }
    })
    mounted.push(wrapper)
    await new Promise(r => setTimeout(r, 0))
    expect(calls).toHaveLength(1)

    // 换 seed → 第二次 paint
    await wrapper.setProps({ seed: 2 })
    await new Promise(r => setTimeout(r, 0))
    expect(calls).toHaveLength(2)

    // 先让“新”请求完成（seed=2），画出宽 20 的图
    const newest = calls[1]!
    newest.resolve({ width: 20, height: 20 })
    await new Promise(r => setTimeout(r, 0))
    const canvas = wrapper.find('canvas').element as HTMLCanvasElement
    expect(canvas.width).toBe(20)
    expect(wrapper.find('canvas').attributes('data-ready')).toBe('')

    // 旧请求（seed=1）后完成：不应覆盖新图
    const stale = calls[0]!
    stale.resolve({ width: 99, height: 99 })
    await new Promise(r => setTimeout(r, 0))
    expect(canvas.width).toBe(20)
    expect(canvas.height).toBe(20)
  })
})
