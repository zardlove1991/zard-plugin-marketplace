import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import Dock from '../src/components/Dock.vue'
import { advanceFrames } from './helpers/frames'

const items = [
  { label: '首页', icon: 'icon-home' },
  { label: '作品', icon: 'icon-work' },
  { label: '设置', icon: 'icon-settings' }
]

const mounted: any[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.querySelectorAll('.dock-menu').forEach(node => node.remove())
})

function mountDock(props: Record<string, unknown> = {}) {
  const wrapper = mount(Dock, {
    attachTo: document.body,
    props: { items, ...props }
  })
  mounted.push(wrapper)
  return wrapper
}

describe('Dock', () => {
  it('渲染工具栏、图标项与主题变量', () => {
    const wrapper = mountDock()
    const root = wrapper.find('.dock')

    expect(root.exists()).toBe(true)
    expect(root.attributes('role')).toBe('toolbar')
    expect(root.attributes('aria-orientation')).toBe('horizontal')
    expect(wrapper.findAll('.dock-item')).toHaveLength(3)
    expect(wrapper.findAll('.dock-face')).toHaveLength(3)

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--dock-base')).toBe('50px')
    expect(el.style.getPropertyValue('--dock-thickness')).toBe('68px')
    expect(el.style.getPropertyValue('--dock-gap')).toBe('10px')
    expect(el.style.getPropertyValue('--dock-ink')).toBe('#f4f4f5')
  })

  it('分隔项渲染成 dock-separator', () => {
    const wrapper = mountDock({ items: [{ label: 'A' }, { separator: true }, { label: 'B' }] })
    expect(wrapper.findAll('.dock-separator')).toHaveLength(1)
    expect(wrapper.findAll('.dock-item')).toHaveLength(2)
  })

  it('指针靠近时图标按弹簧放大', async () => {
    const wrapper = mountDock()
    const first = wrapper.findAll('.dock-item')[0].element as HTMLElement
    // 面板宽度不够时整条 dock 等比缩小，基准取缩放后的 --dock-base
    await nextTick()
    const base = parseFloat((wrapper.find('.dock').element as HTMLElement).style.getPropertyValue('--dock-base')) || 50

    await wrapper.find('.dock').trigger('pointermove', { clientX: 40, clientY: 0 })
    await advanceFrames(3)

    const after = parseFloat(first.style.width || '0')
    expect(after).toBeGreaterThan(base)
    expect(after).toBeLessThanOrEqual(base * 1.4)
  })

  it('点一项时通知 select 并执行 item 的 onClick', async () => {
    let clicked = 0
    const wrapper = mountDock({
      items: [{ label: '首页', onClick: () => (clicked += 1) }]
    })

    await wrapper.find('.dock-item').trigger('click')
    expect(clicked).toBe(1)
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe(0)
  })

  it('角标、运行中圆点与名称按开关显示', () => {
    const wrapper = mountDock({
      items: [{ label: '邮件', badge: 3, active: true }],
      showBadges: true,
      showIndicators: true,
      showLabels: true
    })
    expect(wrapper.find('.dock-badge').text()).toBe('3')
    expect(wrapper.find('.dock-dot').exists()).toBe(true)
    expect(wrapper.find('.dock-label').text()).toBe('邮件')

    const bare = mountDock({
      items: [{ label: '邮件', badge: 3, active: true }],
      showBadges: false,
      showIndicators: false,
      showLabels: false
    })
    expect(bare.find('.dock-badge').exists()).toBe(false)
    expect(bare.find('.dock-dot').exists()).toBe(false)
    expect(bare.find('.dock-label').exists()).toBe(false)
  })

  it('tiles 关掉时用 bare 样式类', () => {
    const wrapper = mountDock({ tiles: false })
    expect(wrapper.find('.dock').classes()).toContain('dock--bare')
  })

  it('autoHide 打开时根节点带 data-hidden', async () => {
    const wrapper = mountDock({ autoHide: true })
    await nextTick()
    expect(wrapper.find('.dock').attributes('data-hidden')).toBe('')
  })

  it('右键有菜单的项会打开玻璃菜单', async () => {
    const wrapper = mountDock({
      items: [{ label: '文件', menu: [{ label: '新建窗口' }, { separator: true }, { label: '退出' }] }]
    })
    await wrapper.find('.dock-item').trigger('contextmenu')
    await nextTick()

    const menu = document.querySelector('.dock-menu')
    expect(menu).toBeTruthy()
    expect(menu?.querySelectorAll('.dock-menu-row')).toHaveLength(2)
    expect(menu?.querySelectorAll('.dock-menu-separator')).toHaveLength(1)
  })

  it('position 决定停靠边与图标排列方向', () => {
    const wrapper = mountDock({ position: 'left' })
    expect(wrapper.find('.dock').classes()).toContain('dock--left')
    expect(wrapper.find('.dock').attributes('aria-orientation')).toBe('vertical')
  })
})
