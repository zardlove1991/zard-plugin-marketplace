# Vendored: OpenDesign 官方插件（上游锁定快照）

来源：https://github.com/nexu-io/open-design
锁定上游 commit：0701042f3d2957fe485bb8508652e40ec6dae832
上游路径前缀：plugins/_official/examples/
本地位置：plugins/od-design-pipeline/vendor/open-design/（随插件安装；od-design-pipeline SKILL.md 按 skill 基目录 `../../vendor/` 解析）
同步日期：2026-11-17（2026-11-20 增补 web-prototype，同 SHA 0701042）

## 内容

| 目录 | 用途 | 管线段 |
|---|---|---|
| critique | 设计评审 | ③ |
| mobile-app | 移动端高保真原型 | ② |
| mobile-onboarding | 移动端 onboarding | ②（备用） |
| web-prototype | Web 高保真原型（seed 组合式，含 layouts/checklist） | ②（Web） |
| wireframe-annotated | 带标注线框 | ①（Web 备选） |
| wireframe-greybox | 灰盒线框 | ①（Web 首选） |
| wireframe-mobile-flow | 移动端流程线框 | ①（移动端） |
| wireframe-sketch | 手绘线框 | ①（备用） |

## 同步方式（一律用锁定 sha，禁用 main——用 main 会静默升级、破坏锁定）

```bash
SHA=0701042f3d2957fe485bb8508652e40ec6dae832
# 递归树定位
curl -sf "https://api.github.com/repos/nexu-io/open-design/git/trees/${SHA}?recursive=1"
# raw 下载（逐文件）
curl -sf "https://raw.githubusercontent.com/nexu-io/open-design/${SHA}/plugins/_official/examples/<插件>/<文件>"
```

升级上游：改 SHA → 重新拉取 → 与 od-design-pipeline prompt 兼容性核对 → 更新本文件的 sha 与同步日期。

## 本地伴读件（非上游内容）

各插件目录下的 `*.zh-CN.md`（2026-11-18 新建 9 份；2026-11-20 随 web-prototype 增 3 份，共 12 份）是同名英文文件的**中文伴读翻译，仅供人阅读，非执行件**——run agent 执行时读英文原版；layouts.zh-CN.md 的 HTML 代码块保留英文原样。上游同步时需对照新版重新核对翻译（翻译基线 = 上文锁定的 0701042）：

- `critique/SKILL.zh-CN.md`
- `mobile-app/SKILL.zh-CN.md`、`mobile-app/references/checklist.zh-CN.md`、`mobile-app/references/layouts.zh-CN.md`
- `mobile-onboarding/SKILL.zh-CN.md`
- `web-prototype/SKILL.zh-CN.md`、`web-prototype/references/checklist.zh-CN.md`、`web-prototype/references/layouts.zh-CN.md`
- `wireframe-annotated/SKILL.zh-CN.md`
- `wireframe-greybox/SKILL.zh-CN.md`
- `wireframe-mobile-flow/SKILL.zh-CN.md`
- `wireframe-sketch/SKILL.zh-CN.md`
