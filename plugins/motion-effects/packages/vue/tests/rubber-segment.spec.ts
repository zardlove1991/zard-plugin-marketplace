import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import RubberSegment from '../src/components/RubberSegment.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountSegment(props: Record<string, unknown> = {}) {
  const wrapper = mount(RubberSegment, {
    attachTo: document.body,
    props: { items: ['One', 'Two', 'Three'], ...props }
  })
  mounted.push(wrapper)
  return wrapper
}

describe('RubberSegment', () => {
  it('renders a radiogroup with checked state and theme variables', () => {
    const wrapper = mountSegment({ size: 'lg', radius: 14, trackColor: '#111' })
    const root = wrapper.find('.rubber-segment')

    expect(root.attributes('role')).toBe('radiogroup')
    expect(root.attributes('aria-label')).toBe('Segmented control')
    expect(root.attributes('data-equal')).toBe('')
    expect(root.attributes('data-draggable')).toBe('')
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios).toHaveLength(3)
    expect(radios[0]!.attributes('aria-checked')).toBe('true')
    expect(radios[0]!.attributes('tabindex')).toBe('0')
    expect(radios[1]!.attributes('tabindex')).toBe('-1')
    expect(wrapper.find('.rubber-segment__thumb').exists()).toBe(true)

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--rs-track')).toBe('#111')
    expect(el.style.getPropertyValue('--rs-h')).toBe('44px')
    expect(el.style.getPropertyValue('--rs-thumb-radius')).toBe('11px')
  })

  it('normalizes string items and uses defaultValue', () => {
    const wrapper = mountSegment({ defaultValue: 'Two' })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios[1]!.attributes('aria-checked')).toBe('true')
    expect(radios[1]!.text()).toContain('Two')
  })

  it('commits on click and emits change', async () => {
    const wrapper = mountSegment()
    const second = wrapper.findAll('[role="radio"]')[1]!
    await second.trigger('pointerdown', { pointerId: 1, button: 0, clientX: 0, timeStamp: 0 })
    await second.trigger('pointerup', { pointerId: 1, clientX: 0, timeStamp: 1 })

    expect(wrapper.emitted('change')?.[0]).toEqual(['Two', 1])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Two'])
    await nextTick()
    expect(wrapper.findAll('[role="radio"]')[1]!.attributes('aria-checked')).toBe('true')
  })

  it('navigates with arrow keys and Home / End', async () => {
    const wrapper = mountSegment()
    const first = wrapper.findAll('[role="radio"]')[0]!
    first.element.focus()
    await first.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(wrapper.findAll('[role="radio"]')[1]!.attributes('aria-checked')).toBe('true')

    await first.trigger('keydown', { key: 'End' })
    await nextTick()
    expect(wrapper.findAll('[role="radio"]')[2]!.attributes('aria-checked')).toBe('true')

    await first.trigger('keydown', { key: 'Home' })
    await nextTick()
    expect(wrapper.findAll('[role="radio"]')[0]!.attributes('aria-checked')).toBe('true')
  })

  it('ignores keys when disabled', async () => {
    const wrapper = mountSegment({ disabled: true })
    expect(wrapper.find('.rubber-segment').attributes('aria-disabled')).toBe('true')
    expect(wrapper.findAll('[role="radio"]').every(el => el.attributes('disabled') !== undefined)).toBe(true)
    await wrapper.findAll('[role="radio"]')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
