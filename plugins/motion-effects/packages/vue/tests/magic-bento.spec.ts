import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import MagicBento from '../src/components/MagicBento.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountBento(props: Record<string, unknown> = {}) {
  const wrapper = mount(MagicBento, { attachTo: document.body, props })
  mounted.push(wrapper)
  return wrapper
}

describe('MagicBento', () => {
  it('renders the default six cards with built-in visuals and theme variables', () => {
    const wrapper = mountBento()
    const root = wrapper.find('.magic-bento')

    expect(root.exists()).toBe(true)
    expect(wrapper.findAll('.magic-bento__cell')).toHaveLength(6)
    expect(wrapper.findAll('.magic-bento__card')).toHaveLength(6)
    expect(wrapper.findAll('.magic-bento__title').map(el => el.text())).toContain('Analytics')
    expect(wrapper.find('.magic-bento__light').exists()).toBe(true)
    expect(wrapper.find('.magic-bento__rim').exists()).toBe(true)

    const el = root.element as HTMLElement
    expect(el.style.gridTemplateColumns).toBe('repeat(4, minmax(0px, 1fr))')
    expect(el.style.gridAutoRows).toBe('200px')
    expect(el.style.gap).toBe('12px')
    expect(el.style.getPropertyValue('--mb-radius')).toBe('20px')
    expect(el.style.getPropertyValue('--mb-glow-rgb')).toBeTruthy()
    expect(root.attributes('data-autohide')).toBe('')
    expect(root.attributes('data-motion')).toBe('')
    expect(root.attributes('data-intro')).toBe('')
  })

  it('applies theme / layout overrides', () => {
    const wrapper = mountBento({
      theme: 'light', columns: 2, rowHeight: 160, gap: 20, radius: 12,
      enableSpotlight: false, enableStars: true, intro: false, disableAnimations: true
    })
    const el = wrapper.find('.magic-bento').element as HTMLElement
    expect(el.style.gridTemplateColumns).toBe('repeat(2, minmax(0px, 1fr))')
    expect(el.style.gridAutoRows).toBe('160px')
    expect(el.style.gap).toBe('20px')
    expect(el.style.getPropertyValue('--mb-radius')).toBe('12px')
    expect(wrapper.find('.magic-bento').attributes('data-intro')).toBeUndefined()
    expect(wrapper.find('.magic-bento').attributes('data-motion')).toBeUndefined()
    expect(wrapper.find('.magic-bento__light').exists()).toBe(false)
    expect(wrapper.find('canvas.magic-bento__stars').exists()).toBe(true)
  })

  it('honors colSpan/rowSpan and emits item-click', async () => {
    const items = [
      { title: 'A', colSpan: 2, rowSpan: 2 },
      { title: 'B', image: '/b.jpg', href: '/b' }
    ]
    const wrapper = mountBento({ items })
    await nextTick()
    const cells = wrapper.findAll('.magic-bento__cell')
    expect(cells[0]!.element).toBeTruthy()
    expect((cells[0]!.element as HTMLElement).style.gridColumn).toBe('span 2')
    expect((cells[0]!.element as HTMLElement).style.gridRow).toBe('span 2')
    expect(wrapper.find('a.magic-bento__card').attributes('href')).toBe('/b')
    expect(wrapper.find('img.magic-bento__image').exists()).toBe(true)

    await wrapper.findAll('.magic-bento__card')[0]!.trigger('click')
    expect(wrapper.emitted('item-click')?.[0]?.[1]).toBe(0)
  })

  it('re-syncs the engine on runtime prop changes without throwing', async () => {
    // 回归：watch 里曾调用不存在的 hostEngine.reveal()，改任何 prop 都会抛 TypeError。
    const wrapper = mountBento({ intro: false, disableAnimations: true })
    await wrapper.setProps({ gap: 20, radius: 12 })
    await nextTick()
    // 引擎重启后组件仍在，且新样式已应用
    const el = wrapper.find('.magic-bento').element as HTMLElement
    expect(el.style.gap).toBe('20px')
    expect(el.style.getPropertyValue('--mb-radius')).toBe('12px')
    expect(wrapper.findAll('.magic-bento__card')).toHaveLength(6)
  })

  it('marks href-less cards clickable when an item-click listener is attached', () => {
    // 回归：clickable 曾误查 slots['item-click']（emit 不是 slot），
    // 导致有 @item-click 时卡片仍拿不到 role/tabindex。
    const wrapper = mount(MagicBento, {
      attachTo: document.body,
      props: { items: [{ title: 'A' }], intro: false, disableAnimations: true, onItemClick: () => {} }
    })
    mounted.push(wrapper)
    const card = wrapper.find('.magic-bento__card')
    expect(card.attributes('data-clickable')).toBe('')
    expect(card.attributes('role')).toBe('button')
    expect(card.attributes('tabindex')).toBe('0')
  })

  it('lets a scoped item slot replace the card content', () => {
    const wrapper = mountBento(
      { items: [{ title: 'A' }] },
    )
    // 默认渲染标题
    expect(wrapper.find('.magic-bento__title').text()).toBe('A')
    wrapper.unmount()
    mounted.splice(mounted.indexOf(wrapper), 1)

    const custom = mount(MagicBento, {
      attachTo: document.body,
      props: { items: [{ title: 'A' }] },
      slots: { item: '<template #item="{ index }"><b class="custom">slot {{ index }}</b></template>' }
    })
    mounted.push(custom)
    expect(custom.find('.custom').text()).toBe('slot 0')
  })
})
