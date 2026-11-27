<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useClickSpark } from '../composables/useClickSpark'
import type {
  ClickSparkEasing,
  ClickSparkLayer,
  ClickSparkSettings,
  ClickSparkShape
} from '../composables/useClickSpark'

interface Props {
  /** 火花颜色，单色或一组颜色（按顺序轮换） */
  sparkColor?: string | string[]
  /** 火花长度 / 星形半径 */
  sparkSize?: number
  /** 扩散半径（px） */
  sparkRadius?: number
  /** 每次爆出的火花数 */
  sparkCount?: number
  /** 线条粗细 */
  sparkWidth?: number
  /** 单次爆点的存活时长（ms） */
  duration?: number
  /** 缓动 */
  easing?: ClickSparkEasing
  /** 扩散半径的额外倍率 */
  extraScale?: number
  /** 形状：短线 / 拖尾 / 圆点 / 星形 */
  shape?: ClickSparkShape
  /** 随机抖动强度 0–1 */
  randomness?: number
  /** 重力，0 为悬浮 */
  gravity?: number
  /** 扇形张角（度），360 为整圈 */
  spread?: number
  /** 主方向（度，0 向上） */
  direction?: number
  /** 辉光强度 0–1 */
  glow?: number
  /** 是否画出扩散光环 */
  ring?: boolean
  /** 火花层：front 在内容之上，back 在内容之下 */
  layer?: ClickSparkLayer
  /** 关闭点击触发 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sparkColor: '#fff',
  sparkSize: 14,
  sparkRadius: 30,
  sparkCount: 8,
  sparkWidth: 2,
  duration: 500,
  easing: 'ease-out',
  extraScale: 1,
  shape: 'line',
  randomness: 0.2,
  gravity: 0,
  spread: 360,
  direction: 0,
  glow: 0,
  ring: false,
  layer: 'front',
  disabled: false
})

const root = useTemplateRef<HTMLElement>('root')
const sparkLayer = useTemplateRef<HTMLElement>('sparkLayer')

const getSettings = (): ClickSparkSettings => ({
  sparkColor: props.sparkColor,
  sparkSize: props.sparkSize,
  sparkRadius: props.sparkRadius,
  sparkCount: props.sparkCount,
  sparkWidth: props.sparkWidth,
  duration: props.duration,
  easing: props.easing,
  extraScale: props.extraScale,
  shape: props.shape,
  randomness: props.randomness,
  gravity: props.gravity,
  spread: props.spread,
  direction: props.direction,
  glow: props.glow,
  ring: props.ring,
  layer: props.layer,
  disabled: props.disabled
})

const { spark } = useClickSpark({ root, layer: sparkLayer, getSettings })

/** 手动爆一次火花（对应 React 的 ref.spark(x, y)） */
defineExpose({ spark })
</script>

<template>
  <div ref="root" class="click-spark">
    <slot />
    <span ref="sparkLayer" class="click-spark__layer" :data-layer="layer" aria-hidden="true" />
  </div>
</template>

<style src="./ClickSpark.css"></style>
