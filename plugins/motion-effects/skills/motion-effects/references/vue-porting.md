# React → Vue 3 移植手册

> 目标：把 `assets/react/components/ui/` 里的 React 组件**保真**移植成 Vue 3 SFC。
> 原则：**结构、常量、CSS、shader、交互细节全部保留**，只替换框架胶水。不要"重新设计"。
> 文中路径均相对 `SKILL.md` 所在目录（`skills/motion-effects/`），如 `assets/react/…`、`../../packages/vue/…`。

## 0. 先选移植路径

| 路径 | 何时用 | 做法 |
|---|---|---|
| **A. 直译（默认）** | Vue 3 / Nuxt 项目 | 按本手册逐段翻译 JSX → `<template>`，逻辑搬进 `<script setup lang="ts">` |
| B. React 岛 | 项目已有 React 运行时且允许共存 | 用 iframe / Web Component 包一层；只在 A 成本不可接受时用 |
| C. 只用演示 HTML | 原型 / 静态页 / 设计稿 | 直接引 `assets/demos/*.html`；**不要**当生产组件交付 |

本手册只覆盖 A。

## 1. 依赖对照

| React 侧 | Vue 3 侧 | 说明 |
|---|---|---|
| `react` / `react-dom` | 内置 | — |
| `motion/react` | `motion-v` | API 基本对齐：`motion`、`useMotionValue`、`useSpring`、`useTransform`、`animate`；语义差异见 §5，均在 motion-v 2.13.0 上验证。peer 依赖 `@vueuse/core` 要一并安装 |
| `@hugeicons/react` | `@hugeicons/vue` | `HugeiconsIcon` 用法见 §6 |
| `@hugeicons/core-free-icons` | 同名包 | 图标数据通用 |
| `three` | `three` | 原样 |
| `clsx` + `tailwind-merge`（`cn`） | 项目自己的 class 合并工具，或模板字符串 | 只有 `liquid-glass-logo-reveal` 用 |
| `gsap` + `@gsap/react`（`useGSAP`） | `gsap`（`gsap.context()` 手动管理生命周期） | `GlassyDashboard`：Vue 侧不需要 `@gsap/react`，时间线收进 `gsap.context`，切页 `revert`、卸载 `dispose` |
| `lucide-react` | `@lucide/vue` | `GlassyDashboard`：数据层存图标名字符串，渲染时统一映射到组件，不要把组件放进 `ref` / `reactive` |
| `@fontsource-variable/manrope` | 同名包 | `GlassyDashboard`：SFC 里 `import '@fontsource-variable/manrope'` |

```bash
pnpm add motion-v @vueuse/core
pnpm add @hugeicons/vue @hugeicons/core-free-icons
pnpm add three
pnpm add clsx tailwind-merge
pnpm add gsap @lucide/vue @fontsource-variable/manrope   # GlassyDashboard
```

**样式形态先确认**（详见 catalog 总表）：

- 12 个组件有同名 `.css`，一起复制；
- `GridMotion` 与 `SwipeRow` 的 React 源码**没有独立 CSS**，样式写死在 JSX 的 Tailwind 任意值类里 —— Vue 项目不用 Tailwind 时，直接复用 `assets/demos/grid-motion.html` / `swipe-row.html` 里的等价 CSS（`SwipeRow` 的 Vue 实装已带提取好的 `SwipeRow.css`）；
- 6 个 TSX 组件（`glass-folder-cards`、`liquid-glass-*`、`scroll-locked-video-hero`、`signature`、`terminal-replay`）把样式内联在文件里，随源码搬；`liquid-glass-logo-reveal` 容器另有 5 个 Tailwind 工具类，可手写。

## 2. API 映射总表

| React | Vue 3 |
|---|---|
| `useState(v)` | `const x = ref(v)`；模板自动解包 |
| 大对象 / DOM / three 实例 | `shallowRef`；three 对象再加 `markRaw` |
| `useRef(null)` | `const el = ref<HTMLElement \| null>(null)` + 模板 `ref="el"`；Vue 3.5 可用 `useTemplateRef('el')` |
| `useMemo(fn, deps)` | `computed(fn)` |
| `useEffect(fn, [])` | `onMounted(fn)`；返回的 cleanup 放 `onBeforeUnmount` |
| `useEffect(fn, deps)` | 首次用 `onMounted(fn)`，后续用 `watch(deps, fn, { flush: 'post' })`。不要拿 `immediate: true` 代替首次调用：它发生在 setup 里（挂载前），模板 ref 和 DOM 都还不存在 |
| `useLayoutEffect` | `onMounted`（DOM 已插入、浏览器绘制前；不需要 `await nextTick()`） |
| `useId()` | Vue 3.5 `useId()`；更低版本用模块级自增 id |
| `useReducedMotion()` | `motion-v` 自带同名 `useReducedMotion()`（返回 `ComputedRef<boolean>`），或 `usePreferredReducedMotion()`（`@vueuse/core`） |
| `React.memo` | 一般不需要；大列表用 `v-memo` |
| `forwardRef` + `useImperativeHandle` | `defineExpose({ ... })` |
| `children` | `<slot />` |
| 具名节点 prop（`front`/`back`/`icon`/`overlayContent`） | 具名插槽 `<slot name="front" />` |
| render prop（`renderItem`） | 作用域插槽 `<slot name="item" :item="item" :index="i" />` |
| `value` + `onChange` 受控 | `defineModel()`（Vue 3.4+）或 `props.value` + `emit('update:value')` |
| `onClick` / `onHold` / `onAction` | `defineEmits<{ click: [...]; hold: []; action: [id: string] }>()` |
| `className` / `style` 透传 | 单根组件默认自动透传 `class` / `style` / 事件，不用写；`inheritAttrs: false` 或多根节点时才手动 `v-bind="$attrs"` |
| 行内样式对象 `style={{ height: 38 }}` | `:style="{ height: '38px' }"`。React 会给数字补 `px`，Vue 不会：数字对非无单位属性是无效值，会被丢弃。只有 `lineHeight`、`opacity`、`fontWeight`、`zIndex` 这类无单位属性可以直接传数字 |
| Context | `provide()` / `inject()` |
| `dangerouslySetInnerHTML` | `v-html`（仅可信内容） |

## 3. SFC 骨架

```vue
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  disabled?: boolean
}>(), {
  size: 80,
  disabled: false,
})

const emit = defineEmits<{
  change: [value: number]
}>()

const root = ref<HTMLElement | null>(null)
let raf = 0

onMounted(() => {
  // 初始化：DOM 测量、WebGL、事件监听、rAF
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  // 移除监听、ResizeObserver、disconnect、mediaStream.stop()
})
</script>

<template>
  <div ref="root">
    <slot />
  </div>
</template>

<!-- 组件 CSS 必须全局引入，原因见 §7 -->
<style src="./Component.css"></style>
```

`withDefaults` + `defineProps` 是 Vue 3.5 之前的稳定写法；Vue 3.5+ 也可以继续用。

## 4. 状态与副作用

### 4.1 逐帧动画不要走响应式

React 组件通常用 `useRef` 存动画状态并直接写 DOM/CSS 变量。Vue 里同样做：

```ts
const phase = shallowRef('idle')     // 低频 UI 状态
const motion = { p: 0, raf: 0 }    // 高频逐帧状态，普通对象，不包 ref
```

每帧 `motion.p = ...; el.style.setProperty('--p', String(p))`。**不要**每帧 `ref.value = ...`，会触发无谓的依赖追踪。

### 4.2 挂载顺序

React 的 `useLayoutEffect` 对应"DOM 已插入、浏览器绘制前"。Vue 的 `onMounted` 就是这个时机（子组件先挂载完），直接同步测量，不需要 `await nextTick()`：

```ts
onMounted(() => {
  measure()
})
```

需要跟随尺寸变化时用 `ResizeObserver`，并在 `onBeforeUnmount` 里 `disconnect()`。

### 4.3 事件与指针

```vue
<button
  @pointerdown="onDown"
  @pointermove="onMove"
  @pointerup="onUp"
  @pointercancel="onUp"
  @lostpointercapture="onUp"
/>
```

- `setPointerCapture` 后记得在结束时 `releasePointerCapture`（或依赖 `lostpointercapture`）。
- 拖动轨道的元素加 `touch-action: none`，整页不要加。
- 键盘：`@keydown.esc`、`@keydown.delete`、`@keydown.space.prevent`。
- 卸载时移除挂在 `window` / `document` 上的监听。

## 5. motion-v 用法

```vue
<script setup lang="ts">
import { motion, useMotionValue, useSpring, useTransform } from 'motion-v'

const turn = useMotionValue(0)
const smooth = useSpring(turn, { stiffness: 170, damping: 20 })
const rotateY = useTransform(smooth, v => `${v}deg`)
</script>

<template>
  <motion.div :style="{ rotateY }" />
</template>
```

- React 里的 `animate(el, {...})` 命令式动画在 motion-v 中同样可用。
- 组件名与 Motion 对齐；`<motion.div>` 支持 `:animate`、`:while-hover`、`:while-press`、`:drag` 等。按压态是 `while-press`：`while-tap` 不是 motion-v 的 prop，会原样落成 DOM 属性。
- 若某个 hook 在当前 `motion-v` 版本不可用，用 VueUse 等价物（如 reduced-motion），**不要**为此引入整套 React。

### 与 React 版不同的两处语义

**`motion.div` 是组件，模板 ref 拿到的是组件实例，不是 DOM。** 需要 DOM 时取 `$el`：

```ts
const surfaceInstance = useTemplateRef<ComponentPublicInstance>('surface')
const surface = computed<HTMLElement | null>(
  () => (surfaceInstance.value?.$el as HTMLElement | undefined) ?? null
)
```

Vue < 3.5 没有 `useTemplateRef`，改用 `ref<ComponentPublicInstance | null>(null)` 配模板 `ref="surface"`。

不要用 `as-child` 把 motion 挂到带 `ref` 的子元素上：motion-v 会删掉子元素 vnode 上的 `ref`，而编译器把静态 props 提升成了共享常量，结果只有第一个创建的元素拿得到 ref。

**`useTransform(input, fn)` 只在输入的 MotionValue 变化时重算**，闭包里读到的 props / `computed` 不会被追踪。React 版每次 render 都会重算，逐字直译会丢掉这个语义。派生值依赖 props 时用函数形式：

```ts
// ❌ sign / drawerWidth（来自 direction / actions）变了不重算
const rail = useTransform(exposed, value => `translateX(${-sign.value * (drawerWidth.value - value)}px)`)

// ✅ 同时响应 MotionValue 与 Vue 响应式
const rail = useTransform(() => `translateX(${-sign.value * (drawerWidth.value - exposed.get())}px)`)
```

## 6. Hugeicons（Vue）

```vue
<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Delete02Icon } from '@hugeicons/core-free-icons'
</script>

<template>
  <HugeiconsIcon :icon="Delete02Icon" :size="20" :stroke-width="2" />
</template>
```

React 里的 `icon={<HugeiconsIcon icon={X} />}`（节点）在 Vue 里可以：
- 直接作为 `icon` prop 里的节点（用 `h()` 或在父模板里传插槽）；
- 或把 `items` 里的 `icon` 改成"图标组件"字段，在模板里统一渲染。
- 图标组件放进响应式数据（`ref([...])`、`reactive`）时要 `markRaw(icon)`，否则 `<component :is>` 拿到的是被代理的组件，Vue 会告警。

## 7. CSS：默认全局引入，不要 scoped

这些组件大量使用：
- 内部固定 class（`.pill-nav__*`、`.hb-*`、`.sr-*`）；
- 运行时创建的克隆节点 / canvas / SVG；
- `::before` / `::after` 与深层选择器。

Vue 的 `scoped` 只会给模板里的节点加 `data-v-*`，**运行时创建的节点拿不到**，会导致样式丢失。做法：

```ts
// main.ts：以有独立 CSS 的组件为例
import './components/ui/FlipCard.css'
```

或 SFC 里：

```vue
<style src="./FlipCard.css"></style>
```

> `GridMotion` 的 React 源码没有 `.css` 文件（样式在 Tailwind 任意值类里），复用 `assets/demos/grid-motion.html` 的 `.gm-*` 规则，或启用 Tailwind。`SwipeRow` 的 React 源码同样没有，但 Vue 实装已带从 demo 提取的 `../../packages/vue/src/components/SwipeRow.css`，不需要 Tailwind。

CSS 已使用唯一前缀，全局引入不会互相污染。若项目坚持 scoped，至少对动态节点使用 `:deep()`，并逐条核对。

`GridMotion` 的 Tailwind 类名是**运行时字符串常量**，Tailwind 的内容扫描可能扫不到 `GridMotion.jsx`（已删除）。移植时把类名直接写进 Vue 模板，或把源码文件加入 `tailwind.config` 的 `content`，或把常量翻译成普通 CSS。

## 8. WebGL 组件模板

适用：`GhostCursor`、`GlassSurface`、`ReflectiveCard`、`SpecularButton`、`liquid-glass-logo-reveal`、`liquid-glass-navbar`。

```ts
const canvas = ref<HTMLCanvasElement | null>(null)
let gl: WebGL2RenderingContext | null = null
let raf = 0
let ro: ResizeObserver | null = null
let disposed = false

onMounted(() => {
  const el = canvas.value
  if (!el) return
  gl = el.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: false })
  if (!gl) return // 走 CSS/SVG 降级

  // 编译 shader、建 buffer、建纹理（原样搬 React 代码）
  ro = new ResizeObserver(resize)
  ro.observe(el)
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  ro?.disconnect()
  // 先移除 webglcontextlost / webglcontextrestored 监听，再释放上下文
  // deleteBuffer / deleteTexture / deleteProgram / deleteVertexArray
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  gl = null
})
```

必须额外处理：
- **DPR**：`Math.min(devicePixelRatio, 2)`，移动端可降到 1.5。
- **上下文丢失**：`webglcontextlost` 里调了 `preventDefault()`，浏览器就会恢复上下文；恢复时必须重建 program / buffer / 纹理 / VAO，否则之后每一帧都是 `INVALID_OPERATION`。把资源创建写成可重放的函数：

```ts
const createResources = () => { /* 编译 shader，建 buffer / 纹理 / VAO */ }
createResources()
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault()
  cancelAnimationFrame(raf)
})
canvas.addEventListener('webglcontextrestored', () => {
  createResources()
  resize()
  raf = requestAnimationFrame(loop)
})
```

完整实现见 `../../packages/vue/src/composables/useSpecularLight.ts`。
- **卸载防护**：`loop` 和恢复回调开头检查 `disposed`；卸载时先移除这两个监听再 `loseContext()`，否则恢复回调会在卸载后重建资源、重启 rAF。
- **页面隐藏**：`document.visibilitychange` 时暂停 rAF。
- **IntersectionObserver**：离屏停止渲染。
- **降级**：`gl === null` 时显示静态图 / CSS 版本，不能白屏。

## 9. three.js 组件模板（PaperCrumple）

```ts
import type { WebGLRenderer, Scene, Camera } from 'three'

const canvas = ref<HTMLCanvasElement | null>(null)
let renderer: WebGLRenderer | null = null
let disposed = false
let raf = 0

onMounted(async () => {
  const THREE = await import('three')       // 动态加载，避免首屏体积
  if (disposed) return                      // 加载途中组件已卸载
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value!, alpha: true, antialias: true })
  // 场景/相机/几何/材质/纹理：原样搬 React 代码
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  disposed = true
  // scene.traverse: geometry.dispose(); material.dispose(); texture.dispose()
  renderer?.dispose()
  renderer = null
})
```

- three 对象用 `shallowRef` + `markRaw`，不要被 Vue 代理。
- 纹理图片必须同源或 CORS 允许（`img.crossOrigin = 'anonymous'`）。
- 移动端降低 `detail` / 几何细分。

## 10. 受控 / 非受控

React 组件常见 `flipped` / `value` / `open` / `active` 同时支持受控与非受控。Vue 推荐：

```ts
const model = defineModel<boolean | undefined>() // 父组件传 v-model 即受控
const inner = ref(false)
const shown = computed(() => model.value ?? inner.value)
```

或保留 `props.value` + `emit('update:value')`，与非受控 `defaultValue` 并存。

受控值的初始状态不会自动同步：`watch` 默认不立即执行，而 React 的 `useEffect` 挂载时就会跑一次。在 `onMounted` 里先同步一次（见 `useSwipeRow.ts` 的 `syncOpen`）。

## 11. SSR / Nuxt

- 删除 `'use client'`（Vue 无此指令）。
- 模块顶层不能访问 `window` / `document` / `navigator` / `WebGL2RenderingContext`。
- WebGL/three/陀螺仪/摄像头全部放 `onMounted`，或组件外包 `<ClientOnly>`。
- 首帧要有一张静态占位（poster/渐变/骨架），避免水合前空白。
- Nuxt 可用 `plugins` 或 `defineAsyncComponent` 延迟加载重组件。

## 12. 无障碍与降级

移植时逐项保留：
- `aria-label` / `role` / `aria-pressed` / `aria-activedescendant` / `aria-live`；
- 键盘操作（Tab、Enter、Space、Escape、方向键、Delete）；
- `:focus-visible` 样式；
- `prefers-reduced-motion: reduce`：关闭旋转/视差/自动播放，保留静态终态；
- WebGL 不可用：CSS/SVG/静态图降级；
- 触屏：44×44 最小点击区，不能只靠 hover。

## 13. 常见坑（按出现频率）

| 坑 | 现象 | 修法 |
|---|---|---|
| 用 `scoped` | 组件样式全丢 | 改全局引入（§7） |
| 每帧 `ref.value =` | 卡顿、CPU 高 | 高频状态用普通对象 + 直接写 DOM（§4.1） |
| 忘 cleanup | 切页后 rAF/监听还在跑 | `onBeforeUnmount` 统一清理 |
| `reactive(threeObject)` | Proxy 导致 WebGL 报错/性能崩 | `shallowRef` + `markRaw` |
| SSR 顶层访问 `window` | 构建/水合报错 | 全部移入 `onMounted` |
| 受控值不同步 | 父组件改了 `v-model` 的值，动画不回位 | `watch(model, sync)` + `flush: 'post'` |
| Tailwind 扫不到类名 | 从 React 源码移植的 GridMotion / SwipeRow 样式缺失 | 类名写进模板 / 配 content；或直接复用 demo 里的等价 CSS（§7） |
| 图片跨域 | 纹理污染、WebGL 失败 | 同源或 CORS 头（§8/§9） |
| 多实例 id 冲突 | SVG filter 互相覆盖 | `useId()`（§2） |
| 移动端 hover 逻辑 | 点一下卡住 | 用 `pointer` 事件 + `pointerType` 判断 |
| `motion.div` 上写模板 ref | 拿到的是组件实例，`setPointerCapture` 等 DOM 调用抛 `TypeError`（被 `try/catch` 吞掉时表现为静默失败） | §5：`useTemplateRef<ComponentPublicInstance>` + `.$el` |
| `useTransform(input, fn)` 里读 props / `computed` | props 变了，派生值停在旧值 | §5：函数形式 `useTransform(() => ...)` |
| 父组件无条件转发插槽，子组件用 `$slots.x` 判断 | 空插槽也为真，渲染出空容器 | 只在 `$slots.x` 存在时才写 `<template #x>` |
| 受控值的初始状态没同步 | `aria-expanded="true"` 但视觉是关闭的 | §10：`onMounted` 里同步一次 |
| 用 `vi.useFakeTimers()` 测 motion 动画 | motion 在 import 时就捕获了 `requestAnimationFrame`，假定时器推不动它的帧 | 用真实帧：`await new Promise(requestAnimationFrame)`；收敛靠循环等到样式连续几帧不变，现成实现见 `../../packages/vue/tests/helpers/frames.ts` 和 `swipe-row.spec.ts` 的 `settleStyle` |
| `<motion.div>` 的 `style` 写成字符串 | 挂载即报 `Failed to set an indexed property [0] on 'CSSStyleDeclaration'` | motion 的 `style` 只接受对象，静态样式也写 `:style="{ width: '120px' }"` |
| 用 `immediate: true` 模拟 `useEffect` 的首次执行 | 首次调用在挂载前，模板 ref 是 `null` | 首次调用放进 `onMounted`（§2） |
| 给 `:style` 传了不带单位的数字 | `height: 38`、`fontSize: 13` 被当成无效值丢弃，元素没有尺寸或字号 | 写成 `'38px'`、`'13px'`；只有无单位属性可以传数字（§2） |
| 把 React effect 的依赖数组直译成 `watch` 一组 props | 每次改 prop 都重建监听、重置闭包里的内部状态，功能可能就此失效 | 能惰性读取的用 getter（`() => props.x`）在用到的地方读；确实需要重建时才 `watch` |
| 断言 `el.style.xxx`，但样式写在 SFC 的 `<style>` 里 | jsdom 不应用样式表，读到空字符串 | 节点环境只断言内联样式和结构，视觉效果用真实浏览器验证 |
| 发现上游 React 源码有 bug | 正则与自己的数据不匹配、effect 依赖导致重跑等；照抄等于把 bug 也移植过来 | 对照演示和源码确认意图，在 Vue 版修掉，并记入包 README 的「与 React 原件的差异」 |
| 把会锁定 `body` 滚动的特效直接内嵌进页面 | 整个页面滚不动，而且不会自行解锁 | 放进独占的文档：独立页面，或用 iframe 加载一个 `layout: false` 的页面（参考 `ScrollLockedVideoHero` 在文档站里的接法） |
| 把 `feTurbulence` / `feGaussianBlur` 这类 SVG 滤镜原语写进模板 | Vue warn `Failed to resolve component`；降级后建出的元素名是错的（SVG 区分大小写），滤镜静默失效。jsdom 测试不断言滤镜 DOM 就发现不了 | 用 `h()` 渲染函数生成。`h()` 里的属性名会原样 `setAttribute`，要按 SVG spec 的大小写写：`stdDeviation` / `xChannelSelector` / `baseFrequency` 是驼峰，`color-interpolation-filters` 才是连字符；写成另一种形式只是多出一个无效属性，滤镜静默失效 |
| rAF 回调的时间戳和 `performance.now()` 混用 | jsdom 等宿主里两者不同源，算出负的 dt，弹簧直接发散 | 帧时间统一取 `performance.now()`，并给 dt 加下限 |
| 用 `withDefaults` 的默认值引用 `<script setup>` 里的局部变量 | 编译报错：`defineProps` 会被提升到 setup 之外 | 默认值放在模块作用域（单独的 `.ts`） |
| 可选的布尔 prop 要保留"不传"这一态 | Boolean prop 不传时会被 Vue 钳成 `false`，三态丢了一态 | `withDefaults(..., { compact: undefined })` 显式写 `undefined` |

## 14. 保真验收

移植完，和 `assets/demos/<effect>.html` 并排开：

1. 静止态：尺寸、间距、圆角、阴影、字体一致。
2. 交互态：hover / active / focus / disabled / 拖拽 / 键盘一致。
3. 动效：时长、缓动、回弹、锁定角度一致（对照源码常量）。
4. 极端：375px 宽、桌面 1440px、`prefers-reduced-motion`、无 WebGL。
5. 生命周期：切换路由/卸载后无残留 rAF、监听、摄像头、WebGL context。
6. 控制台无报错、无 CORS 警告、无内存持续增长。

> 演示 HTML 是 **vanilla 复刻**，弹簧 / 阻尼 / 速度用自写近似，不等于 `motion-v` 曲线。动效对拍以 **React 源码常量**为准，demo 只作结构、视觉与交互路径的参照。

**不要**在未跑完以上 6 项时声称"移植完成"。