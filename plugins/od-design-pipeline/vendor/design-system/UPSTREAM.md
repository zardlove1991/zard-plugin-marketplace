# Vendored: 设计系统工作流（上游锁定快照）

## design-brief（OpenDesign）

来源：https://github.com/nexu-io/open-design
仓库路径：`skills/design-brief/SKILL.md`
锁定 commit：`f1a0b60c6cd1c9f5c735ae5645e47244b468e71c`（该文件最后修改，2026-08-18）
许可：Apache-2.0（全文见 `design-brief/LICENSE-Apache-2.0`）
sha256（SKILL.md）：`de27756b79d8f91349a6c0e9d7f8808993c2bcd7fa9c133c91dd18e0a04d6294`
拷贝日期：2026-11-17

**本地伴读件**：`design-brief/SKILL.zh-CN.md`（2026-11-18 新建）是 SKILL.md 的中文翻译，**仅供人阅读，非上游内容、非执行件**——管线执行仍以英文原版为准；上游 SKILL.md 同步更新时需对照新版重新核对翻译（翻译基线 = 上文锁定的 f1a0b60 版本）。

| 目录 | 用途 | 管线挂点 |
|---|---|---|
| design-brief | 自然语言/结构化 brief → 8 维 token 解析 → DESIGN.md（9 节）+ 预览页 | ⓪ bootstrap |

**说明**：open-design 仓库里的 `skills/design-consultation/`、`skills/design-md/`、`skills/design-review/`、`skills/platform-design/` 等均为 **1.2 KB 左右的目录条目（advertise 壳）**，正文只指向 gstack / google-labs-code 等上游，**不含工作流**，故不 vendored；其 `design-consultation` 指向的 gstack 原件曾随本插件拷贝，现因 ⓪ 改为自包含的 design-brief 而移除。

执行纪律：外层按 `design-brief/SKILL.md` Section 1–5 原样执行；仅按管线做路径映射（根 `DESIGN.md` → `SPEC_ROOT/brand-ci/DESIGN.md`，`brief-preview.html` → `SPEC_ROOT/brand-ci/design-preview.html`），并在 DESIGN.md 追加双轨所需的 Mini Program / Web 组件 guidance 与「待补」清单。若目标项目已有产品 token（variables.css / wot-ui-theme.md），**既有 token 为真源**，design-brief 默认值只补缺。

## design-review（gstack）

来源：https://github.com/garrytan/gstack（经本机安装 `~/.claude/skills/gstack/` 拷贝）
锁定版本：1.98.0.0（上游 VERSION 文件）
拷贝日期：2026-11-17
许可：MIT（全文见 `LICENSE-gstack`，拷贝时随附以满足署名要求）
sha256（SKILL.md）：`94aaf7e62f7925b158d928c0fc0589cda529eca28ecbeca5709f8d45d75492dc`

**本地伴读件**：`design-review/SKILL.zh-CN.md`（2026-11-18 新建）是 SKILL.md + sections/ 的**中文导读说明**（流程逐段讲解 + 10 类审计清单/AI slop 黑名单/设计硬规则完整中译 + gstack 基建到管线的映射表），非逐句翻译、非执行件——执行纪律以 od-design-pipeline SKILL.md「评审后」节为准；上游同步时需对照新版重新核对（说明基线 = gstack 1.98.0.0）。

| 目录 | 用途 | 管线挂点 |
|---|---|---|
| design-review | 视觉审计 → 修复 → atomic commit → before/after 截图 | 评审后修复 / 已有屏微调 |

**耦合声明**：gstack skill 深度依赖其基建（`bin/` 脚本、shared preamble、question-registry、ETHOS.md、analytics state root）。vendored 副本是**纪律参照，非独立可执行 skill**：外层执行时基建步跳过或映射为管线等价物（playwright / git / AskUserQuestion）——**勿执行 `~/.claude/skills/gstack/bin/*` 命令**。其 DESIGN.md 导出步引用 `/design-consultation` 模板，本插件改以 design-brief 的九节模板为准。

## design-md（google-labs-code/skills，Stitch 系）——待拉取

状态：**pending**（2026-11-17 网络不可达，GitHub API HTTP 000，真身与许可均未核）
上游：https://github.com/google-labs-code/skills（仓库内路径待网络恢复后以 trees API 定位）
临时纪律：见 od-design-pipeline SKILL.md ⓪ 段（DESIGN.md 单一真源 / tokens 与既有 variables.css 同步 / 缺口只增列）；**真身到位后以其为准并删除临时纪律**。
拉取后：锁 commit sha + 许可核对 + 随附许可全文 + 更新本文件。

## 未 vendored：目录条目壳

OD 应用包 `Resources/open-design/skills/design-{consultation,md,review}/SKILL.md` 各约 42 行，正文自述仅为 catalogue advertise（发现/planning 用），真工作流在上游；open-design 仓库 `skills/` 下的同名条目同理（约 1.2 KB 的 stub）。`start_run(skill="design-*")` 注入的也是壳，**勿当工作流用**。
