import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import GlassFolder from '../src/components/GlassFolder.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountFolder(props: Record<string, unknown> = {}) {
  const wrapper = mount(GlassFolder, { attachTo: document.body, props })
  mounted.push(wrapper)
  return wrapper
}

describe('GlassFolder', () => {
  it('renders the folder shell, panels and sample files', () => {
    const wrapper = mountFolder({ art: 'none', appear: false })
    const root = wrapper.find('.gf-root')

    expect(root.attributes('data-tone')).toBe('light')
    expect(root.attributes('data-place')).toBe('bottom-left')
    expect(root.attributes('data-entered')).toBe('')
    expect(wrapper.find('.gf-stage').exists()).toBe(true)
    expect(wrapper.find('.gf-back').exists()).toBe(true)
    expect(wrapper.find('.gf-front').exists()).toBe(true)
    expect(wrapper.find('button.gf-hit').exists()).toBe(true)
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(3)
    expect(wrapper.find('.gf-title').text()).toBe('My Files')
    expect(wrapper.find('.gf-meta').text()).toBe('3 items')

    const el = root.element as HTMLElement
    expect(el.style.width).toBe('340px')
    expect(el.style.height).toBe('326px')
  })

  it('applies tone, width, placement and a custom label / meta', () => {
    const wrapper = mountFolder({
      art: 'none', appear: false, tone: 'dark', width: 400,
      labelPlacement: 'top-right', label: 'Photos', meta: '12 files'
    })
    const root = wrapper.find('.gf-root')
    expect(root.attributes('data-tone')).toBe('dark')
    expect(root.attributes('data-place')).toBe('top-right')
    expect((root.element as HTMLElement).style.width).toBe('400px')
    expect(wrapper.find('.gf-title').text()).toBe('Photos')
    expect(wrapper.find('.gf-meta').text()).toBe('12 files')
  })

  it('toggles open and reports it', async () => {
    const wrapper = mountFolder({ art: 'none', appear: false })
    const hit = wrapper.find('button.gf-hit')
    expect(hit.attributes('aria-expanded')).toBe('false')

    await hit.trigger('click')
    await nextTick()
    expect(wrapper.find('.gf-root').attributes('data-open')).toBe('')
    expect(wrapper.find('button.gf-hit').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('open-change')?.[0]).toEqual([true])
  })

  it('emits update:open so v-model:open stays in sync', async () => {
    // 回归：曾只发 open-change，v-model:open 的父级 ref 永远不会更新。
    const wrapper = mountFolder({ open: false, art: 'none', appear: false })
    await wrapper.find('button.gf-hit').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
    // 受控模式下，父级未更新 prop 时组件保持关闭（不自行改内部状态）
    expect(wrapper.emitted('open-change')?.[0]).toEqual([true])
  })

  it('adds a file through the add key', async () => {
    const wrapper = mountFolder({ art: 'none', appear: false })
    await wrapper.find('button.gf-key').trigger('click')
    await nextTick()
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(4)
    expect(wrapper.emitted('files-change')).toBeTruthy()
    expect(wrapper.find('.gf-meta').text()).toBe('4 items')
  })

  it('opens the more menu and selects an item', async () => {
    const wrapper = mountFolder({
      art: 'none', appear: false, action: 'more',
      menu: [{ label: 'Rename', onSelect: () => {} }]
    })
    await wrapper.find('button.gf-key').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="menu"]').attributes('data-open')).toBe('')
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2)

    await wrapper.findAll('[role="menuitem"]')[1]!.trigger('click')
    await nextTick()
    expect(wrapper.find('[role="menu"]').attributes('data-open')).toBeUndefined()
  })
})
