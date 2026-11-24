<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue'
import '@fontsource-variable/manrope'
import {
  analytics,
  automationActivity,
  deviceLabels,
  deviceTones,
  initialWork,
  number,
  periods,
  recentActivity,
  routeFromHash,
  saveCsv,
  statusStyle,
  studioPhoto,
  usd,
  views,
  workStatuses,
  type BackgroundCredit,
  type Period,
  type View,
  type WorkItem,
  type WorkStatus
} from '../composables/useGlassyDashboard'
import { useGlassyDashboardMotion } from '../composables/useGlassyDashboardMotion'
import { iconFor } from './glassyIcons'
import GlassyActivityPanel from './GlassyActivityPanel.vue'
import GlassyBadge from './GlassyBadge.vue'
import GlassyDeviceChart from './GlassyDeviceChart.vue'
import GlassyMetric from './GlassyMetric.vue'
import GlassyRevenueChart from './GlassyRevenueChart.vue'
import GlassyStackChart from './GlassyStackChart.vue'

interface Props {
  backgroundImage?: string
  backgroundCredit?: BackgroundCredit
  workspaceName?: string
  panelFrost?: number
  initialTheme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  backgroundImage: studioPhoto,
  workspaceName: 'ATLAS',
  panelFrost: 12,
  initialTheme: 'light'
})

type Modal = 'search' | 'notifications' | { itemId: string } | null
type MetricItem = {
  title: string
  icon: string
  value: number
  format?: 'number' | 'usd' | 'compact' | 'percent'
  change?: string
  detail?: string
  tone?: 'teal' | 'coral'
}

const view = ref<View>(routeFromHash())
const active = ref<View>(view.value)
const pending = ref<View>(view.value)
const period = ref<Period>('30 days')
const theme = ref<'light' | 'dark'>(props.initialTheme)
const modal = ref<Modal>(null)
const work = ref<WorkItem[]>(initialWork.map(item => ({ ...item })))
const readNotices = ref(false)
const laneFilter = ref<WorkStatus | 'All lanes'>('All lanes')
const reduced = ref(false)

const root = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const scrollArea = ref<HTMLElement | null>(null)
const dialog = ref<HTMLDialogElement | null>(null)

const searchQuery = ref('')
const motion = useGlassyDashboardMotion({ content: () => content.value, reduced: () => reduced.value })

const current = computed(() => views.find(item => item.id === view.value)!)
const stats = computed(() => analytics[period.value])
const credit = computed<BackgroundCredit | undefined>(() =>
  props.backgroundCredit ??
  (props.backgroundImage === studioPhoto ? { label: 'Photo via Unsplash', href: 'https://unsplash.com' } : undefined)
)
const rootStyle = computed<CSSProperties>(() => ({
  '--gd-panel-frost': `${Math.max(0, Math.min(36, props.panelFrost))}px`
}))

const reviewCount = computed(() => work.value.filter(item => item.status === 'Needs review').length)
const toolsCount = computed(() => new Set(work.value.map(item => item.tool)).size)
const costTotal = computed(() => Math.round(stats.value.costs.reduce((total, cost) => total + cost, 0) * 1000))
const margin = computed(() => ((stats.value.revenue - costTotal.value) / stats.value.revenue) * 100)
const isTrend = computed(() => view.value === 'trends')
const workItem = computed(() => {
  const value = modal.value
  if (typeof value !== 'object' || value === null) return undefined
  return work.value.find(item => item.id === value.itemId)
})

const metrics = computed<MetricItem[]>(() => {
  if (view.value === 'command') {
    return [
      { title: 'Automations run', icon: 'zap', value: stats.value.automation, change: '+9.6%', tone: 'teal' },
      { title: 'Subscribers', icon: 'users', value: stats.value.subscribers, change: '+124', detail: 'this month' },
      { title: 'Churn rate', icon: 'arrow-down-right', value: 4.2, format: 'percent', change: '+0.6%', tone: 'coral' },
      { title: 'Open tickets', icon: 'list-checks', value: 12, detail: '9 resolved today' }
    ]
  }
  if (view.value === 'operations') {
    return [
      { title: 'Revenue at work', icon: 'circle-dollar-sign', value: 126100, format: 'compact', detail: 'last 90 days', tone: 'teal' },
      { title: 'Active work items', icon: 'zap', value: work.value.length, detail: 'in the operations queue' },
      { title: 'Needs approval', icon: 'list-checks', value: reviewCount.value, detail: 'waiting for an owner' },
      { title: 'Connected systems', icon: 'shield-check', value: toolsCount.value, detail: 'represented in the queue' }
    ]
  }
  if (isTrend.value) {
    return [
      { title: 'Revenue', icon: 'circle-dollar-sign', value: stats.value.revenue, format: 'compact', change: stats.value.revenueChange, tone: 'teal' },
      { title: 'Operating costs', icon: 'arrow-down-right', value: costTotal.value, format: 'compact', detail: 'in this period' },
      { title: 'Net revenue', icon: 'box', value: stats.value.revenue - costTotal.value, format: 'compact', detail: 'after operating costs' },
      { title: 'Operating margin', icon: 'circle-dollar-sign', value: margin.value, format: 'percent', detail: 'of revenue' }
    ]
  }
  return [
    { title: 'Revenue', icon: 'circle-dollar-sign', value: stats.value.revenue, format: 'compact', change: stats.value.revenueChange, tone: 'teal' },
    { title: 'Orders', icon: 'shopping-bag', value: stats.value.orders, change: stats.value.orderChange },
    { title: 'Visitors', icon: 'eye', value: stats.value.visitors, change: stats.value.visitorChange },
    { title: 'Refunds', icon: 'arrow-down-right', value: stats.value.refunds, change: stats.value.refundChange }
  ]
})

const streams = computed(() => [
  { label: 'Subscriptions', value: Math.round(stats.value.revenue * 0.686) },
  { label: 'Services', value: Math.round(stats.value.revenue * 0.208) },
  { label: 'Add-ons', value: Math.round(stats.value.revenue * 0.106) }
])
const automationItems = computed(() =>
  automationActivity.map(item => ({ label: item.label, lower: item.complete, upper: item.review }))
)
const revenueByDevice = computed(() =>
  stats.value.axis.map((label, index) => {
    const sum = stats.value.collected[index] * 1000
    const lower = Math.round((sum * stats.value.desktop[index]) / 100)
    return { label, lower, upper: sum - lower }
  })
)
const lanes = computed<WorkStatus[]>(() =>
  laneFilter.value === 'All lanes' ? workStatuses : [laneFilter.value]
)
const workForLane = (lane: WorkStatus) => work.value.filter(item => item.status === lane)

const searchResults = computed(() => {
  const terms = searchQuery.value.toLowerCase().trim().split(/\s+/).filter(Boolean)
  return views.filter(item =>
    terms.every(term => `${item.label} ${item.description} ${item.prompt}`.toLowerCase().includes(term))
  )
})
const dialogTitle = computed(() =>
  modal.value === 'search' ? `Search ${props.workspaceName}`
    : modal.value === 'notifications' ? 'Notifications'
      : workItem.value?.name ?? ''
)
const dialogKey = computed(() => {
  const value = modal.value
  return typeof value === 'object' && value !== null ? value.itemId : String(value)
})

/* ---------- navigation ---------- */
function changeView(next: View) {
  if (pending.value === next) return
  pending.value = next
  active.value = next
  motion.fadeOutAndSwap(() => { view.value = next })
}

function selectView(next: View) {
  if (typeof location !== 'undefined' && location.hash !== `#${next}`) history.pushState(null, '', `#${next}`)
  changeView(next)
}

function onDockClick(event: MouseEvent, id: View) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  event.preventDefault()
  selectView(id)
}

function restoreFromHash() {
  changeView(routeFromHash())
}

/* ---------- dialogs ---------- */
function close() {
  modal.value = null
}

function onDialogClose() {
  modal.value = null
}

function onDialogBackdrop(event: MouseEvent) {
  if (event.target === event.currentTarget) (event.currentTarget as HTMLDialogElement).close()
}

function openNotifications() {
  readNotices.value = true
  modal.value = 'notifications'
}

function inspect(item: WorkItem) {
  modal.value = { itemId: item.id }
}

function openNotice(item: WorkItem) {
  close()
  selectView('operations')
  modal.value = { itemId: item.id }
}

function selectSearchResult(id: View) {
  close()
  selectView(id)
}

function markReviewed() {
  const item = workItem.value
  if (!item) return
  work.value = work.value.map(entry => (entry.id === item.id ? { ...entry, status: 'Scheduled' as WorkStatus } : entry))
  close()
}

/* ---------- CSV ---------- */
function downloadReport() {
  saveCsv(`atlas-trends-${period.value.replace(' ', '-')}.csv`, [
    ['Period ending', 'Revenue (USD)', 'Operating costs (USD)'],
    ...stats.value.axis.map((label, index) => [
      label,
      Math.round(stats.value.collected[index] * 1000),
      Math.round(stats.value.costs[index] * 1000)
    ])
  ])
}

function downloadWork() {
  saveCsv('atlas-operations.csv', [
    ['ID', 'Workflow', 'System', 'Owner', 'Status', 'Time'],
    ...work.value.map(item => [item.id, item.name, item.tool, item.owner, item.status, item.timestamp])
  ])
}

/* ---------- dock indicator (measure real DOM, no reactive per-frame state) ---------- */
let resizeObserver: ResizeObserver | null = null
function positionIndicators() {
  root.value?.querySelectorAll('.gd-dock').forEach(nav => {
    const indicator = nav.querySelector<HTMLElement>('.gd-dock-indicator')
    const currentLink = nav.querySelector<HTMLElement>('[aria-current="page"]')
    if (!indicator || !currentLink) return
    indicator.style.width = `${currentLink.offsetWidth}px`
    indicator.style.height = `${currentLink.offsetHeight}px`
    indicator.style.transform = `translate(${currentLink.offsetLeft}px, ${currentLink.offsetTop}px)`
    indicator.dataset.ready = 'true'
  })
}

/* ---------- lifecycle ---------- */
let motionQuery: MediaQueryList | null = null
const updateReduced = () => { reduced.value = motionQuery?.matches ?? false }

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateReduced()
  motionQuery.addEventListener('change', updateReduced)
  addEventListener('hashchange', restoreFromHash)
  addEventListener('popstate', restoreFromHash)

  resizeObserver = new ResizeObserver(positionIndicators)
  root.value?.querySelectorAll('.gd-dock').forEach(nav => {
    resizeObserver!.observe(nav)
    nav.querySelectorAll('a').forEach(link => resizeObserver!.observe(link))
  })
  positionIndicators()
  motion.enter()
})

onBeforeUnmount(() => {
  removeEventListener('hashchange', restoreFromHash)
  removeEventListener('popstate', restoreFromHash)
  motionQuery?.removeEventListener('change', updateReduced)
  resizeObserver?.disconnect()
  motion.dispose()
})

watch(() => props.initialTheme, value => { theme.value = value })

watch(active, () => nextTick(positionIndicators))

watch([view, period], async () => {
  await nextTick()
  scrollArea.value?.scrollTo({ top: 0 })
  if (root.value && root.value.getBoundingClientRect().top < -20) root.value.scrollIntoView({ block: 'start' })
  motion.enter()
}, { flush: 'post' })

watch(modal, async value => {
  await nextTick()
  const element = dialog.value
  if (value && element && !element.open) {
    element.showModal()
    element.querySelector('input')?.focus()
  }
})
</script>

<template>
  <div class="gd-app" :data-theme="theme" ref="root" :style="rootStyle">
    <img class="gd-background" :src="backgroundImage" alt="" aria-hidden="true" fetchpriority="high" />
    <div class="gd-surround">
      <header class="gd-top">
        <div class="gd-brand">
          <span class="gd-logo" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none"><path d="m5 22 7.4-16h3.2L23 22h-4l-5-11.4L9 22H5Z" fill="currentColor"/><path d="M10 18h8l1.4 3h-10.8l1.4-3Z" fill="currentColor"/></svg>
          </span>
          <div><strong>{{ workspaceName }}</strong><small>Workspace</small></div>
        </div>
        <button type="button" class="gd-ask" :aria-label="`Search ${workspaceName} views`" @click="modal = 'search'">
          <span class="gd-orb" aria-hidden="true" />
          <span class="gd-prompt" :key="view">{{ current.prompt }}</span>
          <component :is="iconFor('search')" class="gd-ask-search" aria-hidden="true" />
        </button>
        <div class="gd-top-actions">
          <button
            type="button"
            class="gd-icon-button"
            :title="theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
            :aria-label="theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
            @click="theme = theme === 'light' ? 'dark' : 'light'"
          >
            <component :is="iconFor(theme === 'light' ? 'moon' : 'sun')" aria-hidden="true" />
          </button>
          <button type="button" class="gd-icon-button gd-notices" aria-label="Notifications" @click="openNotifications">
            <component :is="iconFor('bell')" aria-hidden="true" />
            <i v-if="!readNotices && reviewCount > 0" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div class="gd-stage-wrap">
        <nav class="gd-dock gd-dock-side" aria-label="Workspace shortcuts">
          <span class="gd-dock-indicator" aria-hidden="true" />
          <a
            v-for="item in views"
            :key="item.id"
            :href="`#${item.id}`"
            :data-view="item.id"
            :aria-label="item.label"
            :aria-current="active === item.id ? 'page' : undefined"
            @click="onDockClick($event, item.id)"
          >
            <component :is="iconFor(item.icon)" aria-hidden="true" />
            <span class="gd-dock-text" aria-hidden="true">{{ item.label }}</span>
            <span class="gd-dock-short" aria-hidden="true">{{ item.short }}</span>
            <span class="gd-dock-tip" aria-hidden="true">{{ item.label }}</span>
          </a>
        </nav>

        <main class="gd-stage">
          <div class="gd-stage-scroll" ref="scrollArea">
            <header class="gd-view-head">
              <div><h1>{{ current.label }}</h1><p>{{ current.description }}</p></div>
              <div class="gd-view-actions">
                <div v-if="view !== 'operations'" class="gd-period" role="group" aria-label="Reporting period">
                  <button
                    v-for="item in periods"
                    :key="item"
                    type="button"
                    :aria-pressed="item === period"
                    @click="period = item"
                  >{{ item }}</button>
                </div>
                <button
                  v-if="view === 'operations' || view === 'trends'"
                  type="button"
                  class="gd-primary gd-export"
                  @click="view === 'operations' ? downloadWork() : downloadReport()"
                >
                  <component :is="iconFor('arrow-down-to-line')" aria-hidden="true" />Export CSV
                </button>
              </div>
            </header>

            <div class="gd-content" ref="content" :key="view" :data-view="view">
              <!-- Command Center -->
              <div v-if="view === 'command'" class="gd-command-grid">
                <section class="gd-panel gd-balance" data-gd-enter>
                  <header class="gd-panel-head"><div><h2>Total revenue</h2></div><span class="gd-unit">USD</span></header>
                  <div class="gd-balance-number">
                    <span :data-gd-count="stats.revenue" data-format="usd" aria-hidden="true">{{ usd(stats.revenue) }}</span>
                    <span class="gd-sr">{{ usd(stats.revenue) }}</span>
                  </div>
                  <div class="gd-balance-change">
                    <span class="gd-delta"><component :is="iconFor('arrow-up-right')" aria-hidden="true" />{{ stats.revenueChange }}</span>
                    <span>vs prior period</span>
                  </div>
                  <div class="gd-balance-actions">
                    <button type="button" class="gd-primary" @click="selectView('trends')">View trends <component :is="iconFor('arrow-up-right')" aria-hidden="true" /></button>
                    <button type="button" class="gd-secondary" @click="selectView('metrics')">View metrics <component :is="iconFor('arrow-right')" aria-hidden="true" /></button>
                  </div>
                  <div class="gd-streams" aria-label="Revenue sources">
                    <div v-for="item in streams" :key="item.label"><span>{{ item.label }}</span><strong>{{ usd(item.value) }}</strong></div>
                  </div>
                </section>

                <div class="gd-summary">
                  <GlassyMetric v-for="item in metrics" :key="item.title" v-bind="item" />
                </div>

                <section class="gd-panel gd-command-chart" data-gd-enter>
                  <header class="gd-panel-head">
                    <div><h2>Automation activity</h2><p>Completed and sent to review · last 7 days</p></div>
                  </header>
                  <GlassyStackChart
                    :items="automationItems"
                    :labels="['Complete', 'Review']"
                    :tones="['ink', 'teal']"
                    :format="number.format"
                    title="Automation runs by day"
                  />
                </section>

                <div class="gd-command-side">
                  <section class="gd-panel gd-capacity" data-gd-enter>
                    <header class="gd-panel-head"><div><h2>Automation capacity</h2></div></header>
                    <div
                      class="gd-capacity-track"
                      role="meter"
                      aria-label="Monthly automation capacity"
                      aria-valuenow="1284"
                      aria-valuemin="0"
                      aria-valuemax="2200"
                    >
                      <span class="gd-fill" :style="{ width: `${(1284 / 2200) * 100}%` }" />
                    </div>
                    <div class="gd-capacity-label"><span><strong>1,284</strong> used</span><span>2,200 monthly runs</span></div>
                  </section>
                  <section class="gd-panel gd-approvals" data-gd-enter>
                    <header class="gd-panel-head"><div><h2>Approvals</h2><p>Decisions that need an owner</p></div></header>
                    <div class="gd-approval-content">
                      <span class="gd-list-icon"><component :is="iconFor('shield-check')" aria-hidden="true" /></span>
                      <div><strong>Owner review</strong><small>Refunds and renewal campaigns</small></div>
                      <button type="button" class="gd-icon-button" aria-label="Open Premium Operations" @click="selectView('operations')">
                        <component :is="iconFor('arrow-up-right')" aria-hidden="true" />
                      </button>
                    </div>
                  </section>
                </div>

                <GlassyActivityPanel />
              </div>

              <!-- Trends / Metrics -->
              <div v-else-if="view === 'trends' || view === 'metrics'" class="gd-analytics">
                <div class="gd-metric-grid">
                  <GlassyMetric v-for="item in metrics" :key="item.title" v-bind="item" />
                </div>
                <div class="gd-analytics-grid">
                  <section class="gd-panel" data-gd-enter>
                    <header class="gd-panel-head">
                      <div>
                        <h2>{{ isTrend ? 'Revenue vs operating costs' : 'Revenue by device' }}</h2>
                        <p>{{ isTrend ? 'Compare revenue and costs across the selected period' : 'Desktop and mobile revenue across the selected period' }}</p>
                      </div>
                      <div v-if="isTrend" class="gd-legend">
                        <span><i data-tone="coral" aria-hidden="true" />Revenue</span>
                        <span><i data-tone="ink" aria-hidden="true" />Costs</span>
                      </div>
                    </header>
                    <GlassyRevenueChart
                      v-if="isTrend"
                      :labels="stats.axis"
                      :revenue="stats.collected"
                      :costs="stats.costs"
                    />
                    <GlassyStackChart
                      v-else
                      :items="revenueByDevice"
                      :labels="['Desktop', 'Mobile']"
                      :tones="['ink', 'coral']"
                      :format="usd"
                      title="Revenue by device and date"
                    />
                  </section>
                  <section class="gd-panel gd-device-panel" data-gd-enter>
                    <header class="gd-panel-head"><div><h2>Traffic by device</h2></div></header>
                    <GlassyDeviceChart :mix="stats.devices" :visitors="stats.visitors" />
                  </section>
                </div>
                <section v-if="isTrend" class="gd-panel gd-statement" data-gd-enter>
                  <header class="gd-panel-head"><div><h2>Reporting snapshot</h2></div></header>
                  <div class="gd-approval-content">
                    <span class="gd-list-icon"><component :is="iconFor('clock-3')" aria-hidden="true" /></span>
                    <div>
                      <strong>Revenue and operating costs</strong>
                      <small>{{ period }} · {{ stats.axis[0] }} to {{ stats.axis.at(-1) }}</small>
                    </div>
                    <button type="button" class="gd-icon-button" aria-label="Download revenue and expense CSV" @click="downloadReport">
                      <component :is="iconFor('download')" aria-hidden="true" />
                    </button>
                  </div>
                </section>
                <GlassyActivityPanel v-else />
              </div>

              <!-- Operations -->
              <div v-else class="gd-analytics">
                <div class="gd-metric-grid">
                  <GlassyMetric v-for="item in metrics" :key="item.title" v-bind="item" />
                </div>
                <section class="gd-panel gd-board" data-gd-enter>
                  <header class="gd-panel-head">
                    <div><h2>Active work board</h2><p>Track queued actions, approvals, and connector exceptions.</p></div>
                    <label class="gd-filter">
                      <component :is="iconFor('filter')" aria-hidden="true" />
                      <select v-model="laneFilter" aria-label="Filter operations lanes">
                        <option v-for="item in ['All lanes', ...workStatuses]" :key="item">{{ item }}</option>
                      </select>
                    </label>
                  </header>
                  <div class="gd-lanes" :data-filtered="laneFilter !== 'All lanes'">
                    <section v-for="lane in lanes" :key="lane" class="gd-lane" :aria-label="lane">
                      <header>
                        <i :data-tone="statusStyle[lane].tone" aria-hidden="true"><component :is="iconFor(statusStyle[lane].icon)" /></i>
                        <h3>{{ lane }}</h3><span>{{ workForLane(lane).length }}</span>
                      </header>
                      <button
                        v-for="item in workForLane(lane)"
                        :key="item.id"
                        class="gd-work-item"
                        type="button"
                        @click="inspect(item)"
                      >
                        <span class="gd-work-titlerow"><strong>{{ item.name }}</strong><component :is="iconFor('ellipsis')" aria-hidden="true" /></span>
                        <span class="gd-work-detail">{{ item.description }}</span>
                        <span class="gd-work-meta"><span>{{ item.tool }}</span><span>{{ item.timestamp }}</span></span>
                      </button>
                      <p v-if="workForLane(lane).length === 0" class="gd-empty">Queue clear.</p>
                    </section>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>

        <nav class="gd-dock gd-dock-bottom" aria-label="Workspace views">
          <span class="gd-dock-indicator" aria-hidden="true" />
          <a
            v-for="item in views"
            :key="item.id"
            :href="`#${item.id}`"
            :data-view="item.id"
            :aria-label="item.label"
            :aria-current="active === item.id ? 'page' : undefined"
            @click="onDockClick($event, item.id)"
          >
            <component :is="iconFor(item.icon)" aria-hidden="true" />
            <span class="gd-dock-text" aria-hidden="true">{{ item.label }}</span>
            <span class="gd-dock-short" aria-hidden="true">{{ item.short }}</span>
          </a>
        </nav>
      </div>

      <footer class="gd-footer">
        <span>Sample workspace</span>
        <a v-if="credit" :href="credit.href" target="_blank" rel="noreferrer">
          {{ credit.label }}<component :is="iconFor('arrow-up-right')" aria-hidden="true" />
        </a>
      </footer>
    </div>

    <dialog
      v-if="modal"
      :key="dialogKey"
      ref="dialog"
      class="gd-dialog"
      aria-labelledby="gd-dialog-title"
      @close="onDialogClose"
      @click.self="dialog?.close()"
    >
      <section class="gd-dialog-inner">
        <header>
          <h2 id="gd-dialog-title">{{ dialogTitle }}</h2>
          <button type="button" class="gd-icon-button" aria-label="Close dialog" @click="dialog?.close()">
            <component :is="iconFor('x')" aria-hidden="true" />
          </button>
        </header>

        <template v-if="modal === 'search'">
          <label class="gd-search gd-command-input">
            <component :is="iconFor('search')" aria-hidden="true" />
            <input v-model="searchQuery" type="search" aria-label="Find a dashboard view" placeholder="Find a view or report" />
          </label>
          <div class="gd-quick-list">
            <button v-for="item in searchResults" :key="item.id" type="button" @click="selectSearchResult(item.id)">
              <component :is="iconFor(item.icon)" aria-hidden="true" />
              <div><strong>{{ item.label }}</strong><small>{{ item.description }}</small></div>
              <component :is="iconFor('chevron-right')" aria-hidden="true" />
            </button>
            <p v-if="searchResults.length === 0" class="gd-empty" role="status">No matching views.</p>
          </div>
        </template>

        <template v-else-if="modal === 'notifications'">
          <div class="gd-quick-list">
            <button v-for="item in work.filter(entry => entry.status === 'Needs review')" :key="item.id" type="button" @click="openNotice(item)">
              <component :is="iconFor('bell')" aria-hidden="true" />
              <div><strong>{{ item.name }}</strong><small>{{ item.description }}</small></div>
              <component :is="iconFor('arrow-right')" aria-hidden="true" />
            </button>
            <p v-if="reviewCount === 0" class="gd-empty">You’re all caught up.</p>
          </div>
        </template>

        <template v-else-if="workItem">
          <GlassyBadge :status="workItem.status" />
          <p class="gd-work-dialog-description">{{ workItem.description }}</p>
          <dl class="gd-work-facts">
            <div><dt>System</dt><dd>{{ workItem.tool }}</dd></div>
            <div><dt>Owner</dt><dd>{{ workItem.owner }}</dd></div>
            <div><dt>Reference</dt><dd>{{ workItem.id }}</dd></div>
          </dl>
          <button v-if="workItem.status === 'Needs review'" type="button" class="gd-primary" @click="markReviewed">
            Mark reviewed <component :is="iconFor('command')" aria-hidden="true" />
          </button>
        </template>
      </section>
    </dialog>
  </div>
</template>

<style src="./GlassyDashboard.css"></style>
