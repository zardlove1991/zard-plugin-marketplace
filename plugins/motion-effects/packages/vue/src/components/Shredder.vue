<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import {
  useShredder,
  type ShredderConfig,
  type ShredderItem
} from '../composables/useShredder'

type ShredderProps = Omit<ShredderConfig, 'onShred' | 'onReorder'>

const props = withDefaults(defineProps<ShredderProps>(), {
  items: () => [],
  width: 340,
  height: 460,
  inset: 14,
  gap: 10,
  slitHeight: 4,
  fallHeight: 140,
  feedSpeed: 180,
  bite: 18,
  autoFeed: true,
  stripWidth: 10,
  curl: 1,
  autoAnimate: false,
  loop: false,
  loopAfterDelete: false,
  dragTilt: 6,
  lift: 1.02,
  slitColor: '#3f3f46',
  color: '#f5f5f5',
  disabled: false,
  className: ''
})

const emit = defineEmits<{
  shred: [item: ShredderItem]
  reorder: [items: ShredderItem[]]
}>()

const root = useTemplateRef<HTMLDivElement>('root')

const getConfig = (): ShredderConfig => ({
  items: props.items,
  width: props.width,
  height: props.height,
  inset: props.inset,
  gap: props.gap,
  slitHeight: props.slitHeight,
  fallHeight: props.fallHeight,
  feedSpeed: props.feedSpeed,
  bite: props.bite,
  autoFeed: props.autoFeed,
  stripWidth: props.stripWidth,
  curl: props.curl,
  autoAnimate: props.autoAnimate,
  loop: props.loop,
  loopAfterDelete: props.loopAfterDelete,
  dragTilt: props.dragTilt,
  lift: props.lift,
  slitColor: props.slitColor,
  color: props.color,
  disabled: props.disabled,
  className: props.className,
  onShred: (item) => emit('shred', item),
  onReorder: (items) => emit('reorder', items)
})

const { renderItems } = useShredder({ root, getConfig })

const rootStyle = computed(() => ({
  '--sh-w': `${props.width}px`,
  '--sh-h': `${props.height}px`,
  '--sh-inset': `${props.inset}px`,
  '--sh-gap': `${props.gap}px`,
  '--sh-slit-h': `${props.slitHeight}px`,
  '--sh-fall': `${props.fallHeight}px`,
  '--sh-slit-inset': `${Math.max(0, props.inset - 6)}px`,
  '--sh-over': '40px',
  '--sh-slit': props.slitColor,
  '--sh-ink': props.color
}))
</script>

<template>
  <div
    ref="root"
    class="sh-root"
    :class="className"
    :style="rootStyle"
    :data-disabled="disabled ? '' : undefined"
  >
    <ul class="sh-list">
      <li
        v-for="(item, index) in renderItems"
        :key="item.id"
        class="sh-slot"
      >
        <div
          class="sh-item"
          :tabindex="disabled ? -1 : 0"
          :aria-disabled="disabled || undefined"
        >
          <slot name="item" :item="item" :index="index" />
        </div>
      </li>
    </ul>
    <div class="sh-slit" aria-hidden="true" />
    <div class="sh-fall" aria-hidden="true">
      <canvas class="sh-canvas" />
    </div>
  </div>
</template>

<style src="./Shredder.css"></style>
