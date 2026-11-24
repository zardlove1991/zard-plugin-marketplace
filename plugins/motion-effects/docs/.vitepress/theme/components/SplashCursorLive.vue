<script setup lang="ts">
import { SplashCursor } from '@motion-effects/vue'
</script>

<template>
  <div class="sc-standalone">
    <SplashCursor rainbow :size="1" :force="1" :swirl="3" :trail="1" click-splash />

    <main class="sc-stage">
      <p class="sc-eyebrow">React Bits · WebGL2 Fluid · Vue 3</p>
      <h1>Move to <span>paint light</span></h1>
      <p class="sc-hint">移动鼠标留下流体墨迹，点击产生花瓣状飞溅。所有计算都在浏览器本地，不上传任何数据。</p>
    </main>
  </div>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

.sc-standalone {
  position: relative;
  min-block-size: 100svh;
  color: #e9f0ff;
  background:
    radial-gradient(900px 600px at 15% 0%, rgba(79, 140, 255, 0.18), transparent 70%),
    radial-gradient(700px 500px at 95% 90%, rgba(45, 212, 191, 0.14), transparent 70%),
    #070b16;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.sc-stage {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-block-size: 100svh;
  padding: 32px 22px;
  text-align: center;
}

.sc-eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #8ea6d4;
}

.sc-stage h1 {
  margin: 0;
  font-size: clamp(34px, 6vw, 72px);
  line-height: 1.02;
  letter-spacing: -0.055em;
  font-weight: 800;
}

.sc-stage h1 span {
  background: linear-gradient(105deg, #7aa8ff, #2dd4bf 55%, #ffd166);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sc-hint {
  margin: 0;
  max-inline-size: 520px;
  color: #a9bad8;
  font-size: 14px;
  line-height: 1.6;
}
</style>
