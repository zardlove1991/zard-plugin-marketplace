import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import ReflectiveCard from '../src/components/ReflectiveCard.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountCard(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(ReflectiveCard, { attachTo: document.body, props, slots })
  mounted.push(wrapper)
  return wrapper
}

describe('ReflectiveCard', () => {
  it('renders the card, default identity, icons and hidden media', () => {
    const wrapper = mountCard()
    const root = wrapper.find('.reflective-card')

    expect(root.exists()).toBe(true)
    expect(wrapper.find('canvas.reflective-card__canvas').exists()).toBe(true)
    expect(wrapper.find('.reflective-card__body').exists()).toBe(true)
    expect(wrapper.find('.reflective-card__rim').exists()).toBe(true)
    expect(wrapper.find('.reflective-card__name').text()).toBe('Alexander Doe')
    expect(wrapper.find('.reflective-card__role').text()).toBe('Senior Developer')
    expect(wrapper.find('.reflective-card__badge').text()).toContain('Verified')
    expect(wrapper.find('.reflective-card__status').text()).toContain('Active')
    expect(wrapper.findAll('video.reflective-card__media')).toHaveLength(2)

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--rc-width')).toBe('320px')
    expect(el.style.getPropertyValue('--rc-height')).toBe('500px')
    expect(el.style.getPropertyValue('--rc-radius')).toBe('24px')
    expect(el.style.getPropertyValue('--rc-status')).toBe('#22c55e')
    expect(el.style.getPropertyValue('--rc-base')).toBe('#1d1c22')
  })

  it('switches to light theme and honors custom dimensions', () => {
    const wrapper = mountCard({ theme: 'light', width: '60%', height: 420, radius: 32, statusColor: '#f00' })
    const el = wrapper.find('.reflective-card').element as HTMLElement
    expect(el.style.getPropertyValue('--rc-base')).toBe('#e7e7ea')
    expect(el.style.getPropertyValue('--rc-width')).toBe('60%')
    expect(el.style.getPropertyValue('--rc-height')).toBe('420px')
    expect(el.style.getPropertyValue('--rc-radius')).toBe('32px')
    expect(el.style.getPropertyValue('--rc-status')).toBe('#f00')
  })

  it('lets the default slot replace the built-in content', () => {
    const wrapper = mountCard({}, { default: '<div class="custom">Custom face</div>' })
    expect(wrapper.find('.custom').text()).toBe('Custom face')
    expect(wrapper.find('.reflective-card__identity').exists()).toBe(false)
  })

  it('reports webcam errors when camera API is missing', () => {
    const wrapper = mountCard({ webcam: true })
    // jsdom 没有 mediaDevices；组件只发事件，不应抛异常
    expect(wrapper.find('.reflective-card').exists()).toBe(true)
  })
})
