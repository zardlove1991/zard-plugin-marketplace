/**
 * 已有 Vue 实装、并且能在文档页里内联渲染的组件的 props 清单。
 * 没有清单的组件，详情页退回到 effects.mjs 里的「关键 API」标签。
 */
import holdButton from './hold-button.mjs'
import swipeRow from './swipe-row.mjs'
import specularButton from './specular-button.mjs'
import terminalReplay from './terminal-replay.mjs'
import peakChart from './peak-chart.mjs'
import spotlightCard from './spotlight-card.mjs'
import liquidGlassNavbar from './liquid-glass-navbar.mjs'
import glassSurface from './glass-surface.mjs'
import animatedList from './animated-list.mjs'
import flipCard from './flip-card.mjs'

export const PROP_SCHEMAS = {
  'hold-button': holdButton,
  'swipe-row': swipeRow,
  'specular-button': specularButton,
  'terminal-replay': terminalReplay,
  'peak-chart': peakChart,
  'spotlight-card': spotlightCard,
  'liquid-glass-navbar': liquidGlassNavbar,
  'glass-surface': glassSurface,
  'animated-list': animatedList,
  'flip-card': flipCard
}
