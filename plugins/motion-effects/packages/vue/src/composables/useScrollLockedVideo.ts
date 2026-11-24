import { onBeforeUnmount, onMounted, shallowRef, type Ref } from 'vue'

interface UseScrollLockedVideoOptions {
  section: Ref<HTMLElement | null>
  video: Ref<HTMLVideoElement | null>
  title: Ref<HTMLElement | null>
  hint: Ref<HTMLElement | null>
  tagline: Ref<HTMLElement | null>
  progress: Ref<HTMLElement | null>
  /** 惰性读取：运行中修改它直接生效，不需要重建整套监听 */
  scrubDistance: () => number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * 滚动锁定视频 Hero 的驱动逻辑。
 *
 * 注意：挂载期间页面无法滚动，而且不会自行解锁——上游实现如此（"没有释放阀"），
 * 滚轮和触摸只用来在正反两个方向上推拉视频。不要把它嵌在还有其它内容的页面里。
 */
export function useScrollLockedVideo(options: UseScrollLockedVideoOptions) {
  const ready = shallowRef(false)

  onMounted(() => {
    const video = options.video.value
    const section = options.section.value
    if (!video || !section) return

    let duration = 0
    let rafId = 0
    let targetProgress = 0
    let currentProgress = 0
    let hasStartedScrolling = false
    let isSeeking = false
    let pendingTime: number | null = null
    let locked = false
    let lockedScrollY = 0
    let touchStartY = 0

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    const onLoadedData = () => {
      duration = video.duration || 0
      ready.value = true
      // 减少动态效果：直接停在接近结尾的一帧，不做逐帧动画
      if (reduceMotion) video.currentTime = duration * 0.92
    }
    video.addEventListener('loadeddata', onLoadedData)

    // iOS Safari 往往要等真正开始播放才缓冲视频数据；这里只 seek 不 play，
    // 所以先静音播放一下再立刻暂停，把加载带起来
    const kickstartLoad = () => {
      const playing = video.play()
      if (playing && typeof playing.then === 'function') {
        playing.then(() => video.pause()).catch(() => {})
      } else {
        video.pause()
      }
    }
    kickstartLoad()

    // 一次只发起一个 seek；途中来的新目标只保留最后一个
    const onSeeked = () => {
      isSeeking = false
      if (pendingTime !== null) {
        const time = pendingTime
        pendingTime = null
        isSeeking = true
        video.currentTime = time
      }
    }
    video.addEventListener('seeked', onSeeked)

    const seekTo = (time: number) => {
      if (isSeeking) {
        pendingTime = time
        return
      }
      isSeeking = true
      video.currentTime = time
    }

    // 整个生命周期都保持锁定：页面不动，滚动输入只用来推拉视频
    const engageLock = () => {
      if (locked || typeof document === 'undefined') return
      locked = true
      lockedScrollY = window.scrollY
      const body = document.body.style
      body.position = 'fixed'
      body.top = `-${lockedScrollY}px`
      body.left = '0'
      body.right = '0'
      body.width = '100%'
      body.height = '100%'
      body.overscrollBehavior = 'none'
    }

    const releaseLock = () => {
      if (!locked || typeof document === 'undefined') return
      locked = false
      const y = lockedScrollY
      const body = document.body.style
      body.position = ''
      body.top = ''
      body.left = ''
      body.right = ''
      body.width = ''
      body.height = ''
      body.overscrollBehavior = ''
      window.scrollTo(0, y)
    }

    engageLock()

    const addDelta = (deltaY: number) => {
      targetProgress = clamp(targetProgress + deltaY / options.scrubDistance(), 0, 1)
      if (targetProgress > 0.001) hasStartedScrolling = true
      return true
    }

    const onWheel = (event: WheelEvent) => {
      addDelta(event.deltaY)
      event.preventDefault()
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchStartY
      const deltaY = touchStartY - y
      touchStartY = y
      addDelta(deltaY)
      event.preventDefault()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    // 部分 iOS 版本上，只挂在 window 的监听会输给浏览器自己的滚动处理，所以在元素上再用捕获阶段绑一次
    section.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    section.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })

    const frame = () => {
      currentProgress += (targetProgress - currentProgress) * 0.18

      if (duration > 0) {
        seekTo(currentProgress * duration)
      }

      video.style.transform = `scale(${1 + currentProgress * 0.06})`

      const title = options.title.value
      if (title) {
        const t = 1 - clamp(currentProgress / 0.35, 0, 1)
        title.style.opacity = String(t)
        title.style.transform = `translateY(${(1 - t) * -24}px) scale(${0.96 + t * 0.04})`
        title.style.filter = `blur(${(1 - t) * 10}px)`
      }
      const hint = options.hint.value
      if (hint) {
        hint.style.opacity = hasStartedScrolling ? '0' : '1'
      }
      const tagline = options.tagline.value
      if (tagline) {
        // 与标题同样的"模糊到清晰"，放在揭示快完成时出现
        const t = clamp((currentProgress - 0.82) / 0.18, 0, 1)
        tagline.style.opacity = String(t)
        tagline.style.transform = `translateY(${(1 - t) * 20}px) scale(${0.97 + t * 0.03})`
        tagline.style.filter = `blur(${(1 - t) * 8}px)`
      }
      const progress = options.progress.value
      if (progress) {
        progress.style.transform = `scaleX(${currentProgress})`
      }

      rafId = requestAnimationFrame(frame)
    }

    if (!reduceMotion) {
      rafId = requestAnimationFrame(frame)
    }

    onBeforeUnmount(() => {
      video.removeEventListener('loadeddata', onLoadedData)
      video.removeEventListener('seeked', onSeeked)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      section.removeEventListener('touchstart', onTouchStart, true)
      section.removeEventListener('touchmove', onTouchMove, true)
      cancelAnimationFrame(rafId)
      releaseLock()
    })
  })

  return { ready }
}
