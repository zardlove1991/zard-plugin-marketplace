<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch, type CSSProperties } from 'vue'
import {
  BACKDROP_COLOR,
  BASE_ACCENT,
  CARD_W,
  MONTH_DATA,
  PEAK_CHART_SERIES,
  grainTile,
  hslOf,
  usePeakChart
} from '../composables/usePeakChart'
import type { PeakChartTrend } from '../types'

interface Props {
  /** 曲线数据，从旧到新。不传时按当前周期用内置演示数据；变化时曲线 morph。 */
  data?: number[]
  /** hover 读数的点标签，与数据点一一对应（例如日期）。 */
  labels?: string[]
  /** headline 数字：揭示时从 0 滚上来，变化时重新滚动。 */
  value?: number
  valueSuffix?: string
  decimals?: number
  title?: string
  caption?: string
  updatedText?: string
  trend?: PeakChartTrend
  periods?: string[]
  /** 非受控时的初始周期。受控请用 v-model:period。 */
  defaultPeriod?: string
  /** 辉光颜色：画布整体色相偏移到该色；默认是参考蓝。 */
  accent?: string
  /** 卡片宽度（px），高度按 540:696 比例，所有尺寸随之缩放。 */
  width?: number
  /** 每轮揭示的秒数。0 表示滚入视口时播一次，之后静息呼吸。 */
  loop?: number
  /** 绘制颗粒感深色背景并居中卡片（撑满父级）。 */
  backdrop?: boolean
  /** hover 读数的格式化；默认是四舍五入值 + valueSuffix。 */
  formatValue?: (value: number) => string
  font?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 400,
  valueSuffix: '%',
  decimals: 0,
  title: 'Conversion rate',
  caption: 'Increase vs last month',
  updatedText: 'Data updated 2h ago',
  trend: 'up',
  periods: () => ['Weekly', 'Monthly', 'Yearly'],
  defaultPeriod: 'Monthly',
  accent: BASE_ACCENT,
  width: 420,
  loop: 0,
  backdrop: false,
  font: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
})

const periodModel = defineModel<string | undefined>('period')
const innerPeriod = ref(props.defaultPeriod)
const current = computed(() => periodModel.value ?? innerPeriod.value)
// 挂载时父级是否传了 period：传了即受控（与 React 的 period === undefined 判断对应）
const uncontrolled = periodModel.value === undefined

const open = ref(false)
const grain = ref<string | null>(null)

const cardRef = useTemplateRef<HTMLElement>('card')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')
const digitsRef = useTemplateRef<HTMLElement>('digits')
const numRef = useTemplateRef<HTMLElement>('num')
const arrowRef = useTemplateRef<SVGSVGElement>('arrow')
const readRef = useTemplateRef<HTMLElement>('read')
const readValRef = useTemplateRef<HTMLElement>('readVal')
const readLabRef = useTemplateRef<HTMLElement>('readLab')
const pillRef = useTemplateRef<HTMLButtonElement>('pill')
const menuRef = useTemplateRef<HTMLElement>('menu')

const series = computed(
  () => props.data ?? PEAK_CHART_SERIES[current.value]?.data ?? MONTH_DATA
)
const pointLabels = computed(() => {
  const builtIn = PEAK_CHART_SERIES[current.value]
  return (
    props.labels ??
    (builtIn && builtIn.data.length === series.value.length ? builtIn.labels : undefined)
  )
})

const { setHover } = usePeakChart({
  card: () => cardRef.value,
  canvas: () => canvasRef.value,
  digits: () => digitsRef.value,
  num: () => numRef.value,
  arrow: () => arrowRef.value,
  read: () => readRef.value,
  readVal: () => readValRef.value,
  readLab: () => readLabRef.value,
  width: () => props.width,
  series: () => series.value,
  labels: () => pointLabels.value,
  value: () => props.value,
  suffix: () => props.valueSuffix,
  decimals: () => props.decimals,
  loop: () => props.loop,
  formatValue: () => props.formatValue
})

// 背景颗粒：挂载后生成一次；无 2d 上下文时 grainTile 返回 null，静默降级
const syncGrain = () => {
  if (props.backdrop && !grain.value) grain.value = grainTile()
}
onMounted(syncGrain)
watch(() => props.backdrop, syncGrain)

// 打开时监听外部按下与 Escape；关闭/卸载时移除
watch(open, isOpen => {
  if (!isOpen) return
  const down = (event: PointerEvent) => {
    const target = event.target as Node
    if (menuRef.value?.contains(target) || pillRef.value?.contains(target)) return
    open.value = false
  }
  const key = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      open.value = false
      pillRef.value?.focus()
    }
  }
  window.addEventListener('pointerdown', down)
  window.addEventListener('keydown', key)
  return () => {
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('keydown', key)
  }
})

function choose(period: string) {
  open.value = false
  if (period === current.value) return
  if (uncontrolled) innerPeriod.value = period
  periodModel.value = period
}

function onMove(event: PointerEvent) {
  const card = cardRef.value
  if (!card) return
  const rect = card.getBoundingClientRect()
  if (!rect.width) return
  setHover(((event.clientX - rect.left) / rect.width) * CARD_W)
}
function onLeave() {
  setHover(null)
}

function optionEnter(event: PointerEvent, period: string) {
  if (period !== current.value)
    (event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
}
function optionLeave(event: PointerEvent, period: string) {
  if (period !== current.value)
    (event.currentTarget as HTMLElement).style.background = 'transparent'
}

// 与参考蓝不同的 accent 通过色相偏移（并重新饱和）画布实现
const tint = computed(() => {
  const a = hslOf(props.accent)
  const b = hslOf(BASE_ACCENT)
  if (!a || !b) return undefined
  let d = a[0] - b[0]
  if (d > 180) d -= 360
  if (d < -180) d += 360
  const k = b[1] > 0 ? a[1] / b[1] : 1
  if (Math.abs(d) < 0.5 && Math.abs(k - 1) < 0.02) return undefined
  return `hue-rotate(${d.toFixed(1)}deg) saturate(${k.toFixed(3)})`
})

const u = computed(() => props.width / CARD_W)
const px = (n: number) => `${(n * u.value).toFixed(3)}px`
const textBase = computed<CSSProperties>(() => ({
  position: 'absolute',
  whiteSpace: 'nowrap',
  fontFamily: props.font,
  fontStretch: '110%',
  fontWeight: 300,
  margin: 0,
  lineHeight: 1
}))
const trendColor = computed(() => (props.trend === 'down' ? '#f08a8a' : '#93cfa2'))
const finalDigits = computed(() =>
  props.value.toLocaleString('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals
  })
)

const rootStyle = computed<CSSProperties>(() =>
  props.backdrop
    ? {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: BACKDROP_COLOR,
        backgroundImage: grain.value ? `url(${grain.value})` : undefined,
        backgroundSize: '160px 160px'
      }
    : { display: 'inline-block' }
)
const cardStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: `${props.width}px`,
  height: `${props.width * (696 / 540)}px`,
  borderRadius: px(56),
  flex: 'none',
  fontFamily: props.font,
  color: '#fff',
  userSelect: 'none',
  WebkitUserSelect: 'none'
}))
const hoverStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  left: 0,
  top: px(96),
  width: '100%',
  height: px(330),
  touchAction: 'pan-y',
  cursor: 'crosshair'
}))
const updatedStyle = computed<CSSProperties>(() => ({
  ...textBase.value,
  left: px(45.6),
  top: px(43.6),
  fontSize: px(18.6),
  fontStretch: '107.7%',
  fontWeight: 200,
  color: '#99a3b6'
}))
const pillStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  right: px(46),
  top: px(35),
  height: px(37),
  borderRadius: px(18.5),
  border: 0,
  padding: `0 ${px(19.8)} 0 ${px(19.4)}`,
  display: 'flex',
  alignItems: 'flex-start',
  gap: px(6.72),
  background: 'rgba(255,255,255,0.13)',
  cursor: 'pointer',
  color: '#b9cdf2',
  fontFamily: props.font,
  outlineOffset: '2px'
}))
const periodTextStyle = computed<CSSProperties>(() => ({
  ...textBase.value,
  position: 'relative',
  display: 'block',
  marginTop: px(10.6),
  fontSize: px(17.2),
  fontStretch: '115%',
  fontWeight: 200,
  color: '#acc1e7'
}))
const chevronStyle = computed<CSSProperties>(() => ({
  flex: 'none',
  marginTop: px(15.9),
  width: px(12),
  height: px(7),
  overflow: 'visible',
  transition: 'transform .2s ease',
  transform: open.value ? 'rotate(180deg)' : 'none'
}))
const menuStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  right: px(46),
  top: px(80),
  minWidth: px(150),
  padding: px(6),
  borderRadius: px(16),
  zIndex: 3,
  background: 'rgba(20,34,64,0.55)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 18px 40px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
  backdropFilter: 'blur(18px) saturate(150%)',
  WebkitBackdropFilter: 'blur(18px) saturate(150%)',
  transformOrigin: 'top right',
  transition: 'opacity .18s ease, transform .22s cubic-bezier(.2,.9,.3,1.2), visibility .22s',
  opacity: open.value ? 1 : 0,
  transform: open.value ? 'none' : `translateY(${px(-6)}) scale(0.96)`,
  visibility: open.value ? 'visible' : 'hidden'
}))
const optionStyle = (period: string): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: px(36),
  padding: `0 ${px(12)}`,
  border: 0,
  borderRadius: px(10),
  background: period === current.value ? 'rgba(255,255,255,0.09)' : 'transparent',
  cursor: 'pointer',
  color: period === current.value ? '#e6eeff' : '#aebcd6',
  fontFamily: props.font,
  fontStretch: '116%',
  fontSize: px(15.5),
  textAlign: 'left'
})
const checkStyle = computed<CSSProperties>(() => ({ width: px(12), height: px(9) }))
const readoutStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  left: 0,
  top: 0,
  opacity: 0,
  pointerEvents: 'none',
  zIndex: 2,
  display: 'flex',
  alignItems: 'baseline',
  gap: px(7),
  padding: `${px(7)} ${px(11)}`,
  borderRadius: px(11),
  background: 'rgba(18,36,72,0.55)',
  border: '1px solid rgba(160,195,255,0.18)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  whiteSpace: 'nowrap',
  fontFamily: props.font,
  fontStretch: '116%'
}))
const readValStyle = computed<CSSProperties>(() => ({
  fontSize: px(16),
  fontWeight: 600,
  color: '#fff'
}))
const readLabStyle = computed<CSSProperties>(() => ({ fontSize: px(12.5), color: '#9fb0cc' }))
const titleStyle = computed<CSSProperties>(() => ({
  ...textBase.value,
  left: 0,
  right: 0,
  textAlign: 'center',
  top: px(441.4),
  fontSize: px(20.2),
  fontStretch: '115%',
  fontWeight: 200,
  color: '#9298a5'
}))
const numStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: px(469),
  display: 'flex',
  justifyContent: 'center',
  opacity: 0
}))
const valueStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  fontFamily: props.font,
  fontWeight: 500,
  fontSize: px(89.2),
  lineHeight: 1,
  letterSpacing: px(-0.5),
  whiteSpace: 'nowrap',
  marginLeft: px(-8.5)
}))
const sizerStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  display: 'inline-block',
  fontVariantNumeric: 'tabular-nums',
  fontStretch: '106%'
}))
const digitsStyle = computed<CSSProperties>(() => ({ position: 'absolute', right: 0, top: 0 }))
const suffixStyle = computed<CSSProperties>(() => ({
  display: 'inline-block',
  fontStretch: '76%',
  marginLeft: px(1.5),
  marginRight: px(-4),
  transform: 'scaleX(0.93)',
  transformOrigin: '0 50%'
}))
const arrowStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  left: '100%',
  marginLeft: px(5.5),
  top: px(16.4),
  width: px(7),
  height: px(7),
  overflow: 'visible',
  transformOrigin: '0% 100%',
  opacity: 0,
  rotate: props.trend === 'down' ? '90deg' : undefined
}))
const captionStyle = computed<CSSProperties>(() => ({
  ...textBase.value,
  left: 0,
  right: 0,
  textAlign: 'center',
  top: px(560.9),
  fontSize: px(11.6),
  fontStretch: '108%',
  fontWeight: 250,
  color: '#9299a8'
}))
</script>

<template>
  <div class="pc-root" :style="rootStyle">
    <div ref="card" class="pc-card" data-peak-chart :style="cardStyle">
      <canvas
        ref="canvas"
        class="pc-canvas"
        aria-hidden="true"
        :style="{ position: 'absolute', left: '0px', top: '0px', pointerEvents: 'none', filter: tint }"
      />
      <!-- chart hover surface -->
      <div
        class="pc-hover"
        :style="hoverStyle"
        @pointermove="onMove"
        @pointerdown="onMove"
        @pointerleave="onLeave"
        @pointercancel="onLeave"
      />
      <p data-part="updated" :style="updatedStyle">{{ updatedText }}</p>

      <button
        ref="pill"
        type="button"
        class="pc-pill"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :style="pillStyle"
        @click="open = !open"
      >
        <span data-part="period" :style="periodTextStyle">{{ current }}</span>
        <svg viewBox="0 0 12 7" aria-hidden="true" :style="chevronStyle">
          <path
            d="M0.8 0.8 L6 6 L11.2 0.8"
            fill="none"
            stroke="#9fb7e0"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
          />
        </svg>
      </button>

      <div ref="menu" class="pc-menu" role="listbox" aria-label="Period" :style="menuStyle">
        <button
          v-for="period in periods"
          :key="period"
          type="button"
          class="pc-menu__option"
          role="option"
          :aria-selected="period === current"
          :style="optionStyle(period)"
          @click="choose(period)"
          @pointerenter="optionEnter($event, period)"
          @pointerleave="optionLeave($event, period)"
        >
          {{ period }}
          <svg v-if="period === current" viewBox="0 0 12 9" aria-hidden="true" :style="checkStyle">
            <path
              d="M1 4.6 L4.4 8 L11 1"
              fill="none"
              stroke="#9fc0ff"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </button>
      </div>

      <!-- hover readout -->
      <div ref="read" class="pc-readout" aria-hidden="true" :style="readoutStyle">
        <span ref="readVal" class="pc-readout__value" :style="readValStyle" />
        <span ref="readLab" class="pc-readout__label" :style="readLabStyle" />
      </div>

      <p data-part="title" :style="titleStyle">{{ title }}</p>
      <div ref="num" class="pc-num" :style="numStyle">
        <div data-part="value" :style="valueStyle">
          <span :style="sizerStyle">
            <span style="visibility: hidden">{{ finalDigits }}</span>
            <span ref="digits" :style="digitsStyle">{{ finalDigits }}</span>
          </span>
          <span data-part="suffix" :style="suffixStyle">{{ valueSuffix }}</span>
          <svg
            v-if="trend !== 'none'"
            ref="arrow"
            class="pc-arrow"
            viewBox="0 0 8 8"
            aria-hidden="true"
            :style="arrowStyle"
          >
            <path
              d="M0.6 7.4 L7.2 0.8 M2 0.6 L7.4 0.6 L7.4 6"
              fill="none"
              :stroke="trendColor"
              stroke-width="1.1"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
      <p data-part="caption" :style="captionStyle">{{ caption }}</p>
    </div>
  </div>
</template>

<!-- 上游是行内样式；随 width 缩放的部分留在 :style，这里只落不随 props 变化的全局规则 -->
<style>
.pc-root,
.pc-root *,
.pc-root *::before,
.pc-root *::after {
  box-sizing: border-box;
}

.pc-canvas {
  display: block;
}

.pc-pill:focus-visible,
.pc-menu__option:focus-visible {
  outline: 2px solid rgba(160, 195, 255, 0.8);
}
</style>
