<script setup lang="ts">
import { computed, markRaw, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { EFFECTS, LEVEL_TEXT, getEffect } from '../../../data/effects.mjs'
import { PROP_SCHEMAS } from '../../../data/props/index.mjs'
import { useHref } from '../../composables/useHref'
import { provideValues } from '../../composables/useValues'
import HoldButtonStage from '../../demos/HoldButtonStage.vue'
import SwipeRowStage from '../../demos/SwipeRowStage.vue'
import SpecularButtonStage from '../../demos/SpecularButtonStage.vue'
import TerminalReplayStage from '../../demos/TerminalReplayStage.vue'
import PeakChartStage from '../../demos/PeakChartStage.vue'
import SpotlightCardStage from '../../demos/SpotlightCardStage.vue'
import LiquidNavbarStage from '../../demos/LiquidNavbarStage.vue'
import GlassSurfaceStage from '../../demos/GlassSurfaceStage.vue'
import AnimatedListStage from '../../demos/AnimatedListStage.vue'
import FlipCardStage from '../../demos/FlipCardStage.vue'
import GhostCursorStage from '../../demos/GhostCursorStage.vue'
import GridMotionStage from '../../demos/GridMotionStage.vue'
import RubberSegmentStage from '../../demos/RubberSegmentStage.vue'
import TiltedCardStage from '../../demos/TiltedCardStage.vue'
import SignatureStage from '../../demos/SignatureStage.vue'
import PaperCrumpleStage from '../../demos/PaperCrumpleStage.vue'
import ReflectiveCardStage from '../../demos/ReflectiveCardStage.vue'
import PillNavStage from '../../demos/PillNavStage.vue'
import MagicBentoStage from '../../demos/MagicBentoStage.vue'
import GlassFolderStage from '../../demos/GlassFolderStage.vue'
import GlassLogoRevealStage from '../../demos/GlassLogoRevealStage.vue'
import AIPromptBoxStage from '../../demos/AIPromptBoxStage.vue'
import StepperStage from '../../demos/StepperStage.vue'
import ClickSparkStage from '../../demos/ClickSparkStage.vue'
import GooeyNavStage from '../../demos/GooeyNavStage.vue'
import DockStage from '../../demos/DockStage.vue'
import StageFrame from './StageFrame.vue'
import CustomizePanel from './CustomizePanel.vue'
import PropTable from './PropTable.vue'
import CodeTab from './CodeTab.vue'
import MeIcon from '../MeIcon.vue'

const props = defineProps<{
  /** 静态页可直接传 id；动态路由页从 params 取 */
  id?: string
}>()

const data = useData()
const { href } = useHref()

const routeId = computed(() => {
  if (props.id) return props.id
  const params = data.params.value
  const value = params && typeof params === 'object' && 'id' in params ? params.id : params
  return typeof value === 'string' ? value : ''
})

const effect = computed(() => getEffect(routeId.value) ?? EFFECTS[0])
const schema = computed(() => PROP_SCHEMAS[effect.value.id] ?? null)

/* ---------- 预览台 ---------- */

/** 能在文档页里内联渲染的 Vue 实装 */
const STAGES = {
  'hold-button': HoldButtonStage,
  'swipe-row': SwipeRowStage,
  'specular-button': SpecularButtonStage,
  'terminal-replay': TerminalReplayStage,
  'peak-chart': PeakChartStage,
  'spotlight-card': SpotlightCardStage,
  'liquid-glass-navbar': LiquidNavbarStage,
  'glass-surface': GlassSurfaceStage,
  'animated-list': AnimatedListStage,
  'flip-card': FlipCardStage,
  'ghost-cursor': GhostCursorStage,
  'grid-motion': GridMotionStage,
  'rubber-segment': RubberSegmentStage,
  'tilted-card': TiltedCardStage,
  'signature': SignatureStage,
  'paper-crumple': PaperCrumpleStage,
  'reflective-card': ReflectiveCardStage,
  'pill-nav': PillNavStage,
  'magic-bento': MagicBentoStage,
  'glass-folder-cards': GlassFolderStage,
  'glass-logo-reveal': GlassLogoRevealStage,
  'ai-prompt-box': AIPromptBoxStage,
  stepper: StepperStage,
  'click-spark': ClickSparkStage,
  'gooey-nav': GooeyNavStage,
  dock: DockStage
}

/** 会劫持全局输入或需要整屏的组件：放进只渲染它自己的独立页面，再用 iframe 加载 */
const FRAMED = {
  'scroll-video-hero': 560,
  'glassy-dashboard': 860,
  'splash-cursor': 620,
  shredder: 680
}

const stage = computed(() => {
  const found = STAGES[effect.value.id as keyof typeof STAGES]
  return found ? markRaw(found) : null
})
const mode = computed<'live' | 'framed' | 'demo'>(() => {
  if (stage.value) return 'live'
  if (effect.value.id in FRAMED) return 'framed'
  return 'demo'
})
const frameSrc = computed(() =>
  mode.value === 'framed' ? `/live/${effect.value.id}.html` : `/demos/${effect.value.demo}`
)
const frameHeight = computed(() =>
  mode.value === 'framed'
    ? FRAMED[effect.value.id as keyof typeof FRAMED]
    : effect.value.height
)

const FRAMED_HINT: Record<string, string> = {
  'scroll-video-hero': '这个组件挂载期间会锁定所在页面的滚动，所以放在 iframe 里。',
  'splash-cursor': '它铺满整个视口跟随光标，为了不遮住文档内容，放在独立页面里。',
  shredder: '它需要一个固定宽度的父容器，放在独立页面里才不会被文档侧栏挤压。',
  'glassy-dashboard': '这是一个整屏工作区，放在独立页面里才不会被文档侧栏挤压。'
}
const stageHint = computed(() => (mode.value === 'live' ? '' : (FRAMED_HINT[effect.value.id] ?? '')))

const tab = ref<'preview' | 'code'>('preview')
const narrow = ref(false)
const reloadKey = ref(0)
function reload() {
  reloadKey.value += 1
}

/* ---------- Customize ---------- */

// 预览台的初始值：清单里的 demo 值优先，否则是组件默认值
const defaults = Object.fromEntries(
  (schema.value?.props ?? [])
    .filter(prop => prop.control)
    .map(prop => [prop.name, prop.demo ?? prop.value])
)
provideValues(defaults)

/* ---------- 相关与翻页 ---------- */

const index = computed(() => EFFECTS.indexOf(effect.value))
const related = computed(() =>
  EFFECTS.filter(item => item.cat === effect.value.cat && item.id !== effect.value.id).slice(0, 4)
)
const prev = computed(() => (index.value > 0 ? EFFECTS[index.value - 1] : null))
const next = computed(() => (index.value < EFFECTS.length - 1 ? EFFECTS[index.value + 1] : null))
const demoHref = computed(() => withBase(`/demos/${effect.value.demo}`))
const level = computed(() => LEVEL_TEXT[effect.value.vue] ?? effect.value.vue)
</script>

<template>
  <section class="fx-page">
    <header class="fx-head">
      <p class="me-label">{{ effect.cat }}</p>
      <h1 class="fx-title">
        {{ effect.zh }}
        <span>{{ effect.name }}</span>
      </h1>
      <p class="fx-desc">{{ effect.desc }}</p>
      <div class="fx-badges">
        <span v-if="effect.vueReady" class="me-badge me-badge--live">Vue 实装</span>
        <span v-else class="me-badge">尚未移植成 Vue 组件</span>
        <span class="me-badge" :class="`me-badge--${effect.vue}`">移植难度 {{ level }}</span>
        <span v-for="dep in effect.deps" :key="dep" class="me-badge">{{ dep }}</span>
        <span v-if="!effect.deps.length" class="me-badge">无第三方依赖</span>
      </div>
    </header>

    <div class="fx-tabs">
      <div class="fx-seg" role="tablist" aria-label="详情页签">
        <button type="button" role="tab" :aria-selected="tab === 'preview'" @click="tab = 'preview'">预览</button>
        <button type="button" role="tab" :aria-selected="tab === 'code'" @click="tab = 'code'">代码</button>
      </div>
      <span class="fx-tabs__spacer"></span>
      <template v-if="tab === 'preview'">
        <button class="fx-tool" type="button" title="重新加载预览" @click="reload">
          <MeIcon name="refresh" :size="15" />
          重载
        </button>
        <button
          class="fx-tool"
          type="button"
          :aria-pressed="narrow"
          :title="narrow ? '恢复自适应宽度' : '按手机宽度预览'"
          @click="narrow = !narrow"
        >
          <MeIcon :name="narrow ? 'smartphone' : 'monitor'" :size="15" />
          {{ narrow ? '375' : '自适应' }}
        </button>
      </template>
      <a class="fx-tool" :href="demoHref" target="_blank" rel="noopener">
        <MeIcon name="external" :size="14" />
        打开演示
      </a>
    </div>

    <template v-if="tab === 'preview'">
      <StageFrame
        :mode="mode"
        :src="frameSrc"
        :height="frameHeight"
        :narrow="narrow"
        :reload-key="reloadKey"
        :title="`${effect.zh} ${effect.name}`"
      >
        <component :is="stage" v-if="stage" :key="reloadKey" />
      </StageFrame>
      <p v-if="stageHint" class="fx-stagehint">{{ stageHint }}iframe 里跑的仍是直接从 <code>@motion-effects/vue</code> 导入的真实组件。</p>

      <CustomizePanel v-if="schema" :schema="schema" />
      <PropTable v-if="schema" :props="schema.props" />

      <section v-if="!schema" class="fx-panel">
        <header class="fx-panel__head">
          <h2 class="fx-panel__title">关键 API</h2>
          <span class="fx-panel__meta">React 原件的入参</span>
        </header>
        <div class="fx-chips">
          <code v-for="name in effect.props" :key="name">{{ name }}</code>
        </div>
      </section>

      <section class="fx-panel fx-panel--note">
        <header class="fx-panel__head">
          <h2 class="fx-panel__title">注意</h2>
        </header>
        <p class="fx-panel__body fx-prose">{{ effect.note }}</p>
      </section>
    </template>

    <CodeTab v-else :effect="effect" :schema="schema" />

    <section v-if="related.length" class="fx-related">
      <header class="fx-panel__head fx-related__head">
        <h2 class="fx-panel__title">同类组件</h2>
        <a class="fx-related__more" :href="`${href('/effects/')}#cat=${encodeURIComponent(effect.cat)}`">
          查看全部
          <MeIcon name="arrow-right" :size="13" />
        </a>
      </header>
      <div class="fx-related__grid">
        <a v-for="item in related" :key="item.id" class="fx-chiplink" :href="href(`/effects/${item.id}`)">
          {{ item.zh }}
          <MeIcon name="arrow-right" :size="13" />
        </a>
      </div>
    </section>

    <nav v-if="prev || next" class="fx-pager" aria-label="翻页">
      <a v-if="prev" class="fx-pager__link" :href="href(`/effects/${prev.id}`)">
        <small>← 上一个</small>
        <strong>{{ prev.zh }}</strong>
      </a>
      <span v-else></span>
      <a v-if="next" class="fx-pager__link is-next" :href="href(`/effects/${next.id}`)">
        <small>下一个 →</small>
        <strong>{{ next.zh }}</strong>
      </a>
    </nav>
  </section>
</template>
