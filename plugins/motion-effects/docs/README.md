# motion-effects docs

25 个特效的 VitePress 预览站，自动部署到 GitHub Pages。

## 本地

```bash
cd plugins/motion-effects
pnpm install
pnpm dev
```

`dev` / `build` 会先运行 `scripts/sync-assets.mjs`，把技能里的 demos 与 React 源码复制到 `public/`，并校验文件完整性。

## 总览卡片用的预览视频

首页和总览页的卡片里播放的是**预录的循环视频**（和 React Bits / Vue Bits 的做法一致），不在网格里同时跑几十个 WebGL：

```bash
pnpm previews              # 录全部
pnpm previews hold-button  # 只录指定的 id
```

- 用无头 Chrome 打开每个 vanilla 演示，按 `scripts/preview-choreo.mjs` 的编排走一遍指针，再用 ffmpeg 做成无缝循环。
- 产物在 `public/previews/<id>.{webm,mp4,webp}`，清单写到 `.vitepress/data/previews.mjs`；这些文件要提交，线上构建不重新录。
- 需要：系统 Chrome（或 `CHROME_PATH`）、PATH 里的 ffmpeg、`pnpm exec playwright-core install ffmpeg`（一次性）。
- 录完看 `.vitepress/cache/preview-sheet.jpg`（封面总览图）检查取景。

## 构建与预览

```bash
pnpm build
pnpm preview
pnpm test
pnpm typecheck
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
│   ├── config.mts            # 站点配置 / base
│   ├── data/
│   │   ├── effects.mjs       # 25 个特效的共享数据
│   │   ├── nav.mjs           # 仓库地址、指南菜单、分类图标
│   │   ├── previews.mjs      # 预览视频清单（脚本生成）
│   │   └── props/<id>.mjs    # 各组件的 props 清单（驱动 Customize / Props 表 / 用法代码）
│   └── theme/
│       ├── Layout.vue        # 应用壳：顶栏 + 侧栏 + 内容区
│       ├── components/       # 首页、总览、卡片、壳，以及 effect/ 详情页部件
│       ├── demos/            # 详情页里内联渲染的预览台（<Name>Stage.vue）
│       ├── composables/      # 链接、筛选状态、参数值、用法代码生成
│       └── styles/           # tokens / base / shell / browse / landing / effect
├── effects/
│   ├── index.md              # 特效总览（BrowsePage）
│   └── [id].md + paths.mjs   # 动态特效详情页（EffectPage）
├── guide/                    # 接入、部署、维护文档
├── live/                     # 需要独占文档的实时预览页（iframe 承载）
├── public/                   # logo 与 previews/（预录视频）
└── scripts/                  # sync-assets / record-previews / preview-choreo
```