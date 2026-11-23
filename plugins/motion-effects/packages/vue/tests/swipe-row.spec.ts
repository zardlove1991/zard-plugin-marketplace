import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SwipeRow from '../src/components/SwipeRow.vue'
import type { SwipeAction } from '../src/types'

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

  it('does not open when disabled', async () => {
    const wrapper = mountRow({ disabled: true })
    await wrapper.find('.sr-toggle').trigger('keydown', { key: 'Enter' })
    expect(wrapper.attributes('data-open')).toBeUndefined()
    expect(wrapper.attributes('data-disabled')).toBe('')
    wrapper.unmount()
  })
})