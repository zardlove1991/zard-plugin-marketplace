# 生产接入验收清单

> 本清单对应"生产接入"场景。每个特效上线前逐项过；任何一项没做，都必须在交付说明里标出来，不要写"已完成"。

## 1. 选型与预算

- [ ] 这个特效解决的是**表达/反馈**问题，不是纯炫技；有明确的使用场景。
- [ ] 同屏 GPU 重特效 ≤ 2 个（`GhostCursor`、`GlassSurface`、`PaperCrumple`、`ReflectiveCard`、`SpecularButton`、`liquid-glass-*` 都算重）。
- [ ] 移动端有降级方案（减参数、关粒子、换静态图或直接不渲染）。
- [ ] 首屏体积可控：`three` / WebGL 大组件不阻塞首屏，按需加载。
- [ ] 已确认上游组件的许可与署名要求（本库整理自 21st.dev，保留源码头部注释）。

## 2. 功能正确性

- [ ] Props 默认值与源码一致；受控/非受控两种用法都试过。
- [ ] 事件回调（`onHold` / `onAction` / `onCommit` / `onChange` / `onComplete`）在真实数据下触发正确。
- [ ] 键盘路径完整：Tab 可达、Enter/Space 触发、Esc 关闭、方向键切换。
- [ ] 触屏路径完整：单击、长按、拖动、纵向滚动不冲突。
- [ ] 边界：空列表、超长文案、单条数据、禁用态、快速连点。
- [ ] 与路由/弹窗/抽屉组合时，打开关闭状态同步、无重复实例。

## 3. 动效与可访问性

- [ ] `prefers-reduced-motion: reduce`：关闭自动播放、视差、旋转、漂浮；保留静态终态与功能。
- [ ] 动画不阻塞操作；加载态有明确反馈。
- [ ] 焦点样式可见（`:focus-visible`），不被玻璃/阴影吞掉。
- [ ] 颜色对比度：正文 ≥ 4.5:1，大字 ≥ 3:1；玻璃/半透明背景要实测。
- [ ] 图标按钮有 `aria-label`；纯装饰元素 `aria-hidden="true"`。
- [ ] 动态内容有 `aria-live` 或状态播报（如"已删除"）。
- [ ] 不依赖颜色单独传达状态。

## 4. 性能

- [ ] 动画只改 `transform` / `opacity`，不触发布局；逐帧状态不走响应式（见 vue-porting §4.1）。
- [ ] rAF 在页面隐藏、组件离屏、卸载时停止。
- [ ] `ResizeObserver` / `IntersectionObserver` / 全局监听在卸载时清理。
- [ ] WebGL：DPR 上限 ≤ 2（移动端 1–1.5）；program/buffer/texture 有删除；context 丢失有恢复或降级。
- [ ] three.js：几何/材质/纹理/renderer 全部 `dispose()`。
- [ ] 图片纹理同源或 CORS 正确；大图先压缩/按容器尺寸加载。
- [ ] 列表类组件（`AnimatedList` / `MagicBento`）数据量大时分页或虚拟化。
- [ ] Lighthouse / Performance 面板：无长任务堆积，动画期间帧率稳定（目标 60fps，移动端 ≥ 45fps）。

## 5. SSR / 水合（Nuxt）

- [ ] 模块顶层无 `window` / `document` / `navigator` / `WebGL2RenderingContext` 访问。
- [ ] WebGL/three/摄像头/陀螺仪只在 `onMounted` 或 `<ClientOnly>` 内执行。
- [ ] 首帧有静态占位，水合前后无布局跳动。
- [ ] 重组件用 `defineAsyncComponent` / 动态 `import()`，不进入首屏主包。
- [ ] 构建产物无 SSR 报错；`pnpm build` 与 `pnpm preview` 都过。

## 6. 降级与兼容

- [ ] WebGL2 不可用：有 CSS/SVG/静态图降级，不白屏。
- [ ] 无鼠标设备：hover 逻辑有替代操作，不出现"必须悬停才能用"。
- [ ] iOS Safari：`playsInline`、`muted`、`touch-action`、安全区、`-webkit-` 前缀已核对。
- [ ] Android Chrome：低端机实测，GPU 特效不崩。
- [ ] Firefox：`backdrop-filter` / SVG filter / WebGL2 路径实测。
- [ ] 旧版浏览器：明确最低支持版本；不支持时不报错、不阻塞主流程。
- [ ] 断点：375 / 768 / 1440 三档都看过。

## 7. 安全与隐私

- [ ] 摄像头（`ReflectiveCard.webcam`）默认关闭；开启前有明确用途说明；离开页面 `track.stop()`。
- [ ] 视频/图片/字体来源可信；不加载未知第三方脚本。
- [ ] `v-html` 只用于可信 SVG/内容；用户输入不进 `v-html`。
- [ ] 签名（`signature`）数据不默认上传；导出由业务方明确触发。
- [ ] 复制/下载类交互（`terminal-replay.copyable`、`signature.toDataURL`）有成功/失败反馈。
- [ ] 第三方资源（远程视频、CDN 图片）有 CORS 与可用性兜底。

## 8. 交付说明

交付时写清楚：

- 用了哪些特效、各自的来源文件与移植文件路径；
- 新增依赖及版本；
- 做了哪些降级（移动端/无 WebGL/reduced-motion）；
- 哪些验证**未执行**（例如"未在 Safari 实测"），不要含糊；
- 已知限制与后续建议。

## 9. 快速验收命令

```bash
# 类型与构建
pnpm typecheck
pnpm build

# 本地预览（Vue/Vite）
pnpm dev

# 或直接看特效演示
npx serve skills/motion-effects/assets
# 打开 /gallery.html
```

浏览器实测至少覆盖：Chrome（桌面 + 移动模拟）、Safari（iOS 真机或模拟）、Firefox（桌面）。没有条件实测的，明确标注"待人工实测"。