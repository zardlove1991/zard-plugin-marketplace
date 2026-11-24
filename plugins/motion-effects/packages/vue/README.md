# @motion-effects/vue

`motion-effects` 的 Vue 3 实装包（0.1）。当前包含 6 个已完成移植并有 Vitest 覆盖的组件：

| 组件 | 说明 | 依赖 |
|---|---|---|
| `HoldButton` | 长按确认，进度填充 / 波浪 / 发光 | 无 |
| `SwipeRow` | 移动端滑动操作行，键盘可达 | `motion-v`（及其 peer `@vueuse/core`）、Hugeicons |
| `SpecularButton` | WebGL2 高光描边按钮 | 无 |
| `TerminalReplay` | 终端会话逐字回放，可跳过、可循环 | 无 |
| `ScrollLockedVideoHero` | 滚动锁定视频 Hero，滚动进度驱动视频 | 无 |
| `PeakChart` | canvas 手绘辉光数据卡片：曲线描绘 / 峰值脉冲 / 数字滚动 / 周期切换 | 无 |

其余 15 个特效仍以 React 源码 + vanilla 演示为真源，按需按 `references/vue-porting.md` 移植。

> `TerminalReplay`、`ScrollLockedVideoHero` 和 `PeakChart` 按 Vue 习惯设计：没有 `className` prop，`class` / `style` 自动透传到根元素；受控状态只走 `v-model`，不另发 `xxx-change` 事件。前三个组件仍保留 React 式的 `className` 与 `open-change`。

## 使用

包内组件是源码形式（`.vue`），由使用方的 Vite 编译。需要 Vue ≥ 3.5（用到了 `useTemplateRef` / `useId`）。当前是 workspace 私有包，未发布 npm；外部项目可复制 `src/` 或等待发布。复制 `src/` 时需要安装：`motion-v` 及其 peer `@vueuse/core`、`@hugeicons/vue`、`@hugeicons/core-free-icons`。

```vue
<script setup lang="ts">
import { HoldButton, SwipeRow, SpecularButton, TerminalReplay } from '@motion-effects/vue'
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

  <TerminalReplay @complete="onComplete" />
</template>
```

`ScrollLockedVideoHero` 在挂载期间会锁住页面滚动，不要和其它内容放在同一页：

```vue
<ScrollLockedVideoHero video-src="/hero.mp4" title="THE CITY OPENS" :scrub-distance="3200" />
```

`PeakChart` 不传 `data` 时按当前周期使用内置演示数据（随包导出 `PEAK_CHART_SERIES` / `MONTH_DATA`）；传 `v-model:period` 即受控，在父级换 `data` 即可让曲线 morph：

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

CSS 随 SFC 自动引入，不需要单独 import CSS 文件。根类名前缀分别为 `.hold-button`、`.sr-root`、`.specular-button`、`.tr-root`、`.slvh`、`.pc-root`。

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

### TerminalReplay

- props：`script`（`TerminalStep[]`，默认是随包导出的 `PROJECT_SETUP_SCRIPT`）、`title`、`prompt`、`directory`、`chrome`（`window` / `minimal` / `none`）、`frame`（`solid` / `inset`）、`dots`（`mono` / `color`）、`theme`（`auto` / `light` / `dark`）、`accentColor`、`windowColor`、`textColor`、`fontFamily`、`fontSize`、`lineHeight`、`height`、`radius`、`typingSpeed`、`variance`、`lineDelay`、`startDelay`、`hold`、`loop`、`autoplay`、`cursor`、`copyable`、`interactive`
- emits：`complete`
- 通过 ref 暴露 `play()`，用于从头重播
- 挂载即开始播放；`autoplay` 只决定离开视口时是否暂停。点击或按回车 / 空格：播放中跳过当前步骤，播完后重播
- 文本里的行内标签 `[success]`、`[error]`、`[warning]`、`[info]`、`[accent]`、`[muted]`、`[dim]`、`[bold]` 渲染成带颜色的文本，闭合可以写 `[/]` 或 `[/success]`；内容按纯文本处理，不经过 `innerHTML`

### ScrollLockedVideoHero

- props：`videoSrc`、`title`、`scrollHint`、`tagline`（空字符串不渲染）、`signature`（`{ name, url }`，传 `false` 不显示）、`scrubDistance`
- 滚轮和触摸只用来在正反两个方向上推拉视频。`prefers-reduced-motion` 下不做动画，直接停在接近结尾的一帧
- **挂载期间页面无法滚动，而且不会自行解锁**（上游实现如此）。只放在独占一页的首屏，或用 iframe 承载

### PeakChart

- props：`data`、`labels`、`value`、`valueSuffix`、`decimals`、`title`、`caption`、`updatedText`、`trend`（`up` / `down` / `none`）、`periods`、`defaultPeriod`、`accent`、`width`、`loop`、`backdrop`、`formatValue`、`font`
- `v-model:period` 受控周期；非受控时用 `defaultPeriod` 起步，选择后组件自持。只发 `update:period`，不另发 `period-change`
- 不传 `data` 时按当前周期取 `PEAK_CHART_SERIES` 的内置数据；`data` 变化曲线 morph，`value` 变化数字重新滚动
- `accent` 偏离参考蓝（`#4f8ef7`）时，画布整体做色相 / 饱和度偏移；`width` 决定一切尺寸（高度 = width × 696/540）
- `loop` > 0 时按秒循环揭示；0 表示滚入视口播一次后静息呼吸。hover 期间静息窗口会暂停时钟
- 周期下拉保留 `listbox` / `option` 语义、Escape 关闭并回焦、外部按下关闭
- 无 canvas 2d 上下文时静态显示终态数字与文案，不白屏

## 与 React 原件的差异

前三个组件是 1:1 直译。后三个在移植时处理了上游的几处问题或按 Vue 习惯调整，行为上有意不同：

- `TerminalReplay` 的行内标签：上游的正则要求闭合标签带名字（`[/success]`），而它的数据全用 `[/]`，所以标签从来没有被解析过，是原样打印的。这里两种闭合都认。
- `TerminalReplay` 跳过 spinner / progress 步骤时立即结束；上游会原地空转到该步骤的时长走完。
- `TerminalReplay` 在 `script` 或回放参数变化时不会自动重播（上游在 `autoplay` 下会因此重播）。需要重播时调用 `play()`，或者修改组件的 `key`。
- `TerminalReplay` 在 hold 期间重播后，紧接着的跳过点击照常生效。上游里旧一轮遗留的计时器到点时会把新一轮的唤醒入口清掉，让那一次点击失效。
- `ScrollLockedVideoHero` 运行中修改 `scrubDistance` 会直接生效；上游会让副作用重跑，视频时长归零，从此不再跟随滚动。
- `PeakChart` 没有 `className` / `style` prop（自动透传），受控周期只走 `v-model:period`，不保留 `onPeriodChange`。
- `PeakChart` 在无 canvas 2d 上下文的环境（jsdom 等）里静态显示终态：上游的 `grainTile()` 会直接抛错，这里加了守卫；数字区域也不会停在 opacity 0。

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
- `ScrollLockedVideoHero` 没有 poster：视频数据加载前显示深色背景和标题。
- `TerminalReplay` 的无障碍文案、复制按钮标题和默认脚本沿用上游的写法，没有做本地化。
- `PeakChart` 运行中修改 `width` 会重建画布并重播揭示动画（上游 effect 依赖 `[width, u]` 的语义）；`fontStretch` 的实际效果随平台字体支持变化。
- 六个组件都做了 SSR 安全处理：浏览器 API 只在 `onMounted` 或用户事件中访问。