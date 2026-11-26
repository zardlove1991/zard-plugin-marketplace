import { flushPromises, mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LiquidNavbar from '../src/components/LiquidNavbar.vue'
import { NimbusIcons } from '../src/components/liquidNavbarIcons'
import type { LiquidNavItem } from '../src/types'
import { advanceFrames, nextFrame } from './helpers/frames'
import { installAutoIntersectionObserver } from './helpers/canvas2d'
import { installWebGL1Mock } from './helpers/webgl1'

const LABELS = ['Home', 'Explore', 'Flights', 'Weather', 'Profile']

function mountNav(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  const wrapper = mount(LiquidNavbar, { attachTo: document.body, props, attrs })
  mounted.push(wrapper)
  return wrapper
}

type NavWrapper = ReturnType<typeof mountNav>

/** 本轮挂载过的组件，每条测试结束后统一卸载，免得帧循环跨测试继续跑 */
const mounted: Array<{ unmount: () => void }> = []
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount()
  delete (window as unknown as { AudioContext?: unknown }).AudioContext
})

const itemsOf = (wrapper: NavWrapper) => wrapper.findAll('.nimbus-item')
const currentIndexes = (wrapper: NavWrapper) =>
  itemsOf(wrapper)
    .map((item, index) => (item.attributes('aria-current') === 'page' ? index : -1))
    .filter(index => index >= 0)

/** jsdom 没有布局：导航条 420×54（正好装下 5 个条目），条目固定 80×42、间距 2，按自己的序号排开 */
function installLayout(initialWidth = 420) {
  const size = { nav: initialWidth }
  const indexOf = (el: HTMLElement) => LABELS.indexOf(el.getAttribute('aria-label') ?? '')
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('nimbus-nav') ? size.nav : 80
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('nimbus-nav') ? 54 : 42
  })
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
    return 6 + Math.max(0, indexOf(this)) * 82
  })
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(6)
  return size
}

function installReducedMotion(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('reduce') && matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      }) as MediaQueryList
  )
}

interface FakeOscillator {
  type: string
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

interface FakeAudioContext {
  currentTime: number
  destination: unknown
  oscillators: FakeOscillator[]
  close: ReturnType<typeof vi.fn>
}

/** 最小的 AudioContext：能建振荡器与增益，记下 start / stop / close 的调用 */
function installAudio() {
  const contexts: FakeAudioContext[] = []
  class FakeParam {
    setValueAtTime = vi.fn()
    exponentialRampToValueAtTime = vi.fn()
  }
  class FakeAudioContext {
    currentTime = 0
    destination = {}
    oscillators: FakeOscillator[] = []
    close = vi.fn(async () => undefined)
    constructor() {
      contexts.push(this)
    }
    createOscillator() {
      const oscillator = { type: '', frequency: new FakeParam(), connect: vi.fn((node: unknown) => node), start: vi.fn(), stop: vi.fn() }
      this.oscillators.push(oscillator)
      return oscillator
    }
    createGain() {
      return { gain: new FakeParam(), connect: vi.fn((node: unknown) => node) }
    }
  }
  ;(window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext
  return contexts
}

describe('LiquidNavbar', () => {
  describe('结构与降级（无 WebGL）', () => {
    it('默认渲染 5 个按钮项，带内置图标，第一项为当前项', () => {
      const wrapper = mountNav()
      const nav = wrapper.find('nav.nimbus-nav')
      expect(nav.attributes('aria-label')).toBe('Main')
      expect(nav.attributes('data-tone')).toBe('light')
      const items = itemsOf(wrapper)
      expect(items).toHaveLength(5)
      expect(items.map(item => item.text())).toEqual(LABELS)
      for (const [index, item] of items.entries()) {
        expect(item.element.tagName).toBe('BUTTON')
        expect(item.attributes('type')).toBe('button')
        expect(item.attributes('aria-label')).toBe(LABELS[index])
        expect(item.find('.nv-ico svg').exists()).toBe(true)
      }
      expect(currentIndexes(wrapper)).toEqual([0])
    })

    it('带 href 的项渲染成链接，defaultActive 决定初始当前项', () => {
      const wrapper = mountNav({
        defaultActive: 1,
        items: [
          { label: 'Home', href: '/' },
          { label: 'Docs', href: '/docs' }
        ]
      })
      const items = itemsOf(wrapper)
      expect(items[0].element.tagName).toBe('A')
      expect(items[0].attributes('href')).toBe('/')
      expect(items[1].attributes('href')).toBe('/docs')
      expect(currentIndexes(wrapper)).toEqual([1])
    })

    it('tone 与 compact 写进 data 属性；compact 不传时不出现', async () => {
      const wrapper = mountNav()
      const nav = wrapper.find('nav.nimbus-nav')
      expect(nav.attributes('data-compact')).toBeUndefined()
      expect(nav.attributes('data-refract')).toBe('off')

      await wrapper.setProps({ tone: 'dark', compact: true })
      expect(nav.attributes('data-tone')).toBe('dark')
      expect(nav.attributes('data-compact')).toBe('true')

      await wrapper.setProps({ compact: false })
      expect(nav.attributes('data-compact')).toBe('false')
    })

    it('无 WebGL 时退回 CSS 水滴', async () => {
      const wrapper = mountNav()
      await flushPromises()
      expect(wrapper.find('nav.nimbus-nav').attributes('data-gl')).toBe('off')
      expect(wrapper.find('canvas.nimbus-water').exists()).toBe(true)
      expect(wrapper.find('.nimbus-drop').exists()).toBe(true)
      expect(wrapper.find('.nimbus-glass').exists()).toBe(true)
    })

    it('着色器链接失败时同样退回 CSS 水滴', async () => {
      const gl = installWebGL1Mock()
      gl.failLink()
      const wrapper = mountNav()
      await flushPromises()
      expect(wrapper.find('nav.nimbus-nav').attributes('data-gl')).toBe('off')
    })

    it('icon 传 Vue 组件；没有 icon 的项不渲染图标容器', () => {
      const wrapper = mountNav({
        items: [
          { label: 'A', icon: markRaw(NimbusIcons.plane) },
          { label: 'B' },
          { label: 'C', icon: markRaw(NimbusIcons.drop), fx: 'drop' }
        ]
      })
      const items = itemsOf(wrapper)
      expect(items).toHaveLength(3)
      expect(items[0].find('.nv-ico svg').exists()).toBe(true)
      expect(items[1].find('.nv-ico').exists()).toBe(false)
      expect(items[2].find('.nv-ico svg').exists()).toBe(true)
    })

    it('内嵌的折射滤镜是真正的 SVG 滤镜原语', () => {
      const wrapper = mountNav()
      const defs = wrapper.findAll('nav.nimbus-nav > svg')
      expect(defs).toHaveLength(1)
      expect(defs[0].attributes('aria-hidden')).toBe('true')
      expect(defs[0].attributes('style')).toContain('position: absolute')

      // SVG 的元素名区分大小写：Vue 不认识 fe* 原语，写进模板会被当成组件而建出错的名字
      const filter = defs[0].find('filter').element
      expect(filter.id).toBe('nimbus-refract')
      expect(filter.getAttribute('color-interpolation-filters')).toBe('sRGB')
      const primitives = [...filter.children]
      expect(primitives.map(el => el.localName)).toEqual(['feTurbulence', 'feGaussianBlur', 'feDisplacementMap'])
      for (const primitive of primitives) {
        expect(primitive.namespaceURI).toBe('http://www.w3.org/2000/svg')
      }
      expect(primitives[0].getAttribute('base-frequency')).toBe('0.006 0.02')
      expect(primitives[0].getAttribute('seed')).toBe('7')
      expect(primitives[1].getAttribute('std-deviation')).toBe('2')
      expect(primitives[2].getAttribute('in')).toBe('SourceGraphic')
      expect(primitives[2].getAttribute('in2')).toBe('soft')
      expect(primitives[2].getAttribute('scale')).toBe('60')
      expect(primitives[2].getAttribute('x-channel-selector')).toBe('R')
      expect(primitives[2].getAttribute('y-channel-selector')).toBe('G')
    })

    it('class 与 style 自动透传到根元素', () => {
      const wrapper = mountNav({}, { class: 'my-nav', style: 'gap: 4px' })
      const nav = wrapper.find('nav.nimbus-nav')
      expect(nav.classes()).toContain('my-nav')
      expect(nav.attributes('style')).toContain('gap: 4px')
    })

    it('没有 WebGL 时由 CSS 水滴滑到点击的条目上', async () => {
      installLayout()
      const wrapper = mountNav()
      await itemsOf(wrapper)[1].trigger('click')
      await advanceFrames(120)
      const drop = wrapper.find('.nimbus-drop').element as HTMLElement
      // 条目 1 的中心在画布坐标里是 14 + 6 + 82 + 40 = 142；水滴半宽 19 + 21 = 40，
      // 再减去画布留白 14 换回导航条坐标：142 - 40 - 14 = 88
      expect(parseFloat(drop.style.width)).toBeCloseTo(80, 2)
      const [, left, squeeze] = /translateX\(([-\d.]+)px\) scaleY\(([-\d.]+)\)/.exec(drop.style.transform) ?? []
      expect(Number(left)).toBeCloseTo(88, 0)
      expect(Number(squeeze)).toBeCloseTo(1, 1)
    })
  })

  describe('交互', () => {
    it('点击后当前项移动并发出 update:active', async () => {
      const wrapper = mountNav()
      await itemsOf(wrapper)[3].trigger('click')
      expect(wrapper.emitted('update:active')).toEqual([[3]])
      expect(currentIndexes(wrapper)).toEqual([3])
    })

    it('受控时自己不改动，等父级把 active 传回来', async () => {
      const wrapper = mountNav({ active: 2, 'onUpdate:active': () => {} })
      await itemsOf(wrapper)[0].trigger('click')
      expect(wrapper.emitted('update:active')).toEqual([[0]])
      expect(currentIndexes(wrapper)).toEqual([2])

      await wrapper.setProps({ active: 0 })
      expect(currentIndexes(wrapper)).toEqual([0])
    })

    it('再点当前项不发事件，但图标动画会重新播放', async () => {
      const wrapper = mountNav()
      const firstIcon = () => itemsOf(wrapper)[0].find('.nv-ico')
      const before = firstIcon().element
      await itemsOf(wrapper)[1].trigger('click')
      await itemsOf(wrapper)[1].trigger('click')
      expect(wrapper.emitted('update:active')).toEqual([[1]])

      // Explore 的 fx 是 spin：换 key 让 CSS 动画从头再来
      const icon = itemsOf(wrapper)[1].find('.nv-ico')
      expect(icon.attributes('data-fx')).toBe('spin')
      const playing = icon.element
      await itemsOf(wrapper)[1].trigger('click')
      expect(wrapper.emitted('update:active')).toEqual([[1]])
      expect(itemsOf(wrapper)[1].find('.nv-ico').element).not.toBe(playing)
      expect(firstIcon().element).toBe(before)
    })

    it('图标默认动画是 pop；fx 为 none 时不播', async () => {
      const wrapper = mountNav({
        items: [{ label: 'A', icon: markRaw(NimbusIcons.user) }, { label: 'B', icon: markRaw(NimbusIcons.user), fx: 'none' }]
      })
      const icons = () => itemsOf(wrapper)
      await icons()[0].trigger('click')
      expect(icons()[0].find('.nv-ico').attributes('data-fx')).toBe('pop')
      await icons()[1].trigger('click')
      expect(icons()[1].find('.nv-ico').attributes('data-fx')).toBeUndefined()
      expect(currentIndexes(wrapper)).toEqual([1])
    })

    it('左右方向键切换并循环，焦点跟到新项；其它键不处理', async () => {
      const wrapper = mountNav()
      const nav = wrapper.find('nav.nimbus-nav')

      await nav.trigger('keydown', { key: 'ArrowLeft' })
      expect(currentIndexes(wrapper)).toEqual([4])
      expect(document.activeElement).toBe(itemsOf(wrapper)[4].element)

      await nav.trigger('keydown', { key: 'ArrowRight' })
      expect(currentIndexes(wrapper)).toEqual([0])

      await nav.trigger('keydown', { key: 'Enter' })
      expect(currentIndexes(wrapper)).toEqual([0])
      expect(wrapper.emitted('update:active')).toEqual([[4], [0]])
    })
  })

  describe('WebGL 水体', () => {
    it('初始化上下文，按导航条加留白设置画布，并持续画环境水波', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      const wrapper = mountNav()
      await advanceFrames(5)

      expect(wrapper.find('nav.nimbus-nav').attributes('data-gl')).toBe('on')
      const canvas = wrapper.find('canvas.nimbus-water').element as HTMLCanvasElement
      expect(canvas.width).toBe(448)
      expect(canvas.height).toBe(82)
      expect(canvas.style.width).toBe('448px')
      expect(gl.count('createProgram')).toBe(1)
      expect(gl.count('linkProgram')).toBe(1)
      expect(gl.last('uniform4f', 'uPill')).toEqual([14, 14, 420, 54])
      expect(gl.count('drawArrays')).toBeGreaterThanOrEqual(4)
    })

    it('点击后水滴滑向新条目，头尾两段都到位', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      installReducedMotion(false)
      const wrapper = mountNav()
      await itemsOf(wrapper)[3].trigger('click')
      await advanceFrames(140)

      // 条目 3 的中心：14 + 6 + 3×82 + 40 = 306
      const blobs = gl.last('uniform4fv', 'uBlob')?.[0] as Float32Array
      expect(blobs[0]).toBeCloseTo(306, -1)
      expect(blobs[4]).toBeCloseTo(306, -1)
    })

    it('上下文丢失后退回 CSS 水滴并停止绘制', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      const wrapper = mountNav()
      await advanceFrames(3)

      const canvas = wrapper.find('canvas.nimbus-water').element
      const lost = new Event('webglcontextlost', { cancelable: true })
      canvas.dispatchEvent(lost)
      await nextFrame()
      expect(lost.defaultPrevented).toBe(true)
      expect(wrapper.find('nav.nimbus-nav').attributes('data-gl')).toBe('off')

      const drawn = gl.count('drawArrays')
      await advanceFrames(6)
      expect(gl.count('drawArrays')).toBe(drawn)
    })

    it('上下文恢复后重新初始化着色器并继续绘制', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      const wrapper = mountNav()
      await advanceFrames(3)
      const canvas = wrapper.find('canvas.nimbus-water').element
      canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
      await nextFrame()
      expect(wrapper.find('nav.nimbus-nav').attributes('data-gl')).toBe('off')
      const drawn = gl.count('drawArrays')

      canvas.dispatchEvent(new Event('webglcontextrestored'))
      await advanceFrames(5)
      expect(wrapper.find('nav.nimbus-nav').attributes('data-gl')).toBe('on')
      expect(gl.count('createProgram')).toBe(2)
      expect(gl.count('drawArrays')).toBeGreaterThan(drawn + 1)
    })

    it('prefers-reduced-motion 下只画一帧，不再有环境水波', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      installReducedMotion(true)
      mountNav()
      await advanceFrames(8)
      expect(gl.count('drawArrays')).toBe(1)
    })

    it('鼠标移入会抬起来弯，触摸指针不触发', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      installReducedMotion(true)
      const wrapper = mountNav()
      const nav = wrapper.find('nav.nimbus-nav')

      await nav.trigger('pointermove', { pointerType: 'touch', clientX: 120, clientY: 30 })
      await advanceFrames(4)
      expect(gl.count('uniform3f')).toBe(1)

      await nav.trigger('pointermove', { pointerType: 'mouse', clientX: 120, clientY: 30 })
      await advanceFrames(20)
      const mouse = gl.last('uniform3f', 'uMouse') as number[]
      // 导航条的位置是 0，加上画布留白 14
      expect(mouse[0]).toBeCloseTo(134, 5)
      expect(mouse[1]).toBeCloseTo(44, 5)
      expect(mouse[2]).toBeGreaterThan(0.9)
    })

    it('prefers-reduced-motion 下来弯到位后帧循环停下，指针停在导航条上也不空转', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      installReducedMotion(true)
      const wrapper = mountNav()
      const nav = wrapper.find('nav.nimbus-nav')

      await nav.trigger('pointermove', { pointerType: 'mouse', clientX: 200, clientY: 20 })
      await advanceFrames(60)
      // 来弯已经抬到位
      expect((gl.last('uniform3f', 'uMouse') as number[])[2]).toBeGreaterThan(0.99)
      const settled = gl.count('drawArrays')

      await advanceFrames(30)
      expect(gl.count('drawArrays')).toBe(settled)

      // 移出后来弯落回，同样在到位后停下
      await nav.trigger('pointerleave')
      await advanceFrames(60)
      expect((gl.last('uniform3f', 'uMouse') as number[])[2]).toBeLessThan(0.01)
      const released = gl.count('drawArrays')
      await advanceFrames(30)
      expect(gl.count('drawArrays')).toBe(released)
    })

    it('按下产生一圈波纹；reduced-motion 下不产生', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      const wrapper = mountNav()
      await wrapper.find('nav.nimbus-nav').trigger('pointerdown', { clientX: 100, clientY: 20 })
      await advanceFrames(3)
      const ripple = gl.last('uniform4fv', 'uRip')?.[0] as Float32Array
      expect(ripple[0]).toBeCloseTo(114, 5)
      expect(ripple[1]).toBeCloseTo(34, 5)
      expect(ripple[3]).toBeCloseTo(0.8, 5)

      wrapper.unmount()
      mounted.pop()
      installReducedMotion(true)
      const reduced = installWebGL1Mock()
      const still = mountNav()
      await advanceFrames(2)
      const drawn = reduced.count('uniform4fv')
      await still.find('nav.nimbus-nav').trigger('pointerdown', { clientX: 100, clientY: 20 })
      await advanceFrames(4)
      expect(reduced.count('uniform4fv')).toBe(drawn)
    })

    it('切换 compact 会重新测量导航条', async () => {
      const size = installLayout()
      installWebGL1Mock()
      const wrapper = mountNav()
      const canvas = wrapper.find('canvas.nimbus-water').element as HTMLCanvasElement
      expect(canvas.width).toBe(448)

      size.nav = 500
      await wrapper.setProps({ compact: true })
      expect(canvas.width).toBe(528)
    })
  })

  describe('音效与清理', () => {
    it('sound 打开时点击播放一声合成水滴，上下文复用，卸载时关闭', async () => {
      const contexts = installAudio()
      const wrapper = mountNav({ sound: true })

      await itemsOf(wrapper)[1].trigger('click')
      expect(contexts).toHaveLength(1)
      expect(contexts[0].oscillators).toHaveLength(1)
      expect(contexts[0].oscillators[0].start).toHaveBeenCalledWith(0)
      expect(contexts[0].oscillators[0].stop).toHaveBeenCalledWith(0.18)

      await itemsOf(wrapper)[2].trigger('click')
      expect(contexts).toHaveLength(1)
      expect(contexts[0].oscillators).toHaveLength(2)

      wrapper.unmount()
      mounted.pop()
      expect(contexts[0].close).toHaveBeenCalledTimes(1)
    })

    it('sound 关闭时不创建 AudioContext', async () => {
      const contexts = installAudio()
      const wrapper = mountNav()
      await itemsOf(wrapper)[1].trigger('click')
      expect(contexts).toHaveLength(0)
    })

    it('卸载后停掉帧循环、断开观察器并移除页面级监听', async () => {
      installLayout()
      const gl = installWebGL1Mock()
      const io = installAutoIntersectionObserver()
      const remove = vi.spyOn(document, 'removeEventListener')
      const wrapper = mountNav()
      await advanceFrames(3)
      const drawn = gl.count('drawArrays')

      wrapper.unmount()
      mounted.pop()
      await advanceFrames(5)

      expect(gl.count('drawArrays')).toBe(drawn)
      expect(io.instances.every(state => state.disconnected)).toBe(true)
      expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
      io.restore()
    })
  })
})
