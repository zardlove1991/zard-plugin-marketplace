/**
 * 预览录像的编排：每个演示怎么走指针、按多久、镜头对准哪里。
 *
 * 没有条目的演示走 `ambient`（指针沿平滑曲线扫过画面中部）。
 * 每个条目可以写：
 *   width / height   成片尺寸，默认见 DEFAULTS
 *   zoom             放大倍数：给演示页注入 CSS zoom，小组件在卡片里才看得清。
 *                    zoom 会把视口单位一并放大：演示自己的容器带 100svh / 100dvh 时，
 *                    要在 css 里把它的尺寸除以 zoom，否则内容会被挤出画面
 *   duration         编排时长（秒），即成片一圈的长度
 *   xfade            片尾与片头的交叉淡化时长；0 表示硬切
 *   settle           页面 load 之后、编排之前等多久
 *   css              录制前注入的样式（隐藏演示页的说明文字等）
 *   run(page, box)   自定义编排；box 的 width / height 是成片尺寸，鼠标坐标直接按它算
 *   posterOnly       不录像，只截一张静态封面（给无头环境里渲染不出来的演示用）
 *   posterCrop       静态封面的竖向裁切位置：0 顶部，1 底部，默认居中
 *
 * 目标是让每个卡片在 5 秒左右的一圈里，把「这个特效最值得看的那一下」演出来。
 */

export const DEFAULTS = {
  width: 960,
  height: 600,
  duration: 5.2,
  xfade: 0.7,
  fps: 30,
  settle: 700
}

const pause = (page, ms) => page.waitForTimeout(ms)
const hide = selector => `${selector} { display: none !important; }`

export const CHOREO = {
  'animated-list': { zoom: 1.2, css: hide('.intro') },

  'flip-card': {
    zoom: 1.25,
    async run(page, { width, height }) {
      const x = width / 2
      const y = height / 2
      await page.mouse.move(x, y)
      await pause(page, 1100)
      await page.mouse.down()
      await page.mouse.move(x + 170, y, { steps: 16 })
      await pause(page, 1700)
      await page.mouse.move(x + 30, y, { steps: 14 })
      await pause(page, 400)
      await page.mouse.up()
      await page.mouse.move(x, y, { steps: 6 })
      await pause(page, 800)
    }
  },

  'magic-bento': { zoom: 1.4, css: hide('.intro-kicker, .intro-title, .note') },

  // 无头环境里 three.js 场景渲染不出来（白屏），只取演示自带的兜底图当封面
  'paper-crumple': {
    // 兜底图本身是一张带标题的设计海报，居中裁切即可
    posterOnly: '.paper-crumple-fallback',
    css: '.paper-crumple canvas { display: none !important; } .paper-crumple-fallback { display: block !important; }'
  },

  'pill-nav': { zoom: 1.25, css: hide('.hint') },

  'rubber-segment': {
    zoom: 2.6,
    async run(page, { width, height }) {
      const y = height / 2
      const x = width / 2
      // 依次点第三个、第一个分段，滑块拉伸、挤压再回弹
      await page.mouse.move(x + 110, y, { steps: 8 })
      await pause(page, 500)
      await page.mouse.down()
      await page.mouse.up()
      await pause(page, 1500)
      await page.mouse.move(x - 130, y, { steps: 8 })
      await pause(page, 400)
      await page.mouse.down()
      await page.mouse.up()
      await pause(page, 1500)
      await page.mouse.move(x + 10, y, { steps: 8 })
      await pause(page, 600)
    }
  },

  'specular-button': { zoom: 1.7, css: hide('.intro') },

  'swipe-row': {
    zoom: 1.35,
    css: hide('.stage-head'),
    async run(page, { width, height }) {
      const x = width * 0.5
      const y = height * 0.38
      await page.mouse.move(x, y)
      await pause(page, 600)
      await page.mouse.down()
      await page.mouse.move(x - 150, y, { steps: 14 })
      await pause(page, 900)
      await page.mouse.move(x - 40, y, { steps: 10 })
      await pause(page, 500)
      await page.mouse.up()
      await page.mouse.move(x, y, { steps: 6 })
      await pause(page, 1800)
    }
  },

  'glass-folder-cards': { zoom: 1.25 },

  'glass-logo-reveal': {
    zoom: 1.6,
    css: '.stage { width: calc(100vw / 1.6) !important; height: calc(100dvh / 1.6) !important; }'
  },

  'liquid-glass-navbar': {
    zoom: 1.8,
    css: '.stage { min-height: calc(100svh / 1.8) !important; }'
  },

  'splash-cursor': {
    duration: 5.6,
    xfade: 0.4,
    // 拖尾本身很淡、飞溅半秒就散，所以指针走得快、飞溅打得勤
    async run(page, { width, height, duration }) {
      const started = Date.now()
      for (let i = 0; (Date.now() - started) / 1000 < duration + 1.2; i++) {
        const t = (Date.now() - started) / 1000
        const x = width * (0.5 + 0.32 * Math.sin(t * 1.9))
        const y = height * (0.5 + 0.3 * Math.sin(t * 2.7 + 1.1))
        await page.mouse.move(x, y)
        if (i % 12 === 0) {
          await page.mouse.down()
          await page.mouse.up()
        }
        await pause(page, 40)
      }
    }
  },

  'scroll-video-hero': {
    duration: 5.6,
    xfade: 0.9,
    async run(page, { width, height }) {
      await page.mouse.move(width / 2, height / 2)
      // 正向滚到接近片尾，再滚回开头，循环点落在起始画面上
      for (let i = 0; i < 34; i++) {
        await page.mouse.wheel(0, 56)
        await pause(page, 80)
      }
      await pause(page, 500)
      for (let i = 0; i < 40; i++) {
        await page.mouse.wheel(0, -56)
        await pause(page, 55)
      }
      await pause(page, 400)
    }
  },

  'hold-button': {
    zoom: 2.4,
    async run(page, { width, height }) {
      await page.mouse.move(width / 2, height / 2 - 24)
      await pause(page, 500)
      await page.mouse.down()
      await pause(page, 2300)
      await page.mouse.up()
      await pause(page, 1700)
      // 回到起点附近，让循环接得上
      await page.mouse.move(width / 2 + 6, height / 2 - 20, { steps: 8 })
      await pause(page, 500)
    }
  },

  'shredder': { zoom: 1.15, css: hide('.eyebrow, .lede, h1'), settle: 1200 },

  'signature': { zoom: 1.2, css: hide('.eyebrow, .title'), settle: 900 },

  'spotlight-card': { zoom: 1.25, css: hide('.eyebrow, .lede, h1') },

  'terminal-replay': { zoom: 1.25, css: hide('.intro') },

  // AI 输入框：打一段字 → 开联网模式 → 发送，展示输入 / 模式前缀 / 清空三步
  'ai-prompt-box': {
    zoom: 1.25,
    css: hide('.status'),
    async run(page, { width, height }) {
      const box = await page.locator('#text').boundingBox()
      const toggles = await page.locator('.aip-toggle--search').boundingBox()
      const main = await page.locator('#main').boundingBox()
      if (!box || !toggles || !main) return
      // 点输入框打字（鼠标聚焦不再有描边，靠光标体现）
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await page.keyboard.type('Design a landing page for our launch', { delay: 45 })
      await pause(page, 700)
      // 开「联网搜索」模式，placeholder 与按钮随之变化
      await page.mouse.click(toggles.x + toggles.width / 2, toggles.y + toggles.height / 2)
      await pause(page, 900)
      // 发送：文本带 [Search: …] 前缀被记录，输入框清空
      await page.mouse.click(main.x + main.width / 2, main.y + main.height / 2)
      await pause(page, 1200)
      // 回到输入框，让循环首尾衔接自然
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 })
      await pause(page, 500)
    }
  }
}
