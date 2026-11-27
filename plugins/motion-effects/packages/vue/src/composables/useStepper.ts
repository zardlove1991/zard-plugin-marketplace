import { computed, ref, watch } from 'vue'

/** 指示器样式：数字 / 圆点 / 条形 */
export type StepperIndicator = 'numbers' | 'dots' | 'bars'

/** 布局：横向（指示器在上）在纵向（指示器在左侧竖排） */
export type StepperOrientation = 'horizontal' | 'vertical'

/** 内容切换动画：滑动 / 淡入 / 不动 */
export type StepperTransition = 'slide' | 'fade' | 'none'

/** 单个步骤的状态 */
export type StepperStatus = 'complete' | 'active' | 'upcoming'

/** 视图状态：切换时保留上一屏做退出动画 */
export interface StepperView {
  step: number
  previous: number | null
  direction: number
  id: number
}

export interface UseStepperOptions {
  /** 步骤总数 */
  total: number
  /** 受控步序；传了就由外部决定 */
  step?: number
  /** 非受控时的起始步序 */
  initialStep?: number
  /** 只允许回退到走过的步骤 */
  linear?: boolean
  /** 禁止点击指示器跳步 */
  disableStepIndicators?: boolean
  /** 步序变化 */
  onChange?: (step: number) => void
  /** 走完最后一步 */
  onFinal?: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Stepper 的状态机：当前步 / 已到达的最远步 / 切换方向与上一屏。
 *
 * 与 React 原件同语义：`step` 受控时组件不自己改状态，只发事件；
 * 非受控时内部推进 `initialStep`。
 */
export function useStepper(options: UseStepperOptions) {
  const total = computed(() => options.total)
  const controlled = computed(() => typeof options.step === 'number')
  const internal = ref(options.initialStep ?? 1)

  const current = computed(() =>
    clamp(Math.round(controlled.value ? (options.step as number) : internal.value), 1, total.value + 1)
  )
  const completed = computed(() => current.value > total.value)

  const reached = ref(current.value)
  watch(current, value => {
    if (value > reached.value) reached.value = value
  })

  const view = ref<StepperView>({ step: current.value, previous: null, direction: 1, id: 0 })
  watch(current, value => {
    if (view.value.step === value) return
    view.value = {
      step: value,
      previous: view.value.step,
      direction: value > view.value.step ? 1 : -1,
      id: view.value.id + 1
    }
  })

  function go(target: number) {
    const next = clamp(target, 1, total.value + 1)
    if (next === current.value) return
    if (!controlled.value) internal.value = next
    if (next > total.value) options.onFinal?.()
    else options.onChange?.(next)
  }

  /** 该步骤现在能不能点（受 linear / disableStepIndicators 约束） */
  function reachable(number: number) {
    if (options.disableStepIndicators) return false
    if (number === current.value) return false
    if (!options.linear) return true
    return number <= Math.min(reached.value, total.value)
  }

  function statusOf(number: number): StepperStatus {
    if (completed.value || number < current.value) return 'complete'
    if (number === current.value) return 'active'
    return 'upcoming'
  }

  /** 退出动画结束后清掉上一屏 */
  function finishTransition(id: number) {
    if (view.value.id !== id) return
    view.value = { ...view.value, previous: null }
  }

  return { current, completed, reached, view, go, reachable, statusOf, finishTransition }
}
