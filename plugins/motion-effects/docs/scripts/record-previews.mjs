#!/usr/bin/env node
/**
 * 录制总览卡片用的预览视频。
 *
 * 用无头 Chrome 打开每个特效的 vanilla 演示，按 preview-choreo.mjs 的编排走一遍指针，
 * 录成一段循环视频，再交给 ffmpeg 产出三种文件并更新 data/previews.mjs：
 *   public/previews/<id>.webm   无缝循环（片尾交叉淡入片头）
 *   public/previews/<id>.mp4    同内容的 H.264 版本
 *   public/previews/<id>.webp   封面
 *
 * 用法：
 *   node scripts/record-previews.mjs                 # 全部
 *   node scripts/record-previews.mjs hold-button     # 只录指定 id（可多个）
 *   node scripts/record-previews.mjs --sheet         # 只拼一张封面总览图便于检查
 *
 * 依赖：系统 Chrome（或环境变量 CHROME_PATH）、PATH 里的 ffmpeg，
 * 以及 playwright-core 自带的 ffmpeg（`pnpm exec playwright-core install ffmpeg`）。
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { EFFECTS } from '../.vitepress/data/effects.mjs'
import { CHOREO, DEFAULTS } from './preview-choreo.mjs'

const docsRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const demosRoot = path.resolve(docsRoot, '../skills/motion-effects/assets')
const outRoot = path.join(docsRoot, 'public/previews')
const manifestPath = path.join(docsRoot, '.vitepress/data/previews.mjs')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
}

function fail(message) {
  console.error(`\n[record-previews] ✗ ${message}\n`)
  process.exit(1)
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  if (result.status !== 0) fail(`${command} ${args[0]} 失败：\n${result.stderr?.slice(-800)}`)
}

function ffmpeg(args) {
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args])
}

/** 起一个只服务演示目录的静态服务器，file:// 协议下不少演示的模块和纹理加载不了 */
function serve(root) {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const file = path.join(root, pathname)
    if (!file.startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404)
      response.end('not found')
      return
    }
    response.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      'cache-control': 'no-store'
    })
    fs.createReadStream(file).pipe(response)
  })
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
  })
}

/**
 * 放大演示内容：小组件在卡片里才看得清。
 * 演示页普遍用 `body { min-height: 100svh }` 居中，zoom 会把这个高度一并放大，
 * 所以要把根与 body 的高度还原，再按 zoom 折算回一屏。
 */
function zoomCss(zoom) {
  return (
    `html { zoom: ${zoom}; }\n` +
    'html, body { min-height: 0 !important; height: auto !important; }\n' +
    `body { min-height: calc(100vh / ${zoom}) !important; }\n`
  )
}

function findChrome() {
  if (process.env.CHROME_PATH) return { executablePath: process.env.CHROME_PATH }
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ]
  const found = candidates.find(candidate => fs.existsSync(candidate))
  return found ? { executablePath: found } : { channel: 'chrome' }
}

/**
 * 把一段原始录像剪成无缝循环：片尾 XFADE 秒与片头交叉淡化后接上中段，
 * 这样循环点的首尾两帧是同一帧。
 */
function encode(raw, id, { skip, xfade, duration, fps, width, height }) {
  const base = path.join(outRoot, id)
  const webm = `${base}.webm`
  const mp4 = `${base}.mp4`
  const poster = `${base}.webp`

  const graph =
    `[0:v]trim=start=${skip.toFixed(2)}:duration=${duration + xfade},setpts=PTS-STARTPTS,` +
    `fps=${fps},scale=${width}:${height}:flags=lanczos,split[s0][s1];` +
    `[s0]trim=start=${duration}:duration=${xfade},setpts=PTS-STARTPTS,fps=${fps}[tail];` +
    `[s1]trim=start=0:duration=${xfade},setpts=PTS-STARTPTS,fps=${fps}[head];` +
    `[s1]trim=start=${xfade}:duration=${duration - xfade},setpts=PTS-STARTPTS,fps=${fps}[mid];` +
    `[tail][head]xfade=transition=fade:duration=${xfade}:offset=0[blend];` +
    `[blend][mid]concat=n=2:v=1:a=0[out]`

  const common = ['-filter_complex', graph, '-map', '[out]', '-an']
  ffmpeg(['-y', '-i', raw, ...common, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', webm])
  // mp4 只给不支持 VP9 的老 Safari 兜底，主格式是 webm，所以压得更狠一些
  ffmpeg(['-y', '-i', raw, ...common, '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4])
  // 封面取循环段里靠后的一帧，此时多数演示的入场动画已经走完
  ffmpeg(['-y', '-ss', (skip + duration * 0.72).toFixed(2), '-i', raw, '-frames:v', '1', '-vf', `scale=${width}:${height}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '82', poster])

  return { webm, mp4, poster }
}

const kb = file => Math.round(fs.statSync(file).size / 1024)

async function record(browser, port, effect) {
  const spec = CHOREO[effect.id] ?? {}
  const width = spec.width ?? DEFAULTS.width
  const height = spec.height ?? DEFAULTS.height
  const duration = spec.duration ?? DEFAULTS.duration
  const xfade = spec.xfade ?? DEFAULTS.xfade
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'me-preview-'))

  const created = Date.now()
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    // 只截封面的演示不开录像
    recordVideo: spec.posterOnly ? undefined : { dir: scratch, size: { width, height } }
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))

  await page.goto(`http://127.0.0.1:${port}/demos/${effect.demo}`, { waitUntil: 'load' })
  if (spec.zoom) await page.addStyleTag({ content: zoomCss(spec.zoom) })
  if (spec.css) await page.addStyleTag({ content: spec.css })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(spec.settle ?? DEFAULTS.settle)
  await page.evaluate(() => window.scrollTo(0, 0))

  if (spec.posterOnly) {
    const target = await page.$(spec.posterOnly)
    if (!target) fail(`${effect.id}：找不到封面元素 ${spec.posterOnly}`)
    const shot = path.join(scratch, 'poster.png')
    await target.screenshot({ path: shot })
    await context.close()
    const poster = `${path.join(outRoot, effect.id)}.webp`
    // 等比放大到铺满成片尺寸，再裁切；posterCrop 是竖向裁切位置（0 顶部，1 底部，默认居中）
    const offset = spec.posterCrop ?? 0.5
    const crop = `crop=${width}:${height}:0:(ih-${height})*${offset}`
    ffmpeg(['-y', '-i', shot, '-vf', `scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos,${crop}`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', poster])
    fs.rmSync(scratch, { recursive: true, force: true })
    // 改成只截封面后，之前录的视频就没有意义了
    for (const ext of ['webm', 'mp4']) fs.rmSync(`${path.join(outRoot, effect.id)}.${ext}`, { force: true })
    return { files: { poster }, errors }
  }

  // 录像从页面创建就开始；记下「创建 → 编排开始」的实际耗时，作为要裁掉的头部
  const skip = (Date.now() - created) / 1000
  // 鼠标坐标按视口算，不受 CSS zoom 影响：zoom 只是让页面内容变大，指针仍用成片尺寸的坐标
  if (spec.run) await spec.run(page, { width, height, duration })
  else await ambient(page, { width, height, duration })

  // 多留出一段，片尾与片头的交叉淡化才有素材
  await page.waitForTimeout((xfade + 0.5) * 1000)
  await context.close()
  const video = page.video()
  const raw = await video.path()
  // KEEP_RAW=1 时把原始录像留一份，方便排查编排与裁剪
  if (process.env.KEEP_RAW) {
    fs.mkdirSync(path.join(docsRoot, '.vitepress/cache'), { recursive: true })
    fs.copyFileSync(raw, path.join(docsRoot, `.vitepress/cache/raw-${effect.id}.webm`))
  }
  const files = encode(raw, effect.id, { skip, xfade, duration, fps: DEFAULTS.fps, width, height })
  fs.rmSync(scratch, { recursive: true, force: true })
  return { files, errors }
}

/** 默认编排：指针沿一条平滑曲线慢慢扫过画面中部，让响应 hover 的演示自己动起来 */
async function ambient(page, { width, height, duration }) {
  const steps = Math.round((duration * 1000) / 40)
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration
    const x = width * (0.5 + 0.3 * Math.sin(t * 1.1))
    const y = height * (0.5 + 0.26 * Math.sin(t * 1.7 + 1.2))
    await page.mouse.move(x, y)
    await page.waitForTimeout(40)
  }
}

function writeManifest(entries) {
  const lines = [
    '/**',
    ' * 预录预览清单：{ id: { webm, mp4, poster } }，路径不带 base。',
    ' * 由 scripts/record-previews.mjs 生成并覆写，请勿手改。',
    ' */',
    'export const PREVIEWS = {'
  ]
  for (const effect of EFFECTS) {
    const entry = entries[effect.id]
    if (!entry) continue
    const fields = [
      entry.webm && `webm: '${entry.webm}'`,
      entry.mp4 && `mp4: '${entry.mp4}'`,
      `poster: '${entry.poster}'`
    ].filter(Boolean)
    lines.push(`  '${effect.id}': { ${fields.join(', ')} },`)
  }
  lines.push('}', '')
  fs.writeFileSync(manifestPath, lines.join('\n'), 'utf8')
}

async function sheet() {
  const files = EFFECTS.filter(effect => fs.existsSync(path.join(outRoot, `${effect.id}.webp`))).map(
    effect => path.join(outRoot, `${effect.id}.webp`)
  )
  const cols = 5
  const cell = { w: 384, h: 240 }
  const rows = Math.ceil(files.length / cols)
  const inputs = files.flatMap(file => ['-i', file])
  const labels = files.map((_, index) => `[v${index}]`).join('')
  const graph =
    files.map((_, index) => `[${index}:v]scale=${cell.w}:${cell.h}[v${index}]`).join(';') +
    `;${labels}xstack=inputs=${files.length}:layout=` +
    files
      .map((_, index) => `${(index % cols) * cell.w}_${Math.floor(index / cols) * cell.h}`)
      .join('|') +
    '[out]'
  const target = path.join(docsRoot, '.vitepress/cache/preview-sheet.jpg')
  fs.mkdirSync(path.dirname(target), { recursive: true })
  ffmpeg(['-y', ...inputs, '-filter_complex', graph, '-map', '[out]', '-q:v', '3', target])
  console.log(`[record-previews] 封面总览：${path.relative(docsRoot, target)}`)
}

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--sheet')) return sheet()

  const only = args.filter(arg => !arg.startsWith('--'))
  const targets = only.length ? EFFECTS.filter(effect => only.includes(effect.id)) : EFFECTS
  if (!targets.length) fail(`没有匹配的特效：${only.join(', ')}`)
  if (!fs.existsSync(demosRoot)) fail(`找不到演示目录: ${demosRoot}`)
  if (spawnSync('ffmpeg', ['-version']).status !== 0) fail('PATH 里找不到 ffmpeg')

  fs.mkdirSync(outRoot, { recursive: true })
  const { server, port } = await serve(demosRoot)
  const browser = await chromium.launch({ headless: true, ...findChrome() })

  const entries = {}
  try {
    for (const [index, effect] of targets.entries()) {
      const at = `[${String(index + 1).padStart(2)}/${String(targets.length).padStart(2)}]`
      const started = Date.now()
      const { files, errors } = await record(browser, port, effect)
      entries[effect.id] = files
      console.log(
        `${at} ${effect.id.padEnd(22)} ${files.webm ? `webm ${String(kb(files.webm)).padStart(4)}KB  mp4 ${String(kb(files.mp4)).padStart(4)}KB` : 'poster only'.padEnd(24)}  ${((Date.now() - started) / 1000).toFixed(1)}s` +
          (errors.length ? `  ⚠ 页面报错: ${errors[0].slice(0, 80)}` : '')
      )
    }
  } finally {
    await browser.close()
    server.close()
  }

  // 清单以磁盘上实际存在的文件为准，单录几个不会把别的条目弄丢
  const merged = {}
  for (const effect of EFFECTS) {
    const base = path.join(outRoot, effect.id)
    // 封面必须有；视频成对存在才算有（只截封面的演示没有视频）
    if (!fs.existsSync(`${base}.webp`)) continue
    merged[effect.id] = { poster: `/previews/${effect.id}.webp` }
    if (['webm', 'mp4'].every(ext => fs.existsSync(`${base}.${ext}`))) {
      merged[effect.id].webm = `/previews/${effect.id}.webm`
      merged[effect.id].mp4 = `/previews/${effect.id}.mp4`
    }
  }
  writeManifest(merged)
  let total = 0
  for (const entry of Object.values(merged)) {
    for (const file of Object.values(entry)) {
      total += fs.statSync(path.join(docsRoot, 'public', file.slice(1))).size
    }
  }
  console.log(`[record-previews] ✓ ${targets.length} 个已录制，清单共 ${Object.keys(merged).length} 条，public/previews 合计 ${(total / 1024 / 1024).toFixed(1)}MB`)
  await sheet()
}

main().catch(error => fail(error.stack ?? String(error)))
