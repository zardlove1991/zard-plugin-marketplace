# Vue 组件（0.1）

已有 22 个特效移植成 Vue 3 组件，详情页的预览台里直接渲染真实组件。其中 18 个（`HoldButton`、`SwipeRow`、`SpecularButton`、`TerminalReplay`、`PeakChart`、`SpotlightCard`、`LiquidNavbar`、`GlassSurface`、`AnimatedList`、`FlipCard`、`GhostCursor`、`GridMotion`、`RubberSegment`、`TiltedCard`、`Signature`、`PaperCrumple`、`ReflectiveCard`、`PillNav`）带「自定义」面板：改参数，预览实时跟着变，「代码」页签的用法片段只写出你改过的项。另外 4 个需要独占文档，放在 iframe 里加载：

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
| `GlassSurface` | [折射玻璃面板](/effects/glass-surface) | `packages/vue/tests/glass-surface.spec.ts` |
| `AnimatedList` | [动态列表](/effects/animated-list) | `packages/vue/tests/animated-list.spec.ts` |
| `FlipCard` | [3D 翻面卡片](/effects/flip-card) | `packages/vue/tests/flip-card.spec.ts` |
| `GhostCursor` | [流体光标](/effects/ghost-cursor) | `packages/vue/tests/ghost-cursor.spec.ts` |
| `GridMotion` | [动感网格墙](/effects/grid-motion) | `packages/vue/tests/grid-motion.spec.ts` |
| `RubberSegment` | [橡皮筋分段](/effects/rubber-segment) | `packages/vue/tests/rubber-segment.spec.ts` |
| `TiltedCard` | [3D 倾斜卡片](/effects/tilted-card) | `packages/vue/tests/tilted-card.spec.ts` |
| `Signature` | [手写签名](/effects/signature) | `packages/vue/tests/signature.spec.ts` |
| `PaperCrumple` | [纸张揉皱](/effects/paper-crumple) | `packages/vue/tests/paper-crumple.spec.ts` |
| `ReflectiveCard` | [金属反射卡](/effects/reflective-card) | `packages/vue/tests/reflective-card.spec.ts` |
| `PillNav` | [胶囊导航](/effects/pill-nav) | `packages/vue/tests/pill-nav.spec.ts` |

`ScrollLockedVideoHero` 会锁定所在页面的滚动，`GlassyDashboard` 是整屏工作区，`SplashCursor` 会铺满整个视口跟随光标，`Shredder` 需要一个固定宽度的父容器，四者的预览都放在 iframe 里；iframe 里跑的仍是同一个真实组件。

## 导入

```ts
import { AnimatedList, FlipCard, GhostCursor, GlassSurface, GridMotion, PaperCrumple, PillNav, ReflectiveCard, RubberSegment, Signature, TiltedCard, GlassyDashboard, HoldButton, LiquidNavbar, PeakChart, ScrollLockedVideoHero, Shredder, SpecularButton, SpotlightCard, SplashCursor, SwipeRow, TerminalReplay } from '@motion-effects/vue'
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

### GlassSurface

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { GlassSurface } from '@motion-effects/vue'

const photo = ref<HTMLImageElement | null>(null)
</script>

<template>
  <img ref="photo" src="/sunset.jpg" alt="" />
  <GlassSurface :backdrop="photo" :width="320" :height="190" :displace="0.35">
    <strong>折射玻璃面板</strong>
  </GlassSurface>
</template>
```

默认在 Chromium 走 SVG 色散折射；其它浏览器给了 `backdrop` 才走 WebGL2，两者都拿不到就退回雾面玻璃。`width` / `height` 数字按 px 处理，字符串（如 `"60%"`）原样使用；`shape` 传同源轮廓图可按 alpha 通道描出边缘发光与遮罩。

### AnimatedList

```vue
<script setup lang="ts">
import { AnimatedList } from '@motion-effects/vue'
import type { AnimatedListItem } from '@motion-effects/vue'

const items: AnimatedListItem[] = [
  { title: 'Brand assets', description: '24 files', meta: '2m' },
  { title: 'Launch hero.png', description: '2.4 MB', meta: '18m' }
]
</script>

<template>
  <AnimatedList :items="items" animation="pop" @select="onSelect">
    <template #item="{ item, selected }">
      <b>{{ item.title }}{{ selected ? ' ✓' : '' }}</b>
    </template>
  </AnimatedList>
</template>
```

`renderItem` 换成 `#item` 作用域插槽，`onItemSelect` 换成 `select` 事件。选中项跟着弹簧指示条平滑移动，悬停 / 键盘都能切换；`animation="none"` 关掉入场动画。默认图标可直接换项目图标。

### FlipCard

```vue
<script setup lang="ts">
import { FlipCard } from '@motion-effects/vue'
</script>

<template>
  <FlipCard axis="y" :width="300" :height="400">
    <template #front><strong>Front</strong></template>
    <template #back><strong>Back</strong></template>
  </FlipCard>
</template>
```

`front` / `back` 换成具名插槽，`flipped` 用 `v-model:flipped` 受控（另发 `flip-change`）。支持点击、Enter / 空格与拖拽甩动翻面；`prefers-reduced-motion` 下直接切面、不做旋转。

### GhostCursor

```vue
<script setup lang="ts">
import { GhostCursor } from '@motion-effects/vue'
</script>

<template>
  <GhostCursor color="#B497CF" :size="80" :trail-length="50" click-puff />
</template>
```

零依赖的 WebGL2 流体光标：跟手拖尾、涡流、点击爆散。整屏 fixed + `pointer-events:none`，同页只放一个；WebGL2 不可用时静默降级。弱机调低 `maxDevicePixelRatio` / `targetPixels`，亮色主题配浅色背景。

### GridMotion

```vue
<script setup lang="ts">
import { GridMotion } from '@motion-effects/vue'

const items = ['/a.jpg', { src: '/b.jpg', alt: 'B' }, 'Hello']
</script>

<template>
  <div style="height: 400px">
    <GridMotion :items="items" :rows="4" angle="-12" :spotlight="0.6" />
  </div>
</template>
```

不依赖 Tailwind（随包自带 `.gm-*` CSS）。相邻行反向漂移、指针聚光与视差；`#tile` 插槽可渲染自定义节点。父容器要有明确高度，移动端降低 `rows` / `speed`。

### RubberSegment

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RubberSegment } from '@motion-effects/vue'

const value = ref('Day')
</script>

<template>
  <RubberSegment v-model="value" :items="['Day', 'Week', 'Month']" @change="onChange" />
</template>
```

拖拽滑块越界会橡皮筋回拉，快速甩动按速度投影落点；键盘方向键 / Home / End 可达。`icon` 传 Vue 组件，`v-model` 受控并另发 `change`。

### TiltedCard

```vue
<script setup lang="ts">
import { TiltedCard, TiltedCardLayer } from '@motion-effects/vue'
</script>

<template>
  <TiltedCard image-src="/photo.jpg" caption-text="悬停看看">
    <TiltedCardLayer :depth="28"><h3>维链通</h3></TiltedCardLayer>
    <template #back><div>Back face</div></template>
  </TiltedCard>
</template>
```

指针 / 陀螺仪 / 自动漂浮三种输入自动切换，逐帧状态不进响应式。默认 / `#back` / `#overlay` 插槽分别放正面、背面与浮层；提供 `#back` 才获得按钮语义与翻面交互。

### Signature

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Signature } from '@motion-effects/vue'

const sig = ref<InstanceType<typeof Signature> | null>(null)
</script>

<template>
  <Signature ref="sig" mode="sign" name="Ada" role="Designer" />
  <button @click="sig?.undo()">撤销</button>
  <button @click="console.log(sig?.toSVG())">导出 SVG</button>
</template>
```

`play` 模式逐点写出归一化笔迹（传 `text` 写文字），`sign` 模式按住指针手写。通过 ref 暴露 `play` / `clear` / `undo` / `getStrokes` / `toSVG` / `toDataURL`，并发出 `change` / `complete` 事件。

### PaperCrumple

```vue
<script setup lang="ts">
import { PaperCrumple } from '@motion-effects/vue'
</script>

<template>
  <PaperCrumple src="/poster.jpg" :width="320" :height="400" release-behavior="creased" />
</template>
```

three.js 纸张揉皱：按住揉成团、拖拽移动、松手留折痕。通过 ref 暴露 `reset` / `cancel`，发出 `state-change` / `error`。图片需同源或 CORS；WebGL 不可用时显示静态图降级。

### ReflectiveCard

```vue
<script setup lang="ts">
import { ReflectiveCard } from '@motion-effects/vue'
</script>

<template>
  <ReflectiveCard name="Alexander Doe" video-src="/bg.mp4" :metalness="1" :warp="0.6" />
</template>
```

WebGL2 金属反射证件卡：视频 / 摄像头画面经模糊后成为环境贴图，按指针姿态反射。默认插槽可替换卡面；摄像头需 HTTPS 与授权，失败时发 `webcam-error`。无 WebGL2 时只显示 CSS 卡面。

### PillNav

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PillNav } from '@motion-effects/vue'

const active = ref('#')
const items = [
  { label: 'Home', href: '#' },
  { label: 'Work', href: '#work' }
]
</script>

<template>
  <PillNav v-model:active-href="active" :items="items" logo="/logo.svg" />
</template>
```

`v-model:activeHref` 受控当前项，另发 `item-click` / `menu-toggle`；`#logo` 插槽可替换 logo。指示条是两组弹簧状态驱动的拉伸动画，窄屏自动折叠成汉堡菜单。

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
- `GlassSurface` 的默认插槽放内容；`className` / `style` 保留为 props，其余 div 属性自动透传到根元素；`backdrop` 接受 DOM 或模板 ref，`renderer` 可强制 `auto` / `webgl` / `svg`。
- `AnimatedList` 用 `#item` 作用域插槽替代 `renderItem`、`select` 事件替代 `onItemSelect`；键盘 ↑ / ↓ / Home / End 切换、Enter 确认；`items` 很大时仍要外层分页。
- `FlipCard` 用 `#front` / `#back` 放两面内容，`flipped` 走 `v-model:flipped`，另发 `flip-change`；拖拽甩动按角速度吸附到 180° 的整数倍，reduced-motion 下直接切面。
- `GhostCursor` 零依赖、整屏 fixed；WebGL2 不可用时静默降级，弱机调低 `maxDevicePixelRatio` / `targetPixels`；上下文恢复重放引擎。
- `GridMotion` 不依赖 Tailwind（自带 `.gm-*` CSS）；节点项用 `#tile` 插槽替代 React 的 VNode item；父容器要有明确高度。
- `RubberSegment` 用 `v-model` 受控、另发 `change`；拖拽橡皮筋回弹、甩动投影落点；键盘 ↑ / ↓ / ← / → / Home / End 可达。
- `TiltedCard` 用默认 / `#back` / `#overlay` 插槽替代 React 节点 props，`v-model:flipped` 受控另发 `flip`；`TiltedCardLayer` 用 `depth` 做视差层。
- `Signature` 通过 ref 暴露 `play` / `clear` / `undo` / `getStrokes` / `toSVG` / `toDataURL`；`play` 模式逐点画示例笔迹，`sign` 模式手写；`theme="auto"` 从父背景推断明暗。
- `PaperCrumple` 通过 ref 暴露 `reset` / `cancel`，发出 `state-change` / `error`；依赖 `three`，图片需同源或 CORS，无 WebGL 时显示静态图。
- `ReflectiveCard` 用默认插槽替换卡面内容，发 `webcam-error`；WebGL2 环境反射，摄像头需 HTTPS 与授权。
- `PillNav` 用 `v-model:activeHref` 受控、另发 `item-click` / `menu-toggle`；`#logo` 插槽替换 logo 节点，窄屏自动折叠成汉堡菜单。
- 后十九个与 React 原件有几处有意的行为差异，清单见上面那份 README 的「与 React 原件的差异」。
- 二十二个组件都做了 SSR 安全处理，浏览器 API 只在 `onMounted` 或用户事件中访问。
- 当前是 workspace 私有包，未发布 npm；外部项目可复制 `packages/vue/src` 或等待发布。

## 本地测试

```bash
cd plugins/motion-effects
pnpm test
pnpm typecheck
pnpm check
```