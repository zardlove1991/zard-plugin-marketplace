<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch } from 'vue'
import { fanSlot, hashString, rng } from '../composables/glassFolderArt'
import {
  BACK_PATH, FRONT_H, FRONT_PATH, H, HEADROOM, MAX_VISIBLE,
  SAMPLE_FILES, SHEET_H, SHEET_W, W
} from '../composables/glassFolderConstants'
import GlassFolderArtCanvas from './GlassFolderArtCanvas.vue'
import type {
  GlassFolderArt, GlassFolderArtPreset, GlassFolderFile, GlassFolderMenuItem
} from '../types'

interface Props {
  label?: string
  meta?: string
  tone?: 'light' | 'dark'
  art?: GlassFolderArt
  seed?: number
  image?: string
  files?: GlassFolderFile[]
  action?: 'add' | 'more' | 'none'
  onAdd?: (files: GlassFolderFile[]) => GlassFolderFile | void
  onFilesChange?: (files: GlassFolderFile[]) => void
  menu?: GlassFolderMenuItem[]
  labelPlacement?: 'bottom-left' | 'top-left' | 'top-right'
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onFileSelect?: (file: GlassFolderFile, index: number) => void
  width?: number
  appear?: boolean
  appearDelay?: number
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  label: 'My Files',
  meta: undefined,
  tone: 'light',
  art: 'aurora',
  seed: 3,
  image: undefined,
  files: () => SAMPLE_FILES,
  action: 'add',
  onAdd: undefined,
  onFilesChange: undefined,
  menu: () => [],
  labelPlacement: 'bottom-left',
  open: undefined,
  defaultOpen: false,
  onOpenChange: undefined,
  onFileSelect: undefined,
  width: 340,
  appear: true,
  appearDelay: 0,
  className: '',
  style: () => ({})
})

const emit = defineEmits<{
  'files-change': [files: GlassFolderFile[]]
  'open-change': [open: boolean]
  'file-select': [file: GlassFolderFile, index: number]
}>()

const uid = useId().replace(/:/g, '')
const root = useTemplateRef<HTMLElement>('root')
const filesEl = useTemplateRef<HTMLElement>('filesEl')
const hit = useTemplateRef<HTMLButtonElement>('hit')
const keyButton = useTemplateRef<HTMLButtonElement>('keyButton')
const menuEl = useTemplateRef<HTMLElement>('menuEl')

const files = ref<GlassFolderFile[]>(props.files.slice())
const nextId = ref(props.files.length)
const ids = ref<number[]>(props.files.map((_, i) => i))
const dropped = ref<number | null>(null)
const bump = ref(0)
const innerOpen = ref(props.defaultOpen)
const open = computed(() => props.open ?? innerOpen.value)
const menuOpen = ref(false)
const entered = ref(!props.appear)

const k = computed(() => props.width / W)
const density = computed(() =>
  Math.min(1.5, Math.max(1, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)) * k.value
)
const start = computed(() => Math.max(0, files.value.length - MAX_VISIBLE))
const visible = computed(() => files.value.slice(start.value))
const count = computed(() => files.value.length)
const metaLine = computed(() => props.meta ?? `${count.value}${count.value === 1 ? ' item' : ' items'}`)
const menuItems = computed<GlassFolderMenuItem[]>(() => [
  { label: open.value ? 'Close folder' : 'Open folder', onSelect: () => setOpen(!open.value) },
  ...props.menu
])

function setOpen(next: boolean) {
  if (props.open === undefined) innerOpen.value = next
  props.onOpenChange?.(next)
  emit('open-change', next)
}
function addFile() {
  const made = props.onAdd?.(files.value)
  const file: GlassFolderFile = made || { name: `Untitled ${files.value.length + 1}`, meta: 'Just now' }
  const next = [...files.value, file]
  const id = nextId.value++
  ids.value = [...ids.value, id]
  files.value = next
  dropped.value = id
  bump.value += 1
  props.onFilesChange?.(next)
  emit('files-change', next)
}
function onSheetAnimationEnd(id: number) {
  if (dropped.value === id) dropped.value = null
}
function chooseFile(file: GlassFolderFile, index: number) {
  props.onFileSelect?.(file, index)
  emit('file-select', file, index)
}
function toggleOpen() {
  menuOpen.value = false
  setOpen(!open.value)
}
function onMenuKey(event: KeyboardEvent) {
  const items = Array.from(menuEl.value?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [])
  const at = items.indexOf(document.activeElement as HTMLElement)
  const go = (i: number) => {
    event.preventDefault()
    items[(i + items.length) % items.length]?.focus()
  }
  if (event.key === 'ArrowDown') go(at + 1)
  else if (event.key === 'ArrowUp') go(at - 1)
  else if (event.key === 'Home') go(0)
  else if (event.key === 'End') go(items.length - 1)
  else if (event.key === 'Tab') menuOpen.value = false
}
function selectMenuItem(item: GlassFolderMenuItem) {
  menuOpen.value = false
  keyButton.value?.focus()
  item.onSelect?.()
}

onMounted(() => {
  if (!props.appear) return
  const element = root.value
  if (!element || typeof IntersectionObserver === 'undefined') {
    entered.value = true
    return
  }
  let timer = 0
  const io = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return
    io.disconnect()
    timer = window.setTimeout(() => { entered.value = true }, props.appearDelay)
  }, { threshold: 0.25 })
  io.observe(element)
  cleanupEntrance = () => { io.disconnect(); window.clearTimeout(timer) }
})
let cleanupEntrance: (() => void) | null = null

onMounted(() => {
  const element = root.value
  if (!element) return
  let raf = 0
  let px = 0
  let py = 0
  const write = () => {
    raf = 0
    element.style.setProperty('--gf-px', px.toFixed(3))
    element.style.setProperty('--gf-py', py.toFixed(3))
  }
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    const rect = element.getBoundingClientRect()
    px = ((event.clientX - rect.left) / rect.width) * 2 - 1
    py = ((event.clientY - rect.top) / rect.height) * 2 - 1
    if (!raf) raf = requestAnimationFrame(write)
  }
  const leave = () => { px = 0; py = 0; if (!raf) raf = requestAnimationFrame(write) }
  element.addEventListener('pointermove', move)
  element.addEventListener('pointerleave', leave)
  cleanupPointer = () => {
    element.removeEventListener('pointermove', move)
    element.removeEventListener('pointerleave', leave)
    cancelAnimationFrame(raf)
  }
})
let cleanupPointer: (() => void) | null = null

onMounted(() => {
  filesEl.value?.toggleAttribute('inert', !open.value)
})
watch(open, value => filesEl.value?.toggleAttribute('inert', !value))

onMounted(() => {
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    if (menuOpen.value) {
      menuOpen.value = false
      keyButton.value?.focus()
    } else {
      setOpen(false)
      hit.value?.focus()
    }
  }
  const onDown = (event: PointerEvent) => {
    const target = event.target as Node
    if (menuOpen.value && !menuEl.value?.contains(target) && !keyButton.value?.contains(target)) menuOpen.value = false
    if (open.value && !menuOpen.value && !root.value?.contains(target)) setOpen(false)
  }
  document.addEventListener('keydown', onKey)
  document.addEventListener('pointerdown', onDown)
  cleanupDoc = () => {
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('pointerdown', onDown)
  }
})
let cleanupDoc: (() => void) | null = null

watch(menuOpen, value => {
  if (value) menuEl.value?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
})

onBeforeUnmount(() => {
  cleanupEntrance?.()
  cleanupPointer?.()
  cleanupDoc?.()
})

const stageStyle = computed(() => ({
  transform: `translateY(${HEADROOM * k.value}px) scale(${k.value})`
}))
const rootStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${(H + HEADROOM) * k.value}px`,
  ...props.style
}))
const sheetStyle = (v: number, id: number, file: GlassFolderFile) => {
  const slot = fanSlot(v, visible.value.length)
  const jitter = rng(hashString(file.name) + id)
  return {
    '--gf-slot': slot as never,
    '--gf-depth': visible.value.length - 1 - v as never,
    '--gf-jx': `${((jitter() - 0.5) * 10).toFixed(2)}px`,
    '--gf-jr': `${((jitter() - 0.5) * 3.2).toFixed(2)}deg`,
    zIndex: v + 1
  }
}
</script>

<template>
  <div
    ref="root"
    :class="['gf-root', className].filter(Boolean)"
    :data-tone="tone"
    :data-open="open ? '' : undefined"
    :data-entered="entered ? '' : undefined"
    :data-place="labelPlacement"
    :style="rootStyle"
  >
    <div class="gf-stage" :style="stageStyle">
      <div class="gf-tilt">
        <div class="gf-shadow" aria-hidden="true" />

        <div class="gf-back" :style="{ clipPath: `path('${BACK_PATH}')` }" aria-hidden="true">
          <img v-if="image" class="gf-art" :src="image" alt="" :width="W + 24" :height="H + 24" draggable="false" />
          <GlassFolderArtCanvas
            v-else-if="art !== 'none'"
            class="gf-art"
            :art="art as GlassFolderArtPreset"
            :seed="seed"
            :w="W + 24"
            :h="H + 24"
            :density="density"
            :priority="0"
          />
          <div class="gf-back-sheen" />
        </div>
        <svg class="gf-rim gf-back-rim" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true"><path :d="BACK_PATH" /></svg>

        <div :key="bump" :class="['gf-front', bump ? 'gf-front--bump' : '']" :style="{ clipPath: `path('${FRONT_PATH}')` }">
          <div class="gf-tint" aria-hidden="true" />
          <div class="gf-spec" aria-hidden="true" />
          <svg class="gf-rim gf-front-rim" :viewBox="`0 0 ${W} ${FRONT_H}`" aria-hidden="true">
            <defs>
              <linearGradient :id="`gf-rim-${uid}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#fff" stop-opacity="0.95" />
                <stop offset="0.35" stop-color="#fff" stop-opacity="0.35" />
                <stop offset="1" stop-color="#fff" stop-opacity="0.12" />
              </linearGradient>
            </defs>
            <path :d="FRONT_PATH" :stroke="`url(#gf-rim-${uid})`" />
          </svg>
          <button
            ref="hit"
            type="button"
            class="gf-hit"
            :aria-expanded="open"
            :aria-label="`${open ? 'Close ' : 'Open '}${label}, ${count}${count === 1 ? ' item' : ' items'}`"
            @click="toggleOpen"
          />
          <div class="gf-label">
            <span class="gf-title">{{ label }}</span>
            <span :key="metaLine" class="gf-meta">{{ metaLine }}</span>
          </div>
        </div>

        <div ref="filesEl" class="gf-files" role="list" :aria-label="`${label} contents`">
          <div v-for="(file, v) in visible" :key="ids[start + v]" role="listitem" class="gf-sheet-slot">
            <component
              :is="file.href ? 'a' : 'button'"
              :href="file.href"
              :type="file.href ? undefined : 'button'"
              :class="[
                'gf-sheet',
                (file.art || file.image) ? 'gf-sheet--art' : '',
                ids[start + v] === dropped ? 'gf-sheet--drop' : ''
              ]"
              :style="sheetStyle(v, ids[start + v]!, file)"
              @animationend="onSheetAnimationEnd(ids[start + v] ?? -1)"
              @click="chooseFile(file, start + v)"
            >
              <img v-if="file.image" class="gf-sheet-art" :src="file.image" alt="" :width="SHEET_W" :height="SHEET_H" draggable="false" />
              <GlassFolderArtCanvas
                v-else-if="file.art"
                class="gf-sheet-art"
                :art="file.art as GlassFolderArtPreset"
                :seed="hashString(file.name) % 997"
                :w="SHEET_W"
                :h="SHEET_H"
                :density="Math.min(density, 1.25)"
                :priority="1"
              />
              <span v-else class="gf-lines" aria-hidden="true">
                <i style="width: 86%" /><i style="width: 92%" /><i style="width: 64%" /><i style="width: 88%" /><i style="width: 42%" />
              </span>
              <span class="gf-sheet-head">
                <span class="gf-sheet-name">{{ file.name }}</span>
                <span v-if="file.meta" class="gf-sheet-meta">{{ file.meta }}</span>
              </span>
            </component>
          </div>
        </div>

        <button
          v-if="action !== 'none'"
          ref="keyButton"
          type="button"
          :class="['gf-key', `gf-key--${action}`]"
          :aria-label="action === 'add' ? `Add a file to ${label}` : `More options for ${label}`"
          :aria-haspopup="action === 'more' ? 'menu' : undefined"
          :aria-expanded="action === 'more' ? menuOpen : undefined"
          :aria-controls="action === 'more' ? `gf-menu-${uid}` : undefined"
          @click="action === 'add' ? addFile() : menuOpen = !menuOpen"
        >
          <svg v-if="action === 'add'" :key="bump" class="gf-glyph gf-glyph--plus" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4.5v15M4.5 12h15" />
          </svg>
          <svg v-else class="gf-glyph gf-glyph--more" viewBox="0 0 30 12" aria-hidden="true">
            <rect x="1" y="1.5" width="8" height="9" rx="3.4" />
            <rect x="11" y="1.5" width="8" height="9" rx="3.4" />
            <rect x="21" y="1.5" width="8" height="9" rx="3.4" />
          </svg>
        </button>

        <div
          v-if="action === 'more'"
          :id="`gf-menu-${uid}`"
          ref="menuEl"
          role="menu"
          :aria-label="`${label} options`"
          class="gf-menu"
          :data-open="menuOpen ? '' : undefined"
          @keydown="onMenuKey"
        >
          <button
            v-for="(item, i) in menuItems"
            :key="`${item.label}-${i}`"
            type="button"
            role="menuitem"
            :tabindex="menuOpen ? -1 : undefined"
            :disabled="!menuOpen"
            :class="['gf-menu-item', item.danger ? 'gf-menu-item--danger' : '']"
            @click="selectMenuItem(item)"
          >{{ item.label }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./GlassFolder.css"></style>
