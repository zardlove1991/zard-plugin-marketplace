import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SpotlightCard from '../src/components/SpotlightCard.vue'
import { advanceFrames } from './helpers/frames'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountCard(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  const wrapper = mount(SpotlightCard, {
    attachTo: document.body,
    props,
    attrs,
    slots: { default: '<div class="content">Hello</div>' }
  })
  mounted.push(wrapper)
  return wrapper
}

function movePointer(x = 10, y = 10) {
  const event = new Event('pointermove')
  Object.assign(event, { clientX: x, clientY: y, pointerType: 'mouse' })
  window.dispatchEvent(event)
}

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

describe('SpotlightCard', () => {
  it('renders the layered DOM, slot content and dark theme variables', () => {
    const wrapper = mountCard()
    const root = wrapper.find('.spotlight-card')

    expect(root.exists()).toBe(true)
    expect(root.attributes('data-theme')).toBe('dark')
    expect(wrapper.find('.spotlight-card__light').exists()).toBe(true)
    expect(wrapper.find('.spotlight-card__grain').exists()).toBe(true)
    expect(wrapper.find('.spotlight-card__border').exists()).toBe(true)
    expect(wrapper.find('.spotlight-card__edge').exists()).toBe(true)
    expect(wrapper.find('.content').text()).toBe('Hello')

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--spotlight-card-surface')).toBe('#111111')
    expect(el.style.getPropertyValue('--spotlight-card-border')).toBe('rgba(255, 255, 255, 0.08)')
    expect(el.style.getPropertyValue('--spotlight-card-shadow')).toContain('rgba(0, 0, 0, 0.6)')
  })

  it('switches to light theme, merges className and passes attrs through', () => {
    const wrapper = mountCard({ theme: 'light', className: 'featured' }, { id: 'card-1' })
    const el = wrapper.find('.spotlight-card').element as HTMLElement

    expect(el.getAttribute('data-theme')).toBe('light')
    expect(el.classList.contains('spotlight-card')).toBe(true)
    expect(el.classList.contains('featured')).toBe(true)
    expect(el.getAttribute('id')).toBe('card-1')
    expect(el.style.getPropertyValue('--spotlight-card-surface')).toBe('#ffffff')
    expect(el.style.getPropertyValue('--spotlight-card-shadow')).toContain('0 1px 2px')
  })

  it('lights the card when the pointer moves near it', async () => {
    const wrapper = mountCard()
    const light = wrapper.find('.spotlight-card__light').element as HTMLElement

    expect(light.style.opacity).toBe('')
    movePointer(10, 10)
    await advanceFrames(6)

    expect(Number(light.style.opacity)).toBeGreaterThan(0)
    expect(light.style.background).toContain('radial-gradient')
  })

  it('still lights the card under prefers-reduced-motion without smoothing', async () => {
    mockReducedMotion()
    const wrapper = mountCard()
    const light = wrapper.find('.spotlight-card__light').element as HTMLElement

    movePointer(12, 12)
    await advanceFrames(2)

    expect(Number(light.style.opacity)).toBeGreaterThan(0)
  })

  it('disconnects its IntersectionObserver on unmount', () => {
    const disconnect = vi.spyOn(IntersectionObserver.prototype, 'disconnect')
    const wrapper = mountCard()

    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
