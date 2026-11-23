# motion-effects docs

20 个特效的 VitePress 预览站，自动部署到 GitHub Pages。

## 本地

```bash
cd plugins/motion-effects/docs
pnpm install
pnpm dev
```

`dev` / `build` 会先运行 `scripts/sync-assets.mjs`，把技能里的 demos 与 React 源码复制到 `public/`，并校验文件完整性。

## 构建与预览

```bash
pnpm build
pnpm preview
```

## 部署

工作流：`.github/workflows/deploy-motion-effects-docs.yml`

- push 到 `main`（`docs/` 或特效 assets 有改动）或手动触发
- GitHub Pages 首次使用需在 **Settings → Pages → Source** 选择 **GitHub Actions**
- 线上：<https://zardlove1991.github.io/zard-plugin-marketplace/>

`DOCS_BASE` 默认 `/zard-plugin-marketplace/`；仓库改名或自定义域名时，修改工作流默认值或在仓库变量里设置 `DOCS_BASE`。

## 目录

```
docs/
├── .vitepress/
│   ├── config.mts          # 站点配置 / 侧栏 / base
│   ├── data/effects.mjs    # 20 个特效的共享数据
│   └── theme/              # 自定义主题与组件
├── effects/
│   ├── index.md            # 特效总览（EffectGrid）
│   └── [id].md + paths.mjs # 动态特效详情页（EffectPreview）
├── guide/                  # 接入、部署、维护文档
├── public/logo.svg
└── scripts/sync-assets.mjs
```