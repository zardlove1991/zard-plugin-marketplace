#!/usr/bin/env node
/**
 * 审计 @ts-nocheck 文件里的两类问题。
 *
 * 移植过来的引擎为了保住原始数值算法，多半带 `// @ts-nocheck`，
 * 代价是「引用了没定义的名字」「把取值器当值用」这类错误也被一起盖住——
 * 类型检查过、运行时才炸。
 *
 * 规则一：未定义的名字（TS2304 / TS2552 / TS2551）
 *   把 src 复制到 node_modules 下的临时目录、去掉 @ts-nocheck 后跑一遍 tsc。
 *
 * 规则二：option 取值器（() => T）被当值用
 *   composable 的 option 一律是取值器，调用方要么写 name() 取值，要么把它交给
 *   watch() 当数据源；直接写 name 拿到的会是函数本身。PaperCrumple 曾把
 *   load(src) 写成 load(取值器)，图片永远加载失败。
 *
 * 用法：node scripts/check-free-identifiers.mjs
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const pkgRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const srcDir = path.join(pkgRoot, 'src')
const tmpDir = path.join(pkgRoot, 'node_modules', '.tsnocheck-audit')
const tsc = path.join(pkgRoot, 'node_modules', '.bin', 'tsc')

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.ts')) out.push(full)
  }
  return out
}

/* ---------- 规则一：未定义的名字 ---------- */

fs.rmSync(tmpDir, { recursive: true, force: true })
fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true })

let audited = 0
for (const file of walk(srcDir)) {
  const source = fs.readFileSync(file, 'utf8')
  if (!source.includes('@ts-nocheck')) continue
  audited += 1
  const target = path.join(tmpDir, 'src', path.relative(srcDir, file))
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, source.replace(/^\s*\/\/ @ts-nocheck\s*$/m, ''))
}

const problems = []

if (audited) {
  fs.writeFileSync(
    path.join(tmpDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: false,
          noEmit: true,
          skipLibCheck: true,
          lib: ['ES2022', 'DOM', 'DOM.Iterable']
        },
        include: ['src/**/*.ts']
      },
      null,
      2
    )
  )

  let output = ''
  try {
    execFileSync(tsc, ['-p', 'tsconfig.json'], { cwd: tmpDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (error) {
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`
  }
  for (const line of output.split('\n')) {
    if (/error TS(2304|2552|2551)/.test(line)) problems.push(line.replace(tmpDir, 'src').trim())
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true })

/* ---------- 规则二：取值器被当值用 ---------- */

const NOT_A_GETTER = new Set([
  'root', 'canvas', 'hit', 'body', 'wrap', 'track', 'cellEls', 'cardEls', 'starEls', 'itemEls'
])

function auditGettersAsValues() {
  const found = []
  for (const file of walk(srcDir)) {
    const source = fs.readFileSync(file, 'utf8')
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
    const getters = new Set()
    const optionBindings = new Set()

    const collect = node => {
      if (
        ts.isVariableDeclaration(node) &&
        node.name &&
        ts.isObjectBindingPattern(node.name) &&
        node.initializer &&
        ts.isIdentifier(node.initializer) &&
        node.initializer.text === 'options'
      ) {
        for (const element of node.name.elements) {
          optionBindings.add(element)
          const name = (element.propertyName ?? element.name).text
          if (!/^[a-z][A-Za-z0-9]*$/.test(name)) continue
          if (NOT_A_GETTER.has(name) || /^on[A-Z]/.test(name)) continue
          getters.add(name)
        }
      }
      ts.forEachChild(node, collect)
    }
    collect(sf)
    if (!getters.size) continue

    // 同名遮蔽：文件里另有同名的局部变量 / 参数时，取值器已经被盖住，判定不可靠，跳过
    const shadowed = new Set()
    const collectDeclarations = node => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) shadowed.add(node.name.text)
      if (ts.isParameter(node) && ts.isIdentifier(node.name)) shadowed.add(node.name.text)
      // options 的解构本身就是取值器，不算遮蔽
      if (ts.isBindingElement(node) && ts.isIdentifier(node.name) && !optionBindings.has(node)) {
        shadowed.add(node.name.text)
      }
      if (ts.isFunctionDeclaration(node) && node.name) shadowed.add(node.name.text)
      ts.forEachChild(node, collectDeclarations)
    }
    collectDeclarations(sf)
    for (const name of getters) {
      if (shadowed.has(name)) getters.delete(name)
    }
    if (!getters.size) continue

    const rel = path.relative(srcDir, file)
    const report = (node, why) => {
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf))
      const text = source.split('\n')[line].trim()
      found.push(`${rel}:${line + 1}  ${node.text} 是取值器，却${why} → ${text.slice(0, 90)}`)
    }

    const check = node => {
      if (ts.isIdentifier(node) && getters.has(node.text)) {
        const parent = node.parent
        const isCallee = ts.isCallExpression(parent) && parent.expression === node
        const isWatchSource =
          ts.isCallExpression(parent) &&
          parent.arguments[0] === node &&
          ts.isIdentifier(parent.expression) &&
          parent.expression.text.startsWith('watch')
        if (!isCallee && !isWatchSource) {
          // 简写属性：{ releaseBehavior } —— 值就是函数本身
          if (ts.isShorthandPropertyAssignment(parent) && parent.name === node) {
            report(node, '被当成值写进了对象')
          } else if (ts.isCallExpression(parent) && parent.arguments.includes(node)) {
            // 作为实参传给别的函数：load(src)
            report(node, '被当成值传给了别的函数')
          }
        }
      }
      ts.forEachChild(node, check)
    }
    check(sf)
  }
  return found
}

for (const line of auditGettersAsValues()) problems.push(line)

if (problems.length) {
  console.error(`\n[tsnocheck-audit] ✗ 发现 ${problems.length} 处问题：\n`)
  for (const line of problems) console.error(`  ${line}`)
  console.error('')
  process.exit(1)
}

console.log(`[tsnocheck-audit] ✓ ${audited} 个 @ts-nocheck 文件里没有未定义的名字，也没有把取值器当值用`)
