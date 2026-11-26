import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AIPromptBox from '../src/components/AIPromptBox.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  vi.useRealTimers()
  document.body.style.overflow = ''
  document.body.innerHTML = ''
})

function mountBox(props: Record<string, unknown> = {}) {
  const wrapper = mount(AIPromptBox, { attachTo: document.body, props })
  mounted.push(wrapper)
  return wrapper
}

function png(name = 'a.png', size = 12) {
  return new File(['x'.repeat(size)], name, { type: 'image/png' })
}

async function selectFile(wrapper: VueWrapper, file: File) {
  const input = wrapper.find('input[type="file"]').element as HTMLInputElement
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  await wrapper.find('input[type="file"]').trigger('change')
  await flushPromises()
}

function mainButton(wrapper: VueWrapper) {
  return wrapper.find('.aip-btn--main')
}

describe('AIPromptBox', () => {
  it('renders the shell, three mode toggles and the voice button', () => {
    const wrapper = mountBox()
    expect(wrapper.find('.aip').exists()).toBe(true)
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Type your message here...')
    expect(wrapper.find('textarea').attributes('aria-label')).toBe('Message')
    expect(wrapper.find('button[aria-label="Upload image"]').exists()).toBe(true)
    expect(wrapper.find('input[type="file"]').attributes('accept')).toBe('image/*')
    expect(wrapper.findAll('.aip-toggle')).toHaveLength(3)
    expect(wrapper.findAll('.aip-divider')).toHaveLength(2)
    expect(mainButton(wrapper).attributes('aria-label')).toBe('Voice message')
    expect(mainButton(wrapper).classes()).toContain('aip-btn--idle')
    expect(wrapper.find('.aip__recorder').exists()).toBe(false)
    expect(wrapper.find('.aip__files').exists()).toBe(false)
  })

  it('binds the text through v-model and sends on Enter', async () => {
    const wrapper = mountBox()
    const textarea = wrapper.find('textarea')

    await textarea.setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
    expect(mainButton(wrapper).attributes('aria-label')).toBe('Send message')

    await textarea.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('send')?.[0]).toEqual(['hello', []])
    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([''])

    // Shift+Enter 换行，不发送
    await textarea.setValue('line')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(wrapper.emitted('send')).toHaveLength(1)

    // 输入法组字中的 Enter 不发送
    await textarea.trigger('keydown', { key: 'Enter', isComposing: true })
    expect(wrapper.emitted('send')).toHaveLength(1)
  })

  it('reflects a controlled value and mode', () => {
    const wrapper = mountBox({ modelValue: 'controlled', mode: 'think' })
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('controlled')
    expect(wrapper.find('.aip').attributes('data-mode')).toBe('think')
    expect(wrapper.find('.aip-toggle--think').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Think deeply...')
  })

  it('switches modes, swaps the placeholder and prefixes the message', async () => {
    const wrapper = mountBox()
    const search = wrapper.find('.aip-toggle--search')

    await search.trigger('click')
    expect(search.attributes('aria-pressed')).toBe('true')
    expect(search.classes()).toContain('is-on')
    expect(wrapper.find('.aip').attributes('data-mode')).toBe('search')
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Search the web...')
    expect(wrapper.emitted('mode-change')?.[0]).toEqual(['search'])
    expect(wrapper.emitted('update:mode')?.[0]).toEqual(['search'])
    expect(search.text()).toContain('Search')

    await wrapper.find('textarea').setValue('weather')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('send')?.[0]).toEqual(['[Search: weather]', []])

    // 再点一次取消；三个模式互斥
    await search.trigger('click')
    expect(wrapper.find('.aip').attributes('data-mode')).toBeUndefined()
    expect(wrapper.emitted('mode-change')?.[1]).toEqual([null])

    await wrapper.find('.aip-toggle--think').trigger('click')
    expect(wrapper.find('.aip').attributes('data-mode')).toBe('think')
    expect(wrapper.find('.aip-toggle--search').attributes('aria-pressed')).toBe('false')

    await wrapper.find('.aip-toggle--canvas').trigger('click')
    expect(wrapper.find('.aip').attributes('data-mode')).toBe('canvas')
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Create on canvas...')
    await wrapper.find('textarea').setValue('poster')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('send')?.[1]).toEqual(['[Canvas: poster]', []])
  })

  it('shows the stop state while loading and emits stop instead of sending', async () => {
    const wrapper = mountBox({ isLoading: true })
    expect(wrapper.find('.aip').classes()).toContain('is-loading')
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    expect(mainButton(wrapper).attributes('aria-label')).toBe('Stop generation')
    expect(mainButton(wrapper).classes()).toContain('aip-btn--solid')
    // 输入为空时也能停：上游这里会禁用按钮
    expect(mainButton(wrapper).attributes('disabled')).toBeUndefined()

    await mainButton(wrapper).trigger('click')
    expect(wrapper.emitted('stop')).toHaveLength(1)
    expect(wrapper.emitted('send')).toBeUndefined()
    expect(wrapper.find('.aip__recorder').exists()).toBe(false)
  })

  it('records voice, ticks the clock and reports the duration', async () => {
    vi.useFakeTimers()
    const wrapper = mountBox({ visualizerBars: 8 })

    await mainButton(wrapper).trigger('click')
    expect(wrapper.emitted('recording-start')).toHaveLength(1)
    expect(wrapper.find('.aip__recorder').exists()).toBe(true)
    expect(wrapper.find('.aip__clock').text()).toBe('00:00')
    expect(wrapper.findAll('.aip__bar')).toHaveLength(8)
    expect(wrapper.find('.aip__field').classes()).toContain('is-hidden')
    expect(wrapper.find('.aip__tools').classes()).toContain('is-hidden')
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    expect(mainButton(wrapper).attributes('aria-label')).toBe('Stop recording')
    expect(wrapper.find('.aip').classes()).toContain('is-recording')

    await vi.advanceTimersByTimeAsync(2000)
    await nextTick()
    expect(wrapper.find('.aip__clock').text()).toBe('00:02')

    await mainButton(wrapper).trigger('click')
    expect(wrapper.find('.aip__recorder').exists()).toBe(false)
    expect(wrapper.find('.aip__field').classes()).not.toContain('is-hidden')
    expect(wrapper.emitted('recording-stop')?.[0]).toEqual([2])
    expect(wrapper.emitted('send')?.[0]).toEqual(['[Voice message - 2 seconds]', []])
  })

  it('does not emit a voice message when unmounted mid-recording', async () => {
    const wrapper = mountBox()
    await mainButton(wrapper).trigger('click')
    expect(wrapper.find('.aip__recorder').exists()).toBe(true)
    const index = mounted.indexOf(wrapper)
    if (index >= 0) mounted.splice(index, 1)
    wrapper.unmount()
    expect(wrapper.emitted('send')).toBeUndefined()
  })

  it('accepts an image, previews it in a dialog and removes it', async () => {
    const wrapper = mountBox()
    await selectFile(wrapper, png('shot.png'))

    expect(wrapper.findAll('.aip__file')).toHaveLength(1)
    // FileReader 在 jsdom 里是异步落地的，等它把 data URL 写回附件
    await vi.waitFor(() => expect(wrapper.find('.aip__file img').exists()).toBe(true))
    const img = wrapper.find('.aip__file img')
    expect(img.attributes('src')).toMatch(/^data:image\/png;base64,/)
    expect(img.attributes('alt')).toBe('shot.png')
    expect(wrapper.emitted('files-change')?.[0]?.[0]).toHaveLength(1)
    expect(mainButton(wrapper).attributes('aria-label')).toBe('Send message')

    // 发送时把 File 一并交给父级
    await wrapper.find('textarea').setValue('describe')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    const sent = wrapper.emitted('send')?.[0]
    expect(sent?.[0]).toBe('describe')
    expect((sent?.[1] as File[])[0]?.name).toBe('shot.png')
    expect(wrapper.findAll('.aip__file')).toHaveLength(0)

    // 预览弹层：锁滚动、Escape 关闭、焦点归还
    await selectFile(wrapper, png('preview.png'))
    await vi.waitFor(() => expect(wrapper.find('.aip__file img').exists()).toBe(true))
    const hit = wrapper.find('.aip__file-hit')
    ;(hit.element as HTMLElement).focus()
    await hit.trigger('click')
    await nextTick()
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.querySelector('.aip-dialog__img')).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await flushPromises()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(wrapper.find('.aip__file-hit').element)

    // 移除附件后回到语音态
    await wrapper.find('.aip__file-remove').trigger('click')
    expect(wrapper.findAll('.aip__file')).toHaveLength(0)
    expect(mainButton(wrapper).attributes('aria-label')).toBe('Voice message')
  })

  it('rejects non-image and oversized files', async () => {
    const wrapper = mountBox({ maxFileSize: 100 })
    await selectFile(wrapper, new File(['x'], 'notes.txt', { type: 'text/plain' }))
    expect(wrapper.findAll('.aip__file')).toHaveLength(0)
    expect(wrapper.emitted('file-error')?.[0]).toEqual(['type', expect.any(File)])

    await selectFile(wrapper, png('big.png', 200))
    expect(wrapper.findAll('.aip__file')).toHaveLength(0)
    expect(wrapper.emitted('file-error')?.[1]).toEqual(['size', expect.any(File)])
    expect(mainButton(wrapper).attributes('aria-label')).toBe('Voice message')
  })

  it('accepts pasted images', async () => {
    const wrapper = mountBox()
    const file = png('pasted.png')
    const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent
    Object.defineProperty(event, 'clipboardData', {
      value: { items: [{ type: 'image/png', getAsFile: () => file }] }
    })
    document.dispatchEvent(event)
    await nextTick()
    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.findAll('.aip__file')).toHaveLength(1)
  })

  it('accepts dropped images and ignores drags without files', async () => {
    const wrapper = mountBox()
    const root = wrapper.find('.aip').element as HTMLElement

    const textDrag = new Event('dragenter', { bubbles: true, cancelable: true }) as DragEvent
    Object.defineProperty(textDrag, 'dataTransfer', { value: { types: ['text/plain'] } })
    root.dispatchEvent(textDrag)
    await nextTick()
    expect(wrapper.find('.aip').classes()).not.toContain('is-dragging')

    const fileDrag = new Event('dragenter', { bubbles: true, cancelable: true }) as DragEvent
    Object.defineProperty(fileDrag, 'dataTransfer', { value: { types: ['Files'] } })
    root.dispatchEvent(fileDrag)
    await nextTick()
    expect(wrapper.find('.aip').classes()).toContain('is-dragging')

    const drop = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent
    Object.defineProperty(drop, 'dataTransfer', {
      value: { types: ['Files'], files: [png('drop.png')] }
    })
    root.dispatchEvent(drop)
    await vi.waitFor(() => expect(wrapper.find('.aip__file img').exists()).toBe(true))
    expect(drop.defaultPrevented).toBe(true)
    expect(wrapper.find('.aip').classes()).not.toContain('is-dragging')
    expect(wrapper.find('.aip__file img').attributes('alt')).toBe('drop.png')
  })

  it('hides the optional tools', () => {
    const wrapper = mountBox({ showUpload: false, showToggles: false, showVoice: false })
    expect(wrapper.find('input[type="file"]').exists()).toBe(false)
    expect(wrapper.findAll('.aip-toggle')).toHaveLength(0)
    expect(mainButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('honours custom labels and the disabled state', async () => {
    const wrapper = mountBox({
      labels: { upload: '上传图片', voiceMessage: '语音输入', search: '联网' },
      placeholder: '问点什么'
    })
    expect(wrapper.find('button[aria-label="上传图片"]').exists()).toBe(true)
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('问点什么')
    expect(mainButton(wrapper).attributes('aria-label')).toBe('语音输入')
    await wrapper.find('.aip-toggle--search').trigger('click')
    expect(wrapper.find('.aip-toggle--search').text()).toContain('联网')

    const locked = mountBox({ disabled: true })
    expect(locked.find('textarea').attributes('disabled')).toBeDefined()
    expect(mainButton(locked).attributes('disabled')).toBeDefined()
    expect(locked.find('.aip').attributes('data-disabled')).toBe('')
    await locked.find('.aip-toggle--think').trigger('click')
    expect(locked.find('.aip').attributes('data-mode')).toBeUndefined()
  })

  it('exposes focus / submit / clear', async () => {
    const wrapper = mountBox()
    const api = wrapper.vm as unknown as { focus: () => void; submit: () => void; clear: () => void }
    await wrapper.find('textarea').setValue('x')
    api.submit()
    expect(wrapper.emitted('send')?.[0]).toEqual(['x', []])

    await wrapper.find('textarea').setValue('y')
    api.clear()
    await nextTick()
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
    api.focus()
    expect(document.activeElement).toBe(wrapper.find('textarea').element)
  })
})
