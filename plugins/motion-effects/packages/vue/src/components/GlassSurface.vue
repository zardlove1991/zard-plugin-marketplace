<script setup lang="ts">
import { h, useId, useTemplateRef, type FunctionalComponent } from 'vue'
import {
  useGlassSurface,
  type GlassFilterRefs
} from '../composables/useGlassSurface'
import type { GlassSurfaceSettings } from '../types'

/**
 * 滤镜原语（feImage / feDisplacementMap / feColorMatrix / feBlend / feGaussianBlur）
 * 不在 Vue 的 SVG 标签白名单里，写进模板会变成未解析组件、元素名大小写也错。
 * 用 h() 建，并把要动态改属性的节点按函数式 ref 登记给 composable（vue-porting §13）。
 */
const filterRefs: GlassFilterRefs = {
  feImage: null,
  red: null,
  green: null,
  blue: null,
  blur: null
}
const capture = <K extends keyof GlassFilterRefs>(key: K) => (el: unknown) => {
  filterRefs[key] = (el ?? null) as GlassFilterRefs[K]
}

const uniqueId = useId().replace(/:/g, '-')
const filterId = `glass-filter-${uniqueId}`

const GlassFilter: FunctionalComponent = () =>
  h('svg', {
    class: 'glass-surface__filter',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true'
  }, [
    h('defs', [
      h('filter', {
        id: filterId,
        'color-interpolation-filters': 'sRGB',
        x: '0%', y: '0%', width: '100%', height: '100%'
      }, [
        h('feImage', {
          ref: capture('feImage'), x: '0', y: '0', width: '100%', height: '100%',
          'preserveAspectRatio': 'none', result: 'map'
        }),
        h('feDisplacementMap', {
          ref: capture('red'), in: 'SourceGraphic', in2: 'map', id: 'redchannel', result: 'dispRed'
        }),
        h('feColorMatrix', {
          in: 'dispRed', type: 'matrix',
          values: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
          result: 'red'
        }),
        h('feDisplacementMap', {
          ref: capture('green'), in: 'SourceGraphic', in2: 'map', id: 'greenchannel', result: 'dispGreen'
        }),
        h('feColorMatrix', {
          in: 'dispGreen', type: 'matrix',
          values: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
          result: 'green'
        }),
        h('feDisplacementMap', {
          ref: capture('blue'), in: 'SourceGraphic', in2: 'map', id: 'bluechannel', result: 'dispBlue'
        }),
        h('feColorMatrix', {
          in: 'dispBlue', type: 'matrix',
          values: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
          result: 'blue'
        }),
        h('feBlend', { in: 'red', in2: 'green', mode: 'screen', result: 'rg' }),
        h('feBlend', { in: 'rg', in2: 'blue', mode: 'screen', result: 'output' }),
        h('feGaussianBlur', { ref: capture('blur'), in: 'output', stdDeviation: '0.7' })
      ])
    ])
  ])

const props = withDefaults(defineProps<GlassSurfaceSettings>(), {
  width: 200,
  height: 80,
  borderRadius: 20,
  borderWidth: 0.07,
  brightness: 50,
  opacity: 0.93,
  blur: 11,
  displace: 0,
  backgroundOpacity: 0,
  saturation: 1,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 10,
  blueOffset: 20,
  xChannel: 'R',
  yChannel: 'G',
  mixBlendMode: 'difference',
  refraction: true,
  renderer: 'auto',
  backdrop: null,
  shape: null,
  className: '',
  style: () => ({})
})

const root = useTemplateRef<HTMLElement>('root')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

const { webgl, frosted, modeClass, outline, containerStyle } = useGlassSurface({
  root,
  canvas,
  filterRefs,
  settings: props as Required<GlassSurfaceSettings>,
  filterId
})
</script>

<template>
  <div ref="root" :class="['glass-surface', modeClass, className]" :style="containerStyle">
    <GlassFilter />
    <canvas v-if="webgl" ref="canvas" class="glass-surface__canvas" aria-hidden="true" />
    <span
      v-if="webgl"
      class="glass-surface__frame"
      aria-hidden="true"
      :style="outline ? { boxShadow: 'none' } : undefined"
    />
    <span v-if="frosted" class="glass-surface__sheen" aria-hidden="true" />
    <span v-if="frosted && !outline" class="glass-surface__rim" aria-hidden="true" />
    <span
      v-if="outline"
      class="glass-surface__glow"
      aria-hidden="true"
      :style="{ WebkitMaskImage: `url(${outline.glow})`, maskImage: `url(${outline.glow})` }"
    />
    <span
      v-if="outline"
      class="glass-surface__line"
      aria-hidden="true"
      :style="{ WebkitMaskImage: `url(${outline.line})`, maskImage: `url(${outline.line})` }"
    />
    <div class="glass-surface__content"><slot /></div>
  </div>
</template>

<style src="./GlassSurface.css"></style>
