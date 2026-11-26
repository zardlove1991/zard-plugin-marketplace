import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import TiltedCard from '../src/components/TiltedCard.vue'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
})

function mountCard(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(TiltedCard, {
    attachTo: document.body,
    props,
    slots: { default: '<span class="front">Front</span>', ...slots }
  })
  mounted.push(wrapper)
  return wrapper
}

describe('TiltedCard', () => {
  it('renders the image, front slot and layered effects with CSS variables', () => {
    const wrapper = mountCard({
      imageSrc: '/photo.jpg', imageWidth: 280, imageHeight: 360,
      radius: 24, glareColor: '#ff0000', captionText: 'A caption'
    })
    const figure = wrapper.find('.tilted-card')

    expect(figure.element.tagName).toBe('FIGURE')
    expect((figure.element as HTMLElement).style.width).toBe('100%')
    expect((figure.element as HTMLElement).style.height).toBe('300px')
    expect((figure.element as HTMLElement).style.perspective).toBe('800px')
    expect(wrapper.find('img.tilted-card__img').attributes('src')).toBe('/photo.jpg')
    expect(wrapper.find('.front').text()).toBe('Front')
    expect(wrapper.findAll('.tilted-card__glare')).toHaveLength(1)
    expect(wrapper.find('.tilted-card__shadow').exists()).toBe(true)
    expect(wrapper.find('figcaption').text()).toBe('A caption')

    const body = wrapper.find('.tilted-card__body').element as HTMLElement
    expect(body.style.getPropertyValue('--tc-radius')).toBe('24px')
    expect(body.style.getPropertyValue('--tc-glare-rgb')).toBe('255, 0, 0')
  })

  it('is interactive with a back slot and flips on click', async () => {
    const wrapper = mountCard({}, { back: '<span class="back">Back</span>' })
    const figure = wrapper.find('.tilted-card')

    expect(figure.attributes('role')).toBe('button')
    expect(figure.attributes('tabindex')).toBe('0')
    expect(figure.attributes('aria-pressed')).toBe('false')
    expect(wrapper.find('.back').exists()).toBe(true)

    await figure.trigger('click')
    await nextTick()
    expect(figure.attributes('aria-pressed')).toBe('true')
    expect(figure.attributes('data-flipped')).toBe('')
    expect(wrapper.emitted('flip')?.[0]).toEqual([true])
  })

  it('supports v-model:flipped control', async () => {
    const wrapper = mountCard({ flipped: false }, { back: '<span>Back</span>' })
    await wrapper.setProps({ flipped: true })
    await nextTick()
    expect(wrapper.find('.tilted-card').attributes('aria-pressed')).toBe('true')
  })

  it('flips on Enter / Space but not on repeated keydown', async () => {
    const wrapper = mountCard({}, { back: '<span>Back</span>' })
    await wrapper.find('.tilted-card').trigger('keydown', { key: 'Enter', repeat: false })
    expect(wrapper.emitted('flip')).toHaveLength(1)
    await wrapper.find('.tilted-card').trigger('keydown', { key: 'Enter', repeat: true })
    expect(wrapper.emitted('flip')).toHaveLength(1)
  })

  it('renders overlay and is not interactive without a back slot', () => {
    const wrapper = mountCard(
      { displayOverlayContent: true, overlayDepth: 40 },
      { overlay: '<span class="overlay">Hi</span>' }
    )
    expect(wrapper.find('.overlay').text()).toBe('Hi')
    expect((wrapper.find('.tilted-card__overlay').element as HTMLElement).style.getPropertyValue('--tc-lift')).toBe('40px')
    expect(wrapper.find('.tilted-card').attributes('role')).toBeUndefined()
  })
})
