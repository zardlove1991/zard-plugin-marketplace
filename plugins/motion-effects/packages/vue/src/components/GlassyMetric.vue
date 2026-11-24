<script setup lang="ts">
import { computed } from 'vue'
import { formatCount, type CountFormat } from '../composables/useGlassyDashboard'
import { iconFor } from './glassyIcons'

const props = defineProps<{
  title: string
  icon: string
  value: number
  format?: CountFormat
  change?: string
  detail?: string
  tone?: 'teal' | 'coral'
}>()

const display = computed(() => formatCount[props.format ?? 'number'](props.value))
const attention = computed(() => props.tone === 'coral')
const arrow = computed(() => (props.change?.startsWith('−') ? 'arrow-down-right' : 'arrow-up-right'))
</script>

<template>
  <article class="gd-metric" :data-tone="tone || undefined" data-gd-enter>
    <div class="gd-metric-head">
      <span>{{ title }}</span>
      <span class="gd-metric-icon" aria-hidden="true"><component :is="iconFor(icon)" /></span>
    </div>
    <strong class="gd-metric-value">
      <span :data-gd-count="value" :data-format="format || 'number'" aria-hidden="true">{{ display }}</span>
      <span class="gd-sr">{{ display }}</span>
    </strong>
    <div class="gd-metric-caption">
      <span v-if="change" class="gd-delta" :data-attention="attention">
        <component :is="iconFor(arrow)" />{{ change }}
      </span>
      <span>{{ detail ?? 'vs prior period' }}</span>
    </div>
  </article>
</template>
