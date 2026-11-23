# Vue 组件（0.1）

首批 3 个特效已经移植成 Vue 3 组件，并在每个详情页的「Vue 3 实装」区域直接渲染真实组件：

| 组件 | 详情页 | 测试 |
|---|---|---|
| `HoldButton` | [长按确认](/effects/hold-button) | `packages/vue/tests/hold-button.spec.ts` |
| `SwipeRow` | [滑动操作行](/effects/swipe-row) | `packages/vue/tests/swipe-row.spec.ts` |
| `SpecularButton` | [高光按钮](/effects/specular-button) | `packages/vue/tests/specular-button.spec.ts` |

## 导入

```ts
import { HoldButton, SpecularButton, SwipeRow } from '@motion-effects/vue'
import type { SwipeAction } from '@motion-effects/vue'
```

CSS 随 SFC 自动引入，不需要单独 import。

## 示例

### HoldButton

```vue
<HoldButton
  fill-color="#c8ff4d"
  fill-text-color="#10130a"
  :hold-time="1600"
  @hold="onDelete"
  @tap="onTap"
>
  Hold to delete
</HoldButton>
```

### SwipeRow

```vue
<script setup lang="ts">
import { SwipeRow } from '@motion-effects/vue'
import type { SwipeAction } from '@motion-effects/vue'

const actions: SwipeAction[] = [
  { id: 'delete', label: 'Delete' },
  { id: 'archive', label: 'Archive', color: '#2563eb' }
]
</script>

<template>
  <SwipeRow :actions="actions" @commit="onCommit">
    <div>Design review notes</div>
  </SwipeRow>
</template>
```

### SpecularButton

```vue
<SpecularButton auto-animate @click="onClick">
  Get Started
</SpecularButton>
```

## 契约与限制

完整的 props / slots / emits 见
[packages/vue/README.md](https://github.com/zardlove1991/zard-plugin-marketplace/blob/main/plugins/motion-effects/packages/vue/README.md)。

- `SwipeRow` 支持 `v-model:open`；删除行数据由父级在 `commit` 中完成。
- `SpecularButton` 无 WebGL2 时退回 CSS；上下文丢失后停止渲染，按钮仍可用。
- 三个组件都做了 SSR 安全处理，浏览器 API 只在 `onMounted` 或用户事件中访问。
- 当前是 workspace 私有包，未发布 npm；外部项目可复制 `packages/vue/src` 或等待发布。

## 本地测试

```bash
cd plugins/motion-effects
pnpm test
pnpm typecheck
pnpm check
```