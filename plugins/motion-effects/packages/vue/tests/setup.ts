import { afterEach, vi } from 'vitest'

/** jsdom 缺少的浏览器能力：只补到组件可运行的最小面。 */

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    })
  })
}

if (!('ResizeObserver' in window)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver
  ;(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver
}

if (!('IntersectionObserver' in window)) {
  class IntersectionObserverStub {
    root = null
    rootMargin = ''
    thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  ;(window as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver
  ;(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver
}

if (typeof requestAnimationFrame !== 'function') {
  let id = 0
  const timers = new Map<number, ReturnType<typeof setTimeout>>()
  ;(window as unknown as { requestAnimationFrame: typeof requestAnimationFrame }).requestAnimationFrame =
    ((callback: FrameRequestCallback) => {
      id += 1
      timers.set(id, setTimeout(() => callback(performance.now()), 16))
      return id
    }) as typeof requestAnimationFrame
  ;(window as unknown as { cancelAnimationFrame: typeof cancelAnimationFrame }).cancelAnimationFrame =
    ((handle: number) => {
      const timer = timers.get(handle)
      if (timer) clearTimeout(timer)
      timers.delete(handle)
    }) as typeof cancelAnimationFrame
}

const elementProto = HTMLElement.prototype as unknown as {
  setPointerCapture?: (id: number) => void
  releasePointerCapture?: (id: number) => void
  hasPointerCapture?: (id: number) => boolean
}

if (!elementProto.setPointerCapture) elementProto.setPointerCapture = () => {}
if (!elementProto.releasePointerCapture) elementProto.releasePointerCapture = () => {}
if (!elementProto.hasPointerCapture) elementProto.hasPointerCapture = () => false

/** jsdom 没有 canvas 实现；组件在 WebGL2 不可用时应走 CSS 兜底。 */
const canvasProto = HTMLCanvasElement.prototype as unknown as {
  getContext: (...args: unknown[]) => null
}
canvasProto.getContext = () => null

afterEach(() => {
  vi.restoreAllMocks()
})