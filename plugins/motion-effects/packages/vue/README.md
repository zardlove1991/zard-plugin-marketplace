# @motion-effects/vue

`motion-effects` 的 Vue 3 实装包（0.1）。当前包含 22 个已完成移植并有 Vitest 覆盖的组件：

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
| `GlassSurface` | 折射玻璃面板：SVG 色散折射 / WebGL2 双路径，按形状描边发光，无 GPU 时退回雾面玻璃 | 无 |
| `AnimatedList` | 动态列表：逐项入场 / 悬停高亮 / 键盘导航、跟随选中项的弹簧指示条、滚动渐隐 | Hugeicons（仅默认项图标） |
| `FlipCard` | 3D 翻面卡片：拖拽甩动翻面、悬停倾斜与眩光、键盘可达 | `motion-v`（及其 peer `@vueuse/core`） |
| `GhostCursor` | WebGL2 流体光标拖尾：跟手、涡流、点击爆散，整屏氛围层 | 无 |
| `GridMotion` | 动感网格墙：倾斜滚动的图片 / 文字墙、聚光、视差与边缘羽化 | 无（不依赖 Tailwind） |
| `RubberSegment` | 橡皮筋分段控件：拖拽滑块、弹性回弹、甩动切换、键盘可达 | `motion-v`（及其 peer `@vueuse/core`） |
| `TiltedCard` | 3D 倾斜卡片：指针 / 陀螺仪 / 自动漂浮、聚光、视差层、翻面与跟随提示 | 无 |
| `Signature` | 手写签名：播放示例笔迹 / 手写输入 / 撤销清除 / 导出 SVG 与 PNG | 无 |
| `PaperCrumple` | three.js 纸张揉皱：按住揉成团 / 拖拽移动 / 键盘操作 / 折痕残留 | `three` |
| `ReflectiveCard` | 金属反射证件卡：WebGL2 环境反射 / 倾斜眩光 / 可选摄像头反射 | Hugeicons（内置内容） |
| `PillNav` | 胶囊导航：弹簧滑动指示条 / 悬停填充 / 窄屏折叠菜单 | Hugeicons（仅项目图标） |

其余 3 个特效仍以 React 源码 + vanilla 演示为真源，按需按 `references/vue-porting.md` 移植。

> `TerminalReplay`、`ScrollLockedVideoHero`、`PeakChart`、`GlassyDashboard` 和 `LiquidNavbar` 按 Vue 习惯设计：没有 `className` prop，`class` / `style` 自动透传到根元素；受控状态只走 `v-model`，不另发 `xxx-change` 事件。前三个组件仍保留 React 式的 `className` 与 `open-change`；`SplashCursor` / `GlassSurface` / `AnimatedList` 保留了 React 原件的 `className` / `style` props；`Shredder` 保留 React 的 `className` prop，但用 `#item` 插槽替代 `renderItem`，事件改走 `shred` / `reorder`；`SpotlightCard` 保留 `className` 与默认插槽，其余 div 属性自动透传。

## 使用

包内组件是源码形式（`.vue`），由使用方的 Vite 编译。需要 Vue ≥ 3.5（用到了 `useTemplateRef` / `useId`）。当前是 workspace 私有包，未发布 npm；外部项目可复制 `src/` 或等待发布。复制 `src/` 时需要安装：`motion-v` 及其 peer `@vueuse/core`、`@hugeicons/vue`、`@hugeicons/core-free-icons`、`three`；只用 `GlassyDashboard` 时另需 `gsap`、`@lucide/vue`、`@fontsource-variable/manrope`。

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

`GlassSurface` 是容器组件：背后的画面决定折射效果，`backdrop` 传图片 / 视频 / canvas 元素（或其模板 ref）才会走 WebGL2 路径。Chromium 上默认走 SVG 滤镜折射：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { GlassSurface } from '@motion-effects/vue'

const photo = ref<HTMLImageElement | null>(null)
</script>

<template>
  <img ref="photo" src="/sunset.jpg" alt="" />
  <GlassSurface :backdrop="photo" :width="320" :height="190" :displace="0.35" :background-opacity="0.08">
    <strong>折射玻璃面板</strong>
  </GlassSurface>
</template>
```

CSS 随 SFC 自动引入，不需要单独 import CSS 文件。根类名前缀分别为 `.hold-button`、`.sr-root`、`.specular-button`、`.tr-root`、`.slvh`、`.pc-root`、`.nimbus-nav`、`.glass-surface`、`.animated-list`、`.flip-card`、`.ghost-cursor`、`.gm-root`、`.rubber-segment`、`.tilted-card`。

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

### GlassSurface

- props：`width`（`number | string`，默认 `200`）、`height`（默认 `80`）、`borderRadius`（`20`）、`borderWidth`（`0.07`，相对短边的比例）、`brightness`（`50`）、`opacity`（`0.93`）、`blur`（`11`）、`displace`（`0`）、`backgroundOpacity`（`0`）、`saturation`（`1`）、`distortionScale`（`-180`）、`redOffset`（`0`）、`greenOffset`（`10`）、`blueOffset`（`20`）、`xChannel` / `yChannel`（`R` / `G` / `B` / `A`）、`mixBlendMode`（`difference`）、`refraction`（`true`）、`renderer`（`auto` / `webgl` / `svg`）、`backdrop`、`shape`、`className`、`style`
- 插槽：默认插槽放玻璃背后的内容
- `renderer="auto"`：Chromium 走 SVG 滤镜折射（无 GPU 也可用）；其它浏览器给了 `backdrop` 才走 WebGL2；两者都不可用时退回雾面玻璃。`renderer` 可强制其中一条路径
- `backdrop` 传同源图片 / 视频 / canvas 或其模板 ref；跨域纹理会污染画布，WebGL 路径失败后自动退回 SVG / 雾面
- `shape` 传同源轮廓图（data URL 或图片地址）：从 alpha 通道描出距离场，生成弯折贴图 + 描边 / 发光遮罩；加载完成前容器透明，失败则退回普通玻璃
- 根类名前缀 `.glass-surface`；置换贴图经 `ResizeObserver` 随容器尺寸重算；CSS 全局引入（滤镜原语由 `h()` 生成，写进模板会变成未解析组件）

### AnimatedList

- props：`items`（`AnimatedListItem[]`，默认 15 项内置文件列表）、`initialSelectedIndex`（`-1`）、`selectOnHover`（`true`）、`enableArrowNavigation`（`true`）、`loop`（`false`）、`animation`（`pop` / `slide` / `fade` / `none`）、`animateOnce`、`stagger`（`0.05`）、`showGradients`、`fadeSize`（`56`）、`displayScrollbar`、`frame`、`theme`（`dark` / `light`）、`accentColor`、`radius`、`gap`、`width`、`maxHeight`、`className`、`itemClassName`、`style`
- `AnimatedListItem`：`string` 或 `{ id?, icon?, image?, title, description?, meta? }`；`icon` 传 Vue 组件（默认项图标随包导出 `ANIMATED_LIST_ITEMS` / `ANIMATED_LIST_ICONS`）
- 插槽：`#item`（作用域参数 `{ item, index, selected }`）替代 React 的 `renderItem`；不传时用内置的 lead / title / description / meta 结构
- emits：`select`（`[item, index]`），点击条目或聚焦列表后按 Enter 触发
- 键盘：↑ / ↓ / Home / End 切换选中项并滚动到可见处，Enter 确认；`loop` 打开时首尾循环
- 选中指示条用弹簧逼近目标项的位置与高度；逐帧状态走普通对象 + 命令式写 DOM，不进响应式

### FlipCard

- props：`flipped`（`v-model:flipped`）、`defaultFlipped`（`false`）、`axis`（`x` / `y`）、`flipOnClick`、`draggable`、`dragDistance`、`tilt`、`tiltMax`（`12`）、`glare`、`glareOpacity`（`0.22`）、`hoverScale`（`1.03`）、`perspective`（`1100`）、`stiffness`（`170`）、`damping`（`20`）、`width`（`300`）、`height`（`400`）、`radius`（`22`）、`background`、`color`、`shadow`、`shadowColor`、`shadowOpacity`、`disabled`、`ariaLabel`、`className`
- 插槽：`#front`、`#back` 放两面内容
- emits：`update:flipped`（配合 `v-model`）、`flip-change`（对应 React 的 `onFlipChange`）
- 拖拽甩动会按最近 90ms 的角速度补一段惯性（系数 0.16），落点吸附到 180° 的整数倍；点击 / Enter / 空格立即翻面
- `prefers-reduced-motion` 下不做倾斜与甩动，正反面用透明度切换而不是 3D 旋转
- 根类名前缀 `.flip-card`

### GhostCursor

- props：`color`、`brightness`、`size`（`80`）、`trailLength`（`50`）、`inertia`（`0.5`）、`turbulence`（`0.5`）、`drift`、`detail`、`grainIntensity`、`bloomStrength`、`bloomRadius`、`bloomThreshold`、`edgeIntensity`、`clickPuff`、`intro`、`theme`（`dark` / `light`）、`mixBlendMode`、`fadeDelayMs`、`fadeDurationMs`、`maxDevicePixelRatio`（`2`）、`targetPixels`、`zIndex`（`10`）、`className`、`style`
- 零第三方依赖；整屏 fixed + `pointer-events:none`，同页只放一个实例；移动端建议直接不渲染
- WebGL2 + `EXT_color_buffer_float` 不可用时静默降级（不显示任何东西，不会白屏）；`sim` / `shade` / bloom 的分辨率分别按预算与 DPR 缩放，弱机把 `maxDevicePixelRatio` 降到 1–1.5、`targetPixels` 调小
- 指针离开后按 `fadeDelayMs` / `fadeDurationMs` 淡出；`clickPuff` 打开时按下喷一团墨；`intro` 在首次挂载时自动画一笔
- 根类名前缀 `.ghost-cursor`；上下文丢失后恢复会重放整个引擎（重新编译着色器与分配纹理）

### GridMotion

- props：`items`（`GridMotionItem[]`，支持字符串 / `{ src, alt }`）、`rows`（`4`）、`aspectRatio`（`1.33`）、`gap`（`16`）、`radius`（`14`）、`angle`（`-12`）、`tilt`（`0`）、`speed`（`24`）、`direction`（`alternate` / `left` / `right`）、`parallax`、`spotlight`、`dim`、`grayscale`、`fade`、`tileColor`、`textColor`、`theme`（`dark` / `light`）、`className`、`style`
- 插槽：`#tile`（作用域参数 `{ tile, index }`）可替换默认图片 / 文字渲染
- 不依赖 Tailwind：React 源码的任意值类已逐条抽成随包 CSS（`.gm-*`），全局引入即可
- 相邻行按 `direction` 反向漂移；指针位置经旋转 / 透视反投影后驱动聚光与视差；`IntersectionObserver` 离屏后停止 rAF
- 图片走 `<img>`，跨域与尺寸由调用方保证；`items` 少于可见格子时循环填充

### RubberSegment

- props：`items`（`string` 或 `{ value, label, icon }`）、`value`（`v-model`）、`defaultValue`、`trackColor`、`thumbColor`、`textColor`、`activeTextColor`、`size`（`sm` / `md` / `lg`）、`radius`（`10`）、`inset`（`3`）、`equalSlots`、`stretch`、`squash`、`speed`、`glide`、`draggable`、`disabled`、`className`、`ariaLabel`
- emits：`update:modelValue`、`change`（`[value, index]`）
- 拖拽滑块越过两端会按橡皮筋公式回拉；快速甩动按最近 100ms 速度投影落点，必要时多跳一格；静止轻点另一个格子时会先挤压再交接
- 键盘：↑ / ↓ / ← / → / Home / End 切换，焦点跟随当前项；`prefers-reduced-motion` 下直接跳位
- 根类名前缀 `.rubber-segment`；滑块用 `clipPath` MotionValue 裁切两份文本，逐帧位置不进响应式

### TiltedCard

- props：`imageSrc`、`altText`、`captionText`、`containerHeight` / `containerWidth`、`imageHeight` / `imageWidth`、`scaleOnHover`、`rotateAmplitude`、`showTooltip`、`overlayDepth`、`displayOverlayContent`、`flipped`（`v-model:flipped`）、`flipOnClick`、`radius`、`perspective`、`smoothness`、`glare`、`glareColor`、`shadow`、`parallax`、`axis`（`both` / `horizontal` / `vertical`）、`reverse`、`trackWindow`、`floating`、`gyroscope`、`intro`、`introDelay`、`className`、`style`
- 插槽：默认放正面内容、`#back` 放背面（提供背面即可翻面）、`#overlay` 放深度浮层
- emits：`flip`（`[value]`）；`click` 作为原生事件透传；有 `#back` 时自动获得 button 语义与 Enter / 空格翻面
- `TiltedCardLayer` 子组件用 `depth` 做多层视差；指针 / 陀螺仪 / 自动漂浮三种输入自动切换
- 逐帧弹簧状态是普通对象，直接写 transform / CSS 变量；离屏后停止 rAF
- 根类名前缀 `.tilted-card`

### Signature

- props：`mode`（`play` / `sign`）、`strokes`、`text`、`pen`（`fountain` / `ballpoint` / `marker`）、`thickness`、`speed`、`autoplay`、`loop`、`pause`、`frame`、`line`、`name`、`role`、`placeholder`、`aspect`（`2.4`）、`intro`、`theme`（`auto` / `light` / `dark`）、`inkColor`、`surfaceColor`、`className`、`style`
- emits：`change`（`[strokes]`）、`complete`（播放结束）
- 通过 ref 暴露 `play()` / `clear()` / `undo()` / `getStrokes()` / `toSVG()` / `toDataURL()`，对应 React 的 `SignatureHandle`
- `play` 模式把归一化笔迹逐点画出；传 `text` 时改用楷体文字配合 `clip-path` 揭示。`sign` 模式下按住指针手写，笔压影响线宽（钢笔按下变粗、抬笔变细）
- `theme="auto"` 从父元素背景色推断明暗；无 canvas 2d 上下文时只显示框架与文案

### PaperCrumple

- props：`src`、`alt`、`backSrc`、`width` / `height`（纸张尺寸）、`sceneHeight`、`imageFit`（`cover` / `contain`）、`releaseBehavior`（`restore` / `creased` / `stay`）、`crumpleAmount`、`crumpleDuration`、`releaseDuration`、`foldCount`、`foldSharpness`、`wrinkleDepth`、`creaseStrength`、`paperColor`、`roughness`、`paperTexture`、`lightIntensity`、`lightAngle`、`shadow`、`shadowOpacity`、`draggable`、`dragRotation`、`dragRadius`、`returnToOrigin`、`rotation`、`seed`、`detail`、`disabled`、`resetKey`、`className`、`style`
- emits：`state-change`（`flat` / `holding` / `crumpled` / `creased`）、`error`
- 通过 ref 暴露 `reset()` / `cancel()`；`resetKey` 变化也会重置
- 按住图片揉皱（鼠标 / 触摸 / 空格 / Enter），拖拽移动，方向键微调，Escape 复位；松手后按 `releaseBehavior` 恢复、留折痕或保持揉皱
- 图片用 `THREE.TextureLoader` 加载，必须同源或允许 CORS；WebGL 不可用时显示静态 `<img>` 降级并发出 `error`
- 根类名前缀 `.paper-crumple`

### ReflectiveCard

- props：`name` / `role` / `badge` / `status` / `statusColor` / `idLabel` / `idValue`（内置内容字段）、`theme`（`dark` / `light`）、`videoSrc`、`webcam`、`tint`、`metalness`、`roughness`、`blurStrength`、`grayscale`、`warp`、`warpScale`、`shine`、`bevel`、`glare`、`enableTilt`、`tiltStrength`、`intro`、`width`、`height`、`radius`、`className`、`style`
- 插槽：默认插槽替换整块卡面内容（不传时用内置的身份卡布局）
- emits：`webcam-error`（摄像头不可用或被拒绝时）
- WebGL2 环境反射：视频 / 摄像头的画面经 capture + 两向高斯模糊后作为环境贴图，按卡片姿态与指针做金属反射；`prefers-reduced-motion` 下关闭倾斜与入场
- 摄像头需要 HTTPS 与用户授权；失败时只发事件，卡片仍可显示视频反射或静态背景
- 根类名前缀 `.reflective-card`

### PillNav

- props：`logo`（图片地址；`#logo` 插槽可换成任意节点）、`logoAlt`、`logoHref`、`items`（`{ label, href?, icon?, ariaLabel? }`）、`activeHref`（`v-model:activeHref`）、`defaultActiveIndex`、`theme`（`dark` / `light`）、`layout`（`split` / `joined`）、`size`（`sm` / `md` / `lg`）、`surface`（`glass` / `solid` / `none`）、`itemStyle`（`pill` / `underline`）、`hoverEffect`（`fill` / `glide`）、`indicator`（`dot` / `pill`）、`highlightColor`、`highlightTextColor`、`barColor`、`textColor`、`bounce`、`stretch`、`intro`、`collapse`（`auto` / `always` / `never`）、`ariaLabel`、`className`、`style`
- emits：`item-click`（`[item, index, event]`）、`menu-toggle`（`[open]`）、`update:activeHref`
- 指示条用两组弹簧状态（前缘 / 后缘）做拉伸与回弹；悬停填充、指针眩光与圆点跟随同一帧循环
- `collapse="auto"` 按父容器可用宽度自动折叠，折叠后显示汉堡按钮与弹出菜单；Escape / 外部点击关闭菜单
- 根类名前缀 `.pill-nav`

## 与 React 原件的差异

前三个组件是 1:1 直译。后十九个在移植时处理了上游的几处问题或按 Vue 习惯调整，行为上有意不同（`SplashCursor` / `Shredder` / `SpotlightCard` / `GlassSurface` / `AnimatedList` / `FlipCard` / `GhostCursor` / `GridMotion` / `RubberSegment` / `TiltedCard` / `Signature` / `PaperCrumple` 的引擎是 1:1 抽取，差异只在框架胶水与 DOM 归属）：

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
- `GlassSurface` 的 `feImage` / `feDisplacementMap` 等滤镜原语同样由 `h()` 生成，节点用函数式 ref 登记给 composable；SVG 属性按 spec 写（`stdDeviation`、`xChannelSelector` 是驼峰，`color-interpolation-filters` 是连字符）。上游用 `useId()` 拼三组渐变 / 滤镜 id，Vue 版把它们收进自包含的 data URL 里，不需要给文档注入唯一 id。
- `GlassSurface` 在 `webglcontextlost` 后保留 WebGL 模式，浏览器恢复上下文时重新编译着色器、重建纹理 / buffer / VAO 并继续渲染。上游调了 `preventDefault()` 却把 `webglFailed` 永久置为 `true`，之后再也回不到 WebGL 路径。
- `GlassSurface` 把置换贴图、通道选择器等高频 DOM 更新放在普通变量 / 命令式 `setAttribute` 里，不进响应式；`backdrop` 同时接受 DOM、Vue `Ref` 与 React 风格的 `{ current }` 对象。
- `AnimatedList` 用 `#item` 作用域插槽替代 `renderItem`，事件走 `select`（不保留 `onItemSelect`），`icon` 从 React 节点换成 Vue 组件；选中项是内部状态（`initialSelectedIndex` 起步），不另发 `selected-change`。
- `AnimatedList` 的弹簧指示条把逐帧位移 / 速度放在普通对象里直接写 DOM；`CSS.supports` 探测与 `window` 键盘监听都在挂载后进行，卸载时统一移除（上游的 effect 依赖为空，运行中改 props 靠 ref 偷读最新值，这里改为响应式 props + watch）。
- `FlipCard` 的 `front` / `back` 从 React 节点换成 `#front` / `#back` 具名插槽；`flipped` 走 `v-model:flipped`，同时保留 `flip-change` 事件对应上游的 `onFlipChange`。所有派生 transform 用 `useTransform(() => …)` 函数形式，props 变化时模板字符串也会重算（上游的 `useMotionTemplate` 只认 MotionValue）。
- `GhostCursor` 的上下文恢复用 `generation` ref + `watch` 重放整个引擎（上游用 state 触发 effect 重跑，语义相同）；卸载后沿用上游的延迟释放上下文策略。`fadeDelayMs` / `fadeDurationMs` 的触屏默认值在挂载时按 `maxTouchPoints` 决定，SSR 下先按桌面取值。
- `GridMotion` 不依赖 Tailwind：React 写在 JSX 任意值类里的样式已逐条抽成 `GridMotion.css`，由 SFC 全局引入；`isValidElement` 的节点项换成 `#tile` 作用域插槽。逐帧的位移 / 聚光强度是普通数组 / Float32Array，写 DOM 时不进响应式。
- `RubberSegment` 的 `value` 用 `v-model` 受控，另发 `change` 对应上游的 `onChange`；`items` 里的 `icon` 从 React 节点换成 Vue 组件。`clipPath` 用 `useTransform(() => …)` 函数形式，半径 / 内边距变化也会重算。
- `TiltedCard` 的 `children` / `backContent` / `overlayContent` 换成默认 / `#back` / `#overlay` 插槽；提供 `#back` 才进入可翻面交互。`flipped` 用 `v-model:flipped`，`onFlip` 换成 `flip` 事件；`onClick` 按原生事件透传。运行中改 props 会重启引擎（上游靠 ref 偷读最新值）。
- `Signature` 用 `defineExpose` 暴露 React `forwardRef` 的方法；`onChange` / `onComplete` 换成 `change` / `complete` 事件。默认笔迹放在模块作用域，避免 `withDefaults` 引用 setup 局部变量导致编译失败。
- `PaperCrumple` 的布料求解与 three.js 场景逐段搬到 `paperCrumplePhysics.ts` / `usePaperCrumple.ts`（`// @ts-nocheck` 保留原始数值算法，不引入类型注解改动计算）；`onStateChange` / `onError` 换成 `state-change` / `error` 事件。运行中改场景参数会重建整个 three.js 场景（上游的 effect 依赖也是这些 props）。
- `ReflectiveCard` 的着色器 / WebGL 渲染器逐段搬到 `reflectiveCardEngine.ts`，生命周期在 `useReflectiveCard.ts`；`children` 换成默认插槽，`onWebcamError` 换成 `webcam-error` 事件。上下文恢复用 `generation` ref + `watch` 重建渲染器。
- `PillNav` 的 `linkComponent` 换成 `<a>` / `<button>`（按 `item.href` 决定），`logo` 节点换成 `#logo` 插槽；`activeHref` 用 `v-model:activeHref` 受控并另发 `item-click` / `menu-toggle`。折叠检测、入场与菜单动画按 Vue 生命周期重写，WAAPI 不可用时直接落终态。

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
- 二十二个组件都做了 SSR 安全处理：浏览器 API 只在 `onMounted` 或用户事件中访问；`LiquidNavbar` 的 `getContext` / `matchMedia` / `AudioContext` 同样如此。`GlassyDashboard` 的 `matchMedia` / `ResizeObserver` / `history` 也在挂载后才用；`SplashCursor` 的 `getContext` / `matchMedia`、`Shredder` 的 `ResizeObserver` / canvas 上下文、`SpotlightCard` 的 `matchMedia` / `IntersectionObserver` 同样只在挂载后访问；`GlassSurface` 的 `getContext` / `Image` / `ResizeObserver` / `IntersectionObserver` / `canvas 2d` 也都在挂载后；`AnimatedList` 的 `matchMedia` / `CSS.supports` / `IntersectionObserver` / `ResizeObserver` / `window` 监听同样只在挂载后；`FlipCard` 的 `useReducedMotion` / 指针捕获同样只在挂载与事件中；`GhostCursor` 的 `getContext` / `matchMedia` / `window` 指针监听 / `IntersectionObserver` 同样只在挂载后；`GridMotion` 的 `ResizeObserver` / `IntersectionObserver` / `window` 监听同样只在挂载后；`RubberSegment` 的 `ResizeObserver` / `document.fonts` / 指针捕获同样只在挂载后；`TiltedCard` 的 `matchMedia` / `IntersectionObserver` / 陀螺仪权限同样只在挂载后；`Signature` 的 canvas 2d / `devicePixelRatio` / `IntersectionObserver` 同样只在挂载后；`PaperCrumple` 的 `WebGLRenderer` / `TextureLoader` / `matchMedia` 同样只在挂载后；`ReflectiveCard` 的 `getContext` / `getUserMedia` / `matchMedia` 同样只在挂载后；`PillNav` 的 `matchMedia` / `ResizeObserver` / `document.fonts` 同样只在挂载后。
- `GlassyDashboard` 的示例数据固定三个周期（7/30/90 天）与四视图；CSV 只在浏览器本地生成，不上传。背景图为 Unsplash 远程资源，离线时只有底色。
- `SplashCursor` 需要 WebGL2 与浮点纹理扩展；不支持时只显示静态降级提示。弱机建议 `quality="low"`，主题切到 `light` 时要配浅色背景。
- `Shredder` 的行快照依赖 `SVG foreignObject` + canvas，跨域图片会被污染；同页多实例时各自独立（引擎状态不共享）。
- `SpotlightCard` 依赖 `color-mix` 与 `mask-composite`；`grain` 用 `mix-blend-overlay`，在纯黑 / 纯白表面上颗粒偏弱，需要明显颗粒时把 `grain` 调到 0.2 以上。
- `LiquidNavbar` 的水体需要 WebGL（1）；拿不到上下文（含着色器编译失败）时退回 CSS 水滴，观感简化但没有功能损失。玻璃的折射（`backdrop-filter: url(#…)`）目前只有 Chromium 支持，其它浏览器只有模糊与提亮。移动端贴底放置时自己留出 `env(safe-area-inset-bottom)`。
- `GlassSurface` 的 SVG 折射依赖 Chromium 的 `backdrop-filter: url(#…)`，其它浏览器走 WebGL2（需 `backdrop`）或雾面兜底；容器背后必须有内容才看得出折射。`shape` 与 `backdrop` 的图片必须同源或带 CORS；形状描摹在挂载与尺寸变化时同步计算，很大的 `shape` 会占一些主线程时间。
- `AnimatedList` 不是虚拟列表；数据量大时在外层分页或虚拟滚动。入场动画由 `IntersectionObserver` 触发，未滚入视口时条目保持隐藏（`animation="none"` 时立即显示）。
- `FlipCard` 依赖 `color-mix` 与 `preserve-3d`；拖拽只认主键（左键）且要超过 4px（触屏 8px）阈值，`dragDistance` 不传时用卡片的宽 / 高作量程。
- `GhostCursor` 需要 WebGL2 与浮点颜色缓冲；headless / 无 GPU 环境不会显示光标（静默降级，不是白屏）。整屏 fixed，同页最多一个实例。
- `GridMotion` 需要父容器有明确高度（`height:100%`）；移动端建议降低 `rows` 与 `speed`。
- `RubberSegment` 依赖 `clip-path: inset()`；需要精确测量格子尺寸，字体加载完成后会重新测量一次。
- `TiltedCard` 的陀螺仪需要 HTTPS 与用户手势授权；`prefers-reduced-motion` 下减小倾斜幅度并跳过自动漂浮与入场动画。
- `Signature` 的 `toDataURL()` 依赖浏览器 canvas；导出 SVG 是独立实现，不依赖画布内容。`aspect` 决定画面高度（720 / aspect）。
- `PaperCrumple` 依赖 `three`；揉皱路径按尺寸 / 折数缓存，首次生成会占用一些主线程时间。移动端建议降低 `detail`。
- `ReflectiveCard` 需要 WebGL2；无 WebGL 时只有 CSS 卡面（没有金属反射）。摄像头反射依赖 HTTPS 与授权，弱机建议关掉 `webcam`。
- `PillNav` 的 `collapse="auto"` 依赖父容器宽度与 CSS 变量计算，父容器需要有明确宽度；`intro` 动画用 Web Animations API，不支持时直接显示终态。