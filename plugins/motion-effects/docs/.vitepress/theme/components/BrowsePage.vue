<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import EffectCard from './EffectCard.vue'
import MeIcon from './MeIcon.vue'
import { CATEGORIES, EFFECTS } from '../../data/effects.mjs'
import { useNavFilter } from '../composables/useNavFilter'

type SortKey = 'default' | 'live' | 'level' | 'name'
const SORTS: SortKey[] = ['default', 'live', 'level', 'name']
const LEVEL_RANK: Record<string, number> = { easy: 0, mid: 1, hard: 2 }

const { category, query, ALL } = useNavFilter()
const sort = ref<SortKey>('default')

function hay(effect: (typeof EFFECTS)[number]) {
  return [effect.id, effect.name, effect.zh, effect.desc, effect.cat, ...effect.deps, ...effect.props, effect.note]
    .join(' ')
    .toLowerCase()
}

const matchesQuery = (effect: (typeof EFFECTS)[number]) => {
  const q = query.value.trim().toLowerCase()
  return !q || hay(effect).includes(q)
}

function count(cat: string) {
  return EFFECTS.filter(effect => matchesQuery(effect) && (cat === ALL || effect.cat === cat)).length
}

const filtered = computed(() => {
  const list = EFFECTS.filter(
    effect => (category.value === ALL || effect.cat === category.value) && matchesQuery(effect)
  )
  if (sort.value === 'live') return [...list].sort((a, b) => Number(!!b.vueReady) - Number(!!a.vueReady))
  if (sort.value === 'level') return [...list].sort((a, b) => LEVEL_RANK[a.vue] - LEVEL_RANK[b.vue])
  if (sort.value === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name))
  return list
})

const title = computed(() => (category.value === ALL ? '全部组件' : category.value))

/* 筛选状态同步到 URL hash（#cat=…&q=…&sort=…），链接可分享、前进后退可用 */
function readHash() {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const cat = params.get('cat')
  const q = params.get('q')
  const s = params.get('sort')
  if (cat && CATEGORIES.includes(cat)) category.value = cat
  if (q !== null) query.value = q
  if (s && SORTS.includes(s as SortKey)) sort.value = s as SortKey
}

function writeHash() {
  const params = new URLSearchParams()
  if (category.value !== ALL) params.set('cat', category.value)
  if (query.value.trim()) params.set('q', query.value.trim())
  if (sort.value !== 'default') params.set('sort', sort.value)
  const hash = params.toString()
  history.replaceState(null, '', `${withBase('/effects/')}${hash ? `#${hash}` : ''}`)
}

onMounted(() => {
  readHash()
  window.addEventListener('hashchange', readHash)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', readHash))
watch([category, query, sort], writeHash)
</script>

<template>
  <section class="browse">
    <header class="browse__head">
      <div>
        <p class="me-label">Components</p>
        <h1 class="browse__title">
          {{ title }}
          <span class="browse__count">{{ filtered.length }}</span>
        </h1>
      </div>
      <p class="browse__desc">
        每个组件都有可运行演示、React 源码与 Vue 3 移植说明。标「Vue 实装」的可在详情页直接调参数、拷代码。
      </p>
    </header>

    <div class="browse__toolbar">
      <label class="me-field browse__search">
        <MeIcon name="search" :size="15" />
        <input
          v-model="query"
          type="text"
          placeholder="搜索组件、场景、依赖…"
          autocomplete="off"
          spellcheck="false"
          aria-label="搜索组件"
        />
        <button v-if="query" class="browse__clear" type="button" aria-label="清除搜索" @click="query = ''">
          <MeIcon name="close" :size="13" />
        </button>
      </label>

      <div class="browse__chips" role="group" aria-label="分类">
        <button
          v-for="cat in CATEGORIES"
          :key="cat"
          class="me-chip"
          type="button"
          :aria-pressed="category === cat"
          @click="category = cat"
        >
          {{ cat }}
          <small>{{ count(cat) }}</small>
        </button>
      </div>

      <select v-model="sort" class="browse__sort" aria-label="排序">
        <option value="default">默认顺序</option>
        <option value="live">Vue 实装优先</option>
        <option value="level">按难度</option>
        <option value="name">按名称</option>
      </select>
    </div>

    <div v-if="filtered.length" class="browse__grid">
      <EffectCard v-for="effect in filtered" :key="effect.id" :effect="effect" />
    </div>
    <div v-else class="browse__empty">
      没有匹配的组件。换个关键词，或切回「全部」。
    </div>
  </section>
</template>
