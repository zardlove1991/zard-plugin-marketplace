import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import Stepper from '../src/components/Stepper.vue'

const steps = [
  { title: 'Welcome', description: 'Set up your workspace' },
  { title: 'Plan', description: 'Pick a plan' },
  { title: 'Profile', description: 'Your name' },
  { title: 'Review', description: 'Check everything' }
]

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountStepper(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(Stepper, {
    attachTo: document.body,
    props: { steps, ...props },
    slots
  })
  mounted.push(wrapper)
  return wrapper
}

/** jsdom 里宽度恒为 0，纵向布局会被折叠成紧凑模式；这里临时给一个宽度 */
function withClientWidth(width: number) {
  const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth')
  Object.defineProperty(Element.prototype, 'clientWidth', { configurable: true, get: () => width })
  return () => {
    if (descriptor) Object.defineProperty(Element.prototype, 'clientWidth', descriptor)
  }
}

describe('Stepper', () => {
  it('renders the panel, the steps and the theme variables', () => {
    const wrapper = mountStepper()
    const root = wrapper.find('.stepper')

    expect(root.exists()).toBe(true)
    expect(root.classes()).toContain('is-framed')
    expect(root.attributes('data-completed')).toBeUndefined()
    expect(wrapper.findAll('.stepper__segment')).toHaveLength(4)
    expect(wrapper.findAll('.stepper__badge')).toHaveLength(4)
    expect(wrapper.find('.stepper__segment').attributes('aria-label')).toBe('Step 1: Welcome')
    expect(wrapper.find('.stepper__segment').attributes('aria-current')).toBe('step')

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--stepper-radius')).toBe('24px')
    expect(el.style.getPropertyValue('--stepper-width')).toBe('440px')
    expect(el.style.getPropertyValue('--stepper-ink')).toBe('#f4f4f5')
  })

  it('applies the accent color and the light theme', () => {
    const wrapper = mountStepper({ theme: 'light', accentColor: '#c8ff4d' })
    const el = wrapper.find('.stepper').element as HTMLElement

    expect(el.style.getPropertyValue('--stepper-ink')).toBe('#27272a')
    expect(el.style.getPropertyValue('--stepper-solid')).toBe('#c8ff4d')
    expect(el.style.getPropertyValue('--stepper-solid-ink')).toBe('#18181b')
  })

  it('moves forward and backward and emits the change events', async () => {
    const wrapper = mountStepper()

    await wrapper.find('.stepper__btn--next').trigger('click')
    expect(wrapper.emitted('step-change')?.[0]).toEqual([2])
    expect(wrapper.emitted('update:step')?.[0]).toEqual([2])
    await nextTick()
    expect(wrapper.findAll('.stepper__segment')[1].attributes('aria-current')).toBe('step')
    expect(wrapper.findAll('.stepper__badge')[0].attributes('data-status')).toBe('complete')

    await wrapper.find('.stepper__btn--back').trigger('click')
    expect(wrapper.emitted('step-change')?.[1]).toEqual([1])
    await nextTick()
    expect(wrapper.findAll('.stepper__segment')[0].attributes('aria-current')).toBe('step')
  })

  it('completes the last step and hides the footer', async () => {
    const wrapper = mountStepper()

    for (let i = 0; i < 3; i += 1) {
      await wrapper.find('.stepper__btn--next').trigger('click')
    }
    await nextTick()
    expect(wrapper.find('.stepper__btn--next').text()).toContain('Complete')

    await wrapper.find('.stepper__btn--next').trigger('click')
    expect(wrapper.emitted('final-step-completed')).toBeTruthy()
    await nextTick()
    expect(wrapper.find('.stepper').attributes('data-completed')).toBe('')
    expect(wrapper.find('.stepper__footer-wrap').attributes('data-hidden')).toBe('')
  })

  it('only lets the linear mode reach the steps already visited', async () => {
    const wrapper = mountStepper({ linear: true })
    const segments = wrapper.findAll('.stepper__segment')

    expect(segments.every(segment => segment.attributes('disabled') !== undefined)).toBe(true)

    await wrapper.find('.stepper__btn--next').trigger('click')
    await nextTick()
    const after = wrapper.findAll('.stepper__segment')
    // 走过的第 1 步可以点回；当前步与没走过的步骤都禁用（与 React 原件一致）
    expect(after[0].attributes('disabled')).toBeUndefined()
    expect(after[1].attributes('disabled')).toBeDefined()
    expect(after[2].attributes('disabled')).toBeDefined()
    expect(after[3].attributes('disabled')).toBeDefined()
  })

  it('disables every indicator when disableStepIndicators is on', () => {
    const wrapper = mountStepper({ disableStepIndicators: true })
    expect(wrapper.findAll('.stepper__segment').every(s => s.attributes('disabled') !== undefined)).toBe(true)
  })

  it('renders the dots and the bars indicator', () => {
    const dots = mountStepper({ indicator: 'dots' })
    expect(dots.findAll('.stepper__dot')).toHaveLength(4)
    expect(dots.find('.stepper__track').exists()).toBe(false)

    const bars = mountStepper({ indicator: 'bars' })
    expect(bars.findAll('.stepper__bar')).toHaveLength(4)
    expect(bars.findAll('.stepper__bar-fill')[0].attributes('data-filled')).toBe('')
    expect(bars.findAll('.stepper__bar-fill')[1].attributes('data-filled')).toBeUndefined()
  })

  it('lays the steps out as a rail in the vertical orientation', () => {
    const restore = withClientWidth(800)
    try {
      const wrapper = mountStepper({ orientation: 'vertical' })
      expect(wrapper.find('.stepper').classes()).toContain('is-rail')
      expect(wrapper.find('.stepper__head').classes()).toContain('is-rail')
      expect(wrapper.find('.stepper__track').attributes('data-layout')).toBe('rail')
      expect(wrapper.find('.stepper__desc').exists()).toBe(true)
    } finally {
      restore()
    }
  })

  it('follows the controlled step prop', async () => {
    const wrapper = mountStepper({ step: 3 })
    expect(wrapper.findAll('.stepper__segment')[2].attributes('aria-current')).toBe('step')

    await wrapper.setProps({ step: 2 })
    await nextTick()
    expect(wrapper.findAll('.stepper__segment')[1].attributes('aria-current')).toBe('step')
  })

  it('renders the step content through the #step slot', () => {
    const wrapper = mountStepper({}, { step: '<template #step="{ index }">内容 {{ index + 1 }}</template>' })
    expect(wrapper.find('.stepper__pane').text()).toContain('内容 1')
  })

  it('falls back to the content of the step when no slot is given', () => {
    const wrapper = mountStepper({ steps: [{ title: 'Only', content: 'hello' }] })
    expect(wrapper.find('.stepper__content').text()).toBe('hello')
  })

  it('shows the completed content after the last step', async () => {
    const wrapper = mountStepper({ completedContent: '全部完成' })
    for (let i = 0; i < 4; i += 1) {
      await wrapper.find('.stepper__btn--next').trigger('click')
    }
    await nextTick()
    expect(wrapper.find('.stepper__pane').text()).toContain('全部完成')
  })
})
