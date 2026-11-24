# Vue 组件（0.1）

已有 5 个特效移植成 Vue 3 组件，并在每个详情页的「Vue 3 实装」区域直接渲染真实组件：

| 组件 | 详情页 | 测试 |
|---|---|---|
| `HoldButton` | [长按确认](/effects/hold-button) | `packages/vue/tests/hold-button.spec.ts` |
| `SwipeRow` | [滑动操作行](/effects/swipe-row) | `packages/vue/tests/swipe-row.spec.ts` |
| `SpecularButton` | [高光按钮](/effects/specular-button) | `packages/vue/tests/specular-button.spec.ts` |
| `TerminalReplay` | [终端回放](/effects/terminal-replay) | `packages/vue/tests/terminal-replay.spec.ts` |
| `ScrollLockedVideoHero` | [滚动锁定视频](/effects/scroll-video-hero) | `packages/vue/tests/scroll-locked-video-hero.spec.ts` |

`ScrollLockedVideoHero` 会锁定所在页面的滚动，所以它的预览放在 iframe 里；iframe 里跑的仍是同一个真实组件。

## 导入

```ts
import { HoldButton, ScrollLockedVideoHero, SpecularButton, SwipeRow, TerminalReplay } from '@motion-effects/vue'
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

### TerminalReplay

```vue
<TerminalReplay @complete="onComplete" />
```

挂载即开始播放。点击或按回车 / 空格：播放中跳过当前步骤，播完后重播。通过 ref 调 `play()` 可以手动重播。

### ScrollLockedVideoHero

```vue
<ScrollLockedVideoHero video-src="/hero.mp4" title="THE CITY OPENS" :scrub-distance="3200" />
```

**挂载期间页面无法滚动，而且不会自行解锁。** 只放在独占一页的首屏，或用 iframe 承载。

## 契约与限制

完整的 props / slots / emits 见
[packages/vue/README.md](https://github.com/zardlove1991/zard-plugin-marketplace/blob/main/plugins/motion-effects/packages/vue/README.md)。

- `SwipeRow` 支持 `v-model:open`；删除行数据由父级在 `commit` 中完成。运行中修改 `actions` / `actionWidth` / `direction` 会自动重新归位。
- `SpecularButton` 无 WebGL2 时退回 CSS；上下文丢失时暂停渲染，浏览器恢复后自动重建。
- `TerminalReplay` 和 `ScrollLockedVideoHero` 按 Vue 习惯设计：没有 `className` prop，`class` / `style` 自动透传到根元素。
- 后两个与 React 原件有几处有意的行为差异，清单见上面那份 README 的「与 React 原件的差异」。
- 五个组件都做了 SSR 安全处理，浏览器 API 只在 `onMounted` 或用户事件中访问。
- 当前是 workspace 私有包，未发布 npm；外部项目可复制 `packages/vue/src` 或等待发布。

## 本地测试

```bash
cd plugins/motion-effects
pnpm test
pnpm typecheck
pnpm check
```