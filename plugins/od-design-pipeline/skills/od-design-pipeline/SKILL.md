---
name: od-design-pipeline
description: Use when 用户要求用 OpenDesign 设计或重设计移动端页面/小程序原型/流程，或 Web 端页面（管理后台/登录页/官网落地页，说"画原型""设计页面""线框流程""高保真原型""原型评审"、新增业务屏或整体改版），且 OD MCP 可用或可重连时
---

# OD 设计管线（线框 → 高保真 → 评审，移动端/Web 双轨）

## 概述

新屏/改版设计走三段 start_run 管线：线框（定结构与流程）→ 高保真（交互原型）→ 评审（报告）。**先按目标定轨（下表），每段固定五步：发起 → 等待 → 导出 → 实测 → 提交**。OD 文件为真源，repo `designs/` 为快照（OD→repo 单向）。

## 双轨选择（发起前先定轨）

| | 移动端（小程序） | Web 端（后台/登录/落地页） |
|---|---|---|
| ①线框 | `example-wireframe-mobile-flow` | `example-wireframe-greybox` 或 `example-wireframe-annotated` |
| ②高保真 | `example-mobile-app` | `example-web-prototype`（可选 taste-editorial/soft/brutalist 风格变体；按 spec §2.4 可另传 skill=frontend-design / design-taste-frontend） |
| ③评审 | `example-critique`（通用） | 同左 |
| ②必读规范 | DESIGN.md「Mini Program」节 / `system/mini-components.md` / **`system/wot-ui-forms.md`** / `wot-ui-theme.md`（90 变量映射） | brand-ci DESIGN.md 的 Web 组件 guidance（Buttons/Inputs/Alerts/Tags/Cards/Tables/Navigation）+ `system/kit.html` 组件套件 + spec §6.4 目标子项目代码约束 |
| 组件形态 | wot-ui（`wd-*`） | Element UI/Plus 形态（`el-*` 命名参照 kit.html） |
| token 口径 | 产品 token（7/10/14、Noto Sans SC、主色 #2563EB） | 后台/登录属产品 UI → 同产品 token；仅对外营销/CI 物料用企业口径（8/12、Space Grotesk，spec §3.1） |
| 实测断点 | 375/390 手机壳单点 | **375 / 768 / 1440 三档**（spec §5），表格区拉伸、整页不固定宽高 |

## 不走本管线的场景

- 已有屏微调 → 直接编辑 OD 真源文件（write_file 或文件系统）
- 只要结构讨论 → 只走第①段
- 写代码/落地实现 → 不是本技能

## 每段固定循环

1. **预检**：`ToolSearch select:mcp__open-design__start_run` 确认 MCP 可用；断开则请用户 `/mcp` 重连（勿干等）。提交前必须 `git branch --show-current` 核对分支。
2. **发起**：`uuidgen` 生成 requestId（重试复用同值）→ `start_run(project, plugin, requestId, prompt, agent="claude")` → `get_run` 一次取 `childPid` → 挂后台监视器：
   ```bash
   for i in $(seq 1 80); do kill -0 <pid> 2>/dev/null || { echo EXITED; exit 0; }; sleep 30; done
   ```
   **禁止循环轮询 get_run**，等监视器通知。
3. **终态**：`get_run` 看 `status=="succeeded"` 与 `artifactPaths`。注意 `deliverableValid:false / "entry_not_touched"` **不是失败**（只是入口 index.html 未改），以 artifactPaths 为准。
4. **导出**：单文件 `cp` OD→repo 后 `cmp` 核对；多文件 `get_artifact include=all` 解析落盘、逐文件核字节数。
5. **实测**：`python3 -m http.server 8199 --directory designs/_system` → playwright navigate/screenshot/evaluate 走全链路交互。断言用**多选择器/宽松匹配**防假阴性（误报先查测试脚本再怀疑设计）。通过后 `git commit -m "design: ..."`（分支核对！）。

## 三段 prompt 要点（插件按双轨表选）

| 段 | prompt 必含 |
|---|---|
| ①线框流程 | 先读现有屏逐字对齐文案；灰阶+品牌蓝仅主操作/选中；琥珀交互标注；屏间箭头带触发条件芯片；底部状态覆盖条；全中文无英文装饰 |
| ②高保真 | **必读本轨全部规范文件（双轨表②行，一个不漏——漏形态参照组件就难看）**；token 无板外硬编码；五态齐全；移动端加胶囊避让+safe-area+hash 路由单文件；Web 加布局语义（flex/grid、表格拉伸）；文案逐字照①与现有屏 |
| ③评审 | 只评不改文件；维度：对比度/token 纪律/spacing 网格/五态/表单校验/无障碍/文案/与参考一致性（移动端加胶囊与安全区）；按阻塞/建议/可选分级+屏/元素定位+整体评分 |

## 评审后

按报告逐条修 OD 真源（目标 Edit，**不重跑整段**）→ playwright 复测每个修复点 → `fix(design): 按 critique 修复...` 提交。改动大可再跑③复核。

## 常见错误（真实踩坑）

| 坑 | 对策 |
|---|---|
| 跳过①手写高保真（用户质问"为啥不用 wireframe 技能"） | 新屏一律三段走；仅微调可直接编辑 |
| ②忘引 wot-ui-forms → 组件难看 | prompt 写死四规范文件 |
| 忘导出 → OD 私有目录丢数据 | 每段结束立即导出+cmp |
| 断言苛刻 → 假阴性（如新租户入列查不到） | 多选择器断言，先自查脚本 |
| 提交错到 master | 提交前 `git branch --show-current` |
| MCP 断开干等 | 请用户 `/mcp`；重连失败可直改 OD 真源文件兜底 |
| Web 用 mobile-flow 画线框（手机壳不适配 Web 布局） | Web 轨①用 greybox/annotated |
| Web 只按桌面宽实测 | 必测 375/768/1440 三档 |

## 参考

`docs/open-design-spec.md` §2.4（插件组合）、§2.3（真源/快照约定）；memory `od-source-of-truth`。
