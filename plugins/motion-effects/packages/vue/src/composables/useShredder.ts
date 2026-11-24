import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { createShredderEngine, type ShredderEngine, type ShredderItemLike } from './shredderEngine'

export interface ShredderItem extends ShredderItemLike {
  id: string | number
}

export interface ShredderConfig {
  items?: ShredderItem[]
  width?: number
  height?: number
  inset?: number
  gap?: number
  slitHeight?: number
  fallHeight?: number
  feedSpeed?: number
  bite?: number
  autoFeed?: boolean
  stripWidth?: number
  curl?: number
  autoAnimate?: boolean
  loop?: boolean
  loopAfterDelete?: boolean
  dragTilt?: number
  lift?: number
  slitColor?: string
  color?: string
  disabled?: boolean
  className?: string
  onShred?: (item: ShredderItem) => void
  onReorder?: (items: ShredderItem[]) => void
}

export interface UseShredderOptions {
  root: Ref<HTMLElement | null>
  getConfig: () => ShredderConfig
}

/**
 * 碎纸机引擎的 Vue 胶水：SFC 拥有 DOM（含 #item 插槽内容），本 composable 只负责
 * 在挂载后创建引擎、在卸载时销毁，并把引擎重排后的顺序同步回 v-for。
 *
 * 逐帧状态全在引擎的普通对象里，不进响应式；只有低频的“行顺序”是 ref。
 */
export function useShredder(options: UseShredderOptions) {
  const renderItems = ref<ShredderItem[]>(options.getConfig().items?.slice() ?? [])
  let engine: ShredderEngine | null = null
  let disposed = false
  let token = 0

  function build() {
    const current = ++token
    engine?.destroy()
    engine = null
    const cfg = options.getConfig()
    renderItems.value = (cfg.items ?? []).slice()

    // 等 Vue 把新的 v-for 节点渲染完，引擎才能读到正确的 DOM（尤其是 items 变化后）
    nextTick(() => {
      if (disposed || current !== token) return
      const root = options.root.value
      if (!root) return
      const latest = options.getConfig()
      engine = createShredderEngine({
        ...latest,
        items: latest.items ?? [],
        root,
        onOrderChange: (ids) => {
          const rank = new Map(ids.map((id, i) => [id, i] as const))
          const source = options.getConfig().items ?? []
          renderItems.value = [...source].sort(
            (a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9)
          )
        }
      })
    })
  }

  onMounted(build)
  onBeforeUnmount(() => {
    disposed = true
    engine?.destroy()
    engine = null
  })

  watch(options.getConfig, () => {
    if (!disposed) build()
  }, { deep: true })

  return { renderItems }
}
