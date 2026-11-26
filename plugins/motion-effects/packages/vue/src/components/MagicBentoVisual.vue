<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  FigmaIcon, FingerPrintIcon, GitBranchIcon, GithubIcon, Key01Icon,
  NotionIcon, SlackIcon, SparklesIcon, Tick02Icon
} from '@hugeicons/core-free-icons'
import { CHART, clamp, curve, sampleAt, vars } from '../composables/magicBentoHelpers'

type Kind = 'analytics' | 'dashboard' | 'collaboration' | 'automation' | 'integration' | 'security'

const props = defineProps<{ kind: Kind }>()

const BARS = [42, 58, 49, 71, 63, 88, 76]
const STEPS = [
  { label: 'Install', time: '8s' }, { label: 'Build', time: '12s' },
  { label: 'Test', time: '48s' }, { label: 'Deploy', time: '9s' }
]
const APPS = [
  { icon: SlackIcon, x: '17%', y: '24%' }, { icon: GithubIcon, x: '83%', y: '24%' },
  { icon: FigmaIcon, x: '17%', y: '78%' }, { icon: NotionIcon, x: '83%', y: '78%' }
]
const SETTINGS = [
  { icon: Key01Icon, label: 'SSO' }, { icon: FingerPrintIcon, label: '2FA' }
]

const chart = useTemplateRef<HTMLElement>('chart')
const plot = useTemplateRef<HTMLElement>('plot')
const line = useTemplateRef<HTMLElement>('line')
const dot = useTemplateRef<HTMLElement>('dot')
const valueEl = useTemplateRef<HTMLElement>('valueEl')
const noteEl = useTemplateRef<HTMLElement>('noteEl')
const size = ref<{ width: number; height: number } | null>(null)
const shape = computed(() =>
  size.value && size.value.width > 4 && size.value.height > 4
    ? curve(CHART, size.value.width, size.value.height)
    : null
)

onMounted(() => {
  if (props.kind !== 'analytics') return
  const element = plot.value
  if (!element) return
  const update = () => {
    const next = { width: element.clientWidth, height: element.clientHeight }
    if (!size.value || size.value.width !== next.width || size.value.height !== next.height) size.value = next
  }
  update()
  const observer = new ResizeObserver(update)
  observer.observe(element)
  cleanup = () => observer.disconnect()
})
let cleanup: (() => void) | null = null
onBeforeUnmount(() => cleanup?.())

const scrub = (event: PointerEvent) => {
  if (!shape.value || !plot.value || !chart.value || !line.value || !dot.value || !valueEl.value || !noteEl.value) return
  const rect = plot.value.getBoundingClientRect()
  const x = clamp(event.clientX - rect.left, 0, rect.width)
  const y = sampleAt(shape.value.samples, x)
  const position = (x / Math.max(1, rect.width)) * (CHART.length - 1)
  const index = Math.floor(position)
  const next = Math.min(CHART.length - 1, index + 1)
  const value = CHART[index] + (CHART[next] - CHART[index]) * (position - index)
  chart.value.dataset.scrub = ''
  line.value.style.transform = `translateX(${x.toFixed(1)}px)`
  dot.value.style.transform = `translateY(${y.toFixed(1)}px)`
  valueEl.value.textContent = `${value.toFixed(1)}k`
  noteEl.value.textContent = `Oct ${Math.round(position) + 1}`
}
const rest = () => {
  if (chart.value) delete chart.value.dataset.scrub
  if (valueEl.value) valueEl.value.textContent = `${CHART[CHART.length - 1].toFixed(1)}k`
  if (noteEl.value) noteEl.value.textContent = '+18%'
}
</script>

<template>
  <div v-if="kind === 'analytics'" ref="chart" class="magic-bento__chart" @pointermove="scrub" @pointerdown="scrub" @pointerleave="rest">
    <div class="magic-bento__figure">
      <span ref="valueEl" class="magic-bento__figure-value">{{ CHART[CHART.length - 1].toFixed(1) }}k</span>
      <span ref="noteEl" class="magic-bento__figure-note">+18%</span>
    </div>
    <div ref="plot" class="magic-bento__plot">
      <svg v-if="shape && size" :viewBox="`0 0 ${size.width} ${size.height}`" aria-hidden="true">
        <path class="magic-bento__chart-area" :d="shape.area" />
        <path class="magic-bento__chart-line" :d="shape.line" pathLength="1" />
      </svg>
      <span ref="line" class="magic-bento__scrub">
        <span ref="dot" class="magic-bento__scrub-dot" />
      </span>
    </div>
  </div>

  <div v-else-if="kind === 'dashboard'" class="magic-bento__bars">
    <div class="magic-bento__figure">
      <span class="magic-bento__figure-value">$48.2k</span>
      <span class="magic-bento__figure-note">Weekly</span>
    </div>
    <div class="magic-bento__bars-plot">
      <span
        v-for="(height, index) in BARS"
        :key="index"
        class="magic-bento__bar"
        :data-peak="height === Math.max(...BARS) ? '' : undefined"
        :style="vars({ '--h': height / 100, '--i': index })"
      />
    </div>
  </div>

  <div v-else-if="kind === 'collaboration'" class="magic-bento__collab magic-bento__well">
    <span class="magic-bento__doc-title">Launch plan</span>
    <div class="magic-bento__lines">
      <span v-for="(width, index) in ['92%', '78%', '86%', '44%']" :key="index" class="magic-bento__line" :style="vars({ '--w': width })" />
      <span class="magic-bento__line magic-bento__line--gap" :style="vars({ '--w': '88%' })" />
      <span class="magic-bento__line" :style="vars({ '--w': '70%' })">
        <span class="magic-bento__selection" :style="vars({ '--from': '18%', '--span': '58%' })">
          <span class="magic-bento__caret" />
        </span>
      </span>
      <span class="magic-bento__line" :style="vars({ '--w': '82%' })" />
    </div>
    <span class="magic-bento__cursor magic-bento__cursor--primary" :style="vars({ '--x': '58%', '--y': '52%', '--i': 0, '--path': 'magic-bento-path-a' })">
      <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
        <path d="M2.2 1.6 13.4 9.9c.5.4.3 1.2-.4 1.3l-4.6.6-2.2 4.2c-.3.6-1.2.5-1.4-.1L1.2 2.4c-.2-.6.5-1.1 1-.8Z" stroke-width="1.2" stroke-linejoin="round" />
      </svg>
      <span class="magic-bento__cursor-name">Maya</span>
    </span>
    <span class="magic-bento__cursor magic-bento__cursor--secondary" :style="vars({ '--x': '30%', '--y': '24%', '--i': 1, '--path': 'magic-bento-path-b' })">
      <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
        <path d="M2.2 1.6 13.4 9.9c.5.4.3 1.2-.4 1.3l-4.6.6-2.2 4.2c-.3.6-1.2.5-1.4-.1L1.2 2.4c-.2-.6.5-1.1 1-.8Z" stroke-width="1.2" stroke-linejoin="round" />
      </svg>
      <span class="magic-bento__cursor-name">Leo</span>
    </span>
  </div>

  <div v-else-if="kind === 'automation'" class="magic-bento__flow" :style="vars({ '--n': STEPS.length })">
    <div class="magic-bento__flow-trigger magic-bento__tile">
      <span class="magic-bento__flow-glyph"><HugeiconsIcon :icon="GitBranchIcon" :size="15" :stroke-width="1.8" /></span>
      <span class="magic-bento__flow-copy">
        <span class="magic-bento__flow-name">Push to main</span>
        <span class="magic-bento__flow-meta magic-bento__flow-hash">a1c9f3e</span>
      </span>
    </div>
    <ol class="magic-bento__steps magic-bento__well">
      <span class="magic-bento__rail" aria-hidden="true"><span class="magic-bento__rail-fill" /></span>
      <li v-for="(step, index) in STEPS" :key="step.label" class="magic-bento__step" :style="vars({ '--i': index })">
        <span class="magic-bento__status">
          <span class="magic-bento__pending" />
          <span class="magic-bento__spinner" />
          <span class="magic-bento__done"><HugeiconsIcon :icon="Tick02Icon" :size="11" :stroke-width="2.6" /></span>
        </span>
        {{ step.label }}
        <span class="magic-bento__step-time">{{ step.time }}</span>
      </li>
    </ol>
  </div>

  <div v-else-if="kind === 'integration'" class="magic-bento__hub">
    <svg class="magic-bento__hub-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line v-for="app in APPS" :key="app.x + app.y" :x1="parseFloat(app.x)" :y1="parseFloat(app.y)" x2="50" y2="51" pathLength="1" />
    </svg>
    <span v-for="(app, index) in APPS" :key="`packet-${index}`" class="magic-bento__packet" :style="vars({ '--x': app.x, '--y': app.y, '--i': index })" />
    <span v-for="(app, index) in APPS" :key="app.x + app.y" class="magic-bento__hub-node magic-bento__tile" :style="vars({ '--x': app.x, '--y': app.y, '--s': '26px', '--i': index + 1 })">
      <HugeiconsIcon :icon="app.icon" :size="14" :stroke-width="1.8" />
    </span>
    <span class="magic-bento__hub-node magic-bento__tile" :style="vars({ '--x': '50%', '--y': '51%', '--s': '34px', '--i': 0 })">
      <HugeiconsIcon :icon="SparklesIcon" :size="17" :stroke-width="1.8" />
    </span>
  </div>

  <div v-else-if="kind === 'security'" class="magic-bento__shield">
    <div v-for="(setting, index) in SETTINGS" :key="setting.label" class="magic-bento__setting magic-bento__tile">
      <HugeiconsIcon :icon="setting.icon" :size="14" :stroke-width="1.8" />
      <span class="magic-bento__setting-label">{{ setting.label }}</span>
      <span class="magic-bento__switch" :style="vars({ '--i': index })" />
    </div>
  </div>
</template>
