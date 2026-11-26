import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import GhostCursor from '../src/components/GhostCursor.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountCursor(props: Record<string, unknown> = {}) {
  const parent = document.createElement('div')
  document.body.appendChild(parent)
  const wrapper = mount(GhostCursor, { attachTo: parent, props })
  mounted.push(wrapper)
  return { wrapper, parent }
}

describe('GhostCursor', () => {
  it('renders a fixed canvas layer with defaults and no dependencies', () => {
    const { wrapper } = mountCursor()
    const root = wrapper.find('.ghost-cursor')

    expect(root.exists()).toBe(true)
    expect(root.classes()).toContain('ghost-cursor')
    const canvas = wrapper.find('canvas.ghost-cursor__canvas')
    expect(canvas.exists()).toBe(true)
    expect(canvas.attributes('aria-hidden')).toBe('true')
    expect((root.element as HTMLElement).style.zIndex).toBe('10')
    expect((canvas.element as HTMLElement).style.mixBlendMode).toBe('screen')
  })

  it('switches blend mode with theme and honors custom values / attrs', () => {
    const { wrapper } = mountCursor({
      theme: 'light', zIndex: 42, className: 'featured',
      style: { pointerEvents: 'none' }, mixBlendMode: 'multiply'
    })
    const root = wrapper.find('.ghost-cursor').element as HTMLElement
    expect(root.classList.contains('featured')).toBe(true)
    expect(root.style.zIndex).toBe('42')
    expect(root.style.pointerEvents).toBe('none')
    expect((wrapper.find('canvas').element as HTMLElement).style.mixBlendMode).toBe('multiply')

    const other = mountCursor({ theme: 'light' })
    expect((other.wrapper.find('canvas').element as HTMLElement).style.mixBlendMode).toBe('normal')
  })

  it('restores parent positioning when WebGL2 is unavailable', () => {
    const { parent } = mountCursor()
    expect(parent.style.position).toBe('')
  })

  it('survives prop changes without WebGL', async () => {
    const { wrapper } = mountCursor({ color: '#ff0000', size: 120 })
    await wrapper.setProps({ color: 'rgb(10, 20, 30)', theme: 'light', clickPuff: false })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})
