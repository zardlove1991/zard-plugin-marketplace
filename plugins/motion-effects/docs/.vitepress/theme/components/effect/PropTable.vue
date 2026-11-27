<script setup lang="ts">
import type { PropDef } from '../../composables/useUsage'

defineProps<{ props: PropDef[] }>()

/** 默认值在表里怎么写：字符串加引号，没有默认值显示 — */
function show(value: unknown) {
  if (value === undefined) return '—'
  return typeof value === 'string' ? `"${value}"` : String(value)
}
</script>

<template>
  <section class="fx-panel fx-props">
    <header class="fx-panel__head">
      <h2 class="fx-panel__title">Props</h2>
      <span class="fx-panel__meta">{{ props.length }} 个</span>
    </header>
    <table class="props">
      <thead>
        <tr>
          <th>名称</th>
          <th>类型</th>
          <th>默认值</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prop in props" :key="prop.name">
          <td>
            <span class="props__zh">{{ prop.label ?? prop.name }}</span>
            <code class="props__name">{{ prop.name }}</code>
          </td>
          <td><code class="props__type">{{ prop.type }}</code></td>
          <td>
            <code v-if="prop.value !== undefined" class="props__default">{{ show(prop.value) }}</code>
            <span v-else class="props__none">—</span>
          </td>
          <td class="props__desc">{{ prop.desc }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
