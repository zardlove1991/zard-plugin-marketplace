<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { curve, usd, type Point } from '../composables/useGlassyDashboard'

const props = defineProps<{
  labels: string[]
  revenue: number[]
  costs: number[]
}>()

const fillId = `revenue-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const active = ref<number | null>(null)
const plotHeight = 204
const width = 600

const max = computed(() => Math.ceil((Math.max(...props.revenue, ...props.costs) * 1.14) / 2.5) * 2.5)
const points = (values: number[]): Point[] =>
  values.map((value, index) => [
    (index * width) / Math.max(1, values.length - 1),
    plotHeight - (value / max.value) * plotHeight
  ])
const revenuePoints = computed(() => points(props.revenue))
const costPoints = computed(() => points(props.costs))
const revenueLine = computed(() => curve(revenuePoints.value))
const last = computed(() => ((revenuePoints.value.length - 1) * width) / Math.max(1, revenuePoints.value.length - 1))
const ticks = computed(() => [max.value, max.value * 0.75, max.value * 0.5, max.value * 0.25, 0])
const point = computed(() => (active.value === null ? undefined : revenuePoints.value[active.value]))
const costPoint = computed(() => (active.value === null ? undefined : costPoints.value[active.value]))
const tooltipX = computed(() => `${(active.value! / (props.labels.length - 1)) * 100}%`)
const areaPath = computed(() => `${revenueLine.value} L ${last.value} ${plotHeight} H 0 Z`)

const zoneLabel = (label: string, index: number) =>
  `${label}, revenue ${usd(props.revenue[index] * 1000)}, operating costs ${usd(props.costs[index] * 1000)}`
</script>

<template>
  <figure class="gd-revenue-chart" aria-label="Revenue and operating costs by date">
    <div class="gd-revenue-main">
      <div class="gd-chart-y" aria-hidden="true">
        <span v-for="value in ticks" :key="value">{{ value === 0 ? '0' : `$${Number(value.toFixed(1))}k` }}</span>
      </div>
      <div class="gd-line-plot" @mouseleave="active = null">
        <svg :viewBox="`0 0 ${width} ${plotHeight}`" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient :id="fillId" x1="0" x2="0" y1="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0" stop-color="var(--gd-coral)" stop-opacity=".30" />
              <stop offset="1" stop-color="var(--gd-coral)" stop-opacity=".025" />
            </linearGradient>
          </defs>
          <line
            v-for="(tick, index) in ticks"
            :key="tick"
            class="gd-grid-line"
            x1="0"
            :x2="width"
            :y1="(plotHeight * index) / 4"
            :y2="(plotHeight * index) / 4"
          />
          <g class="gd-line-reveal">
            <path :d="areaPath" :fill="`url(#${fillId})`" />
            <path class="gd-chart-path" data-tone="coral" :d="revenueLine" />
            <path class="gd-chart-path" data-tone="ink" :d="curve(costPoints)" />
          </g>
          <g v-if="point && costPoint">
            <line class="gd-line-cursor" :x1="point[0]" :x2="point[0]" y1="0" :y2="plotHeight" />
            <circle :cx="point[0]" :cy="point[1]" r="4" fill="var(--gd-coral)" />
            <circle :cx="costPoint[0]" :cy="costPoint[1]" r="4" fill="var(--gd-graph-ink)" />
          </g>
        </svg>
        <div class="gd-chart-zones">
          <button
            v-for="(label, index) in labels"
            :key="label"
            type="button"
            :aria-label="zoneLabel(label, index)"
            :aria-pressed="active === index"
            @focus="active = index"
            @blur="active = null"
            @mouseenter="active = index"
            @click="active = index"
          />
        </div>
        <div
          v-if="active !== null"
          class="gd-line-tooltip"
          :style="{ '--gd-tooltip-x': tooltipX }"
        >
          <strong>{{ labels[active] }}</strong>
          <span>Revenue <b>{{ usd(revenue[active] * 1000) }}</b></span>
          <span>Costs <b>{{ usd(costs[active] * 1000) }}</b></span>
        </div>
      </div>
    </div>
    <div class="gd-chart-axis" aria-hidden="true"><span v-for="label in labels" :key="label">{{ label }}</span></div>
  </figure>
</template>
