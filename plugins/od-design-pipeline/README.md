# od-design-pipeline

OpenDesign 三段设计管线（移动端 / Web 双轨）。

## 管线

```
①线框（定结构与流程） → ②高保真（交互原型） → ③评审（分级报告） → 逐条修复复测
```

| | 移动端（小程序） | Web 端（后台/登录/落地页） |
|---|---|---|
| ①线框 | example-wireframe-mobile-flow | example-wireframe-greybox / annotated |
| ②高保真 | example-mobile-app | example-web-prototype（可选 taste 变体） |
| ③评审 | example-critique（通用） | 同左 |
| ②必读规范 | DESIGN.md Mini Program 节 / mini-components.md / wot-ui-forms.md / wot-ui-theme.md | brand-ci DESIGN.md Web 组件 guidance / kit.html / spec §6.4 |
| 实测断点 | 375/390 | 375 / 768 / 1440 三档 |

每段固定五步：发起（requestId+childPid 监视器）→ 等待（禁轮询）→ 导出（OD→repo 快照 cmp）→ 实测（playwright 全链路）→ 提交（核对分支）。

## 前置依赖

- OpenDesign 桌面端 + `open-design` MCP（断开时 `/mcp` 重连）
- 规范文件位于维运通仓库 `designs/_system/brand-ci/`（本插件在维运通项目内使用）

## 来源

从维运通司机端原型实战（登录/创建企业/工作台全流程）提炼，踩坑对策均来自真实失败记录。
