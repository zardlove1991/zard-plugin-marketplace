# 在当前空目录初始化 shadcn + Tailwind + TypeScript

当前项目目录里没有 React 工程（没有 `package.json`、`tsconfig`、Tailwind 配置或 `components` 目录）。按下面步骤从零搭建，然后把组件放进去即可运行。

## 1. 创建 React + TypeScript 工程（Next.js App Router 为例）

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
```

如果你更想用 Vite：

```bash
npm create vite@latest . -- --template react-ts
cd . && npm install
```

## 2. 安装 Tailwind CSS（上一步已带 `--tailwind` 可跳过）

Next.js 自带 Tailwind 时无需重复安装。Vite 项目需要：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

在 `tailwind.config.ts` 的 `content` 中加入 `./components/**/*.{ts,tsx}` 与 `./app/**/*.{ts,tsx}`，并在全局样式里引入 `@tailwind base; @tailwind components; @tailwind utilities;`。

## 3. 初始化 shadcn/ui

```bash
npx shadcn@latest init
```

CLI 会写入 `components.json`，里面 `aliases.components` 默认指向 `@/components`，`aliases.ui` 默认指向 `@/components/ui`。这正是本组件使用的导入路径。

## 4. 为什么组件要放在 `/components/ui`

- shadcn 的约定是：可复用 UI 原语放在 `components/ui`，业务组合组件放在 `components`。`npx shadcn@latest add <name>` 安装的组件都会落到 `components/ui`，保持这个路径才能让 CLI 之后的安装、更新、覆盖逻辑正常工作。
- `@/components/ui/...` 依赖 `tsconfig.json` 里的路径别名 `"@/*"`。若组件放到别处，需要同时改别名或导入路径，破坏一致性。
- 如果你的 `components.json` 把 `aliases.ui` 改成了别的目录（例如 `src/ui`），请把组件移动到该目录，并把 demo 里的导入路径同步改成对应的 `@/...` 路径。否则会报 `Module not found`。

## 5. `scroll-locked-video-hero.tsx` 的依赖情况

该组件是自包含的：**不需要**安装额外第三方库。
- 只用到 React 内置的 `useEffect` / `useRef` / `useState`。
- 没有 shadcn/Radix 子组件、没有 Context Provider。
- 滚动箭头是内联 SVG，不需要 `lucide-react`。
- 没有图片素材，短视频从给定 CDN 地址加载，不需要 Unsplash 图片。

## 6. `liquid-glass-logo-reveal.tsx` 的依赖情况

这个组件**需要** shadcn 的工具函数 `cn`，已随文件提供 `lib/utils.ts`。安装它依赖的两个包：

```bash
npm install clsx tailwind-merge
```

其余部分不依赖第三方库：玻璃折射效果由组件内嵌的 WebGL2 着色器完成，Logo 转 SDF 也在组件内实现，不需要额外图形库或图标库。

`GlassIconReveal` 是真正接受 `logo` 属性的组件，原文件没有导出它；本项目在文件末尾补了导出，以便传入自定义 Logo。`GlassReveal21st` 仍使用原文件内置的 21st.dev 标记，二者互不影响。

Logo 使用本地 `assets/logo.png`（由 `https://weiliantong.w-lian.com/assets/logo-DMjRPT_E.png` 下载而来）。组件对远程图片会启用跨域请求，外链在有 CORS 限制时会导致纹理被污染、玻璃效果失效，因此用同源本地文件更可靠。

## 7. 运行

```bash
npm run dev
```

- 滚动锁定视频 Hero：`http://localhost:3000/demo`
- 玻璃 Logo 揭示：`http://localhost:3000/reveal`
- 玻璃文件夹卡片：`http://localhost:3000/folders`
- 液态玻璃导航栏：`http://localhost:3000/navbar`
- 长按确认按钮：`http://localhost:3000/hold-button`
- 橡皮筋分段控件：`http://localhost:3000/rubber-segment`
- 3D 翻转卡片：`http://localhost:3000/flip-card`
- 纸张揉皱：`http://localhost:3000/paper-crumple`
- 终端会话回放：`http://localhost:3000/terminal-replay`

（Vite 项目把对应 `app/*/page.tsx` 的内容移到 `src/App.tsx` 并调整导入。）

## 8. 自定义

滚动 Hero 通过 props 配置：`videoSrc`、`title`、`scrollHint`、`tagline`、`signature`、`scrubDistance`（滚满整段视频所需的像素距离，默认 3200）。例如：

```tsx
<MetroHero
  title="THE CITY OPENS"
  tagline="Every door in the city is already open."
  scrubDistance={4200}
  signature={false}
/>
```

玻璃 Logo 揭示通过 props 配置：`logo`（图片地址或 SVG 标记）、`look`（`light` / `dark`）、`background`、`logoColor`、`originalColors`、`tileSize`、`logoScale`、`finalScale`、`loop`、`hold`、`speed`、`time`（静态定格）、`tuning`（微调玻璃与动效）。例如：

```tsx
<GlassIconReveal
  logo="/assets/logo.png"
  look="light"
  background="#ffffff"
  originalColors
  logoScale={0.62}
  finalScale={0.78}
  hold={1.6}
/>
```

## 9. `glass-folder-cards.tsx` 的说明

该组件只引入 React，是自包含的：没有 `cn`、没有 Radix/shadcn 子组件、没有 Context Provider；图标为内联 SVG，文件夹里的抽象画面由画布程序化生成。因此不需要安装额外第三方库，也不需要 Unsplash 图片或 lucide 图标。demo 使用了 Tailwind 工具类（`bg-background`、`text-muted-foreground` 等），需按第 2 步配置好 Tailwind。

常用 props：`label`、`meta`、`tone`（`light` / `dark`）、`art`（预设或自定义配方，或 `none`）、`seed`、`image`、`files`、`action`（`add` / `more` / `none`）、`menu`、`labelPlacement`、`width`、`appear`、`appearDelay`。可用 `onAdd`、`onFilesChange`、`onFileSelect`、`onOpenChange` 接入自己的状态逻辑。

## 10. `liquid-glass-navbar.tsx` 的说明

该组件只引入 React，是自包含的：水体由内嵌 WebGL 着色器绘制，图标是内联 SVG，提示音由浏览器合成，不依赖任何第三方库，也不需要图片或图标库。没有 WebGL 时会自动降级为 CSS 水滴。

常用 props：`items`（含 `label` / `href` / `icon` / `fx`）、`defaultActive`、`active`、`onChange`、`tone`、`compact`、`sound`。图标可用导出的 `NimbusIcons`；`fx` 取 `glow` / `spin` / `plane` / `drop` / `wave` / `pop` / `none`。组件同时导出别名 `Component`，方便按注册表约定导入。

## 11. `HoldButton.jsx` / `HoldButton.css` 的说明

这是 React Bits 的 JavaScript + CSS 变体，**必须成对放置**在同一目录：组件通过 `import './HoldButton.css'` 相对引入样式，缺一个都会报错。

因为文件是 `.jsx`，TypeScript 项目需要在 `tsconfig.json` 中开启 `"allowJs": true`；Next.js App Router 的默认模板已开启。demo 也使用 `.jsx`，避免为纯 JS 组件写类型声明。

组件只依赖 React 内置 hooks，不需要额外第三方库、图片或图标库，`icon` / `doneIcon` 是可选属性，不传即可。常用 props 见组件文件顶部的参数表：`holdTime`、`releaseTime`、`fillDirection`、`wave`、`glow`、`resetAfter`、`onHold`、`onTap` 等。

## 12. `RubberSegment.jsx` / `RubberSegment.css` 的说明

这是 React Bits 的 JavaScript + CSS 变体，**唯一外部依赖是 `motion`**，先安装：

```bash
npm install motion
```

组件与样式必须成对放在同一目录（组件通过 `import './RubberSegment.css'` 相对引入）。因为是 `.jsx`，TypeScript 项目需要 `"allowJs": true`；demo 同样用 `.jsx`，避免写类型声明。

不需要图片或图标库：图标是可选的 `icon` 属性，不传即可。常用 props：`items`、`value` / `defaultValue`、`onChange`、`trackColor` / `thumbColor` / `textColor` / `activeTextColor`、`size`、`radius`、`inset`、`equalSlots`、`stretch`、`squash`、`speed`、`glide`、`draggable`。键盘支持方向键与 Home / End。

## 13. `FlipCard.jsx` / `FlipCard.css` 的说明

与 `RubberSegment` 一样依赖 `motion`（第 12 步已安装，无需重复）。组件与样式必须成对放在同一目录，`.jsx` 在 TS 项目需要 `"allowJs": true`。

正面示例使用本地 `assets/landscape.jpg`（由 Unsplash 下载）。背面第二行采用中性说明文字，而不是原示例中的具体馆藏与年代标注——配通用图时那种写法会构成不实标注，需要真实馆藏图片时再换回。

常用 props：`front` / `back`、`flipped` / `defaultFlipped`、`onFlipChange`、`axis`、`flipOnClick`、`draggable`、`dragDistance`、`tilt` / `tiltMax`、`glare` / `glareOpacity`、`hoverScale`、`perspective`、`stiffness` / `damping`、`width` / `height` / `radius`、`shadow` / `shadowColor` / `shadowOpacity`。

## 14. `PaperCrumple.jsx` / `PaperCrumple.css` 的说明

这是几个组件里最重的一个，唯一外部依赖是 `three`，先安装：

```bash
npm install three
```

组件与样式必须成对放在同一目录，`.jsx` 在 TS 项目需要 `"allowJs": true`。正面印图用本地 `assets/landscape.jpg`；`src` 必填，远程图片服务器需要允许跨域，否则 WebGL 纹理会加载失败。

它用预计算的折叠路径加 WebGL 材质与光影实现揉皱，按住时折叠、拖动时跟随指针、松手按 `releaseBehavior` 复原。常用 props：`src` / `backSrc`、`width` / `height` / `sceneHeight`、`crumpleAmount` / `crumpleDuration` / `releaseDuration`、`foldCount` / `foldSharpness` / `wrinkleDepth` / `creaseStrength`、`releaseBehavior`、`paperColor`、`shadow`、`draggable` / `dragRotation` / `dragRadius`、`resetKey`、`onStateChange` / `onError`。

## 15. `terminal-replay.tsx` 的说明

这是按 React Bits Pro「Terminal Replay」公开文档独立实现的等效组件，**不是官方 Pro 源码**，也不需要许可证或私有注册表。组件自包含、零外部依赖。

会话由 `script` 描述，步骤支持 `command`、`output`、`spinner`、`progress`、`pause`、`clear`；文本可用 `[success]`、`[error]`、`[warning]`、`[info]`、`[accent]`、`[muted]`、`[dim]`、`[bold]` 标记着色。常用 props：`title`、`prompt`、`directory`、`chrome`、`frame`、`dots`、`theme`、`accentColor`、`fontSize` / `lineHeight`、`height` / `radius`、`typingSpeed` / `variance` / `lineDelay` / `startDelay` / `hold`、`loop` / `autoplay`、`cursor`、`copyable`、`interactive`、`onComplete`。

如需官方组件，请在自己的项目中配置 Pro 注册表与 `REACTBITS_LICENSE_KEY`，再执行 `npx shadcn@latest add @reactbits-starter/terminal-replay-tw`。

## 16. `signature.tsx` 的说明

这是按 React Bits Pro「Signature」公开文档独立实现的等效组件，**不是官方 Pro 源码**，不需要许可证或私有注册表。组件自包含、零外部依赖。

`mode="play"` 自动书写：默认写内置笔迹，传 `text` 时直接写出这段文字（demo 用的是「维链通」）；`mode="sign"` 变成可签名画板。常用 props：`strokes`、`pen`（`fountain` / `ballpoint` / `marker`）、`thickness` / `speed`、`autoplay` / `loop` / `pause`、`frame` / `line`、`name` / `role`、`placeholder`、`aspect`、`intro`、`theme`、`inkColor` / `surfaceColor`、`onChange` / `onComplete`。通过 ref 可调用 `play`、`clear`、`undo`、`getStrokes`、`toSVG`、`toDataURL`。

如需官方组件，请在自己的项目中配置 Pro 注册表与 `REACTBITS_LICENSE_KEY`，再执行 `npx shadcn@latest add @reactbits-starter/signature-tw`。

## 17. `GhostCursor.jsx` / `GhostCursor.css` 的说明

免费组件，无外部依赖，组件与样式必须成对放在同一目录。它是覆盖在舞台上的 WebGL2 烟雾层，鼠标移动时留下拖尾、点击释放烟团，支持惯性、湍流、上浮、辉光、颗粒与进入视口的首次掠过；需要浏览器支持 WebGL2 与浮点纹理，不支持时安静跳过。

常用 props：`color`、`size`、`trailLength`、`inertia`、`turbulence`、`drift`、`detail`、`brightness`、`bloomStrength` / `bloomRadius` / `bloomThreshold`、`grainIntensity`、`edgeIntensity`、`clickPuff`、`intro`、`theme`、`fadeDelayMs` / `fadeDurationMs`、`zIndex`。

## 18. `SpecularButton.jsx` / `SpecularButton.css` 的说明

免费组件，无外部依赖，组件与样式必须成对放在同一目录。它用一层 WebGL2 画布在按钮圆角边缘画高光：光点随光标靠近而移到最近边缘，按下时增亮，也支持关闭跟随后自动绕圈。

常用 props：`size`、`radius`、`tint` / `tintOpacity` / `blur`、`textColor`、`lineColor` / `baseColor`、`intensity` / `idleIntensity`、`shineSize` / `shineFade`、`thickness`、`glow`、`followMouse` / `proximity`、`autoAnimate` / `speed`、`disabled`、`onClick`。

## 19. `AnimatedList.jsx` / `AnimatedList.css` 的说明

这是免费组件，依赖两个图标库，先安装：

```bash
npm install @hugeicons/react @hugeicons/core-free-icons
```

组件与样式必须成对放在同一目录。它把条目渲染成磨砂面板中的列表，进入视口时依次弹出，选中项有弹簧跟随的描边，支持悬停/键盘选择、上下边缘渐隐与细滚动条。

常用 props：`items`、`onItemSelect`、`renderItem`、`initialSelectedIndex`、`selectOnHover`、`enableArrowNavigation`、`loop`、`animation`（`pop` / `slide` / `fade` / `none`）、`animateOnce`、`stagger`、`showGradients` / `fadeSize`、`frame`、`theme`、`accentColor`、`radius` / `gap`、`width` / `maxHeight`。

独立原型使用内联 SVG 图标替代 HugeIcons，因此不需要安装依赖。

## 20. `ReflectiveCard.jsx` / `ReflectiveCard.css` 的说明

免费组件，依赖两个图标库，先安装：

```bash
npm install @hugeicons/react @hugeicons/core-free-icons
```

组件与样式必须成对放在同一目录。它是一张 WebGL2 金属卡片：表面反射影棚或传入的视频/摄像头画面，随光标倾斜，光带扫过，指针附近有高光。不传 `videoSrc` 时按文档使用程序化影棚反射，无需额外素材。

常用 props：`name` / `role` / `badge` / `status` / `statusColor`、`idLabel` / `idValue`、`children`、`theme`、`videoSrc` / `webcam`、`tint` / `metalness` / `roughness` / `blurStrength`、`grayscale` / `warp` / `warpScale`、`shine` / `bevel` / `glare`、`enableTilt` / `tiltStrength`、`intro`、`width` / `height` / `radius`。

独立原型只实现默认影棚反射分支，不接入摄像头或视频，也不需要安装依赖。

## 21. `PillNav.jsx` / `PillNav.css` 的说明

免费组件，无外部依赖，组件与样式必须成对放在同一目录。它是一条胶囊导航：Logo 悬停旋转，悬停项有从下方升起的圆形填充，当前项用圆点或胶囊标记，窄屏自动折叠为菜单。

常用 props：`items`、`logo` / `logoAlt` / `logoHref`、`activeHref` / `defaultActiveIndex`、`onItemClick`、`linkComponent`、`theme`、`layout`、`size`、`surface`、`itemStyle`、`hoverEffect`（`fill` / `glide` / `none`）、`indicator`（`dot` / `pill` / `none`）、`highlightColor`、`bounce` / `stretch`、`collapse`、`intro`、`ariaLabel`。

独立原型用内联 SVG 作 Logo，不需要外部素材。

## 22. `MagicBento.jsx` / `MagicBento.css` 的说明

免费组件，依赖两个图标库，先安装：

```bash
npm install @hugeicons/react @hugeicons/core-free-icons
```

组件与样式必须成对放在同一目录。它是一组交互式功能卡片网格：光标附近的卡片边缘发光、卡片内部有跟随光、点击时光环穿过整个网格，内置六种插画（analytics / dashboard / collaboration / automation / integration / security），进入视口时逐张升起，宽屏 4 列到窄屏 1 列自适应。

常用 props：`items`、`columns` / `rowHeight` / `gap` / `radius`、`theme`、`glowColor`、`enableBorderGlow` / `enableSpotlight` / `spotlightRadius`、`enableStars` / `particleCount`、`enableTilt` / `enableMagnetism`、`clickEffect`、`intro`、`disableAnimations`、`onItemClick`。

独立原型直接引用 `MagicBento.css` 原文，DOM 结构与类名一致，图标用内联 SVG 替代图标库。

## TiltedCard · 3D 倾斜卡片

- 组件：`components/ui/TiltedCard.jsx` 与 `components/ui/TiltedCard.css`，成对放在同一目录；零外部依赖，无需安装任何包。
- demo：`app/tilted-card/page.jsx`，图片用 `/assets/sunset.jpg`（部署时记得把 `assets/` 里的图拷进 Next 的 `public/`）。
- 预览：直接打开 `tilted-card.html`，或主入口 `index.html`（同为这个效果）。
- 访问路径：`/tilted-card`。

## GlassSurface · 折射玻璃

- 组件：`components/ui/GlassSurface.jsx` 与 `components/ui/GlassSurface.css`，成对放在同一目录；零外部依赖，无需安装任何包。
- demo：`app/glass-surface/page.jsx`，背景图与形状用 `/assets/sunset.jpg` 与 `/assets/glass-shape.svg`（部署时把 `assets/` 拷进 Next 的 `public/`）。
- 预览：直接打开 `glass-surface.html`，或主入口 `index.html`（同为这个效果）。
- 访问路径：`/glass-surface`。
- 渲染路径：Chromium 用 SVG 滤镜折射（无需背板）；Safari/Firefox 需传 `backdrop`（图片/视频/画布的 ref）走 WebGL 折射，否则自动降级为雾面玻璃；`refraction={false}` 强制雾面；`shape` 传 SVG 或透明 PNG 即可沿轮廓生成异形玻璃（跨域图片需 CORS）。

## GridMotion · 动感照片墙

- 组件：`components/ui/GridMotion.jsx`（JavaScript + Tailwind 变体，此变体没有独立 CSS 文件，样式全部是 Tailwind 工具类）；组件仅依赖 React，但真实项目需先配置 Tailwind 才能正常显示。
- demo：`app/grid-motion/page.jsx`，图片用 `/assets/sunset.jpg`、`/assets/landscape.jpg`、`/assets/city-poster.jpg` 与 `/assets/logo.png`（部署时拷进 Next 的 `public/`）。
- 预览：直接打开 `grid-motion.html`，或主入口 `index.html`（同为这个效果）；原型把组件的 Tailwind 工具类逐条翻译为等价样式，观感与组件一致。
- 访问路径：`/grid-motion`。
- 行为：整墙按 `angle` 旋转，相邻行反向漂移（`direction`），指针周围 `spotlight` 范围内被 `dim` 压暗的格子恢复彩色，墙面按 `fade` 羽化；`grayscale` 可让格子默认黑白、聚光时恢复；支持 `prefers-reduced-motion`。

## SwipeRow · 滑动操作行

- 组件：`components/ui/SwipeRow.jsx`（JavaScript + Tailwind 变体，无独立 CSS 文件）。依赖安装：`npm install motion @hugeicons/react @hugeicons/core-free-icons`（`motion` 在 RubberSegment / FlipCard 已装过）。
- demo：`app/swipe-row/page.jsx`，三行品牌任务，向左滑出「删除 / 归档」抽屉，`onCommit` 后该行从列表移除。
- 预览：直接打开 `swipe-row.html`，或主入口 `index.html`（同为这个效果）；原型把 Tailwind 类逐条翻译为等价样式，`motion` 的弹簧动画用原生 JS 等价实现。
- 访问路径：`/swipe-row`。
- 行为：拖动行面露出操作抽屉（越过 `commitAt` 折点时红色块跳跃铺满整行，松手折叠并触发 `onCommit`）；轻扫按速度吸附开合；键盘：方向键开合、Enter/空格切换、Delete/Backspace 提交、Esc 关闭；`direction="right"` 整体镜像。
