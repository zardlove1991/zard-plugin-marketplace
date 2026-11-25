<script setup lang="ts">
import { computed, ref } from 'vue'
import { HoldButton } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const hold = ref(0)
const tap = ref(0)

const props = computed(() =>
  pick(values, [
    'doneLabel',
    'backgroundColor',
    'fillColor',
    'textColor',
    'fillTextColor',
    'size',
    'radius',
    'fillDirection',
    'holdTime',
    'releaseTime',
    'pressScale',
    'wave',
    'waveAmplitude',
    'glow',
    'resetAfter',
    'disabled'
  ])
)
</script>

<template>
  <div class="stage-center">
    <HoldButton v-bind="props" @hold="hold += 1" @tap="tap += 1">Hold to delete</HoldButton>
    <p class="stage-status">hold {{ hold }} 次 · tap {{ tap }} 次</p>
  </div>
</template>
