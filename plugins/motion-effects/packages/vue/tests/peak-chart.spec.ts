import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PeakChart from '../src/components/PeakChart.vue'
import { advanceFrames } from './helpers/frames'
import { installAutoIntersectionObserver, installCanvas2DMock } from './helpers/canvas2d'

const HN = 696 / 540

function mountChart(props: Record<string, unknown> = {}) {
  return mount(PeakChart, {
    attachTo: document.body,
    props: { width: 270, ...props }
  })
}

/** jsdom 的 getBoundingClientRect 全是 0，hover 坐标换算需要真实宽度 */
function mockCardRect(wrapper: ReturnType<typeof mountChart>, width = 270) {
  const card = wrapper.find('[data-peak-chart]').element as HTMLElement
  card.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width,
      height: width * HN,
      right: width,
      bottom: width * HN,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }) as DOMRect
  return card
}

const digitsText = (wrapper: ReturnType<typeof mountChart>) =>
  wrapper.find('[data-part="value"] span span + span').text()

describe('PeakChart', () => {
  describe('静态结构与降级（无 canvas 2d）', () => {
    it('渲染默认文案与终态数字', () => {
      const wrapper = mountChart()
      expect(wrapper.classes()).toContain('pc-root')
      expect(wrapper.find('[data-part="updated"]').text()).toBe('Data updated 2h ago')
      expect(wrapper.find('[data-part="title"]').text()).toBe('Conversion rate')
      expect(wrapper.find('[data-part="caption"]').text()).toBe('Increase vs last month')
      expect(wrapper.find('[data-part="suffix"]').text()).toBe('%')
      expect(wrapper.find('[data-part="period"]').text()).toBe('Monthly')
      // 没有 2d 上下文时渲染循环不启动，数字停在终态而不是 0
      expect(digitsText(wrapper)).toBe('400')
      wrapper.unmount()
    })

    it('没有 2d 上下文时不抛错，数字区域可见', () => {
      const wrapper = mountChart({ backdrop: true })
      const num = wrapper.find('.pc-num').element as HTMLElement
      expect(num.style.opacity).toBe('1')
      expect(wrapper.element.style.backgroundColor).toBe('rgb(8, 16, 26)')
      wrapper.unmount()
    })

    it('映射 value / decimals / valueSuffix 与自定义文案', () => {
      const wrapper = mountChart({
        value: 12.8,
        decimals: 1,
        valueSuffix: 'k',
        title: 'Active users',
        caption: 'New peak this period',
        updatedText: 'Live'
      })
      expect(digitsText(wrapper)).toBe('12.8')
      expect(wrapper.find('[data-part="suffix"]').text()).toBe('k')
      expect(wrapper.find('[data-part="title"]').text()).toBe('Active users')
      expect(wrapper.find('[data-part="caption"]').text()).toBe('New peak this period')
      expect(wrapper.find('[data-part="updated"]').text()).toBe('Live')
      wrapper.unmount()
    })

    it('千分位格式化 headline 数字', () => {
      const wrapper = mountChart({ value: 1234567 })
      expect(digitsText(wrapper)).toBe('1,234,567')
      wrapper.unmount()
    })

    it('trend 控制箭头：up 绿色、down 红色、none 不渲染', () => {
      const up = mountChart()
      const upArrow = up.find('.pc-arrow')
      expect(upArrow.exists()).toBe(true)
      expect(upArrow.find('path').attributes('stroke')).toBe('#93cfa2')
      up.unmount()

      const down = mountChart({ trend: 'down' })
      expect(down.find('.pc-arrow path').attributes('stroke')).toBe('#f08a8a')
      down.unmount()

      const none = mountChart({ trend: 'none' })
      expect(none.find('.pc-arrow').exists()).toBe(false)
      none.unmount()
    })

    it('width 决定卡片尺寸，高度按 540:696 比例', () => {
      const wrapper = mountChart({ width: 300 })
      const card = wrapper.find('[data-peak-chart]').element as HTMLElement
      expect(card.style.width).toBe('300px')
      // CSSOM 会舍入序列化值，比较数值而不是字符串
      expect(parseFloat(card.style.height)).toBeCloseTo(300 * HN, 1)
      wrapper.unmount()
    })

    it('accent 偏离参考蓝时给 canvas 加 hue-rotate 滤镜', () => {
      const base = mountChart()
      expect((base.find('canvas').element as HTMLElement).style.filter).toBe('')
      base.unmount()

      const green = mountChart({ accent: '#2ec99a' })
      expect((green.find('canvas').element as HTMLElement).style.filter).toContain('hue-rotate')
      green.unmount()
    })
  })

  describe('周期下拉', () => {
    it('点击 pill 打开菜单，列出 periods 并标记选中项', async () => {
      const wrapper = mountChart()
      const pill = wrapper.find('.pc-pill')
      expect(pill.attributes('aria-expanded')).toBe('false')
      await pill.trigger('click')
      expect(pill.attributes('aria-expanded')).toBe('true')

      const options = wrapper.findAll('[role="option"]')
      expect(options.map(option => option.text())).toEqual(['Weekly', 'Monthly', 'Yearly'])
      expect(options[1].attributes('aria-selected')).toBe('true')
      expect(options[0].attributes('aria-selected')).toBe('false')
      wrapper.unmount()
    })

    it('非受控：选择后更新 pill 并发出 update:period', async () => {
      const wrapper = mountChart()
      await wrapper.find('.pc-pill').trigger('click')
      await wrapper.findAll('[role="option"]')[0].trigger('click')
      expect(wrapper.find('[data-part="period"]').text()).toBe('Weekly')
      expect(wrapper.emitted('update:period')).toEqual([['Weekly']])
      expect(wrapper.find('.pc-pill').attributes('aria-expanded')).toBe('false')
      wrapper.unmount()
    })

    it('受控：只发出 update:period，pill 跟随父级传入的 period', async () => {
      // 带 update 监听才是真实 v-model 父级；否则 defineModel 走本地模式
      const wrapper = mountChart({ period: 'Yearly', 'onUpdate:period': () => {} })
      expect(wrapper.find('[data-part="period"]').text()).toBe('Yearly')
      await wrapper.find('.pc-pill').trigger('click')
      await wrapper.findAll('[role="option"]')[0].trigger('click')
      expect(wrapper.emitted('update:period')).toEqual([['Weekly']])
      expect(wrapper.find('[data-part="period"]').text()).toBe('Yearly')

      await wrapper.setProps({ period: 'Weekly' })
      expect(wrapper.find('[data-part="period"]').text()).toBe('Weekly')
      wrapper.unmount()
    })

    it('选择当前周期不发出事件', async () => {
      const wrapper = mountChart()
      await wrapper.find('.pc-pill').trigger('click')
      await wrapper.findAll('[role="option"]')[1].trigger('click')
      expect(wrapper.emitted('update:period')).toBeUndefined()
      wrapper.unmount()
    })

    it('Escape 关闭菜单并把焦点还给 pill', async () => {
      const wrapper = mountChart()
      await wrapper.find('.pc-pill').trigger('click')
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.pc-pill').attributes('aria-expanded')).toBe('false')
      expect(document.activeElement).toBe(wrapper.find('.pc-pill').element)
      wrapper.unmount()
    })

    it('点击菜单外关闭', async () => {
      const wrapper = mountChart()
      await wrapper.find('.pc-pill').trigger('click')
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.pc-pill').attributes('aria-expanded')).toBe('false')
      wrapper.unmount()
    })

    it('自定义 periods 与 defaultPeriod', async () => {
      const wrapper = mountChart({ periods: ['Q1', 'Q2'], defaultPeriod: 'Q2' })
      expect(wrapper.find('[data-part="period"]').text()).toBe('Q2')
      await wrapper.find('.pc-pill').trigger('click')
      expect(wrapper.findAll('[role="option"]').map(option => option.text())).toEqual(['Q1', 'Q2'])
      wrapper.unmount()
    })
  })

  describe('渲染循环（2d 桩 + 可见 IO）', () => {
    let io: ReturnType<typeof installAutoIntersectionObserver>

    afterEach(() => {
      io?.restore()
    })

    function mountLive(props: Record<string, unknown> = {}) {
      installCanvas2DMock()
      io = installAutoIntersectionObserver()
      const wrapper = mountChart(props)
      mockCardRect(wrapper)
      return wrapper
    }

    it('揭示时数字从 0 滚到终态', async () => {
      const wrapper = mountLive()
      expect(digitsText(wrapper)).toBe('0')
      await advanceFrames(200)
      expect(digitsText(wrapper)).toBe('400')
      wrapper.unmount()
    })

    it('hover 读数显示曲线值与内置标签', async () => {
      const wrapper = mountLive()
      await advanceFrames(100)
      // 卡片坐标 287 = 峰值位置（MONTH_DATA 第 17 个点；圆点静息在 peakX + 8，读数要 hover 峰值本身）
      await wrapper.find('.pc-hover').trigger('pointermove', { clientX: (287 / 540) * 270 })
      await advanceFrames(40)
      const readout = wrapper.find('.pc-readout')
      expect(Number((readout.element as HTMLElement).style.opacity)).toBeGreaterThan(0.9)
      expect(readout.find('.pc-readout__value').text()).toBe('400%')
      expect(readout.find('.pc-readout__label').text()).toBe('Day 17')
      wrapper.unmount()
    })

    it('hover 读数使用 formatValue 与自定义 labels', async () => {
      const wrapper = mountLive({
        data: [10, 20, 30],
        labels: ['甲', '乙', '丙'],
        formatValue: (v: number) => `${v.toFixed(1)} 次`
      })
      await advanceFrames(100)
      // 最右端 = 最后一个点（30）
      await wrapper.find('.pc-hover').trigger('pointermove', { clientX: (503.69 / 540) * 270 })
      await advanceFrames(40)
      const readout = wrapper.find('.pc-readout')
      expect(readout.find('.pc-readout__value').text()).toBe('30.0 次')
      expect(readout.find('.pc-readout__label').text()).toBe('丙')
      wrapper.unmount()
    })

    it('data 变化让曲线 morph，读数跟着变', async () => {
      const wrapper = mountLive()
      await advanceFrames(100)
      await wrapper.find('.pc-hover').trigger('pointermove', { clientX: (503.69 / 540) * 270 })
      await advanceFrames(40)
      // MONTH_DATA 最后一个点是 143
      expect(wrapper.find('.pc-readout__value').text()).toBe('143%')

      await wrapper.setProps({ data: [100, 200, 300] })
      await advanceFrames(60)
      expect(wrapper.find('.pc-readout__value').text()).toBe('300%')
      wrapper.unmount()
    })

    it('value 变化重新滚动数字', async () => {
      const wrapper = mountLive()
      await advanceFrames(200)
      expect(digitsText(wrapper)).toBe('400')
      await wrapper.setProps({ value: 500 })
      await advanceFrames(80)
      expect(digitsText(wrapper)).toBe('500')
      wrapper.unmount()
    })

    it('reduced-motion 直接停在终态', async () => {
      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
          ({
            matches: query.includes('reduce'),
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false
          }) as MediaQueryList
      )
      const wrapper = mountLive()
      expect(digitsText(wrapper)).toBe('400')
      expect((wrapper.find('.pc-num').element as HTMLElement).style.opacity).toBe('1')
      wrapper.unmount()
    })

    it('width 变化重建画布', async () => {
      const wrapper = mountLive()
      const canvas = wrapper.find('canvas').element as HTMLCanvasElement
      // dpr=1：270 + 2 * ceil(0.32 * 270) = 444
      expect(canvas.width).toBe(444)
      await wrapper.setProps({ width: 360 })
      expect(canvas.width).toBe(592)
      wrapper.unmount()
    })

    it('卸载时断开 IntersectionObserver 并停止帧循环', async () => {
      const wrapper = mountLive()
      await advanceFrames(5)
      wrapper.unmount()
      expect(io.instances.every(state => state.disconnected)).toBe(true)
      await advanceFrames(5)
    })
  })
})
