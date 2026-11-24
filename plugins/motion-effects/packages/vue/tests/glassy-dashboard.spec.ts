import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GlassyDashboard from '../src/components/GlassyDashboard.vue'

/**
 * 用 reduced-motion 走同步路径：动画直接落终态，数字断言稳定，
 * 也顺带验证降级分支（vue-porting §12 / production-checklist）。
 */
function mountDashboard(props: Record<string, unknown> = {}) {
  return mount(GlassyDashboard, { attachTo: document.body, props })
}

const heading = (wrapper: ReturnType<typeof mountDashboard>) => wrapper.find('.gd-view-head h1').text()

beforeEach(() => {
  window.location.hash = ''
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    })
  })
  Element.prototype.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
  if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () { this.open = true }
    HTMLDialogElement.prototype.close = function () {
      this.open = false
      this.dispatchEvent(new Event('close'))
    }
  }
})

afterEach(() => {
  document.body.innerHTML = ''
  window.location.hash = ''
})

describe('GlassyDashboard', () => {
  describe('默认结构与 props', () => {
    it('渲染默认工作区、四个视图入口与终态数字', () => {
      const wrapper = mountDashboard()
      expect(heading(wrapper)).toBe('Command Center')
      expect(wrapper.find('.gd-brand strong').text()).toBe('ATLAS')
      expect(wrapper.find('.gd-ask .gd-prompt').text()).toBe('Show me what needs attention.')
      expect(wrapper.find('.gd-balance-number [data-gd-count]').text()).toBe('$47,200')
      expect(wrapper.findAll('.gd-dock-side a[data-view]')).toHaveLength(4)
      expect(wrapper.find('.gd-footer a').text()).toContain('Photo via Unsplash')
      wrapper.unmount()
    })

    it('透传 workspaceName / initialTheme / panelFrost（并夹在 0–36px）', () => {
      const wrapper = mountDashboard({ workspaceName: 'NOVA', initialTheme: 'dark', panelFrost: 99 })
      expect(wrapper.find('.gd-brand strong').text()).toBe('NOVA')
      expect(wrapper.find('.gd-app').attributes('data-theme')).toBe('dark')
      expect((wrapper.find('.gd-app').element as HTMLElement).style.getPropertyValue('--gd-panel-frost')).toBe('36px')
      wrapper.unmount()
    })

    it('自定义背景图时不再显示默认署名', () => {
      const wrapper = mountDashboard({ backgroundImage: 'https://example.test/bg.jpg' })
      expect(wrapper.find('.gd-background').attributes('src')).toBe('https://example.test/bg.jpg')
      expect(wrapper.find('.gd-footer a').exists()).toBe(false)
      wrapper.unmount()
    })
  })

  describe('周期与主题', () => {
    it('切换周期更新数字与 aria-pressed', async () => {
      const wrapper = mountDashboard()
      const buttons = wrapper.findAll('.gd-period button')
      expect(buttons.map(button => button.text())).toEqual(['7 days', '30 days', '90 days'])
      expect(buttons[1].attributes('aria-pressed')).toBe('true')
      await buttons[0].trigger('click')
      expect(wrapper.find('.gd-balance-number [data-gd-count]').text()).toBe('$11,600')
      expect(wrapper.findAll('.gd-period button')[0].attributes('aria-pressed')).toBe('true')
      wrapper.unmount()
    })

    it('明暗主题可来回切换', async () => {
      const wrapper = mountDashboard()
      const toggle = wrapper.find('[aria-label="Switch to dark theme"]')
      await toggle.trigger('click')
      expect(wrapper.find('.gd-app').attributes('data-theme')).toBe('dark')
      await wrapper.find('[aria-label="Switch to light theme"]').trigger('click')
      expect(wrapper.find('.gd-app').attributes('data-theme')).toBe('light')
      wrapper.unmount()
    })

    it('initialTheme 变化会同步到组件', async () => {
      const wrapper = mountDashboard()
      await wrapper.setProps({ initialTheme: 'dark' })
      expect(wrapper.find('.gd-app').attributes('data-theme')).toBe('dark')
      wrapper.unmount()
    })
  })

  describe('视图切换', () => {
    it('侧边 dock 可切到 Trends，并写入 hash', async () => {
      const wrapper = mountDashboard()
      await wrapper.findAll('.gd-dock-side a[data-view]')[1].trigger('click')
      expect(heading(wrapper)).toBe('Trends')
      expect(wrapper.find('.gd-revenue-chart').exists()).toBe(true)
      expect(wrapper.find('.gd-device').exists()).toBe(true)
      expect(window.location.hash).toBe('#trends')
      wrapper.unmount()
    })

    it('操作入口可切到 Metrics 与 Premium Operations', async () => {
      const wrapper = mountDashboard()
      await wrapper.find('.gd-balance-actions .gd-secondary').trigger('click')
      expect(heading(wrapper)).toBe('Metrics')
      expect(wrapper.find('.gd-stack').exists()).toBe(true)
      await wrapper.findAll('.gd-dock-side a[data-view]')[3].trigger('click')
      expect(heading(wrapper)).toBe('Premium Operations')
      expect(wrapper.findAll('.gd-lane')).toHaveLength(4)
      wrapper.unmount()
    })

    it('从 hash 恢复视图', async () => {
      window.location.hash = '#operations'
      const wrapper = mountDashboard()
      expect(heading(wrapper)).toBe('Premium Operations')
      window.location.hash = ''
      window.dispatchEvent(new HashChangeEvent('hashchange'))
      await wrapper.vm.$nextTick()
      expect(heading(wrapper)).toBe('Command Center')
      wrapper.unmount()
    })
  })

  describe('弹窗与工单', () => {
    it('搜索弹窗按关键词过滤并可跳转', async () => {
      const wrapper = mountDashboard()
      await wrapper.find('.gd-ask').trigger('click')
      expect(wrapper.find('dialog').exists()).toBe(true)
      const input = wrapper.find('[aria-label="Find a dashboard view"]')
      await input.setValue('trend')
      const results = wrapper.findAll('.gd-quick-list button')
      expect(results).toHaveLength(1)
      expect(results[0].text()).toContain('Trends')
      await results[0].trigger('click')
      expect(heading(wrapper)).toBe('Trends')
      wrapper.unmount()
    })

    it('通知弹窗打开工单，Mark reviewed 改变状态', async () => {
      const wrapper = mountDashboard()
      await wrapper.find('[aria-label="Notifications"]').trigger('click')
      expect(wrapper.find('dialog h2').text()).toBe('Notifications')
      expect(wrapper.findAll('.gd-quick-list button')).toHaveLength(2)
      expect(wrapper.find('.gd-notices i').exists()).toBe(false)

      await wrapper.findAll('.gd-quick-list button')[0].trigger('click')
      expect(heading(wrapper)).toBe('Premium Operations')
      expect(wrapper.find('dialog h2').text()).toBe('Refund approval')
      expect(wrapper.find('dialog dl').exists()).toBe(true)

      await wrapper.find('dialog .gd-primary').trigger('click')
      expect(wrapper.find('dialog').exists()).toBe(false)
      expect(wrapper.findAll('.gd-lane')[0].findAll('.gd-work-item')).toHaveLength(1)
      wrapper.unmount()
    })

    it('operations 的 lane 过滤只保留一个泳道', async () => {
      const wrapper = mountDashboard()
      await wrapper.findAll('.gd-dock-side a[data-view]')[3].trigger('click')
      await wrapper.find('[aria-label="Filter operations lanes"]').setValue('Needs review')
      expect(wrapper.findAll('.gd-lane')).toHaveLength(1)
      expect(wrapper.findAll('.gd-work-item')).toHaveLength(2)
      wrapper.unmount()
    })
  })

  describe('导出与清理', () => {
    it('Trends 的 Export CSV 生成 Blob 并触发下载', async () => {
      if (!URL.createObjectURL) URL.createObjectURL = vi.fn()
      if (!URL.revokeObjectURL) URL.revokeObjectURL = vi.fn()
      const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
      const wrapper = mountDashboard()
      await wrapper.findAll('.gd-dock-side a[data-view]')[1].trigger('click')
      await wrapper.find('.gd-export').trigger('click')
      expect(create).toHaveBeenCalledTimes(1)
      const blob = create.mock.calls[0][0] as Blob
      expect(blob.type).toBe('text/csv;charset=utf-8')
      expect(click).toHaveBeenCalledTimes(1)
      wrapper.unmount()
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(revoke).toHaveBeenCalled()
      create.mockRestore()
      revoke.mockRestore()
      click.mockRestore()
    })

    it('卸载时移除全局监听并释放 ResizeObserver', () => {
      const remove = vi.spyOn(window, 'removeEventListener')
      const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect')
      const wrapper = mountDashboard()
      wrapper.unmount()
      expect(remove).toHaveBeenCalledWith('hashchange', expect.any(Function))
      expect(remove).toHaveBeenCalledWith('popstate', expect.any(Function))
      expect(disconnect).toHaveBeenCalled()
      remove.mockRestore()
      disconnect.mockRestore()
    })
  })
})
