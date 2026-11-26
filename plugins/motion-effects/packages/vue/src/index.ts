export { default as HoldButton } from './components/HoldButton.vue'
export { default as SpecularButton } from './components/SpecularButton.vue'
export { default as SwipeRow } from './components/SwipeRow.vue'
export { default as ScrollLockedVideoHero } from './components/ScrollLockedVideoHero.vue'
export { default as TerminalReplay } from './components/TerminalReplay.vue'
export { default as PeakChart } from './components/PeakChart.vue'
export { default as GlassyDashboard } from './components/GlassyDashboard.vue'
export { default as SplashCursor } from './components/SplashCursor.vue'
export { default as Shredder } from './components/Shredder.vue'
export { default as SpotlightCard } from './components/SpotlightCard.vue'
export { default as LiquidNavbar } from './components/LiquidNavbar.vue'
export { LIQUID_NAVBAR_ITEMS, NimbusIcons } from './components/liquidNavbarIcons'
export { default as GlassSurface } from './components/GlassSurface.vue'
export { default as AnimatedList } from './components/AnimatedList.vue'
export { default as FlipCard } from './components/FlipCard.vue'
export { default as GhostCursor } from './components/GhostCursor.vue'
export { default as GridMotion } from './components/GridMotion.vue'
export { default as RubberSegment } from './components/RubberSegment.vue'
export { default as TiltedCard } from './components/TiltedCard.vue'
export { default as TiltedCardLayer } from './components/TiltedCardLayer.vue'
export { default as Signature } from './components/Signature.vue'
export { default as PaperCrumple } from './components/PaperCrumple.vue'
export { default as ReflectiveCard } from './components/ReflectiveCard.vue'
export { ANIMATED_LIST_ITEMS, ANIMATED_LIST_ICONS } from './components/animatedListIcons'

export type {
  AnimatedListAnimation,
  AnimatedListItem,
  AnimatedListEntry,
  GhostCursorSettings,
  GridMotionDirection,
  GridMotionItem,
  GridMotionSettings,
  GridMotionTile,
  RubberSegmentItem,
  RubberSegmentSize,
  SignatureMode,
  SignaturePen,
  SignaturePoint,
  SignatureStrokes,
  SignatureTheme,
  GhostCursorTheme,
  GlassBackdrop,
  GlassSurfaceChannel,
  GlassSurfaceRenderer,
  GlassSurfaceSettings,
  HoldButtonDirection,
  HoldButtonSize,
  LiquidNavbarFx,
  LiquidNavbarTone,
  LiquidNavItem,
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
export type {
  SpotlightCardSettings as SpotlightCardProps,
  UseSpotlightCardOptions
} from './composables/useSpotlightCard'
export {
  SPOTLIGHT_NOISE as SPOTLIGHT_CARD_NOISE,
  SPOTLIGHT_THEMES as SPOTLIGHT_CARD_THEMES
} from './composables/useSpotlightCard'
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