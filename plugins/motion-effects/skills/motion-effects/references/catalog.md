# 特效目录（20 个）

> 路径均相对 `skills/motion-effects/`。
> **Vue 难度**：`易` ≈ 1–2 小时直译；`中` ≈ 半天，需处理 ref / 生命周期 / motion-v；`难` ≈ 1–2 天，含 WebGL / three.js / canvas 大组件。
> **源文件**默认指 `assets/react/components/ui/`，演示指 `assets/demos/`。

## 场景速查

| 你想要 | 首选 | 备选 |
|---|---|---|
| 营销页首屏 / 滚动叙事 | `scroll-locked-video-hero` | `liquid-glass-logo-reveal`、`GridMotion` |
| 移动端列表操作 | `SwipeRow` | `RubberSegment`、`HoldButton` |
| 数据 / 功能展示 | `MagicBento` | `AnimatedList`、`TiltedCard` |
| 玻璃拟态面板 | `GlassSurface` | `glass-folder-cards`、`liquid-glass-navbar` |
| 身份卡 / 票券 / 3D 翻面 | `ReflectiveCard` | `FlipCard` |
| 导航 | `PillNav` | `liquid-glass-navbar` |
| 氛围装饰 | `GhostCursor` | `PaperCrumple`、`GridMotion` |
| 内容演示 | `terminal-replay` | `signature` |
| 图片墙 / 自动滚动网格 | `GridMotion` | — |
| 品牌 Logo 揭示 | `liquid-glass-logo-reveal` | — |

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

## Vue 实装进度（0.1）

已移植、带测试、并在文档站有真实组件预览：

| 组件 | Vue 源码 | 测试 |
|---|---|---|
| `HoldButton` | `../../packages/vue/src/components/HoldButton.vue` | `../../packages/vue/tests/hold-button.spec.ts` |
| `SwipeRow` | `../../packages/vue/src/components/SwipeRow.vue` | `../../packages/vue/tests/swipe-row.spec.ts` |
| `SpecularButton` | `../../packages/vue/src/components/SpecularButton.vue` | `../../packages/vue/tests/specular-button.spec.ts` |
| `TerminalReplay` | `../../packages/vue/src/components/TerminalReplay.vue` | `../../packages/vue/tests/terminal-replay.spec.ts` |
| `ScrollLockedVideoHero` | `../../packages/vue/src/components/ScrollLockedVideoHero.vue` | `../../packages/vue/tests/scroll-locked-video-hero.spec.ts` |

其余 15 个仍以 React 源码 + vanilla 演示为真源，按需按 `vue-porting.md` 移植。`GlassSurface` 因 SVG + WebGL 双路径，放在下一批。

后两个（`TerminalReplay`、`ScrollLockedVideoHero`）与 React 原件有几处有意的行为差异，见 `../../packages/vue/README.md` 的「与 React 原件的差异」。

> Vue 实装自带 CSS，不依赖 Tailwind；需要安装的依赖见下面「依赖安装」。

## 依赖安装（Vue 3 项目，pnpm）

```bash
# 按需安装，不要全量装
pnpm add motion-v @vueuse/core    # FlipCard / RubberSegment / SwipeRow；@vueuse/core 是 motion-v 的 peer
pnpm add @hugeicons/vue @hugeicons/core-free-icons   # AnimatedList / MagicBento / ReflectiveCard / SwipeRow
pnpm add three                   # PaperCrumple
pnpm add clsx tailwind-merge     # liquid-glass-logo-reveal 的 cn()
# GridMotion / SwipeRow 的原生样式用 Tailwind；不装 Tailwind 时复用 demo CSS（见下）
```

React 项目对应：`motion` + `@hugeicons/react`。Tailwind **不是必装**：只有 `GridMotion` / `SwipeRow` 的原生样式依赖它；Vue 项目不装 Tailwind 时，按下面「Tailwind」一条的替代路径（复用 demo CSS）处理即可。

**样式形态分三类**：

- **CSS 文件**（12 个）：源码旁有同名 `.css`，直接一起复制。
- **Tailwind**（`GridMotion`、`SwipeRow`）：React 源码没有独立 CSS，样式写死在 JSX 的任意值类里；Vue 项目不用 Tailwind 时，直接复用对应 demo 里的等价 CSS（`grid-motion.html` / `swipe-row.html`），不要逐条翻译任意值类。`SwipeRow` 的 Vue 实装已带提取好的 `SwipeRow.css`。
- **内联**（6 个 TSX）：样式在组件文件的 `<style>` / style 对象里，随源码一起搬；`liquid-glass-logo-reveal` 的容器另有 5 个 Tailwind 工具类，可手写成普通 CSS。

---

## 1. AnimatedList · 动态列表

- **源码**：`AnimatedList.jsx` + `AnimatedList.css`；**演示**：`animated-list.html`
- **适用**：文件列表、通知流、搜索结果、设置项；需要"逐项入场 + 悬停选中 + 键盘上下选择"。
- **关键 API**：`items`（`{ title, description, meta, icon, image }`）、`onItemSelect`、`renderItem`、`initialSelectedIndex`、`selectOnHover`、`enableArrowNavigation`、`loop`、`animation`（`pop`/`slide`/`fade`）、`animateOnce`、`stagger`、`showGradients`、`displayScrollbar`、`frame`、`theme`（`dark`/`light`）、`accentColor`、`radius`、`gap`、`width`、`maxHeight`。
- **移植要点**：内部用 `useLayoutEffect` + rAF 引擎做滚动与高亮；Vue 用 `onMounted` + 模板 ref，动画状态放在 `shallowRef`/普通对象里逐帧写 CSS 变量。`renderItem` 改成作用域插槽。默认图标只是示例，可直接换成项目图标。
- **注意**：不是虚拟列表，`items` 很大时需外层分页或虚拟滚动；键盘焦点与 `aria-activedescendant` 要保留。

## 2. FlipCard · 3D 翻面卡片

- **源码**：`FlipCard.jsx` + `FlipCard.css`；**演示**：`flip-card.html`
- **适用**：前后信息卡、价格卡翻面、产品详情、抽奖/刮奖式揭示。
- **关键 API**：`front` / `back`（节点 → Vue 插槽）、`flipped`（受控 → `v-model:flipped`）、`defaultFlipped`、`onFlipChange`、`axis`（`x`/`y`）、`flipOnClick`、`draggable`、`dragDistance`、`tilt`、`tiltMax`、`glare`、`glareOpacity`、`hoverScale`、`perspective`、`stiffness`、`damping`、`width`、`height`、`radius`、`background`、`color`、`shadow`、`disabled`、`ariaLabel`。
- **移植要点**：`motion/react` → `motion-v`；`useMotionValue` / `useSpring` / `useTransform` 同名可用。拖拽用 `@pointerdown/move/up` + `setPointerCapture`。翻面角度 `turn` 用 `computed` 派生 `rotate`。
- **注意**：`backface-visibility` 与 Safari 需要保留 CSS 里的 `translateZ`；`prefers-reduced-motion` 下应直接切换正反面，不做旋转。

## 3. GhostCursor · 流体光标

- **源码**：`GhostCursor.jsx` + `GhostCursor.css`；**演示**：`ghost-cursor.html`
- **适用**：深色落地页、作品集、发布会页面的全局光标氛围；桌面端。
- **关键 API**：`color`、`brightness`、`size`、`trailLength`、`inertia`、`turbulence`、`drift`、`detail`、`grainIntensity`、`bloomStrength`、`bloomRadius`、`bloomThreshold`、`edgeIntensity`、`clickPuff`、`intro`、`theme`、`mixBlendMode`、`fadeDelayMs`、`fadeDurationMs`、`maxDevicePixelRatio`、`zIndex`。
- **移植要点**：整段 WebGL2 shader 原样保留；Vue 只需 `canvas` ref + `onMounted` 建 context、`onBeforeUnmount` 删 program/buffer/texture 并 `cancelAnimationFrame`。容器 `pointer-events: none; position: fixed; inset: 0`。
- **注意**：最多同时一个；移动端/触屏建议直接不渲染（组件内部已有触摸检测）；GPU 弱机把 `maxDevicePixelRatio` 降到 1–1.5；页面隐藏时暂停。

## 4. GlassSurface · 折射玻璃

- **源码**：`GlassSurface.jsx` + `GlassSurface.css`；**演示**：`glass-surface.html`
- **适用**：玻璃卡片、磨砂面板、登录框、悬浮工具条；需要真实折射/色散而非普通 `backdrop-filter`。
- **关键 API**：`children`（插槽）、`width`、`height`、`borderRadius`、`borderWidth`、`brightness`、`opacity`、`blur`、`displace`、`backgroundOpacity`、`saturation`、`distortionScale`、`redOffset` / `greenOffset` / `blueOffset`、`xChannel` / `yChannel`、`mixBlendMode`、`refraction`、`renderer`（`auto`/`svg`/`webgl`）、`backdrop`（背景图）、`shape`。
- **移植要点**：组件同时有 SVG filter 与 WebGL 路径，`renderer: 'auto'` 会探测；Vue 保留两条路径与唯一的 `useId`（Vue 3.5 `useId()` 或自增 id）。`backdrop` 用同源图片，避免纹理污染。
- **注意**：玻璃效果依赖"背后有内容"，纯色背景上看不出折射；WebGL 不可用时要能看到 SVG 降级；不要嵌套多层玻璃，性能与观感都会崩。

## 5. GridMotion · 动感网格墙

- **源码**：`GridMotion.jsx`；**演示**：`grid-motion.html`
- **适用**：作品集照片墙、客户 Logo 墙、关键词墙、产品图流。
- **关键 API**：`items`（字符串 → 文字块；`{ src, alt }` → 图片；VNode → 自定义节点）、`rows`、`aspectRatio`、`gap`、`radius`、`angle`、`tilt`、`speed`、`direction`（`alternate`/`up`/`down`/`left`/`right`）、`parallax`、`spotlight`、`dim`、`grayscale`、`fade`、`tileColor`、`textColor`、`theme`。
- **移植要点**：**依赖 Tailwind**（类名是常量字符串）；Vue 项目若没有 Tailwind，直接复用 `assets/demos/grid-motion.html` 的 `.gm-*` 规则（与组件等价），不要逐条翻译任意值类。滚动用 rAF 写 `transform`，不要变成响应式逐帧更新。
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
- **适用**：SaaS 功能总览、后台看板、营销页能力矩阵。
- **关键 API**：`items`（`{ title, description, visual, icon, image, content, colSpan, rowSpan, href, onClick, id }`）、`columns`、`rowHeight`、`gap`、`radius`、`theme`、`glowColor`、`textAutoHide`、`enableBorderGlow`、`enableSpotlight`、`spotlightRadius`、`enableStars`、`particleCount`、`enableTilt`、`enableMagnetism`、`clickEffect`、`intro`、`disableAnimations`、`onItemClick`。
- **移植要点**：1131 行 JSX + 1126 行 CSS，是库里最大的组件。建议**整文件 1:1 直译**：模板结构、CSS、rAF 引擎、视觉子组件（`AnalyticsVisual` 等）都保留；把 `items` 的节点字段换成插槽。`useIsomorphicLayoutEffect` → `onMounted` + `nextTick`。
- **注意**：`visual` 预设是示例内容，业务里通常要换成真实图表；粒子/聚光/倾斜同时开会明显吃 GPU；移动端建议关 `enableStars` 与 `enableTilt`。

## 8. PaperCrumple · 纸张揉皱

- **源码**：`PaperCrumple.jsx` + `PaperCrumple.css`；**演示**：`paper-crumple.html`
- **适用**：图片"揉皱/展开"的戏剧化揭示、失败/删除反馈、艺术化产品图。
- **关键 API**：`src`、`alt`、`backSrc`、`width`、`height`、`sceneHeight`、`imageFit`、`releaseBehavior`（`restore`/`stay`）、`crumpleAmount`、`crumpleDuration`、`releaseDuration`、`foldCount`、`foldSharpness`、`wrinkleDepth`、`creaseStrength`、`paperColor`、`roughness`、`paperTexture`、`lightIntensity`、`lightAngle`、`shadow`、`shadowOpacity`、`draggable`、`dragRotation`、`dragRadius`、`returnToOrigin`、`rotation`、`seed`、`detail`、`disabled`、`resetKey`、`onStateChange`、`onError`。
- **移植要点**：three.js 场景与几何生成逻辑原样保留；Vue 用 `shallowRef`/`markRaw` 存 renderer/scene，`onMounted` 初始化，`onBeforeUnmount` 里 `dispose()` 几何/材质/renderer 并移除 canvas。`three` 建议动态 `import()`。
- **注意**：包体积大（three ~600KB min）；移动端降低 `detail`；图片纹理必须同源或 CORS 允许；`seed` 决定折痕，换 seed 换形态。演示依赖真实 GPU，无硬件加速的 headless 环境可能白屏，以真机为准。

## 9. PillNav · 胶囊导航

- **源码**：`PillNav.jsx` + `PillNav.css`；**演示**：`pill-nav.html`
- **适用**：官网顶部导航、产品页分区切换、移动端折叠菜单。
- **关键 API**：`logo`、`logoAlt`、`logoHref`、`items`（`{ label, href, icon }`）、`activeHref`、`defaultActiveIndex`、`onItemClick`、`linkComponent`、`theme`、`layout`（`split`/`center`）、`size`、`surface`（`glass`/`solid`）、`itemStyle`、`hoverEffect`、`indicator`、`highlightColor`、`highlightTextColor`、`barColor`、`textColor`、`bounce`、`stretch`、`intro`、`collapse`、`onMenuToggle`、`ariaLabel`。
- **移植要点**：`linkComponent` → Vue 用 `component :is` 或插槽；内部有测量克隆节点（`MEASURE`），CSS 必须全局引入（scoped 样式加不到克隆节点上）。折叠菜单的 focus trap 与 `Esc` 要保留。
- **注意**：移动端折叠阈值与 `collapse` 参数相关；玻璃表面在低对比背景上要调 `surface`/`barColor`；logo 传 URL 或节点。

## 10. ReflectiveCard · 金属反射卡

- **源码**：`ReflectiveCard.jsx` + `ReflectiveCard.css`；**演示**：`reflective-card.html`
- **适用**：会员卡、工牌、票券、产品防伪卡；金属反射 + 倾斜 + 可选摄像头。
- **关键 API**：`name`、`role`、`badge`、`status`、`statusColor`、`idLabel`、`idValue`、`children`、`theme`、`videoSrc`、`webcam`、`onWebcamError`、`tint`、`metalness`、`roughness`、`blurStrength`、`grayscale`、`warp`、`warpScale`、`shine`、`bevel`、`glare`、`enableTilt`、`tiltStrength`、`intro`、`width`、`height`、`radius`。
- **移植要点**：WebGL2 反射 shader 原样保留；`webcam` 用 `navigator.mediaDevices.getUserMedia`，Vue 在 `onBeforeUnmount` 必须 `track.stop()`；`videoSrc` 跨域视频会污染纹理。
- **注意**：摄像头必须用户手势触发、明确告知用途；无 WebGL2 时要有静态卡降级；不要默认开摄像头。

## 11. RubberSegment · 橡皮筋分段

- **源码**：`RubberSegment.jsx` + `RubberSegment.css`；**演示**：`rubber-segment.html`
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
- **适用**：深色官网/产品页底部或顶部导航，点击有水体波纹与音效。
- **关键 API**：`items`（`{ label, href, icon, fx }`，`fx` = `glow`/`spin`/`plane`/`drop`/`wave`/`pop`/`none`）、`defaultActive`、`active`、`onChange`、`tone`（`light`/`dark`）、`compact`、`sound`。
- **移植要点**：单个 TSX 内嵌 WebGL shader + CSS 水滴降级 + Web Audio 合成音；Vue 原样搬，`active` 用 `defineModel`。`NimbusIcons` 可直接复用或换项目图标。
- **注意**：音效需要用户手势后才能播放；`compact` 是纯图标模式；无 WebGL 时自动降级，别额外做第二套；移动端底部安全区（`env(safe-area-inset-bottom)`）要留。

## 18. scroll-locked-video-hero · 滚动锁定视频 Hero

- **源码**：`scroll-locked-video-hero.tsx`；**演示**：`index-video-hero.html`
- **Vue 实装**：`../../packages/vue/src/components/ScrollLockedVideoHero.vue`（已测试；会锁定页面滚动，文档站的 live 预览放在 iframe 里）
- **适用**：品牌首屏、产品发布页、沉浸式滚动叙事。
- **关键 API**：`videoSrc`、`title`、`scrollHint`、`tagline`、`signature`（`{ name, url }` 或 `false`）、`scrubDistance`（滚满整段视频的像素距离，默认 3200）、`className`、`style`。
- **移植要点**：挂载时把 `body` 设成 `position: fixed` 锁住页面，`window` 上的 `wheel` / `touchmove`（非 passive，另在元素上用捕获阶段再绑一次）只用来累计进度；rAF 里按每帧 18% 的缓动把进度 seek 到 `video.currentTime`，同时更新标题 / 提示 / 进度线；卸载时移除监听并恢复 `body`。视频 `muted`、`playsInline`、`preload="auto"` 保留。Vue 实装把 `scrubDistance` 做成惰性读取，改它不会重置状态。
- **注意**：**挂载期间页面无法滚动，而且不会自行解锁**，不要内嵌进还有其它内容的页面。移动端 iOS 需要 `playsInline` 且可能不允许精确 seek，准备 poster/降级；视频体积大，建议 H.264 + CDN 分段；`scrubDistance` 要按视频时长调；`prefers-reduced-motion` 下不做动画，直接停在 92% 处的一帧。

## 19. signature · 手写签名

- **源码**：`signature.tsx`；**演示**：`signature.html`
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