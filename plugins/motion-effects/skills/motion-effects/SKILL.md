---
name: motion-effects
description: Use when 在 Vue 3（或 React）项目中需要接入高级交互动效/视觉组件——玻璃拟态、3D 卡片、滑动操作、滚动视频、WebGL 光标、胶囊导航、分步引导、终端回放、手写签名、辉光数据卡片等——或需要从内置 27 个特效中选型、移植、降级、验收时
---

# Motion Effects · 特效接入

## 核心原则

本技能自带 **27 个高保真特效**的 React 源码 + 可独立运行的 HTML 演示。接入时**从既有源码/演示出发做保真移植**，禁止从零重画视觉效果，禁止改弹簧刚度、shader、折叠角度等观感常量。

**Vue 3 优先**：目标项目是 Vue 3 / Nuxt 时，按 `references/vue-porting.md` 映射；目标项目是 React 时可直接复制源码；纯静态原型才用演示 HTML。

## 资产地图（相对本 SKILL.md）

| 路径 | 内容 |
|---|---|
| `references/catalog.md` | 27 个特效的适用场景、依赖、Vue 难度、关键 API、移植要点 |
| `references/vue-porting.md` | React → Vue 3 完整映射、SFC 骨架、WebGL/three 生命周期、常见坑 |
| `references/production-checklist.md` | 性能、无障碍、SSR、降级、隐私、交付验收清单 |
| `assets/react/components/ui/` | React 源码（JSX/TSX；部分带同名 CSS，少数用 Tailwind/内联样式）——移植的**唯一真源** |
| `../../packages/vue/` | 已移植的 Vue 3 组件：`HoldButton` / `SwipeRow` / `SpecularButton` / `TerminalReplay` / `ScrollLockedVideoHero` / `PeakChart` / `GlassyDashboard` / `SplashCursor` / `Shredder` / `SpotlightCard` / `LiquidNavbar` / `GlassSurface` / `AnimatedList` / `FlipCard` / `GhostCursor` / `GridMotion` / `RubberSegment` / `TiltedCard` / `Signature` / `PaperCrumple` / `ReflectiveCard` / `PillNav` / `MagicBento` / `GlassFolder` / `GlassIconReveal` / `AIPromptBox` / `Stepper`（含 Vitest） |
| `assets/react/lib/utils.ts` | `cn()` 工具（仅 logo reveal 需要） |
| `assets/demos/*.html` | 27 个独立演示（vanilla），用于对照与原型 |
| `assets/gallery.html` | 可运行的特效 gallery（筛选/搜索/iframe 预览/API 速查） |

## 工作流

1. **选型**：先读 `references/catalog.md` 的「场景速查」与总表，按场景、依赖、Vue 难度选 **1–2 个**特效；不要为了丰富而堆特效。
2. **定轨道**：Vue 3 且是已实装的二十七个（`HoldButton` / `SwipeRow` / `SpecularButton` / `TerminalReplay` / `ScrollLockedVideoHero` / `PeakChart` / `GlassyDashboard` / `SplashCursor` / `Shredder` / `SpotlightCard` / `LiquidNavbar` / `GlassSurface` / `AnimatedList` / `FlipCard` / `GhostCursor` / `GridMotion` / `RubberSegment` / `TiltedCard` / `Signature` / `PaperCrumple` / `ReflectiveCard` / `PillNav` / `MagicBento` / `GlassFolder` / `GlassIconReveal` / `AIPromptBox` / `Stepper`）→ 复制 `../../packages/vue/src/`（依赖清单见 `references/vue-porting.md` §1；props / 事件 / 插槽与 CSS 引入方式见 `../../packages/vue/README.md`）；其它 Vue 3 特效 → 读 `references/vue-porting.md` 移植；React → 直接拷 `assets/react/components/ui/` 对应文件；静态页 → 只引 `assets/demos/<id>.html`。
3. **读全材料**：读该特效的 `.jsx/.tsx`、同名 `.css`（若有）与对应 demo，理解 DOM 结构、常量、事件与降级路径。**不要只读 catalog 就动手。**
4. **复制而非跨仓引用**：把源码复制进目标项目的 `components/ui/` 或项目约定目录，再改造；不要从本 skill 目录 `import`。
5. **移植/改造**：保留 CSS 与动画常量；Vue 里 CSS 用**全局引入**（见 vue-porting §7），逐帧状态不要走响应式；props/事件/插槽按 §2–§6 映射。
6. **验收**：按 `references/production-checklist.md` 逐项过，并在浏览器实测；未执行的项必须在交付说明里标注。

## 快速选型

| 需求 | 特效 |
|---|---|
| 营销首屏 / 滚动叙事 | `scroll-locked-video-hero`、`liquid-glass-logo-reveal` |
| 移动端列表操作 | `SwipeRow`、`RubberSegment`、`HoldButton` |
| 数据 / 功能展示 | `MagicBento`、`peak-chart`、`AnimatedList`、`TiltedCard` |
| 玻璃拟态 | `GlassSurface`、`glass-folder-cards`、`liquid-glass-navbar` |
| 身份卡 / 3D 翻面 | `ReflectiveCard`、`FlipCard` |
| 导航 | `PillNav`、`liquid-glass-navbar` |
| 氛围装饰 | `GhostCursor`、`PaperCrumple`、`GridMotion` |
| 内容演示 | `terminal-replay`、`signature` |
| 分步引导 / 引导流程 | `Stepper` | — |

## 硬规则

- **不重画**：所有效果从 `assets/react/` 或 `assets/demos/` 出发；观感常量、shader、CSS 关键帧不改。
- **先读后写**：读 catalog → 读源码与 demo → 再改目标项目；禁止凭记忆写效果。
- **Vue 3 规范**：`<script setup lang="ts">` + Composition API；props 用 `defineProps`/`withDefaults`，双向绑定用 `defineModel`，事件用 `defineEmits`，节点型 props 换插槽。
- **SSR 安全**：`window`/`document`/WebGL/three/摄像头只在 `onMounted` 或 `<ClientOnly>` 内。
- **清理**：rAF、事件监听、observer、timer、mediaStream、WebGL/three 资源在 `onBeforeUnmount` 全部释放。
- **降级**：WebGL2 不可用、`prefers-reduced-motion`、触屏、低端机都要有明确行为，不能白屏或卡死。
- **性能预算**：同屏 GPU 重特效 ≤ 2；`three` 与 WebGL 大组件按需加载；移动端降 DPR/粒子/几何细分。
- **如实汇报**：没测 Safari、没测无 WebGL 就写明，不得声称"已验证"。
- **劫持全局输入的特效**（锁定 `body` 滚动、在 `window` 上拦截滚轮 / 触摸，如 `ScrollLockedVideoHero`）只能放在独占的文档里：独立页面，或用 iframe 加载。不要内嵌进还有其它内容的页面。

## 常见失败模式

| 症状 | 原因 | 先看 |
|---|---|---|
| 组件样式全丢 | Vue `<style scoped>` 加不到运行时节点 | vue-porting §7 |
| 找不到 `Xxx.css` | `SwipeRow` / `GridMotion` 的 React 源码没有独立 CSS（Tailwind 写死在 JSX） | vue-porting §1/§7，复用 demo CSS；`SwipeRow` 的 Vue 实装自带 `SwipeRow.css` |
| 动画卡顿 / CPU 飙高 | 每帧写 `ref` 触发响应式 | vue-porting §4.1 |
| 切页后仍在跑 | 没清 rAF / 监听 / WebGL | vue-porting §8–§9 |
| WebGL 报错或黑屏 | DPR 过高、纹理跨域、context 未处理 | production-checklist §4/§6 |
| 移动端交互冲突 | 整页 `touch-action: none`、只做 hover | vue-porting §4.3（touch-action）、§12–§13（hover） |
| Nuxt 构建报 `window is not defined` | 模块顶层访问浏览器 API | vue-porting §11 |
| motion 元素的 DOM ref 拿不到 | `motion.div` 是组件，ref 是实例不是 DOM | vue-porting §5 |
| 改了 props，动画值停在旧位置 | `useTransform(input, fn)` 不追踪 Vue 响应式 | vue-porting §5 |
| 模板里的 SVG 滤镜不生效 | `feTurbulence` 等原语不在 Vue 的 SVG 标签表里，被当成未解析的组件，元素名是错的 | vue-porting §13 |

## Gallery

```bash
cd <本 SKILL.md 所在目录>/assets
npx serve .          # 或 python -m http.server
# 打开 http://localhost:3000/gallery.html
```

gallery 里可逐个预览、看依赖/难度/关键 API/源码路径；也可直接打开 `demos/<id>.html` 对照。