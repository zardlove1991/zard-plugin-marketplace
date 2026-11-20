# od-design-pipeline

OpenDesign 三段设计管线（移动端 / Web 双轨）。

## 管线

```
⓪规范 bootstrap（可选：项目无规范时，外层执行） → ①线框（定结构与流程） → 【客户确认】 → ②高保真（交互原型） → ③评审（分级报告，默认自动续） → 逐条修复复测（design-review 纪律）
```

| | 移动端（小程序） | Web 端（后台/登录/落地页） |
|---|---|---|
| ①线框 | example-wireframe-mobile-flow | example-wireframe-greybox / annotated |
| ②高保真 | example-mobile-app | example-web-prototype（可选 taste 变体） |
| ③评审 | example-critique（通用） | 同左 |
| ②必读规范 | brand-ci/DESIGN.md Mini Program 节 / brand-ci/system/mini-components.md / brand-ci/system/wot-ui-forms.md / wot-ui-theme.md / `vendor/open-design/mobile-app/`（SKILL+references+assets） | brand-ci/DESIGN.md Web 组件 guidance / brand-ci/system/kit.html / SPEC_DOC §6.4 / `vendor/open-design/web-prototype/`（SKILL+references+assets；上游美学默认与 brand-ci 冲突时以 brand-ci 为准） |
| 实测断点 | 375/390 | 375 / 768 / 1440 三档 |

表中规范路径相对 `SPEC_ROOT`、`SPEC_DOC` 为管线规范文档路径——变量按目标仓库根推导（另有快照根 `SNAPSHOT_ROOT`），见 SKILL.md「路径变量」节。

每段固定五步：发起（requestId+childPid 监视器）→ 等待（禁紧凑轮询；pid 缺失/TIMEOUT 兜底 ≥60s 低频 get_run）→ 导出（OD→repo 快照 cmp）→ 实测（playwright 全链路）→ 提交（核对分支）。

**段间门控**：①完成提交后必须停下，客户确认线框（或要求改①）才发起②；②→③默认自动续跑、②交付时明示。**单段进入**（客户显式要求，默认仍三段走）：②直入（"不要线框直接高保真"，文案照客户 brief+参考图，进段前披露一次返工代价）、③单评（任意 OD artifact，不限管线产物）、①单段（只要结构讨论）。跳过某段不豁免规范 bootstrap 与定轨，详见 SKILL.md「单段进入」。

**执行模式**（默认 OD run：start_run 五步循环，OD 真源）：客户显式选择、或 OD 不可用时的知情备选 → **本地直绘**（repo 即真源；读 vendored 种子 → 组合 → checklist 自检 → playwright 实测，四步；禁止从零手写 CSS；失去 OD 预览/评论/run 可观测）。详见 SKILL.md「开工前决策」第 4 步与「本地直绘循环」。

## 设计系统 bootstrap（⓪）

项目无规范时：**先问客户规范来源**（A 项目自有 design-brief / B 外部品牌规范站 / C 现有路径 / D 本次不建）。选 A → 执行插件内置 design-brief（`vendor/design-system/design-brief/`，OpenDesign 上游、Apache-2.0：8 维 brief → DESIGN.md 九节 + 预览页 + `design-tokens.css`（派生）→ 客户确认）；选 B → ⓪b 读取外部品牌 CI（如 `https://w-lian.com/brandci/index.html`）的 tokens/规范文档/组件 CSS，落成本地 DESIGN.md + `design-tokens.css`（站内原文）+ `SOURCE.md`（来源/日期/文件清单）。两条路都经客户确认后落 `SPEC_ROOT/brand-ci/DESIGN.md` + `design-tokens.css`，再问客户是否进①（不自动续接）。**不依赖 gstack、不依赖 OD MCP**。②/③暴露的组件缺口按 design-md 纪律回写 DESIGN.md「待补」节。

## 前置依赖与缺失处理

| 依赖 | 用途 | 缺失时 |
|---|---|---|
| OpenDesign 桌面端 + `open-design` MCP | ①②③ 全部 OD 段（OD run 模式） | **OD run 模式下硬阻塞**：⓪/⓪b 可先做，之后停下请用户启动 OD + `/mcp`，或知情选本地直绘模式；OD 模式下不手绘替代、不用其它绘图工具顶替 OD 真源 |
| Playwright MCP | 实测与前后截图 | 有 browser-cdp 等浏览器工具则等价替代；都没有 → 实测标「未执行」+「待人工实测」+ 起服务命令，不得声称已验证 |
| `git` | 分支核对/提交 | 产物照常落盘，注明「未提交（无 git）」，不擅自 `git init` |
| `python3` | 实测静态服务 | 换 `npx serve` / `npx http-server`，或浏览器开 `file://` |
| 网络（仅⓪b） | 抓外部品牌 CI | `curl` 兜底；仍不行 → 请客户导出 tokens 文件给本地路径，或退回选 A；不编造 token |

MCP 状态**只看工具列表**：看不到 `mcp__open-design__*` 即视为未连接，勿用 `claude mcp list` 或读 `~/.claude.json` 探测（会逐个拉起全部已配置 server，常表现为卡死）。停/替代时统一交代：缺什么 / 哪几步还能做 / 怎么补 / 补好后从哪继续。

- 规范文件位于目标项目仓库，按目标仓库根推导：`designs/_system/`（SPEC_ROOT）+ `docs/open-design-spec.md`（SPEC_DOC）+ `designs/`（SNAPSHOT_ROOT）；推导路径不存在 → 按 SKILL.md「开工前决策」第 2 条一次问客户（A 用内置 design-brief 建 / B 读外部品牌规范 / C 给实际路径 / D 明确降级），不静默跳过

## 来源

从维运通司机端原型实战（登录/创建企业/工作台全流程）提炼，踩坑对策均来自真实失败记录。

官方插件参照快照随插件安装在 `vendor/open-design/`（锁定上游 commit，同步方式见该目录 UPSTREAM.md）。

设计系统工作流参照随插件安装在 `vendor/design-system/`（design-brief：OpenDesign Apache-2.0 锁定 f1a0b60；design-review：gstack 1.98.0.0 MIT；design-md 待拉取；OD 内置与 open-design 仓库的 design-* 多为目录壳、不 vendored）。
