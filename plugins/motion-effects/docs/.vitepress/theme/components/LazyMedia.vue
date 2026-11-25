<script setup lang="ts">
/**
 * 进视口才挂载的预览媒体：webm/mp4 循环视频 + 封面。
 * - 没进过视口：只渲染占位，不下载任何媒体
 * - 进视口：挂载 <video>，在视口内且页面可见时播放，离开视口/切后台即暂停
 * - prefers-reduced-motion：只显示封面
 * - 视频源全部加载失败：退回封面
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  webm?: string
  mp4?: string
  poster?: string
  /** 没有媒体时占位里显示的文字，例如 `<HoldButton />` */
  placeholder: string
}>()

const root = ref<HTMLElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const inView = ref(false)
const seen = ref(false)
const failed = ref(false)
const playing = ref(false)

let reduce = true
let sourceErrors = 0
let observer: IntersectionObserver | null = null

const posterSrc = computed(() => (props.poster ? withBase(props.poster) : undefined))
const hasVideo = computed(() => !failed.value && !!props.webm)

function sync() {
  const el = video.value
  if (!el) return
  const should = inView.value && !reduce && !document.hidden
  if (should) el.play().catch(() => {})
  else el.pause()
}

function onSourceError() {
  sourceErrors += 1
  if (sourceErrors >= (props.mp4 ? 2 : 1)) failed.value = true
}

watch(seen, () => queueMicrotask(sync))

onMounted(() => {
  if (!root.value) return
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  observer = new IntersectionObserver(
    entries => {
      inView.value = entries.some(entry => entry.isIntersecting)
      if (inView.value) seen.value = true
      sync()
    },
    { rootMargin: '200px' }
  )
  observer.observe(root.value)
  document.addEventListener('visibilitychange', sync)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', sync)
})
</script>

<template>
  <div ref="root" class="lazy-media">
    <template v-if="seen">
      <video
        v-if="hasVideo"
        ref="video"
        class="lazy-media__video"
        :class="{ 'is-playing': playing }"
        muted
        loop
        playsinline
        preload="metadata"
        :poster="posterSrc"
        @playing="playing = true"
        @pause="playing = false"
      >
        <source :src="withBase(webm)" type="video/webm" @error="onSourceError" />
        <source v-if="mp4" :src="withBase(mp4)" type="video/mp4" @error="onSourceError" />
      </video>
      <img
        v-else-if="posterSrc"
        class="lazy-media__poster"
        :src="posterSrc"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div v-else class="lazy-media__placeholder me-dots">
        <code>{{ placeholder }}</code>
      </div>
    </template>
    <div v-else class="lazy-media__placeholder me-dots" aria-hidden="true">
      <code>{{ placeholder }}</code>
    </div>
  </div>
</template>
