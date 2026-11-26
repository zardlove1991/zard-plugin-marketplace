import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AnimatedList from '../src/components/AnimatedList.vue'
import { ANIMATED_LIST_ITEMS } from '../src/components/animatedListIcons'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountList(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(AnimatedList, { attachTo: document.body, props, slots })
  mounted.push(wrapper)
  return wrapper
}

const key = (name: string) => {
  const e = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })
  window.dispatchEvent(e)
  return e
}

describe('AnimatedList', () => {
  it('renders a listbox with default items, theme variables and framed shell', () => {
    const wrapper = mountList()
    const root = wrapper.find('.animated-list')
    const view = wrapper.find('.animated-list__viewport')

    expect(root.classes()).toContain('animated-list--framed')
    expect(root.attributes('data-animated')).toBe('')
    expect(view.attributes('role')).toBe('listbox')
    expect(view.attributes('tabindex')).toBe('0')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(ANIMATED_LIST_ITEMS.length)
    expect(wrapper.find('.animated-list__title').text()).toBe('Brand assets')
    expect(wrapper.find('.animated-list__indicator').exists()).toBe(true)

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--al-width')).toBe('420px')
    expect(el.style.getPropertyValue('--al-radius')).toBe('14px')
    expect(el.style.getPropertyValue('--al-gap')).toBe('8px')
    expect(el.style.getPropertyValue('--al-frame')).toBe('rgba(38, 35, 46, 0.66)')
  })

  it('supports a scoped item slot, custom sizing and a selected event', async () => {
    const items = [
      { id: 'a', title: 'Alpha', description: 'first' },
      { id: 'b', title: 'Beta', description: 'second' }
    ]
    const wrapper = mountList(
      { items, animation: 'none', frame: false, width: '60%', maxHeight: 200, theme: 'light', radius: 8 },
      { item: '<template #item="{ item, selected }"><b class="custom">{{ item.title }}:{{ selected }}</b></template>' }
    )
    await nextTick()

    expect(wrapper.find('.animated-list').classes()).not.toContain('animated-list--framed')
    expect(wrapper.findAll('.custom').map(el => el.text())).toEqual(['Alpha:false', 'Beta:false'])
    const el = wrapper.find('.animated-list').element as HTMLElement
    expect(el.style.getPropertyValue('--al-width')).toBe('60%')
    expect(el.style.getPropertyValue('--al-ink')).toBe('#27272a')
    expect((wrapper.find('.animated-list__viewport').element as HTMLElement).style.maxHeight).toBe('200px')

    await wrapper.findAll('[role="option"]')[1].trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([items[1], 1])
    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(1)
    expect(wrapper.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true')
  })

  it('navigates with arrows, Home / End and emits select on Enter', async () => {
    const items = ['One', 'Two', 'Three']
    const wrapper = mountList({ items, animation: 'none', initialSelectedIndex: 0 })
    const view = wrapper.find('.animated-list__viewport').element as HTMLElement
    view.focus()
    await nextTick()

    expect(key('ArrowDown').defaultPrevented).toBe(true)
    await nextTick()
    expect(wrapper.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true')

    key('End')
    await nextTick()
    expect(wrapper.findAll('[role="option"]')[2].attributes('aria-selected')).toBe('true')

    key('Home')
    await nextTick()
    expect(wrapper.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('true')

    key('Enter')
    await nextTick()
    expect(wrapper.emitted('select')?.[0]).toEqual(['One', 0])
  })

  it('selects on hover only when enabled', async () => {
    const wrapper = mountList({ items: ['A', 'B'], animation: 'none' })
    const rows = wrapper.findAll('[role="option"]')
    await rows[1].trigger('pointerenter')
    await nextTick()
    expect(rows[1].attributes('aria-selected')).toBe('true')

    const noHover = mountList({ items: ['A', 'B'], animation: 'none', selectOnHover: false })
    await noHover.findAll('[role="option"]')[1].trigger('pointerenter')
    await nextTick()
    expect(noHover.findAll('[aria-selected="true"]')).toHaveLength(0)
  })

  it('reveals items with a fade mask and staggered delays once visible', async () => {
    class VisibleIO {
      cb: IntersectionObserverCallback
      constructor(cb: IntersectionObserverCallback) { this.cb = cb }
      observe() { this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never) }
      disconnect() {}
      unobserve() {}
      takeRecords() { return [] }
    }
    vi.stubGlobal('IntersectionObserver', VisibleIO)
    const wrapper = mountList({ items: ['A', 'B'], animation: 'slide', stagger: 0.1 })
    await nextTick()

    const rows = wrapper.findAll('[role="option"]')
    expect(rows[0].attributes('data-state')).toBe('in')
    expect((rows[0].element as HTMLElement).style.transitionDelay).toBeTruthy()
    expect((rows[1].element as HTMLElement).style.transitionDelay).toContain('0.1s')
    const view = wrapper.find('.animated-list__viewport').element as HTMLElement
    expect(view.style.maskImage).toContain('linear-gradient')
    expect(view.style.getPropertyValue('--al-fade-top')).toBeTruthy()
  })

  it('cleans up observers and window listeners on unmount', () => {
    const ro = vi.spyOn(ResizeObserver.prototype, 'disconnect')
    const win = vi.spyOn(window, 'removeEventListener')
    const wrapper = mountList()
    wrapper.unmount()
    mounted.splice(mounted.indexOf(wrapper), 1)

    expect(ro).toHaveBeenCalled()
    expect(win).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})
