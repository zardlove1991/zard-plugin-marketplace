export { default as HoldButton } from './components/HoldButton.vue'
export { default as SpecularButton } from './components/SpecularButton.vue'
export { default as SwipeRow } from './components/SwipeRow.vue'
export { default as ScrollLockedVideoHero } from './components/ScrollLockedVideoHero.vue'
export { default as TerminalReplay } from './components/TerminalReplay.vue'

export type {
  HoldButtonDirection,
  HoldButtonSize,
  ScrollLockedVideoSignature,
  SpecularButtonSize,
  SwipeAction,
  SwipeDirection,
  TerminalStep
} from './types'
export type { HoldPhase, HoldInput } from './composables/useHoldGesture'
export type { SpecularSettings } from './composables/useSpecularLight'
export { PROJECT_SETUP_SCRIPT } from './composables/useTerminalReplay'
export type {
  TerminalLine,
  TerminalActive
} from './composables/useTerminalReplay'