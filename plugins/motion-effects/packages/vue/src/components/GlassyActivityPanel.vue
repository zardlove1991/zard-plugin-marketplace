<script setup lang="ts">
import { computed, ref } from 'vue'
import { recentActivity } from '../composables/useGlassyDashboard'
import { iconFor } from './glassyIcons'
import GlassyBadge from './GlassyBadge.vue'

const query = ref('')
const status = ref('All statuses')
const show = computed(() =>
  recentActivity.filter(
    item =>
      [item.event, item.source, item.status].join(' ').toLowerCase().includes(query.value.trim().toLowerCase()) &&
      (status.value === 'All statuses' || item.status === status.value)
  )
)
const statuses = ['All statuses', 'Complete', 'Needs review', 'Scheduled', 'Exceptions']
</script>

<template>
  <section class="gd-panel gd-activity" data-gd-enter>
    <header class="gd-panel-head">
      <div><h2>Recent activity</h2></div>
      <div class="gd-table-tools">
        <label class="gd-search">
          <component :is="iconFor('search')" aria-hidden="true" />
          <input v-model="query" type="search" placeholder="Search activity" aria-label="Search activity" />
        </label>
        <label class="gd-filter">
          <component :is="iconFor('filter')" aria-hidden="true" />
          <select v-model="status" aria-label="Filter activity">
            <option v-for="item in statuses" :key="item">{{ item }}</option>
          </select>
        </label>
      </div>
    </header>
    <div class="gd-table-scroll">
      <table>
        <thead>
          <tr><th scope="col">Activity</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Time</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in show" :key="item.id">
            <td>{{ item.event }}</td>
            <td>{{ item.source }}</td>
            <td><GlassyBadge :status="item.status" /></td>
            <td>{{ item.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="show.length === 0" class="gd-empty" role="status">No matching activity.</p>
  </section>
</template>
