import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SpecularButton from '../src/components/SpecularButton.vue'

function mountButton(props: Record<string, unknown> = {}) {
  return mount(SpecularButton, {
    attachTo: document.body,
    props,
    slots: { default: 'Get Started' }
  })
}

describe('SpecularButton', () => {
  it('renders the label, canvas and size class', () => {
    const wrapper = mountButton({ size: 'md' })
    expect(wrapper.classes()).toContain('specular-button')
    expect(wrapper.classes()).toContain('specular-button--md')
    expect(wrapper.find('canvas.specular-button__light').exists()).toBe(true)
    expect(wrapper.text()).toContain('Get Started')
    wrapper.unmount()
  })

  it('emits click with the native event', async () => {
    const wrapper = mountButton()
    await wrapper.trigger('click')
    const events = wrapper.emitted('click')
    expect(events).toHaveLength(1)
    expect(events?.[0]?.[0]).toBeInstanceOf(Event)
    wrapper.unmount()
  })

  it('respects disabled and type', () => {
    const wrapper = mountButton({ disabled: true, type: 'submit' })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('type')).toBe('submit')
    wrapper.unmount()
  })

  it('maps visual props to CSS variables', async () => {
    const wrapper = mountButton({
      radius: 24,
      tint: '#123456',
      tintOpacity: 0.2,
      blur: 8,
      textColor: '#abcdef',
      className: 'cta'
    })

    expect(wrapper.classes()).toContain('cta')
    expect(wrapper.element.style.getPropertyValue('--sb-radius')).toBe('24px')
    expect(wrapper.element.style.getPropertyValue('--sb-tint')).toBe('#123456')
    expect(wrapper.element.style.getPropertyValue('--sb-tint-opacity')).toBe('0.2')
    expect(wrapper.element.style.getPropertyValue('--sb-blur')).toBe('8px')
    expect(wrapper.element.style.getPropertyValue('--sb-text-color')).toBe('#abcdef')

    await wrapper.setProps({ radius: 30 })
    expect(wrapper.element.style.getPropertyValue('--sb-radius')).toBe('30px')
    wrapper.unmount()
  })

  it('does not throw when WebGL2 is unavailable', () => {
    expect(() => mountButton().unmount()).not.toThrow()
  })
})