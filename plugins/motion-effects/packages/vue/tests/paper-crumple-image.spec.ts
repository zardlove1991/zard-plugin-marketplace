import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * PaperCrumple 的「图片真的被加载」回归测试。
 *
 * jsdom 没有 WebGL，组件会在创建 renderer 时就走进错误分支，
 * 于是「option 取值器被当值用」这类错误在测试里看不见：
 * 之前 load(src) 传的是取值器本身，图片永远加载失败，
 * 组件永远停在 error 状态、只显示兜底图。
 *
 * 这里把 three 的 WebGLRenderer / TextureLoader 换成桩，
 * 让初始化真正跑到纹理加载那一步，再断言：
 * 1. 传给 loader 的是解析后的地址字符串，而不是函数
 * 2. width / height 等参数真的被用上
 */
const loaded: string[] = []

vi.mock('three', async importOriginal => {
  const actual = await importOriginal<typeof import('three')>()

  class FakeRenderer {
    capabilities = { getMaxAnisotropy: () => 8 }
    shadowMap = { enabled: false, type: 0 }
    domElement = document.createElement('canvas')
    setClearColor() {}
    setPixelRatio() {}
    setSize() {}
    render() {}
    dispose() {}
    getContext() {
      return null
    }
  }

  class FakeTextureLoader {
    setCrossOrigin() {}
    load(url: string, onLoad: (texture: unknown) => void) {
      loaded.push(url)
      onLoad({
        image: { width: 800, height: 600 },
        repeat: { x: 1, y: 1, set() {} },
        offset: { x: 0, y: 0, set() {} },
        colorSpace: '',
        anisotropy: 1,
        needsUpdate: false,
        dispose() {}
      })
    }
  }

  return { ...actual, WebGLRenderer: FakeRenderer, TextureLoader: FakeTextureLoader }
})

const { default: PaperCrumple } = await import('../src/components/PaperCrumple.vue')

afterEach(() => {
  loaded.length = 0
})

describe('PaperCrumple 图片加载', () => {
  it('把解析后的图片地址交给纹理加载器，而不是取值器本身', async () => {
    const wrapper = mount(PaperCrumple, {
      attachTo: document.body,
      props: { src: '/paper.jpg', width: 320, height: 400 }
    })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    expect(loaded).toEqual(['/paper.jpg'])
    expect(typeof loaded[0]).toBe('string')
    expect(wrapper.find('.paper-crumple').attributes('data-status')).toBe('ready')
    wrapper.unmount()
  })

  it('没有 src 时不加载纹理并报出缺少图片的错误', async () => {
    const wrapper = mount(PaperCrumple, {
      attachTo: document.body,
      props: { src: undefined }
    })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    expect(loaded).toEqual([])
    expect(wrapper.emitted('error')).toBeTruthy()
    wrapper.unmount()
  })
})
