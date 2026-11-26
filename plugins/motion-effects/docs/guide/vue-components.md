# Vue 组件（0.1）

已有 11 个特效移植成 Vue 3 组件，详情页的预览台里直接渲染真实组件。其中 7 个（`HoldButton`、`SwipeRow`、`SpecularButton`、`TerminalReplay`、`PeakChart`、`SpotlightCard`、`LiquidNavbar`）带「自定义」面板：改参数，预览实时跟着变，「代码」页签的用法片段只写出你改过的项。另外 4 个需要独占文档，放在 iframe 里加载：

| 组件 | 详情页 | 测试 |
|---|---|---|
| `HoldButton` | [长按确认](/effects/hold-button) | `packages/vue/tests/hold-button.spec.ts` |
| `SwipeRow` | [滑动操作行](/effects/swipe-row) | `packages/vue/tests/swipe-row.spec.ts` |
| `SpecularButton` | [高光按钮](/effects/specular-button) | `packages/vue/tests/specular-button.spec.ts` |
| `TerminalReplay` | [终端回放](/effects/terminal-replay) | `packages/vue/tests/terminal-replay.spec.ts` |
| `ScrollLockedVideoHero` | [滚动锁定视频](/effects/scroll-video-hero) | `packages/vue/tests/scroll-locked-video-hero.spec.ts` |
| `PeakChart` | [峰值辉光卡片](/effects/peak-chart) | `packages/vue/tests/peak-chart.spec.ts` |
| `GlassyDashboard` | [玻璃质感数据看板](/effects/glassy-dashboard) | `packages/vue/tests/glassy-dashboard.spec.ts` |
| `SplashCursor` | [流体墨迹光标](/effects/splash-cursor) | `packages/vue/tests/splash-cursor.spec.ts` |
| `Shredder` | [碎纸机](/effects/shredder) | `packages/vue/tests/shredder.spec.ts` |
| `SpotlightCard` | [光斑卡片](/effects/spotlight-card) | `packages/vue/tests/spotlight-card.spec.ts` |
| `LiquidNavbar` | [液态玻璃导航](/effects/liquid-glass-navbar) | `packages/vue/tests/liquid-navbar.spec.ts` |

`ScrollLockedVideoHero` 会锁定所在页面的滚动，`GlassyDashboard` 是整屏工作区，`SplashCursor` 会铺满整个视口跟随光标，`Shredder` 需要一个固定宽度的父容器，四者的预览都放在 iframe 里；iframe 里跑的仍是同一个真实组件。

## 导入

```ts
import { GlassyDashboard, HoldButton, LiquidNavbar, PeakChart, ScrollLockedVideoHero, Shredder, SpecularButton, SpotlightCard, SplashCursor, SwipeRow, TerminalReplay } from '@motion-effects/vue'
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

### PeakChart

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PeakChart, PEAK_CHART_SERIES } from '@motion-effects/vue'

const period = ref('Monthly')
</script>

<template>
  <PeakChart
    v-model:period="period"
    :data="PEAK_CHART_SERIES[period].data"
    :labels="PEAK_CHART_SERIES[period].labels"
    accent="#2ec99a"
    :width="360"
  />
</template>
```

canvas 手绘辉光数据卡片，零新增依赖。不传 `data` 时按当前周期用内置演示数据；`data` 变化曲线 morph，`value` 变化数字重新滚动。`width` 决定全部尺寸（高度 = width × 696/540），运行中改 `width` 会重播揭示动画。

### GlassyDashboard

```vue
<script setup lang="ts">
import { GlassyDashboard } from '@motion-effects/vue'
</script>

<template>
  <GlassyDashboard
    workspace-name="ATLAS"
    :panel-frost="12"
    initial-theme="light"
  />
</template>
```

四视图（Command / Trends / Metrics / Operations）、周期切换、明暗主题、图表 hover 读数与本地 CSV 导出。样式随 SFC 引入，不依赖 Tailwind；背景图默认取 Unsplash 远程资源，可传 `backgroundImage` / `backgroundCredit` 替换。

### SplashCursor

```vue
<script setup lang="ts">
import { SplashCursor } from '@motion-effects/vue'
</script>

<template>
  <SplashCursor rainbow :size="1" :force="1" :swirl="3" :trail="1" click-splash />
</template>
```

WebGL2 流体墨迹光标：跟随鼠标留下带涡流的拖尾，点击爆散飞溅。零第三方依赖；`rainbow` 按全色环循环，关掉则用 `colors` 调色板；`quality` 在弱机上降到 `low`；`theme="light"` 是吸收型墨迹，要配浅色背景。无 WebGL2 时显示静态降级提示，不会白屏。

### Shredder

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Shredder } from '@motion-effects/vue'

const files = ref([
  { id: 1, name: 'Harbour at dusk', size: '4.1 MB' },
  { id: 2, name: 'Studio, take two', size: '2.8 MB' }
])
</script>

<template>
  <Shredder
    :items="files"
    :width="340"
    :height="460"
    :feed-speed="180"
    :bite="18"
    @shred="files = files.filter(f => f.id !== $event.id)"
    @reorder="files = $event"
  >
    <template #item="{ item, index }">
      <div class="row">{{ index }} · {{ item.name }} · {{ item.size }}</div>
    </template>
  </Shredder>
</template>
```

把行拖到滚轮口即可切条、卷曲、飘落、淡出；拖到列表其它位置可重排，聚焦后按 Delete / Backspace 也能送入碎纸机。React 原件的 `renderItem` 在 Vue 里用 `#item` 作用域插槽替代（快照取自插槽渲染出的 DOM）。`shred` / `reorder` 只回传数据，增删由父组件完成；`loop` / `loopAfterDelete` / `autoAnimate` 打开时要把行一直留在列表里。零第三方依赖，但父容器必须给出固定宽度（否则组件 `min(var(--sh-w),100%)` 会塌陷）。

### SpotlightCard

```vue
<script setup lang="ts">
import { SpotlightCard } from '@motion-effects/vue'
</script>

<template>
  <SpotlightCard
    theme="dark"
    spotlight-color="#7aa8ff"
    :intensity="0.18"
    :spotlight-size="260"
    shape="circle"
    :grain="0.14"
  >
    <h3>Ethan Harrison</h3>
    <p>Product designer</p>
    <button>Get in touch</button>
  </SpotlightCard>
</template>
```

### LiquidNavbar

```vue
<script setup lang="ts">
import { LiquidNavbar, NimbusIcons } from '@motion-effects/vue'
import type { LiquidNavItem } from '@motion-effects/vue'

const items: LiquidNavItem[] = [
  { label: 'Home', href: '/', icon: NimbusIcons.home, fx: 'glow' },
  { label: 'Docs', href: '/docs', icon: NimbusIcons.globe, fx: 'spin' }
]
</script>

<template>
  <LiquidNavbar :items="items" tone="dark" sound />
</template>
```

亮背景用 `tone="light"`，深色背景用 `tone="dark"`；`sound` 打开时点击有一声合成的"叮"。

指针扫过卡片时打出一团柔光，边缘在靠近时被照亮。`shape="beam"` 把光从顶边打下来；`proximity` 让指针还没进入卡片就开始照亮（相邻卡片共享一团光）；`ambient` 让无指针时缓慢漂移；`flare` 在按住时膨胀变亮；`grain` 叠加胶片颗粒。零第三方依赖，主题用 `theme` 或 `--spotlight-card-surface` / `--spotlight-card-border` 覆盖。

## 契约与限制

完整的 props / slots / emits 见
[packages/vue/README.md](https://github.com/zardlove1991/zard-plugin-marketplace/blob/main/plugins/motion-effects/packages/vue/README.md)。

- `SwipeRow` 支持 `v-model:open`；删除行数据由父级在 `commit` 中完成。运行中修改 `actions` / `actionWidth` / `direction` 会自动重新归位。
- `SpecularButton` 无 WebGL2 时退回 CSS；上下文丢失时暂停渲染，浏览器恢复后自动重建。
- `TerminalReplay`、`ScrollLockedVideoHero`、`PeakChart` 和 `GlassyDashboard` 按 Vue 习惯设计：没有 `className` prop，`class` / `style` 自动透传到根元素；受控状态只走 `v-model`。
- `PeakChart` 的周期用 `v-model:period`；无 canvas 2d 上下文时静态显示终态，不白屏。
- `GlassyDashboard` 依赖 `gsap` / `@lucide/vue` / `@fontsource-variable/manrope`；`panelFrost` 夹在 0–36px，视图走 hash 路由，数据全是浏览器内样例，CSV 本地生成不上传。
- `SplashCursor` 无 WebGL2 时显示降级提示；同页最多一个实例；props 变化时整体重启引擎（装饰性组件），浏览器上下文丢失后自动重建。
- `Shredder` 用 `#item` 插槽替代 `renderItem`；行快照对跨域图片敏感（需要 CORS）；`shred` 后需自行从 `items` 移除该项，除非开启循环类 props；props 变化会整体重建引擎。
- `SpotlightCard` 用默认插槽放卡片内容；`class` / `style` 与其它 div 属性自动透传到根元素；`theme` 只切换表面 / 边框 / 阴影与光色，文字颜色仍由内容自己决定。
- `LiquidNavbar` 的当前项走 `v-model:active`；`items` 里 `href` 有值渲染成链接、`icon` 传 Vue 组件；`compact` 不传时 520px 以下自动收成纯图标；没有 WebGL 时退回 CSS 水滴。
- 后七个与 React 原件有几处有意的行为差异，清单见上面那份 README 的「与 React 原件的差异」。
- 十一个组件都做了 SSR 安全处理，浏览器 API 只在 `onMounted` 或用户事件中访问。
- 当前是 workspace 私有包，未发布 npm；外部项目可复制 `packages/vue/src` 或等待发布。

## 本地测试

```bash
cd plugins/motion-effects
pnpm test
pnpm typecheck
pnpm check
```