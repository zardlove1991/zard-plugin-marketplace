<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useScrollLockedVideo } from '../composables/useScrollLockedVideo'
import type { ScrollLockedVideoSignature } from '../types'

const DEFAULT_VIDEO =
  'https://cdn.21st.dev/assets/mirror/21/21a77eac28eacbb7e142016eefeaa0b4a766619e51113629a3bc6df6af066c0f.mp4'

interface Props {
  videoSrc?: string
  title?: string
  scrollHint?: string
  tagline?: string
  /** 署名；传 `false` 不显示 */
  signature?: ScrollLockedVideoSignature | false
  /** 推完整段视频所需的滚动距离（px） */
  scrubDistance?: number
}

const props = withDefaults(
  defineProps<Props>(),
  {
    videoSrc: DEFAULT_VIDEO,
    title: 'THE CITY OPENS',
    scrollHint: 'SCROLL',
    tagline: 'Every door in the city is already open.',
    signature: () => ({ name: 'guglielmogiannattasio.exe', url: 'https://www.guglielmogiannattasio.it' }),
    scrubDistance: 3200
  }
)

const videoRef = useTemplateRef<HTMLVideoElement>('video')

const { ready } = useScrollLockedVideo({
  section: useTemplateRef<HTMLElement>('section'),
  video: videoRef,
  title: useTemplateRef<HTMLElement>('title'),
  hint: useTemplateRef<HTMLElement>('hint'),
  tagline: useTemplateRef<HTMLElement>('tagline'),
  progress: useTemplateRef<HTMLElement>('progress'),
  scrubDistance: () => props.scrubDistance
})
</script>

<template>
  <div ref="section" class="slvh">
    <video
      ref="video"
      class="slvh-video"
      :src="videoSrc"
      muted
      playsinline
      preload="auto"
      :style="{ opacity: ready ? 1 : 0 }"
    />
    <div class="slvh-shade" />

    <div ref="title" class="slvh-title">
      <span class="slvh-title-text">{{ title }}</span>
    </div>

    <div v-if="tagline" ref="tagline" class="slvh-tagline">
      <span class="slvh-tagline-text">{{ tagline }}</span>
    </div>

    <div ref="hint" class="slvh-hint">
      <span>{{ scrollHint }}</span>
      <svg class="slvh-hint-arrow" width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
        <path
          d="M7 1 L7 17 M2 12 L7 17 L12 12"
          stroke="currentColor"
          stroke-width="1.5"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- 底部细进度线，随视频推进填满 -->
    <div class="slvh-track">
      <div ref="progress" class="slvh-progress" />
    </div>

    <span v-if="signature" class="slvh-signature">
      by
      <a :href="signature.url" target="_blank" rel="noopener noreferrer">{{ signature.name }}</a>
    </span>
  </div>
</template>

<!-- 上游是行内样式；这里把不随进度变化的部分落成带前缀的全局规则，
     逐帧改动的 transform / opacity / filter 由 composable 直接写内联样式 -->
<style>
.slvh,
.slvh *,
.slvh *::before,
.slvh *::after {
  box-sizing: border-box;
}

.slvh {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: #05070d;
  touch-action: none;
}

.slvh-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center center;
  will-change: transform;
  transition: opacity 0.6s ease;
  touch-action: none;
  pointer-events: none;
}

.slvh-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(5, 7, 13, 0.35),
    rgba(5, 7, 13, 0) 30%,
    rgba(5, 7, 13, 0.15) 70%,
    rgba(5, 7, 13, 0.55)
  );
  pointer-events: none;
}

.slvh-title,
.slvh-tagline {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
}

.slvh-title {
  padding: 0 6%;
}

.slvh-tagline {
  padding: 0 8%;
  opacity: 0;
}

.slvh-title-text,
.slvh-tagline-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #f2f4f8;
}

.slvh-title-text {
  display: inline-block;
  font-weight: 800;
  font-size: clamp(30px, 7vw, 96px);
  line-height: 1;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  will-change: transform, filter, opacity;
}

.slvh-tagline-text {
  font-weight: 700;
  font-size: clamp(20px, 3.4vw, 40px);
  line-height: 1.2;
  letter-spacing: -0.01em;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

.slvh-hint {
  position: absolute;
  left: 50%;
  bottom: clamp(20px, 6vh, 48px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(240, 244, 248, 0.75);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: clamp(10px, 1.4vw, 12px);
  font-weight: 600;
  letter-spacing: 0.3em;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.slvh-hint-arrow {
  animation: slvh-bounce 1.6s ease-in-out infinite;
}

@keyframes slvh-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }

  50% {
    transform: translateY(5px);
    opacity: 1;
  }
}

.slvh-track {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.12);
}

.slvh-progress {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.95));
  transform: scaleX(0);
  transform-origin: left center;
}

.slvh-signature {
  position: absolute;
  right: clamp(12px, 2.5vw, 24px);
  bottom: clamp(10px, 2vw, 18px);
  z-index: 2;
  color: rgba(220, 224, 232, 0.6);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: clamp(11px, 1.4vw, 13px);
  letter-spacing: 0.01em;
}

.slvh-signature a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.slvh-signature a:hover {
  color: #f2f4f8;
}
</style>
