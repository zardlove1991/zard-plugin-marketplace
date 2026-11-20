# Design Brief 技能（中文伴读翻译）

> **文件性质**：本文是 `SKILL.md`（上游 commit `f1a0b60`，Apache-2.0）的中文翻译，**仅供人阅读理解**。
> 管线执行仍以英文原版 `SKILL.md` 为准（按原文 Section 1–5 执行）；上游同步更新时，本翻译需对照新版重新核对。
> 一句话：教 AI 把客户一句模糊的话（"做个干净专业的落地页"）翻译成一份色号、字号、间距全部有明确数值的设计规范（DESIGN.md + 预览页）。

---

# Design Brief 技能

把结构化的设计 brief 解析成具体的 DESIGN.md 和可选的可视化预览。Agent，请严格按本工作流执行。

## 背景

本技能中的 8 个维度提炼自 OpenDesign 最初的 71 个设计系统样本；71 是研究样本数，不是当前内置系统的数量。`design-systems/` 下的每份 `DESIGN.md` 都至少要回答：色板、强调色、字体、标题字、布局模型、组件风格。我们把这些蒸馏成 8 个相互正交的维度，覆盖设计师在落任何像素**之前**要做的决策。之所以额外加入 Mood（气质）和 Density（密度），是因为它们是自然语言 brief 里最常见的两个歧义源（"做干净点"每个人理解都不一样）。

**刻意不在 brief 层处理的维度**：动画时长、响应式策略、无障碍对比度。这些由各模板级技能自行约束（例如 `saas-landing` 自己管自己的响应式逻辑）；不过生成的 DESIGN.md 会包含合理的断点默认值，供下游使用。

## 1. 接收输入

用户提供两种格式之一的 brief：

### 方式 A：I-Lang 结构化 brief

```
[PLAN:@DESIGN|type=saas_landing]
  |palette=navy_and_white|accent=coral
  |typography=inter|display=space_grotesk
  |layout=single_column|max_width=1200px
  |mood=professional_minimal
  |density=spacious|section_gap=96px
  |hero=headline+subhead+cta
  |sections=features,pricing,testimonials,footer
  |exclude=animations,parallax,gradients
  |responsive=mobile_first
```

### 方式 B：自然语言

> "我要给一个开发者工具做落地页。干净、极简、深色模式。Inter 字体。不要花哨的动画。"

若用户提供方式 B，先用下面的映射表转成结构化格式，再继续。要显式识别每一个已声明的维度，并标记出未指定的维度。

### 自然语言 → I-Lang 映射

对自然语言输入的每一句话，识别维度关键词，映射到最接近的结构化值：

| 自然语言说法 | 维度 | I-Lang 值 |
|---|---|---|
| "dark mode"、"dark theme"（深色模式） | palette | `monochrome_dark` |
| "light"、"white background"（浅色、白底） | palette | `light_clean` |
| "earthy"、"warm tones"（大地色、暖色调） | palette | `earth_tones` |
| "pop of color"、"vibrant"（亮色点缀、鲜艳） | accent | `electric_blue`（默认）或 `coral` |
| "subtle accent"（低调点缀色） | accent | `muted_sage`（默认）或 `slate` |
| "clean"、"minimal"、"simple"（干净、极简） | mood | `professional_minimal` |
| "playful"、"fun"、"friendly"（俏皮、友好） | mood | `playful` |
| "bold"、"brutalist"、"raw"（大胆、粗野） | mood | `brutalist` |
| "editorial"、"magazine-like"（杂志感） | mood | `editorial` |
| "spacious"、"lots of whitespace"（留白多） | density | `spacious` |
| "compact"、"dense"、"information-rich"（紧凑、信息密） | density | `compact` |
| "Inter"、"system font"（系统字体） | typography | `inter`（默认）或 `system_ui` |
| "serif"、"traditional"（衬线、传统） | typography | `georgia`（默认）或 `playfair` |
| "monospace"、"code-like"（等宽、代码感） | typography | `jetbrains_mono` |
| "no animations"、"static"（不要动画、静态） | exclude | `animations` |
| "no gradients"（不要渐变） | exclude | `gradients` |
| "no stock photos"（不要图库照片） | exclude | `stock_photos` |
| "single page"（单页） | layout | `single_column` |
| "two columns"、"sidebar"（两栏、侧边栏） | layout | `two_column` |
| "mobile first"（移动优先） | responsive | `mobile_first` |

当一句话映射到多个维度时（例如 "clean dark landing page" → mood=professional_minimal + palette=monochrome_dark + layout=single_column），每个维度独立解析。当一条映射列出多个可选值时，**第一个是默认值**；仅当上下文强烈支持时，agent 才可以选备选值。

## 2. 校验维度

每份 brief 必须解析出以下 8 个维度。若输入中缺失，按 Section 2.2 的规则选合理默认值。

下表列出的值构成**封闭词汇表**。只有表中列出的值在 Section 2.1 里有具体 token 映射。若用户给了表外的值，agent 必须追问澄清，**不许猜**。

| # | 维度 | 键 | 可选值示例 |
|---|---|---|---|
| 1 | 色板 | `palette` | navy_and_white, earth_tones, monochrome_dark, light_clean |
| 2 | 强调色 | `accent` | coral, electric_blue, emerald, muted_sage |
| 3 | 正文字体 | `typography` | inter, system_ui, dm_sans, georgia |
| 4 | 标题字体 | `display` | space_grotesk, clash_display, same_as_body, playfair |
| 5 | 布局模型 | `layout` | single_column, two_column, asymmetric |
| 6 | 气质 | `mood` | professional_minimal, playful, brutalist, editorial |
| 7 | 密度 | `density` | compact, balanced, spacious |
| 8 | 约束（排除项） | `exclude` | animations, gradients, stock_photos, carousel |

### 2.1 符号值 → 具体 token 解析

每个符号值都映射到具体的设计 token。agent 在写 DESIGN.md **之前**必须完成解析：

| 符号值 | 具体 token |
|---|---|
| `palette=navy_and_white` | 背景：#0F172A，表面：#1E293B，文字：#F8FAFC，次要文字：#94A3B8 |
| `palette=monochrome_dark` | 背景：#09090B，表面：#18181B，文字：#FAFAFA，次要文字：#A1A1AA |
| `palette=light_clean` | 背景：#FFFFFF，表面：#F8FAFC，文字：#0F172A，次要文字：#64748B |
| `palette=earth_tones` | 背景：#FFFBEB，表面：#FEF3C7，文字：#451A03，次要文字：#92400E |
| `accent=coral` | 强调：#F97316，悬停：#EA580C |
| `accent=electric_blue` | 强调：#3B82F6，悬停：#2563EB |
| `accent=emerald` | 强调：#10B981，悬停：#059669 |
| `accent=muted_sage` | 强调：#84A98C，悬停：#6B8F73 |
| `accent=slate` | 强调：#64748B，悬停：#475569 |
| `typography=inter` | 正文：Inter，400，1rem/1.6 |
| `typography=system_ui` | 正文：system-ui，400，1rem/1.6 |
| `typography=dm_sans` | 正文：DM Sans，400，1rem/1.6 |
| `typography=georgia` | 正文：Georgia，400，1.125rem/1.7 |
| `display=space_grotesk` | 标题：Space Grotesk，700，clamp(2rem, 5vw, 3.5rem) |
| `display=clash_display` | 标题：Clash Display，700，clamp(2rem, 5vw, 3.5rem) |
| `display=playfair` | 标题：Playfair Display，700，clamp(2rem, 5vw, 3.5rem) |
| `display=same_as_body` | 标题继承正文字族，字重 600 |
| `density=compact` | 区块间距：48px，内容内边距：16px/24px |
| `density=balanced` | 区块间距：72px，内容内边距：24px/40px |
| `density=spacious` | 区块间距：96px，内容内边距：24px/48px |

表外符号值一律无效。若用户给了无法识别的值（如 `palette=ocean_blue`），agent 必须追问："我不认识 `palette=ocean_blue`。你是想要 `navy_and_white`、`monochrome_dark`、`light_clean` 还是 `earth_tones`？"

### 2.2 默认值解析规则

某维度未指定时，按气质（mood）兼容性选默认值：

| 未指定的维度 | 默认规则 |
|---|---|
| `palette` | mood=editorial → `light_clean`；mood=brutalist → `monochrome_dark`；其余 → `light_clean` |
| `accent` | 深色系色板 → `coral`；浅色系色板 → `electric_blue` |
| `typography` | 一律 → `inter`（跨平台可读性最高） |
| `display` | mood=editorial → `playfair`；mood=brutalist → `space_grotesk`；其余 → `same_as_body` |
| `layout` | 一律 → `single_column`（最稳妥的响应式默认） |
| `mood` | 一律 → `professional_minimal`（最少主观倾向） |
| `density` | 一律 → `balanced` |
| `exclude` | 一律 → 无（未指定即无约束） |

若连 mood 也没指定，全部回退到安全中性组合：`palette=light_clean`、`accent=electric_blue`、`typography=inter`、`display=same_as_body`、`layout=single_column`、`mood=professional_minimal`、`density=balanced`、`exclude=none`。

## 3. 生成 DESIGN.md

本技能基于解析完成的各维度**从零生成** DESIGN.md。若工作目录已有 DESIGN.md，agent 应先问用户是覆盖还是跳过。

按下面九节大纲产出 DESIGN.md。该大纲是本技能可移植的独立输出，继承自 OpenDesign 最初的上游基线；**不是**当前仓库的包 schema。当前内置包还会带 `manifest.json`、`tokens.css` 及可选富资源，而仅含 `DESIGN.md` 的旧版或用户自装内容同样保持可读。所有色号、字体栈、间距值**必须来自 Section 2.1 解析出的 token——不许发明解析表之外的值**。

```markdown
# [项目名] 设计系统

## 视觉主题与气质
- 气质：[由 mood 解析]
- 感觉：[由 mood 推导——例如 professional_minimal → "干净、自信、克制"]
- 参考：[mood=editorial → "杂志版式、Monocle、Cereal"；mood=brutalist → "暴露的结构、原始排印"]

## 色板与角色
- 背景：[由 palette 解析]
- 表面：[由 palette 解析]
- 主文字：[由 palette 解析]
- 次文字：[由 palette 解析]
- 强调色：[由 accent 解析]
- 强调色悬停：[由 accent 解析]

## 排印规则
- 标题：[由 display 解析]，700，clamp(2rem, 5vw, 3.5rem)
- 正文：[由 typography 解析]，400，1rem/1.6
- 等宽：JetBrains Mono，400，0.875rem

## 组件样式
- 按钮：[mood=playful → "全圆角 rounded-full"，否则 → "圆角 rounded-md"]，强调色底，对比文字
- 卡片：表面色底，细边框，12px 圆角
- 输入框：[mood=brutalist → "粗边框"，否则 → "透明底、下边框"]

## 布局原则
- 最大宽度：1200px
- 栅格：[由 layout 解析]
- 区块间距：[由 density 解析]
- 内容内边距：[由 density 解析]

## 深度与投影
- 阴影：[mood=brutalist → "硬投影 4px 偏移"；mood=professional_minimal → "无"；其余 → "轻投影 sm"]
- 边框：1px 实线 [由 palette 推导，取文字色 8% 不透明度]

## 应该做 / 不应该做
- 应该 只使用声明的颜色 token。
- 应该 保持区块间距一致。
- 应该 保证所有文字满足 WCAG AA 对比度。
- 不应该 发明色板外的颜色。
- 不应该 加装饰性阴影（除非「深度与投影」一节允许）。
- 不应该 使用超过 2 套标题/正文字体（等宽字是代码与数据的工具字——不计入此上限）。

## 响应式行为
- 断点：640px (sm)、768px (md)、1024px (lg)、1280px (xl)
- 手机：单列，所有区块纵向堆叠
- 平板：允许两栏特性栅格
- 桌面：完整布局 + 最大宽度约束
- 图片：流式，max-width 100%，保持宽高比

## Agent 提示词指南
- 不要发明本色板外的颜色。
- 不要加 box-shadow（除非上文指定）。
- 强调色每屏最多出现 3 次。
- 所有可交互元素需要 :focus-visible 外框。
- [若 exclude 有内容 → 逐条列为 "不要使用 {item}。"]
```

## 4. 生成 brief-preview.html

创建单个 HTML 文件，把解析出的 token 可视化渲染出来。预览页必须**按顺序**包含这 4 段：

1. **色板色块**——一排水平排列的矩形，每个展示颜色区的一色。标注角色（背景 / 表面 / 文字 / 强调）与 hex 码。
2. **字体样张**——三块文字分别以声明尺寸展示标题、正文、等宽字体。每块用同一句示例句（"The quick brown fox..."）。
3. **间距标尺**——可视化标尺或堆叠条，展示区块间距与内容内边距的数值，标注 px 值。
4. **组件预览**——用解析出的 token 渲染 2–3 个真实组件（主按钮、带标题/正文的卡片、文本输入框）。必须是可运行的 HTML/CSS，**不是截图**。

预览页本身也要用解析出的设计系统 token 来排版（背景色、字体、间距），看起来要像一页设计系统文档。

## 5. 汇报未指定的维度

在输出的最后，列出用户没有指定、而由默认值补位的维度，以及选中该默认值所依据的规则：

```
由默认值补位的维度：
- display：设为 "same_as_body"（规则：mood=professional_minimal → same_as_body）
- density：设为 "balanced"（规则：静态回退，未给出间距偏好）
- exclude：设为 "none"（规则：未指定即无约束）
```

这种透明化可以防止"沉默的假设"悄悄混进最终设计。
