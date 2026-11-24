import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Shredder from '../src/components/Shredder.vue'
import type { ShredderItem } from '../src/composables/useShredder'

interface TestItem extends ShredderItem {
  name: string
  size: string
}

const ITEMS: TestItem[] = [
  { id: 1, name: 'Harbour at dusk', size: '4.1 MB' },
  { id: 2, name: 'Studio, take two', size: '2.8 MB' },
  { id: 3, name: 'Fog over the bay', size: '6.3 MB' }
]

function firePointer(
  target: EventTarget,
  type: string,
  props: Record<string, unknown> = {}
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, {
    button: 0,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: 0,
    clientY: 0,
    ...props
  })
  target.dispatchEvent(event)
}

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountShredder(props: Record<string, unknown> = {}): VueWrapper {
  const wrapper = mount(Shredder, {
    attachTo: document.body,
    props: { items: ITEMS, ...props },
    slots: {
      item: '<template #item="{ item, index }"><b class="row">{{ index }}: {{ item.name }}</b></template>'
    }
  })
  mounted.push(wrapper)
  return wrapper
}

/** 等引擎在 nextTick 里读完 DOM 并绑定好事件 */
async function ready(wrapper: ReturnType<typeof mountShredder>) {
  await nextTick()
  await nextTick()
  return wrapper
}

describe('Shredder', () => {
  it('renders the machine structure and scoped-slot rows', async () => {
    const wrapper = await ready(mountShredder())

    expect(wrapper.find('.sh-root').exists()).toBe(true)
    expect(wrapper.findAll('.sh-slot')).toHaveLength(ITEMS.length)
    expect(wrapper.findAll('.sh-item')).toHaveLength(ITEMS.length)
    expect(wrapper.find('.sh-slit').exists()).toBe(true)
    expect(wrapper.find('.sh-fall').exists()).toBe(true)
    expect(wrapper.find('.sh-canvas').exists()).toBe(true)

    const rows = wrapper.findAll('.row')
    expect(rows.map(r => r.text())).toEqual([
      '0: Harbour at dusk',
      '1: Studio, take two',
      '2: Fog over the bay'
    ])
  })

  it('maps props to CSS variables and merges className', async () => {
    const wrapper = await ready(mountShredder({
      width: 420,
      height: 520,
      inset: 20,
      fallHeight: 160,
      slitHeight: 6,
      slitColor: '#112233',
      color: '#abcdef',
      className: 'custom-machine'
    }))

    const root = wrapper.find('.sh-root').element as HTMLElement
    expect(root.style.getPropertyValue('--sh-w')).toBe('420px')
    expect(root.style.getPropertyValue('--sh-h')).toBe('520px')
    expect(root.style.getPropertyValue('--sh-inset')).toBe('20px')
    expect(root.style.getPropertyValue('--sh-fall')).toBe('160px')
    expect(root.style.getPropertyValue('--sh-slit-h')).toBe('6px')
    expect(root.style.getPropertyValue('--sh-slit-inset')).toBe('14px')
    expect(root.style.getPropertyValue('--sh-over')).toBe('40px')
    expect(root.style.getPropertyValue('--sh-slit')).toBe('#112233')
    expect(root.style.getPropertyValue('--sh-ink')).toBe('#abcdef')
    expect(root.classList.contains('custom-machine')).toBe(true)
  })

  it('marks disabled rows non-interactive and blocks keyboard shred', async () => {
    const wrapper = await ready(mountShredder({ disabled: true }))

    const root = wrapper.find('.sh-root').element as HTMLElement
    expect(root.hasAttribute('data-disabled')).toBe(true)
    const items = wrapper.findAll('.sh-item')
    items.forEach(item => {
      expect((item.element as HTMLElement).tabIndex).toBe(-1)
      expect(item.attributes('aria-disabled')).toBe('true')
    })

    items[0]!.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    items[0]!.element.dispatchEvent(firePointerEvent('pointerdown', 0))
    expect(wrapper.emitted('shred')).toBeUndefined()
    expect(items[0]!.attributes('data-state')).toBeUndefined()
  })

  it('starts a carry on Delete / Backspace in normal motion', async () => {
    const wrapper = await ready(mountShredder())
    const first = wrapper.findAll('.sh-item')[0]!

    first.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    expect((first.element as HTMLElement).dataset.state).toBe('drag')
  })

  describe('prefers-reduced-motion', () => {
    function mockReducedMotion() {
      return vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      }))
    }

    it('queries the reduced-motion media query when a key shred is requested', async () => {
      const spy = mockReducedMotion()
      const wrapper = await ready(mountShredder())

      wrapper.findAll('.sh-item')[0]!.element.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })
      )

      expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    })

    it('shreds immediately on Delete/Backspace without starting a drag animation', async () => {
      mockReducedMotion()
      const wrapper = await ready(mountShredder())
      const slot = wrapper.findAll('.sh-slot')[0]!
      const item = slot.find('.sh-item').element as HTMLElement

      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))

      expect(wrapper.emitted('shred')).toBeTruthy()
      expect((wrapper.emitted('shred')![0]![0] as ShredderItem).id).toBe(1)
      expect(slot.attributes('data-gone')).toBe('')
      // 立即消费：不进入 carry / drag 的 data-state，slot 直接收成 0 高
      expect(item.dataset.state).toBeUndefined()
      expect((slot.element as HTMLElement).style.height).toBe('0px')
    })

    it('ignores key shred for a disabled machine even under reduced motion', async () => {
      mockReducedMotion()
      const wrapper = await ready(mountShredder({ disabled: true }))
      const slot = wrapper.findAll('.sh-slot')[0]!

      slot.find('.sh-item').element.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })
      )

      expect(wrapper.emitted('shred')).toBeUndefined()
      expect(slot.attributes('data-gone')).toBeUndefined()
    })
  })

  it('enters drag state on pointerdown and follows pointer moves', async () => {
    const wrapper = await ready(mountShredder())
    const first = wrapper.findAll('.sh-item')[0]!.element as HTMLElement

    firePointer(first, 'pointerdown', { clientX: 10, clientY: 10, pointerId: 7 })
    expect(first.dataset.state).toBe('drag')

    firePointer(first, 'pointermove', { clientX: 60, clientY: 20, pointerId: 7 })
    firePointer(window, 'pointerup', { clientX: 60, clientY: 20, pointerId: 7 })
    await nextTick()
    expect(wrapper.find('.sh-root').exists()).toBe(true)
  })

  it('re-renders rows when items change and cleans up on unmount', async () => {
    const observe = vi.spyOn(ResizeObserver.prototype, 'observe')
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect')
    const wrapper = await ready(mountShredder())

    expect(observe).toHaveBeenCalled()
    await wrapper.setProps({ items: ITEMS.slice(0, 2) })
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('.sh-slot')).toHaveLength(2)

    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})

function firePointerEvent(type: string, button: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { button, pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0 })
  return event
}
