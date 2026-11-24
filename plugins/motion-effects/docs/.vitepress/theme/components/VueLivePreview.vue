<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { HoldButton, PeakChart, SpecularButton, SwipeRow, TerminalReplay } from '@motion-effects/vue'
import type { SwipeAction } from '@motion-effects/vue'

const props = defineProps<{ id: string }>()

const holdCount = ref(0)
const tapCount = ref(0)
const clickCount = ref(0)
const completeCount = ref(0)
const lastAction = ref('')

const actions: SwipeAction[] = [
  { id: 'delete', label: 'Delete' },
  { id: 'archive', label: 'Archive', color: '#2563eb' }
]

interface Row {
  id: number
  title: string
  meta: string
}

const seedRows = (): Row[] => [
  { id: 1, title: '设计评审笔记', meta: '今天 14:00 · 3 条待办' },
  { id: 2, title: '品牌规范 v2', meta: '昨天 · 已同步到 CI 中心' },
  { id: 3, title: '发布清单确认', meta: '周五 · 12 项待核' }
]

const rows = ref<Row[]>(seedRows())

function resetRows() {
  rows.value = seedRows()
  lastAction.value = ''
}

function onCommit(action: SwipeAction, row: Row) {
  rows.value = rows.value.filter(item => item.id !== row.id)
  lastAction.value = `${action.label} · ${row.title}`
}

function onAction(action: SwipeAction, row: Row) {
  lastAction.value = `${action.label} · ${row.title}`
}

// PeakChart 第二张卡的演示数据（与 assets/demos/peak-chart.html 一致）
const PEAK_USERS: Record<string, { data: number[]; labels: string[]; value: number }> = {
  Weekly: {
    data: [8.1, 8.6, 9.4, 9.1, 10.8, 12.4, 11.9],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    value: 12.4
  },
  Monthly: {
    data: [5.2, 5.6, 5.4, 6.1, 6.9, 6.6, 7.4, 8.2, 7.9, 8.8, 9.6, 9.2, 10.4, 11.8, 12.8, 12.1],
    labels: Array.from({ length: 16 }, (_, i) => `Day ${i * 2 + 1}`),
    value: 12.8
  },
  Yearly: {
    data: [2.1, 2.4, 3.2, 3.0, 4.1, 4.8, 5.6, 6.3, 7.9, 9.4, 11.2, 12.8],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    value: 12.8
  }
}
const peakPeriod = ref('Monthly')
const peakUsers = computed(() => PEAK_USERS[peakPeriod.value])

const snippets = {
  'hold-button': `<HoldButton
  fill-color="#c8ff4d"
  fill-text-color="#10130a"
  @hold="onHold"
>
  Hold to delete
</HoldButton>`,
  'swipe-row': `<SwipeRow :actions="actions" @commit="onCommit">
  <div>Design review notes</div>
</SwipeRow>`,
  'specular-button': `<SpecularButton auto-animate @click="onClick">
  Get Started
</SpecularButton>`,
  'terminal-replay': `<TerminalReplay @complete="onComplete" />`,
  'scroll-video-hero': `<ScrollLockedVideoHero
  video-src="/hero.mp4"
  title="THE CITY OPENS"
  :scrub-distance="3200"
/>`,
  'peak-chart': `<PeakChart
  v-model:period="period"
  :data="users[period].data"
  :labels="users[period].labels"
  :value="users[period].value"
  value-suffix="k"
  :decimals="1"
  accent="#2ec99a"
  :width="300"
/>`,
  'glassy-dashboard': `<GlassyDashboard
  workspace-name="ATLAS"
  :panel-frost="12"
  initial-theme="light"
/>`,
  'splash-cursor': `<SplashCursor
  rainbow
  :size="1"
  :force="1"
  :swirl="3"
  :trail="1"
  click-splash
/>`,
  shredder: `<Shredder
  :items="files"
  :width="340"
  :height="460"
  :feed-speed="180"
  :bite="18"
  :strip-width="10"
  :curl="1"
  @shred="onShred"
  @reorder="onReorder"
>
  <template #item="{ item }">
    <div class="row">{{ item.name }}</div>
  </template>
</Shredder>`
} as const

const snippet = computed(() => snippets[props.id as keyof typeof snippets] ?? '')
const isLive = computed(() => props.id in snippets)

// 滚动锁定 Hero 在挂载期间锁住所在页面的滚动，所以放进只渲染它自己的独立页面，再用 iframe 加载
const FRAMED_IDS = new Set(['scroll-video-hero', 'glassy-dashboard', 'splash-cursor', 'shredder'])
const isFramed = computed(() => FRAMED_IDS.has(props.id))
</script>

<template>
  <section v-if="isLive" class="me-live">
    <header class="me-live__head">
      <p class="me-eyebrow">VUE 3 实装</p>
      <h2>直接使用真实组件</h2>
      <p v-if="isFramed">
        {{ id === 'scroll-video-hero'
          ? '这个组件挂载期间会锁定页面滚动，所以下面的预览放在 iframe 里；'
          : id === 'splash-cursor'
            ? '这个组件铺满整个视口跟随光标，为了不遮住文档内容，下面的预览放在独立页面里；'
            : id === 'shredder'
              ? '碎纸机需要一个固定宽度的父容器，为了不被文档侧栏挤压，下面的预览放在独立页面里；'
              : '这是一个整屏工作区，为了不被文档侧栏挤压，下面的预览放在独立页面里；' }}iframe 里跑的仍是直接从
        <code>@motion-effects/vue</code> 导入的真实组件。
      </p>
      <p v-else>
        下面的预览不是 iframe，而是从
        <code>@motion-effects/vue</code> 直接导入的组件；样式、手势与键盘行为都来自同一份 Vue 源码。
      </p>
    </header>

    <div class="me-live__stage">
      <template v-if="id === 'hold-button'">
        <HoldButton
          :hold-time="1600"
          background-color="#1b1b22"
          fill-color="#c8ff4d"
          fill-text-color="#10130a"
          @hold="holdCount += 1"
          @tap="tapCount += 1"
        >
          Hold to delete
        </HoldButton>
        <p class="me-live__status">
          hold {{ holdCount }} · tap {{ tapCount }}
        </p>
      </template>

      <template v-else-if="id === 'swipe-row'">
        <div class="me-live__rows">
          <SwipeRow
            v-for="row in rows"
            :key="row.id"
            :actions="actions"
            @commit="onCommit($event, row)"
            @action="onAction($event, row)"
          >
            <div class="me-live__row">
              <strong>{{ row.title }}</strong>
              <span>{{ row.meta }}</span>
            </div>
          </SwipeRow>
        </div>
        <p class="me-live__status">
          {{ lastAction || '向左滑动任意一行，或聚焦后用方向键 / Delete' }}
        </p>
        <button class="me-live__reset" type="button" @click="resetRows">
          重置列表
        </button>
      </template>

      <template v-else-if="id === 'specular-button'">
        <SpecularButton
          auto-animate
          size="lg"
          line-color="#c8ff4d"
          base-color="#454545"
          @click="clickCount += 1"
        >
          Get Started
        </SpecularButton>
        <p class="me-live__status">
          clicked {{ clickCount }} 次
        </p>
      </template>

      <template v-else-if="id === 'terminal-replay'">
        <TerminalReplay @complete="completeCount += 1" />
        <p class="me-live__status">
          complete {{ completeCount }} 次 · 点击可跳过当前步骤，播完后点击重播
        </p>
      </template>

      <template v-else-if="id === 'peak-chart'">
        <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: center; justify-content: center">
          <PeakChart :width="300" />
          <PeakChart
            v-model:period="peakPeriod"
            :data="peakUsers.data"
            :labels="peakUsers.labels"
            :value="peakUsers.value"
            value-suffix="k"
            :decimals="1"
            title="Active users"
            caption="New peak this period"
            updated-text="Live"
            accent="#2ec99a"
            :width="300"
            :format-value="(v: number) => `${v.toFixed(1)}k`"
          />
        </div>
        <p class="me-live__status">
          切换右侧卡片的周期，曲线会 morph；hover 曲线查看读数
        </p>
      </template>

      <template v-else-if="id === 'glassy-dashboard'">
        <iframe
          class="me-live__frame gd-live-frame"
          :src="withBase('/live/glassy-dashboard.html')"
          title="玻璃质感数据看板 Vue 实装"
          loading="lazy"
        />
        <p class="me-live__status">
          在独立页面里运行完整看板：四视图 / 周期切换 / 明暗主题 / 图表 hover / 本地 CSV 导出；数据都是浏览器内样例
        </p>
      </template>

      <template v-else-if="id === 'splash-cursor'">
        <iframe
          class="me-live__frame sc-live-frame"
          :src="withBase('/live/splash-cursor.html')"
          title="流体墨迹光标 Vue 实装"
          loading="lazy"
        />
        <p class="me-live__status">
          在 iframe 里移动鼠标留下流体墨迹，点击产生飞溅；整个效果跑在 WebGL2 上，零第三方依赖
        </p>
      </template>

      <template v-else-if="id === 'shredder'">
        <iframe
          class="me-live__frame sh-live-frame"
          :src="withBase('/live/shredder.html')"
          title="碎纸机 Vue 实装"
          loading="lazy"
        />
        <p class="me-live__status">
          在 iframe 里拖动行到滚轮口体验碎片飘落；拖到列表其它位置可重排，聚焦后按 Delete / Backspace 也能 shred
        </p>
      </template>

      <template v-else-if="id === 'scroll-video-hero'">
        <iframe
          class="me-live__frame"
          :src="withBase('/live/scroll-video-hero.html')"
          title="滚动锁定视频 Vue 实装"
          loading="lazy"
        />
        <p class="me-live__status">
          在上面滚动，视频会跟着前进或后退；iframe 外的页面不会被锁住
        </p>
      </template>
    </div>

    <pre class="me-live__code"><code>{{ snippet }}</code></pre>
  </section>
</template>