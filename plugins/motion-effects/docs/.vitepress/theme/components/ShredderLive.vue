<script setup lang="ts">
import { ref } from 'vue'
import { Shredder, type ShredderItem } from '@motion-effects/vue'

interface FileItem extends ShredderItem {
  id: number
  name: string
  size: string
}

const initial: FileItem[] = [
  { id: 1, name: 'Harbour at dusk', size: '4.1 MB' },
  { id: 2, name: 'Studio, take two', size: '2.8 MB' },
  { id: 3, name: 'Fog over the bay', size: '6.3 MB' },
  { id: 4, name: 'Night market', size: '3.5 MB' }
]

const files = ref<FileItem[]>(initial.map(item => ({ ...item })))
const gone = ref<Set<number>>(new Set())
const status = ref('就绪 · 拖动一行到滚轮口')

function onShred(item: ShredderItem) {
  gone.value = new Set(gone.value).add(item.id as number)
  status.value = `已 shred：${(item as FileItem).name}（onShred）`
}

function onReorder(items: ShredderItem[]) {
  files.value = items.slice() as FileItem[]
  status.value = '顺序已更新（onReorder）'
}

function reset() {
  files.value = initial.map(item => ({ ...item }))
  gone.value = new Set()
  status.value = '已重置'
}
</script>

<template>
  <div class="sh-standalone">
    <p class="sh-eyebrow">React Bits · Canvas Shredding · Vue 3</p>
    <h1>Shredder · <span>碎纸机</span></h1>
    <p class="sh-lede">拖动任意一行到下方缝隙：滚轮会夹住它，切成纸带后卷曲、飘落、淡出。拖到列表其它位置可重新排序；聚焦后按 Delete / Backspace 也能送入碎纸机。</p>

    <div class="sh-stage">
      <div class="sh-machine">
        <Shredder
          :items="files"
          :width="340"
          :height="460"
          :fall-height="140"
          :feed-speed="180"
          :bite="18"
          :strip-width="10"
          :curl="1"
          @shred="onShred"
          @reorder="onReorder"
        >
          <template #item="{ item }">
            <div class="sh-row">
              <span>{{ (item as FileItem).name }}</span>
              <span class="sh-row__size">{{ (item as FileItem).size }}</span>
            </div>
          </template>
        </Shredder>
      </div>

      <div class="sh-side">
        <section class="sh-panel">
          <h2>文件列表（onShred / onReorder）</h2>
          <ul class="sh-files">
            <li v-for="file in files" :key="file.id" :class="{ 'is-gone': gone.has(file.id) }">
              <span>{{ file.name }}</span>
              <span class="sh-files__meta">{{ file.size }}</span>
            </li>
          </ul>
          <p class="sh-status">{{ status }}</p>
        </section>

        <section class="sh-panel">
          <h2>说明</h2>
          <p class="sh-note">零第三方依赖：行内容先快照为 canvas 纹理，再用 2D canvas 逐条绘制纸带。内联图片 / SVG 也能切，跨域图片需要 CORS。事件由 Vue <code>emit</code> 回传，列表增删完全由外部状态控制。</p>
          <button class="sh-reset" type="button" @click="reset">重置所有行</button>
        </section>
      </div>
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

.sh-standalone {
  min-block-size: 100svh;
  padding: 36px 28px 56px;
  color: #e9f0ff;
  background:
    radial-gradient(900px 600px at 12% 0%, rgba(79, 140, 255, 0.14), transparent 70%),
    #070b16;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
}

.sh-eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #8ea6d4;
}

.sh-standalone h1 {
  margin: 0 0 10px;
  font-size: clamp(28px, 5vw, 46px);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.sh-standalone h1 span {
  color: #7aa8ff;
}

.sh-lede {
  margin: 0 0 26px;
  max-inline-size: 640px;
  color: #a9bad8;
  font-size: 14px;
  line-height: 1.65;
}

.sh-stage {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  align-items: flex-start;
}

.sh-machine {
  flex: 0 0 auto;
  inline-size: 376px;
  padding: 18px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  border-radius: 20px;
  background: rgba(15, 20, 34, 0.72);
}

.sh-side { flex: 1 1 280px; min-inline-size: 260px; }
.sh-panel {
  padding: 16px 18px;
  margin-bottom: 14px;
  border: 1px solid rgba(160, 190, 255, 0.16);
  border-radius: 14px;
  background: rgba(15, 20, 34, 0.6);
}
.sh-panel h2 { margin: 0 0 12px; font-size: 13px; letter-spacing: 0.04em; color: #cfe0ff; }

.sh-files { margin: 0; padding: 0; list-style: none; }
.sh-files li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  margin-bottom: 6px;
  border: 1px solid rgba(160, 190, 255, 0.12);
  border-radius: 9px;
  background: rgba(30, 41, 66, 0.55);
  font-size: 13px;
}
.sh-files li.is-gone { opacity: 0.35; text-decoration: line-through; }
.sh-files__meta { color: #8ea6d4; font-variant-numeric: tabular-nums; }
.sh-status { margin: 12px 0 0; min-height: 20px; font-size: 12px; color: #8fd6bf; }
.sh-note { margin: 0; font-size: 12px; line-height: 1.65; color: #a9bad8; }
.sh-note code { color: #cfe0ff; }

.sh-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 54px;
  padding: 10px 14px;
  border: 1px solid rgba(160, 190, 255, 0.18);
  border-radius: 11px;
  background: linear-gradient(180deg, #1e2942, #182137);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  font-size: 13px;
}
.sh-row__size { color: #8ea6d4; font-variant-numeric: tabular-nums; font-size: 12px; }

.sh-reset {
  margin-top: 14px;
  padding: 8px 14px;
  border: 1px solid rgba(160, 190, 255, 0.24);
  border-radius: 8px;
  color: #e8ecf5;
  background: rgba(120, 150, 255, 0.08);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
</style>
