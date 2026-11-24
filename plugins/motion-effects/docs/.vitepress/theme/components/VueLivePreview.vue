<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { HoldButton, SpecularButton, SwipeRow, TerminalReplay } from '@motion-effects/vue'
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
/>`
} as const

const snippet = computed(() => snippets[props.id as keyof typeof snippets] ?? '')
const isLive = computed(() => props.id in snippets)

// 滚动锁定 Hero 在挂载期间锁住所在页面的滚动，所以放进只渲染它自己的独立页面，再用 iframe 加载
const FRAMED_IDS = new Set(['scroll-video-hero'])
const isFramed = computed(() => FRAMED_IDS.has(props.id))
</script>

<template>
  <section v-if="isLive" class="me-live">
    <header class="me-live__head">
      <p class="me-eyebrow">VUE 3 实装</p>
      <h2>直接使用真实组件</h2>
      <p v-if="isFramed">
        这个组件挂载期间会锁定页面滚动，所以下面的预览放在 iframe 里；iframe 里跑的仍是直接从
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