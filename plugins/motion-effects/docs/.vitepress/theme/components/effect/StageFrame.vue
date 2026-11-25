<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'

/**
 * 预览框的三种承载方式：
 * - live   直接在页面里渲染真实的 Vue 组件
 * - framed 会劫持全局输入或需要整屏的组件，放进只渲染它自己的独立页面（iframe）
 * - demo   还没有 Vue 实装的组件，加载 vanilla 演示（iframe）
 */
const props = defineProps<{
  mode: 'live' | 'framed' | 'demo'
  src?: string
  height?: number
  narrow?: boolean
  reloadKey?: number
  title?: string
}>()

const frameStyle = computed(() => (props.mode === 'live' ? {} : { height: `${props.height ?? 480}px` }))
const frameSrc = computed(() => (props.src ? withBase(props.src) : undefined))
</script>

<template>
  <div class="fx-stagewrap" :class="{ 'is-narrow': narrow }">
    <div class="fx-stage" :class="`is-${mode}`" :style="frameStyle">
      <iframe
        v-if="mode !== 'live'"
        :key="reloadKey"
        :src="frameSrc"
        :title="title"
        loading="lazy"
      ></iframe>
      <slot v-else />
    </div>
  </div>
</template>
