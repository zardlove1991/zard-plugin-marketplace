# Web Prototype 技能（中文伴读翻译）

> **文件性质**：本文是 `SKILL.md`（OpenDesign 上游，锁定 commit 0701042）的中文翻译，**仅供人阅读，非执行件**；上游同步时需对照新版重新核对。
> 一句话：通用桌面 Web 高保真原型——单个自包含 HTML 文件，复制种子 `assets/template.html`、从 `references/layouts.md` 粘贴 section 骨架组合而成。管线②高保真 Web 轨的执行技能。

---

# Web Prototype 技能

产出一个单文件、自包含的 HTML 原型，用随附的种子和布局库组合——**不是**从零手写 CSS。种子已经内置了好的默认值（字体排印、间距、强调色预算），你的工作是组合它。

## 资源地图

```
web-prototype/
├── SKILL.md                ← 你正在读的
├── assets/
│   └── template.html       ← 种子：tokens + class 体系 + 页面骨架（先读这个）
└── references/
    ├── layouts.md          ← 8 个可直接粘贴的 section 骨架
    └── checklist.md        ← P0/P1/P2 自检
```

## 工作流

### Step 0 —— 预检（动笔前做一次）

1. **通读 `assets/template.html`**——至少读完 `<style>` 块。`references/layouts.md` 开头的 class 清单列出了必须在那里定义的每一个 class；缺了哪个，就补进 `<style>`，不要在每个 section 上内联重定义。
2. **读 `references/layouts.md`**，知道有哪些 section 骨架。不要写清单没覆盖的 section 类型——挑最接近的布局再改造。
3. **读当前生效的 DESIGN.md**（已注入系统提示）。把它的颜色映射到种子的六个 `:root` 变量上；不要引入新 token。

### Step 1 —— 从种子准备 artifact

组合页面前先定一个 kebab-case 的 artifact slug。以 `assets/template.html` 作为最终 artifact HTML 的种子。

在发出最终 `<artifact>` 之前，不要用 file-write 先写一个项目根目录的 HTML 草稿。live-artifact 输出就是本次生成回合的权威 HTML 文件；多余的 `index.html`、`cast.html` 或由 brief 派生的草稿会变成孤儿文件遗留在旁边。

用当前设计系统的 token 替换六个 `:root` 变量。替换页面 `<title>` 和 topnav 品牌名。

### Step 2 —— 规划 section 清单

**先定布局再写文案。** 默认节奏（出自 `layouts.md`）：

| 页面类型 | 默认节奏 |
|---|---|
| Landing | 1 hero → 3 features → 4 stats *或* 5 quote → 自定义 split → 6 cta |
| Marketing / 编辑型 | 1 hero-center → 7 log list → 6 cta |
| Pricing | 1 hero-center → 8 comparison table → 6 cta |
| Docs 索引 | 1 hero-center → 7 log list（文档分节）→ 6 cta |

动笔前先用一句话向用户报出所选清单——此刻改道很便宜，写完 200 行 HTML 再改就贵了。

### Step 3 —— 粘贴填充

对每个选定的布局，把 `layouts.md` 里的 `<section>` 块复制进 artifact HTML 的 `<main id="content">`。把方括号 `[REPLACE]` 字符串替换成来自用户 brief 的真实、具体的文案。**不要凑数**——某个槽位是空的，说明这个 section 选错了；换一个布局。把每个 `.ph-img` 块当作布局脚手架，section 需要图像时替换掉它，遵循下面的真实优先规则，然后自检。

### Step 4 —— 自检

从头到尾过一遍 `references/checklist.md`。每个 P0 项必须通过才能继续。P1 应当通过；P2 是加分项。

### Step 5 —— 发出 artifact

把完成的 HTML 包进 `<artifact>` 标签，用 artifact slug 作 `identifier`。前面用一句话描述内容。`</artifact>` 之后即停。

## 硬规则（种子已兜底大部分——别跟它对着干）

- **单一强调色，每屏最多出现两次。** eyebrow + 主 CTA 是默认预算。
- **Display 字体是衬线**（种子里的 Iowan Old Style / Charter / Georgia）。正文无衬线。数字、图注、eyebrow 用等宽。
- **真实图像，绝不远程热链。** `.ph-img` 是临时布局脚手架，不是默认的最终形态。对点名的真实世界对象，检索/抓取正确的真实图片，以 data URI 内嵌进 artifact HTML；绝不生成、手绘或发明替代品。对示意性、氛围性主体，优先合适的真实摄影，图像生成只作兜底。拿不到或无法内嵌合规资产时，保留一个有意保留的、带标签的 `.ph-img`，并在 artifact 前的那句话里披露该限制。
- **保留真实图像的几何属性。** 检查每张获取图像的固有宽高，把整个 `.ph-img` 脚手架替换成 `<img class="content-img">`，并设置匹配的 `width`、`height` 属性。绝不把 `.ph-img`、`.wide`、`.portrait`、`.square` 挪到真实图像上。内容图像必须展示完整画幅；`object-fit: cover` 只用于有意裁切的装饰性填充。种子的 `.content-img` 规则会把异常高或异常宽的图像在一个轴向上约束到视口内、另一轴保持自适应。
- **移动端回流已内建**，靠种子 920px 的 media query。别加固定宽度破坏它。
- **每个 `<section>` 带 `data-od-id`**，评论模式靠它定位。

## 输出契约

```
<artifact identifier="kebab-case-slug" type="text/html" title="Human Title">
<!doctype html>
<html>...</html>
</artifact>
```

OpenDesign 从这个 identifier 派生权威 HTML artifact。同一生成回合不要再写另一个根 HTML 文件。

artifact 前一句话。之后什么都不加。
