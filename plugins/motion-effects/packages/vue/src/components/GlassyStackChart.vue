<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChartTone } from '../composables/useGlassyDashboard'

interface Stack {
  label: string
  lower: number
  upper: number
}

const props = defineProps<{
  items: Stack[]
  labels: [string, string]
  tones: [ChartTone, ChartTone]
  format: (value: number) => string
  title: string
}>()

const active = ref<number | null>(null)
const max = computed(() => Math.max(1, ...props.items.map(item => item.lower + item.upper)) * 1.11)
const selected = computed(() => (active.value === null ? undefined : props.items[active.value]))
const height = (item: Stack) => `${((item.lower + item.upper) / max.value) * 100}%`
const label = (item: Stack) =>
  `${item.label}: ${props.format(item.lower)} ${props.labels[0]}, ${props.format(item.upper)} ${props.labels[1]}`
</script>

<template>
  <figure class="gd-stack" :aria-label="title">
    <div class="gd-stack-meta">
      <div class="gd-legend">
        <span v-for="(labelText, index) in labels" :key="labelText">
          <i :data-tone="tones[index]" aria-hidden="true" />{{ labelText }}
        </span>
      </div>
      <span v-if="selected" class="gd-chart-readout">
        {{ selected.label }} · {{ format(selected.lower + selected.upper) }}
      </span>
    </div>
    <div
      class="gd-stack-plot"
      :style="{ '--gd-series-count': String(items.length) }"
      @mouseleave="active = null"
    >
      <button
        v-for="(item, index) in items"
        :key="item.label"
        type="button"
        class="gd-stack-column"
        :aria-label="label(item)"
        :aria-pressed="active === index"
        @focus="active = index"
        @blur="active = null"
        @mouseenter="active = index"
        @click="active = index"
      >
        <span class="gd-stack-track" aria-hidden="true">
          <span class="gd-stack-bar" :style="{ height: height(item) }">
            <i :data-tone="tones[1]" :style="{ flexGrow: item.upper }" />
            <i :data-tone="tones[0]" :style="{ flexGrow: item.lower }" />
          </span>
        </span>
        <span class="gd-stack-label" aria-hidden="true">{{ item.label }}</span>
      </button>
    </div>
  </figure>
</template>
