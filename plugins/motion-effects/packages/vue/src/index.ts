export { default as HoldButton } from './components/HoldButton.vue'
export { default as SpecularButton } from './components/SpecularButton.vue'
export { default as SwipeRow } from './components/SwipeRow.vue'
export { default as ScrollLockedVideoHero } from './components/ScrollLockedVideoHero.vue'
export { default as TerminalReplay } from './components/TerminalReplay.vue'
export { default as PeakChart } from './components/PeakChart.vue'

export type {
  HoldButtonDirection,
  HoldButtonSize,
  PeakChartTrend,
  ScrollLockedVideoSignature,
  SpecularButtonSize,
  SwipeAction,
  SwipeDirection,
  TerminalStep
} from './types'
export type { HoldPhase, HoldInput } from './composables/useHoldGesture'
export type { SpecularSettings } from './composables/useSpecularLight'
export { PROJECT_SETUP_SCRIPT } from './composables/useTerminalReplay'
export { PEAK_CHART_SERIES, MONTH_DATA } from './composables/usePeakChart'
export type { PeakChartSeries } from './composables/usePeakChart'
export type {
  TerminalLine,
  TerminalActive
} from './composables/useTerminalReplay'