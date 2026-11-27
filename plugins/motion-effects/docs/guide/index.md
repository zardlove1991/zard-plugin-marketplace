# 接入指南

这个站点是 `motion-effects` 技能的**可视化预览与接入文档**。30 个特效都有：

- 可运行的独立演示（iframe，原生 HTML/CSS/JS，无构建依赖）
- React 源码（JSX/TSX，部分带 CSS）
- Vue 3 移植难度、依赖与关键 API
- 移植/降级注意事项

已有 30 个 Vue 3 实装，详情页里直接渲染真实组件，其中 26 个还能在「自定义」面板里调参数；完整清单见 [Vue 组件（0.1）](/guide/vue-components)。

## 选型

先按场景挑 1–2 个，不要为了丰富而堆特效：

| 需求 | 首选 |
|---|---|
| 营销首屏 / 滚动叙事 | `scroll-video-hero`、`glass-logo-reveal` |
| 移动端列表操作 | `swipe-row`、`rubber-segment`、`hold-button` |
| 数据 / 功能展示 | `magic-bento`、`animated-list`、`tilted-card` |
| 玻璃拟态 | `glass-surface`、`glass-folder-cards`、`liquid-glass-navbar` |
| 身份卡 / 3D 翻面 | `reflective-card`、`flip-card` |
| 导航 | `pill-nav`、`liquid-glass-navbar` |
| 液态导航 | `gooey-nav` | — |
| 应用 Dock | `dock` | — |
| 氛围装饰 | `ghost-cursor`、`paper-crumple`、`grid-motion` |
| 内容演示 | `terminal-replay`、`signature` |
| 分步引导 | `stepper` | — |
| 点击反馈 / 火花 | `click-spark` | — |

## 安装技能

本仓库同时是 Claude Code 插件 marketplace：

```text
/plugin marketplace add https://github.com/zardlove1991/zard-plugin-marketplace
/plugin install motion-effects@zard-plugin-marketplace
```

安装后，提到"玻璃拟态 / 滑动操作 / 3D 卡片 / 滚动视频 / WebGL 光标"等需求会自动触发技能。

## 移植流程

1. 在 catalog 找到对应条目，读源码 + demo；
2. Vue 3 项目按 `vue-porting.md` 映射，React 项目直接复制源码；
3. 保留 CSS、shader、弹簧/阻尼等观感常量；
4. 按 `production-checklist.md` 验收（reduced-motion、WebGL 降级、SSR、清理、触屏）。

参考文档在 GitHub：

- [完整特效目录](https://github.com/zardlove1991/zard-plugin-marketplace/blob/main/plugins/motion-effects/skills/motion-effects/references/catalog.md)
- [React → Vue 3 移植手册](https://github.com/zardlove1991/zard-plugin-marketplace/blob/main/plugins/motion-effects/skills/motion-effects/references/vue-porting.md)
- [生产验收清单](https://github.com/zardlove1991/zard-plugin-marketplace/blob/main/plugins/motion-effects/skills/motion-effects/references/production-checklist.md)