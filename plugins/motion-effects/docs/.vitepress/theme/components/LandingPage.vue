<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { withBase } from 'vitepress'
import { SplashCursor } from '@motion-effects/vue'
import EffectCard from './EffectCard.vue'
import MeIcon from './MeIcon.vue'
import { CATEGORIES, EFFECTS } from '../../data/effects.mjs'
import { CATEGORY_ICONS, REPO } from '../../data/nav.mjs'
import { useHref } from '../composables/useHref'

const { href } = useHref()

/* ---------- 首屏背景：用库里的 SplashCursor 本身 ---------- */

interface Preset {
  name: string
  label: string
  swatches: string[]
  props: {
    colors: string[]
    rainbow: boolean
    intensity: number
    swirl: number
    size: number
    glow: number
  }
}

const PRESETS: Preset[] = [
  {
    name: 'Lime',
    label: '青柠',
    swatches: ['#c8ff4d', '#8fe36b', '#f4ffb8'],
    props: { colors: ['#c8ff4d', '#8fe36b', '#f4ffb8'], rainbow: false, intensity: 1, swirl: 3, size: 1, glow: 0 }
  },
  {
    name: 'Aurora',
    label: '极光',
    swatches: ['#4f8cff', '#2dd4bf', '#ffd166'],
    props: { colors: ['#4f8cff', '#2dd4bf', '#ffd166'], rainbow: true, intensity: 1, swirl: 4, size: 1, glow: 0 }
  },
  {
    name: 'Magma',
    label: '熔岩',
    swatches: ['#ff5f2e', '#ff2d75', '#ffd166'],
    props: { colors: ['#ff5f2e', '#ff2d75', '#ffd166'], rainbow: false, intensity: 1.4, swirl: 2, size: 1.2, glow: 0.3 }
  },
  {
    name: 'Ink',
    label: '墨迹',
    swatches: ['#f2f4ec', '#8ab4ff', '#5b6475'],
    props: { colors: ['#f2f4ec', '#8ab4ff', '#5b6475'], rainbow: false, intensity: 0.8, swirl: 1.5, size: 1, glow: 0.4 }
  }
]

const presetIndex = ref(0)
const preset = computed(() => PRESETS[presetIndex.value])

const hero = shallowRef<HTMLElement | null>(null)

/** 用户不动鼠标时，沿一条平滑路径派发合成指针事件，让背景自己流动；真实指针一动就让位。
 *  拖尾本身很淡，所以每隔几秒补一次「点击飞溅」，首屏才有可见的亮点。 */
let raf = 0
let lastRealMove = 0
let lastBurst = 0
let heroInView = false
let observer: IntersectionObserver | null = null

function onRealMove() {
  lastRealMove = performance.now()
}

function tick(now: number) {
  const el = hero.value
  if (el && heroInView && now - lastRealMove > 2600) {
    const rect = el.getBoundingClientRect()
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const t = now / 1000
      const x = rect.left + rect.width * (0.5 + 0.36 * Math.sin(t * 0.9))
      const y = rect.top + rect.height * (0.5 + 0.28 * Math.sin(t * 1.4 + 1.1))
      const init: PointerEventInit = { clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse' }
      window.dispatchEvent(new PointerEvent('pointermove', init))
      if (now - lastBurst > 2400) {
        lastBurst = now
        window.dispatchEvent(new PointerEvent('pointerdown', init))
      }
    }
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  window.addEventListener('pointermove', onRealMove, { passive: true })
  lastRealMove = performance.now() - 900
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (hero.value && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      heroInView = entries.some(entry => entry.isIntersecting)
    })
    observer.observe(hero.value)
  } else {
    heroInView = true
  }
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onRealMove)
  cancelAnimationFrame(raf)
  observer?.disconnect()
})

/* ---------- 代码窗口：随预设变化的用法片段 ---------- */

type Tok = [cls: string, text: string]
const kw = (v: string): Tok => ['kw', v]
const tag = (v: string): Tok => ['tag', v]
const attr = (v: string): Tok => ['attr', v]
const str = (v: string): Tok => ['str', v]
const val = (v: string): Tok => ['val', v]
const plain = (v: string): Tok => ['', v]

// 不能在 <script setup> 里直接写闭合标签的字面量，它会把 SFC 的 script 块提前结束
const SCRIPT_CLOSE = `</${'script'}>`
const TEMPLATE_CLOSE = `</${'template'}>`

const codeLines = computed<Tok[][]>(() => {
  const p = preset.value.props
  return [
    [kw('<script'), plain(' setup'), kw('>')],
    [kw('import'), plain(' { SplashCursor } '), kw('from'), str(" '@motion-effects/vue'")],
    [kw(SCRIPT_CLOSE)],
    [],
    [kw('<template>')],
    [plain('  '), tag('<SplashCursor')],
    [plain('    '), attr('contained')],
    [plain('    '), attr(':colors'), plain('='), str(`['${p.colors.join("', '")}']`)],
    [plain('    '), attr(':rainbow'), plain('='), val(String(p.rainbow))],
    [plain('    '), attr(':intensity'), plain('='), val(p.intensity.toFixed(1))],
    [plain('    '), attr(':swirl'), plain('='), val(p.swirl.toFixed(1))],
    [plain('  '), tag('/>')],
    [kw(TEMPLATE_CLOSE)]
  ]
})

const codeText = computed(() =>
  codeLines.value.map(line => line.map(([, text]) => text).join('')).join('\n')
)
const copied = ref('')
async function copy(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => {
      if (copied.value === key) copied.value = ''
    }, 1600)
  } catch {
    /* 剪贴板不可用 */
  }
}

const installCommands = [
  '/plugin marketplace add zardlove1991/zard-plugin-marketplace',
  '/plugin install motion-effects@zard-plugin-marketplace'
]
/** 每行拆成「命令头 + 其余」，命令头高亮 */
const installLines = installCommands.map(command => {
  const at = command.indexOf(' ')
  return [command.slice(0, at), command.slice(at)]
})

/* ---------- 数据 ---------- */

const vueReadyCount = computed(() => EFFECTS.filter(effect => effect.vueReady).length)

const FEATURED = [
  'spotlight-card',
  'glassy-dashboard',
  'peak-chart',
  'shredder',
  'terminal-replay',
  'swipe-row'
]
const featured = computed(() =>
  FEATURED.map(id => EFFECTS.find(effect => effect.id === id)).filter(Boolean)
)

const STEPS = [
  {
    n: '01',
    title: '选型',
    body: '告诉 Claude 你要什么场景（首屏、列表操作、玻璃面板、氛围背景），它从 catalog 的场景速查里挑 1–2 个，不为堆特效而堆特效。'
  },
  {
    n: '02',
    title: '接入',
    body: '已实装的组件直接从 packages/vue 复制；其余的按 React → Vue 3 移植手册保真移植——常量、shader、交互细节原样保留，只换框架胶水。'
  },
  {
    n: '03',
    title: '验收',
    body: '过一遍生产验收清单：375px、reduced-motion、无 WebGL 的降级，卸载后没有残留的 rAF 与监听。没测的项如实写进交付说明。'
  }
]

const categoryLink = (cat: string) => `${href('/effects/')}#cat=${encodeURIComponent(cat)}`
const browsePath = withBase('/effects/')
</script>

<template>
  <div class="landing">
    <!-- ============ hero ============ -->
    <section ref="hero" class="hero me-dots">
      <div class="hero__fluid" aria-hidden="true">
        <ClientOnly>
          <SplashCursor contained :z-index="1" v-bind="preset.props" />
        </ClientOnly>
      </div>
      <div class="hero__shade" aria-hidden="true"></div>

      <div class="landing__inner hero__inner">
        <a class="hero__pill" :href="href('/effects/spotlight-card')">
          <span class="hero__pill-tag">New</span>
          SpotlightCard 光斑卡片
          <MeIcon name="arrow-right" :size="13" />
        </a>

        <h1 class="hero__title">
          <span class="hero__title-en">Motion Effects</span>
          <span class="hero__title-zh">为 Vue 3 打造、让人记住的交互动效</span>
        </h1>

        <p class="hero__sub">
          {{ EFFECTS.length }} 个高保真特效：玻璃拟态、3D 卡片、WebGL 流体、滚动叙事。React 源码、保真移植手册与
          {{ vueReadyCount }} 个 Vue 3 实装，装进 Claude Code 就能用。
        </p>

        <div class="hero__actions">
          <a class="me-btn me-btn--lime hero__cta" :href="href('/effects/')">
            浏览全部组件
            <MeIcon name="arrow-right" :size="15" />
          </a>
          <a class="me-btn hero__star" :href="REPO" target="_blank" rel="noopener">
            <MeIcon name="github" :size="16" />
            Star on GitHub
          </a>
        </div>

        <p class="hero__hint">
          这一屏的背景就是库里的 <code>SplashCursor</code>——动动鼠标，或者切右下角的预设。
        </p>
      </div>

      <div class="landing__inner hero__studio">
        <div class="studio studio--code">
          <div class="studio__bar">
            <span class="studio__title">Hero.vue</span>
            <button
              class="studio__copy"
              type="button"
              :aria-label="copied === 'hero' ? '已复制' : '复制代码'"
              @click="copy(codeText, 'hero')"
            >
              <MeIcon :name="copied === 'hero' ? 'check' : 'copy'" :size="14" />
            </button>
          </div>
          <div class="studio__code">
            <span v-for="(line, i) in codeLines" :key="i" class="studio__line"><span
              v-for="(tok, j) in line"
              :key="j"
              :class="tok[0] ? `tok-${tok[0]}` : undefined"
            >{{ tok[1] }}</span></span>
          </div>
        </div>

        <div class="studio studio--presets">
          <p class="studio__title">预设</p>
          <button
            v-for="(item, index) in PRESETS"
            :key="item.name"
            class="preset"
            :class="{ 'is-active': index === presetIndex }"
            type="button"
            :aria-pressed="index === presetIndex"
            @click="presetIndex = index"
          >
            <span class="preset__swatches">
              <i v-for="color in item.swatches" :key="color" :style="{ background: color }"></i>
            </span>
            <span class="preset__name">{{ item.label }}</span>
            <span class="preset__meta">swirl {{ item.props.swirl.toFixed(1) }} · size {{ item.props.size.toFixed(1) }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ============ stats ============ -->
    <section class="landing__inner stats">
      <div class="stat">
        <strong>{{ EFFECTS.length }}</strong>
        <span>特效</span>
      </div>
      <div class="stat">
        <strong>{{ vueReadyCount }}</strong>
        <span>Vue 3 实装</span>
      </div>
      <div class="stat">
        <strong>{{ CATEGORIES.length - 1 }}</strong>
        <span>场景分类</span>
      </div>
      <div class="stat">
        <strong>100+</strong>
        <span>单元测试</span>
      </div>
    </section>

    <!-- ============ in action ============ -->
    <section class="landing__inner block">
      <header class="block__head">
        <div>
          <p class="me-label">In action</p>
          <h2 class="block__title">先看动效，再读文档</h2>
        </div>
        <a class="block__more" :href="href('/effects/')">
          全部 {{ EFFECTS.length }} 个
          <MeIcon name="arrow-up-right" :size="14" />
        </a>
      </header>
      <div class="browse__grid">
        <EffectCard v-for="effect in featured" :key="effect.id" :effect="effect" />
      </div>
    </section>

    <!-- ============ categories ============ -->
    <section class="landing__inner block">
      <header class="block__head">
        <div>
          <p class="me-label">By scenario</p>
          <h2 class="block__title">按场景找，而不是按名字猜</h2>
        </div>
      </header>
      <div class="cats">
        <a
          v-for="cat in CATEGORIES.slice(1)"
          :key="cat"
          class="cat"
          :href="categoryLink(cat)"
        >
          <span class="cat__icon"><MeIcon :name="CATEGORY_ICONS[cat]" :size="17" /></span>
          <span class="cat__name">{{ cat }}</span>
          <span class="cat__count">{{ EFFECTS.filter(effect => effect.cat === cat).length }}</span>
          <span class="cat__sample">
            {{ EFFECTS.filter(effect => effect.cat === cat).slice(0, 3).map(effect => effect.name).join(' · ') }}
          </span>
        </a>
      </div>
    </section>

    <!-- ============ how it works ============ -->
    <section class="landing__inner block">
      <header class="block__head">
        <div>
          <p class="me-label">Workflow</p>
          <h2 class="block__title">给 agent 用的组件库</h2>
        </div>
        <p class="block__desc">
          不只是组件：技能里带选型目录、React → Vue 3 移植手册和生产验收清单，Claude Code 照着做，不靠记忆重画效果。
        </p>
      </header>
      <ol class="steps">
        <li v-for="step in STEPS" :key="step.n" class="step">
          <span class="step__n">{{ step.n }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.body }}</p>
        </li>
      </ol>
    </section>

    <!-- ============ install ============ -->
    <section class="landing__inner block">
      <div class="install">
        <div class="install__text">
          <p class="me-label">Install</p>
          <h2 class="install__title">两行命令，装进 Claude Code</h2>
          <p class="install__desc">
            技能、React 源码、vanilla 演示和移植手册随插件一起安装；之后在任意 Vue 3 / React 项目里说一句“给首页加个滚动锁定视频”就行。
          </p>
          <a class="me-btn me-btn--lime" :href="href('/guide/')">阅读接入指南</a>
        </div>
        <div class="studio studio--code install__code">
          <div class="studio__bar">
            <span class="studio__title">Claude Code</span>
            <button
              class="studio__copy"
              type="button"
              :aria-label="copied === 'install' ? '已复制' : '复制命令'"
              @click="copy(installCommands.join('\n'), 'install')"
            >
              <MeIcon :name="copied === 'install' ? 'check' : 'copy'" :size="14" />
            </button>
          </div>
          <div class="studio__code">
            <span v-for="[head, rest] in installLines" :key="rest" class="studio__line"><span class="tok-kw">{{ head }}</span><span>{{ rest }}</span></span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ footer ============ -->
    <footer class="landing__inner foot">
      <span>Motion Effects · Vue 3 优先，从 React 源码与 vanilla 演示出发做保真移植</span>
      <nav class="foot__nav" aria-label="页脚">
        <a :href="browsePath">组件</a>
        <a :href="href('/guide/')">指南</a>
        <a :href="REPO" target="_blank" rel="noopener">GitHub ↗</a>
      </nav>
    </footer>
  </div>
</template>
