#!/usr/bin/env node
/**
 * 发布前验收：检查页面、内部链接、资源、搜索索引与基础 SEO 字段。
 * 用法：node scripts/verify.mjs
 */
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { PATHS } from './lib/common.mjs'

let base = process.env.SITE_BASE_PATH || ''
if (base && !base.startsWith('/')) base = `/${base}`
if (base.endsWith('/')) base = base.slice(0, -1)

const errors = []
const warnings = []
const pages = []

async function walk(dir, prefix = '') {
  const output = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) output.push(...(await walk(full, rel)))
    else output.push({ full, rel })
  }
  return output
}

function resolveTarget(url) {
  let clean = url.split('#')[0].split('?')[0]
  if (!clean) return null
  if (base && clean.startsWith(base)) clean = clean.slice(base.length) || '/'
  if (!clean.startsWith('/')) return null
  let file = path.join(PATHS.dist, clean)
  if (clean.endsWith('/')) file = path.join(file, 'index.html')
  return file
}

async function exists(file) {
  try {
    const stat = await fs.stat(file)
    return stat.isFile()
  } catch {
    return false
  }
}

async function main() {
  console.log('')
  console.log('  DSH Academy · 发布前验收')
  console.log('  ' + '─'.repeat(60))

  const files = await walk(PATHS.dist)
  const htmlFiles = files.filter((file) => file.rel.endsWith('.html'))
  const allTargets = new Map()

  for (const page of htmlFiles) {
    const html = await fs.readFile(page.full, 'utf8')
    const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1]?.trim()
    const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1]?.trim()
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1]?.replace(/<[^>]+>/g, '').trim()
    pages.push({ rel: page.rel, title, description, h1 })
    if (!title) errors.push(`${page.rel}: 缺少 <title>`)
    if (!description) warnings.push(`${page.rel}: 缺少 meta description`)
    if (!h1 && page.rel !== '404.html') errors.push(`${page.rel}: 缺少 <h1>`)

    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const raw = match[1]
      if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('javascript:')) continue
      if (/^https?:\/\//.test(raw) || raw.startsWith('//')) {
        if (/^src=/.test(match[0])) warnings.push(`${page.rel}: 外部资源 ${raw}`)
        continue
      }
      const target = resolveTarget(raw)
      if (target) allTargets.set(target, `${page.rel} → ${raw}`)
    }
  }

  for (const [target, source] of allTargets) {
    if (!(await exists(target))) errors.push(`死链：${source}`)
  }

  const required = [
    'index.html',
    '404.html',
    'courses/index.html',
    'updates/index.html',
    'faq/index.html',
    'deploy/index.html',
    'assets/css/main.css',
    'assets/js/app.js',
    'assets/video/dsh-academy.mp4',
    'assets/video/hero-loop.mp4',
    'assets/img/hero-poster.jpg',
    'assets/img/tour-poster.jpg',
    'search-index.json',
    'feed.xml',
    'sitemap.xml',
  ]
  for (const file of required) {
    if (!(await exists(path.join(PATHS.dist, file)))) errors.push(`缺少产物：${file}`)
  }

  try {
    const index = JSON.parse(await fs.readFile(path.join(PATHS.dist, 'search-index.json'), 'utf8'))
    if (!Array.isArray(index) || index.length < 50) errors.push('search-index.json 条目过少')
    const types = new Set(index.map((item) => item.type))
    for (const type of ['课程', 'FAQ', '场景', '更新', '文档']) {
      if (!types.has(type)) warnings.push(`搜索索引缺少类型：${type}`)
    }
  } catch (error) {
    errors.push(`search-index.json 无法解析：${error.message}`)
  }

  const totalBytes = (await Promise.all(files.map(async (file) => (await fs.stat(file.full)).size))).reduce((a, b) => a + b, 0)

  console.log(`  页面 ${pages.length} 个 · 内部链接 ${allTargets.size} 个 · 文件 ${files.length} 个 · ${(totalBytes / 1024 / 1024).toFixed(1)} MB`)
  console.log(`  base path: ${base || '/'} · 外部资源告警 ${warnings.length} 条`)

  if (warnings.length) {
    for (const warning of warnings.slice(0, 6)) console.log(`  ! ${warning}`)
    if (warnings.length > 6) console.log(`  ! … 其余 ${warnings.length - 6} 条`)
  }
  if (errors.length) {
    for (const error of errors.slice(0, 20)) console.log(`  ✗ ${error}`)
    console.log(`\n  验收失败：${errors.length} 个错误\n`)
    process.exitCode = 1
    return
  }
  console.log('  ✓ 验收通过\n')
}

main().catch((error) => {
  console.error('验收异常：', error)
  process.exitCode = 1
})
