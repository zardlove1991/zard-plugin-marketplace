import { computed, onBeforeUnmount, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { GridMotionDirection, GridMotionItem, GridMotionSettings, GridMotionTile } from '../types'

const DIRECTIONS: GridMotionDirection[] = ['alternate', 'left', 'right']
const IMAGE = /^(https?:\/\/|\/\/|\/|\.\.?\/|data:image\/|blob:)|\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i
const INERTIA = [0.42, 0.32, 0.26, 0.22]
const PACE = [1, 0.86, 1.12, 0.94]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const wrap = (value: number, total: number) => ((value % total) + total) % total
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

const feather = (side: string, zone: number) => {
  const stops: string[] = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    const alpha = t * t * t * (t * (t * 6 - 15) + 10)
    stops.push(`rgba(0, 0, 0, ${alpha.toFixed(4)}) ${(t * zone).toFixed(2)}%`)
  }
  const mirrored = stops.map((_, i) => {
    const t = (12 - i) / 12
    const alpha = t * t * t * (t * (t * 6 - 15) + 10)
    return `rgba(0, 0, 0, ${alpha.toFixed(4)}) ${(100 - t * zone).toFixed(2)}%`
  })
  return `linear-gradient(${side}, ${stops.join(', ')}, ${mirrored.join(', ')})`
}

export const fadeMask = (amount: number) =>
  amount > 0 ? `${feather('to right', amount * 34)}, ${feather('to bottom', amount * 44)}` : undefined

export const toTile = (item: GridMotionItem): GridMotionTile => {
  if (item === null || item === undefined || item === false) return { kind: 'empty' }
  if (typeof item === 'object' && typeof item.src === 'string') {
    return { kind: 'image', src: item.src, alt: item.alt ?? '' }
  }
  const text = String(item).trim()
  return IMAGE.test(text) ? { kind: 'image', src: text, alt: '' } : { kind: 'text', text }
}

export interface GridLayout {
  planeWidth: number
  planeHeight: number
  tileWidth: number
  tileHeight: number
  step: number
  perRow: number
  period: number
  copies: number
  top: number
  perspective: number
}

export interface UseGridMotionOptions {
  root: Ref<HTMLElement | null>
  plane: Ref<HTMLElement | null>
  settings: Required<GridMotionSettings>
}

export function useGridMotion({ root, plane, settings }: UseGridMotionOptions) {
  const size = ref({ width: 0, height: 0 })
  const config = computed(() => ({
    rows: clamp(Math.round(settings.rows), 1, 12),
    aspect: clamp(settings.aspectRatio, 0.3, 4),
    gap: Math.max(0, settings.gap),
    angle: settings.angle,
    tilt: clamp(settings.tilt, 0, 75),
    speed: settings.speed,
    direction: DIRECTIONS.includes(settings.direction) ? settings.direction : 'alternate' as GridMotionDirection,
    parallax: clamp(settings.parallax, 0, 1),
    spotlight: clamp(settings.spotlight, 0, 1),
    dim: clamp(settings.dim, 0, 1),
    fade: clamp(settings.fade, 0, 1)
  }))

  const layout: ComputedRef<GridLayout | null> = computed(() => {
    const { width, height } = size.value
    if (!width || !height) return null
    const cfg = config.value
    const turn = (cfg.angle * Math.PI) / 180
    const lean = (cfg.tilt * Math.PI) / 180
    const cos = Math.abs(Math.cos(turn))
    const sin = Math.abs(Math.sin(turn))
    const planeHeight = ((width * sin + height * cos) / Math.max(0.3, Math.cos(lean))) * 1.12
    const planeWidth = (width * cos + height * sin) * (1 + Math.sin(lean) * 0.9) * 1.12
    const tileHeight = Math.max(16, (planeHeight - cfg.gap * (cfg.rows - 1)) / cfg.rows)
    const tileWidth = tileHeight * cfg.aspect
    const step = tileWidth + cfg.gap
    const perRow = Math.ceil(planeWidth / step) + 1
    const period = perRow * step
    return {
      planeWidth,
      planeHeight,
      tileWidth,
      tileHeight,
      step,
      perRow,
      period,
      copies: Math.ceil(planeWidth / period) + 2,
      top: (planeHeight - cfg.rows * tileHeight - (cfg.rows - 1) * cfg.gap) / 2,
      perspective: Math.max(width, height) * 1.5
    }
  })

  const tiles = computed(() => settings.items.map(toTile))

  /** 逐帧状态用普通对象，跨引擎重放保留（对应 React 的 motionRef） */
  const motion = {
    offsets: [] as number[],
    shifts: [] as number[],
    intro: 0,
    pointer: { x: 0, y: 0, active: false }
  }

  let ro: ResizeObserver | null = null
  let stopEngine: (() => void) | null = null

  onMounted(() => {
    const host = root.value
    if (!host) return
    ro = new ResizeObserver(() => {
      const width = Math.round(host.clientWidth)
      const height = Math.round(host.clientHeight)
      if (size.value.width !== width || size.value.height !== height) size.value = { width, height }
    })
    ro.observe(host)

    const onMove = (event: PointerEvent) => {
      motion.pointer.x = event.clientX
      motion.pointer.y = event.clientY
      motion.pointer.active = true
    }
    const onUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch') motion.pointer.active = false
    }
    const onLeave = () => { motion.pointer.active = false }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('blur', onLeave)
    document.documentElement.addEventListener('pointerleave', onLeave)
    roCleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('blur', onLeave)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  })
  let roCleanup: (() => void) | null = null

  const startEngine = () => {
    stopEngine?.()
    stopEngine = null
    const host = root.value
    const surface = plane.value
    const box = layout.value
    if (!host || !surface || !box) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const rowEls = Array.from(surface.children) as HTMLElement[]
    const tileEls = rowEls.map(row => Array.from(row.children) as HTMLElement[])
    const spots = tileEls.map(list => new Float32Array(list.length))
    const written = tileEls.map(list => new Float32Array(list.length))
    let raf = 0
    let last = performance.now()
    let visible = true
    let alive = true
    if (motion.intro >= 1) surface.style.opacity = '1'

    const frame = (now: number) => {
      raf = 0
      if (!alive) return
      const cfg = config.value
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now

      if (motion.intro < 1) {
        motion.intro = Math.min(1, motion.intro + dt / 0.9)
        surface.style.opacity = String(1 - (1 - motion.intro) ** 3)
      }

      const rect = host.getBoundingClientRect()
      const scale = rect.width ? host.clientWidth / rect.width : 1
      const halfWidth = host.clientWidth / 2 || 1
      const halfHeight = host.clientHeight / 2 || 1
      const px = (motion.pointer.x - rect.left) * scale - halfWidth
      const py = (motion.pointer.y - rect.top) * scale - halfHeight
      const inside = motion.pointer.active && Math.abs(px) <= halfWidth && Math.abs(py) <= halfHeight
      const lean = (cfg.tilt * Math.PI) / 180
      const turn = (cfg.angle * Math.PI) / 180
      const depth = box.perspective
      let flatY = py
      let flatX = px
      if (lean > 0.0001) {
        flatY = (py * depth) / (depth * Math.cos(lean) + py * Math.sin(lean))
        flatX = (px * (depth - flatY * Math.sin(lean))) / depth
      }
      const planeX = flatX * Math.cos(turn) + flatY * Math.sin(turn)
      const planeY = -flatX * Math.sin(turn) + flatY * Math.cos(turn)
      const nudge = motion.pointer.active ? clamp(px / halfWidth, -1, 1) : 0
      const reach = (0.6 + 2.2 * cfg.spotlight) * Math.max(box.tileWidth, box.tileHeight)
      const settle = 1 - Math.exp(-dt / 0.22)

      rowEls.forEach((row, r) => {
        const drift = cfg.direction === 'left' ? -1 : cfg.direction === 'right' ? 1 : r % 2 ? 1 : -1
        if (motion.offsets[r] === undefined) {
          motion.offsets[r] = r * box.step * 0.37
          motion.shifts[r] = 0
        }
        if (!reduce) motion.offsets[r]! += cfg.speed * drift * PACE[r % PACE.length]! * dt
        const target = reduce ? 0 : cfg.parallax * box.tileWidth * 1.2 * nudge * (r % 2 ? -1 : 1)
        motion.shifts[r]! += (target - motion.shifts[r]!) * (1 - Math.exp(-dt / INERTIA[r % INERTIA.length]!))
        const x = -box.period + wrap(motion.offsets[r]! + motion.shifts[r]!, box.period)
        row.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`

        const rowY = box.top + r * (box.tileHeight + cfg.gap) + box.tileHeight / 2 - box.planeHeight / 2
        const left = x - box.planeWidth / 2 + box.tileWidth / 2
        const list = tileEls[r]!
        const values = spots[r]!
        const marks = written[r]!
        for (let k = 0; k < list.length; k++) {
          let wanted = 0
          if (inside && cfg.spotlight > 0) {
            const distance = Math.hypot(left + k * box.step - planeX, rowY - planeY) / reach
            wanted = 1 - smoothstep(0.25, 1, distance)
          }
          values[k]! += (wanted - values[k]!) * settle
          if (Math.abs(values[k]! - marks[k]!) > 0.004 || (wanted === 0 && values[k]! < 0.004 && marks[k] !== 0)) {
            marks[k] = values[k]! < 0.004 ? 0 : values[k]!
            list[k]!.style.setProperty('--spot', marks[k]!.toFixed(3))
          }
        }
      })

      if (visible) raf = requestAnimationFrame(frame)
    }

    const visibility = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting)
      if (visible && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    visibility.observe(host)
    raf = requestAnimationFrame(frame)

    stopEngine = () => {
      alive = false
      cancelAnimationFrame(raf)
      visibility.disconnect()
    }
  }

  watch([layout, tiles], startEngine, { flush: 'post' })

  onBeforeUnmount(() => {
    stopEngine?.()
    ro?.disconnect()
    roCleanup?.()
  })

  return { size, config, layout, tiles }
}
