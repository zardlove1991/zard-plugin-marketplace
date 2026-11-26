import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import GlassIconReveal from '../src/components/GlassIconReveal.vue'
import GlassReveal21st from '../src/components/GlassReveal21st.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

const LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>'

describe('GlassIconReveal', () => {
  it('renders an accessible root and falls back to a masked logo without WebGL2', async () => {
    const wrapper = mount(GlassIconReveal, {
      attachTo: document.body,
      props: { logo: LOGO, background: '#ffffff', label: 'Brand' }
    })
    mounted.push(wrapper)
    await nextTick()
    const root = wrapper.find('.lgr-root')

    expect(root.attributes('role')).toBe('img')
    expect(root.attributes('aria-label')).toBe('Brand')
    expect((root.element as HTMLElement).style.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(wrapper.find('.lgr-fallback').exists()).toBe(true)
    expect((wrapper.find('.lgr-fallback').element as HTMLElement).style.maskImage).toContain('data:image/svg+xml')
  })

  it('merges look presets, tuning and emits click', async () => {
    const wrapper = mount(GlassIconReveal, {
      attachTo: document.body,
      props: {
        logo: LOGO, look: 'dark', tileSize: 480, logoScale: 0.5, finalScale: 0.7,
        tuning: { dispersion: 0.9 }, className: 'featured', style: { width: '400px' }
      }
    })
    mounted.push(wrapper)
    await nextTick()
    const root = wrapper.find('.lgr-root')
    expect(root.classes()).toContain('featured')
    expect((root.element as HTMLElement).style.width).toBe('400px')

    await root.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})

describe('GlassReveal21st', () => {
  it('uses the built-in mark and baked-in defaults', async () => {
    const wrapper = mount(GlassReveal21st, { attachTo: document.body })
    mounted.push(wrapper)
    await nextTick()
    expect(wrapper.find('.lgr-root').attributes('aria-label')).toBe('21st.dev')
    expect(wrapper.find('.lgr-fallback').exists()).toBe(true)
  })
})
