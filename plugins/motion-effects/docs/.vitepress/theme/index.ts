import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import EffectPreview from './components/EffectPreview.vue'
import EffectGrid from './components/EffectGrid.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('EffectPreview', EffectPreview)
    app.component('EffectGrid', EffectGrid)
  }
} satisfies Theme