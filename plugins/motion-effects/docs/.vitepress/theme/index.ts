import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import EffectPreview from './components/EffectPreview.vue'
import EffectGrid from './components/EffectGrid.vue'
import GlassyDashboardLive from './components/GlassyDashboardLive.vue'
import SplashCursorLive from './components/SplashCursorLive.vue'
import ShredderLive from './components/ShredderLive.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('EffectPreview', EffectPreview)
    app.component('EffectGrid', EffectGrid)
    app.component('GlassyDashboardLive', GlassyDashboardLive)
    app.component('SplashCursorLive', SplashCursorLive)
    app.component('ShredderLive', ShredderLive)
  }
} satisfies Theme