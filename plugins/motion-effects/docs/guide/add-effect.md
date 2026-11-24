# 维护者：新增/更新特效

## 新增一个特效

1. **演示**：把独立可运行的 HTML 放到
   `plugins/motion-effects/skills/motion-effects/assets/demos/<id>.html`。
   如果需要本地图片/库，放在 `demos/assets/`（或 `demos/components/ui/` 的 CSS）。
2. **源码**：把 React 组件（`.jsx` / `.tsx`，以及同名 `.css`）放到
   `plugins/motion-effects/skills/motion-effects/assets/react/components/ui/`。
3. **目录**：更新
   `plugins/motion-effects/skills/motion-effects/references/catalog.md`：
   场景速查、总表、独立条目（API / 移植要点 / 注意）。
4. **站点数据**：在 `docs/.vitepress/data/effects.mjs` 的 `EFFECTS` 数组追加一项：

   ```js
   {
     id: 'my-effect',
     name: 'MyEffect',
     zh: '我的特效',
     cat: '操作与反馈',        // 必须是 CATEGORIES 里的分类
     vue: 'mid',              // easy | mid | hard
     height: 560,             // iframe 高度（px）
     desc: '一句话说明',
     deps: ['motion-v'],      // 没有就 []
     demo: 'my-effect.html',
     source: 'react/components/ui/MyEffect.jsx',
     props: ['value', 'onChange'],
     note: '移植与降级注意'
   }
   ```
5. **验证**：

   ```bash
   cd plugins/motion-effects/docs
   pnpm dev
   ```

   `sync-assets.mjs` 会校验 demo/source/本地资产是否存在；缺文件会直接失败。

## 如果同时做 Vue 实装

- 组件放 `packages/vue/src/components/<Name>.vue`，逻辑优先抽到 `src/composables/`
- 测试放 `packages/vue/tests/<name>.spec.ts`（黑盒：props / 事件 / 键盘 / 指针）
- 在 `docs/.vitepress/data/effects.mjs` 对应条目加 `vueReady: true`
- 在 `VueLivePreview.vue` 加该 id 的真实组件预览与代码片段
- 新组件按 Vue 习惯设计：不加 `className` prop（`class` 自动透传），受控状态只走 `v-model`
- 会劫持全局输入的组件（例如锁定 `body` 滚动）不要内联进文档页：在 `docs/live/<id>.md` 建一个 `layout: false` 的页面只渲染该组件，`VueLivePreview.vue` 里用 iframe 加载（参考 `scroll-video-hero`）
- 与 React 原件有行为差异时，写进 `packages/vue/README.md` 的「与 React 原件的差异」

## 更新已有特效

- 演示改了：直接替换 `assets/demos/<id>.html`；如果新增了本地资产，同步放进 `demos/assets/`。
- 源码改了：替换 `assets/react/components/ui/` 对应文件；如果 API 变了，同步更新 catalog 与 `effects.mjs` 的 `props/note`。
- 只改文案：改 `effects.mjs` 和 catalog，保持两处一致。

## 分类

固定五类：`导航与页面`、`卡片与容器`、`操作与反馈`、`列表与内容`、`氛围与装饰`。
需要新分类时，同时改 `docs/.vitepress/data/effects.mjs` 的 `CATEGORIES` 与 VitePress 配置里的 sidebar（自动读取 `CATEGORIES`）。

## 检查清单

- [ ] demo 在本地能独立打开，无控制台报错
- [ ] demo 的本地资产引用全部存在
- [ ] `source` 路径存在，且站点「源码」链接可打开
- [ ] catalog、`effects.mjs`、gallery（如保留）三处描述一致
- [ ] `pnpm build` 通过
- [ ] 推送后 GitHub Actions 成功，Pages 线上可访问