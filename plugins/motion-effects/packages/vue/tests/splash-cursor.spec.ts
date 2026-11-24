import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import SplashCursor from '../src/components/SplashCursor.vue'
import { advanceFrames } from './helpers/frames'
import { installWebGL2Mock } from './helpers/webgl2'

function mountCursor(props: Record<string, unknown> = {}) {
  return mount(SplashCursor, { attachTo: document.body, props })
}

function movePointer(x = 120, y = 90) {
  window.dispatchEvent(
    Object.assign(new Event('pointermove'), { clientX: x, clientY: y, pointerType: 'mouse' })
  )
}

describe('SplashCursor', () => {
  it('renders a hidden root with a canvas and the default z-index', () => {
    const wrapper = mountCursor()
    expect(wrapper.classes()).toContain('splash-cursor')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('canvas.splash-cursor__canvas').exists()).toBe(true)
    expect(wrapper.element.style.getPropertyValue('z-index')).toBe('50')
    wrapper.unmount()
  })

  it('applies className, inline style and contained marker', () => {
    const wrapper = mountCursor({
      className: 'my-cursor',
      style: { opacity: '0.8' },
      contained: true,
      zIndex: 7
    })
    expect(wrapper.classes()).toContain('my-cursor')
    expect(wrapper.attributes('data-contained')).toBe('')
    expect(wrapper.element.style.getPropertyValue('z-index')).toBe('7')
    expect(wrapper.element.style.getPropertyValue('opacity')).toBe('0.8')
    wrapper.unmount()
  })

  it('shows a fallback and does not throw when WebGL2 is unavailable', async () => {
    const wrapper = mountCursor()
    await nextTick()
    expect(wrapper.find('.splash-cursor__fallback').exists()).toBe(true)
    expect(wrapper.text()).toContain('不支持 WebGL2')
    expect(() => wrapper.unmount()).not.toThrow()
  })

  describe('with a WebGL2 context', () => {
    it('initializes the engine and renders without a fallback', async () => {
      const gl = installWebGL2Mock()
      const wrapper = mountCursor()
      await nextTick()
      expect(wrapper.find('.splash-cursor__fallback').exists()).toBe(false)
      expect(gl.count('createProgram')).toBeGreaterThan(0)
      wrapper.unmount()
    })

    it('draws after a pointer moves and survives unmount', async () => {
      const gl = installWebGL2Mock()
      const wrapper = mountCursor()
      movePointer()
      await advanceFrames(3)
      expect(gl.count('drawArrays')).toBeGreaterThan(0)
      expect(gl.errors).toEqual([])
      expect(() => wrapper.unmount()).not.toThrow()
    })

    it('restarts the engine when props change', async () => {
      const gl = installWebGL2Mock()
      const wrapper = mountCursor({ swirl: 3 })
      const first = gl.count('createProgram')
      expect(first).toBeGreaterThan(0)

      await wrapper.setProps({ swirl: 6 })
      expect(gl.count('createProgram')).toBeGreaterThan(first)
      wrapper.unmount()
    })

    it('rebuilds GPU resources after context restoration', () => {
      const gl = installWebGL2Mock()
      const wrapper = mountCursor()
      const canvas = wrapper.find('canvas').element
      const first = gl.count('createProgram')

      const lost = new Event('webglcontextlost', { cancelable: true })
      canvas.dispatchEvent(lost)
      expect(lost.defaultPrevented).toBe(true)
      gl.restore()
      canvas.dispatchEvent(new Event('webglcontextrestored'))

      expect(gl.count('createProgram')).toBeGreaterThan(first)
      expect(gl.errors).toEqual([])
      wrapper.unmount()
    })

    it('respects clickSplash=false without throwing on pointer down', async () => {
      const gl = installWebGL2Mock()
      const wrapper = mountCursor({ clickSplash: false })
      window.dispatchEvent(
        Object.assign(new Event('pointerdown'), { clientX: 10, clientY: 10, pointerType: 'mouse' })
      )
      await advanceFrames(2)
      expect(gl.errors).toEqual([])
      wrapper.unmount()
    })
  })
})
