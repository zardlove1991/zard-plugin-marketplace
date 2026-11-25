<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Content, useData, useRoute } from 'vitepress'
import SiteHeader from './components/SiteHeader.vue'
import SiteSidebar from './components/SiteSidebar.vue'
import SiteFooter from './components/SiteFooter.vue'

const { frontmatter, page } = useData()
const route = useRoute()

/** `layout: false` 的页面（iframe 承载的裸页面）只渲染内容 */
const bare = computed(() => frontmatter.value.layout === false)
const hasSidebar = computed(
  () => frontmatter.value.sidebar !== false && frontmatter.value.layout !== 'home'
)
/** 纯 markdown 的页面用 VitePress 的 `.vp-doc` 排版；总览、详情和首页有自己的样式 */
const prose = computed(() => {
  const path = page.value.relativePath
  return path.startsWith('guide/') || path === '404.md'
})
/** 纯 markdown 的阅读页收窄版心 */
const narrow = computed(() => {
  const path = page.value.relativePath
  return path.startsWith('guide/') || path === '404.md'
})

const isHome = computed(() => frontmatter.value.layout === 'home')

// 侧栏抽屉只在 < 960px 出现
const sidebarOpen = ref(false)
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)
</script>

<template>
  <Content v-if="bare" />
  <div
    v-else
    class="shell"
    :class="{ 'shell--wide': !hasSidebar, 'shell--home': isHome }"
  >
    <a class="skip-link" href="#me-main">跳到内容</a>
    <SiteHeader :show-menu="hasSidebar" @menu="sidebarOpen = !sidebarOpen" />
    <SiteSidebar v-if="hasSidebar" :open="sidebarOpen" @close="sidebarOpen = false" />
    <div
      v-if="hasSidebar && sidebarOpen"
      class="shell__backdrop"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />
    <main id="me-main" class="shell__main" tabindex="-1">
      <div class="shell__page" :class="{ 'vp-doc': prose, 'shell__page--prose': narrow }">
        <Content />
        <SiteFooter v-if="!isHome" />
      </div>
    </main>
  </div>
</template>
