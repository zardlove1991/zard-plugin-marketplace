# Mobile App 技能（中文伴读翻译）

> **文件性质**：本文是 `SKILL.md`（OpenDesign 上游，锁定 commit 0701042）的中文翻译，**仅供人阅读，非执行件**；上游同步时需对照新版重新核对。
> 一句话：在像素级精确的 iPhone 15 Pro 设备框里渲染**单个**移动端屏幕——复制种子 `assets/template.html`，从 `references/layouts.md` 粘贴一个屏幕原型填充。管线②高保真移动端轨的执行技能。

---

# Mobile App 技能

产出一个移动端屏幕 mockup，装在一个真实感的 iPhone 15 Pro 设备框里。

## 资源地图

```
mobile-app/
├── SKILL.md                ← 你正在读的
├── assets/
│   └── template.html       ← 种子：设备框 + 屏幕原语（先读这个）
└── references/
    ├── layouts.md          ← 6 种屏幕原型（Feed / Detail / Onboarding / Profile / Checkout / Focus）
    └── checklist.md        ← P0/P1/P2 自检（防假手机）
```

## 工作流

### 第 0 步 — 预检

1. **通读 `assets/template.html`** 至 `<style>` 块结束。灵动岛、状态栏 SVG 图标、Home 指示条、侧边金属轨、标签栏都已经用 HTML/SVG 画好了——**不要在每个屏幕里重新实现**。
2. **读 `references/layouts.md`**，知道有哪 6 种原型。
3. **读活动的 DESIGN.md** — 把它的 token 映射进种子的六个 `:root` 变量。

### 第 1 步 — 复制种子

把 `assets/template.html` 复制到项目根作为 `index.html`。把六个 `:root` 变量替换为活动设计系统的 token。替换页面 `<title>` 和设备上方的说明文字。

### 第 2 步 — 只选一个原型

| Brief 里的语言 | 用 |
|---|---|
| feed、inbox、timeline、list、messages、notifications（信息流/收件箱/时间线/列表/消息/通知） | A — Feed |
| article、post、item、recipe、song、product（文章/帖子/条目/菜谱/歌曲/商品详情） | B — Detail |
| sign-up、welcome、intro、walkthrough、tour（注册/欢迎/介绍/引导） | C — Onboarding |
| profile、account、user page、someone's bio（个人页/账户） | D — Profile |
| checkout、payment、order、form、settings step（结账/支付/下单/表单/设置步） | E — Checkout |
| timer、map、dashboard widget、single big number（计时器/地图/仪表盘小部件/单个大数字） | F — Focus / 主打卡片 |

一块移动屏幕只干**一件事**。如果 brief 像是组合了两件事，交付一屏，另一屏作为后续提议。

### 第 3 步 — 粘贴并填充

从 `layouts.md` 把原型块复制进 `<main class="content">`，替换占位卡。把方括号文本换成 brief 里**真实、具体**的文案。不显示标签栏的原型（B、C、E）**整块删掉 `<nav class="tabbar">`**。

### 第 4 步 — 自检

过一遍 `references/checklist.md`。特别注意：
- 设备框仍有灵动岛、状态栏 SVG、Home 指示条
- 点击目标 ≥ 44px
- 一个强调色，全屏最多用 2 次
- 展示标题仍用 `var(--font-display)`（衬线）

### 第 5 步 — 输出 artifact

```
<artifact identifier="mobile-slug" type="text/html" title="Mobile — Screen Name">
<!doctype html>
<html>...</html>
</artifact>
```

artifact 前一句话说明有什么。`</artifact>` 之后停止。

## 硬规则

- **手机是真的。** 灵动岛开孔、SVG 状态图标、Home 指示条。种子保住了这三样——别重写设备框。
- **单屏单职。** 不做多标签导览、不做拼接流程。
- **强调色预算 = 2。** 一个激活标签 + 一个主操作是默认。
- **数字用等宽**（`.num` 类）。
- **展示字用衬线**（`var(--font-display)`）。
- **无外部图片** — 用 `.ph-img` 占位。
