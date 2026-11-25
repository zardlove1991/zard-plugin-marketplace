<script setup lang="ts">
import { computed, ref } from 'vue'
import { SwipeRow } from '@motion-effects/vue'
import type { SwipeAction } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

interface Row {
  id: number
  title: string
  meta: string
}

const values = useValues()

const actions: SwipeAction[] = [
  { id: 'delete', label: 'Delete' },
  { id: 'archive', label: 'Archive', color: '#2563eb' }
]

const seedRows = (): Row[] => [
  { id: 1, title: '设计评审笔记', meta: '今天 14:00 · 3 条待办' },
  { id: 2, title: '品牌规范 v2', meta: '昨天 · 已同步到 CI 中心' },
  { id: 3, title: '发布清单确认', meta: '周五 · 12 项待核' }
]

const rows = ref<Row[]>(seedRows())
const lastAction = ref('')

function resetRows() {
  rows.value = seedRows()
  lastAction.value = ''
}

function onCommit(action: SwipeAction, row: Row) {
  rows.value = rows.value.filter(item => item.id !== row.id)
  lastAction.value = `${action.label} · ${row.title}`
}

const props = computed(() =>
  pick(values, [
    'height',
    'radius',
    'actionWidth',
    'direction',
    'actionColor',
    'drawerColor',
    'rowColor',
    'textColor',
    'snapBounce',
    'resistance',
    'collapseMs',
    'commitAt',
    'fullSwipe',
    'closeOnAction',
    'haptic',
    'disabled'
  ])
)
</script>

<template>
  <div class="stage-center">
    <div class="stage-rows">
      <SwipeRow
        v-for="row in rows"
        :key="row.id"
        v-bind="props"
        :actions="actions"
        @commit="onCommit($event, row)"
      >
        <div class="stage-row">
          <strong>{{ row.title }}</strong>
          <span>{{ row.meta }}</span>
        </div>
      </SwipeRow>
    </div>
    <p class="stage-status">{{ lastAction || '向左滑动任意一行，或聚焦后用方向键 / Delete' }}</p>
    <button v-if="lastAction" class="stage-reset" type="button" @click="resetRows">重置列表</button>
  </div>
</template>
