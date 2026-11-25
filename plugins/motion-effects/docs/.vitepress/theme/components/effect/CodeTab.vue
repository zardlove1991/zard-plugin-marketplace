<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import MeIcon from '../MeIcon.vue'
import { REPO } from '../../../data/nav.mjs'
import { useCopy, useUsage, type PropDef } from '../../composables/useUsage'
import { useValues } from '../../composables/useValues'

interface Effect {
  id: string
  name: string
  demo: string
  source: string
  props: string[]
  note: string
}

interface Schema {
  component: string
  deps: string[]
  slot?: string | null
  props: PropDef[]
  events?: { name: string; args?: string; desc: string }[]
  expose?: { name: string; desc: string }[]
}

const props = defineProps<{ effect: Effect; schema: Schema | null }>()
const values = useValues()
const { copied, copy } = useCopy()

type Tok = [cls: string, text: string]

/* ---------- 用法：随 Customize 的值实时生成 ---------- */

const showAll = ref(false)
const usage = props.schema
  ? useUsage({ schema: props.schema, values, all: computed(() => showAll.value) })
  : null

/** 命令行两行：第一行注释，其后每条命令 */
const installLines = computed(() => {
  const lines: [string, string][] = [['# 组件是源码形式，由项目自己的 Vite 编译', '']]
  if (props.schema?.deps.length) {
    lines.push(['pnpm add', ` ${props.schema.deps.join(' ')}`])
  }
  return lines
})
const installText = computed(() => installLines.value.map(([head, rest]) => head + rest).join('\n'))

// useUsage 返回的是普通对象，里面的 ref 在模板里不会自动解包，这里先摊平
const usageLines = computed<Tok[][]>(() => (usage ? usage.lines.value : []))
const usageText = computed(() => (usage ? usage.text.value : ''))

/* ---------- 源码链接 ---------- */

const PLUGIN = `${REPO}/blob/main/plugins/motion-effects`
const vueSource = props.schema
  ? `${PLUGIN}/packages/vue/src/components/${props.schema.component}.vue`
  : null
const links = [
  vueSource && { href: vueSource, label: 'Vue 组件源码', meta: `${props.schema?.component}.vue`, external: true },
  { href: `${PLUGIN}/skills/motion-effects/assets/${props.effect.source}`, label: 'React 原件', meta: props.effect.source.replace(/^react\/components\/ui\//, ''), external: true },
  { href: withBase(`/demos/${props.effect.demo}`), label: 'vanilla 演示', meta: `demos/${props.effect.demo}`, external: false },
  { href: `${PLUGIN}/skills/motion-effects/references/catalog.md`, label: '选型与移植要点', meta: 'catalog.md', external: true }
].filter(Boolean) as { href: string; label: string; meta: string; external: boolean }[]

</script>

<template>
  <div class="fx-codetab">
    <section class="fx-panel">
      <header class="fx-panel__head">
        <h2 class="fx-panel__title">安装</h2>
        <button
          class="fx-iconbtn"
          type="button"
          :aria-label="copied === 'install' ? '已复制' : '复制命令'"
          @click="copy(installText, 'install')"
        >
          <MeIcon :name="copied === 'install' ? 'check' : 'copy'" :size="14" />
        </button>
      </header>
      <div class="fx-panel__body">
        <p class="fx-prose">
          包是 workspace 私有包，组件以源码形式交付。把
          <code v-if="vueSource"
            ><a :href="vueSource" target="_blank" rel="noopener">{{ schema?.component }}.vue</a></code
          >
          <template v-if="schema?.deps.length"> 和它依赖的 composable、CSS 一起复制进项目，再安装缺的依赖。</template>
          <template v-else> 和它用到的 composable、CSS 一起复制进项目即可，没有额外依赖。</template>
        </p>
        <div class="studio__code fx-code">
          <span v-for="[head, rest] in installLines" :key="head + rest" class="studio__line"
            ><span class="tok-kw">{{ head }}</span
            ><span>{{ rest }}</span></span
          >
        </div>
      </div>
    </section>

    <section v-if="schema && usage" class="fx-panel">
      <header class="fx-panel__head">
        <h2 class="fx-panel__title">用法</h2>
        <label class="fx-toggle">
          <input v-model="showAll" type="checkbox" />
          显示全部参数
        </label>
        <button
          class="fx-iconbtn"
          type="button"
          :aria-label="copied === 'usage' ? '已复制' : '复制代码'"
          @click="copy(usageText, 'usage')"
        >
          <MeIcon :name="copied === 'usage' ? 'check' : 'copy'" :size="14" />
        </button>
      </header>
      <div class="studio__code fx-code">
        <span v-for="(line, index) in usageLines" :key="index" class="studio__line"><span
            v-for="([cls, text], tokIndex) in line"
            :key="tokIndex"
            :class="cls ? `tok-${cls}` : undefined"
          >{{ text }}</span></span>
      </div>
    </section>

    <section v-if="schema && (schema.events?.length || schema.expose?.length)" class="fx-panel">
      <header class="fx-panel__head">
        <h2 class="fx-panel__title">事件与方法</h2>
      </header>
      <table class="props">
        <tbody>
          <tr v-for="event in schema.events" :key="event.name">
            <td><code class="props__name">@{{ event.name }}</code></td>
            <td><code class="props__type">{{ event.args ?? '[]' }}</code></td>
            <td class="props__desc">{{ event.desc }}</td>
          </tr>
          <tr v-for="method in schema.expose" :key="method.name">
            <td><code class="props__name">ref.{{ method.name }}()</code></td>
            <td><code class="props__type">() =&gt; void</code></td>
            <td class="props__desc">{{ method.desc }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="!schema" class="fx-panel">
      <header class="fx-panel__head">
        <h2 class="fx-panel__title">关键 API</h2>
        <span class="fx-panel__meta">尚未移植成 Vue 组件，下面是 React 原件的入参</span>
      </header>
      <div class="fx-chips">
        <code v-for="name in effect.props" :key="name">{{ name }}</code>
      </div>
    </section>

    <section class="fx-panel fx-panel--note">
      <header class="fx-panel__head">
        <h2 class="fx-panel__title">注意</h2>
      </header>
      <p class="fx-panel__body fx-prose">{{ effect.note }}</p>
    </section>

    <section class="fx-panel">
      <header class="fx-panel__head">
        <h2 class="fx-panel__title">源码与演示</h2>
      </header>
      <div class="fx-links">
        <a
          v-for="link in links"
          :key="link.href"
          class="fx-link"
          :href="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener' : undefined"
        >
          <span>
            {{ link.label }}
            <small>{{ link.meta }}</small>
          </span>
          <MeIcon :name="link.external ? 'external' : 'arrow-right'" :size="14" />
        </a>
      </div>
    </section>
  </div>
</template>
