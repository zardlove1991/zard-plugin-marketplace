<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { PeakChart } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()

const props = computed(() =>
  pick(values, [
    'value',
    'valueSuffix',
    'decimals',
    'title',
    'caption',
    'updatedText',
    'trend',
    'accent',
    'loop',
    'backdrop'
  ])
)

// 卡片宽度是固定像素，窄屏上要按预览台的实际宽度收缩，否则会被裁掉
const host = ref<HTMLElement | null>(null)
const available = ref(Number.POSITIVE_INFINITY)
let observer: ResizeObserver | null = null

function measure() {
  const el = host.value
  if (!el) return
  // clientWidth 含左右内边距，卡片要放进内容区里
  const style = getComputedStyle(el)
  available.value =
    el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 8
}

onMounted(() => {
  measure()
  if (host.value && 'ResizeObserver' in window) {
    observer = new ResizeObserver(measure)
    observer.observe(host.value)
  }
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', measure)
})

const width = computed(() => {
  const wanted = typeof values.width === 'number' ? values.width : 420
  return Math.max(220, Math.min(wanted, Math.floor(available.value)))
})
</script>

<template>
  <div ref="host" class="stage-center stage-center--tall">
    <PeakChart v-bind="props" :width="width" />
    <p class="stage-status">点右上角切换周期，曲线会 morph；hover 曲线查看读数</p>
  </div>
</template>
