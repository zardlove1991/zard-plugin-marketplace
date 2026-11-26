import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import FlipCard from '../src/components/FlipCard.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountCard(props: Record<string, unknown> = {}) {
  const wrapper = mount(FlipCard, {
    attachTo: document.body,
    props,
    slots: {
      front: '<span class="front-face">Front</span>',
      back: '<span class="back-face">Back</span>'
    }
  })
  mounted.push(wrapper)
  return wrapper
}

const pointer = (wrapper: VueWrapper, type: string, x: number, y: number, extra: Record<string, unknown> = {}) =>
  wrapper.trigger(type, { clientX: x, clientY: y, pointerId: 1, button: 0, pointerType: 'mouse', ...extra })

describe('FlipCard', () => {
  it('renders both faces, slots and the documented ARIA/CSS contract', () => {
    const wrapper = mountCard({ width: 260, height: 340, radius: 30, background: '#123456' })
    const root = wrapper.find('.flip-card')

    expect(root.attributes('role')).toBe('button')
    expect(root.attributes('tabindex')).toBe('0')
    expect(root.attributes('aria-pressed')).toBe('false')
    expect(root.attributes('aria-label')).toBe('Flip card')
    expect(root.attributes('data-axis')).toBe('y')
    expect(wrapper.find('.front-face').text()).toBe('Front')
    expect(wrapper.find('.back-face').text()).toBe('Back')
    expect(wrapper.find('.flip-card__rotor').exists()).toBe(true)
    expect(wrapper.findAll('.flip-card__glare')).toHaveLength(2)

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--fc-w')).toBe('260px')
    expect(el.style.getPropertyValue('--fc-h')).toBe('340px')
    expect(el.style.getPropertyValue('--fc-radius')).toBe('30px')
    expect(el.style.getPropertyValue('--fc-bg')).toBe('#123456')
  })

  it('flips on click and reports the new face', async () => {
    const wrapper = mountCard()
    await pointer(wrapper, 'pointerdown', 10, 10)
    await pointer(wrapper, 'pointerup', 10, 10)

    expect(wrapper.find('.flip-card').attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('flip-change')?.[0]).toEqual([true])
    expect(wrapper.emitted('update:flipped')?.[0]).toEqual([true])
  })

  it('flips instantly on Enter, not on repeated keydown', async () => {
    const wrapper = mountCard()
    await wrapper.trigger('keydown', { key: 'Enter', repeat: false })
    expect(wrapper.find('.flip-card').attributes('aria-pressed')).toBe('true')
    await wrapper.trigger('keydown', { key: 'Enter', repeat: true })
    expect(wrapper.emitted('flip-change')).toHaveLength(1)
  })

  it('follows the controlled flipped prop', async () => {
    const wrapper = mountCard({ flipped: false })
    await wrapper.setProps({ flipped: true })
    await nextTick()
    expect(wrapper.find('.flip-card').attributes('aria-pressed')).toBe('true')
    await wrapper.setProps({ flipped: false })
    await nextTick()
    expect(wrapper.find('.flip-card').attributes('aria-pressed')).toBe('false')
  })

  it('ignores interaction when disabled', async () => {
    const wrapper = mountCard({ disabled: true })
    expect(wrapper.find('.flip-card').attributes('tabindex')).toBe('-1')
    expect(wrapper.find('.flip-card').attributes('data-disabled')).toBe('')

    await pointer(wrapper, 'pointerdown', 10, 10)
    await pointer(wrapper, 'pointerup', 10, 10)
    await wrapper.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.flip-card').attributes('aria-pressed')).toBe('false')
    expect(wrapper.emitted('flip-change')).toBeUndefined()
  })

  it('flips by dragging past the slop threshold', async () => {
    const wrapper = mountCard({ dragDistance: 200 })
    await pointer(wrapper, 'pointerdown', 50, 50)
    await pointer(wrapper, 'pointermove', 200, 50)
    expect(wrapper.find('.flip-card').attributes('data-dragging')).toBe('')
    await pointer(wrapper, 'pointerup', 200, 50)

    expect(wrapper.find('.flip-card').attributes('aria-pressed')).toBe('true')
  })
})
