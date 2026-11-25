<script setup lang="ts">
import { computed } from 'vue'
import { SpotlightCard } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

const values = useValues()

const props = computed(() =>
  pick(values, [
    'theme',
    'spotlightColor',
    'intensity',
    'spotlightSize',
    'softness',
    'shape',
    'borderGlow',
    'proximity',
    'smoothing',
    'ambient',
    'flare',
    'grain'
  ])
)
</script>

<template>
  <div class="stage-center">
    <SpotlightCard v-bind="props" class="spot-card">
      <div class="spot-card__avatar">E</div>
      <h3 class="spot-card__name">Ethan Harrison</h3>
      <p class="spot-card__role">Product designer</p>
      <button class="spot-card__cta" type="button">Get in touch</button>
    </SpotlightCard>
    <p class="stage-status">把指针移到卡片上，光斑跟随；靠近时边缘提前亮起，按一下会膨胀变亮</p>
  </div>
</template>

<style scoped>
.spot-card {
  width: 280px;
  padding: 26px 24px;
  color: #f5f5f5;
  text-align: left;
}

.spot-card__avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(122 168 255 / 0.9), rgb(255 255 255 / 0.14));
  color: #0b0d14;
  font-weight: 700;
}

.spot-card__name {
  margin: 16px 0 2px;
  padding: 0;
  border: 0;
  color: inherit;
  font-size: 18px;
  font-weight: 600;
}

.spot-card__role {
  margin: 0 0 18px;
  font-size: 13px;
  opacity: 0.7;
}

.spot-card__cta {
  padding: 8px 16px;
  border: 1px solid rgb(245 245 245 / 0.6);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
</style>
