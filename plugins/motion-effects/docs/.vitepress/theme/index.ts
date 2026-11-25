import type { Theme } from 'vitepress'
import { VPBadge } from 'vitepress/theme-without-fonts'
import Layout from './Layout.vue'
import BrowsePage from './components/BrowsePage.vue'
import LandingPage from './components/LandingPage.vue'
import EffectPage from './components/effect/EffectPage.vue'
import GlassyDashboardLive from './components/GlassyDashboardLive.vue'
import SplashCursorLive from './components/SplashCursorLive.vue'
import ShredderLive from './components/ShredderLive.vue'

// 默认主题的 markdown / 代码块样式（不含 Inter 字体，也不用它的外壳）
import 'vitepress/theme-without-fonts'
// 自托管字体：标题 Syne、界面 Manrope、标签与代码 IBM Plex Mono
import '@fontsource-variable/syne'
import '@fontsource-variable/manrope'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'

import './styles/tokens.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/browse.css'
import './styles/landing.css'
import './styles/effect.css'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('Badge', VPBadge)
    app.component('BrowsePage', BrowsePage)
    app.component('LandingPage', LandingPage)
    app.component('EffectPage', EffectPage)
    // 需要独占文档的实时预览页（docs/live/*.md）
    app.component('GlassyDashboardLive', GlassyDashboardLive)
    app.component('SplashCursorLive', SplashCursorLive)
    app.component('ShredderLive', ShredderLive)
  }
} satisfies Theme
