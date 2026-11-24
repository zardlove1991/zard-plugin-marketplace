<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()
const color = computed(() =>
  props.status === 'Complete' || props.status === 'Running'
    ? 'teal'
    : props.status === 'Needs review' || props.status === 'Exceptions'
      ? 'coral'
      : 'ink'
)
</script>

<template>
  <span class="gd-status" :data-state="color"><i aria-hidden="true" />{{ status }}</span>
</template>
