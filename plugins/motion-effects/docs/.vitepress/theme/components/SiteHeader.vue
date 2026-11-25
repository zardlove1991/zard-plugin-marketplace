<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { VPNavBarSearch } from 'vitepress/theme-without-fonts'
import MeIcon from './MeIcon.vue'
import { REPO } from '../../data/nav.mjs'
import { useHref } from '../composables/useHref'

defineProps<{ showMenu?: boolean }>()
const emit = defineEmits<{ menu: [] }>()

const route = useRoute()
const { href } = useHref()

const modKey = ref('Ctrl')
onMounted(() => {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  if (/Mac|iPhone|iPad/.test(nav.userAgentData?.platform ?? nav.platform ?? '')) modKey.value = '⌘'
})

/** VitePress 自带本地搜索：热键与弹窗都在 VPNavBarSearch 里，这里只触发它的按钮。 */
function openSearch() {
  document.querySelector<HTMLButtonElement>('#me-vp-search button')?.click()
}
</script>

<template>
  <header class="shell__header">
    <div class="shell__header-inner">
      <button
        v-if="showMenu"
        class="shell__menu"
        type="button"
        aria-label="打开菜单"
        @click="emit('menu')"
      >
        <MeIcon name="menu" :size="18" />
      </button>

      <a class="shell__brand" :href="href('/')" aria-label="Motion Effects 首页">
        <img class="shell__logo" :src="withBase('/logo.svg')" alt="" />
        <span class="shell__brand-name">Motion Effects</span>
      </a>

      <span class="shell__divider" aria-hidden="true"></span>

      <nav class="shell__nav" aria-label="主导航">
        <a
          class="shell__nav-link"
          :class="{ 'is-active': route.path.startsWith(withBase('/effects')) }"
          :href="href('/effects/')"
        >
          组件
        </a>
        <a
          class="shell__nav-link"
          :class="{ 'is-active': route.path.startsWith(withBase('/guide')) }"
          :href="href('/guide/')"
        >
          指南
        </a>
      </nav>

      <div class="shell__actions">
        <button class="shell__search" type="button" aria-label="搜索" @click="openSearch">
          <MeIcon name="search" :size="15" />
          <span class="shell__search-text">搜索</span>
          <span class="shell__search-keys" aria-hidden="true">
            <span class="me-kbd">{{ modKey }}</span>
            <span class="me-kbd">K</span>
          </span>
        </button>
        <VPNavBarSearch id="me-vp-search" class="shell__vp-search" />
        <a class="shell__github" :href="REPO" target="_blank" rel="noopener" aria-label="GitHub 仓库">
          <MeIcon name="github" :size="18" />
        </a>
        <a class="me-btn me-btn--lime shell__cta" :href="href('/guide/')">
          接入<span class="shell__cta-text-long">&nbsp;Claude Code</span>
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 搜索弹窗挂在这个节点下面；节点本身移出视口即可，弹窗是 fixed 定位，不受影响 */
.shell__vp-search {
  position: fixed;
  top: 0;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
