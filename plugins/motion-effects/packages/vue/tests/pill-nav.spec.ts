import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import PillNav from '../src/components/PillNav.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountNav(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(PillNav, { attachTo: document.body, props, slots })
  mounted.push(wrapper)
  return wrapper
}

describe('PillNav', () => {
  it('renders a nav with the default items and theme variables', () => {
    const wrapper = mountNav()
    const root = wrapper.find('.pill-nav')

    expect(root.element.tagName).toBe('NAV')
    expect(root.attributes('aria-label')).toBe('Main')
    expect(root.attributes('data-layout')).toBe('split')
    expect(root.attributes('data-items')).toBe('pill')
    expect(wrapper.findAll('.pill-nav__slot')).toHaveLength(4)
    expect(wrapper.find('.pill-nav__fill').exists()).toBe(true)
    expect(wrapper.find('.pill-nav__face').text()).toBe('Home')
    expect(wrapper.find('.pill-nav__dot').exists()).toBe(true)
    expect(wrapper.find('.pill-nav__measure').exists()).toBe(true)

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--pn-h')).toBe('44px')
    expect(el.style.getPropertyValue('--pn-surface')).toBe('rgba(38, 35, 46, 0.66)')
    expect(el.style.getPropertyValue('--pn-blur')).toContain('blur(20px)')
  })

  it('applies size / surface / theme variants', () => {
    const wrapper = mountNav({ size: 'lg', theme: 'light', surface: 'none', highlightColor: '#ff5500', textColor: '#111' })
    const el = wrapper.find('.pill-nav').element as HTMLElement
    expect(el.style.getPropertyValue('--pn-h')).toBe('52px')
    expect(el.style.getPropertyValue('--pn-surface')).toBe('transparent')
    expect(el.style.getPropertyValue('--pn-blur')).toBe('none')
    expect(el.style.getPropertyValue('--pn-pill')).toBe('#ff5500')
    expect(el.style.getPropertyValue('--pn-strong')).toBe('#111')
  })

  it('marks the active item from activeHref and emits item-click', async () => {
    const wrapper = mountNav({ activeHref: '#work', collapse: 'never' })
    await nextTick()
    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
    expect(wrapper.findAll('.pill-nav__item')[1]!.attributes('aria-current')).toBe('page')

    await wrapper.findAll('.pill-nav__item')[2]!.trigger('click')
    expect(wrapper.emitted('item-click')?.[0]?.[1]).toBe(2)
  })

  it('collapses into a toggle and opens the mobile panel', async () => {
    const wrapper = mountNav({ collapse: 'always', logo: '/logo.svg' })
    await nextTick()
    expect(wrapper.find('.pill-nav').attributes('data-collapsed')).toBe('')
    expect(wrapper.find('.pill-nav__bar').exists()).toBe(false)
    const toggle = wrapper.find('.pill-nav__toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')
    await nextTick()
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('menu-toggle')?.[0]).toEqual([true])
    expect(wrapper.find('.pill-nav__panel').exists()).toBe(true)
    expect(wrapper.findAll('.pill-nav__row')).toHaveLength(4)
  })

  it('renders a custom logo slot', () => {
    const wrapper = mountNav({ collapse: 'always' }, { logo: '<span class="custom-logo">Z</span>' })
    expect(wrapper.find('.custom-logo').text()).toBe('Z')
  })
})
