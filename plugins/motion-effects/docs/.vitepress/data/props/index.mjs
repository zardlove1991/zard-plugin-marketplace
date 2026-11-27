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
import ghostCursor from './ghost-cursor.mjs'
import gridMotion from './grid-motion.mjs'
import rubberSegment from './rubber-segment.mjs'
import tiltedCard from './tilted-card.mjs'
import signature from './signature.mjs'
import paperCrumple from './paper-crumple.mjs'
import reflectiveCard from './reflective-card.mjs'
import pillNav from './pill-nav.mjs'
import magicBento from './magic-bento.mjs'
import glassFolder from './glass-folder.mjs'
import glassLogoReveal from './glass-logo-reveal.mjs'
import aiPromptBox from './ai-prompt-box.mjs'
import stepper from './stepper.mjs'
import clickSpark from './click-spark.mjs'
import gooeyNav from './gooey-nav.mjs'

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
  'flip-card': flipCard,
  'ghost-cursor': ghostCursor,
  'grid-motion': gridMotion,
  'rubber-segment': rubberSegment,
  'tilted-card': tiltedCard,
  'signature': signature,
  'paper-crumple': paperCrumple,
  'reflective-card': reflectiveCard,
  'pill-nav': pillNav,
  'magic-bento': magicBento,
  'glass-folder-cards': glassFolder,
  'glass-logo-reveal': glassLogoReveal,
  'ai-prompt-box': aiPromptBox,
  stepper: stepper,
  'click-spark': clickSpark,
  'gooey-nav': gooeyNav
}

/**
 * 各清单里的中文名写回 prop.label：
 * 面板与属性表直接用 prop.label 显示，prop.name 仍然是真实属性名。
 */
for (const schema of Object.values(PROP_SCHEMAS)) {
  const labels = schema.labels ?? {}
  for (const prop of schema.props) {
    const label = labels[prop.name]
    if (label) prop.label = label
  }
}
