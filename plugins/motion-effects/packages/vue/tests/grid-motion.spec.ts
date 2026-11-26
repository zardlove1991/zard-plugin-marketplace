import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GridMotion from '../src/components/GridMotion.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function withLayout() {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
  vi.stubGlobal('ResizeObserver', class {
    cb: ResizeObserverCallback
    constructor(cb: ResizeObserverCallback) { this.cb = cb }
    observe() { this.cb([], this as never) }
    disconnect() {}
    unobserve() {}
  })
}

function mountGrid(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(GridMotion, { attachTo: document.body, props, slots })
  mounted.push(wrapper)
  return wrapper
}

describe('GridMotion', () => {
  it('renders the root with theme variables and a fade mask', () => {
    const wrapper = mountGrid({ theme: 'light' })
    const root = wrapper.find('.gm-root')
    expect(root.exists()).toBe(true)

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--gm-tile')).toBe('#f4f4f5')
    expect(el.style.getPropertyValue('--gm-text')).toBe('#3f3f46')
    expect(el.style.getPropertyValue('--gm-dim')).toBe('0.35')
    expect(el.style.maskImage).toContain('linear-gradient')
    expect(el.style.maskComposite).toBe('intersect')
  })

  it('skips the mask when fade is 0', () => {
    const wrapper = mountGrid({ fade: 0 })
    expect((wrapper.find('.gm-root').element as HTMLElement).style.maskImage).toBe('')
  })

  it('builds rows of image and text tiles from items', async () => {
    withLayout()
    const wrapper = mountGrid({
      items: ['hello', { src: '/p.jpg', alt: 'P' }, null, false],
      rows: 2, gap: 10, angle: -12, speed: 0
    })
    await nextTick()
    await nextTick()

    const rows = wrapper.findAll('.gm-row')
    expect(rows).toHaveLength(2)
    expect(wrapper.find('.gm-plane').exists()).toBe(true)
    expect(wrapper.find('img.gm-tile__img, .gm-tile img').exists()).toBe(true)
    expect(wrapper.findAll('.gm-tile').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('hello')
    expect((wrapper.find('.gm-plane').element as HTMLElement).style.transform).toContain('rotateZ(-12deg)')
  })

  it('lets a scoped tile slot override the default content', async () => {
    withLayout()
    const wrapper = mountGrid(
      { items: ['Alpha'], rows: 1, speed: 0 },
      { tile: '<template #tile="{ tile }"><b class="custom-tile">{{ tile.kind }}</b></template>' }
    )
    await nextTick()
    await nextTick()
    expect(wrapper.find('.custom-tile').exists()).toBe(true)
  })

  it('clamps rows and disconnects observers on unmount', () => {
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect')
    const wrapper = mountGrid({ rows: 99 })
    wrapper.unmount()
    mounted.splice(mounted.indexOf(wrapper), 1)
    expect(disconnect).toHaveBeenCalled()
  })
})
