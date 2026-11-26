import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GlassSurface from '../src/components/GlassSurface.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountGlass(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  const wrapper = mount(GlassSurface, {
    attachTo: document.body,
    props,
    attrs,
    slots: { default: '<span class="inner">Hello</span>' }
  })
  mounted.push(wrapper)
  return wrapper
}

const filterTags = () =>
  Array.from(document.querySelectorAll('svg.glass-surface__filter filter > *')).map(el => el.tagName)

describe('GlassSurface', () => {
  it('renders the layered DOM, slot content and default CSS variables', () => {
    const wrapper = mountGlass()
    const root = wrapper.find('.glass-surface')

    expect(root.exists()).toBe(true)
    expect(root.classes()).toContain('glass-surface--fallback')
    expect(wrapper.find('.glass-surface__content .inner').text()).toBe('Hello')
    // jsdom 没有 backdrop-filter / WebGL：走雾面兜底，但滤镜结构仍要建出来
    expect(wrapper.find('.glass-surface__sheen').exists()).toBe(true)
    expect(wrapper.find('.glass-surface__rim').exists()).toBe(true)
    expect(wrapper.find('canvas').exists()).toBe(false)

    const el = root.element as HTMLElement
    expect(el.style.width).toBe('200px')
    expect(el.style.height).toBe('80px')
    expect(el.style.borderRadius).toBe('20px')
    expect(el.style.getPropertyValue('--glass-frost')).toBe('0')
    expect(el.style.getPropertyValue('--glass-saturation')).toBe('1')
    expect(el.style.getPropertyValue('--filter-id')).toMatch(/^url\(#glass-filter-/)
  })

  it('builds the SVG filter with h() so all fe* primitives keep their names', () => {
    mountGlass()
    const tags = filterTags()

    expect(tags).toEqual([
      'feImage',
      'feDisplacementMap', 'feColorMatrix',
      'feDisplacementMap', 'feColorMatrix',
      'feDisplacementMap', 'feColorMatrix',
      'feBlend', 'feBlend',
      'feGaussianBlur'
    ])
    const maps = document.querySelectorAll('feDisplacementMap')
    expect(maps).toHaveLength(3)
    expect(Array.from(maps).map(node => node.getAttribute('scale'))).toEqual(['-180', '-170', '-160'])
    for (const node of Array.from(maps)) {
      expect(node.getAttribute('xChannelSelector')).toBe('R')
      expect(node.getAttribute('yChannelSelector')).toBe('G')
    }
    const image = document.querySelector('feImage')!
    expect(image.getAttribute('href')).toContain('data:image/svg+xml')
  })

  it('applies channel offsets, blur, className, style and attribute passthrough', async () => {
    const wrapper = mountGlass(
      {
        width: '60%', height: 240, borderRadius: 32, displace: 3,
        distortionScale: -100, redOffset: 5, greenOffset: 15, blueOffset: 25,
        xChannel: 'G', yChannel: 'B', blur: 7,
        backgroundOpacity: 0.2, saturation: 1.4,
        className: 'featured', style: { zIndex: 3 }
      },
      { id: 'glass-1' }
    )
    await nextTick()

    const root = wrapper.find('.glass-surface')
    const el = root.element as HTMLElement
    expect(el.classList.contains('featured')).toBe(true)
    expect(el.getAttribute('id')).toBe('glass-1')
    expect(el.style.width).toBe('60%')
    expect(el.style.height).toBe('240px')
    expect(el.style.borderRadius).toBe('32px')
    expect(el.style.zIndex).toBe('3')
    expect(el.style.getPropertyValue('--glass-frost')).toBe('0.2')
    expect(el.style.getPropertyValue('--glass-saturation')).toBe('1.4')

    const scales = Array.from(document.querySelectorAll('feDisplacementMap')).map(node => node.getAttribute('scale'))
    expect(scales).toEqual(['-95', '-85', '-75'])
    const channels = Array.from(document.querySelectorAll('feDisplacementMap'))
    for (const node of channels) {
      expect(node.getAttribute('xChannelSelector')).toBe('G')
      expect(node.getAttribute('yChannelSelector')).toBe('B')
    }
    const blurNode = document.querySelector('feGaussianBlur')!
    expect(blurNode.getAttribute('stdDeviation')).toBe('3')
  })

  it('hides content until a requested shape finishes loading', () => {
    const wrapper = mountGlass({ shape: 'data:image/svg+xml,shape' })
    const el = wrapper.find('.glass-surface').element as HTMLElement

    expect(el.style.opacity).toBe('0')
    expect(el.style.transition).toBe('none')
    expect(wrapper.find('.glass-surface__line').exists()).toBe(false)
  })

  it('traces a loaded shape into an outline and masks the root with it', async () => {
    const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200)
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(80)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((kind: string) => {
      if (kind !== '2d') return null
      return {
        createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        putImageData: () => {},
        drawImage: () => {},
        clearRect: () => {},
        texImage2D: () => {}
      }
    }) as never)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AA')
    vi.spyOn(globalThis, 'Image').mockImplementation(() => {
      const image = document.createElement('img') as HTMLImageElement
      Object.defineProperty(image, 'naturalWidth', { value: 100 })
      Object.defineProperty(image, 'naturalHeight', { value: 100 })
      queueMicrotask(() => image.onload?.(new Event('load')))
      return image
    })

    const wrapper = mountGlass({ shape: 'data:image/svg+xml,shape' })
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()
    await nextTick()

    const root = wrapper.find('.glass-surface').element as HTMLElement
    expect(root.style.opacity).toBe('')
    expect(root.style.getPropertyValue('mask')).toContain('data:image/svg+xml,shape')
    expect(wrapper.find('.glass-surface__line').exists()).toBe(true)
    expect(wrapper.find('.glass-surface__glow').exists()).toBe(true)
    expect(wrapper.find('.glass-surface__rim').exists()).toBe(false)

    width.mockRestore()
    height.mockRestore()
  })

  it('falls back when WebGL is requested but a context cannot be created', async () => {
    const backdrop = document.createElement('img')
    const wrapper = mountGlass({ backdrop, renderer: 'webgl' })
    await nextTick()
    await nextTick()

    // jsdom 支持 backdropFilter 但拿不到 WebGL：先尝试 webgl，失败后走 SVG 折射
    expect(wrapper.find('.glass-surface').classes()).toContain('glass-surface--svg')
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('disconnects its ResizeObserver on unmount', () => {
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect')
    const wrapper = mountGlass()
    wrapper.unmount()

    expect(disconnect).toHaveBeenCalled()
    // 已从 tracked 列表移除，afterEach 不会重复卸载
    mounted.splice(mounted.indexOf(wrapper), 1)
  })
})
