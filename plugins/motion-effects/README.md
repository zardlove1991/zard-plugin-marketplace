# motion-effects

20 个高保真交互动效的接入技能。**Vue 3 优先**，同时保留 React 原件与可直接运行的 HTML 演示。

## 包含什么

| 目录 | 内容 |
|---|---|
| `skills/motion-effects/SKILL.md` | 技能入口：选型 → 移植 → 验收的工作流与硬规则 |
| `skills/motion-effects/references/catalog.md` | 20 个特效的场景、依赖、Vue 难度、关键 API、移植要点 |
| `skills/motion-effects/references/vue-porting.md` | React → Vue 3 映射、SFC 骨架、WebGL / three 生命周期、常见坑 |
| `skills/motion-effects/references/production-checklist.md` | 性能、无障碍、SSR、降级、隐私、交付验收清单 |
| `skills/motion-effects/assets/gallery.html` | 可运行的 gallery：筛选 / 搜索 / iframe 预览 / API 速查 |
| `skills/motion-effects/assets/demos/` | 20 个独立 HTML 演示（vanilla，无构建） |
| `skills/motion-effects/assets/react/` | React 源码（JSX/TSX + CSS）与 `SETUP.md` |
| `docs/` | VitePress 预览站：特效详情、搜索、分类、源码链接；CI 部署到 GitHub Pages |

## 特效清单

导航与页面：`PillNav`、`liquid-glass-navbar`、`scroll-locked-video-hero`

卡片与容器：`FlipCard`、`TiltedCard`、`ReflectiveCard`、`GlassSurface`、`glass-folder-cards`、`MagicBento`

操作与反馈：`HoldButton`、`SpecularButton`、`SwipeRow`、`RubberSegment`

列表与内容：`AnimatedList`、`signature`、`terminal-replay`

氛围与装饰：`GhostCursor`、`liquid-glass-logo-reveal`、`PaperCrumple`、`GridMotion`

## 在线预览（VitePress + GitHub Pages）

线上地址：<https://zardlove1991.github.io/zard-plugin-marketplace/>

站点在 `docs/`，本地：

```bash
cd plugins/motion-effects/docs
pnpm install
pnpm dev          # 构建前自动同步 demos/source 到 public/
```

- 首页 → 特效总览 → 每个特效的独立预览页（宽预览、自适应/1024/768/375、重载、打开演示）
- 每页含 Vue 移植难度、依赖、关键 API、源码/演示链接与注意事项
- CI：`.github/workflows/deploy-motion-effects-docs.yml`，push `main` 自动构建并部署到 GitHub Pages

> 首次部署需在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。仓库改名或自定义域名时设置仓库变量 `DOCS_BASE`。
> 部署细节见 `docs/guide/deploy.md`。

## 打开单页 gallery

```bash
cd plugins/motion-effects/skills/motion-effects/assets
npx serve .          # 或 python -m http.server
# 浏览器打开 http://localhost:3000/gallery.html
```

> 单页 gallery 仍保留，作为不依赖 VitePress 的备选；线上站点已包含它的入口（导航 Gallery）。
> 直接双击 `gallery.html`（`file://`）部分浏览器的 iframe 会被拦截；页面顶部会提示。

## 安装

本仓库自身是 marketplace，已登记本插件：

```text
/plugin marketplace add <本仓库路径或 Git URL>
/plugin install motion-effects@zard-plugin-marketplace
```

安装后，提到"特效 / 玻璃拟态 / 滑动操作 / 3D 卡片 / 滚动视频 / WebGL 光标"等需求时会自动触发 `motion-effects` 技能。

## 使用方式

在 Claude Code 里触发技能后，它会：

1. 按场景从 catalog 选 1–2 个特效；
2. Vue 3 项目按 `vue-porting.md` 移植，React 项目直接复制源码；
3. 强制走 `production-checklist.md` 验收，并如实标注未实测项。

## 来源

组件整理自 21st.dev 等上游实现，React 源码与 HTML 演示均已 vendored 到本插件内。上游组件的许可与署名要求请按目标项目实际情况确认；源码头部注释保留。

## 版本

- `0.1.0`：首版。目录 + 选型指南 + 可运行 gallery；Vue 3 移植手册与验收清单。逐组件 Vue 成品移植按需后续补充。