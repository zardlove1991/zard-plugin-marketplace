<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import { motion } from 'motion-v'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Delete02Icon } from '@hugeicons/core-free-icons'
import { useSwipeRow } from '../composables/useSwipeRow'
import type { SwipeAction, SwipeDirection } from '../types'

interface Props {
  actions?: SwipeAction[]
  actionColor?: string
  drawerColor?: string
  rowColor?: string
  textColor?: string
  height?: number
  radius?: number
  actionWidth?: number
  direction?: SwipeDirection
  snapBounce?: number
  resistance?: number
  collapseMs?: number
  commitAt?: number
  fullSwipe?: boolean
  disabled?: boolean
  closeOnAction?: boolean
  haptic?: boolean
  label?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [{ id: 'delete', label: 'Delete' }],
  actionColor: '#e5484d',
  drawerColor: '#3f3f46',
  rowColor: '#27272a',
  textColor: '#f5f5f5',
  height: 64,
  radius: 16,
  actionWidth: 80,
  direction: 'left',
  snapBounce: 0.2,
  resistance: 0.55,
  collapseMs: 200,
  commitAt: 0.6,
  fullSwipe: true,
  disabled: false,
  closeOnAction: true,
  haptic: true,
  label: 'List item',
  className: ''
})

const emit = defineEmits<{
  'open-change': [open: boolean]
  action: [action: SwipeAction]
  commit: [action: SwipeAction]
}>()

const openModel = defineModel<boolean | undefined>('open', { default: undefined })
const innerOpen = shallowRef(false)
const open = computed(() => openModel.value ?? innerOpen.value)

const setOpen = (next: boolean) => {
  if (next === open.value) return
  innerOpen.value = next
  openModel.value = next
  emit('open-change', next)
}

const rootRef = useTemplateRef<HTMLElement>('root')
const surfaceRef = useTemplateRef<HTMLElement>('surface')

const {
  phase,
  say,
  primary,
  secondaryActions,
  railId,
  sign,
  actionWidth,
  actionCount,
  surfaceXf,
  railXf,
  blockXf,
  glyphXf,
  onColor,
  down,
  act,
  onToggleClick,
  onToggleKey
} = useSwipeRow({
  root: rootRef,
  surface: surfaceRef,
  actions: () => props.actions,
  actionWidth: () => props.actionWidth,
  direction: () => props.direction,
  resistance: () => props.resistance,
  commitAt: () => props.commitAt,
  fullSwipe: () => props.fullSwipe,
  snapBounce: () => props.snapBounce,
  collapseMs: () => props.collapseMs,
  disabled: () => props.disabled,
  haptic: () => props.haptic,
  closeOnAction: () => props.closeOnAction,
  open: () => open.value,
  setOpen,
  emitAction: action => emit('action', action),
  emitCommit: action => emit('commit', action)
})

const rootStyle = computed(() => ({
  '--sr-h': `${props.height}px`,
  '--sr-r': `${props.radius}px`,
  '--sr-a': `${props.actionWidth}px`,
  '--sr-row': props.rowColor,
  '--sr-text': props.textColor,
  '--sr-drawer': props.drawerColor,
  '--sr-on-drawer': onColor(props.drawerColor),
  '--sr-action': props.actionColor,
  '--sr-on-action': onColor(props.actionColor),
  '--sr-collapse': `${props.collapseMs}ms`
}))

const secondaryStyle = (action: SwipeAction, index: number) => {
  const background = action.color ?? props.drawerColor
  return {
    ...(sign.value < 0
      ? { right: `${(index + 1) * actionWidth.value}px` }
      : { left: `${(index + 1) * actionWidth.value}px` }),
    background,
    color: onColor(background)
  }
}
</script>

<template>
  <div
    ref="root"
    class="sr-root"
    :class="className"
    role="group"
    :aria-label="label"
    :data-direction="direction"
    :data-open="open ? '' : undefined"
    :data-phase="phase"
    :data-disabled="disabled ? '' : undefined"
    :style="rootStyle"
  >
    <div class="sr-shell">
      <motion.div
        :id="railId"
        class="sr-rail"
        :style="{ transform: railXf }"
        :inert="!open || undefined"
        :aria-hidden="!open"
      >
        <button
          v-for="(action, index) in secondaryActions"
          :key="action.id"
          type="button"
          class="sr-btn"
          :style="secondaryStyle(action, index)"
          @click="act(action, $event)"
        >
          <span class="sr-glyph">
            <span v-if="action.icon" class="sr-icon">
              <component :is="action.icon" />
            </span>
            <span>{{ action.label }}</span>
          </span>
        </button>

        <motion.div
          v-if="primary"
          class="sr-block"
          :style="{ transform: blockXf }"
        >
          <motion.button
            type="button"
            class="sr-btn sr-btn--primary"
            :style="{ transform: glyphXf }"
            @click="act(primary, $event)"
          >
            <span class="sr-glyph">
              <span class="sr-icon">
                <component :is="primary.icon" v-if="primary.icon" />
                <HugeiconsIcon
                  v-else
                  :icon="Delete02Icon"
                  :size="20"
                  :stroke-width="2"
                />
              </span>
              <span>{{ primary.label }}</span>
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        ref="surface"
        class="sr-surface"
        :style="{ transform: surfaceXf }"
        @pointerdown="down"
      >
        <slot />
        <button
          type="button"
          class="sr-toggle"
          :tabindex="disabled ? -1 : 0"
          :aria-expanded="open"
          :aria-controls="railId"
          :aria-keyshortcuts="sign < 0 ? 'ArrowLeft' : 'ArrowRight'"
          @keydown="onToggleKey"
          @click="onToggleClick"
        >
          {{ actionCount }} {{ actionCount === 1 ? 'action' : 'actions' }}
        </button>
      </motion.div>
    </div>
    <span class="sr-live" aria-live="polite">{{ say }}</span>
  </div>
</template>

<style src="./SwipeRow.css"></style>