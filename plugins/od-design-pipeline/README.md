# od-design-pipeline

OpenDesign 三段设计管线（移动端 / Web 双轨）。

## 管线

```
⓪规范 bootstrap（可选：项目无规范时，外层执行） → ①线框（定结构与流程） → ②高保真（交互原型） → ③评审（分级报告） → 逐条修复复测（design-review 纪律）
```

| | 移动端（小程序） | Web 端（后台/登录/落地页） |
|---|---|---|
| ①线框 | example-wireframe-mobile-flow | example-wireframe-greybox / annotated |
| ②高保真 | example-mobile-app | example-web-prototype（可选 taste 变体） |
| ③评审 | example-critique（通用） | 同左 |
| ②必读规范 | brand-ci/DESIGN.md Mini Program 节 / brand-ci/system/mini-components.md / brand-ci/system/wot-ui-forms.md / wot-ui-theme.md | brand-ci/DESIGN.md Web 组件 guidance / brand-ci/system/kit.html / SPEC_DOC §6.4 |
| 实测断点 | 375/390 | 375 / 768 / 1440 三档 |

表中规范路径相对 `SPEC_ROOT`、`SPEC_DOC` 为管线规范文档路径——变量按目标仓库根推导（另有快照根 `SNAPSHOT_ROOT`），见 SKILL.md「路径变量」节。

每段固定五步：发起（requestId+childPid 监视器）→ 等待（禁紧凑轮询；pid 缺失/TIMEOUT 兜底 ≥60s 低频 get_run）→ 导出（OD→repo 快照 cmp）→ 实测（playwright 全链路）→ 提交（核对分支）。

## 设计系统 bootstrap（⓪）

项目无规范时：**先问客户**是否建立（推荐建立）→ 同意后执行插件内置 design-brief（`vendor/design-system/design-brief/`，OpenDesign 上游、Apache-2.0：8 维 brief → DESIGN.md 九节 + 预览页 → 客户确认）→ design-md 纪律落 `SPEC_ROOT/brand-ci/DESIGN.md`/tokens → 再走①②③。内置副本**不依赖 gstack、不依赖 OD MCP**。由外层 agent 执行（规范是 repo 侧真源）。②/③暴露的组件缺口按 design-md 纪律回写 DESIGN.md「待补」节。

## 前置依赖

- OpenDesign 桌面端 + `open-design` MCP（断开时 `/mcp` 重连）。MCP 状态**只看工具列表**：看不到 `mcp__open-design__*` 即视为未连接，勿用 `claude mcp list` 或读 `~/.claude.json` 探测（会逐个拉起全部已配置 server，常表现为卡死）
- 规范文件位于目标项目仓库，按目标仓库根推导：`designs/_system/`（SPEC_ROOT）+ `docs/open-design-spec.md`（SPEC_DOC）+ `designs/`（SNAPSHOT_ROOT）；推导路径不存在 → 按 SKILL.md「开工前决策」第 2 条一次问客户（A 用内置 design-brief 建 / B 给实际路径 / C 明确降级），不静默跳过

## 来源

从维运通司机端原型实战（登录/创建企业/工作台全流程）提炼，踩坑对策均来自真实失败记录。

官方插件参照快照随插件安装在 `vendor/open-design/`（锁定上游 commit，同步方式见该目录 UPSTREAM.md）。

设计系统工作流参照随插件安装在 `vendor/design-system/`（design-brief：OpenDesign Apache-2.0 锁定 f1a0b60；design-review：gstack 1.98.0.0 MIT；design-md 待拉取；OD 内置与 open-design 仓库的 design-* 多为目录壳、不 vendored）。
