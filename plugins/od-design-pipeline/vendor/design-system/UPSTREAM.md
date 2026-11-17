# Vendored: 设计系统工作流（上游锁定快照）

## design-consultation / design-review（gstack）

来源：https://github.com/garrytan/gstack（经本机安装 `~/.claude/skills/gstack/` 拷贝）
锁定版本：1.98.0.0（上游 VERSION 文件）
拷贝日期：2026-11-17
许可：MIT（全文见 `LICENSE-gstack`，拷贝时随附以满足署名要求）
sha256（SKILL.md）：
- design-consultation：095eaba207a3666515ee874955676de132cd34cc0d299cf84c1fd53a8c859cbc
- design-review：94aaf7e62f7925b158d928c0fc0589cda529eca28ecbeca5709f8d45d75492dc

| 目录 | 用途 | 管线挂点 |
|---|---|---|
| design-consultation | 从零设计系统提案 + 字体色板预览 | ⓪ bootstrap |
| design-review | 视觉审计 → 修复 → atomic commit → before/after 截图 | 评审后修复 / 已有屏微调 |

**耦合声明（重要）**：gstack skill 深度依赖其基建（`bin/` 脚本、shared preamble、question-registry、ETHOS.md、analytics state root）。vendored 副本是**纪律参照，非独立可执行 skill**：外层执行时 gstack 基建步跳过或映射为管线等价物（AskUserQuestion / playwright / git）；本机装有 gstack 时优先直接调同名 skill。sections/ 与 templates/ 随附供参照阅读。
排除文件：`*.tmpl`（上游构建模板，非运行时内容）。

同步方式：gstack 升级后对照 VERSION 重拷两目录 → 删 `*.tmpl` → 核对纪律差异（尤其基建依赖变化）→ 更新本文件版本、日期与 sha256。

## design-md（google-labs-code/skills，Stitch 系）——待拉取

状态：**pending**（2026-11-17 网络不可达，GitHub API HTTP 000，真身与许可均未核）
上游：https://github.com/google-labs-code/skills（仓库内路径待网络恢复后以 trees API 定位）
临时纪律：见 od-design-pipeline SKILL.md ⓪ 段第 3 步（DESIGN.md 单一真源 / tokens 同步 / 缺口只增列）；**真身到位后以其为准并删除临时纪律**。
拉取后：锁 commit sha + 许可核对 + 随附许可全文 + 更新本文件。

## 不 vendored：OD 内置 design-* 目录壳

OD 应用包 `Resources/open-design/skills/design-{consultation,md,review}/SKILL.md` 各 42 行，正文自述仅为 catalogue advertise（发现/planning 用），真工作流在上游 bundle。无 vendoring 价值；`start_run(skill="design-*")` 注入的也是壳，勿当工作流用。
