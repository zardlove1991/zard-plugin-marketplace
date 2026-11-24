import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SwipeRow from '../src/components/SwipeRow.vue'
import type { SwipeAction } from '../src/types'
import { nextFrame } from './helpers/frames'

function firePointer(
  target: EventTarget,
  type: string,
  props: Record<string, unknown> = {}
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, {
    button: 0,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: 0,
    clientY: 0,
    ...props
  })
  target.dispatchEvent(event)
}

/** 推进真实帧，直到元素的 style 连续 3 帧不变（动画收敛），返回最终的 style */
async function settleStyle(element: HTMLElement) {
  let last = element.getAttribute('style')
  let stable = 0
  for (let frame = 0; frame < 60 && stable < 3; frame++) {
    await nextFrame()
    const current = element.getAttribute('style')
    stable = current === last ? stable + 1 : 0
    last = current
  }
  return last
}

function mountRow(props: Record<string, unknown> = {}, actions?: SwipeAction[]) {
  return mount(SwipeRow, {
    attachTo: document.body,
    props: {
      ...(actions ? { actions } : {}),
      ...props
    },
    slots: {
      default: '<div class="row-content">Design review</div>'
    }
  })
}

describe('SwipeRow', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders slot content, actions and default styles', () => {
    const wrapper = mountRow()
    expect(wrapper.classes()).toContain('sr-root')
    expect(wrapper.find('.sr-surface').text()).toContain('Design review')
    expect(wrapper.find('.sr-btn--primary').text()).toContain('Delete')
    expect(wrapper.find('.sr-toggle').text()).toContain('1 action')
    expect(wrapper.attributes('data-direction')).toBe('left')
    expect(wrapper.element.style.getPropertyValue('--sr-a')).toBe('80px')
    wrapper.unmount()
  })

  it('opens and closes via the keyboard toggle', async () => {
    const wrapper = mountRow()
    const toggle = wrapper.find('.sr-toggle')

    await toggle.trigger('keydown', { key: 'Enter' })
    await nextTick()
    expect(wrapper.attributes('data-open')).toBe('')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('open-change')?.at(-1)).toEqual([true])

    await toggle.trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(wrapper.attributes('data-open')).toBeUndefined()
    expect(toggle.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('commits the primary action and emits action + commit', async () => {
    vi.useFakeTimers()
    const wrapper = mountRow()
    const primary = wrapper.find('.sr-btn--primary')

    await primary.trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
    expect(wrapper.attributes('data-phase')).toBe('collapsing')

    await vi.advanceTimersByTimeAsync(200)
    await nextTick()
    expect(wrapper.emitted('commit')).toHaveLength(1)
    expect(wrapper.emitted('commit')?.[0]?.[0]).toMatchObject({ id: 'delete' })
    wrapper.unmount()
  })

  it('runs secondary actions and closes the row', async () => {
    const onSelect = vi.fn()
    const actions: SwipeAction[] = [
      { id: 'delete', label: 'Delete' },
      { id: 'archive', label: 'Archive', onSelect }
    ]
    const wrapper = mountRow({}, actions)
    const secondary = wrapper.findAll('.sr-btn')[0]

    await secondary.trigger('click')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('action')?.[0]?.[0]).toMatchObject({ id: 'archive' })
    expect(wrapper.emitted('commit')).toBeUndefined()
    wrapper.unmount()
  })

  it('tracks a horizontal drag and opens the drawer', async () => {
    const wrapper = mountRow()
    const surface = wrapper.find('.sr-surface')

    firePointer(surface.element, 'pointerdown', { clientX: 300, clientY: 20, pointerId: 7 })
    firePointer(window, 'pointermove', { clientX: 200, clientY: 20, pointerId: 7 })
    expect(wrapper.attributes('data-dragging')).toBe('')

    firePointer(window, 'pointerup', { clientX: 200, clientY: 20, pointerId: 7 })
    await nextTick()
    expect(wrapper.attributes('data-open')).toBe('')
    expect(wrapper.attributes('data-dragging')).toBeUndefined()
    wrapper.unmount()
  })

  it('captures the pointer on the surface for the whole drag', () => {
    const setCapture = vi.spyOn(HTMLElement.prototype, 'setPointerCapture')
    const releaseCapture = vi.spyOn(HTMLElement.prototype, 'releasePointerCapture')
    const wrapper = mountRow()
    const surface = wrapper.find('.sr-surface').element as HTMLElement

    firePointer(surface, 'pointerdown', { clientX: 300, clientY: 20, pointerId: 7 })
    expect(setCapture).toHaveBeenCalledTimes(1)
    expect(setCapture.mock.instances[0]).toBe(surface)
    expect(setCapture).toHaveBeenCalledWith(7)

    firePointer(window, 'pointerup', { clientX: 300, clientY: 20, pointerId: 7 })
    expect(releaseCapture.mock.instances[0]).toBe(surface)
    wrapper.unmount()
  })

  it('captures the pointer on the row being dragged when several rows are mounted', () => {
    const setCapture = vi.spyOn(HTMLElement.prototype, 'setPointerCapture')
    const host = mount(
      { components: { SwipeRow }, template: '<div><SwipeRow /><SwipeRow /></div>' },
      { attachTo: document.body }
    )
    const surfaces = host.findAll('.sr-surface')
    expect(surfaces).toHaveLength(2)

    firePointer(surfaces[1]!.element, 'pointerdown', { clientX: 300, clientY: 20, pointerId: 7 })
    expect(setCapture).toHaveBeenCalledTimes(1)
    expect(setCapture.mock.instances[0]).toBe(surfaces[1]!.element)
    host.unmount()
  })

  it('opens the drawer when mounted with open=true', async () => {
    const wrapper = mountRow({ open: true })
    const surface = wrapper.find('.sr-surface').element as HTMLElement

    expect(await settleStyle(surface)).toContain('translateX(-80px)')
    wrapper.unmount()
  })

  it('recomputes the drawer transforms when actionWidth changes mid-drag', async () => {
    const wrapper = mountRow()
    const surface = wrapper.find('.sr-surface').element as HTMLElement
    const rail = wrapper.find('.sr-rail').element as HTMLElement
    firePointer(surface, 'pointerdown', { clientX: 300, clientY: 20, pointerId: 7 })
    firePointer(window, 'pointermove', { clientX: 240, clientY: 20, pointerId: 7 })
    await nextFrame()
    // 已拖出 50px，单个操作宽 80：操作区补足剩余的 30px
    expect(surface.getAttribute('style')).toContain('translateX(-50px)')
    expect(rail.getAttribute('style')).toContain('translateX(30px)')

    await wrapper.setProps({ actionWidth: 100 })
    await nextFrame()
    expect(rail.getAttribute('style')).toContain('translateX(50px)')
    wrapper.unmount()
  })

  it('re-settles to the new drawer width when actions change while open', async () => {
    const actions: SwipeAction[] = [
      { id: 'delete', label: 'Delete' },
      { id: 'archive', label: 'Archive' }
    ]
    const wrapper = mountRow({}, actions)
    const surface = wrapper.find('.sr-surface').element as HTMLElement
    await wrapper.find('.sr-toggle').trigger('keydown', { key: 'Enter' })
    expect(await settleStyle(surface)).toContain('translateX(-160px)')

    await wrapper.setProps({ actions: actions.slice(0, 1) })
    expect(await settleStyle(surface)).toContain('translateX(-80px)')
    wrapper.unmount()
  })

  it('re-settles to the other side when direction changes while open', async () => {
    const wrapper = mountRow()
    const surface = wrapper.find('.sr-surface').element as HTMLElement
    const rail = wrapper.find('.sr-rail').element as HTMLElement
    await wrapper.find('.sr-toggle').trigger('keydown', { key: 'Enter' })
    expect(await settleStyle(surface)).toContain('translateX(-80px)')

    await wrapper.setProps({ direction: 'right' })
    expect(await settleStyle(surface)).toContain('translateX(80px)')
    expect(rail.getAttribute('style')).toContain('translateX(0px)')
    wrapper.unmount()
  })

  it('does not open when disabled', async () => {
    const wrapper = mountRow({ disabled: true })
    await wrapper.find('.sr-toggle').trigger('keydown', { key: 'Enter' })
    expect(wrapper.attributes('data-open')).toBeUndefined()
    expect(wrapper.attributes('data-disabled')).toBe('')
    wrapper.unmount()
  })
})