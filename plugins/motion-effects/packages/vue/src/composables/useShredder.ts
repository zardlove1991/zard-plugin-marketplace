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
 * 配置变化时只调用 engine.sync() 原地更新（对齐 React 每次 render 重算 cfg.current），
 * **不重建引擎**：重建会打断在途的拖拽回位 / 进给动画，导致行被卡在容器外。
 * 只有 items 增删（key 集合变化）才需要让 Vue 重渲染后再 sync。
 *
 * 逐帧状态全在引擎的普通对象里，不进响应式；只有低频的“行顺序”是 ref。
 */
export function useShredder(options: UseShredderOptions) {
  const renderItems = ref<ShredderItem[]>(options.getConfig().items?.slice() ?? [])
  let engine: ShredderEngine | null = null
  let disposed = false
  let keySignature = ''

  const signature = (items: ShredderItem[] | undefined) => (items ?? []).map(item => item.id).join('|')

  function build() {
    const cfg = options.getConfig()
    keySignature = signature(cfg.items)
    renderItems.value = (cfg.items ?? []).slice()
    nextTick(() => {
      if (disposed) return
      const root = options.root.value
      if (!root || engine) return
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
    if (disposed) return
    const latest = options.getConfig()
    const nextSig = signature(latest.items)
    if (!engine) {
      // 还没挂载完成（build 的 nextTick 未跑）：直接让 build 用最新配置创建
      build()
      return
    }
    if (nextSig !== keySignature) {
      // items 增删：先让 Vue 渲染出新的 key 集合，再同步引擎并重绑监听器
      keySignature = nextSig
      renderItems.value = (latest.items ?? []).slice()
      nextTick(() => { if (!disposed) engine?.sync(latest) })
      return
    }
    // 纯配置变化 / 重排序回传：原地更新，保住在途动画
    engine.sync(latest)
  }, { deep: true })

  return { renderItems }
}
