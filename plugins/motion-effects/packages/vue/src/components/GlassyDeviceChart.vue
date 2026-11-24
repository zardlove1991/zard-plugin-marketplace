<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { deviceLabels, deviceTones, number } from '../composables/useGlassyDashboard'

const props = defineProps<{
  mix: number[]
  visitors: number
}>()

const maskId = `gd-ring-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const active = ref<number | null>(null)
const offset = (index: number) => -props.mix.slice(0, index).reduce((sum, value) => sum + value, 0)
const activeValue = computed(() =>
  active.value === null ? undefined : number.format(Math.round((props.visitors * props.mix[active.value]) / 100))
)
</script>

<template>
  <div class="gd-device" aria-label="Visitors by device">
    <div class="gd-device-ring">
      <svg viewBox="0 0 124 124" aria-hidden="true">
        <defs>
          <mask :id="maskId">
            <circle
              class="gd-donut-draw"
              cx="62"
              cy="62"
              r="47"
              fill="none"
              stroke="white"
              stroke-width="15"
              pathLength="100"
              stroke-dasharray="100 0"
              transform="rotate(-90 62 62)"
            />
          </mask>
        </defs>
        <circle cx="62" cy="62" r="47" fill="none" stroke="var(--gd-track)" stroke-width="14" />
        <g :mask="`url(#${maskId})`" transform="rotate(-90 62 62)">
          <circle
            v-for="(ratio, index) in mix"
            :key="deviceLabels[index]"
            cx="62"
            cy="62"
            r="47"
            pathLength="100"
            fill="none"
            stroke-width="14"
            :data-tone="deviceTones[index]"
            class="gd-device-segment"
            :data-muted="active !== null && index !== active"
            :stroke-dasharray="`${Math.max(0, ratio - 1.1)} 100`"
            :stroke-dashoffset="offset(index)"
          />
        </g>
      </svg>
      <div class="gd-device-total">
        <strong v-if="active === null">
          <span :data-gd-count="visitors" data-format="number" aria-hidden="true">{{ number.format(visitors) }}</span>
          <span class="gd-sr">{{ number.format(visitors) }}</span>
        </strong>
        <strong v-else>{{ activeValue }}</strong>
        <span>{{ active === null ? 'Visitors' : deviceLabels[active] }}</span>
      </div>
    </div>
    <div class="gd-device-list">
      <button
        v-for="(ratio, index) in mix"
        :key="deviceLabels[index]"
        type="button"
        :aria-pressed="active === index"
        :aria-label="`${deviceLabels[index]}, ${ratio}% of visitors`"
        @click="active = active === index ? null : index"
      >
        <span><i :data-tone="deviceTones[index]" aria-hidden="true" />{{ deviceLabels[index] }}</span>
        <span class="gd-mix-track" aria-hidden="true">
          <i class="gd-fill" :data-tone="deviceTones[index]" :style="{ width: `${ratio}%` }" />
        </span>
        <strong>{{ ratio }}%</strong>
      </button>
    </div>
  </div>
</template>
