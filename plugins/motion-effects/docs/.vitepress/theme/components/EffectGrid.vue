<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { CATEGORIES, EFFECTS, LEVEL_TEXT } from '../../data/effects.mjs'

const query = ref('')
const category = ref('全部')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return EFFECTS.filter(effect => {
    if (category.value !== '全部' && effect.cat !== category.value) return false
    if (!q) return true
    const hay = [
      effect.id,
      effect.name,
      effect.zh,
      effect.desc,
      effect.cat,
      ...effect.deps,
      ...effect.props,
      effect.note
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

function indexOf(effect) {
  return String(EFFECTS.indexOf(effect) + 1).padStart(2, '0')
}
</script>

<template>
  <section class="me-index">
    <header class="me-index__head">
      <p class="me-eyebrow">EFFECT LIBRARY</p>
      <h1>20 个特效</h1>
      <p class="me-desc">
        每个特效都有可运行演示、React 源码、Vue 3 移植难度与关键 API。点开任意一张卡片进入预览。
      </p>
    </header>

    <div class="me-filters">
      <input
        v-model="query"
        type="search"
        class="me-search"
        placeholder="搜索特效、场景、依赖…"
        autocomplete="off"
        spellcheck="false"
        aria-label="搜索特效"
      />
      <div class="me-chips" role="group" aria-label="分类">
        <button
          v-for="item in CATEGORIES"
          :key="item"
          type="button"
          class="me-chip"
          :aria-pressed="category === item"
          @click="category = item"
        >
          {{ item }}
        </button>
      </div>
      <span class="me-count">{{ filtered.length }} / {{ EFFECTS.length }}</span>
    </div>

    <div v-if="filtered.length" class="me-grid">
      <a
        v-for="effect in filtered"
        :key="effect.id"
        class="me-card"
        :href="withBase(`/effects/${effect.id}`)"
      >
        <div class="me-card__top">
          <span class="me-card__idx">{{ indexOf(effect) }}</span>
          <span class="me-card__badges">
            <span v-if="effect.vueReady" class="me-badge is-live">Vue 实装</span>
            <span class="me-badge" :class="`is-${effect.vue}`">{{ LEVEL_TEXT[effect.vue] }}</span>
          </span>
        </div>
        <h3 class="me-card__title">{{ effect.zh }}</h3>
        <p class="me-card__name">{{ effect.name }}</p>
        <p class="me-card__desc">{{ effect.desc }}</p>
        <div class="me-card__foot">
          <span class="me-card__cat">{{ effect.cat }}</span>
          <span class="me-card__deps">{{ effect.deps.length ? effect.deps.join(' · ') : '无依赖' }}</span>
        </div>
      </a>
    </div>

    <p v-else class="me-empty">没有匹配的特效。换个关键词或分类试试。</p>
  </section>
</template>