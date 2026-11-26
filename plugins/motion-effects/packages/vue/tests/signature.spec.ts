import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Signature from '../src/components/Signature.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountSignature(props: Record<string, unknown> = {}) {
  const wrapper = mount(Signature, { attachTo: document.body, props })
  mounted.push(wrapper)
  return wrapper
}

describe('Signature', () => {
  it('renders play mode with image-like stage, line and byline', () => {
    const wrapper = mountSignature({
      name: 'Ada', role: 'Designer', theme: 'dark', aspect: 2, autoplay: false
    })
    const root = wrapper.find('.signature').element as HTMLElement
    expect(root.style.width).toBe('100%')
    expect(root.style.maxWidth).toBe('720px')

    const stage = wrapper.find('.signature > div').element as HTMLElement
    expect(stage.style.height).toBe('360px')
    expect(stage.style.background).toBe('rgb(20, 20, 22)')
    expect(stage.style.borderRadius).toBe('18px')
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ada')
    expect(wrapper.text()).toContain('Designer')
  })

  it('shows the placeholder and crosshair cursor in sign mode', () => {
    const wrapper = mountSignature({ mode: 'sign', theme: 'light', frame: false, autoplay: false })
    expect(wrapper.text()).toContain('Sign here')
    const canvas = wrapper.find('canvas').element as HTMLElement
    expect(canvas.style.cursor).toBe('crosshair')
    expect(wrapper.find('.signature > div').element).toBeTruthy()
    const stage = wrapper.find('.signature > div').element as HTMLElement
  })

  it('exposes play / clear / undo / getStrokes / toSVG / toDataURL', () => {
    const wrapper = mountSignature({ mode: 'sign', autoplay: false })
    const vm = wrapper.vm as unknown as {
      play: () => void
      clear: () => void
      undo: () => void
      getStrokes: () => unknown[]
      toSVG: () => string
      toDataURL: () => string
    }

    expect(typeof vm.play).toBe('function')
    expect(typeof vm.clear).toBe('function')
    expect(typeof vm.undo).toBe('function')
    expect(vm.getStrokes()).toEqual([])
    expect(vm.toSVG()).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(typeof vm.toDataURL()).toBe('string')

    vm.clear()
    expect(wrapper.emitted('change')?.[0]).toEqual([[]])
  })

  it('captures pointer strokes in sign mode', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0,
      toJSON: () => ({})
    } as DOMRect)
    vi.spyOn(HTMLElement.prototype, 'hasPointerCapture').mockReturnValue(true)
    const wrapper = mountSignature({ mode: 'sign', autoplay: false })
    const canvas = wrapper.find('canvas')

    await canvas.trigger('pointerdown', { pointerId: 1, clientX: 20, clientY: 50, pressure: 0.5 })
    await canvas.trigger('pointermove', { pointerId: 1, clientX: 40, clientY: 60, pressure: 0.5 })
    await canvas.trigger('pointerup', { pointerId: 1 })
    await canvas.trigger('pointerdown', { pointerId: 2, clientX: 60, clientY: 50, pressure: 0.5 })
    await canvas.trigger('pointerup', { pointerId: 2 })

    const strokes = (wrapper.vm as unknown as { getStrokes: () => Array<Array<{ x: number; y: number }>> }).getStrokes()
    expect(strokes).toHaveLength(2)
    expect(strokes[0]).toHaveLength(2)
    expect(strokes[0]![0]!.x).toBeCloseTo(0.1)
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('masks the text reveal during play mode with a custom text', () => {
    const wrapper = mountSignature({ text: 'Ada', autoplay: false, theme: 'dark' })
    const canvas = wrapper.find('canvas').element as HTMLElement
    expect(canvas.style.clipPath).toContain('inset(')
  })

  it('recomputes auto theme from the parent background at runtime', async () => {
    // 回归：theme=auto 的明暗只在 onMounted 推断，运行时从 dark 切回 auto 曾保留旧的暗色。
    const wrapper = mountSignature({ theme: 'dark', autoplay: false, text: 'Ada' })
    const stage = () => wrapper.find('.signature > div').element as HTMLElement
    const parent = (wrapper.find('.signature').element as HTMLElement).parentElement!
    parent.style.backgroundColor = 'rgb(255, 255, 255)' // 亮背景 → auto 应推断为 light
    expect(stage().style.background).toBe('rgb(20, 20, 22)') // 初始 dark

    // 运行时切到 auto：必须按父背景重新推断为 light（回归点：旧实现会停在 dark）
    await wrapper.setProps({ theme: 'auto' })
    expect(stage().style.background).toBe('rgb(255, 255, 255)')

    await wrapper.setProps({ theme: 'dark' })
    expect(stage().style.background).toBe('rgb(20, 20, 22)')

    await wrapper.setProps({ theme: 'auto' })
    expect(stage().style.background).toBe('rgb(255, 255, 255)')
  })
})
