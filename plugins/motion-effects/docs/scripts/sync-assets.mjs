#!/usr/bin/env node
/**
 * 构建前同步：把特效源码/演示复制到 VitePress 的 public/。
 * - assets/demos      -> public/demos      （20 个可运行演示 + 依赖资产）
 * - assets/react      -> public/source/react（源码可在线查看）
 * - assets/gallery.html -> public/gallery.html（单页 Gallery，保留）
 *
 * 同时校验 20 个特效的 demo/source 存在，以及 demo 里引用的本地资产齐全。
 * 任一缺失直接 exit 1，避免 CI 部署出半成品站点。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EFFECTS } from '../.vitepress/data/effects.mjs'

const docsRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const assetsRoot = path.resolve(docsRoot, '../skills/motion-effects/assets')
const publicRoot = path.join(docsRoot, 'public')
const demosSrc = path.join(assetsRoot, 'demos')
const demosDest = path.join(publicRoot, 'demos')
const reactSrc = path.join(assetsRoot, 'react')
const sourceRoot = path.join(publicRoot, 'source')
const reactDest = path.join(sourceRoot, 'react')
const gallerySrc = path.join(assetsRoot, 'gallery.html')
const galleryDest = path.join(publicRoot, 'gallery.html')

function fail(message) {
  console.error(`\n[sync-assets] ✗ ${message}\n`)
  process.exit(1)
}

function assertFile(file, label) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) fail(`缺少${label}: ${file}`)
}

if (!fs.existsSync(demosSrc)) fail(`找不到演示目录: ${demosSrc}`)
if (!fs.existsSync(reactSrc)) fail(`找不到源码目录: ${reactSrc}`)

fs.rmSync(demosDest, { recursive: true, force: true })
fs.rmSync(sourceRoot, { recursive: true, force: true })
fs.mkdirSync(publicRoot, { recursive: true })

fs.cpSync(demosSrc, demosDest, { recursive: true })
fs.cpSync(reactSrc, reactDest, { recursive: true })
assertFile(gallerySrc, '单页 Gallery')
fs.copyFileSync(gallerySrc, galleryDest)

// 1) 每个特效的 demo 与 source 必须存在
for (const effect of EFFECTS) {
  const demo = path.join(demosDest, effect.demo)
  const source = path.join(sourceRoot, effect.source)
  assertFile(demo, `演示 (${effect.id})`)
  assertFile(source, `源码 (${effect.id})`)
}

// 2) demo 内引用的本地 assets/ 与 components/ 必须一起复制到 public/demos
for (const effect of EFFECTS) {
  const demoPath = path.join(demosDest, effect.demo)
  const html = fs.readFileSync(demoPath, 'utf8')
  const refs = [...html.matchAll(/(?:src|href)="((?:assets|components)\/[^"?#]+)"/g)].map(m => m[1])
  for (const ref of new Set(refs)) {
    assertFile(path.join(demosDest, ref), `${effect.id} 的本地资产 ${ref}`)
  }
}

const demoCount = fs.readdirSync(demosDest).filter(f => f.endsWith('.html')).length
const sourceCount = fs.readdirSync(reactDest).length
console.log(`[sync-assets] ✓ demos: ${demoCount} 个，source: ${sourceCount} 项，gallery: 已复制`)
console.log(`[sync-assets]   输出: ${path.relative(docsRoot, publicRoot)}/`)