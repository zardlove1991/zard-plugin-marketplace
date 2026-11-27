<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { Dock } from '@motion-effects/vue'
import type { DockItem } from '@motion-effects/vue'
import { pick, useValues } from '../composables/useValues'

/** 演示用的线性图标：Dock 的 icon 传 Vue 组件 */
const icon = (paths: string[]) =>
  defineComponent({
    name: 'DockStageIcon',
    render: () =>
      h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        },
        paths.map(d => h('path', { d }))
      )
  })

const HomeIcon = icon(['M3 10.5 12 3l9 7.5', 'M5.5 9.5V20h13V9.5'])
const MailIcon = icon(['M3 5h18v14H3z', 'm4 7 8 6 8-6'])
const MusicIcon = icon(['M9 18V5l11-2v13', 'M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6', 'M17 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6'])
const SettingsIcon = icon(['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6', 'M12 2v3m0 14v3M2 12h3m14 0h3'])
const TrashIcon = icon(['M4 7h16', 'M9 7V5h6v2', 'M6 7l1 13h10l1-13'])

const values = useValues()
const lastEvent = ref('把指针移到图标上，会按弹簧放大')

const items: DockItem[] = [
  { label: '访达', icon: HomeIcon, menu: [{ label: '新建窗口' }, { separator: true }, { label: '退出' }] },
  { label: '邮件', icon: MailIcon, badge: 3 },
  { label: '音乐', icon: MusicIcon },
  { label: '系统设置', icon: SettingsIcon },
  { separator: true },
  { label: '废纸篓', icon: TrashIcon }
]

const props = computed(() =>
  pick(values, [
    'position', 'theme', 'baseItemSize', 'magnification', 'distance', 'panelHeight',
    'gap', 'roundness', 'bounce', 'autoHide', 'tiles', 'showLabels', 'showIndicators',
    'showBadges', 'badgeColor', 'accentColor'
  ])
)
</script>

<template>
  <div class="dock-stage">
    <div class="dock-stage__area">
      <Dock :items="items" v-bind="props" @select="(index, item) => (lastEvent = `select · ${item.label}`)" />
    </div>
    <p class="dock-stage__log">{{ lastEvent }}</p>
    <p class="stage-status">右键或长按图标可以打开菜单 · 图标按弹簧放大 · 点击会弹跳</p>
  </div>
</template>

<style scoped>
.dock-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  padding: 24px;
}
.dock-stage__area {
  position: relative;
  width: min(100%, 640px);
  height: 340px;
  border-radius: var(--me-r-lg);
  background: radial-gradient(120% 120% at 50% 0%, #2b2b31, #16161a 72%);
}
.dock-stage__log {
  margin: 0;
  font: 500 12px/1.5 ui-monospace, monospace;
  color: var(--me-muted);
}
</style>
