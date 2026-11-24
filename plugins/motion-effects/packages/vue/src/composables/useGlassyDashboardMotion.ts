import { gsap } from 'gsap'
import { formatCount, type CountFormat } from './useGlassyDashboard'

/**
 * GlassyDashboard 的 GSAP 时间线：入场交错、柱条 / 曲线 / 环形 / 进度条揭示、数字滚动、
 * 切页淡出。与 React 原件的时长、缓动、起点完全一致；逐帧状态不进 Vue 响应式（vue-porting §4.1）。
 * 所有 tween 收进 gsap.context，重播前 revert、卸载时 revert，避免残留。
 */
export interface GlassyDashboardMotionOptions {
  content: () => HTMLElement | null
  reduced: () => boolean
}

export function useGlassyDashboardMotion({ content, reduced }: GlassyDashboardMotionOptions) {
  let context: gsap.Context | null = null
  let exit: gsap.core.Tween | null = null
  let disposed = false

  function enter() {
    const layer = content()
    if (!layer || disposed) return
    context?.revert()
    const counts = layer.querySelectorAll<HTMLElement>('[data-gd-count]')
    if (reduced()) {
      counts.forEach(el => {
        el.textContent = formatCount[el.dataset.format as CountFormat](Number(el.dataset.gdCount))
      })
      return
    }

    context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline.fromTo(
        layer,
        { opacity: 0.55, filter: 'blur(5px)' },
        { opacity: 1, filter: 'blur(0px)', clearProps: 'opacity,filter', duration: 0.32 },
        0
      )
      const entering = layer.querySelectorAll('[data-gd-enter]')
      if (entering.length)
        timeline.from(
          entering,
          { y: 18, opacity: 0, stagger: 0.045, duration: 0.5, clearProps: 'transform,opacity' },
          0.035
        )

      const bars = layer.querySelectorAll('.gd-stack-bar')
      const line = layer.querySelector('.gd-line-reveal')
      const ring = layer.querySelector('.gd-donut-draw')
      const meters = layer.querySelectorAll('.gd-fill')

      if (bars.length)
        timeline.from(bars, { scaleY: 0, stagger: 0.034, duration: 0.46, clearProps: 'transform' }, 0.17)
      if (line)
        timeline.fromTo(
          line,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.74, clearProps: 'clipPath' },
          0.14
        )
      if (ring)
        timeline.fromTo(
          ring,
          { attr: { 'stroke-dasharray': '0 100' } },
          { attr: { 'stroke-dasharray': '100 0' }, duration: 0.76 },
          0.16
        )
      if (meters.length)
        timeline.from(meters, { scaleX: 0, duration: 0.58, stagger: 0.045, clearProps: 'transform' }, 0.18)

      counts.forEach((el, index) => {
        const value = Number(el.dataset.gdCount)
        const format = formatCount[el.dataset.format as CountFormat]
        const counter = { value: 0 }
        timeline.to(
          counter,
          { value, duration: 0.75, onUpdate: () => { el.textContent = format(counter.value) } },
          0.09 + index * 0.02
        )
      })
    }, layer)
  }

  function fadeOutAndSwap(swap: () => void) {
    const layer = content()
    exit?.kill()
    if (disposed || reduced() || !layer) {
      swap()
      return
    }
    exit = gsap.to(layer, {
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.14,
      ease: 'power1.in',
      onComplete: swap
    })
  }

  function dispose() {
    disposed = true
    exit?.kill()
    context?.revert()
    context = null
  }

  return { enter, fadeOutAndSwap, dispose }
}
