<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { GlassSurface } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()
const photo = ref<HTMLImageElement | null>(null)

const props = computed(() =>
  pick(values, [
    'width', 'height', 'borderRadius', 'borderWidth', 'blur', 'displace',
    'brightness', 'opacity', 'backgroundOpacity', 'saturation', 'distortionScale',
    'redOffset', 'greenOffset', 'blueOffset', 'xChannel', 'yChannel', 'refraction', 'renderer'
  ])
)
</script>

<template>
  <div class="gs-root">
    <div class="gs-stage">
      <!-- 折射要有"背后"：图片既是画面，也是 WebGL 路径的 backdrop 纹理来源 -->
      <img ref="photo" class="gs-backdrop" :src="withBase('/demos/assets/sunset.jpg')" alt="" />
      <GlassSurface v-bind="props" :backdrop="photo">
        <div class="gs-copy">
          <strong>折射玻璃面板</strong>
          <span>边缘弯折背后的画面，中心保持平静，色散沿边缘分出彩色。</span>
        </div>
      </GlassSurface>
    </div>
    <p class="stage-status">改尺寸或色散：置换贴图会随容器实时重算；Chromium 走 SVG 折射，其它浏览器用上面的图片走 WebGL2</p>
  </div>
</template>

<style scoped>
.gs-root {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  padding: 24px;
}

.gs-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 360px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: var(--me-r-lg);
}

.gs-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gs-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 18px;
  color: #f5f6fa;
  text-align: center;
  text-shadow: 0 1px 8px rgb(0 0 0 / 0.5);
}

.gs-copy strong {
  font-size: 17px;
  font-weight: 600;
}

.gs-copy span {
  font-size: 12.5px;
  line-height: 1.7;
  opacity: 0.85;
}
</style>
