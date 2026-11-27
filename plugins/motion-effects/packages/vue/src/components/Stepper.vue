<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ArrowLeft01Icon, ArrowRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useStepper } from '../composables/useStepper'
import type { StepperStep } from '../types'

type Theme = 'dark' | 'light'

interface Props {
  /** 步骤列表：指示器上的标题 / 描述 / 图标 */
  steps?: StepperStep[]
  /** 受控步序（配合 v-model:step）；不传时组件自持 */
  step?: number
  /** 非受控时的起始步序 */
  initialStep?: number
  /** 指示器样式 */
  indicator?: 'numbers' | 'dots' | 'bars'
  /** 布局 */
  orientation?: 'horizontal' | 'vertical'
  /** 内容切换动画 */
  transition?: 'slide' | 'fade' | 'none'
  /** 只允许回退到走过的步骤 */
  linear?: boolean
  /** 禁止点击指示器跳步 */
  disableStepIndicators?: boolean
  /** 显示底部按钮 */
  showFooter?: boolean
  backButtonText?: string
  nextButtonText?: string
  completeButtonText?: string
  /** 最后一步之后展示的文案 */
  completedContent?: string
  theme?: Theme
  /** 完成态与进度条的主色 */
  accentColor?: string
  /** 显示磨砂面板 */
  frame?: boolean
  /** 面板圆角（px） */
  radius?: number
  /** 面板最大宽度 */
  width?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  steps: () => [],
  initialStep: 1,
  indicator: 'numbers',
  orientation: 'horizontal',
  transition: 'slide',
  linear: false,
  disableStepIndicators: false,
  showFooter: true,
  backButtonText: 'Back',
  nextButtonText: 'Continue',
  completeButtonText: 'Complete',
  completedContent: undefined,
  theme: 'dark',
  accentColor: undefined,
  frame: true,
  radius: 24,
  width: 440
})

const emit = defineEmits<{
  'update:step': [step: number]
  'step-change': [step: number]
  'final-step-completed': []
}>()

const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--stepper-frame': 'rgba(38, 35, 46, 0.66)',
    '--stepper-frame-edge': 'rgba(255, 255, 255, 0.08)',
    '--stepper-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--stepper-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--stepper-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--stepper-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--stepper-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--stepper-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--stepper-well': 'rgba(255, 255, 255, 0.07)',
    '--stepper-track': 'rgba(255, 255, 255, 0.1)',
    '--stepper-ink': '#f4f4f5',
    '--stepper-muted': 'rgba(244, 244, 245, 0.55)',
    '--stepper-faint': 'rgba(255, 255, 255, 0.22)',
    '--stepper-ring': 'rgba(244, 244, 245, 0.3)',
    '--stepper-solid': '#f4f4f5',
    '--stepper-solid-ink': '#18181b',
    '--stepper-hover': 'brightness(1.12)',
    '--stepper-hover-fill': 'rgba(255, 255, 255, 0.04)',
    '--stepper-solid-hover': 'brightness(0.9)',
    '--stepper-press': 'brightness(0.85)'
  },
  light: {
    '--stepper-frame': 'rgba(240, 240, 243, 0.8)',
    '--stepper-frame-edge': 'rgba(24, 24, 27, 0.07)',
    '--stepper-frame-highlight': 'rgba(255, 255, 255, 0.95)',
    '--stepper-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--stepper-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--stepper-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--stepper-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--stepper-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
    '--stepper-well': 'rgba(24, 24, 27, 0.05)',
    '--stepper-track': 'rgba(24, 24, 27, 0.08)',
    '--stepper-ink': '#27272a',
    '--stepper-muted': 'rgba(39, 39, 42, 0.55)',
    '--stepper-faint': 'rgba(24, 24, 27, 0.16)',
    '--stepper-ring': 'rgba(24, 24, 27, 0.28)',
    '--stepper-solid': '#27272a',
    '--stepper-solid-ink': '#ffffff',
    '--stepper-hover': 'brightness(0.97)',
    '--stepper-hover-fill': 'rgba(24, 24, 27, 0.035)',
    '--stepper-solid-hover': 'brightness(1.3)',
    '--stepper-press': 'brightness(0.92)'
  }
}

/** React 原件的弹簧曲线；浏览器不支持 linear() 时退回 cubic-bezier */
const SPRING =
  'linear(0, 0.0603, 0.2033, 0.3821, 0.5633, 0.7258, 0.8584, 0.9574, 1.0242, 1.0634, 1.0809, 1.0828, 1.0747, 1.0613, 1.046, 1.0313, 1.0186, 1.0085, 1.0012, 0.9965, 0.994, 0.9931, 0.9933, 0.9941, 0.9953, 0.9966, 0.9978, 0.9988, 1)'
const SETTLE = 'cubic-bezier(0.22, 1, 0.36, 1)'

function ease() {
  return typeof CSS !== 'undefined' && CSS.supports?.('transition-timing-function', 'linear(0, 1)')
    ? SPRING
    : 'cubic-bezier(0.34, 1.4, 0.64, 1)'
}

function readableOn(color: string) {
  let hex = String(color || '')
    .trim()
    .replace('#', '')
  if (hex.length === 3) hex = hex.replace(/./g, c => c + c)
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#ffffff'
  const [r, g, b] = [0, 2, 4].map(index => {
    const c = parseInt(hex.slice(index, index + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#18181b' : '#ffffff'
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

const { current, completed, view, go, reachable, statusOf, finishTransition } = useStepper({
  get total() {
    return props.steps.length
  },
  get step() {
    return props.step
  },
  get initialStep() {
    return props.initialStep
  },
  get linear() {
    return props.linear
  },
  get disableStepIndicators() {
    return props.disableStepIndicators
  },
  onChange: value => {
    emit('update:step', value)
    emit('step-change', value)
  },
  onFinal: () => emit('final-step-completed')
})

const total = computed(() => props.steps.length)
const vertical = computed(() => props.orientation === 'vertical')
const kind = computed(() => (vertical.value ? 'numbers' : props.indicator))
const labelled = computed(() => props.steps.some(item => !!item.title))
const isLast = computed(() => current.value === total.value)
const nextLabel = computed(() => (isLast.value ? props.completeButtonText : props.nextButtonText))

const compact = ref(false)
const tight = ref(false)
const rail = computed(() => vertical.value && !compact.value)

const root = useTemplateRef<HTMLElement>('root')
const track = useTemplateRef<HTMLElement>('track')
const glider = useTemplateRef<HTMLElement>('glider')
const viewport = useTemplateRef<HTMLElement>('viewport')
const pane = useTemplateRef<HTMLElement>('pane')
const leaving = useTemplateRef<HTMLElement>('leaving')

/** 逐帧状态不进响应式：直接写 DOM */
const markerEls: (HTMLElement | null)[] = []
const badgeEls: (HTMLElement | null)[] = []
const titleEls: (HTMLElement | null)[] = []
const labelWidths: number[] = []
let height = 0
let placed = false
let rootObserver: ResizeObserver | null = null
let trackObserver: ResizeObserver | null = null
let viewportObserver: ResizeObserver | null = null

function setMarker(index: number, el: unknown) {
  markerEls[index] = (el as HTMLElement | null) ?? null
}
function setBadge(index: number, el: unknown) {
  badgeEls[index] = (el as HTMLElement | null) ?? null
}
function setTitle(index: number, el: unknown) {
  titleEls[index] = (el as HTMLElement | null) ?? null
}

const rootStyle = computed(() => ({
  ...(THEMES[props.theme] ?? THEMES.dark),
  '--stepper-radius': `${Math.max(0, props.radius)}px`,
  '--stepper-spring': SPRING,
  '--stepper-width': typeof props.width === 'number' ? `${props.width}px` : props.width,
  ...(props.accentColor
    ? { '--stepper-solid': props.accentColor, '--stepper-solid-ink': readableOn(props.accentColor) }
    : {})
}))

function labelFor(item: StepperStep, index: number) {
  return item.title ? `Step ${index + 1}: ${item.title}` : `Step ${index + 1}`
}

function slotScope(index: number) {
  return {
    index,
    step: props.steps[index],
    current: index + 1 === current.value,
    status: statusOf(index + 1)
  }
}

/** 标题放不下时收起标题（只在横向布局下生效，与 React 原件一致） */
function measure() {
  const el = root.value
  if (!el) return
  const folded = vertical.value && el.clientWidth < 520
  compact.value = folded
  const trackEl = track.value
  if (!trackEl || !labelled.value || (vertical.value && !folded)) {
    tight.value = false
    return
  }
  const segments = markerEls.slice(0, total.value).filter(Boolean) as HTMLElement[]
  if (!tight.value) {
    segments.forEach((segment, index) => {
      const title = titleEls[index]
      labelWidths[index] = title && segment.contains(title) ? title.scrollWidth + 8 : 0
    })
  }
  const badges = segments.reduce(
    (sum, segment) => sum + (segment.firstElementChild?.getBoundingClientRect().width ?? 22) + 20,
    0
  )
  const labels = labelWidths.slice(0, total.value).reduce((sum, value) => sum + (value || 0), 0)
  const room = trackEl.clientWidth - 8 - 4 * Math.max(0, total.value - 1)
  tight.value = badges + labels > room + 0.5
}

/** 指示器下方的滑块跟着当前步走 */
function placeGlider(animate: boolean) {
  const gliderEl = glider.value
  if (!gliderEl) return
  const segment = markerEls[Math.min(current.value, total.value) - 1]
  if (!segment) return
  const spring = ease()
  gliderEl.style.transition = animate
    ? `transform 560ms ${spring}, width 560ms ${spring}, height 560ms ${spring}, opacity 200ms ease`
    : 'opacity 200ms ease'
  gliderEl.style.transform = `translate3d(${segment.offsetLeft}px, ${segment.offsetTop}px, 0)`
  gliderEl.style.width = `${segment.offsetWidth}px`
  gliderEl.style.height = `${segment.offsetHeight}px`
  gliderEl.style.opacity = completed.value ? '0' : '1'
}

/** 走完一步时给对勾描边 */
function drawCheck() {
  const index = current.value - 2
  if (index < 0) return
  const path = badgeEls[index]?.querySelector('path')
  if (!path || typeof path.animate !== 'function' || prefersReducedMotion()) return
  path.style.strokeDasharray = '24'
  path.animate([{ strokeDashoffset: 24 }, { strokeDashoffset: 0 }], { duration: 360, easing: SETTLE })
}

function animateView(id: number) {
  const viewportEl = viewport.value
  const paneEl = pane.value
  const leavingEl = leaving.value
  const reduced = prefersReducedMotion()
  const mode = props.transition === 'none' ? 'none' : reduced ? 'fade' : props.transition
  if (!viewportEl || typeof viewportEl.animate !== 'function' || mode === 'none') {
    finishTransition(id)
    return
  }
  if (leavingEl && paneEl && leavingEl.contains(document.activeElement)) {
    paneEl.focus({ preventScroll: true })
  }
  for (const element of [viewportEl, paneEl, leavingEl]) {
    element?.getAnimations?.().forEach(animation => animation.cancel())
  }
  const from = height
  const to = viewportEl.offsetHeight
  const spring = ease()
  if (Math.abs(from - to) > 0.5) {
    viewportEl.animate([{ height: `${from}px` }, { height: `${to}px` }], {
      duration: reduced ? 200 : 560,
      easing: reduced ? SETTLE : spring
    })
  }
  const axis = rail.value ? 'Y' : 'X'
  const shift = mode === 'slide' ? 36 : 0
  if (paneEl) {
    if (shift) {
      paneEl.animate(
        [{ transform: `translate${axis}(${view.value.direction * shift}px)` }, { transform: 'none' }],
        { duration: 560, easing: spring }
      )
    }
    paneEl.animate([{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1 }], {
      duration: 420,
      easing: 'ease-out'
    })
  }
  if (leavingEl) {
    leavingEl.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 140,
      easing: 'cubic-bezier(0.2, 0, 0.4, 1)',
      fill: 'forwards'
    })
    const exit = leavingEl.animate(
      [{ transform: 'none' }, { transform: `translate${axis}(${-view.value.direction * shift}px)` }],
      { duration: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
    )
    exit.onfinish = () => finishTransition(id)
  } else {
    finishTransition(id)
  }
}

watch(
  () => view.value.id,
  async id => {
    await nextTick()
    animateView(id)
  },
  { flush: 'post' }
)

watch(current, async () => {
  await nextTick()
  drawCheck()
})

watch([current, completed, kind, rail, tight, compact], async () => {
  await nextTick()
  placeGlider(placed)
  placed = true
})

/**
 * 滑块的位置只跟轨道尺寸有关。
 * 盯根节点会在内容高度变化时打断正在进行的滑动动画，所以分开盯。
 */
function observeTrack() {
  trackObserver?.disconnect()
  const el = track.value
  if (typeof ResizeObserver === 'undefined' || !el) return
  trackObserver = new ResizeObserver(() => placeGlider(false))
  trackObserver.observe(el)
}

watch(track, () => {
  observeTrack()
  placeGlider(false)
})

onMounted(() => {
  if (typeof ResizeObserver !== 'undefined' && root.value) {
    rootObserver = new ResizeObserver(() => measure())
    rootObserver.observe(root.value)
  }
  if (typeof ResizeObserver !== 'undefined' && viewport.value) {
    viewportObserver = new ResizeObserver(() => {
      height = viewport.value?.offsetHeight ?? 0
    })
    viewportObserver.observe(viewport.value)
  }
  observeTrack()
  measure()
  placeGlider(false)
  height = viewport.value?.offsetHeight ?? 0
})

onBeforeUnmount(() => {
  rootObserver?.disconnect()
  trackObserver?.disconnect()
  viewportObserver?.disconnect()
})
</script>

<template>
  <div
    ref="root"
    class="stepper"
    :class="{ 'is-rail': rail, 'is-framed': frame, 'is-bare': !frame }"
    :style="rootStyle"
    :data-completed="completed ? '' : undefined"
  >
    <div class="stepper__head" :class="{ 'is-rail': rail, 'is-inset': kind !== 'numbers' }">
      <div v-if="kind === 'dots'" class="stepper__dots">
        <button
          v-for="(item, index) in steps"
          :key="index"
          type="button"
          class="stepper__dot"
          :data-status="statusOf(index + 1)"
          :aria-label="labelFor(item, index)"
          :aria-current="index + 1 === current ? 'step' : undefined"
          :disabled="!reachable(index + 1)"
          @click="go(index + 1)"
        >
          <i :data-status="statusOf(index + 1)" />
        </button>
      </div>

      <div v-else-if="kind === 'bars'" class="stepper__bars">
        <button
          v-for="(item, index) in steps"
          :key="index"
          type="button"
          class="stepper__bar"
          :data-status="statusOf(index + 1)"
          :aria-label="labelFor(item, index)"
          :aria-current="index + 1 === current ? 'step' : undefined"
          :disabled="!reachable(index + 1)"
          @click="go(index + 1)"
        >
          <span class="stepper__bar-track">
            <span
              class="stepper__bar-fill"
              :data-filled="completed || index + 1 <= current ? '' : undefined"
            />
          </span>
        </button>
      </div>

      <div v-else ref="track" class="stepper__track" :class="{ 'is-rail': rail }" :data-layout="rail ? 'rail' : 'row'">
        <span ref="glider" class="stepper__glider" aria-hidden="true" />
        <button
          v-for="(item, index) in steps"
          :key="index"
          :ref="el => setMarker(index, el)"
          type="button"
          class="stepper__segment"
          :class="rail ? 'is-rail' : 'is-row'"
          :data-status="statusOf(index + 1)"
          :aria-label="labelFor(item, index)"
          :aria-current="index + 1 === current ? 'step' : undefined"
          :disabled="!reachable(index + 1)"
          @click="go(index + 1)"
        >
          <span :ref="el => setBadge(index, el)" class="stepper__badge" :data-status="statusOf(index + 1)">
            <span v-if="statusOf(index + 1) === 'complete'" class="stepper__check">
              <HugeiconsIcon :icon="Tick02Icon" :size="16" :stroke-width="2.4" />
            </span>
            <span v-else-if="item.icon" class="stepper__icon">
              <component :is="item.icon" />
            </span>
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span
            v-if="item.title && !(tight && !rail)"
            class="stepper__text"
            :class="{ 'is-rail': rail }"
          >
            <span :ref="el => setTitle(index, el)" class="stepper__title" :data-status="statusOf(index + 1)">
              {{ item.title }}
            </span>
            <span v-if="rail && item.description" class="stepper__desc">{{ item.description }}</span>
          </span>
        </button>
      </div>
    </div>

    <div class="stepper__body" :class="{ 'is-rail': rail }">
      <div ref="viewport" class="stepper__viewport" aria-live="polite">
        <div v-if="view.previous !== null" ref="leaving" class="stepper__pane is-leaving" aria-hidden="true">
          <slot v-if="view.previous > total" name="completed" />
          <slot v-else name="step" v-bind="slotScope(view.previous - 1)" />
        </div>
        <div ref="pane" class="stepper__pane" tabindex="-1">
          <slot v-if="view.step > total" name="completed">
            <p v-if="completedContent" class="stepper__content">{{ completedContent }}</p>
          </slot>
          <slot v-else name="step" v-bind="slotScope(view.step - 1)">
            <p v-if="steps[view.step - 1]?.content" class="stepper__content">
              {{ steps[view.step - 1]?.content }}
            </p>
          </slot>
        </div>
      </div>

      <div
        v-if="showFooter"
        class="stepper__footer-wrap"
        :data-hidden="completed ? '' : undefined"
        :aria-hidden="completed ? 'true' : undefined"
      >
        <div class="stepper__footer-clip">
          <div class="stepper__footer">
            <button
              type="button"
              class="stepper__btn stepper__btn--back"
              :data-hidden="current <= 1 ? '' : undefined"
              :tabindex="completed ? -1 : undefined"
              @click="go(current - 1)"
            >
              <HugeiconsIcon :icon="ArrowLeft01Icon" :size="16" :stroke-width="2" />
              <span>{{ backButtonText }}</span>
            </button>
            <button
              type="button"
              class="stepper__btn stepper__btn--next"
              :tabindex="completed ? -1 : undefined"
              @click="go(current + 1)"
            >
              <span>{{ nextLabel }}</span>
              <HugeiconsIcon :icon="isLast ? Tick02Icon : ArrowRight01Icon" :size="16" :stroke-width="2" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <span v-if="frame" class="stepper__rim" aria-hidden="true" />
  </div>
</template>

<style src="./Stepper.css"></style>
