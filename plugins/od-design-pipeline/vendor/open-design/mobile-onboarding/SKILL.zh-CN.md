# Mobile Onboarding 技能（中文伴读翻译）

> **文件性质**：本文是 `SKILL.md`（OpenDesign 上游，锁定 commit 0701042）的中文翻译，**仅供人阅读，非执行件**；上游同步时需对照新版重新核对。
> 一句话：在一个 HTML 页面上并排画三个手机框，呈现多屏移动端引导流——启动页、价值主张页、登录页。管线中作为移动端引导流场景的备选技能（`example-mobile-onboarding`）。

---

# Mobile Onboarding 技能

在单个 HTML 页面上产出一个三屏移动端引导流。

## 工作流

1. 读 DESIGN.md。
2. 识别 App + 受众。
3. 布局：三个手机框并排。每部手机：
   - 状态栏（时间、电池、信号）。
   - Hero 插画或图标。
   - 标题 + 支撑段落。
   - 3 圆点分页指示。
   - 主 CTA（全宽胶囊按钮）。
   - 右上角"跳过"或替代操作。
4. 最后一部手机是登录 / 继续方式选择屏。
5. 有力的排印、柔和渐变、无障碍对比度。

## 输出契约

```
<artifact identifier="mobile-onboarding-name" type="text/html" title="Mobile Onboarding">
<!doctype html>...</artifact>
```
