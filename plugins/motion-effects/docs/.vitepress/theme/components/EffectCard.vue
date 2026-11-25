<script setup lang="ts">
import { computed } from 'vue'
import LazyMedia from './LazyMedia.vue'
import { LEVEL_TEXT } from '../../data/effects.mjs'
import { PREVIEWS } from '../../data/previews.mjs'
import { useHref } from '../composables/useHref'

interface Effect {
  id: string
  name: string
  zh: string
  cat: string
  desc: string
  vue: 'easy' | 'mid' | 'hard'
  vueReady?: boolean
}

const props = defineProps<{ effect: Effect }>()
const { href } = useHref()

const media = computed(() => PREVIEWS[props.effect.id])
const level = computed(() => LEVEL_TEXT[props.effect.vue] ?? props.effect.vue)
</script>

<template>
  <a
    class="fx-card"
    :href="href(`/effects/${effect.id}`)"
    :aria-label="`${effect.zh} ${effect.name}：${effect.desc}`"
  >
    <div class="fx-card__media">
      <LazyMedia
        :webm="media?.webm"
        :mp4="media?.mp4"
        :poster="media?.poster"
        :placeholder="`<${effect.name} />`"
      />
      <div class="fx-card__badges">
        <span v-if="effect.vueReady" class="me-badge me-badge--live">Vue 实装</span>
      </div>
    </div>
    <div class="fx-card__body">
      <h3 class="fx-card__title">{{ effect.zh }}</h3>
      <p class="fx-card__name">{{ effect.name }}</p>
      <p class="fx-card__cat" :class="`is-${effect.vue}`">{{ level }} · {{ effect.cat }}</p>
    </div>
  </a>
</template>
