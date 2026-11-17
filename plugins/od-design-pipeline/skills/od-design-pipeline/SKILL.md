---
name: od-design-pipeline
description: Use when 用户要求用 OpenDesign 设计或重设计移动端页面/小程序原型/流程，或 Web 端页面（管理后台/登录页/官网落地页，说"画原型""设计页面""线框流程""高保真原型""原型评审"、新增业务屏或整体改版），且 OD MCP 可用或可重连时；或项目无设计规范需从零搭建设计系统/建立 DESIGN.md 时（⓪ bootstrap 不依赖 OD MCP）
---

# OD 设计管线（线框 → 高保真 → 评审，移动端/Web 双轨）

## 概述

新屏/改版设计走⓪规范 bootstrap（可选，项目无规范时，外层执行）+ 三段 start_run 管线：线框（定结构与流程）→ 高保真（交互原型）→ 评审（报告）。**先按目标定轨（下表），每段固定五步：发起 → 等待 → 导出 → 实测 → 提交**。OD 文件为真源，repo `SNAPSHOT_ROOT` 为快照（OD→repo 单向）。

## 路径变量（发起前先解析）

规范与快照都在**目标项目仓库**，不在本插件内。三个变量按目标仓库根推导（在目标仓库执行 `git rev-parse --show-toplevel` 取根；勿用本插件仓库根，**勿写死任何人的本机绝对路径当默认值**）：

| 变量 | 推导 | 内容 |
|---|---|---|
| `SPEC_ROOT` | `<目标仓库根>/designs/_system/` | brand-ci 设计规范（DESIGN.md / system/mini-components.md / system/wot-ui-forms.md / system/kit.html）+ wot-ui-theme.md 主题映射 |
| `SPEC_DOC` | `<目标仓库根>/docs/open-design-spec.md` | 管线规范（插件组合/真源快照/token 口径/断点/代码约束） |
| `SNAPSHOT_ROOT` | `<目标仓库根>/designs/` | OD→repo 快照根；导出落盘与实测服务目录按目标项目惯例（维运通：`designs/_system`，见 SPEC_DOC §2.3） |

- 示例：维运通仓库 checkout 在 `~/weiyuntong` → `SPEC_ROOT=~/weiyuntong/designs/_system/`。
- 推导路径不存在 → 问用户要实际路径（项目布局可能不同，勿因项目名相似而套用他人路径）；确认项目尚无规范 → 走⓪ bootstrap；用户明确拒绝 bootstrap → prompt 显式声明"无品牌规范，按通用规范执行（五态/token 纪律/spacing 网格仍适用）"，**不得静默跳过**。
- 下表规范路径均相对 `SPEC_ROOT`；**写 prompt 时一律展开为绝对路径**（run agent 解析不了变量与相对路径）。

## ⓪ 规范 bootstrap（项目无规范时；外层执行，不走 start_run）

触发：SPEC_ROOT 缺失/空且用户未拒绝 bootstrap。规范是 repo 侧真源（非 OD artifact），产物直接落 SPEC_ROOT，无导出步；OD MCP 断开也不影响本段。

1. **提案**：按 vendored `vendor/design-system/design-consultation/SKILL.md` 纪律执行（研究产品与同类 landscape → 美学/字体/色板/布局/spacing/motion 提案 + 字体色板预览页）。本机装有 gstack（`~/.claude/skills/gstack/VERSION` 存在）→ 直接调同名 skill；否则按 vendored 参照执行。**gstack 基建步（bin/ 脚本、question registry、analytics、ETHOS 引用）跳过或映射为本管线等价物（AskUserQuestion/playwright/git），勿照抄 bin 命令**（vendored 是纪律参照，非独立可执行 skill）。
2. **确认**：提案+预览页交用户确认；未确认不落规范。
3. **落规范**：按 design-md 纪律写 `SPEC_ROOT/brand-ci/DESIGN.md`（设计方向/tokens 表/视觉规则/组件缺口「待补」清单）。design-md 真身未 vendored 期间用临时纪律：DESIGN.md 为规范单一真源；tokens 表与既有 variables.css 同步（如有）；缺口只增列、不擅改已定项。真身到位后以其为准。
4. 完成后走①；此后②/③按双轨表引规范。

## 双轨选择（发起前先定轨）

| | 移动端（小程序） | Web 端（后台/登录/落地页） |
|---|---|---|
| ①线框 | `example-wireframe-mobile-flow` | `example-wireframe-greybox` 或 `example-wireframe-annotated` |
| ②高保真 | `example-mobile-app` | `example-web-prototype`（可选 taste-editorial/soft/brutalist 风格变体；按 SPEC_DOC §2.4 可另传 skill=frontend-design / design-taste-frontend） |
| ③评审 | `example-critique`（通用） | 同左 |
| ②必读规范 | `brand-ci/DESIGN.md`「Mini Program」节 / `brand-ci/system/mini-components.md` / **`brand-ci/system/wot-ui-forms.md`** / `wot-ui-theme.md`（90 变量映射）（均相对 SPEC_ROOT，prompt 展开绝对路径）/ **vendored 插件源**：本插件 `vendor/open-design/<插件>/SKILL.md`（mobile-app 另含 `references/` 与 `assets/`；锁定上游 0701042，随插件安装；按 skill 基目录 `../../vendor/` 解析，prompt 写绝对路径） | `brand-ci/DESIGN.md` 的 Web 组件 guidance（Buttons/Inputs/Alerts/Tags/Cards/Tables/Navigation）+ `brand-ci/system/kit.html` 组件套件 + SPEC_DOC §6.4 目标子项目代码约束 + vendored `wireframe-*` 同源参照（通用纪律同 wot-ui-forms，组件形态以 kit.html 为准） |
| 组件形态 | wot-ui（`wd-*`） | Element UI/Plus 形态（`el-*` 命名参照 kit.html） |
| token 口径 | 产品 token（7/10/14、Noto Sans SC、主色 #2563EB） | 后台/登录属产品 UI → 同产品 token；仅对外营销/CI 物料用企业口径（8/12、Space Grotesk，SPEC_DOC §3.1） |
| 实测断点 | 375/390 手机壳单点 | **375 / 768 / 1440 三档**（SPEC_DOC §5），表格区拉伸、整页不固定宽高 |

## 不走本管线的场景

- 已有屏微调 → 直接编辑 OD 真源文件（write_file 或文件系统），按 design-review 纪律（见「评审后」）
- 只要结构讨论 → 只走第①段
- 写代码/落地实现 → 不是本技能
- OD MCP 不可用 → 暂缓发起（对策见常见错误表），不手绘替代

## 每段固定循环

1. **预检**：直接调用任一 OD 工具确认可用（重连后系统自动宣告）；断开则请用户 `/mcp` 重连（勿干等）。`list_agents` 确认可用 runtime（勿猜 agent id，只有列表返回的才会被真正拉起）。提交前必须 `git branch --show-current` 核对分支。
2. **发起**：`uuidgen` 生成 requestId（重试复用同值）→ `start_run(project, plugin, requestId, prompt, agent=<list_agents 可用 id>)` → `get_run` 一次取 `childPid`（run 尚在 queued、pid 未生成时每 5s 重试，至多 3 次）→ 挂后台监视器：
   ```bash
   for i in $(seq 1 80); do kill -0 <pid> 2>/dev/null || { echo EXITED; exit 0; }; sleep 30; done; echo TIMEOUT
   ```
   **禁止紧凑循环轮询 get_run**，等监视器通知。取不到 pid（重试耗尽）或监视器报 TIMEOUT → 降级低频 `get_run`（间隔 ≥60s）直至终态。注意：`childPid`/`artifactPaths`/`deliverableValid` 为实测观察字段、非公开契约，OD 升级后字段缺失时以 `status`/`agentMessage`/`previewUrl` 兜底。
3. **终态**：`get_run` 看 `status=="succeeded"` 与 `artifactPaths`。注意 `deliverableValid:false / "entry_not_touched"` **不是失败**（只是入口 index.html 未改），以 artifactPaths 为准。
4. **导出**：单文件 `cp` OD→repo（落盘 `SNAPSHOT_ROOT` 下，子路径按目标项目惯例）后 `cmp` 核对；多文件 `get_artifact include=all` 解析落盘、逐文件核字节数。
5. **实测**：`python3 -m http.server 8199 --directory <服务目录>`（服务目录=含导出产物及其引用资产的快照目录，维运通为 `designs/_system`；不存在则先按目标项目惯例解析。端口被占：同服务目录则复用现有服务，否则先 kill 旧服务再启，防测到旧快照）→ playwright navigate/screenshot/evaluate 走全链路交互。断言用**多选择器/宽松匹配**防假阴性（误报先查测试脚本再怀疑设计）。通过后 `git commit -m "design: ..."`（分支核对！）。

## 三段 prompt 要点（插件按双轨表选）

| 段 | prompt 必含 |
|---|---|
| ①线框流程 | 先读现有屏逐字对齐文案；灰阶+品牌蓝仅主操作/选中；琥珀交互标注；屏间箭头带触发条件芯片；底部状态覆盖条；全中文无英文装饰 |
| ②高保真 | **必读本轨全部规范文件（双轨表②行，一个不漏——漏形态参照组件就难看）**；token 无板外硬编码；五态齐全；移动端加胶囊避让+safe-area+hash 路由单文件；Web 加布局语义（flex/grid、表格拉伸）；文案逐字照①与现有屏 |
| ③评审 | 只评不改文件；维度：对比度/token 纪律/spacing 网格/五态/表单校验/无障碍/文案/与参考一致性（移动端加胶囊与安全区）；按阻塞/建议/可选分级+屏/元素定位+整体评分 |

## 评审后

按报告逐条修 OD 真源（目标 Edit，**不重跑整段**），执行 design-review 纪律（vendored `vendor/design-system/design-review/SKILL.md` 参照；gstack 基建步同⓪跳过/映射）：每个修复点 before/after 截图（playwright）→ 复测 → **atomic commit（一修复点一提交）** `fix(design): 按 critique 修复...`。改动大可再跑③复核。

**规范维护钩子**：②/③暴露的组件/形态缺口（如表单控件待补清单）按 design-md 纪律回写 DESIGN.md「待补」节，不散落在对话里；改已定项须用户确认。

## 常见错误（真实踩坑）

| 坑 | 对策 |
|---|---|
| 跳过①手写高保真（用户质问"为啥不用 wireframe 技能"） | 新屏一律三段走；仅微调可直接编辑 |
| ②忘引 wot-ui-forms → 组件难看 | prompt 写死四规范文件 |
| 忘导出 → OD 私有目录丢数据 | 每段结束立即导出+cmp |
| 断言苛刻 → 假阴性（如新租户入列查不到） | 多选择器断言，先自查脚本 |
| 提交错到 master | 提交前 `git branch --show-current` |
| MCP 断开干等 | 请用户 `/mcp` 重连；重连失败可先直改 OD 真源文件推进，恢复后走管线核对（不手绘替代） |
| Web 用 mobile-flow 画线框（手机壳不适配 Web 布局） | Web 轨①用 greybox/annotated |
| Web 只按桌面宽实测 | 必测 375/768/1440 三档 |
| prompt 相对路径 → run agent 找不到规范文件 | 规范在目标项目仓库（见「路径变量」节）；prompt 写绝对路径或注明位置（实测 agent 可自行探索，勿依赖） |
| 无规范直接降级通用 → ②组件形态无参照 | 先走⓪ bootstrap；用户明确拒绝才降级 |
| 把 OD 内置 design-* 当工作流传 skill= | 内置仅 42 行目录壳（自述 advertise）；⓪/修复段由外层按 vendored 真身纪律执行 |

## 参考

- SPEC_DOC（路径见「路径变量」节）：§2.4（插件组合）、§2.3（真源/快照约定）、§3.1（企业 token 口径）、§5（断点）、§6.4（子项目代码约束）。
- vendored 上游插件源：本插件 `vendor/open-design/`（锁定上游 commit 0701042；内容与同步方式见 `vendor/open-design/UPSTREAM.md`）。
- vendored 设计系统工作流：本插件 `vendor/design-system/`（gstack 1.98.0.0 锁定、MIT；design-md 待拉取；耦合声明与同步见该目录 UPSTREAM.md）。
