# Web 原型自检清单（中文伴读翻译）

> **文件性质**：本文是 `checklist.md`（OpenDesign 上游，锁定 commit 0701042）的中文翻译，**仅供人阅读，非执行件**；上游同步时需对照新版重新核对。

发出 `<artifact>` 之前过一遍。**P0 必须全过**；P1 应当通过；P2 是加分项。

## P0 —— 必须通过

- [ ] **`:root` token 块之外没有裸十六进制色值。** 每个颜色都是 `var(--bg)` / `var(--fg)` / `var(--muted)` / `var(--border)` / `var(--accent)` / `var(--surface)`（或它们的 `color-mix()`）。在 `:root{}` 之外 grep `#[0-9a-fA-F]{3,8}` 应该一无所获。
- [ ] **所有标题用 `var(--font-display)`。** 不许有无衬线 `<h1>` / `<h2>`。Inter / Roboto / system-sans 永远不充当 display 字体。
- [ ] **强调色每屏最多出现两次。** 数一数：eyebrow 颜色、主 CTA 填充、还有别的吗？到三次及以上，把一处降级为 `var(--fg)` 或 `var(--muted)`。
- [ ] **没有紫色/紫罗兰渐变背景。** 不许 `linear-gradient(... #a855f7 / #8b5cf6 / purple ...)`。种子模板背景没有渐变——保持下去。
- [ ] **不用 emoji 当功能图标。** 用 Layout 3 内置的单色线性 SVG 标记，或 `--font-mono` 里一个得体的单字符字形。✨ 🚀 🎯 出局。
- [ ] **不编造数据。** 页面上每个数字都来自用户、brief，或明确标注为占位（如 `[REPLACE] · 38×`）。没有出处的 "10× faster"、"99.9% uptime" = 删。
- [ ] **没有凑数文案。** "Feature One / Feature Two"、lorem ipsum、"Lorem ipsum dolor" 零容忍。某个 section 感觉空，就删掉它；不要填 padding。
- [ ] **点名的真实世界对象用正确的真实图片。** 检索/抓取并核实所指的人物、产品、品牌标、封面、作品、活动、地标或地点。绝不用生成的、手绘的、通用的、神似的或虚构的替代品。
- [ ] **没有远程图片依赖。** 每张用到的图片都以 data URI 内嵌在 artifact HTML 里。不留热链、会过期的 URL、失效源，也不留无标签的 `.ph-img` 脚手架。
- [ ] **内容图像保持固有比例和完整画幅。** 检查源图宽高；把整个 `.ph-img` 脚手架替换为 `<img class="content-img" width="…" height="…">`。不保留 `.ph-img`、`.wide`、`.portrait`、`.square`，不同时固定两个渲染轴，内容图像不用 `cover`。异常高或异常宽的图像必须一个轴受约束、另一个轴保持自适应，既不裁切也不撑出超长页高。
- [ ] **每个顶层 `<section>` 带 `data-od-id`。** 评论模式靠它定位 section。
- [ ] **移动端回流可用。** 所有 `grid-2`、`grid-3`、`grid-4`、`grid-2-1`、`grid-1-2` 在 ≤920px 时收成一列（`template.html` 里的默认 media query 已做这件事）。心里模拟收窄验证——不许横向滚动。
- [ ] **不调 `scrollIntoView()`。** 会弄坏 OD 预览 iframe。需要滚动行为就用 `scrollTo({...})`。

## P1 —— 应当通过

- [ ] **一处决定性的点睛。** 一条 pull quote、一个抓人的数字、一张有真实感的照片、hero 上一个微动画。**一处**。不是三处。
- [ ] **section 节奏交替。** 不连续两个 stat 行。不连续两个 feature 三联。不连续两个 quote 块。
- [ ] **标题不超过 14 个词。** 再长，就是文字在抢设计的活。
- [ ] **导语不超过 56 字符 / 两句。** `.lead` 上的 `max-width: 60ch` 已强制；不要覆盖。
- [ ] **CTA 按钮说清楚会发生什么。** "Start free" 好过 "Get Started"。"Read the story" 好过 "Learn More"。
- [ ] **所有 `<a>` 和 `.btn` 有 hover 态。** 种子模板已覆盖。
- [ ] **数字用 `.num`（等宽、表格数字）。** 价格、统计、版本号、日期。
- [ ] **每页一种图像风格。** 不要方形人物头像混宽屏产品 hero 混竖屏手机 mock——选定一种。

## P2 —— 加分项

- [ ] **长段落 / 标题加 `text-wrap: pretty` / `balance`**（种子已在 `<p>` 和 `h*` 上）。
- [ ] **派生色调用 `color-mix()`。** 不另立 `--accent-50` / `--accent-300` 这种 Bootstrap 式 token——当场派生。
- [ ] **sticky topnav 有毛玻璃**（种子已通过 `backdrop-filter: blur()` 做到）。
- [ ] **加载的字体系统优先。** 衬线用 Iowan Old Style / Charter，无衬线用系统栈。只有 DESIGN.md 指定了才拉 Google Font。

## 反 AI 味抽查

盯着页面看两秒。如果直觉说出以下任何一句：

- "长得像我这个月见过的每一个 Cursor / Linear / Vercel 仿品"
- "这可以是任何一家 AI 创业公司的首页"
- "feature 行是一个图标、一个标题、三行含糊的卖点文案"

……回去，把一个 feature 格换成**这个**产品更具体的东西（一张截图、一个真实例子、一段实际输出样本），再减掉一处强调色。
