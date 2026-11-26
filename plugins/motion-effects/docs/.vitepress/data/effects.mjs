/**
 * 23 个特效的站点数据。
 * 与 references/catalog.md 保持一致；新增/修改特效时同时更新这里。
 * 也供 scripts/sync-assets.mjs 做构建期文件校验。
 */

export const CATEGORIES = [
  '全部',
  '导航与页面',
  '卡片与容器',
  '操作与反馈',
  '列表与内容',
  '氛围与装饰'
]

export const LEVEL_TEXT = { easy: '易', mid: '中', hard: '难' }

export const EFFECTS = [
  {
    id: 'animated-list', name: 'AnimatedList', zh: '动态列表', cat: '列表与内容', vue: 'mid', vueReady: true, height: 620,
    desc: '带逐项入场、悬停高亮与键盘导航的文件 / 通知列表；支持 pop / slide / fade 三种入场。',
    deps: ['Hugeicons'], demo: 'animated-list.html', source: 'react/components/ui/AnimatedList.jsx',
    props: ['items', 'animation', 'theme', 'width / maxHeight', 'selectOnHover', 'enableArrowNavigation', 'initialSelectedIndex'],
    note: '不是虚拟列表；数据量大时外层分页或虚拟滚动。默认图标可直接换项目图标。Vue 实装的 renderItem 换成 #item 作用域插槽，onItemSelect 换成 select 事件；选中条用弹簧逼近，逐帧状态不进响应式。'
  },
  {
    id: 'flip-card', name: 'FlipCard', zh: '3D 翻面卡片', cat: '卡片与容器', vue: 'mid', vueReady: true, height: 660,
    desc: '3D 翻面卡片，可拖拽翻转、悬停倾斜、叠加眩光；支持前后两面与受控翻转。',
    deps: ['motion-v'], demo: 'flip-card.html', source: 'react/components/ui/FlipCard.jsx',
    props: ['front / back', 'flipped', 'axis', 'draggable', 'tilt', 'glare'],
    note: 'reduced-motion 下应直接切面，不做旋转；Safari 需保留 backface-visibility 与 translateZ。Vue 实装的 front / back 换成具名插槽，flipped 走 v-model:flipped，并保留 flip-change 事件。'
  },
  {
    id: 'ghost-cursor', name: 'GhostCursor', zh: '流体光标', cat: '氛围与装饰', vue: 'mid', vueReady: true, height: 560,
    desc: 'WebGL2 流体光标拖尾：跟手、涡流、点击爆散，整屏氛围层。',
    deps: [], demo: 'ghost-cursor.html', source: 'react/components/ui/GhostCursor.jsx',
    props: ['color', 'size', 'trailLength', 'turbulence', 'clickPuff', 'maxDevicePixelRatio'],
    note: '全局 fixed + pointer-events:none；移动端建议不渲染；弱机把 DPR 降到 1–1.5。headless 无 GPU 环境可能不显示光标。Vue 实装零依赖，WebGL2 不可用时静默降级；上下文恢复会重放整个引擎。'
  },
  {
    id: 'glass-surface', name: 'GlassSurface', zh: '折射玻璃面板', cat: '卡片与容器', vue: 'mid', vueReady: true, height: 620,
    desc: '真实折射玻璃面板，SVG filter 与 WebGL 双路径；支持色散、模糊、边框与背景图。',
    deps: [], demo: 'glass-surface.html', source: 'react/components/ui/GlassSurface.jsx',
    props: ['width / height', 'borderRadius / borderWidth', 'blur / displace', 'distortionScale', 'refraction / renderer', 'backdrop / shape'],
    note: '背后要有内容才看得出折射；背景图必须同源或 CORS 允许，否则纹理被污染。Vue 实装的默认插槽放内容，Chromium 走 SVG 色散折射、其它浏览器给 backdrop 才走 WebGL2，两者都不可用退回雾面；backdrop 接受 DOM 或模板 ref。'
  },
  {
    id: 'grid-motion', name: 'GridMotion', zh: '动感网格墙', cat: '氛围与装饰', vue: 'mid', vueReady: true, height: 600,
    desc: '倾斜的自动滚动网格墙，支持图片 / 文字 / 自定义节点、聚光、视差与边缘渐隐。',
    deps: ['Tailwind'], demo: 'grid-motion.html', source: 'react/components/ui/GridMotion.jsx',
    props: ['items', 'rows', 'angle', 'speed', 'direction', 'spotlight', 'fade'],
    note: 'Tailwind 是硬依赖；不用 Tailwind 时复用 demo 的 .gm-* CSS。items 可为图片、文字或节点；移动端降低 rows 与 speed。Vue 实装已自带抽出的 .gm-* CSS，不依赖 Tailwind；节点项换成 #tile 插槽。'
  },
  {
    id: 'hold-button', name: 'HoldButton', zh: '长按确认', cat: '操作与反馈', vue: 'easy', vueReady: true, height: 420,
    desc: '长按确认按钮：进度填充、波浪、发光与完成态；支持鼠标、触屏与键盘长按。',
    deps: [], demo: 'hold-button.html', source: 'react/components/ui/HoldButton.jsx',
    props: ['holdTime', 'fillColor', 'wave', 'glow', 'onHold / onTap'],
    note: '必须阻止右键菜单与文本选择；按住移出要取消；建议 holdTime 1.2–2.5s。'
  },
  {
    id: 'magic-bento', name: 'MagicBento', zh: '功能磁贴', cat: '卡片与容器', vue: 'hard', height: 720,
    desc: '功能磁贴 Bento：聚光、边框光、粒子、倾斜与点击反馈，内置多种数据可视化预设。',
    deps: ['Hugeicons'], demo: 'magic-bento.html', source: 'react/components/ui/MagicBento.jsx',
    props: ['items', 'columns', 'enableSpotlight', 'enableStars', 'enableTilt'],
    note: '库内最大组件（1100+ 行 JS/JSX + 1100+ 行 CSS）；移动端建议关粒子与倾斜。'
  },
  {
    id: 'paper-crumple', name: 'PaperCrumple', zh: '纸张揉皱', cat: '氛围与装饰', vue: 'hard', vueReady: true, height: 720,
    desc: 'three.js 纸张揉皱 / 展开：图片被揉成纸团再展开，带折痕、光照与拖拽旋转。',
    deps: ['three'], demo: 'paper-crumple.html', source: 'react/components/ui/PaperCrumple.jsx',
    props: ['src', 'crumpleAmount', 'foldCount', 'seed', 'releaseBehavior'],
    note: 'three 体积大，动态 import；纹理需 CORS；移动端降低 detail；卸载必须 dispose。演示依赖真实 GPU，无硬件加速的 headless 环境可能白屏。'
  },
  {
    id: 'pill-nav', name: 'PillNav', zh: '胶囊导航', cat: '导航与页面', vue: 'mid', height: 420,
    desc: '胶囊导航：桌面滑动高亮胶囊、移动端折叠菜单，支持玻璃 / 实心表面与指示点。',
    deps: [], demo: 'pill-nav.html', source: 'react/components/ui/PillNav.jsx',
    props: ['items', 'activeHref', 'layout', 'surface', 'collapse', 'indicator'],
    note: 'CSS 必须全局引入：组件内部有测量克隆节点，scoped 样式加不上去。'
  },
  {
    id: 'reflective-card', name: 'ReflectiveCard', zh: '金属反射卡', cat: '卡片与容器', vue: 'hard', height: 680,
    desc: '金属反射证件卡：倾斜、眩光、反射扭曲，可选摄像头或视频作为反射源。',
    deps: ['Hugeicons'], demo: 'reflective-card.html', source: 'react/components/ui/ReflectiveCard.jsx',
    props: ['name / role', 'videoSrc', 'webcam', 'metalness', 'enableTilt'],
    note: '摄像头默认关闭，必须用户手势触发并在卸载时 stop tracks；无 WebGL2 要静态降级。'
  },
  {
    id: 'rubber-segment', name: 'RubberSegment', zh: '橡皮筋分段', cat: '操作与反馈', vue: 'mid', vueReady: true, height: 360,
    desc: '可拖拽的分段控件，切换时滑块拉伸、挤压、回弹，带橡皮筋边界手感。',
    deps: ['motion-v'], demo: 'rubber-segment.html', source: 'react/components/ui/RubberSegment.jsx',
    props: ['items', 'v-model', 'draggable', 'stretch', 'squash', 'glide'],
    note: '保留 radiogroup 语义与键盘左右切换；touch-action:none 只加在轨道上。'
  },
  {
    id: 'specular-button', name: 'SpecularButton', zh: '高光按钮', cat: '操作与反馈', vue: 'mid', vueReady: true, height: 360,
    desc: 'WebGL 高光描边按钮：跟随鼠标的高光带、边缘泛光，也可自动扫光。',
    deps: [], demo: 'specular-button.html', source: 'react/components/ui/SpecularButton.jsx',
    props: ['children', 'intensity', 'lineColor', 'followMouse', 'autoAnimate', 'glow'],
    note: '语义与点击区域留在真实 <button>；WebGL 失败要有 CSS 边框 / 渐变兜底。'
  },
  {
    id: 'swipe-row', name: 'SwipeRow', zh: '滑动操作行', cat: '操作与反馈', vue: 'mid', vueReady: true, height: 620,
    desc: '移动端滑动操作行：左滑删除 / 归档，整行滑到底可提交，带阻力与回弹。',
    deps: ['motion-v', '@vueuse/core', 'Hugeicons', 'Tailwind / demo CSS'], demo: 'swipe-row.html', source: 'react/components/ui/SwipeRow.jsx',
    props: ['actions', 'direction', 'commitAt', 'fullSwipe', 'onCommit', 'haptic'],
    note: 'React 源码无独立 CSS，样式在 JSX 的 Tailwind 任意值类里；不用 Tailwind 时复用 demo 的 .sr-* CSS（Vue 实装自带 CSS，不需要 Tailwind）。桌面端要有可见操作入口；touch-action: pan-y 保垂直滚动。'
  },
  {
    id: 'tilted-card', name: 'TiltedCard', zh: '3D 倾斜卡片', cat: '卡片与容器', vue: 'mid', vueReady: true, height: 620,
    desc: '3D 倾斜卡片：鼠标 / 陀螺仪跟随、眩光、视差与可选翻面，适合图片与作品封面。',
    deps: [], demo: 'tilted-card.html', source: 'react/components/ui/TiltedCard.jsx',
    props: ['imageSrc', 'rotateAmplitude', 'glare', 'gyroscope', 'backContent'],
    note: 'iOS 陀螺仪需用户手势授权；reduced-motion 下关倾斜；触屏用滚动位置而不是鼠标。'
  },
  {
    id: 'glass-folder-cards', name: 'GlassFolder', zh: '玻璃文件夹', cat: '卡片与容器', vue: 'hard', height: 620,
    desc: '玻璃文件夹卡片：打开后文件扇形展开，可添加 / 选择文件；封底画由 canvas 程序化生成。',
    deps: [], demo: 'folders.html', source: 'react/components/ui/glass-folder-cards.tsx',
    props: ['label', 'art', 'files', 'action', 'open', 'width'],
    note: '封底画按 recipe 缓存，别每帧重画；文件是真实可聚焦按钮，不要用装饰替代。'
  },
  {
    id: 'glass-logo-reveal', name: 'GlassLogoReveal', zh: '液态玻璃 Logo', cat: '氛围与装饰', vue: 'hard', height: 620,
    desc: '液态玻璃 Logo 揭示：玻璃把 Logo 弯折出色散，再退场留下干净的标志。',
    deps: ['cn'], demo: 'reveal.html', source: 'react/components/ui/liquid-glass-logo-reveal.tsx',
    props: ['logo', 'look', 'background', 'tileSize', 'loop', 'time'],
    note: 'logo 纹理必须同源 / CORS；background 要匹配页面底色；time 可用于滚动驱动。'
  },
  {
    id: 'liquid-glass-navbar', name: 'LiquidNavbar', zh: '液态玻璃导航', cat: '导航与页面', vue: 'hard', vueReady: true, height: 480,
    desc: '液态玻璃导航栏：点击时水体波纹、图标小场景与合成音效，无 WebGL 自动降级。',
    deps: [], demo: 'navbar.html', source: 'react/components/ui/liquid-glass-navbar.tsx',
    props: ['items', 'active', 'tone', 'compact', 'sound'],
    note: '音效需要用户手势后才能播放；移动端留 env(safe-area-inset-bottom)。Vue 实装的当前项走 v-model:active；上下文丢失后退回 CSS 水滴，恢复后自动重建；卸载时关闭音频上下文。'
  },
  {
    id: 'scroll-video-hero', name: 'ScrollVideoHero', zh: '滚动锁定视频', cat: '导航与页面', vue: 'easy', vueReady: true, height: 640,
    desc: '滚动锁定视频 Hero：滚动进度驱动视频 scrub，标题 / 提示随进度淡出。',
    deps: [], demo: 'index-video-hero.html', source: 'react/components/ui/scroll-locked-video-hero.tsx',
    props: ['videoSrc', 'title', 'tagline', 'scrubDistance', 'signature'],
    note: 'iOS 需 playsInline + muted；准备 poster 与 reduced-motion 静态首帧；视频走 CDN 分段。演示使用远程视频，离线时只有 poster。Vue 实装在挂载期间会锁定页面滚动且不会自行解锁，只适合放在独立页面的首屏，或用 iframe 承载。'
  },
  {
    id: 'signature', name: 'Signature', zh: '手写签名', cat: '列表与内容', vue: 'mid', vueReady: true, height: 720,
    desc: '手写签名：可播放预设笔迹，也可直接手写；支持撤销、清除与导出 SVG / PNG。',
    deps: [], demo: 'signature.html', source: 'react/components/ui/signature.tsx',
    props: ['mode', 'text', 'pen', 'autoplay', 'inkColor', 'toSVG / toDataURL'],
    note: '签名数据默认不上传；触屏 touch-action:none；导出由业务方明确触发。'
  },
  {
    id: 'terminal-replay', name: 'TerminalReplay', zh: '终端回放', cat: '列表与内容', vue: 'easy', vueReady: true, height: 560,
    desc: '终端会话逐字回放：命令、输出、spinner、进度条、暂停与清屏，支持循环。',
    deps: [], demo: 'terminal-replay.html', source: 'react/components/ui/terminal-replay.tsx',
    props: ['script', 'theme', 'typingSpeed', 'loop', 'copyable', 'interactive'],
    note: '卸载时清所有 timer；等宽字体与行高锁死，避免回放抖动。Vue 实装挂载即开始播放，autoplay=false 只是关闭离屏暂停；需要手动重播时通过 ref 调用 play()。'
  },
  {
    id: 'peak-chart', name: 'PeakChart', zh: '峰值辉光卡片', cat: '卡片与容器', vue: 'hard', vueReady: true, height: 760,
    desc: 'canvas 手绘辉光数据卡片：曲线描绘、峰值脉冲、数字滚动、周期下拉切换与 hover 读数，数据变化曲线 morph。',
    deps: [], demo: 'peak-chart.html', source: 'react/components/ui/peak-chart.tsx',
    props: ['data', 'value', 'v-model:period', 'accent', 'width', 'loop'],
    note: '零新增依赖（纯 canvas 2d + rAF）；width 决定全部尺寸（540:696），改 width 会重播揭示；圆点静息在 peakX + 8；无 2d 上下文时静态显示终态。'
  },
  {
    id: 'glassy-dashboard', name: 'GlassyDashboard', zh: '玻璃质感数据看板', cat: '卡片与容器', vue: 'hard', vueReady: true, height: 900,
    desc: '玻璃质感分析工作区：四个视图、样例记录、图表揭示、数字滚动、明暗主题与本地 CSV 导出。',
    deps: ['gsap', '@gsap/react', 'lucide-react', '@fontsource-variable/manrope'], demo: 'glassy-dashboard.html', source: 'react/components/ui/glassy-dashboard.tsx',
    props: ['backgroundImage', 'backgroundCredit', 'workspaceName', 'panelFrost', 'initialTheme'],
    note: '样式是组件内的 dashboardStyles 模板字符串，不依赖 Tailwind；panelFrost 夹在 0–36px；背景为 Unsplash 远程图，离线时只有底色；数据全是浏览器内样例，CSV 本地生成不上传；prefers-reduced-motion 直接落终态。Vue 实装依赖 gsap / @lucide/vue / @fontsource-variable/manrope，浏览器 API 只在 onMounted 后访问。'
  },
  {
    id: 'splash-cursor', name: 'SplashCursor', zh: '流体墨迹光标', cat: '氛围与装饰', vue: 'hard', vueReady: true, height: 620,
    desc: 'WebGL2 流体墨迹光标：跟随鼠标留下带涡流的拖尾，点击爆散飞溅，支持彩虹渐变与明暗主题。',
    deps: [], demo: 'splash-cursor.html', source: 'react/components/ui/SplashCursor.tsx',
    props: ['rainbow', 'size', 'force', 'swirl', 'trail', 'glow', 'quality', 'clickSplash', 'theme'],
    note: '零第三方依赖（纯 WebGL2 + 原生 pointer 事件），离线可跑；WebGL2 不支持时显示降级提示；同页最多一个实例；弱机把 quality 降到 low；theme=light 是吸收型墨迹，配浅色背景；prefers-reduced-motion 下不启动。Vue 实装引擎在 useSplashCursor.ts，逐帧状态不进响应式。'
  },
  {
    id: 'shredder', name: 'Shredder', zh: '碎纸机', cat: '操作与反馈', vue: 'hard', vueReady: true, height: 620,
    desc: '可拖拽的碎纸机：把行拖到滚轮口，夹住后切为多条纸带卷曲飘落淡出；支持重排、循环、自动播放与键盘 shred。',
    deps: [], demo: 'shredder.html', source: 'react/components/ui/Shredder.tsx',
    props: ['items', 'renderItem', 'onShred', 'onReorder', 'width', 'height', 'inset', 'gap', 'slitHeight', 'fallHeight', 'feedSpeed', 'bite', 'autoFeed', 'stripWidth', 'curl', 'autoAnimate', 'loop', 'loopAfterDelete', 'dragTilt', 'lift', 'slitColor', 'color', 'disabled'],
    note: '零第三方依赖；行内容先快照为 canvas 纹理（内联图片 / SVG 可切，跨域图片需 CORS），再用 2D canvas 逐条绘制纸带；拖拽 / 裁剪 / 下落全走原生 pointer 与 rAF。onShred 触发后需自行从列表移除该项，除非开启 loop / loopAfterDelete / autoAnimate；prefers-reduced-motion 下落更短。Vue 实装用插槽替代 renderItem，引擎在 useShredder.ts，逐帧状态不进响应式。'
  },
  {
    id: 'spotlight-card', name: 'SpotlightCard', zh: '光斑卡片', cat: '卡片与容器', vue: 'mid', vueReady: true, height: 560,
    desc: '卡片光斑跟随指针：圆形 / 光束两种形态、边缘邻近发光、按压膨胀（flare）、环境漂移与胶片颗粒。',
    deps: [], demo: 'spotlight-card.html', source: 'react/components/ui/SpotlightCard.jsx',
    props: ['theme', 'spotlightColor', 'intensity', 'spotlightSize', 'softness', 'shape', 'borderGlow', 'proximity', 'smoothing', 'ambient', 'flare', 'grain', 'className'],
    note: '零第三方依赖（纯 DOM + radial-gradient + rAF）；两枚绝对定位 span 承载光斑与边缘光，mask 画 1px 边框，另一枚叠加颗粒；proximity 让相邻卡片共享一团光；prefers-reduced-motion 下关闭平滑与环境漂移、按压不 flare。Vue 实装引擎在 useSpotlightCard.ts，逐帧状态不进响应式。'
  }
]

export function getEffect(id) {
  return EFFECTS.find(effect => effect.id === id)
}