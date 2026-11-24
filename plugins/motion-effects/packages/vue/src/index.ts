export { default as HoldButton } from './components/HoldButton.vue'
export { default as SpecularButton } from './components/SpecularButton.vue'
export { default as SwipeRow } from './components/SwipeRow.vue'
export { default as ScrollLockedVideoHero } from './components/ScrollLockedVideoHero.vue'
export { default as TerminalReplay } from './components/TerminalReplay.vue'
export { default as PeakChart } from './components/PeakChart.vue'
export { default as GlassyDashboard } from './components/GlassyDashboard.vue'
export { default as SplashCursor } from './components/SplashCursor.vue'
export { default as Shredder } from './components/Shredder.vue'

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
export type { SplashCursorSettings } from './composables/useSplashCursor'
export type {
  ShredderConfig,
  ShredderItem,
  UseShredderOptions
} from './composables/useShredder'
export { PROJECT_SETUP_SCRIPT } from './composables/useTerminalReplay'
export { PEAK_CHART_SERIES, MONTH_DATA } from './composables/usePeakChart'
export type { PeakChartSeries } from './composables/usePeakChart'
export {
  periods as GLASSY_DASHBOARD_PERIODS,
  analytics as GLASSY_DASHBOARD_ANALYTICS
} from './composables/useGlassyDashboard'
export type {
  BackgroundCredit as GlassyDashboardCredit,
  Period as GlassyDashboardPeriod,
  View as GlassyDashboardView,
  WorkItem as GlassyWorkItem,
  WorkStatus as GlassyWorkStatus
} from './composables/useGlassyDashboard'
export type {
  TerminalLine,
  TerminalActive
} from './composables/useTerminalReplay'