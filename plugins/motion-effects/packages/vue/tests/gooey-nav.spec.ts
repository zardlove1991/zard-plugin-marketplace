import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import GooeyNav from '../src/components/GooeyNav.vue'

const items = [
  { label: '首页', href: '#' },
  { label: '作品', href: '#' },
  { label: '关于', href: '#' }
]

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountNav(props: Record<string, unknown> = {}) {
  const wrapper = mount(GooeyNav, {
    attachTo: document.body,
    props: { items, ...props }
  })
  mounted.push(wrapper)
  return wrapper
}

describe('GooeyNav', () => {
  it('渲染导航项与覆盖层，主题变量写进根节点', () => {
    const wrapper = mountNav()
    const root = wrapper.find('.gooey-nav')

    expect(root.exists()).toBe(true)
    expect(root.classes()).toContain('gooey-nav--md')
    expect(root.classes()).toContain('gooey-nav--framed')
    expect(wrapper.findAll('.gooey-nav__list')).toHaveLength(2)
    expect(wrapper.findAll('.gooey-nav__item')).toHaveLength(6)
    expect(wrapper.find('.gooey-nav__list').findAll('a')).toHaveLength(3)

    const el = root.element as HTMLElement
    expect(el.style.getPropertyValue('--gn-ink')).toBe('#f4f4f5')
    expect(el.style.getPropertyValue('--gn-pill')).toBe('#f4f4f5')
    expect(el.style.getPropertyValue('--gn-active-ink')).toBe('#18161d')
  })

  it('没有 href 的项渲染成按钮', () => {
    const wrapper = mountNav({ items: [{ label: '只有按钮' }] })
    expect(wrapper.find('.gooey-nav__list').findAll('button')).toHaveLength(1)
    expect(wrapper.find('.gooey-nav__list').findAll('a')).toHaveLength(0)
  })

  it('点一项就切换选中态并发出 change', async () => {
    const wrapper = mountNav()
    const second = wrapper.findAll('.gooey-nav__list')[0].findAll('a')[1]

    await second.trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([1, items[1]])
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([1])
    await nextTick()
    expect(wrapper.findAll('.gooey-nav__item')[1].attributes('data-active')).toBe('')
    expect(wrapper.findAll('.gooey-nav__item')[0].attributes('data-active')).toBeUndefined()
  })

  it('受控模式下由外部决定选中项', async () => {
    const wrapper = mountNav({ activeIndex: 2 })
    expect(wrapper.findAll('.gooey-nav__item')[2].attributes('data-active')).toBe('')

    await wrapper.setProps({ activeIndex: 0 })
    await nextTick()
    expect(wrapper.findAll('.gooey-nav__item')[0].attributes('data-active')).toBe('')
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('自定义胶囊颜色时文字色跟着换', () => {
    const wrapper = mountNav({ color: '#c8ff4d' })
    const el = wrapper.find('.gooey-nav').element as HTMLElement
    expect(el.style.getPropertyValue('--gn-pill')).toBe('#c8ff4d')
    // 亮色胶囊上用深色字
    expect(el.style.getPropertyValue('--gn-active-ink')).toBe('#18161d')
  })

  it('尺寸与外框可以关掉', () => {
    const wrapper = mountNav({ size: 'lg', frame: false })
    const root = wrapper.find('.gooey-nav')
    expect(root.classes()).toContain('gooey-nav--lg')
    expect(root.classes()).not.toContain('gooey-nav--framed')
    expect(wrapper.find('.gooey-nav__rim').exists()).toBe(false)
  })

  it('没有 WebGL2 时退回普通色块，不抛错', async () => {
    const wrapper = mountNav()
    await nextTick()
    // jsdom 没有 WebGL2：画布隐藏，回退色块显示
    expect((wrapper.find('.gooey-nav__canvas').element as HTMLElement).style.display).toBe('none')
    expect((wrapper.find('.gooey-nav__fallback').element as HTMLElement).style.display).toBe('block')
    expect(wrapper.find('.gooey-nav').exists()).toBe(true)
  })
})
