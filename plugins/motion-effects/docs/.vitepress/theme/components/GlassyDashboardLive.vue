<script setup lang="ts">
import { GlassyDashboard } from '@motion-effects/vue'
</script>

<template>
  <div class="gd-standalone">
    <GlassyDashboard workspace-name="ATLAS" :panel-frost="12" />
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
.gd-standalone {
  inline-size: 100%;
  min-block-size: 100svh;
}
</style>
