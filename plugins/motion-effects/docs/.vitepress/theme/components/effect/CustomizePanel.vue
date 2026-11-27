<script setup lang="ts">
import { computed } from 'vue'
import type { PropDef, SelectOption } from '../../composables/useUsage'
import { useValues } from '../../composables/useValues'

const props = defineProps<{ schema: { props: PropDef[] } }>()
const values = useValues()

const fields = computed(() => props.schema.props.filter(prop => prop.control))

const isChanged = (prop: PropDef) => String(values[prop.name]) !== String(prop.value)
const changedCount = computed(() => fields.value.filter(isChanged).length)

function reset() {
  for (const prop of props.schema.props) {
    if (prop.control) values[prop.name] = prop.value
  }
}

const isLabeled = (option: SelectOption): option is { value: unknown; label: string } =>
  typeof option === 'object' && option !== null
const optionKey = (option: SelectOption) => (isLabeled(option) ? option.label : option)
const optionValue = (option: SelectOption) => (isLabeled(option) ? option.value : option)
const optionLabel = (option: SelectOption) => (isLabeled(option) ? option.label : option)

/** 面板上显示中文名；没有中文名时退回属性名 */
const label = (prop: PropDef) => prop.label ?? prop.name
/** tooltip：中文名 + 真实属性名 + 说明，方便对照 API */
const hint = (prop: PropDef) =>
  `${label(prop)}（${prop.name}）${prop.desc ? '：' + prop.desc : ''}`

const unit = (prop: PropDef) => (prop.unit ? ` ${prop.unit}` : '')
const display = (prop: PropDef) => {
  const value = values[prop.name]
  return typeof value === 'number' ? String(Math.round(value * 100) / 100) : String(value ?? '')
}
</script>

<template>
  <section v-if="fields.length" class="fx-panel fx-customize">
    <header class="fx-panel__head">
      <h2 class="fx-panel__title">自定义</h2>
      <button v-if="changedCount" class="fx-reset" type="button" @click="reset">
        重置 {{ changedCount }} 项
      </button>
    </header>

    <div class="ctl-grid">
      <div
        v-for="prop in fields"
        :key="prop.name"
        class="ctl"
        :class="[`ctl--${prop.control}`, { 'is-changed': isChanged(prop) }]"
      >
        <code class="ctl__name" :title="hint(prop)">{{ label(prop) }}</code>

        <input
          v-if="prop.control === 'text'"
          v-model="values[prop.name]"
          class="ctl__input"
          type="text"
          spellcheck="false"
        />

        <template v-else-if="prop.control === 'number'">
          <input
            v-model.number="values[prop.name]"
            class="ctl__input ctl__input--num"
            type="number"
            :step="prop.step ?? 1"
            :min="prop.min"
            :max="prop.max"
          />
          <span v-if="prop.unit" class="ctl__unit">{{ prop.unit }}</span>
        </template>

        <template v-else-if="prop.control === 'slider'">
          <span class="ctl__value">{{ display(prop) }}<small>{{ unit(prop) }}</small></span>
          <input
            v-model.number="values[prop.name]"
            class="ctl__range"
            type="range"
            :min="prop.min"
            :max="prop.max"
            :step="prop.step ?? 1"
            :aria-label="label(prop)"
          />
        </template>

        <button
          v-else-if="prop.control === 'switch'"
          class="ctl__switch"
          :class="{ 'is-on': !!values[prop.name] }"
          type="button"
          role="switch"
          :aria-checked="!!values[prop.name]"
          :aria-label="label(prop)"
          @click="values[prop.name] = !values[prop.name]"
        >
          <i></i>
        </button>

        <select v-else-if="prop.control === 'select'" v-model="values[prop.name]" class="ctl__input">
          <option v-for="option in prop.options" :key="optionKey(option)" :value="optionValue(option)">
            {{ optionLabel(option) }}
          </option>
        </select>

        <label v-else-if="prop.control === 'color'" class="ctl__color">
          <input v-model="values[prop.name]" type="color" :aria-label="label(prop)" />
          <code>{{ values[prop.name] }}</code>
        </label>
      </div>
    </div>
  </section>
</template>
