# Vendored: OpenDesign 官方插件（上游锁定快照）

来源：https://github.com/nexu-io/open-design
锁定上游 commit：0701042f3d2957fe485bb8508652e40ec6dae832
上游路径前缀：plugins/_official/examples/
本地位置：plugins/od-design-pipeline/vendor/open-design/（随插件安装；od-design-pipeline SKILL.md 按 skill 基目录 `../../vendor/` 解析）
同步日期：2026-11-17

## 内容

| 目录 | 用途 | 管线段 |
|---|---|---|
| critique | 设计评审 | ③ |
| mobile-app | 移动端高保真原型 | ② |
| mobile-onboarding | 移动端 onboarding | ②（备用） |
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
