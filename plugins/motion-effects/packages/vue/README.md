# @motion-effects/vue

`motion-effects` 的 Vue 3 实装包（0.1）。当前包含 3 个已完成移植并有 Vitest 覆盖的组件：

| 组件 | 说明 | 依赖 |
|---|---|---|
| `HoldButton` | 长按确认，进度填充 / 波浪 / 发光 | 无 |
| `SwipeRow` | 移动端滑动操作行，键盘可达 | `motion-v`（及其 peer `@vueuse/core`）、Hugeicons |
| `SpecularButton` | WebGL2 高光描边按钮 | 无 |

其余 17 个特效仍以 React 源码 + vanilla 演示为真源，按需按 `references/vue-porting.md` 移植。

## 使用

包内组件是源码形式（`.vue`），由使用方的 Vite 编译。需要 Vue ≥ 3.5（用到了 `useTemplateRef` / `useId`）。当前是 workspace 私有包，未发布 npm；外部项目可复制 `src/` 或等待发布。复制 `src/` 时需要安装：`motion-v` 及其 peer `@vueuse/core`、`@hugeicons/vue`、`@hugeicons/core-free-icons`。

```vue
<script setup lang="ts">
import { HoldButton, SwipeRow, SpecularButton } from '@motion-effects/vue'
import type { SwipeAction } from '@motion-effects/vue'

const actions: SwipeAction[] = [
  { id: 'delete', label: 'Delete' },
  { id: 'archive', label: 'Archive', color: '#2563eb' }
]
</script>

<template>
  <HoldButton fill-color="#c8ff4d" fill-text-color="#10130a" @hold="onDelete">
    Hold to delete
  </HoldButton>

  <SwipeRow :actions="actions" @commit="onCommit">
    <div>Design review notes</div>
  </SwipeRow>

  <SpecularButton auto-animate @click="onClick">
    Get Started
  </SpecularButton>
</template>
```

CSS 随 SFC 自动引入，不需要单独 import CSS 文件。根类名前缀分别为 `.hold-button`、`.sr-root`、`.specular-button`。

## 组件契约

### HoldButton

- props：`doneLabel`、`backgroundColor`、`fillColor`、`textColor`、`fillTextColor`、`size`（`sm` / `md` / `lg`）、`radius`、`fillDirection`（`right` / `up`）、`holdTime`、`releaseTime`、`pressScale`、`wave`、`waveAmplitude`、`glow`、`resetAfter`、`disabled`、`className`
- slots：默认、`icon`、`done-icon`
- emits：`hold`、`tap`

### SwipeRow

- props：`actions`（`SwipeAction[]`）、`actionColor`、`drawerColor`、`rowColor`、`textColor`、`height`、`radius`、`actionWidth`、`direction`（`left` / `right`）、`snapBounce`、`resistance`、`collapseMs`、`commitAt`、`fullSwipe`、`disabled`、`closeOnAction`、`haptic`、`label`、`className`
- `v-model:open` 受控展开状态；挂载时的初始值会同步，运行中修改 `actions` / `actionWidth` / `direction` 会自动重新归位
- slots：默认（行内容）
- emits：`update:open`、`open-change`、`action`、`commit`
- 主操作（第一个 action）和 `dismiss: true` 的操作会走提交路径；删除行数据由父级在 `commit` 中完成

### SpecularButton

- props：`size`（`sm` / `md` / `lg`）、`radius`、`tint`、`tintOpacity`、`blur`、`textColor`、`lineColor`、`baseColor`、`intensity`、`idleIntensity`、`shineSize`、`shineFade`、`thickness`、`glow`、`speed`、`followMouse`、`proximity`、`autoAnimate`、`disabled`、`type`、`className`
- slots：默认（按钮文案）
- emits：`click`
- 无 WebGL2 时自动退回 CSS 按钮；WebGL 上下文丢失时暂停渲染，浏览器恢复上下文后自动重建资源并恢复

## 测试

```bash
cd plugins/motion-effects
pnpm test        # Vitest
pnpm typecheck   # vue-tsc
pnpm check       # test + typecheck
```

## 已知限制

- `SpecularButton` 的恢复依赖浏览器重建 WebGL 上下文；上下文一直不恢复时只保留 CSS 兜底。
- `HoldButton` 在卸载时清理 timer / rAF / ResizeObserver。
- 三个组件都做了 SSR 安全处理：浏览器 API 只在 `onMounted` 或用户事件中访问。