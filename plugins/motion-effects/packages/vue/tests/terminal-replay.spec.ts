import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TerminalReplay from '../src/components/TerminalReplay.vue'
import * as entry from '../src/index'
import { PROJECT_SETUP_SCRIPT } from '../src/composables/useTerminalReplay'
import type { TerminalStep } from '../src/types'

/** 静态渲染用：不自动播放，避免计时器干扰 */
function mountReplay(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return mount(TerminalReplay, {
    attachTo: document.body,
    props: { autoplay: false, startDelay: 0, ...props },
    ...slots
  })
}

const root = (wrapper: ReturnType<typeof mountReplay>) => wrapper.find('[role="button"]')
/** 根元素（test-utils 的 element 是泛型节点，这里断言成 HTMLElement 才能读 style） */
const rootEl = (wrapper: ReturnType<typeof mountReplay>) => root(wrapper).element as HTMLElement

const texts = (selector: string) => (wrapper: ReturnType<typeof mountReplay>) =>
  wrapper.findAll(selector).map(line => line.text().replace(/\s+/g, ''))

/** 回放用：时间全部走假定时器，每步 1ms（typingSpeed 1000），随机抖动固定为 1 */
async function playback(
  props: Record<string, unknown>,
  step: (context: {
    wrapper: ReturnType<typeof mountReplay>
    advance: (ms: number) => Promise<void>
    /** 当前各行的文本；每次调用时读取 */
    lines: () => string[]
  }) => Promise<void>
) {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  const wrapper = mountReplay({
    typingSpeed: 1000,
    variance: 0,
    startDelay: 0,
    lineDelay: 10,
    hold: 50,
    loop: false,
    ...props
  })
  const advance = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms)
    await nextTick()
  }
  try {
    await step({
      wrapper,
      advance,
      lines: () => texts('[data-line]')(wrapper)
    })
  } finally {
    wrapper.unmount()
    vi.useRealTimers()
  }
}

describe('TerminalReplay', () => {
  it('is exported from the package entry together with its default script', () => {
    expect(entry.TerminalReplay).toBe(TerminalReplay)
    expect(entry.PROJECT_SETUP_SCRIPT).toBe(PROJECT_SETUP_SCRIPT)
  })

  it('renders the window chrome, title and prompt by default', () => {
    const wrapper = mountReplay({ script: [] })
    const el = root(wrapper)
    expect(el.exists()).toBe(true)
    expect(el.attributes('aria-label')).toBe(
      'Terminal session playback. Press Enter to skip or restart.'
    )
    expect(el.attributes('tabindex')).toBe('0')
    expect(wrapper.text()).toContain('weiliantong — zsh')
    // window chrome：三个圆点
    expect(wrapper.findAll('[data-dot]')).toHaveLength(3)
    wrapper.unmount()
  })

  it('drops the title bar for chrome="none" and keeps the title for "minimal"', () => {
    const none = mountReplay({ script: [], chrome: 'none' })
    expect(none.text()).not.toContain('weiliantong — zsh')
    expect(none.find('[data-dot]').exists()).toBe(false)
    none.unmount()

    const minimal = mountReplay({ script: [], chrome: 'minimal' })
    expect(minimal.text()).toContain('weiliantong — zsh')
    expect(minimal.find('[data-dot]').exists()).toBe(false)
    minimal.unmount()
  })

  it('maps theme and colours to CSS variables and the border colour', async () => {
    // 主题在 onMounted 里才同步到 DOM，要等一次渲染
    const dark = mountReplay({ script: [], theme: 'dark', accentColor: '#ff0000' })
    await nextTick()
    expect(rootEl(dark).style.getPropertyValue('--tr-accent')).toBe('#ff0000')
    expect(rootEl(dark).style.getPropertyValue('--tr-window')).toBe('#111113')
    expect(rootEl(dark).style.getPropertyValue('--tr-ink')).toBe('#E7E7EA')
    expect(rootEl(dark).style.border).toContain('rgba(255, 255, 255, 0.08)')
    dark.unmount()

    const light = mountReplay({ script: [], theme: 'light', windowColor: '#fafafa' })
    await nextTick()
    expect(rootEl(light).style.getPropertyValue('--tr-window')).toBe('#fafafa')
    expect(rootEl(light).style.getPropertyValue('--tr-ink')).toBe('#18181b')
    expect(rootEl(light).style.border).toContain('rgba(0, 0, 0, 0.1)')
    light.unmount()
  })

  it('detects a dark or light parent for theme="auto"', async () => {
    const wrapper = mountReplay({ script: [], theme: 'dark' })
    await nextTick()
    // 组件探测的是根元素的直接父元素；挂载时这一层由 test-utils 创建，所以直接给它上色，
    // 再切换 theme 触发重新探测
    const parent = rootEl(wrapper).parentElement!

    parent.style.backgroundColor = 'rgb(10, 10, 12)'
    await wrapper.setProps({ theme: 'auto' })
    expect(rootEl(wrapper).style.getPropertyValue('--tr-window')).toBe('#111113')

    parent.style.backgroundColor = 'rgb(250, 250, 250)'
    await wrapper.setProps({ theme: 'dark' })
    await wrapper.setProps({ theme: 'auto' })
    expect(rootEl(wrapper).style.getPropertyValue('--tr-window')).toBe('#ffffff')
    wrapper.unmount()
  })

  it('re-evaluates theme="auto" when the theme prop changes', async () => {
    const wrapper = mountReplay({ script: [], theme: 'dark' })
    await nextTick()
    expect(rootEl(wrapper).style.getPropertyValue('--tr-window')).toBe('#111113')
    await wrapper.setProps({ theme: 'light' })
    expect(rootEl(wrapper).style.getPropertyValue('--tr-window')).toBe('#ffffff')
    wrapper.unmount()
  })

  it('applies size and typography props', () => {
    const wrapper = mountReplay({ script: [], fontSize: 16, lineHeight: 2, radius: 8, height: 240 })
    const el = rootEl(wrapper)
    expect(el.style.fontSize).toBe('16px')
    expect(el.style.lineHeight).toBe('2')
    expect(el.style.borderRadius).toBe('8px')
    expect(el.style.height).toBe('240px')
    expect(el.style.maxWidth).toBe('720px')
    wrapper.unmount()
  })

  it('passes class and style through to the root without a className prop', () => {
    const wrapper = mount(TerminalReplay, {
      attachTo: document.body,
      props: { autoplay: false, script: [], class: 'my-terminal', style: { maxWidth: '320px' } }
    })
    const el = root(wrapper)
    expect(el.classes()).toContain('my-terminal')
    // 透传的 style 排在组件自己的样式之后，所以能覆盖
    expect(rootEl(wrapper).style.maxWidth).toBe('320px')
    wrapper.unmount()
  })

  const tagged: TerminalStep[] = [
    {
      type: 'output',
      // 上游数据的闭合标签不带名字；带名字的闭合也一并支持
      lines: [
        'plain [success]ok[/] [accent]hot[/] [bold]thick[/] [muted]dim[/] [error]named[/error]'
      ]
    }
  ]

  it('renders inline tags as coloured spans without touching the surrounding text', async () => {
    const wrapper = mountReplay({ script: tagged, lineDelay: 0 })
    await new Promise(resolve => setTimeout(resolve, 30))
    const line = wrapper.find('[data-line="output"]')
    expect(line.text()).toBe('plain ok hot thick dim named')
    // 外层还有一个给整行定颜色的 span，只取行内标签产生的那些
    const spans = line.find('span').findAll('span')
    // jsdom 会把十六进制色值规范化成 rgb()；accent 取的是 accentColor 的值本身
    expect(spans.map(span => [span.text(), (span.element as HTMLElement).style.color])).toEqual([
      ['ok', 'rgb(74, 222, 128)'],
      ['hot', 'rgb(37, 99, 235)'],
      ['thick', 'inherit'],
      ['dim', 'rgba(231, 231, 234, 0.62)'],
      ['named', 'rgb(248, 113, 113)']
    ])
    expect((spans[2]!.element as HTMLElement).style.fontWeight).toBe('700')
    expect(line.html()).not.toContain('[success]')
    wrapper.unmount()
  })
})

describe('TerminalReplay playback', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('types a command character by character, then commits it as a line', async () => {
    await playback({ script: [{ type: 'command', text: 'npm i', directory: '~/app' }] }, async ({ wrapper, advance, lines }) => {
      await advance(0)
      expect(lines()).toEqual([])
      const typing = wrapper.find('[data-typing]')
      expect(typing.text()).toBe('❯~/app')
      expect(typing.find('.tr-cursor').exists()).toBe(true)

      await advance(3)
      expect(wrapper.find('[data-typing]').text()).toBe('❯~/appnpm')

      await advance(3)
      expect(wrapper.find('[data-typing]').exists()).toBe(false)
      expect(lines()).toHaveLength(1)
      const line = wrapper.find('[data-line="command"]')
      expect(line.find('.tr-accent').text()).toBe('❯')
      expect(line.find('.tr-dir').text()).toBe('~/app')
      expect(line.findAll('span')[2]!.text()).toBe('npm i')
      expect(line.find('.tr-copy').text()).toBe('复制')
    })
  })

  it('falls back to the directory prop for commands without one', async () => {
    await playback({ directory: '~', script: [{ type: 'command', text: 'ls' }] }, async ({ advance, lines }) => {
      await advance(4)
      expect(lines()).toEqual(['❯~ls复制'])
    })
  })

  it('appends output lines one after another, honouring per-line and default delays', async () => {
    await playback(
      { script: [{ type: 'output', lines: ['first', 'second'], delay: 100 }, { type: 'output', lines: ['third'] }] },
      async ({ advance, lines }) => {
        await advance(5)
        expect(lines()).toEqual(['first'])
        // 每一行之后都会等 delay，包括该步骤的最后一行
        await advance(100)
        expect(lines()).toEqual(['first', 'second'])
        await advance(100)
        expect(lines()).toEqual(['first', 'second', 'third'])
      }
    )
  })

  it('animates a spinner and then records its completion as a status line', async () => {
    await playback(
      { script: [{ type: 'spinner', text: '正在安装依赖', duration: 200, done: '[success]依赖安装完成[/]' }] },
      async ({ wrapper, advance, lines }) => {
        await advance(0)
        expect(wrapper.find('[data-active="spinner"]').text()).toBe('⠋正在安装依赖')
        await advance(80)
        expect(wrapper.find('[data-active="spinner"]').text()).toBe('⠙正在安装依赖')
        await advance(200)
        expect(wrapper.find('[data-active]').exists()).toBe(false)
        expect(lines()).toEqual(['依赖安装完成'])
        expect((wrapper.find('.tr-line span').element as HTMLElement).style.color).toBe('rgb(74, 222, 128)')
      }
    )
  })

  it('animates a progress bar and then records its completion as a status line', async () => {
    await playback(
      { script: [{ type: 'progress', text: '构建', duration: 120, done: '完成' }] },
      async ({ wrapper, advance, lines }) => {
        await advance(0)
        expect(wrapper.find('[data-active="progress"]').text()).toBe('▍构建[····················] 0%')
        await advance(60)
        expect(wrapper.find('[data-active="progress"]').text()).toBe('▍构建[██████████··········] 50%')
        await advance(200)
        expect(wrapper.find('[data-active]').exists()).toBe(false)
        expect(lines()).toEqual(['完成'])
      }
    )
  })

  it('waits through a pause and empties the screen on clear', async () => {
    await playback(
      {
        lineDelay: 0,
        script: [
          { type: 'output', lines: ['a'] },
          { type: 'pause', duration: 500 },
          { type: 'output', lines: ['b'] },
          { type: 'clear' },
          { type: 'output', lines: ['c'] }
        ]
      },
      async ({ advance, lines }) => {
        await advance(100)
        expect(lines()).toEqual(['a'])
        await advance(400)
        expect(lines()).toEqual(['c'])
      }
    )
  })

  it('emits complete once the script ends and stays finished when loop is off', async () => {
    await playback({ lineDelay: 0, script: [{ type: 'output', lines: ['a'] }] }, async ({ wrapper, advance, lines }) => {
      expect(wrapper.emitted('complete')).toBeUndefined()
      await advance(500)
      expect(wrapper.emitted('complete')).toHaveLength(1)
      expect(lines()).toEqual(['a'])
    })
  })

  it('starts over after the hold time when loop is on', async () => {
    await playback(
      { lineDelay: 0, loop: true, hold: 50, script: [{ type: 'output', lines: ['a'] }] },
      async ({ wrapper, advance, lines }) => {
        await advance(40)
        expect(wrapper.emitted('complete')).toHaveLength(1)
        await advance(15)
        expect(wrapper.emitted('complete')).toHaveLength(2)
        await advance(40)
        expect(lines()).toEqual(['a'])
      }
    )
  })

  it('keeps playing the script it started with when the script prop changes mid-run', async () => {
    await playback(
      {
        lineDelay: 0,
        script: [{ type: 'output', lines: ['a'] }, { type: 'pause', duration: 100 }, { type: 'output', lines: ['b'] }]
      },
      async ({ wrapper, advance, lines }) => {
        await advance(10)
        await wrapper.setProps({ script: [{ type: 'output', lines: ['z'] }] })
        await advance(200)
        expect(lines()).toEqual(['a', 'b'])
      }
    )
  })

  it('uses the bundled project setup script by default', () => {
    const wrapper = mountReplay({ script: undefined })
    expect(wrapper.props('script')).toEqual(PROJECT_SETUP_SCRIPT)
    wrapper.unmount()
  })
})

describe('TerminalReplay interaction', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('skips the rest of the current step on click, without advancing time', async () => {
    await playback(
      { lineDelay: 60000, script: [{ type: 'output', lines: ['a', 'b'] }, { type: 'output', lines: ['slow'] }] },
      async ({ wrapper, advance, lines }) => {
        await advance(0)
        expect(lines()).toEqual(['a'])
        await wrapper.find('[role="button"]').trigger('click')
        await advance(0)
        // 跳过只作用于当前步骤：同一步里剩下的 b 立刻出现；下一步的内容前面没有等待，所以也跟着出现，
        // 但下一步自己的等待不会被跳过
        expect(lines()).toEqual(['a', 'b', 'slow'])
        await advance(59999)
        expect(wrapper.emitted('complete')).toBeUndefined()
      }
    )
  })

  it('finishes the command being typed instantly on click', async () => {
    await playback({ script: [{ type: 'command', text: 'npm i' }, { type: 'pause', duration: 60000 }] }, async ({ wrapper, advance, lines }) => {
      await advance(2)
      expect(wrapper.find('[data-typing]').text().replace(/\s+/g, '')).toBe('❯~np')
      await wrapper.find('[role="button"]').trigger('click')
      await advance(0)
      expect(wrapper.find('[data-typing]').exists()).toBe(false)
      expect(lines()).toHaveLength(1)
    })
  })

  it('still skips right after a restart left an older timer pending', async () => {
    await playback(
      {
        lineDelay: 0,
        hold: 50,
        script: [{ type: 'pause', duration: 1000 }, { type: 'output', lines: ['a'] }]
      },
      async ({ wrapper, advance, lines }) => {
        // 第一轮：pause 走完后输出 a，进入 hold 等待（留下一个 50ms 的计时器）
        await advance(1000)
        expect(wrapper.emitted('complete')).toHaveLength(1)
        expect(lines()).toEqual(['a'])

        // hold 期间点击：从头重播，新一轮停在开头的 pause 上
        await wrapper.find('[role="button"]').trigger('click')
        await advance(0)
        expect(lines()).toEqual([])

        // 旧一轮的 hold 计时器在这段时间里到点；它不该顺手清掉新一轮的"唤醒入口"
        await advance(60)
        await wrapper.find('[role="button"]').trigger('click')
        await advance(0)
        expect(wrapper.emitted('complete')).toHaveLength(2)
        expect(lines()).toEqual(['a'])
      }
    )
  })

  it('treats Enter and Space like a click and ignores other keys', async () => {
    await playback({ lineDelay: 60000, script: [{ type: 'output', lines: ['a', 'b'] }] }, async ({ wrapper, advance, lines }) => {
      const el = wrapper.find('[role="button"]')
      await advance(0)
      expect(el.trigger('keydown', { key: 'a' })).resolves.toBeUndefined()
      expect(lines()).toEqual(['a'])
      await el.trigger('keydown', { key: 'Enter' })
      expect(lines()).toEqual(['a', 'b'])
    })
    await playback({ lineDelay: 60000, script: [{ type: 'output', lines: ['a', 'b'] }] }, async ({ wrapper, advance, lines }) => {
      await advance(0)
      await wrapper.find('[role="button"]').trigger('keydown', { key: ' ' })
      expect(lines()).toEqual(['a', 'b'])
    })
  })

  it('restarts playback when clicked after the script has finished', async () => {
    await playback({ lineDelay: 0, script: [{ type: 'output', lines: ['a'] }] }, async ({ wrapper, advance, lines }) => {
      await advance(0)
      expect(wrapper.emitted('complete')).toHaveLength(1)
      await wrapper.find('[role="button"]').trigger('click')
      await advance(0)
      expect(lines()).toEqual(['a'])
      expect(wrapper.emitted('complete')).toHaveLength(2)
    })
  })

  it('does not interact when interactive is off', async () => {
    await playback({ lineDelay: 60000, interactive: false, script: [{ type: 'output', lines: ['a', 'b'] }] }, async ({ wrapper, advance, lines }) => {
      const el = wrapper.find('[role="button"]')
      expect(el.attributes('tabindex')).toBe('-1')
      expect(rootEl(wrapper).style.cursor).toBe('default')
      await advance(0)
      await el.trigger('click')
      await el.trigger('keydown', { key: 'Enter' })
      expect(lines()).toEqual(['a'])
    })
  })

  it('copies a command from its copy button without skipping the playback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    try {
      await playback(
        { script: [{ type: 'command', text: 'npm i' }, { type: 'pause', duration: 60000 }] },
        async ({ wrapper, advance, lines }) => {
          await advance(6)
          expect(lines()).toHaveLength(1)
          await wrapper.find('.tr-copy').trigger('click')
          expect(writeText).toHaveBeenCalledWith('npm i')
          // 没有触发跳过：随后的 pause 仍在等待
          expect(wrapper.emitted('complete')).toBeUndefined()
        }
      )
    } finally {
      delete (navigator as { clipboard?: unknown }).clipboard
    }
  })

  it('hides the copy buttons when copyable is off', async () => {
    await playback({ copyable: false, script: [{ type: 'command', text: 'ls' }] }, async ({ wrapper, advance }) => {
      await advance(4)
      expect(wrapper.find('[data-line="command"]').exists()).toBe(true)
      expect(wrapper.find('.tr-copy').exists()).toBe(false)
    })
  })

  it('ends a spinner step immediately when skipped', async () => {
    await playback(
      { script: [{ type: 'spinner', text: '安装', duration: 60000, done: '装好了' }] },
      async ({ wrapper, advance, lines }) => {
        await advance(0)
        expect(wrapper.find('[data-active="spinner"]').exists()).toBe(true)
        await wrapper.find('[role="button"]').trigger('click')
        expect(wrapper.find('[data-active]').exists()).toBe(false)
        expect(lines()).toEqual(['装好了'])
        expect(wrapper.emitted('complete')).toHaveLength(1)
      }
    )
  })

  it('restarts with the current props when play() is called through the component ref', async () => {
    await playback(
      { lineDelay: 0, script: [{ type: 'output', lines: ['old'] }, { type: 'pause', duration: 60000 }] },
      async ({ wrapper, advance, lines }) => {
        await advance(0)
        expect(lines()).toEqual(['old'])
        await wrapper.setProps({ script: [{ type: 'output', lines: ['new'] }] })
        wrapper.vm.play()
        await advance(0)
        expect(lines()).toEqual(['new'])
      }
    )
  })

  it('shapes the typing cursor after the cursor prop', async () => {
    await playback({ script: [{ type: 'command', text: 'x' }, { type: 'pause', duration: 60000 }] }, async ({ wrapper, advance }) => {
      await advance(0)
      const cursor = () => wrapper.find('.tr-cursor').element as HTMLElement
      expect(cursor().style.width).toBe('0.62em')
      expect(cursor().style.height).toBe('1.05em')
      await wrapper.setProps({ cursor: 'bar' })
      expect(cursor().style.width).toBe('2px')
      await wrapper.setProps({ cursor: 'underline' })
      expect(cursor().style.height).toBe('2px')
      expect(cursor().style.verticalAlign).toBe('text-bottom')
    })
  })
})

/** 可控的 IntersectionObserver：记录创建过的实例，并由测试决定元素是否在视口内 */
function stubIntersection() {
  const created: Array<{
    callback: IntersectionObserverCallback
    observe: ReturnType<typeof vi.fn>
    disconnect: ReturnType<typeof vi.fn>
  }> = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      disconnect = vi.fn()
      constructor(callback: IntersectionObserverCallback) {
        created.push({ callback, observe: this.observe, disconnect: this.disconnect })
      }
    }
  )
  return {
    created,
    emit(isIntersecting: boolean) {
      const entry = { isIntersecting } as IntersectionObserverEntry
      created.at(-1)!.callback([entry], {} as IntersectionObserver)
    }
  }
}

describe('TerminalReplay visibility', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('starts on mount with autoplay and pauses when it leaves the viewport', async () => {
    const io = stubIntersection()
    await playback({ autoplay: true, script: [{ type: 'output', lines: ['a'] }, { type: 'pause', duration: 60000 }] }, async ({ wrapper, advance, lines }) => {
      expect(io.created).toHaveLength(1)
      expect(io.created[0]!.observe).toHaveBeenCalledWith(wrapper.find('[role="button"]').element)
      await advance(0)
      expect(lines()).toEqual(['a'])

      // 离屏：当前这轮回放被中止
      io.emit(false)
      await advance(60000)
      expect(wrapper.emitted('complete')).toBeUndefined()

      // 回到视口：从头重播
      io.emit(true)
      await advance(0)
      expect(lines()).toEqual(['a'])
    })
  })

  it('starts on mount without autoplay but never observes the viewport', async () => {
    const io = stubIntersection()
    await playback({ autoplay: false, script: [{ type: 'output', lines: ['a'] }] }, async ({ advance, lines }) => {
      expect(io.created).toHaveLength(0)
      await advance(0)
      expect(lines()).toEqual(['a'])
    })
  })

  it('disconnects the observer and abandons playback on unmount', async () => {
    const io = stubIntersection()
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const wrapper = mountReplay({ autoplay: true, startDelay: 0, script: [{ type: 'output', lines: ['a'] }, { type: 'pause', duration: 60000 }] })
    await vi.advanceTimersByTimeAsync(1)
    wrapper.unmount()
    expect(io.created[0]!.disconnect).toHaveBeenCalledTimes(1)

    const before = wrapper.emitted('complete')?.length ?? 0
    await vi.advanceTimersByTimeAsync(120000)
    expect(wrapper.emitted('complete')?.length ?? 0).toBe(before)
  })

  it('keeps the scroll area pinned to the bottom as content appears', async () => {
    await playback({ script: [{ type: 'command', text: 'npm i' }] }, async ({ wrapper, advance }) => {
      const scroller = wrapper.find('.tr-scroll').element as HTMLElement
      Object.defineProperty(scroller, 'scrollHeight', { value: 480, configurable: true })
      expect(scroller.scrollTop).toBe(0)
      await advance(0)
      expect(scroller.scrollTop).toBe(480)
    })
  })

  it('re-evaluates viewport gating when autoplay changes at runtime', async () => {
    const io = stubIntersection()
    await playback({ autoplay: false, startDelay: 0, lineDelay: 0, script: [{ type: 'output', lines: ['a'] }, { type: 'pause', duration: 60000 }] }, async ({ wrapper, advance }) => {
      expect(io.created).toHaveLength(0)
      await wrapper.setProps({ autoplay: true })
      expect(io.created).toHaveLength(1)
      await advance(0)

      io.emit(false)
      await advance(60000)
      expect(wrapper.emitted('complete')).toBeUndefined()

      await wrapper.setProps({ autoplay: false })
      expect(io.created[0]!.disconnect).toHaveBeenCalledTimes(1)
      await advance(0)
      io.emit(false)
      await advance(60000)
      expect(wrapper.emitted('complete')).toHaveLength(1)
    })
  })
})
