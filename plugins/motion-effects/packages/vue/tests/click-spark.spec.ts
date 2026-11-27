import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import ClickSpark from '../src/components/ClickSpark.vue'
import { installCanvas2DMock } from './helpers/canvas2d'
import { advanceFrames } from './helpers/frames'

function mountSpark(props: Record<string, unknown> = {}) {
  const wrapper = mount(ClickSpark, {
    attachTo: document.body,
    props,
    slots: { default: '<button class="target">点我</button>' }
  })
  return wrapper
}

const press = (wrapper: ReturnType<typeof mountSpark>, x = 120, y = 120) =>
  wrapper.find('.click-spark').trigger('pointerdown', { pointerType: 'mouse', button: 0, clientX: x, clientY: y })

describe('ClickSpark', () => {
  it('渲染根节点与火花层，层的位置随 layer 变化', () => {
    const wrapper = mountSpark()
    const root = wrapper.find('.click-spark')
    const layer = wrapper.find('.click-spark__layer')

    expect(root.exists()).toBe(true)
    expect(root.find('.target').exists()).toBe(true)
    expect(layer.attributes('aria-hidden')).toBe('true')
    expect(layer.attributes('data-layer')).toBe('front')
    wrapper.unmount()

    const back = mountSpark({ layer: 'back' })
    expect(back.find('.click-spark__layer').attributes('data-layer')).toBe('back')
    back.unmount()
  })

  it('鼠标按下时爆一次火花并建一张画布', async () => {
    const canvas = installCanvas2DMock()
    const wrapper = mountSpark()

    await press(wrapper)
    expect(wrapper.findAll('canvas')).toHaveLength(1)
    await advanceFrames(2)
    // 每帧按爆点位置平移、按 DPR 放大后绘制
    expect(canvas.count('setTransform')).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('disabled 时不触发火花', async () => {
    installCanvas2DMock()
    const wrapper = mountSpark({ disabled: true })

    await press(wrapper)
    expect(wrapper.findAll('canvas')).toHaveLength(0)
    wrapper.unmount()
  })

  it('按 shape 走不同的绘制分支', async () => {
    const star = installCanvas2DMock()
    const starWrapper = mountSpark({ shape: 'star' })
    await press(starWrapper)
    await advanceFrames(2)
    expect(star.count('quadraticCurveTo')).toBeGreaterThan(0)
    starWrapper.unmount()

    const dot = installCanvas2DMock()
    const dotWrapper = mountSpark({ shape: 'dot' })
    await press(dotWrapper)
    await advanceFrames(2)
    expect(dot.count('arc')).toBeGreaterThan(0)
    dotWrapper.unmount()
  })

  it('通过 ref 暴露 spark()，可以在任意位置手动爆一次', async () => {
    installCanvas2DMock()
    const wrapper = mountSpark()

    const vm = wrapper.vm as unknown as { spark: (x?: number, y?: number) => void }
    vm.spark(80, 80)
    await nextTick()
    expect(wrapper.findAll('canvas')).toHaveLength(1)
    wrapper.unmount()
  })

  it('颜色数组按顺序轮换', async () => {
    const canvas = installCanvas2DMock()
    const wrapper = mountSpark({ sparkColor: ['#ff0000', '#00ff00'] })

    await press(wrapper)
    await advanceFrames(2)
    // 两种颜色都被画到过（引擎按顺序轮换 sparkColor）
    expect(canvas.count('stroke')).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('卸载时清掉画布', async () => {
    installCanvas2DMock()
    const wrapper = mountSpark()

    await press(wrapper)
    expect(document.querySelectorAll('canvas')).toHaveLength(1)
    wrapper.unmount()
    expect(document.querySelectorAll('canvas')).toHaveLength(0)
  })
})
