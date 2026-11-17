# Vendored: OpenDesign 官方插件（上游锁定快照）

来源：https://github.com/nexu-io/open-design
锁定上游 commit：0701042f3d2957fe485bb8508652e40ec6dae832
路径前缀：plugins/_official/examples/
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

## 同步方式

```bash
# 递归树定位（替换上游 commit 后重跑下载脚本）
curl -sf "https://api.github.com/repos/nexu-io/open-design/git/trees/main?recursive=1"
# raw 下载：https://raw.githubusercontent.com/nexu-io/open-design/main/<path>
```

升级上游：改 commit sha → 重新拉取 → 与 od-design-pipeline prompt 兼容性核对。
