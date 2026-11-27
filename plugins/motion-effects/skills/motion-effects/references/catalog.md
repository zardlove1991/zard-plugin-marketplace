# 特效目录（27 个）

> 路径均相对 `skills/motion-effects/`。
> **Vue 难度**：`易` ≈ 1–2 小时直译；`中` ≈ 半天，需处理 ref / 生命周期 / motion-v；`难` ≈ 1–2 天，含 WebGL / three.js / canvas 大组件。
> **源文件**默认指 `assets/react/components/ui/`，演示指 `assets/demos/`。

## 场景速查

| 你想要 | 首选 | 备选 |
|---|---|---|
| 营销页首屏 / 滚动叙事 | `scroll-locked-video-hero` | `liquid-glass-logo-reveal`、`GridMotion` |
| 移动端列表操作 | `SwipeRow` | `RubberSegment`、`HoldButton` |
| 数据 / 功能展示 | `MagicBento` | `peak-chart`、`glassy-dashboard`、`AnimatedList`、`TiltedCard` |
| 玻璃拟态面板 | `GlassSurface` | `glass-folder-cards`、`liquid-glass-navbar`、`glassy-dashboard` |
| 身份卡 / 票券 / 3D 翻面 | `ReflectiveCard` | `FlipCard` |
| 导航 | `PillNav` | `liquid-glass-navbar` |
| 氛围装饰 | `GhostCursor` | `SplashCursor`、`PaperCrumple`、`GridMotion` |
| 拖拽碎纸 / 列表重排 | `Shredder` | `SwipeRow` |
| 卡片光斑 / 悬停高光 | `SpotlightCard` | `ReflectiveCard`、`GlassSurface` |
| 内容演示 | `terminal-replay` | `signature` |
| 图片墙 / 自动滚动网格 | `GridMotion` | — |
| 品牌 Logo 揭示 | `liquid-glass-logo-reveal` | — |
| AI 对话输入框 | `AIPromptBox` | — |
| 分步引导 / 引导流程 | `Stepper` | — |

## 总表

| # | 特效 | 分类 | 一句话 | 依赖 | 样式 | Vue |
|---|---|---|---|---|---|---|
| 1 | `AnimatedList` | 列表与内容 | 带入场/选中动效的列表，支持键盘导航 | Hugeicons（仅默认项图标） | CSS 文件 | 中 |
| 2 | `FlipCard` | 卡片与容器 | 3D 翻面卡片，可拖拽、倾斜、眩光 | `motion` | CSS 文件 | 中 |
| 3 | `GhostCursor` | 氛围与装饰 | WebGL2 流体光标拖尾 | 无 | CSS 文件 | 中 |
| 4 | `GlassSurface` | 卡片与容器 | 折射玻璃面板（SVG + WebGL 双路径） | 无 | CSS 文件 | 中 |
| 5 | `GridMotion` | 氛围与装饰 | 倾斜自动滚动照片/文字墙 + 聚光 | Tailwind | Tailwind | 中 |
| 6 | `HoldButton` | 操作与反馈 | 长按确认按钮（带进度/波浪/发光） | 无 | CSS 文件 | 易 |
| 7 | `MagicBento` | 卡片与容器 | 功能磁贴 Bento，聚光/边框光/粒子 | Hugeicons | CSS 文件 | 难 |
| 8 | `PaperCrumple` | 氛围与装饰 | three.js 纸张揉皱图片 | `three` | CSS 文件 | 难 |
| 9 | `PillNav` | 导航与页面 | 胶囊导航，桌面/移动折叠 | 无 | CSS 文件 | 中 |
| 10 | `ReflectiveCard` | 卡片与容器 | 金属反射证件卡，可选摄像头 | Hugeicons | CSS 文件 | 难 |
| 11 | `RubberSegment` | 操作与反馈 | 橡皮筋分段控件，可拖拽 | `motion` | CSS 文件 | 中 |
| 12 | `SpecularButton` | 操作与反馈 | WebGL 高光描边按钮 | 无 | CSS 文件 | 中 |
| 13 | `SwipeRow` | 操作与反馈 | 移动端滑动操作行（删除/归档） | `motion` + Hugeicons + Tailwind | Tailwind | 中 |
| 14 | `TiltedCard` | 卡片与容器 | 3D 倾斜卡片，鼠标/陀螺仪/翻面 | 无 | CSS 文件 | 中 |
| 15 | `glass-folder-cards` | 卡片与容器 | 玻璃文件夹卡片，canvas 生成封底画 | 无 | 内联 | 难 |
| 16 | `liquid-glass-logo-reveal` | 氛围与装饰 | 液态玻璃 Logo 揭示（WebGL2 + SDF） | `cn` | 内联 + 少量 Tailwind | 难 |
| 17 | `liquid-glass-navbar` | 导航与页面 | 液态玻璃导航栏（WebGL 水体 + 音效） | 无 | 内联 | 难 |
| 18 | `scroll-locked-video-hero` | 导航与页面 | 滚动锁定视频 Hero | 无 | 内联 | 易 |
| 19 | `signature` | 列表与内容 | 手写签名：播放/手写/导出 SVG | 无 | 内联 | 中 |
| 20 | `terminal-replay` | 列表与内容 | 终端会话逐字回放 | 无 | 内联 | 易 |
| 21 | `peak-chart` | 卡片与容器 | canvas 手绘辉光数据卡：曲线描绘 / 峰值脉冲 / 数字滚动 / 周期切换 | 无 | 内联 | 难 |
| 22 | `glassy-dashboard` | 卡片与容器 | 玻璃质感数据看板：四视图 / 图表揭示 / 数字滚动 / 明暗主题 / CSV 导出 | `gsap`、`@gsap/react`、`lucide-react`、`@fontsource-variable/manrope` | 内联 | 难 |
| 23 | `SplashCursor` | 氛围与装饰 | WebGL2 流体墨迹光标：跟手拖尾 / 点击飞溅 / 彩虹渐变 / 明暗主题 | 无 | 内联 | 难 |
| 24 | `Shredder` | 操作与反馈 | 可拖拽碎纸机：切条卷曲飘落 / 重排 / 循环 / 自动播放 / 键盘 shred | 无 | 内联 | 难 |
| 25 | `SpotlightCard` | 卡片与容器 | 光斑卡片：跟随指针的柔光 / 边缘邻近发光 / 光束形态 / 按压 flare / 颗粒 | 无 | 内联 | 中 |
| 26 | `AIPromptBox` | 操作与反馈 | AI 输入框：三种互斥模式 / 图片附件预览 / 语音录音 / 发送 | `motion-v` + `@lucide/vue` | CSS 文件 | 中 |
| 27 | `Stepper` | 操作与反馈 | 分步引导：数字 / 圆点 / 条形指示器，横向与纵向布局，滑动切换与弹簧高度动画 | Hugeicons | CSS 文件 | 中 |

## Vue 实装进度（0.1）

已移植、带测试、并在文档站有真实组件预览：

| 组件 | Vue 源码 | 测试 |
|---|---|---|
| `HoldButton` | `../../packages/vue/src/components/HoldButton.vue` | `../../packages/vue/tests/hold-button.spec.ts` |
| `SwipeRow` | `../../packages/vue/src/components/SwipeRow.vue` | `../../packages/vue/tests/swipe-row.spec.ts` |
| `SpecularButton` | `../../packages/vue/src/components/SpecularButton.vue` | `../../packages/vue/tests/specular-button.spec.ts` |
| `TerminalReplay` | `../../packages/vue/src/components/TerminalReplay.vue` | `../../packages/vue/tests/terminal-replay.spec.ts` |
| `ScrollLockedVideoHero` | `../../packages/vue/src/components/ScrollLockedVideoHero.vue` | `../../packages/vue/tests/scroll-locked-video-hero.spec.ts` |
| `PeakChart` | `../../packages/vue/src/components/PeakChart.vue` | `../../packages/vue/tests/peak-chart.spec.ts` |
| `GlassyDashboard` | `../../packages/vue/src/components/GlassyDashboard.vue` | `../../packages/vue/tests/glassy-dashboard.spec.ts` |
| `SplashCursor` | `../../packages/vue/src/components/SplashCursor.vue` | `../../packages/vue/tests/splash-cursor.spec.ts` |
| `Shredder` | `../../packages/vue/src/components/Shredder.vue` | `../../packages/vue/tests/shredder.spec.ts` |
| `SpotlightCard` | `../../packages/vue/src/components/SpotlightCard.vue` | `../../packages/vue/tests/spotlight-card.spec.ts` |
| `LiquidNavbar` | `../../packages/vue/src/components/LiquidNavbar.vue` | `../../packages/vue/tests/liquid-navbar.spec.ts` |
| `GlassSurface` | `../../packages/vue/src/components/GlassSurface.vue` | `../../packages/vue/tests/glass-surface.spec.ts` |
| `AnimatedList` | `../../packages/vue/src/components/AnimatedList.vue` | `../../packages/vue/tests/animated-list.spec.ts` |
| `FlipCard` | `../../packages/vue/src/components/FlipCard.vue` | `../../packages/vue/tests/flip-card.spec.ts` |
| `GhostCursor` | `../../packages/vue/src/components/GhostCursor.vue` | `../../packages/vue/tests/ghost-cursor.spec.ts` |
| `GridMotion` | `../../packages/vue/src/components/GridMotion.vue` | `../../packages/vue/tests/grid-motion.spec.ts` |
| `RubberSegment` | `../../packages/vue/src/components/RubberSegment.vue` | `../../packages/vue/tests/rubber-segment.spec.ts` |
| `TiltedCard` | `../../packages/vue/src/components/TiltedCard.vue` | `../../packages/vue/tests/tilted-card.spec.ts` |
| `Signature` | `../../packages/vue/src/components/Signature.vue` | `../../packages/vue/tests/signature.spec.ts` |
| `PaperCrumple` | `../../packages/vue/src/components/PaperCrumple.vue` | `../../packages/vue/tests/paper-crumple.spec.ts` |
| `ReflectiveCard` | `../../packages/vue/src/components/ReflectiveCard.vue` | `../../packages/vue/tests/reflective-card.spec.ts` |
| `PillNav` | `../../packages/vue/src/components/PillNav.vue` | `../../packages/vue/tests/pill-nav.spec.ts` |
| `MagicBento` | `../../packages/vue/src/components/MagicBento.vue` | `../../packages/vue/tests/magic-bento.spec.ts` |
| `GlassFolder` | `../../packages/vue/src/components/GlassFolder.vue` | `../../packages/vue/tests/glass-folder.spec.ts` |
| `GlassIconReveal` | `../../packages/vue/src/components/GlassIconReveal.vue` | `../../packages/vue/tests/liquid-glass-logo-reveal.spec.ts` |
| `AIPromptBox` | `../../packages/vue/src/components/AIPromptBox.vue` | `../../packages/vue/tests/ai-prompt-box.spec.ts` |
| `Stepper` | `../../packages/vue/src/components/Stepper.vue` | `../../packages/vue/tests/stepper.spec.ts` |

全部 27 个特效均已有 Vue 3 实装；React 源码与 vanilla 演示保留作对照真源。

后二十四个（`TerminalReplay`、`ScrollLockedVideoHero`、`PeakChart`、`GlassyDashboard`、`SplashCursor`、`Shredder`、`SpotlightCard`、`LiquidNavbar`、`GlassSurface`、`AnimatedList`、`FlipCard`、`GhostCursor`、`GridMotion`、`RubberSegment`、`TiltedCard`、`Signature`、`PaperCrumple`、`ReflectiveCard`、`PillNav`、`MagicBento`、`GlassFolder`、`GlassIconReveal`、`AIPromptBox`、`Stepper`）与 React 原件有几处有意的行为差异，见 `../../packages/vue/README.md` 的「与 React 原件的差异」。

> Vue 实装自带 CSS，不依赖 Tailwind；需要安装的依赖见下面「依赖安装」。

## 依赖安装（Vue 3 项目，pnpm）

```bash
# 按需安装，不要全量装
pnpm add motion-v @vueuse/core    # FlipCard / RubberSegment / SwipeRow；@vueuse/core 是 motion-v 的 peer
pnpm add @hugeicons/vue @hugeicons/core-free-icons   # AnimatedList / MagicBento / ReflectiveCard / SwipeRow / Stepper
pnpm add three                   # PaperCrumple
pnpm add clsx tailwind-merge     # liquid-glass-logo-reveal 的 cn()
pnpm add gsap @gsap/react lucide-react @fontsource-variable/manrope   # glassy-dashboard（React 原件）
pnpm add gsap @lucide/vue @fontsource-variable/manrope                # glassy-dashboard 的 Vue 3 实装
# splash-cursor 零第三方依赖（纯 WebGL2 + 原生 pointer 事件），React / Vue 都不用额外安装
# GridMotion / SwipeRow 的原生样式用 Tailwind；不装 Tailwind 时复用 demo CSS（见下）
```

React 项目对应：`motion` + `@hugeicons/react`；`glassy-dashboard` 另需 `gsap`、`@gsap/react`、`lucide-react`、`@fontsource-variable/manrope`。Tailwind **不是必装**：只有 `GridMotion` / `SwipeRow` 的原生样式依赖它；Vue 项目不装 Tailwind 时，按下面「Tailwind」一条的替代路径（复用 demo CSS）处理即可。

**样式形态分三类**：

- **CSS 文件**（12 个）：源码旁有同名 `.css`，直接一起复制。
- **Tailwind**（`GridMotion`、`SwipeRow`、`Stepper`）：React 源码没有独立 CSS，样式写死在 JSX 的任意值类里；Vue 项目不用 Tailwind 时，直接复用对应 demo 里的等价 CSS（`grid-motion.html` / `swipe-row.html` / `stepper.html`），不要逐条翻译任意值类。`SwipeRow` 与 `Stepper` 的 Vue 实装已带提取好的同名 CSS。
- **内联**（TSX）：样式在组件文件的 `<style>` / style 对象里，随源码一起搬；`liquid-glass-logo-reveal` 的容器另有 5 个 Tailwind 工具类，可手写成普通 CSS；`glassy-dashboard` 把整份 `dashboardStyles` 以 `<style>{dashboardStyles}</style>` 注入，不依赖 Tailwind。

---

## 1. AnimatedList · 动态列表

- **源码**：`AnimatedList.jsx` + `AnimatedList.css`；**演示**：`animated-list.html`
- **Vue 实装**：`../../packages/vue/src/components/AnimatedList.vue`（已测试；引擎在 `../../packages/vue/src/composables/useAnimatedList.ts`，默认项图标在 `animatedListIcons.ts`）
- **适用**：文件列表、通知流、搜索结果、设置项；需要"逐项入场 + 悬停选中 + 键盘上下选择"。
- **关键 API**：`items`（`{ title, description, meta, icon, image }`）、`onItemSelect`、`renderItem`、`initialSelectedIndex`、`selectOnHover`、`enableArrowNavigation`、`loop`、`animation`（`pop`/`slide`/`fade`）、`animateOnce`、`stagger`、`showGradients`、`displayScrollbar`、`frame`、`theme`（`dark`/`light`）、`accentColor`、`radius`、`gap`、`width`、`maxHeight`。
- **移植要点**：rAF 引擎做滚动与弹簧指示条；Vue 用 `onMounted` + 模板 ref，逐帧状态放普通对象里直接写 DOM（不进响应式）。`renderItem` 换成 `#item` 作用域插槽，`onItemSelect` 换成 `select` 事件，`icon` 从 React 节点换成 Vue 组件（默认项随包导出）。运行中改 `items` / `animation` 走 `watch` 重新同步，不再靠空依赖 effect 偷读 ref。
- **注意**：不是虚拟列表，`items` 很大时需外层分页或虚拟滚动；键盘焦点与 `aria-activedescendant` 要保留。入场由 `IntersectionObserver` 触发，未滚入视口时条目保持隐藏（`animation="none"` 立即显示）。

## 2. FlipCard · 3D 翻面卡片

- **源码**：`FlipCard.jsx` + `FlipCard.css`；**演示**：`flip-card.html`
- **Vue 实装**：`../../packages/vue/src/components/FlipCard.vue`（已测试；引擎在 `../../packages/vue/src/composables/useFlipCard.ts`）
- **适用**：前后信息卡、价格卡翻面、产品详情、抽奖/刮奖式揭示。
- **关键 API**：`front` / `back`（节点 → Vue 插槽）、`flipped`（受控 → `v-model:flipped`）、`defaultFlipped`、`onFlipChange`、`axis`（`x`/`y`）、`flipOnClick`、`draggable`、`dragDistance`、`tilt`、`tiltMax`、`glare`、`glareOpacity`、`hoverScale`、`perspective`、`stiffness`、`damping`、`width`、`height`、`radius`、`background`、`color`、`shadow`、`disabled`、`ariaLabel`。
- **移植要点**：`motion/react` → `motion-v`；`useMotionValue` / `useSpring` / `useTransform` 同名可用。拖拽用 `@pointerdown/move/up` + `setPointerCapture`。翻面角度 `turn` 用 `computed` 派生 `rotate`。
- **注意**：`backface-visibility` 与 Safari 需要保留 CSS 里的 `translateZ`；`prefers-reduced-motion` 下应直接切换正反面，不做旋转。

## 3. GhostCursor · 流体光标

- **源码**：`GhostCursor.jsx` + `GhostCursor.css`；**演示**：`ghost-cursor.html`
- **Vue 实装**：`../../packages/vue/src/components/GhostCursor.vue`（已测试；引擎在 `../../packages/vue/src/composables/useGhostCursor.ts`，着色器在 `ghostCursorShaders.ts`）
- **适用**：深色落地页、作品集、发布会页面的全局光标氛围；桌面端。
- **关键 API**：`color`、`brightness`、`size`、`trailLength`、`inertia`、`turbulence`、`drift`、`detail`、`grainIntensity`、`bloomStrength`、`bloomRadius`、`bloomThreshold`、`edgeIntensity`、`clickPuff`、`intro`、`theme`、`mixBlendMode`、`fadeDelayMs`、`fadeDurationMs`、`maxDevicePixelRatio`、`zIndex`。
- **移植要点**：整段 WebGL2 shader 原样保留；Vue 只需 `canvas` ref + `onMounted` 建 context、`onBeforeUnmount` 删 program/buffer/texture 并 `cancelAnimationFrame`。容器 `pointer-events: none; position: fixed; inset: 0`。
- **注意**：最多同时一个；移动端/触屏建议直接不渲染（组件内部已有触摸检测）；GPU 弱机把 `maxDevicePixelRatio` 降到 1–1.5；页面隐藏时暂停。

## 4. GlassSurface · 折射玻璃

- **源码**：`GlassSurface.jsx` + `GlassSurface.css`；**演示**：`glass-surface.html`
- **Vue 实装**：`../../packages/vue/src/components/GlassSurface.vue`（已测试；引擎在 `../../packages/vue/src/composables/useGlassSurface.ts`）
- **适用**：玻璃卡片、磨砂面板、登录框、悬浮工具条；需要真实折射/色散而非普通 `backdrop-filter`。
- **关键 API**：`children`（插槽）、`width`、`height`、`borderRadius`、`borderWidth`、`brightness`、`opacity`、`blur`、`displace`、`backgroundOpacity`、`saturation`、`distortionScale`、`redOffset` / `greenOffset` / `blueOffset`、`xChannel` / `yChannel`、`mixBlendMode`、`refraction`、`renderer`（`auto`/`svg`/`webgl`）、`backdrop`（背景图）、`shape`。
- **移植要点**：组件同时有 SVG filter 与 WebGL2 路径，`renderer: 'auto'` 会探测；Vue 保留两条路径，`fe*` 滤镜原语用 `h()` 生成（写进模板会变成未解析组件），SVG 属性按 spec 保持驼峰 / 连字符的原始写法。置换贴图、通道选择器等高频 DOM 更新走普通变量与 `setAttribute`，不进响应式；`backdrop` 接受 DOM / Vue Ref / `{ current }`，用同源图片避免纹理污染。
- **注意**：玻璃效果依赖"背后有内容"，纯色背景上看不出折射；Chromium 默认走 SVG 折射、其它浏览器给了 `backdrop` 才走 WebGL2，两者都不可用退回雾面；Vue 实装在 `webglcontextlost` 后随浏览器恢复重建资源（上游永久降至降级路径）。不要嵌套多层玻璃，性能与观感都会崩。

## 5. GridMotion · 动感网格墙

- **源码**：`GridMotion.jsx`；**演示**：`grid-motion.html`
- **Vue 实装**：`../../packages/vue/src/components/GridMotion.vue`（已测试；引擎在 `../../packages/vue/src/composables/useGridMotion.ts`，样式从 demo 抽成 `GridMotion.css`）
- **适用**：作品集照片墙、客户 Logo 墙、关键词墙、产品图流。
- **关键 API**：`items`（字符串 → 文字块；`{ src, alt }` → 图片；VNode → 自定义节点）、`rows`、`aspectRatio`、`gap`、`radius`、`angle`、`tilt`、`speed`、`direction`（`alternate`/`up`/`down`/`left`/`right`）、`parallax`、`spotlight`、`dim`、`grayscale`、`fade`、`tileColor`、`textColor`、`theme`。
- **移植要点**：React 版依赖 Tailwind（类名是常量字符串）；Vue 实装直接把 demo 的 `.gm-*` 规则落成 `GridMotion.css` 全局引入，不依赖 Tailwind。滚动 / 聚光用 rAF 写 `transform` 与 `--spot`，逐帧状态是普通数组 / Float32Array，不进响应式；`isValidElement` 的节点项换成 `#tile` 作用域插槽。
- **注意**：图片走 `<img>`，注意 CORS/尺寸；`items` 少于 `rows × perRow` 会循环填充；移动端降低 `rows` 与 `speed`。

## 6. HoldButton · 长按确认

- **源码**：`HoldButton.jsx` + `HoldButton.css`；**演示**：`hold-button.html`
- **Vue 实装**：`../../packages/vue/src/components/HoldButton.vue`（已测试）
- **适用**：删除、支付、重启、危险操作；比二次确认弹窗更顺手。
- **关键 API**：`children`（默认文案）、`doneLabel`、`icon`、`doneIcon`、`backgroundColor`、`fillColor`、`textColor`、`fillTextColor`、`size`、`radius`、`fillDirection`、`holdTime`、`releaseTime`、`pressScale`、`wave`、`waveAmplitude`、`glow`、`resetAfter`、`disabled`、`onHold`、`onTap`。
- **移植要点**：核心是 `pointerdown` 起计时、`pointermove` 出界取消、键盘 Space/Enter 长按、`Escape` 取消；Vue 里 phase 用 `shallowRef`，timer 与逐帧进度放普通对象，卸载清理。进度条用 CSS 变量逐帧写，不要 `setState` 每帧。
- **注意**：长按时长建议 1.2–2.5s；必须阻止右键菜单与文本选择；触屏与鼠标都要测；`onHold` 触发后给可见的成功态。

## 7. MagicBento · 功能磁贴

- **源码**：`MagicBento.jsx` + `MagicBento.css`；**演示**：`magic-bento.html`
- **Vue 实装**：`../../packages/vue/src/components/MagicBento.vue`（已测试；可视化在 `MagicBentoVisual.vue`，引擎在 `useMagicBento.ts`，常量在 `magicBentoHelpers.ts`）
- **适用**：SaaS 功能总览、后台看板、营销页能力矩阵。
- **关键 API**：`items`（`{ title, description, visual, icon, image, content, colSpan, rowSpan, href, onClick, id }`）、`columns`、`rowHeight`、`gap`、`radius`、`theme`、`glowColor`、`textAutoHide`、`enableBorderGlow`、`enableSpotlight`、`spotlightRadius`、`enableStars`、`particleCount`、`enableTilt`、`enableMagnetism`、`clickEffect`、`intro`、`disableAnimations`、`onItemClick`。
- **移植要点**：1131 行 JSX + 1126 行 CSS，是库里最大的组件。建议**整文件 1:1 直译**：模板结构、CSS、rAF 引擎、视觉子组件（`AnalyticsVisual` 等）都保留；把 `items` 的节点字段换成插槽。`useIsomorphicLayoutEffect` → `onMounted` + `nextTick`。
- **注意**：`visual` 预设是示例内容，业务里通常要换成真实图表；粒子/聚光/倾斜同时开会明显吃 GPU；移动端建议关 `enableStars` 与 `enableTilt`。

## 8. PaperCrumple · 纸张揉皱

- **源码**：`PaperCrumple.jsx` + `PaperCrumple.css`；**演示**：`paper-crumple.html`
- **Vue 实装**：`../../packages/vue/src/components/PaperCrumple.vue`（已测试；布料求解在 `paperCrumplePhysics.ts`，three.js 引擎在 `usePaperCrumple.ts`）
- **适用**：图片"揉皱/展开"的戏剧化揭示、失败/删除反馈、艺术化产品图。
- **关键 API**：`src`、`alt`、`backSrc`、`width`、`height`、`sceneHeight`、`imageFit`、`releaseBehavior`（`restore`/`stay`）、`crumpleAmount`、`crumpleDuration`、`releaseDuration`、`foldCount`、`foldSharpness`、`wrinkleDepth`、`creaseStrength`、`paperColor`、`roughness`、`paperTexture`、`lightIntensity`、`lightAngle`、`shadow`、`shadowOpacity`、`draggable`、`dragRotation`、`dragRadius`、`returnToOrigin`、`rotation`、`seed`、`detail`、`disabled`、`resetKey`、`onStateChange`、`onError`。
- **移植要点**：three.js 场景与几何生成逻辑原样保留；Vue 用 `shallowRef`/`markRaw` 存 renderer/scene，`onMounted` 初始化，`onBeforeUnmount` 里 `dispose()` 几何/材质/renderer 并移除 canvas。`three` 建议动态 `import()`。
- **注意**：包体积大（three ~600KB min）；移动端降低 `detail`；图片纹理必须同源或 CORS 允许；`seed` 决定折痕，换 seed 换形态。演示依赖真实 GPU，无硬件加速的 headless 环境可能白屏，以真机为准。

## 9. PillNav · 胶囊导航

- **源码**：`PillNav.jsx` + `PillNav.css`；**演示**：`pill-nav.html`
- **Vue 实装**：`../../packages/vue/src/components/PillNav.vue`（已测试；引擎在 `../../packages/vue/src/composables/usePillNav.ts`，默认项在 `pillNavItems.ts`）
- **适用**：官网顶部导航、产品页分区切换、移动端折叠菜单。
- **关键 API**：`logo`、`logoAlt`、`logoHref`、`items`（`{ label, href, icon }`）、`activeHref`、`defaultActiveIndex`、`onItemClick`、`linkComponent`、`theme`、`layout`（`split`/`center`）、`size`、`surface`（`glass`/`solid`）、`itemStyle`、`hoverEffect`、`indicator`、`highlightColor`、`highlightTextColor`、`barColor`、`textColor`、`bounce`、`stretch`、`intro`、`collapse`、`onMenuToggle`、`ariaLabel`。
- **移植要点**：`linkComponent` → Vue 用 `component :is` 或插槽；内部有测量克隆节点（`MEASURE`），CSS 必须全局引入（scoped 样式加不到克隆节点上）。折叠菜单的 focus trap 与 `Esc` 要保留。
- **注意**：移动端折叠阈值与 `collapse` 参数相关；玻璃表面在低对比背景上要调 `surface`/`barColor`；logo 传 URL 或节点。

## 10. ReflectiveCard · 金属反射卡

- **源码**：`ReflectiveCard.jsx` + `ReflectiveCard.css`；**演示**：`reflective-card.html`
- **Vue 实装**：`../../packages/vue/src/components/ReflectiveCard.vue`（已测试；着色器 / 渲染器在 `reflectiveCardEngine.ts`，生命周期在 `useReflectiveCard.ts`）
- **适用**：会员卡、工牌、票券、产品防伪卡；金属反射 + 倾斜 + 可选摄像头。
- **关键 API**：`name`、`role`、`badge`、`status`、`statusColor`、`idLabel`、`idValue`、`children`、`theme`、`videoSrc`、`webcam`、`onWebcamError`、`tint`、`metalness`、`roughness`、`blurStrength`、`grayscale`、`warp`、`warpScale`、`shine`、`bevel`、`glare`、`enableTilt`、`tiltStrength`、`intro`、`width`、`height`、`radius`。
- **移植要点**：WebGL2 反射 shader 原样保留；`webcam` 用 `navigator.mediaDevices.getUserMedia`，Vue 在 `onBeforeUnmount` 必须 `track.stop()`；`videoSrc` 跨域视频会污染纹理。
- **注意**：摄像头必须用户手势触发、明确告知用途；无 WebGL2 时要有静态卡降级；不要默认开摄像头。

## 11. RubberSegment · 橡皮筋分段

- **源码**：`RubberSegment.jsx` + `RubberSegment.css`；**演示**：`rubber-segment.html`
- **Vue 实装**：`../../packages/vue/src/components/RubberSegment.vue`（已测试；引擎在 `../../packages/vue/src/composables/useRubberSegment.ts`）
- **适用**：移动端 Tab 切换、筛选器、视图切换；拖拽时有橡皮筋手感。
- **关键 API**：`items`（字符串或 `{ value, label }`）、`value`（受控 → `v-model`）、`defaultValue`、`onChange`、`trackColor`、`thumbColor`、`textColor`、`activeTextColor`、`size`、`radius`、`inset`、`equalSlots`、`stretch`、`squash`、`speed`、`glide`、`draggable`、`disabled`、`aria-label`。
- **移植要点**：`motion/react` → `motion-v`；拖拽/速度/回弹的手感常量（`DILATE`、`HANDOFF`、`FLICK`、`RUBBER`）不要改。`value` 用 `defineModel`。
- **注意**：键盘左右切换与 `role="radiogroup"` 要保留；触屏 `touch-action: none` 只加在轨道上，别锁整页。

## 12. SpecularButton · 高光按钮

- **源码**：`SpecularButton.jsx` + `SpecularButton.css`；**演示**：`specular-button.html`
- **Vue 实装**：`../../packages/vue/src/components/SpecularButton.vue`（已测试，含 WebGL 上下文丢失 / 恢复）
- **适用**：落地页主 CTA、深色界面里的重点按钮、订阅/购买。
- **关键 API**：`children`（插槽）、`size`、`radius`、`tint`、`tintOpacity`、`blur`、`textColor`、`lineColor`、`baseColor`、`intensity`、`idleIntensity`、`shineSize`、`shineFade`、`thickness`、`glow`、`speed`、`followMouse`、`proximity`、`autoAnimate`、`disabled`、`onClick`、`type`。
- **移植要点**：WebGL2 高光 shader 原样保留；Vue 里 `button` 根节点 + `canvas` 子节点，事件透传 `$attrs`；卸载时删 program/buffer 并停 rAF；上下文恢复后重建 program / buffer / VAO（`webglcontextlost` 里调了 `preventDefault` 就必须做）。
- **注意**：`autoAnimate` 适合无鼠标场景；WebGL 不可用时 CSS 边框/渐变要能兜底；按钮的可点击区域与 `disabled` 语义留在真实 `<button>` 上。

## 13. SwipeRow · 滑动操作行

- **源码**：`SwipeRow.jsx`；**演示**：`swipe-row.html`
- **Vue 实装**：`../../packages/vue/src/components/SwipeRow.vue`（已测试，`motion-v` + 手势 + 键盘）
- **适用**：移动端消息/订单/文件列表的左滑删除、归档、置顶。
- **关键 API**：`children`（插槽）、`actions`（`{ id, label, icon, dismiss?, onSelect? }`）、`actionColor`、`drawerColor`、`rowColor`、`textColor`、`height`、`radius`、`actionWidth`、`direction`（`left` = 向左滑、操作区在右侧；`right` 反之）、`snapBounce`、`resistance`、`collapseMs`、`commitAt`、`fullSwipe`、`disabled`、`open`（受控）、`onOpenChange`、`onAction`、`onCommit`、`closeOnAction`、`haptic`、`label`。
- **移植要点**：React 源码没有独立 CSS，样式在 JSX 的 Tailwind 任意值类里；Vue 实装已带从 demo 提取的 `SwipeRow.css`，从 React 源码重新移植时复用 `assets/demos/swipe-row.html` 的 `.sr-*` 规则（与组件等价），不要逐条翻译。逻辑用 `motion-v` + 指针事件；`open` 用 `defineModel`，挂载时同步初始值。`haptic` 是 `navigator.vibrate`，无则静默。键盘 `Delete`/`Backspace` 与 `Escape` 要保留。
- **注意**：`onCommit` 是整行滑到底的提交；组件会折叠该行，**从列表数据中移除由父级负责**。点击 action 时先触发 `onAction(action)`；`dismiss: true`（或首个 action）走提交路径——折叠行 → `collapseMs` 后 `onCommit(action)` → `action.onSelect()`；其余 action 立即 `action.onSelect()`，再由 `closeOnAction` 决定是否收起。桌面端提供可见的操作入口，不要只靠滑动；滑出后点击行内其他链接要先关闭；`touch-action: pan-y` 保垂直滚动。

## 14. TiltedCard · 3D 倾斜卡片

- **源码**：`TiltedCard.jsx` + `TiltedCard.css`；**演示**：`tilted-card.html`
- **Vue 实装**：`../../packages/vue/src/components/TiltedCard.vue`（已测试；引擎在 `../../packages/vue/src/composables/useTiltedCard.ts`，视差层 `TiltedCardLayer.vue`）
- **适用**：图片卡、团队成员、商品卡、作品封面；鼠标跟随倾斜 + 眩光 + 可选翻面。
- **关键 API**：`imageSrc`、`altText`、`captionText`、`containerHeight`、`containerWidth`、`imageHeight`、`imageWidth`、`scaleOnHover`、`rotateAmplitude`、`showTooltip`、`overlayContent`、`displayOverlayContent`、`overlayDepth`、`children`、`backContent`、`flipOnClick`、`flipped`、`onFlip`、`radius`、`perspective`、`smoothness`、`glare`、`glareColor`、`shadow`、`parallax`、`axis`、`reverse`、`trackWindow`、`floating`、`gyroscope`、`intro`、`introDelay`、`onClick`。
- **移植要点**：纯指针/陀螺仪数学，无第三方依赖；Vue 直接把 rAF 引擎搬进 `onMounted`，DOM 引用用模板 ref。`overlayContent`/`backContent` → 插槽。
- **注意**：iOS 陀螺仪需要 `DeviceOrientationEvent.requestPermission()`（用户手势）；`prefers-reduced-motion` 下关倾斜；触屏用 `resize`/滚动位置而不是鼠标。

## 15. glass-folder-cards · 玻璃文件夹

- **源码**：`glass-folder-cards.tsx`（含类型与导出工具函数）；**演示**：`folders.html`
- **适用**：文件/项目集合、相册、课程包、资料库；打开文件夹时文件扇形展开。
- **关键 API**：`label`、`meta`、`tone`（`light`/`dark`）、`art`（`aurora`/`ember`/`dusk`/`glacier`/`verdant`/自定义 recipe/`none`）、`seed`、`image`、`files`（`{ name, ... }`）、`action`（`add`/`more`/`none`）、`onAdd`、`onFilesChange`、`menu`、`labelPlacement`、`open`、`defaultOpen`、`onOpenChange`、`onFileSelect`、`width`、`appear`、`appearDelay`。
- **移植要点**：1326 行 TSX，核心是 canvas 生成的抽象封底画 + 多层 DOM；类型定义（`ArtPreset`、`ArtRecipe`、`GlassFolderProps`）可直接翻成 Vue 的 TS 类型。`files` 是"读一次后组件自持"的语义，Vue 用 `defineModel` 或 `onFilesChange` 同步。
- **注意**：生成艺术按 recipe 缓存，别每帧重画；`width` 决定整体尺寸（高度 = 0.96×width）；文件夹内的文件是真实可聚焦按钮，别用纯装饰替代。

## 16. liquid-glass-logo-reveal · 液态玻璃 Logo

- **源码**：`liquid-glass-logo-reveal.tsx`；**演示**：`reveal.html`
- **适用**：品牌开场、App 图标揭示、落地页首屏标志动画。
- **关键 API**：`logo`（SVG 字符串或图片 URL）、`look`（`light`/`dark`）、`background`、`logoColor`、`plateColor`、`iconPlate`、`keepPlate`、`originalColors`、`tileSize`、`logoScale`、`finalScale`、`logoOffset`、`loop`、`hold`、`speed`、`time`（定格秒数，可做滚动驱动）、`tuning`、`label`。
- **移植要点**：WebGL2 shader + SDF 全在文件内；Vue 只负责 canvas 生命周期与 props 透传。`cn` 换成项目自己的 class 合并工具或直接模板字符串。`GlassIconReveal` 是接受自定义 logo 的导出，`GlassReveal21st` 是 21st.dev 默认标记。
- **注意**：Logo 纹理必须同源/CORS；`background` 要与页面底色一致，否则玻璃边缘会露馅；WebGL2 不可用时用 `fallback` 静态图；`time` 适合滚动进度绑定。

## 17. liquid-glass-navbar · 液态玻璃导航

- **源码**：`liquid-glass-navbar.tsx`；**演示**：`navbar.html`
- **Vue 实装**：`../../packages/vue/src/components/LiquidNavbar.vue`（已测试；引擎在 `../../packages/vue/src/composables/useLiquidNavbar.ts`）
- **适用**：深色官网/产品页底部或顶部导航，点击有水体波纹与音效。
- **关键 API**：`items`（`{ label, href, icon, fx }`，`fx` = `glow`/`spin`/`plane`/`drop`/`wave`/`pop`/`none`）、`defaultActive`、`active`、`onChange`、`tone`（`light`/`dark`）、`compact`、`sound`。
- **移植要点**：单个 TSX 内嵌 WebGL（1）着色器 + CSS 水滴降级 + Web Audio 合成音，零依赖；引擎原样抽进 composable，逐帧状态用普通对象。当前项走 `v-model:active`，不保留 `onChange`；`icon` 从 React 节点换成 Vue 组件（随包导出 `NimbusIcons`），`href` 有值渲染成链接、否则是按钮。水体是 GLSL ES 1.00（`gl_FragColor`），走 `getContext('webgl')`，和库里其它组件的 WebGL2 不是一回事。
- **注意**：音效需要用户手势后才能播放；`compact` 是三态（不传时 520px 以下自动收成纯图标）；无 WebGL 或着色器编译失败时自动退回 CSS 水滴，别额外做第二套；折射（`backdrop-filter: url(#…)`）只有 Chromium 支持；移动端底部安全区（`env(safe-area-inset-bottom)`）要留。Vue 实装的上下文丢失后会随浏览器恢复并重建着色器，`prefers-reduced-motion` 下帧循环在到位后停下。

## 18. scroll-locked-video-hero · 滚动锁定视频 Hero

- **源码**：`scroll-locked-video-hero.tsx`；**演示**：`index-video-hero.html`
- **Vue 实装**：`../../packages/vue/src/components/ScrollLockedVideoHero.vue`（已测试；会锁定页面滚动，文档站的 live 预览放在 iframe 里）
- **适用**：品牌首屏、产品发布页、沉浸式滚动叙事。
- **关键 API**：`videoSrc`、`title`、`scrollHint`、`tagline`、`signature`（`{ name, url }` 或 `false`）、`scrubDistance`（滚满整段视频的像素距离，默认 3200）、`className`、`style`。
- **移植要点**：挂载时把 `body` 设成 `position: fixed` 锁住页面，`window` 上的 `wheel` / `touchmove`（非 passive，另在元素上用捕获阶段再绑一次）只用来累计进度；rAF 里按每帧 18% 的缓动把进度 seek 到 `video.currentTime`，同时更新标题 / 提示 / 进度线；卸载时移除监听并恢复 `body`。视频 `muted`、`playsInline`、`preload="auto"` 保留。Vue 实装把 `scrubDistance` 做成惰性读取，改它不会重置状态。
- **注意**：**挂载期间页面无法滚动，而且不会自行解锁**，不要内嵌进还有其它内容的页面。移动端 iOS 需要 `playsInline` 且可能不允许精确 seek，准备 poster/降级；视频体积大，建议 H.264 + CDN 分段；`scrubDistance` 要按视频时长调；`prefers-reduced-motion` 下不做动画，直接停在 92% 处的一帧。

## 19. signature · 手写签名

- **源码**：`signature.tsx`；**演示**：`signature.html`
- **Vue 实装**：`../../packages/vue/src/components/Signature.vue`（已测试；引擎在 `../../packages/vue/src/composables/useSignature.ts`，默认笔迹在 `signatureStrokes.ts`）
- **适用**：电子签名、合同确认、证书、品牌手写标语。
- **关键 API**：`mode`（`play`/`sign`）、`strokes`、`text`、`pen`（`fountain`/`ballpoint`/`marker`）、`thickness`、`speed`、`autoplay`、`loop`、`pause`、`frame`、`line`、`name`、`role`、`placeholder`、`aspect`、`intro`、`theme`、`inkColor`、`surfaceColor`、`onChange`、`onComplete`；暴露 `play` / `clear` / `undo` / `getStrokes` / `toSVG` / `toDataURL`。
- **移植要点**：SVG path + 指针绘制；Vue 用 `defineExpose` 暴露同样的方法，`ref` 调用。`sign` 模式要处理高 DPI 与坐标归一化。
- **注意**：签名是敏感数据，别默认上传；`toDataURL` 产物给业务方保存；触屏 `touch-action: none`；提供清除/撤销。

## 20. terminal-replay · 终端回放

- **源码**：`terminal-replay.tsx`；**演示**：`terminal-replay.html`
- **Vue 实装**：`../../packages/vue/src/components/TerminalReplay.vue`（已测试）
- **适用**：安装教程、CLI 产品演示、开发者文档、CI 日志展示。
- **关键 API**：`script`（`command`/`output`/`spinner`/`progress`/`pause`/`clear` 步骤）、`title`、`prompt`、`directory`、`chrome`、`frame`、`dots`、`theme`、`accentColor`、`windowColor`、`textColor`、`fontFamily`、`fontSize`、`lineHeight`、`height`、`radius`、`typingSpeed`、`variance`、`lineDelay`、`startDelay`、`hold`、`loop`、`autoplay`、`cursor`、`copyable`、`interactive`、`onComplete`。
- **移植要点**：纯定时器 + 状态机；Vue 用 `onMounted` 启动、`onBeforeUnmount` 清所有 timer 与 IntersectionObserver。挂载即开始播放，`autoplay=false` 只是关闭离屏暂停（与 prop 的名字不符，上游如此）；手动重播通过 ref 调 `play()`。步骤数据可直接复用 `PROJECT_SETUP_SCRIPT` 的结构。
- **注意**：`loop` 与 `onComplete` 不要同时依赖；`copyable` 要处理 `navigator.clipboard` 失败；等宽字体与行高要锁死，避免回放时抖动。行内标签的闭合写作 `[/]`；上游 React 源码的正则要求 `[/success]`，所以标签在 React 版里不会被解析、是原样打印的。

## 21. peak-chart · 峰值辉光卡片

- **源码**：`peak-chart.tsx`；**演示**：`peak-chart.html`
- **Vue 实装**：`../../packages/vue/src/components/PeakChart.vue`（已测试；引擎在 `../../packages/vue/src/composables/usePeakChart.ts`）
- **适用**：转化率 / 活跃用户等指标卡、深色数据看板、营销页数据亮点；需要"曲线描绘 + 峰值脉冲 + 数字滚动"的揭示动效。
- **关键 API**：`data`、`labels`、`value`、`valueSuffix`、`decimals`、`title`、`caption`、`updatedText`、`trend`（`up`/`down`/`none`）、`periods`、`period`（受控 → Vue 用 `v-model:period`）、`defaultPeriod`、`onPeriodChange`、`accent`、`width`、`loop`、`backdrop`、`formatValue`、`font`。
- **移植要点**：纯 canvas 2d + rAF，零第三方依赖。辉光场是逐像素程序化绘制（`buildField`：蓝色底 + 高斯阴影 + 三层内 rim + 颗粒），静态层只建一次缓存，不要每帧重画；曲线是 Steffen 单调三次插值，保证最高数据点就是曲线顶点；时间轴常量（`T_DRAW` / `T_NUM` / `T_REST` 等）与缓动不要改。Vue 实装把引擎抽进 `usePeakChart.ts`，逐帧状态用普通对象直写 DOM；`period` 用 `defineModel`；`accent` 偏离参考蓝 `#4f8ef7` 时对 canvas 做 `hue-rotate` + `saturate`。
- **注意**：`width` 决定全部尺寸（高度 = width × 696/540），运行中改 `width` 会重建画布并重播揭示（上游语义）；圆点静息在 `peakX + 8`（`DOT_DX`），hover 读数取圆点处的值；hover 期间静息窗口暂停时钟；`loop` > 0 按秒循环（最小 6s）；`prefers-reduced-motion` 直接停终态；无 2d 上下文时静态显示终态数字（Vue 版对上游 `grainTile()` 抛错加了守卫）。

## 22. glassy-dashboard · 玻璃质感数据看板

- **源码**：`glassy-dashboard.tsx`（用法示例 `glassy-dashboard-demo.tsx`）；**演示**：`glassy-dashboard.html`
- **Vue 实装**：`../../packages/vue/src/components/GlassyDashboard.vue`（已测试；数据与格式化在 `useGlassyDashboard.ts`，GSAP 时间线在 `useGlassyDashboardMotion.ts`）
- **适用**：SaaS 运营控制台、数据看板演示、玻璃拟态设计系统示例；需要"四视图切换 + 图表揭示 + 数字滚动 + 明暗主题 + 本地 CSV 导出"的完整工作区。
- **关键 API**：`backgroundImage`、`backgroundCredit`、`workspaceName`、`panelFrost`（0–36px，主玻璃模糊半径）、`initialTheme`（`light`/`dark`）。内部状态：当前视图、周期（7/30/90 天）、明暗主题、弹窗与工单状态；视图切换走 hash 路由，back/forward 可恢复。
- **移植要点**：`useGSAP` + gsap 时间线驱动入场：`[data-gd-enter]` 交错上浮、柱条 `scaleY`、曲线 `clipPath` 揭示、环形 `stroke-dasharray`、进度条 `scaleX`、数字计数；`prefers-reduced-motion` 下直接落到终态。CSS 是组件内的 `dashboardStyles` 模板字符串，整套 `.gd-*` 命名空间随组件搬，Tailwind 不是依赖。图标用 `lucide-react`；演示版改成本地 vendored 的 `lucide.min.js` + `gsap.min.js`，并把 CSS / 数据从 React 源码逐字提取，观感常量不改。
- **注意**：背景图为 Unsplash 远程图片（离线时只有底色，需自备素材时传 `backgroundImage`）；所有数据都是组件内样例，数据时区/口径不要当真实业务值；导出 CSV 在浏览器本地生成，不上传；`panelFrost` 超范围会被夹到 0–36px；`prefers-reduced-transparency` / `forced-colors` 下玻璃会退化为实色。Vue 版把 GSAP 时间线收进 `gsap.context`，切页前 `revert`、卸载时清理；逐帧数字走普通对象直写 DOM，不进响应式；浏览器 API 只在 `onMounted` 后访问。

## 23. SplashCursor · 流体墨迹光标

- **源码**：`SplashCursor.tsx`（TypeScript + Tailwind 变体，含所有 WebGL shader）；**演示**：`splash-cursor.html`
- **Vue 实装**：`../../packages/vue/src/components/SplashCursor.vue`（已测试；WebGL 引擎在 `../../packages/vue/src/composables/useSplashCursor.ts`）
- **适用**：深色落地页、作品集、发布会页面的全局光标氛围；跟随鼠标留下流体墨迹拖尾，点击时爆散出飞溅。
- **关键 API**：`colors`（默认 `['#4f8cff', '#2dd4bf', '#ffd166']`）、`rainbow`（默认 `true`，按全色环循环）、`colorSpeed`（默认 1，0 = 单笔一色）、`intensity`（默认 1，墨量）、`size`（默认 1，笔触 / 飞溅宽度）、`force`（默认 1，推力）、`swirl`（默认 3，涡流强度）、`trail`（默认 1，墨迹留存时间）、`momentum`（默认 1，停手后的惯性）、`shading`（默认 1，涟漪深度阴影）、`glow`（默认 0，亮部柔光）、`quality`（`low`/`medium`/`high`，默认 `high`）、`clickSplash`（默认 `true`）、`intro`（默认 `true`，挂载时划过屏幕一笔）、`contained`（默认 `false`，只填充父元素并只在其中响应）、`theme`（`dark`/`light`，默认 `dark`）、`zIndex`（默认 50）、`className`、`style`。
- **移植要点**：整段 WebGL2 流体模拟原样保留 — FBO 双缓冲、advection / divergence / pressure / curl shaders、bloom 链、上下文丢失 / 恢复处理、pointer + touch 跟踪。`quality` 决定 sim/dye 分辨率与迭代次数（16–20 次），弱机降到 `low`。Vue 把引擎抽进 `useSplashCursor.ts`：`onMounted` 建 context，`onBeforeUnmount` 删 program / buffer / texture / FBO 并 `cancelAnimationFrame`；逐帧状态放普通对象，不进响应式；`prefers-reduced-motion` 下直接不启动并渲染静态兜底。容器固定定位、`pointer-events: none`，只在 `contained` 时变 `absolute` 并限制在父元素内。
- **注意**：**WebGL2 必需**，不支持时组件显示降级提示（不会崩）；同一页面最多一个实例；移动端 / 触屏建议关掉或降 `quality`；`theme: light` 是"吸收型"墨迹，要配浅色背景才对味；演示与 React 原件都是纯 WebGL，**零第三方依赖**，离线也能跑。日志里 GPU 软件渲染回退警告（SwiftShader）在 headless 环境属正常，以真机为准。

## 24. Shredder · 碎纸机

- **源码**：`Shredder.tsx`（TypeScript + Tailwind 变体）；**演示**：`shredder.html`
- **Vue 实装**：`../../packages/vue/src/components/Shredder.vue`（已测试；引擎在 `../../packages/vue/src/composables/useShredder.ts`）
- **适用**：文件管理 / 收件箱演示、销毁确认的可视化、带拖拽重排的交互玩具；把任意行拖到滚轮口，夹住后切成纸带卷曲飘落。
- **关键 API**：`items`（每行需唯一 `id`）、`renderItem`（React）/ 插槽（Vue，渲染被切的快照）、`onShred`（行通过滚轮时触发）、`onReorder`（行被放到别处时回传新顺序）、`width`（340）、`height`（460）、`inset`（14）、`gap`（10）、`slitHeight`（4）、`fallHeight`（140）、`feedSpeed`（180px/s）、`bite`（18px）、`autoFeed`（true）、`stripWidth`（10px）、`curl`（1）、`autoAnimate`（false）、`loop`（false）、`loopAfterDelete`（false）、`dragTilt`（6°）、`lift`（1.02）、`slitColor`（`#3f3f46`）、`color`（`#f5f5f5`）、`disabled`、`className`。
- **移植要点**：行内容先用 `XMLSerializer` + `foreignObject` 快照成 canvas 纹理，再按 `stripWidth` 等分列，每列用 2D canvas 逐帧绘制卷曲 / 波动 / 下落 / 淡出；拖拽用 pointer 事件 + 弹簧缓动，命中滚轮口后进入 feed 状态。`autoAnimate` 自下而上自动播放再带回；`loop` / `loopAfterDelete` 需要保留列表项。Vue 版把 React hook 状态改成普通对象（逐帧状态不进响应式），`onMounted` 建引擎、`onBeforeUnmount` 移除监听 / observer 并 `cancelAnimationFrame`；插槽替代 `renderItem`，通过 DOM 快照读取。
- **注意**：**零第三方依赖**，离线可跑；`onShred` 触发后需自行从列表移除该项，除非开启 `loop` / `loopAfterDelete` / `autoAnimate`，否则列表会被"切空"；内联图片 / SVG 能切，**跨域图片需要 CORS** 否则快照被污染；`prefers-reduced-motion` 下落更短；演示机台父容器需给显式宽度，否则组件 `min(var(--sh-w),100%)` 在 auto 宽度父级里会塌陷成窄条（React 原件同样语义）。

## 25. SpotlightCard · 光斑卡片

- **源码**：`SpotlightCard.jsx`（JavaScript + Tailwind 变体）；**演示**：`spotlight-card.html`
- **Vue 实装**：`../../packages/vue/src/components/SpotlightCard.vue`（已测试；引擎在 `../../packages/vue/src/composables/useSpotlightCard.ts`）
- **适用**：团队 / 人物卡片、定价卡、功能卡等任何希望"指针扫过时被照亮"的卡片；相邻卡片通过 `proximity` 共享一团光。
- **关键 API**：`theme`（`dark`/`light`，默认 `dark`）、`spotlightColor`（任意 CSS 颜色，默认深色卡用白、浅色卡用近黑）、`intensity`（0–1，默认 0.15）、`spotlightSize`（px，默认 240）、`softness`（0–1，默认 0.7）、`shape`（`circle`/`beam`，默认 `circle`）、`borderGlow`（0–1，默认 0.6）、`proximity`（卡外多少 px 开始照到，默认 80）、`smoothing`（光斑落后指针的程度，默认 0.3）、`ambient`（无指针时缓慢漂移，默认 false）、`flare`（按住膨胀变亮，默认 true）、`grain`（0–1 胶片颗粒，默认 0）、`className`；其余 div 属性透传。可用 `--spotlight-card-surface` / `--spotlight-card-border` 覆盖表面与边框色。
- **移植要点**：纯 DOM，无 canvas：两枚绝对定位 span 承载 `radial-gradient` 光斑与边缘光（颜色经 `color-mix` 生成 15 档渐隐），一枚 span 用 `mask-composite` 画 1px 边框，另一枚叠加 SVG 噪点颗粒。指针用窗口级 `pointermove` + `getBoundingClientRect` 换算到卡片局部坐标；`IntersectionObserver` 控制环境漂移是否运行。Vue 把引擎收进 `useSpotlightCard.ts`：`onMounted` 绑定监听 / observer，`onBeforeUnmount` 全部解绑并 `cancelAnimationFrame`；逐帧状态放普通对象，不进响应式。
- **注意**：**零第三方依赖**，离线可跑；依赖 `color-mix` 与 `mask-composite`（现代浏览器均支持）；`proximity > 0` 时卡片在指针靠近但未进入时也会亮，相邻卡片会一起被照亮；`prefers-reduced-motion` 下关闭平滑 / environ 漂移、按压不 flare，光斑直接跟随；`grain` 用 `mix-blend-overlay`，在纯黑 / 纯白表面上颗粒会偏弱，需要明显颗粒时把 `grain` 调到 0.2 以上。

## 26. AIPromptBox · AI 输入框

- **源码**：`ai-prompt-box.tsx`（TypeScript + Tailwind 变体）；**演示**：`ai-prompt-box.html`
- **Vue 实装**：`../../packages/vue/src/components/AIPromptBox.vue`（已测试；逻辑拆分在 `../../packages/vue/src/composables/useAIPromptBox.ts`）
- **适用**：AI 对话 / 客服输入框、需要联网 / 深度思考 / 画板模式切换与图片附件的输入场景。
- **关键 API**：`value` / `onValueChange`（Vue 用 `v-model`）、`isLoading`、`placeholder`、`onSend`（Vue 用 `send` 事件）、`onStop`、`className`。Vue 额外提供 `mode`（`v-model:mode`，`search` / `think` / `canvas` / `null`）、`showUpload` / `showVoice` / `showToggles`、`accept`、`maxFileSize`（10MB）、`labels`、`files-change` / `file-error` / `recording-start` / `recording-stop` / `mode-change` 事件，以及 `focus` / `submit` / `clear` ref 方法。
- **移植要点**：React 的三个布尔 `showSearch` / `showThink` / `showCanvas` 合并成互斥 `mode`；`onSend` 换成 `send` 事件，`value` / `onValueChange` 换成 `v-model`。无 UI 逻辑拆成四个组合式函数：录音计时（`setInterval` + 随机可视化柱，开始录音时生成一次）、预览弹层（Escape / 锁滚动 / 焦点归还）、附件（accept + 体积校验 + FileReader data URL + 只保留一张）、拖拽（只认带文件的拖拽，depth 计数防抖）。浏览器 API 只在挂载后或事件处理器里访问，SSR 安全。
- **注意**：**零 WebGL 依赖**，离线可跑；图片只保留一张（新图替换旧图），跨域图片不上传、仅本地预览；录音用计时模拟，不接真实 `MediaRecorder`，停录按上游语义自动发一条语音占位消息；`prefers-reduced-motion` 下弹层过渡时长为 0；Enter 发送、Shift+Enter / 输入法组字不发送。

## 27. Stepper · 分步引导

- **源码**：`Stepper.tsx`（TypeScript + Tailwind 变体）；**演示**：`stepper.html`
- **Vue 实装**：`../../packages/vue/src/components/Stepper.vue`（已测试；状态机在 `../../packages/vue/src/composables/useStepper.ts`）
- **适用**：新手引导、结算流程、多步表单、配置向导；需要"指示器跟步 + 内容滑动切换"的成套交互。
- **关键 API**：`steps`（Vue：步骤数组 `{ title?, description?, icon?, content? }`）、`step`（受控 → Vue 用 `v-model:step`）、`initialStep`、`onStepChange`（Vue：`step-change`）、`onFinalStepCompleted`（Vue：`final-step-completed`）、`indicator`（`numbers` / `dots` / `bars`）、`orientation`（`horizontal` / `vertical`）、`transition`（`slide` / `fade` / `none`）、`linear`、`disableStepIndicators`、`renderStepIndicator`（Vue：`#indicator` 插槽）、`showFooter`、`backButtonText`（Vue 默认 `上一步`）、`nextButtonText`（`下一步`）、`completeButtonText`（`完成`）、`completedContent`、`theme`、`accentColor`、`frame`、`radius`、`width`。
- **移植要点**：React 原件用 `children` + `<Step>` 子组件组织步骤，Vue 改用 `steps` 数组 + `#step` 作用域插槽（`{ index, step, current, status }`）；`Step` 的 `icon` 从 React 节点换成 Vue 组件。指示器下方的"滑块"靠 `translate3d` 跟随当前步，位置测量只看**轨道**的尺寸——盯根节点会被内容高度变化打断动画。主题是同一组 `--stepper-*` 变量，`accentColor` 会连同 `--stepper-solid-ink`（按亮度自动选黑或白）一起覆盖。
- **注意**：纵向布局在面板宽度 < 520px 时自动折叠成紧凑的横向排布（`width` 默认 440，所以默认宽度下看不到竖排 rail）；Vue 实装的三个按钮默认文案已中文化，React 原件仍是上游英文默认值（演示与文档站用中文）；**当前步的指示器是禁用的**（React 原件如此），`linear` 打开时只能点回走过的步骤。`prefers-reduced-motion` 下切换退化为淡入。React 源码依赖 Tailwind 与 `@hugeicons/react`，Vue 实装自带普通 CSS，只需 `@hugeicons/vue`。
