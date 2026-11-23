import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HoldButton from '../src/components/HoldButton.vue'

let now = 0

beforeEach(() => {
  now = 1000
  vi.useFakeTimers()
  vi.spyOn(performance, 'now').mockImplementation(() => now)
})

afterEach(() => {
  vi.useRealTimers()
})

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
    clientX: 100,
    clientY: 100,
    ...props
  })
  target.dispatchEvent(event)
}

function mountButton(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(HoldButton, {
    attachTo: document.body,
    props: { holdTime: 2000, releaseTime: 200, resetAfter: 1200, ...props },
    slots: { default: 'Delete', ...slots }
  })
}

describe('HoldButton', () => {
  it('renders the default label and hold hint', () => {
    const wrapper = mountButton()
    expect(wrapper.classes()).toContain('hold-button')
    expect(wrapper.classes()).toContain('hold-button--md')
    expect(wrapper.text()).toContain('Delete')
    expect(wrapper.text()).toContain('Press and hold for 2 seconds to confirm')
    expect(wrapper.attributes('data-phase')).toBe('idle')
    wrapper.unmount()
  })

  it('emits tap for a short press', async () => {
    const wrapper = mountButton()
    firePointer(wrapper.element, 'pointerdown')
    now += 100
    firePointer(wrapper.element, 'pointerup')
    await nextTick()

    expect(wrapper.emitted('tap')).toHaveLength(1)
    expect(wrapper.emitted('hold')).toBeUndefined()
    expect(wrapper.attributes('data-phase')).toBe('idle')
    wrapper.unmount()
  })

  it('emits hold after the hold time and shows the done state', async () => {
    const wrapper = mountButton()
    firePointer(wrapper.element, 'pointerdown')

    now += 2000
    await vi.advanceTimersByTimeAsync(2100)
    await nextTick()

    expect(wrapper.emitted('hold')).toHaveLength(1)
    expect(wrapper.attributes('data-phase')).toBe('done')

    await vi.advanceTimersByTimeAsync(1200)
    await nextTick()
    expect(wrapper.attributes('data-phase')).toBe('idle')
    wrapper.unmount()
  })

  it('supports keyboard hold with Space', async () => {
    const wrapper = mountButton()
    await wrapper.trigger('keydown', { key: ' ', repeat: false })

    now += 2000
    await vi.advanceTimersByTimeAsync(2100)
    await nextTick()

    expect(wrapper.emitted('hold')).toHaveLength(1)
    await wrapper.trigger('keyup', { key: ' ' })
    wrapper.unmount()
  })

  it('does nothing when disabled', async () => {
    const wrapper = mountButton({ disabled: true })
    firePointer(wrapper.element, 'pointerdown')
    now += 2000
    await vi.advanceTimersByTimeAsync(2100)
    await nextTick()

    expect(wrapper.emitted('hold')).toBeUndefined()
    expect(wrapper.attributes('data-phase')).toBe('idle')
    wrapper.unmount()
  })

  it('cancels tap when the pointer leaves the hit area', async () => {
    const wrapper = mountButton()
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 200,
      top: 0,
      bottom: 60,
      width: 200,
      height: 60,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect)

    firePointer(wrapper.element, 'pointerdown', { clientX: 50, clientY: 30 })
    firePointer(wrapper.element, 'pointermove', { clientX: 400, clientY: 30 })
    firePointer(wrapper.element, 'pointerup', { clientX: 400, clientY: 30 })
    await nextTick()

    expect(wrapper.emitted('tap')).toBeUndefined()
    expect(wrapper.attributes('data-phase')).toBe('idle')
    wrapper.unmount()
  })

  it('applies style variables and class name', () => {
    const wrapper = mountButton({
      fillColor: '#00ff00',
      radius: 20,
      wave: false,
      className: 'my-hold'
    })
    expect(wrapper.classes()).toContain('my-hold')
    expect(wrapper.element.style.getPropertyValue('--hb-fill')).toBe('#00ff00')
    expect(wrapper.element.style.getPropertyValue('--hb-radius')).toBe('20px')
    expect(wrapper.element.style.getPropertyValue('--hb-wave')).toBe('0px')
    wrapper.unmount()
  })

  it('does not emit after unmount', async () => {
    const wrapper = mountButton()
    firePointer(wrapper.element, 'pointerdown')
    wrapper.unmount()

    now += 2000
    await vi.advanceTimersByTimeAsync(2100)
    expect(wrapper.emitted('hold')).toBeUndefined()
  })
})