# 本地运行与部署

## 本地开发

`plugins/motion-effects/` 是 pnpm workspace（`docs/` + `packages/vue/`）：

```bash
cd plugins/motion-effects
pnpm install
pnpm dev          # 构建前会自动同步 demos/source 到 public/
```

打开 `http://localhost:5173/`。

`pnpm dev` 会先执行 `scripts/sync-assets.mjs`：

- `skills/motion-effects/assets/demos` → `docs/public/demos`
- `skills/motion-effects/assets/react` → `docs/public/source/react`
- `skills/motion-effects/assets/gallery.html` → `docs/public/gallery.html`

同时校验 24 个特效的 demo/source 以及 demo 内引用的本地资产，缺一个就失败。

## 构建

```bash
pnpm build        # 输出到 docs/.vitepress/dist
pnpm preview      # 本地预览构建产物
pnpm test         # Vue 组件单元测试
pnpm typecheck    # vue-tsc
```

默认 `base` 是 `/`。部署到 GitHub Pages 项目页时通过环境变量指定：

```bash
DOCS_BASE=/zard-plugin-marketplace/ pnpm build
```

## GitHub Actions 自动部署

工作流：`.github/workflows/deploy-motion-effects-docs.yml`

- 触发：push 到 `main`（且改动 `docs/` 或特效 assets）、手动 `workflow_dispatch`
- 构建：pnpm 10 + Node 22
- 部署：GitHub Pages Actions（`configure-pages` → `upload-pages-artifact` → `deploy-pages`）
- `DOCS_BASE` 优先取仓库变量 `vars.DOCS_BASE`，否则默认 `/zard-plugin-marketplace/`

### 首次启用 Pages

仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。之后每次推送自动发布。

线上地址：

```text
https://zardlove1991.github.io/zard-plugin-marketplace/
```

### 仓库改名 / 自定义域名

- 改名：改工作流里的 `DOCS_BASE` 默认值，或在仓库 **Settings → Secrets and variables → Actions → Variables** 新建 `DOCS_BASE`（如 `/new-repo-name/`；自定义域名根路径用 `/`）。
- 自定义域名：在 Pages 设置里配置域名，并把 `DOCS_BASE` 设为 `/`。

## 本地 vs CI

| | 本地 | CI |
|---|---|---|
| base | `/` | `/zard-plugin-marketplace/` |
| 资源同步 | `pnpm dev/build` 自动 | 同左 |
| 部署 | 无 | GitHub Pages |

构建产物不提交 git；`public/demos`、`public/source` 也是构建期生成，已在 `.gitignore` 中忽略。