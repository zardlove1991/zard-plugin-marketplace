<script setup lang="ts">
import { computed, h, shallowRef, useTemplateRef, watch, type FunctionalComponent } from 'vue'
import { useLiquidNavbar } from '../composables/useLiquidNavbar'
import { LIQUID_NAVBAR_ITEMS } from './liquidNavbarIcons'
import type { LiquidNavbarFx, LiquidNavItem, LiquidNavbarTone } from '../types'

/**
 * 给玻璃做折射的 SVG 滤镜（Chromium 专属，见 data-refract）。
 * 用渲染函数而不是模板：fe* 原语不在 Vue 的 SVG 标签表里，写进模板会被当成未解析的组件，
 * 建出来的元素名是错的（SVG 元素名区分大小写），滤镜就失效了。
 * SVG 属性同理要写成连字符形式：h() 里的属性名会原样用到元素上，不会自动转换。
 */
const RefractFilter: FunctionalComponent = () =>
  h('svg', { width: '0', height: '0', style: { position: 'absolute' }, 'aria-hidden': 'true' }, [
    h(
      'filter',
      {
        id: 'nimbus-refract',
        x: '0',
        y: '0',
        width: '100%',
        height: '100%',
        'color-interpolation-filters': 'sRGB'
      },
      [
        h('feTurbulence', {
          type: 'fractalNoise',
          'base-frequency': '0.006 0.02',
          'num-octaves': '2',
          seed: '7',
          result: 'noise'
        }),
        h('feGaussianBlur', { in: 'noise', 'std-deviation': '2', result: 'soft' }),
        h('feDisplacementMap', {
          in: 'SourceGraphic',
          in2: 'soft',
          scale: '60',
          'x-channel-selector': 'R',
          'y-channel-selector': 'G'
        })
      ]
    )
  ])

interface Props {
  /** 导航项；带 href 渲染成链接，否则是按钮 */
  items?: LiquidNavItem[]
  /** 非受控时的初始项；受控请用 v-model:active */
  defaultActive?: number
  /** light 是给亮背景用的"浅水"，dark 给深色背景 */
  tone?: LiquidNavbarTone
  /** 只显示图标。不传时 520px 以下自动收成纯图标 */
  compact?: boolean
  /** 点击时一声合成的"叮"，不加载任何音频文件 */
  sound?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => LIQUID_NAVBAR_ITEMS,
  defaultActive: 0,
  tone: 'light',
  // 三态：不传 = 窄屏自动收成图标；true / false = 强制
  compact: undefined,
  sound: false
})

const active = defineModel<number | undefined>('active')
const inner = shallowRef(props.defaultActive)
const current = computed(() => active.value ?? inner.value)
// 挂载时父级是否传了 active：传了即受控（与 React 的 active === undefined 判断对应）
const uncontrolled = active.value === undefined

const nav = useTemplateRef<HTMLElement>('nav')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const drop = useTemplateRef<HTMLElement>('drop')
// 条目与图标的元素用函数式 ref 登记。图标播放动画时会换 key 重建，所以不放进响应式
const itemEls: (HTMLElement | null)[] = []
const iconEls: (HTMLElement | null)[] = []

/** 模板里的函数式 ref：v-for 里每个条目按序号登记；元素卸载时会以 null 再调一次 */
const slotRef = (slots: (HTMLElement | null)[]) => (index: number) => (el: unknown) => {
  slots[index] = (el as HTMLElement | null) ?? null
}
const itemRef = slotRef(itemEls)
const iconRef = slotRef(iconEls)

const { gl, refract, measure, pointerMove, pointerLeave, pointerDown, play } = useLiquidNavbar({
  nav,
  canvas,
  drop,
  itemEls,
  iconEls,
  current: () => current.value,
  dark: () => props.tone === 'dark',
  sound: () => props.sound
})

// 当前项变化、条目数量或 compact 变化后重新测量水团的位置（对应 React 的 useLayoutEffect）
watch([current, () => props.items.length, () => props.compact], measure, { flush: 'post' })

/** 正在播放图标动画的项，以及播放次数：换 key 让同一段 CSS 动画能重播 */
const fx = shallowRef({ i: -1, n: 0 })

const kindOf = (item: LiquidNavItem): LiquidNavbarFx => item.fx ?? 'pop'
const isPlaying = (index: number) => {
  const item = props.items[index]
  return fx.value.i === index && !!item && kindOf(item) !== 'none'
}

function select(index: number) {
  const item = props.items[index]
  if (!item) return
  fx.value = { i: index, n: fx.value.n + 1 }
  play(index, item.fx ?? (item.icon ? 'pop' : 'none'))
  if (index !== current.value) {
    if (uncontrolled) inner.value = index
    active.value = index
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  event.preventDefault()
  const next = (current.value + (event.key === 'ArrowRight' ? 1 : -1) + props.items.length) % props.items.length
  select(next)
  itemEls[next]?.focus()
}

function onMove(event: PointerEvent) {
  // 触摸与手写笔不抬来弯
  if (event.pointerType !== 'mouse') return
  pointerMove(event.clientX, event.clientY)
}

function onDown(event: PointerEvent) {
  pointerDown(event.clientX, event.clientY)
}
</script>

<template>
  <nav
    ref="nav"
    class="nimbus-nav"
    :data-tone="tone"
    :data-gl="gl"
    :data-compact="compact === undefined ? undefined : String(compact)"
    :data-refract="refract ? 'on' : 'off'"
    aria-label="Main"
    @keydown="onKeyDown"
    @pointermove="onMove"
    @pointerleave="pointerLeave"
    @pointerdown="onDown"
  >
    <RefractFilter />
    <span class="nimbus-glass" aria-hidden="true" />
    <canvas ref="canvas" class="nimbus-water" aria-hidden="true" />
    <span ref="drop" class="nimbus-drop" aria-hidden="true" />
    <template v-for="(item, index) in items" :key="item.label + index">
      <component
        :is="item.href ? 'a' : 'button'"
        :ref="itemRef(index)"
        class="nimbus-item"
        :href="item.href"
        :type="item.href ? undefined : 'button'"
        :aria-label="item.label"
        :aria-current="index === current ? 'page' : undefined"
        @click="select(index)"
      >
        <span
          v-if="item.icon"
          :key="isPlaying(index) ? fx.n : 0"
          :ref="iconRef(index)"
          class="nv-ico"
          :data-fx="isPlaying(index) ? kindOf(item) : undefined"
        >
          <component :is="item.icon" />
        </span>
        <span class="nimbus-label">{{ item.label }}</span>
      </component>
    </template>
  </nav>
</template>

<!-- 上游把样式内嵌在组件里；这里落成同名 CSS 文件并全局引入（vue-porting §7） -->
<style src="./LiquidNavbar.css"></style>
