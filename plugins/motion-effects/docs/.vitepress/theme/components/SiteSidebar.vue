<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, withBase } from 'vitepress'
import MeIcon from './MeIcon.vue'
import { CATEGORIES, EFFECTS } from '../../data/effects.mjs'
import { CATEGORY_ICONS, GUIDE_NAV, REFERENCES } from '../../data/nav.mjs'
import { useHref } from '../composables/useHref'
import { useNavFilter } from '../composables/useNavFilter'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const route = useRoute()
const router = useRouter()
const { href } = useHref()
const { category, query, ALL } = useNavFilter()

const browsePath = withBase('/effects/')
const onBrowse = computed(() => route.path === browsePath)
const onGuide = computed(() => route.path.startsWith(withBase('/guide')))

function effectPath(id: string) {
  return withBase(`/effects/${id}`)
}

function hay(effect: (typeof EFFECTS)[number]) {
  return [effect.id, effect.name, effect.zh, effect.desc, effect.cat, ...effect.props]
    .join(' ')
    .toLowerCase()
}

/** 按分类 + 过滤词分组；没内容的分组不渲染 */
const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  return CATEGORIES.slice(1)
    .filter(cat => category.value === ALL || cat === category.value)
    .map(cat => ({
      cat,
      total: EFFECTS.filter(effect => effect.cat === cat).length,
      items: EFFECTS.filter(effect => effect.cat === cat && (!q || hay(effect).includes(q)))
    }))
    .filter(group => group.items.length > 0)
})

function pickCategory(cat: string) {
  category.value = cat
  if (!onBrowse.value) router.go(href('/effects/'))
}

function isActive(link: string) {
  const target = withBase(link).replace(/\/$/, '')
  const current = route.path.replace(/\/$/, '')
  return current === target
}

const placeholder = computed(() => `过滤 ${EFFECTS.length} 个组件…`)
</script>

<template>
  <aside id="me-sidebar" class="sidebar" :class="{ 'is-open': open }" aria-label="侧边栏">
    <a class="sidebar__browse" :class="{ 'is-active': onBrowse }" :href="href('/effects/')">
      <MeIcon name="grid" :size="16" />
      <span>浏览全部组件</span>
    </a>

    <div class="sidebar__rail" role="group" aria-label="按分类筛选">
      <button
        v-for="cat in CATEGORIES"
        :key="cat"
        class="sidebar__rail-link"
        :class="{ 'is-active': category === cat }"
        type="button"
        :title="cat"
        :aria-label="cat"
        :aria-pressed="category === cat"
        @click="pickCategory(cat)"
      >
        <MeIcon :name="CATEGORY_ICONS[cat]" :size="16" />
      </button>
    </div>

    <label class="me-field sidebar__filter">
      <MeIcon name="search" :size="15" />
      <input v-model="query" type="text" :placeholder="placeholder" autocomplete="off" spellcheck="false" />
      <button v-if="query" class="sidebar__clear" type="button" aria-label="清除过滤" @click.prevent="query = ''">
        <MeIcon name="close" :size="13" />
      </button>
    </label>

    <!-- 指南页把「指南 / 参考文档」排到最前；组件页保持组件在前 -->
    <nav class="sidebar__nav" :class="{ 'is-guide': onGuide && !query.trim() }" aria-label="导航">
      <div class="sidebar__section sidebar__section--effects">
        <template v-for="group in groups" :key="group.cat">
          <p class="sidebar__group">
            {{ group.cat }}
            <span>{{ group.items.length }} / {{ group.total }}</span>
          </p>
          <a
            v-for="effect in group.items"
            :key="effect.id"
            class="sidebar__item"
            :class="{ 'is-active': route.path === effectPath(effect.id) }"
            :href="href(`/effects/${effect.id}`)"
            :title="effect.desc"
            @click="emit('close')"
          >
            <span class="sidebar__item-dot" :class="{ 'is-live': effect.vueReady }"></span>
            <span>{{ effect.zh }}</span>
            <span class="sidebar__item-name">{{ effect.name }}</span>
          </a>
        </template>

        <p v-if="!groups.length" class="sidebar__empty">
          {{ category === ALL ? '没有匹配的组件。' : '该分类下没有匹配的组件。' }}
        </p>
      </div>

      <div v-if="!query.trim()" class="sidebar__section sidebar__section--guide">
        <p class="sidebar__group">指南</p>
        <a
          v-for="item in GUIDE_NAV"
          :key="item.link"
          class="sidebar__item sidebar__item--plain"
          :class="{ 'is-active': isActive(item.link) }"
          :href="href(item.link)"
          @click="emit('close')"
        >
          <span class="sidebar__item-dot"></span>
          <span>{{ item.text }}</span>
        </a>

        <p class="sidebar__group">参考文档</p>
        <a
          v-for="item in REFERENCES"
          :key="item.link"
          class="sidebar__item sidebar__item--plain"
          :href="item.link"
          target="_blank"
          rel="noopener"
        >
          <span class="sidebar__item-dot"></span>
          <span>{{ item.text }}</span>
          <MeIcon name="external" :size="12" />
        </a>
      </div>
    </nav>
  </aside>
</template>
