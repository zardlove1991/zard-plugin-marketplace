import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ScrollLockedVideoHero from '../src/components/ScrollLockedVideoHero.vue'
import * as entry from '../src/index'

const DEFAULT_VIDEO =
  'https://cdn.21st.dev/assets/mirror/21/21a77eac28eacbb7e142016eefeaa0b4a766619e51113629a3bc6df6af066c0f.mp4'

/** jsdom 不实现视频播放：挂载时的"播放再暂停"预热需要它返回一个 promise */
beforeEach(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    value: vi.fn().mockResolvedValue(undefined),
    configurable: true,
    writable: true
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

function mountHero(props: Record<string, unknown> = {}) {
  return mount(ScrollLockedVideoHero, { attachTo: document.body, props })
}

/** 任意挂载结果里的元素（带不带透传的 class / style，包装器的类型都不同，所以只取用得到的部分） */
const element = (
  wrapper: { find: (selector: string) => { element: Element } },
  selector: string
) => wrapper.find(selector).element as HTMLElement

describe('ScrollLockedVideoHero', () => {
  it('renders the video, title, tagline, hint and signature with the upstream defaults', () => {
    const wrapper = mountHero()
    const video = element(wrapper, '.slvh-video') as HTMLVideoElement
    expect(video.getAttribute('src')).toBe(DEFAULT_VIDEO)
    expect(video.muted).toBe(true)
    expect(video.hasAttribute('playsinline')).toBe(true)
    expect(video.getAttribute('preload')).toBe('auto')
    expect(wrapper.find('.slvh-shade').exists()).toBe(true)
    expect(element(wrapper, '.slvh-title').textContent?.trim()).toBe('THE CITY OPENS')
    expect(element(wrapper, '.slvh-tagline').textContent?.trim()).toBe(
      'Every door in the city is already open.'
    )
    expect(element(wrapper, '.slvh-hint').textContent?.trim()).toBe('SCROLL')
    expect(wrapper.find('.slvh-hint svg').exists()).toBe(true)
    const link = wrapper.find('.slvh-signature a')
    expect(link.text()).toBe('guglielmogiannattasio.exe')
    expect(link.attributes('href')).toBe('https://www.guglielmogiannattasio.it')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.find('.slvh-track .slvh-progress').exists()).toBe(true)
    wrapper.unmount()
  })

  it('lets props override the defaults and hides the tagline and signature when disabled', () => {
    const custom = mountHero({
      videoSrc: '/clip.mp4',
      title: 'HELLO',
      scrollHint: 'SWIPE',
      tagline: 'Goodbye',
      signature: { name: 'studio', url: 'https://example.com' }
    })
    expect(element(custom, '.slvh-video').getAttribute('src')).toBe('/clip.mp4')
    expect(element(custom, '.slvh-title').textContent?.trim()).toBe('HELLO')
    expect(element(custom, '.slvh-hint').textContent?.trim()).toBe('SWIPE')
    expect(element(custom, '.slvh-tagline').textContent?.trim()).toBe('Goodbye')
    expect(custom.find('.slvh-signature a').attributes('href')).toBe('https://example.com')
    custom.unmount()

    const bare = mountHero({ tagline: '', signature: false })
    expect(bare.find('.slvh-tagline').exists()).toBe(false)
    expect(bare.find('.slvh-signature').exists()).toBe(false)
    bare.unmount()
  })

  it('keeps the video transparent until its data has loaded', async () => {
    const wrapper = mountHero()
    const video = element(wrapper, '.slvh-video')
    expect(video.style.opacity).toBe('0')
    video.dispatchEvent(new Event('loadeddata'))
    await nextTick()
    expect(video.style.opacity).toBe('1')
    wrapper.unmount()
  })

  // 静态样式在样式表里，jsdom 读不到；这里只验证透传本身，视觉效果留给真实浏览器
  it('passes class and style through to the root, with the style overriding the defaults', () => {
    const wrapper = mount(ScrollLockedVideoHero, {
      attachTo: document.body,
      props: { class: 'my-hero', style: { height: '50vh' } }
    })
    const root = element(wrapper, '.slvh')
    expect(root.classList.contains('my-hero')).toBe(true)
    expect(root.style.height).toBe('50vh')
    wrapper.unmount()
  })
})

/** 给 jsdom 的 video 装上可控的时长与播放位置；seek 完成后像浏览器一样派发 seeked */
function armVideo(video: HTMLVideoElement, duration = 10, autoSeeked = true) {
  let time = 0
  const seeks: number[] = []
  Object.defineProperty(video, 'duration', { get: () => duration, configurable: true })
  Object.defineProperty(video, 'currentTime', {
    get: () => time,
    set: (value: number) => {
      time = value
      seeks.push(value)
      if (autoSeeked) queueMicrotask(() => video.dispatchEvent(new Event('seeked')))
    },
    configurable: true
  })
  return { time: () => time, seeks }
}

/** 触发一次触摸事件；jsdom 没有完整的 TouchEvent，所以像指针事件那样直接补上 touches */
function fireTouch(target: EventTarget, type: string, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { touches: [{ clientY }] })
  return target.dispatchEvent(event)
}

const wheel = (deltaY: number) =>
  window.dispatchEvent(new WheelEvent('wheel', { deltaY, cancelable: true }))

/** 推进 count 个真实帧（假定时器下的 rAF），并让 seeked 微任务跑完 */
async function frames(count: number) {
  for (let index = 0; index < count; index++) {
    await vi.advanceTimersToNextFrame()
    await flushPromises()
  }
}

describe('ScrollLockedVideoHero scroll lock', () => {
  it('pins the page while mounted and restores it on unmount', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(640)
    vi.stubGlobal('scrollTo', vi.fn())
    const wrapper = mountHero()
    const body = document.body.style
    expect(body.position).toBe('fixed')
    expect(body.top).toBe('-640px')
    expect(body.left).toBe('0px')
    expect(body.right).toBe('0px')
    expect(body.width).toBe('100%')
    expect(body.height).toBe('100%')

    wrapper.unmount()
    expect(body.position).toBe('')
    expect(body.top).toBe('')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 640)
  })

  it('kick-starts loading with a silent play that is paused right away', async () => {
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined)
    const wrapper = mountHero()
    const play = vi.mocked((element(wrapper, '.slvh-video') as HTMLVideoElement).play)
    expect(play).toHaveBeenCalledTimes(1)
    expect(pause).not.toHaveBeenCalled()
    await flushPromises()
    expect(pause).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})

describe('ScrollLockedVideoHero scrubbing', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  /** 挂载并加载好一个 10 秒的视频，scrubDistance 1000px */
  async function mountLoaded(props: Record<string, unknown> = {}) {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0)
    vi.stubGlobal('scrollTo', vi.fn())
    const wrapper = mountHero({ scrubDistance: 1000, ...props })
    const video = element(wrapper, '.slvh-video') as HTMLVideoElement
    const media = armVideo(video, 10)
    video.dispatchEvent(new Event('loadeddata'))
    await nextTick()
    await frames(2)
    return { wrapper, video, media }
  }

  it('takes over the wheel to scrub the video forward and backward', async () => {
    const { wrapper, video, media } = await mountLoaded()
    // 向下 500px：目标进度 0.5。第一帧缓动 18% → 0.09 → 视频 0.9s
    expect(wheel(500)).toBe(false)
    await frames(1)
    expect(media.time()).toBeCloseTo(0.9, 6)
    expect(video.style.transform).toBe(`scale(${1 + 0.09 * 0.06})`)
    expect(element(wrapper, '.slvh-progress').style.transform).toBe('scaleX(0.09)')
    expect(Number(element(wrapper, '.slvh-title').style.opacity)).toBeCloseTo(1 - 0.09 / 0.35, 6)
    expect(element(wrapper, '.slvh-hint').style.opacity).toBe('0')
    expect(element(wrapper, '.slvh-tagline').style.opacity).toBe('0')

    await frames(30)
    const forward = media.time()
    expect(forward).toBeGreaterThan(0.9)
    expect(forward).toBeLessThan(5)

    // 往回滚：进度回落
    expect(wheel(-200)).toBe(false)
    await frames(30)
    expect(media.time()).toBeLessThan(forward)
    wrapper.unmount()
  })

  it('reveals the tagline only once the video is nearly done', async () => {
    const { wrapper } = await mountLoaded()
    wheel(2000)
    // 缓动是渐近的：40 帧后进度约 0.9996
    await frames(40)
    expect(Number(element(wrapper, '.slvh-tagline').style.opacity)).toBeCloseTo(1, 2)
    expect(element(wrapper, '.slvh-title').style.opacity).toBe('0')
    const scaleX = Number(/scaleX\(([^)]+)\)/.exec(element(wrapper, '.slvh-progress').style.transform)?.[1])
    expect(scaleX).toBeCloseTo(1, 2)
    wrapper.unmount()
  })

  it('keeps the hint visible until the first scroll and clamps progress at both ends', async () => {
    const { wrapper } = await mountLoaded()
    await frames(3)
    expect(element(wrapper, '.slvh-hint').style.opacity).toBe('1')
    // 还没滚动时，向上滚不会把进度推到负数
    expect(wheel(-400)).toBe(false)
    await frames(3)
    expect(element(wrapper, '.slvh-progress').style.transform).toBe('scaleX(0)')
    expect(element(wrapper, '.slvh-hint').style.opacity).toBe('1')
    wrapper.unmount()
  })

  it('follows touch drags', async () => {
    const { wrapper, media } = await mountLoaded()
    const section = element(wrapper, '.slvh')
    fireTouch(section, 'touchstart', 300)
    expect(fireTouch(section, 'touchmove', 100)).toBe(false)
    await frames(1)
    expect(media.time()).toBeCloseTo(0.36, 6)
    wrapper.unmount()
  })
})

describe('ScrollLockedVideoHero fallbacks and cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0)
    vi.stubGlobal('scrollTo', vi.fn())
  })

  it('shows a late frame without animating when reduced motion is preferred', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)
    const wrapper = mountHero({ scrubDistance: 1000 })
    const video = element(wrapper, '.slvh-video') as HTMLVideoElement
    const media = armVideo(video, 10)
    video.dispatchEvent(new Event('loadeddata'))
    expect(media.time()).toBeCloseTo(9.2, 6)

    // 滚动输入仍被接管（页面不会动），但视频不再跟随
    expect(wheel(500)).toBe(false)
    await frames(3)
    expect(media.time()).toBeCloseTo(9.2, 6)
    wrapper.unmount()
  })

  it('applies a changed scrubDistance to later input without resetting the video', async () => {
    const { wrapper, media } = await (async () => {
      const wrapper = mountHero({ scrubDistance: 1000 })
      const video = element(wrapper, '.slvh-video') as HTMLVideoElement
      const media = armVideo(video, 10)
      video.dispatchEvent(new Event('loadeddata'))
      await nextTick()
      return { wrapper, media }
    })()
    wheel(500)
    await frames(40)
    expect(media.time()).toBeCloseTo(5, 1)

    // React 版改这个 prop 会让 effect 重跑，时长归零，视频从此不再跟随滚动
    await wrapper.setProps({ scrubDistance: 2000 })
    wheel(500)
    await frames(60)
    expect(media.time()).toBeCloseTo(7.5, 1)
    wrapper.unmount()
  })

  it('keeps only one seek in flight and applies the latest pending time afterwards', async () => {
    const wrapper = mountHero({ scrubDistance: 1000 })
    const video = element(wrapper, '.slvh-video') as HTMLVideoElement
    const media = armVideo(video, 10, false)
    video.dispatchEvent(new Event('loadeddata'))
    await nextTick()

    wheel(1000)
    await frames(5)
    // 上一次 seek 还没完成，后面几帧的目标都只保留最后一个
    expect(media.seeks).toHaveLength(1)

    video.dispatchEvent(new Event('seeked'))
    await flushPromises()
    expect(media.seeks).toHaveLength(2)
    expect(media.seeks[1]).toBeGreaterThan(media.seeks[0]!)
    wrapper.unmount()
  })

  it('stops capturing input and animating once unmounted', async () => {
    const wrapper = mountHero({ scrubDistance: 1000 })
    const video = element(wrapper, '.slvh-video') as HTMLVideoElement
    armVideo(video, 10)
    video.dispatchEvent(new Event('loadeddata'))
    await nextTick()
    wheel(1000)
    await frames(2)
    const before = video.style.transform
    expect(before).not.toBe('')

    wrapper.unmount()
    // 页面恢复滚动：滚轮事件不再被拦截
    expect(wheel(100)).toBe(true)
    await frames(5)
    expect(video.style.transform).toBe(before)
  })

  it('is exported from the package entry', () => {
    expect(entry.ScrollLockedVideoHero).toBe(ScrollLockedVideoHero)
  })
})
