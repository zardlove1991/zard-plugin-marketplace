<script setup lang="ts">
withDefaults(
  defineProps<{
    done?: boolean
    fill?: boolean
    hidden?: boolean
    doneLabel?: string
  }>(),
  {
    done: false,
    fill: false,
    hidden: false,
    doneLabel: 'Deleted'
  }
)
</script>

<template>
  <span
    :class="['hold-button__label', { 'hold-button__label--fill': fill }]"
    :aria-hidden="hidden || undefined"
  >
    <span class="hold-button__idle" :aria-hidden="done || undefined">
      <span v-if="$slots.icon" class="hold-button__icon"><slot name="icon" /></span>
      <slot />
    </span>
    <span class="hold-button__done" :aria-hidden="!done || undefined">
      <span v-if="$slots['done-icon']" class="hold-button__icon"><slot name="done-icon" /></span>
      <slot name="done-label">{{ doneLabel }}</slot>
    </span>
  </span>
</template>