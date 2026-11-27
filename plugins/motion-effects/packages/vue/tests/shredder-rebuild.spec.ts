import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

// 统计引擎创建次数：回归「父级回传 items / 改参数就重建引擎」的旧行为。
// 重建会打断在途的拖拽回位，导致行被卡在容器外（data-active + transform 残留）。
let engineCreations = 0
vi.mock('../src/composables/shredderEngine', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/composables/shredderEngine')>()
  return {
    ...actual,
    createShredderEngine: (...args: unknown[]) => {
      engineCreations += 1
      // @ts-expect-error 透传到真实实现
      return actual.createShredderEngine(...args)
    }
  }
})

import Shredder from '../src/components/Shredder.vue'

const ITEMS = [
  { id: 1, name: 'Harbour at dusk', size: '4.1 MB' },
  { id: 2, name: 'Studio, take two', size: '2.8 MB' },
  { id: 3, name: 'Fog over the bay', size: '6.3 MB' }
]

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

describe('Shredder engine lifecycle', () => {
  it('syncs in place on reorder echo and config changes instead of rebuilding', async () => {
    engineCreations = 0
    const wrapper = mount(Shredder, {
      attachTo: document.body,
      props: { items: ITEMS },
      slots: { item: '<template #item="{ item }"><b class="row">{{ item.name }}</b></template>' }
    })
    mounted.push(wrapper)
    await nextTick()
    await nextTick()

    expect(engineCreations).toBe(1)

    // 父级把重排后的顺序回传（onReorder 的典型用法）——不应重建
    await wrapper.setProps({ items: [ITEMS[2], ITEMS[0], ITEMS[1]] })
    await nextTick()
    await nextTick()
    expect(engineCreations).toBe(1)

    // 参数变化——同样只更新 cfg.current
    await wrapper.setProps({ feedSpeed: 240, disabled: true })
    await nextTick()
    expect(engineCreations).toBe(1)

    // 没有行被遗留在拖拽态
    const stuck = wrapper.findAll('.sh-item').filter(item => item.attributes('data-state') === 'drag')
    expect(stuck).toHaveLength(0)
    const active = wrapper.findAll('.sh-slot').filter(slot => slot.attributes('data-active') !== undefined)
    expect(active).toHaveLength(0)
  })

  it('re-syncs items after a genuine add/remove without stranding rows', async () => {
    engineCreations = 0
    const wrapper = mount(Shredder, {
      attachTo: document.body,
      props: { items: ITEMS },
      slots: { item: '<template #item="{ item }"><b class="row">{{ item.name }}</b></template>' }
    })
    mounted.push(wrapper)
    await nextTick()
    await nextTick()

    // 增删 key：Vue 重渲染后再 sync，仍不重建引擎
    await wrapper.setProps({ items: ITEMS.slice(0, 2) })
    await nextTick()
    await nextTick()
    expect(engineCreations).toBe(1)
    expect(wrapper.findAll('.sh-slot')).toHaveLength(2)
  })
})
