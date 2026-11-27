import { vi } from 'vitest'

/**
 * 给 canvas 装一个记录调用的 2D 上下文桩。
 *
 * jsdom 没有 canvas 实现（setup.ts 把 getContext 桩成 null）。PeakChart 的渲染引擎
 * 只依赖 2D 上下文的绘制语义，不依赖真实像素输出，所以桩还原组件用到的 API 面：
 * createImageData 返回真实数组（逐像素绘制循环要写它），其余绘制调用只记录。
 * 用 vi.spyOn 安装，afterEach 的 restoreAllMocks 会自动还原。
 */
export function installCanvas2DMock() {
  const calls: Array<{ name: string; args: unknown[] }> = []
  const record = (name: string) => (...args: unknown[]) => {
    calls.push({ name, args })
  }
  const gradient = () => ({ addColorStop: record('addColorStop') })

  const ctx = new Proxy({} as Record<string, unknown>, {
    get(target, key: string) {
      if (key === 'createImageData') {
        return (w: number, h: number) => ({
          width: w,
          height: h,
          data: new Uint8ClampedArray(w * h * 4)
        })
      }
      if (key === 'createLinearGradient' || key === 'createRadialGradient') {
        return (...args: unknown[]) => {
          calls.push({ name: key, args })
          return gradient()
        }
      }
      if (key in target) return target[key]
      return record(key)
    },
    set(target, key: string, value) {
      target[key] = value
      return true
    }
  })

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    ((type: string) => (type === '2d' ? ctx : null)) as typeof HTMLCanvasElement.prototype.getContext
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,TEST')

  return {
    calls,
    count: (name: string) => calls.filter(call => call.name === name).length
  }
}

/**
 * 挂载即视为可见的 IntersectionObserver：observe 时立即回调 isIntersecting: true，
 * 让揭示动画的时钟在 jsdom 里走起来；同时记录 disconnect 供卸载清理断言。
 */
export function installAutoIntersectionObserver() {
  const Original = globalThis.IntersectionObserver
  const instances: Array<{ disconnected: boolean }> = []

  class AutoIntersectionObserver {
    root = null
    rootMargin = ''
    thresholds = []
    private state = { disconnected: false }
    constructor(private callback: IntersectionObserverCallback) {
      instances.push(this.state)
    }
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      )
    }
    unobserve() {}
    disconnect() {
      this.state.disconnected = true
    }
    takeRecords() {
      return []
    }
  }

  globalThis.IntersectionObserver = AutoIntersectionObserver as unknown as typeof IntersectionObserver
  ;(window as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    globalThis.IntersectionObserver

  return {
    instances,
    restore: () => {
      globalThis.IntersectionObserver = Original
      ;(window as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = Original
    }
  }
}

/**
 * 会立刻回调一次的 ResizeObserver。
 *
 * setup.ts 装的是空实现，组件的尺寸回调在 jsdom 里永远不跑——
 * 于是「回调里引用了没定义的常量」这类错误在测试里看不见，浏览器里才炸。
 * 这里让 observe() 立刻回调一次，把那条路径逼出来。
 */
export function installAutoResizeObserver() {
  const Original = globalThis.ResizeObserver
  const instances: Array<{ disconnected: boolean }> = []

  class AutoResizeObserver {
    root = null
    rootMargin = ''
    thresholds = []
    private state = { disconnected: false }
    constructor(private callback: ResizeObserverCallback) {
      instances.push(this.state)
    }
    observe(target: Element) {
      this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver)
    }
    unobserve() {}
    disconnect() {
      this.state.disconnected = true
    }
  }

  globalThis.ResizeObserver = AutoResizeObserver as unknown as typeof ResizeObserver
  ;(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = globalThis.ResizeObserver

  return {
    instances,
    restore: () => {
      globalThis.ResizeObserver = Original
      ;(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = Original
    }
  }
}
