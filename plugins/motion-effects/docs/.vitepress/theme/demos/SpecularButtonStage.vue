<script setup lang="ts">
import { computed, ref } from 'vue'
import { SpecularButton } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const clicks = ref(0)

const props = computed(() =>
  pick(values, [
    'size',
    'radius',
    'tint',
    'tintOpacity',
    'blur',
    'textColor',
    'lineColor',
    'baseColor',
    'intensity',
    'idleIntensity',
    'shineSize',
    'shineFade',
    'thickness',
    'glow',
    'speed',
    'followMouse',
    'proximity',
    'autoAnimate',
    'disabled'
  ])
)
</script>

<template>
  <div class="stage-center">
    <SpecularButton v-bind="props" @click="clicks += 1">Get Started</SpecularButton>
    <p class="stage-status">clicked {{ clicks }} 次</p>
  </div>
</template>
