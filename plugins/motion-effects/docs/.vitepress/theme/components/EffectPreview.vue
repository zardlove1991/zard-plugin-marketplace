<script setup>
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { EFFECTS, LEVEL_TEXT, getEffect } from '../../data/effects.mjs'
import VueLivePreview from './VueLivePreview.vue'

const props = defineProps({
  /** 静态页可直接传 id；动态路由页从 params 取 */
  id: { type: String, default: '' }
})

const data = useData()

const routeId = computed(() => {
  if (props.id) return props.id
  const params = data.params
  const value = params && typeof params === 'object' && 'value' in params ? params.value : params
  return value?.id
})

const effect = computed(() => getEffect(routeId.value) ?? EFFECTS[0])

const widths = [
  { value: '100', label: '自适应' },
  { value: '1024', label: '1024' },
  { value: '768', label: '768' },
  { value: '375', label: '375' }
]
const width = ref('100')
const reloadKey = ref(0)

const repo = 'https://github.com/zardlove1991/zard-plugin-marketplace'
const sourceRoot = `${repo}/blob/main/plugins/motion-effects/skills/motion-effects/assets`
const referenceRoot = `${repo}/blob/main/plugins/motion-effects/skills/motion-effects/references`

const demoHref = computed(() => withBase(`/demos/${effect.value.demo}`))
const sourceHref = computed(() => `${sourceRoot}/${effect.value.source}`)
const sourceLabel = computed(() => effect.value.source.replace(/^react\//, ''))
const level = computed(() => LEVEL_TEXT[effect.value.vue] ?? effect.value.vue)
const levelClass = computed(() => `is-${effect.value.vue}`)

function reload() {
  reloadKey.value += 1
}
</script>

<template>
  <section class="me-effect">
    <header class="me-effect__head">
      <p class="me-eyebrow">{{ effect.cat }}</p>
      <h1 class="me-title">
        {{ effect.zh }}
        <span>{{ effect.name }}</span>
      </h1>
      <p class="me-desc">{{ effect.desc }}</p>
      <div class="me-badges">
        <span v-if="effect.vueReady" class="me-badge is-live">Vue 实装</span>
        <span class="me-badge" :class="levelClass">Vue 移植 {{ level }}</span>
        <span v-for="dep in effect.deps" :key="dep" class="me-badge is-dep">{{ dep }}</span>
        <span v-if="!effect.deps.length" class="me-badge is-dep">无第三方依赖</span>
      </div>
    </header>

    <div class="me-toolbar">
      <div class="me-seg" role="group" aria-label="预览宽度">
        <button
          v-for="item in widths"
          :key="item.value"
          type="button"
          :data-w="item.value"
          :aria-pressed="width === item.value"
          @click="width = item.value"
        >
          {{ item.label }}
        </button>
      </div>
      <button class="me-btn" type="button" @click="reload">↻ 重载</button>
      <a class="me-btn is-primary" :href="demoHref" target="_blank" rel="noopener">打开演示 ↗</a>
    </div>

    <div class="me-frame" :data-w="width">
      <iframe
        :key="reloadKey"
        :src="demoHref"
        :title="`${effect.zh} ${effect.name} 演示`"
        :style="{ height: `${effect.height}px` }"
        loading="lazy"
      ></iframe>
    </div>

    <div class="me-meta">
      <section>
        <h2>关键 API</h2>
        <div class="me-props">
          <code v-for="prop in effect.props" :key="prop">{{ prop }}</code>
        </div>
      </section>

      <section>
        <h2>源码 / 演示</h2>
        <p class="me-file">
          <a :href="sourceHref" target="_blank" rel="noopener">{{ sourceLabel }}</a>
        </p>
        <p class="me-file">
          <a :href="demoHref" target="_blank" rel="noopener">demos/{{ effect.demo }}</a>
        </p>
      </section>

      <section class="me-note">
        <h2>注意</h2>
        <p>{{ effect.note }}</p>
      </section>
    </div>

    <VueLivePreview :id="effect.id" />

    <p class="me-hint">
      移植前读
      <a :href="`${referenceRoot}/catalog.md`" target="_blank" rel="noopener">catalog.md</a>
      对应条目与
      <a :href="`${referenceRoot}/vue-porting.md`" target="_blank" rel="noopener">vue-porting.md</a>；
      上线前过
      <a :href="`${referenceRoot}/production-checklist.md`" target="_blank" rel="noopener">production-checklist.md</a>。
    </p>
  </section>
</template>