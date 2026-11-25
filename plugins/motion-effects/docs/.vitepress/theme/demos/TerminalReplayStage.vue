<script setup lang="ts">
import { computed, ref } from 'vue'
import { TerminalReplay } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const complete = ref(0)

const props = computed(() =>
  pick(values, [
    'title',
    'prompt',
    'directory',
    'chrome',
    'frame',
    'dots',
    'theme',
    'accentColor',
    'fontSize',
    'lineHeight',
    'height',
    'radius',
    'typingSpeed',
    'variance',
    'lineDelay',
    'startDelay',
    'hold',
    'loop',
    'autoplay',
    'cursor',
    'copyable',
    'interactive'
  ])
)
</script>

<template>
  <div class="stage-center">
    <TerminalReplay v-bind="props" @complete="complete += 1" />
    <p class="stage-status">complete {{ complete }} 次 · 点击可跳过当前步骤，播完后点击重播</p>
  </div>
</template>
