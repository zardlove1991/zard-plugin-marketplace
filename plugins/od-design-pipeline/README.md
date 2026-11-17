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

项目无规范时：design-consultation 出提案+预览 → 用户确认 → design-md 纪律落 DESIGN.md/tokens 到 SPEC_ROOT → 再走①②③。由外层 agent 执行（规范是 repo 侧真源），不依赖 OD MCP。本机有 gstack 优先调同名 skill，无则按 vendored 参照纪律执行（gstack 基建步跳过/映射）。②/③暴露的组件缺口按 design-md 纪律回写 DESIGN.md「待补」节。

## 前置依赖

- OpenDesign 桌面端 + `open-design` MCP（断开时 `/mcp` 重连）
- 规范文件位于目标项目仓库，按目标仓库根推导：`designs/_system/`（SPEC_ROOT）+ `docs/open-design-spec.md`（SPEC_DOC）+ `designs/`（SNAPSHOT_ROOT）；推导路径不存在则问用户要实际路径，无规范则显式降级通用规范（见 SKILL.md「路径变量」节）

## 来源

从维运通司机端原型实战（登录/创建企业/工作台全流程）提炼，踩坑对策均来自真实失败记录。

官方插件参照快照随插件安装在 `vendor/open-design/`（锁定上游 commit，同步方式见该目录 UPSTREAM.md）。

设计系统工作流参照随插件安装在 `vendor/design-system/`（gstack 1.98.0.0、MIT；design-md 待拉取；OD 内置 design-* 仅目录壳、不 vendored）。
