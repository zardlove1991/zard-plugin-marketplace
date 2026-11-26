<script setup lang="ts">
import { computed, ref } from 'vue'
import { Signature } from '@motion-effects/vue'
import type { SignatureStrokes } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const signatureRef = ref<InstanceType<typeof Signature> | null>(null)
const strokes = ref<SignatureStrokes>([])
const props = computed(() =>
  pick(values, [
    'mode', 'pen', 'theme', 'text', 'thickness', 'speed', 'autoplay', 'loop',
    'pause', 'frame', 'line', 'intro', 'aspect', 'name', 'role', 'placeholder', 'inkColor', 'surfaceColor'
  ])
)
</script>

<template>
  <div class="sig-root">
    <Signature ref="signatureRef" v-bind="props" name="Ada" role="Designer" @change="strokes = $event" />
    <p class="stage-status">play 模式逐点写出示例签名；切到 sign 模式后可手写，再用 ref 调 undo / toSVG / toDataURL</p>
  </div>
</template>

<style scoped>
.sig-root { display: grid; place-items: center; width: 100%; padding: 24px; }
</style>
