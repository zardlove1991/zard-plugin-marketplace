# @motion-effects/vue

`motion-effects` 的 Vue 3 实装包（0.1）。当前包含 11 个已完成移植并有 Vitest 覆盖的组件：

| 组件 | 说明 | 依赖 |
|---|---|---|
| `HoldButton` | 长按确认，进度填充 / 波浪 / 发光 | 无 |
| `SwipeRow` | 移动端滑动操作行，键盘可达 | `motion-v`（及其 peer `@vueuse/core`）、Hugeicons |
| `SpecularButton` | WebGL2 高光描边按钮 | 无 |
| `TerminalReplay` | 终端会话逐字回放，可跳过、可循环 | 无 |
| `ScrollLockedVideoHero` | 滚动锁定视频 Hero，滚动进度驱动视频 | 无 |
| `PeakChart` | canvas 手绘辉光数据卡片：曲线描绘 / 峰值脉冲 / 数字滚动 / 周期切换 | 无 |
| `GlassyDashboard` | 玻璃质感数据看板：四视图 / 图表揭示 / 数字滚动 / 明暗主题 / CSV 导出 | `gsap`、`@lucide/vue`、`@fontsource-variable/manrope` |
| `SplashCursor` | WebGL2 流体墨迹光标：跟手拖尾 / 点击飞溅 / 彩虹渐变 / 明暗主题 | 无 |
| `Shredder` | 可拖拽碎纸机：切条卷曲飘落 / 重排 / 循环 / 键盘 shred | 无 |
| `SpotlightCard` | 光斑卡片：跟随指针的柔光 / 边缘邻近发光 / 光束形态 / 按压 flare | 无 |
| `LiquidNavbar` | 液态玻璃导航：WebGL 水体滑向当前项、点击波纹、图标小动画、合成音效；无 WebGL 时退回 CSS 水滴 | 无 |

其余 14 个特效仍以 React 源码 + vanilla 演示为真源，按需按 `references/vue-porting.md` 移植。

> `TerminalReplay`、`ScrollLockedVideoHero`、`PeakChart`、`GlassyDashboard` 和 `LiquidNavbar` 按 Vue 习惯设计：没有 `className` prop，`class` / `style` 自动透传到根元素；受控状态只走 `v-model`，不另发 `xxx-change` 事件。前三个组件仍保留 React 式的 `className` 与 `open-change`；`SplashCursor` 保留了 React 原件的 `className` / `style` props；`Shredder` 保留 React 的 `className` prop，但用 `#item` 插槽替代 `renderItem`，事件改走 `shred` / `reorder`；`SpotlightCard` 保留 `className` 与默认插槽，其余 div 属性自动透传。

## 使用

包内组件是源码形式（`.vue`），由使用方的 Vite 编译。需要 Vue ≥ 3.5（用到了 `useTemplateRef` / `useId`）。当前是 workspace 私有包，未发布 npm；外部项目可复制 `src/` 或等待发布。复制 `src/` 时需要安装：`motion-v` 及其 peer `@vueuse/core`、`@hugeicons/vue`、`@hugeicons/core-free-icons`；只用 `GlassyDashboard` 时另需 `gsap`、`@lucide/vue`、`@fontsource-variable/manrope`。

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

`LiquidNavbar` 的 `items` 里，`icon` 传 Vue 组件、`href` 有值时渲染成链接；当前项用 `v-model:active` 受控：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LiquidNavbar, NimbusIcons } from '@motion-effects/vue'
import type { LiquidNavItem } from '@motion-effects/vue'

const active = ref(0)
const items: LiquidNavItem[] = [
  { label: 'Home', href: '/', icon: NimbusIcons.home, fx: 'glow' },
  { label: 'Docs', href: '/docs', icon: NimbusIcons.globe, fx: 'spin' }
]
</script>

<template>
  <LiquidNavbar v-model:active="active" :items="items" tone="dark" sound />
</template>
```

CSS 随 SFC 自动引入，不需要单独 import CSS 文件。根类名前缀分别为 `.hold-button`、`.sr-root`、`.specular-button`、`.tr-root`、`.slvh`、`.pc-root`、`.nimbus-nav`。

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

### SplashCursor

- props：`colors`、`rainbow`、`colorSpeed`、`intensity`、`size`、`force`、`swirl`、`trail`、`momentum`、`shading`、`glow`、`quality`（`low` / `medium` / `high`）、`clickSplash`、`intro`、`contained`、`theme`（`dark` / `light`）、`zIndex`、`className`、`style`
- 零第三方依赖（纯 WebGL2 + 原生 pointer 事件）；无 WebGL2 时根元素内显示静态降级提示
- 同页最多一个实例；`contained` 时只填充父元素并只在其中响应，挂载时把父元素设为 `relative`，卸载时还原
- props 变化整体重启引擎（装饰性组件，重启代价可接受）；`webglcontextlost` 暂停渲染，浏览器恢复后自动重建 GPU 资源
- 根类名前缀 `.splash-cursor`；`prefers-reduced-motion` 下不播放入场笔触

### Shredder

- props：`items`（每行需唯一 `id`）、`width`、`height`、`inset`、`gap`、`slitHeight`、`fallHeight`、`feedSpeed`、`bite`、`autoFeed`、`stripWidth`、`curl`、`autoAnimate`、`loop`、`loopAfterDelete`、`dragTilt`、`lift`、`slitColor`、`color`、`disabled`、`className`
- 插槽：`#item`（作用域参数 `{ item, index }`），替代 React 的 `renderItem`；行内容先快照成 canvas 纹理，再切成纸带
- emits：`shred`（行通过滚轮时回传该项）、`reorder`（行落到别处后回传新顺序）
- `shred` 后需自行从 `items` 移除该项，除非开启 `loop` / `loopAfterDelete` / `autoAnimate`（这些模式要求把行一直留在列表里）
- 零第三方依赖；内联图片 / SVG 可切，跨域图片需要 CORS；父容器必须给固定宽度（组件宽度是 `min(var(--sh-w),100%)`）
- 根类名前缀 `.sh-root`；props 变化整体重建引擎；`prefers-reduced-motion` 下键盘 shred 立即完成、下落更短

### SpotlightCard

- props：`theme`（`dark` / `light`）、`spotlightColor`、`intensity`、`spotlightSize`、`softness`、`shape`（`circle` / `beam`）、`borderGlow`、`proximity`、`smoothing`、`ambient`、`flare`、`grain`、`className`
- 插槽：默认插槽放卡片内容；其余 div 属性（`class` / `style` / `id` / 事件等）自动透传到根元素
- 零第三方依赖；依赖 `color-mix` 与 `mask-composite`；`proximity` 让相邻卡片共享一团光；`theme` 只切换表面 / 边框 / 阴影与光色，正文颜色仍由内容自己决定
- 根类名前缀 `.spotlight-card`；props 变化时重建光斑设置并唤醒帧循环；`prefers-reduced-motion` 下关闭平滑 / 环境漂移、按压不 flare

### LiquidNavbar

- props：`items`（`LiquidNavItem[]`，默认 5 项：Home / Explore / Flights / Weather / Profile）、`defaultActive`、`tone`（`light` / `dark`）、`compact`、`sound`
- `v-model:active` 受控当前项；非受控时用 `defaultActive` 起步。点击条目或按左右方向键切换时触发（方向键循环，焦点跟到新项），只发 `update:active`
- `LiquidNavItem`：`label`、`href?`（有值渲染成 `<a>`，否则是 `<button type="button">`）、`icon?`（Vue 组件；放进响应式数据要 `markRaw`）、`fx?`（点击时图标的小动画：`plane` / `drop` / `spin` / `glow` / `wave` / `pop` / `none`；不传时有图标用 `pop`，没图标不播）
- `compact` 是三态：不传时 520px 以下自动收成纯图标，`true` / `false` 强制开或关
- `tone` 是水的色调：亮背景用 `light`，深色背景用 `dark`
- `sound` 打开时点击有一声合成的"叮"，不加载音频文件；浏览器要等用户手势之后才出声
- 随包导出内置图标 `NimbusIcons`（`home` / `globe` / `plane` / `drop` / `user`）和默认条目 `LIQUID_NAVBAR_ITEMS`
- 根类名前缀 `.nimbus-nav`；水体是 WebGL（1）着色器，拿不到上下文时自动退回 CSS 水滴，不用写第二套

## 与 React 原件的差异

前三个组件是 1:1 直译。后八个在移植时处理了上游的几处问题或按 Vue 习惯调整，行为上有意不同（`SplashCursor` / `Shredder` / `SpotlightCard` 的引擎是 1:1 抽取，差异只在框架胶水与 DOM 归属）：

- `TerminalReplay` 的行内标签：上游的正则要求闭合标签带名字（`[/success]`），而它的数据全用 `[/]`，所以标签从来没有被解析过，是原样打印的。这里两种闭合都认。
- `TerminalReplay` 跳过 spinner / progress 步骤时立即结束；上游会原地空转到该步骤的时长走完。
- `TerminalReplay` 在 `script` 或回放参数变化时不会自动重播（上游在 `autoplay` 下会因此重播）。需要重播时调用 `play()`，或者修改组件的 `key`。
- `TerminalReplay` 在 hold 期间重播后，紧接着的跳过点击照常生效。上游里旧一轮遗留的计时器到点时会把新一轮的唤醒入口清掉，让那一次点击失效。
- `ScrollLockedVideoHero` 运行中修改 `scrubDistance` 会直接生效；上游会让副作用重跑，视频时长归零，从此不再跟随滚动。
- `PeakChart` 没有 `className` / `style` prop（自动透传），受控周期只走 `v-model:period`，不保留 `onPeriodChange`。
- `PeakChart` 在无 canvas 2d 上下文的环境（jsdom 等）里静态显示终态：上游的 `grainTile()` 会直接抛错，这里加了守卫；数字区域也不会停在 opacity 0。
- `GlassyDashboard` 没有 `className` prop（`class` / `style` 自动透传），周期是组件内部状态、不另发 `period-change`；视图切换通过 hash 写入地址，可由浏览器前进/后退恢复。
- `GlassyDashboard` 用 `@lucide/vue` 渲染与 React 原件相同的图标名（数据层只存名称字符串，不把组件放进响应式数据）；GSAP 时间线收进 `gsap.context`，切页前 `revert`、卸载时清理；`prefers-reduced-motion` 下直接落终态。
- `GlassyDashboard` 的 `backgroundCredit` 默认值在 `backgroundImage` 等于内置 Unsplash 图时才显示；传自定义背景图需要自己传署名，`backgroundCredit` 不再接收 `undefined` 之外的特殊占位。
- `SplashCursor` 的 `contained` 父元素定位在 composable 里完成并带卸载还原（上游在两个独立 effect 里处理）；props 变化会整体重启引擎，而上游只逐帧读取最新 settings。纯装饰组件，观感一致。
- `Shredder` 由 SFC 拥有 DOM（含 `#item` 插槽内容），引擎只操作已有节点的内联样式；上游由 JSX + `renderItem` 自己建 DOM。引擎重排时同步回 Vue 的 `v-for` 顺序，逐帧状态不进响应式。
- `Shredder` 给 canvas 2D 上下文加了空值守卫（jsdom 等无 canvas 环境不抛错），并把两个 React hook 副作用（原始 DOM 创建、flushSync 顺序提交）改写成 Vue 的 `nextTick` + 命令式 DOM 重排；观感常量与原逻辑保持一致。
- `LiquidNavbar` 没有 `className` / `style` prop（自动透传），受控当前项只走 `v-model:active`，不保留 `onChange`（下标由 `v-model` 带回，条目可按它从 `items` 里取）；`icon` 从 React 节点换成 Vue 组件。
- `LiquidNavbar` 在 WebGL 上下文丢失后，浏览器恢复上下文时会重新编译着色器并继续画水体。上游调了 `preventDefault()` 让浏览器恢复上下文，却从不重新初始化，之后永远停在 CSS 水滴上。
- `LiquidNavbar` 在 `prefers-reduced-motion` 下，指针停在导航条上时帧循环会在来弯到位后停下。上游只判断"来弯是否抬着"，指针只要还在导航条上就一直空转（画面不变，但持续占用 CPU）。
- `LiquidNavbar` 的帧时间统一取 `performance.now()`，并给 dt 加了 0 的下限。上游用 rAF 的时间戳算 dt、却用 `performance.now()` 记上一帧和延迟起点；真实浏览器里两者同源，行为不变。
- `LiquidNavbar` 卸载时关闭 AudioContext 并清掉水滴图标的延时波纹；上游两处都不清理。
- `LiquidNavbar` 的折射滤镜用渲染函数生成，不写进模板。`feTurbulence` 这类原语不在 Vue 的 SVG 标签表里，写成 `<fe-turbulence>` 会被当成未解析的组件，建出来的元素名是错的，滤镜静默失效。

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
- 十一个组件都做了 SSR 安全处理：浏览器 API 只在 `onMounted` 或用户事件中访问；`LiquidNavbar` 的 `getContext` / `matchMedia` / `AudioContext` 同样如此。`GlassyDashboard` 的 `matchMedia` / `ResizeObserver` / `history` 也在挂载后才用；`SplashCursor` 的 `getContext` / `matchMedia`、`Shredder` 的 `ResizeObserver` / canvas 上下文、`SpotlightCard` 的 `matchMedia` / `IntersectionObserver` 同样只在挂载后访问。
- `GlassyDashboard` 的示例数据固定三个周期（7/30/90 天）与四视图；CSV 只在浏览器本地生成，不上传。背景图为 Unsplash 远程资源，离线时只有底色。
- `SplashCursor` 需要 WebGL2 与浮点纹理扩展；不支持时只显示静态降级提示。弱机建议 `quality="low"`，主题切到 `light` 时要配浅色背景。
- `Shredder` 的行快照依赖 `SVG foreignObject` + canvas，跨域图片会被污染；同页多实例时各自独立（引擎状态不共享）。
- `SpotlightCard` 依赖 `color-mix` 与 `mask-composite`；`grain` 用 `mix-blend-overlay`，在纯黑 / 纯白表面上颗粒偏弱，需要明显颗粒时把 `grain` 调到 0.2 以上。
- `LiquidNavbar` 的水体需要 WebGL（1）；拿不到上下文（含着色器编译失败）时退回 CSS 水滴，观感简化但没有功能损失。玻璃的折射（`backdrop-filter: url(#…)`）目前只有 Chromium 支持，其它浏览器只有模糊与提亮。移动端贴底放置时自己留出 `env(safe-area-inset-bottom)`。