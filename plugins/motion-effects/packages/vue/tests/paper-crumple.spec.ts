import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import PaperCrumple from '../src/components/PaperCrumple.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountPaper(props: Record<string, unknown> = {}) {
  const wrapper = mount(PaperCrumple, {
    attachTo: document.body,
    props: { src: '/paper.jpg', ...props }
  })
  mounted.push(wrapper)
  return wrapper
}

describe('PaperCrumple', () => {
  it('renders the stage, canvas, fallback image and ARIA live region', async () => {
    const wrapper = mountPaper({ sceneHeight: 480, imageFit: 'contain', rotation: -8 })
    await nextTick()
    const root = wrapper.find('.paper-crumple')

    expect((root.element as HTMLElement).style.height).toBe('480px')
    expect(root.attributes('data-status')).toBe('error') // jsdom 没有 WebGL
    expect(wrapper.find('canvas.paper-crumple-canvas').exists()).toBe(true)
    expect(wrapper.find('img.paper-crumple-fallback').attributes('src')).toBe('/paper.jpg')
    expect((wrapper.find('img.paper-crumple-fallback').element as HTMLElement).style.objectFit).toBe('contain')
    expect(wrapper.find('[role="status"]').text()).toContain('unavailable')
    expect(wrapper.find('button.paper-crumple-hit').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button.paper-crumple-hit').attributes('aria-label')).toContain('Hold to crumple')
  })

  it('reports the missing-src error and exposes reset / cancel', async () => {
    const wrapper = mountPaper({ src: undefined })
    await nextTick()
    expect(wrapper.emitted('error')).toBeTruthy()

    const vm = wrapper.vm as unknown as { reset: () => void; cancel: () => void }
    expect(typeof vm.reset).toBe('function')
    expect(typeof vm.cancel).toBe('function')
    vm.reset()
    vm.cancel()
  })

  it('honors shadow props for the canvas filter', async () => {
    const withShadow = mountPaper({ shadow: false })
    await nextTick()
    expect((withShadow.find('canvas').element as HTMLElement).style.filter).toBe('')

    const wrapper = mountPaper({ shadow: true, shadowOpacity: 0.25 })
    await nextTick()
    expect((wrapper.find('canvas').element as HTMLElement).style.filter).toContain('drop-shadow')
  })
})
