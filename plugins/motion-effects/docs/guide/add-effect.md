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
     height: 560,             // 详情页里 vanilla 演示的 iframe 高度（px）
     desc: '一句话说明',
     deps: ['motion-v'],      // 没有就 []
     demo: 'my-effect.html',
     source: 'react/components/ui/MyEffect.jsx',
     props: ['value', 'onChange'],
     note: '移植与降级注意'
   }
   ```

5. **预览视频**：总览和首页的卡片播放的是预录的循环视频，没有它卡片只有占位。

   ```bash
   cd plugins/motion-effects/docs
   pnpm previews my-effect
   ```

   默认走「指针沿曲线扫过画面中部」的通用编排。小组件太小、想藏掉演示页的标题、或要演一次点击/拖拽时，在 `scripts/preview-choreo.mjs` 里加一条（`zoom` / `css` / `run`）。录完看 `.vitepress/cache/preview-sheet.jpg` 里的取景。产物 `public/previews/<id>.*` 要提交。

6. **验证**：

   ```bash
   pnpm dev      # 侧栏、总览卡片、详情页
   pnpm build
   ```

   `sync-assets.mjs` 会校验 demo/source/本地资产是否存在；缺文件会直接失败。

## 如果同时做 Vue 实装

- 组件放 `packages/vue/src/components/<Name>.vue`，逻辑优先抽到 `src/composables/`
- 测试放 `packages/vue/tests/<name>.spec.ts`（黑盒：props / 事件 / 键盘 / 指针）
- 在 `docs/.vitepress/data/effects.mjs` 对应条目加 `vueReady: true`
- 新组件按 Vue 习惯设计：不加 `className` prop（`class` 自动透传），受控状态只走 `v-model`
- 与 React 原件有行为差异时，写进 `packages/vue/README.md` 的「与 React 原件的差异」

### 让详情页能内联渲染并可调参数

1. **props 清单**：新建 `docs/.vitepress/data/props/<id>.mjs`，并在同目录的 `index.mjs` 里登记。
   每个 prop 用 `p(名字, 类型, 默认值, 说明, 控件?, 选项?)` 描述；`value` 必须是组件的真实默认值，
   Customize 面板、Props 表和用法代码都从它生成。控件留空的 prop 只进 Props 表。
   清单里的 `labels` 映射写每个 prop 的**中文显示名**（面板与 Props 表用 `prop.label` 显示，
   `prop.name` 仍是真实属性名）；`select` 的选项写成 `{ value, label }`，`label` 填中文，
   `value` 保持原值。
2. **预览台**：新建 `docs/.vitepress/theme/demos/<Name>Stage.vue`，用 `useValues()` 取当前参数，
   `pick()` 挑出本组件的 prop 再 `v-bind`，然后在 `components/effect/EffectPage.vue` 的 `STAGES` 里登记。
3. 预览台需要与默认值不同的初始值时（比如默认关着的自动播放），在清单里给该 prop 写 `demo` 值。

### 需要独占文档的组件

会劫持全局输入（例如锁定 `body` 滚动）、铺满视口或需要固定宽度父容器的组件不要内联进文档页：
在 `docs/live/<id>.md` 建一个 `layout: false` 的页面只渲染该组件，
再把它加进 `EffectPage.vue` 的 `FRAMED`（值是 iframe 高度），详情页会用 iframe 加载。

## 更新已有特效

- 演示改了：替换 `assets/demos/<id>.html`，然后重录预览（`pnpm previews <id>`）；新增的本地资产同步放进 `demos/assets/`。
- 源码或 Vue 组件的 props 改了：同步 `data/props/<id>.mjs` 的默认值与说明，以及 catalog 和 `effects.mjs` 的 `props/note`。
- 只改文案：改 `effects.mjs` 和 catalog，保持两处一致。

## 分类

固定五类：`导航与页面`、`卡片与容器`、`操作与反馈`、`列表与内容`、`氛围与装饰`。
需要新分类时，同时改 `docs/.vitepress/data/effects.mjs` 的 `CATEGORIES` 与 `data/nav.mjs` 的 `CATEGORY_ICONS`（侧栏图标栏、总览 chips 和首页分类卡片都从这两处读）。

## 检查清单

- [ ] demo 在本地能独立打开，无控制台报错
- [ ] demo 的本地资产引用全部存在
- [ ] `source` 路径存在，且详情页「源码与演示」里的链接可打开
- [ ] props 清单的 `labels` 与下拉选项都填了中文
- [ ] catalog 与 `effects.mjs` 描述一致
- [ ] `public/previews/<id>.*` 已生成并提交，封面总览图里取景正常
- [ ] 有 Vue 实装的：props 清单与组件默认值一致，预览台能跟随 Customize 变化
- [ ] `pnpm build` 通过
- [ ] 推送后 GitHub Actions 成功，Pages 线上可访问
