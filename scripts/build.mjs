#!/usr/bin/env node
/**
 * 静态站点生成器：把 content/*.json 与 site/data/*.json 编译为 dist/。
 * 零第三方依赖，输出可直接托管到任意静态服务器。
 */
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { PATHS, copyDir, ensureDir, escapeHtml, hash, readJson, writeJson } from './lib/common.mjs'
import { coursesPage, deployPage, faqPage, homePage, lessonPage, notFoundPage, scenariosPage, updatesPage } from './pages.mjs'
import { u } from './lib/ui.mjs'

const SITE = {
  name: 'DSH Academy',
  tagline: 'DeepSeek Harness 中文教学与自动化部署平台',
  description:
    'DeepSeek Harness 中文教学平台：8 门系统课程、6 个实战场景、14 个常见问题、每 3 天自动巡检的更新雷达，以及本机 / GitHub Pages / Docker / Netlify 一键部署流水线。',
  url: process.env.SITE_URL || 'https://dsh-academy.example.com',
}

let base = process.env.SITE_BASE_PATH || ''
if (base && !base.startsWith('/')) base = `/${base}`
if (base.endsWith('/')) base = base.slice(0, -1)

const started = Date.now()

async function writePage(route, html) {
  const file = path.join(PATHS.dist, route, 'index.html')
  await ensureDir(path.dirname(file))
  const compact = html.replace(/\n\s*\n/g, '\n')
  await fs.writeFile(file, compact, 'utf8')
  return compact.length
}

function searchIndex(courses, faqs, scenarios, updates, docs) {
  const entries = []
  for (const course of courses) {
    entries.push({
      type: '课程',
      title: course.title,
      desc: course.summary,
      url: u(base, `/courses/${course.slug}/`),
      tags: [course.level, ...(course.tags || [])].filter(Boolean),
    })
  }
  for (const faq of faqs) {
    entries.push({
      type: 'FAQ',
      title: faq.question,
      desc: faq.answer,
      url: `${u(base, '/faq/')}#faq-${faq.id}`,
      tags: faq.tags || [],
    })
  }
  for (const scenario of scenarios) {
    entries.push({
      type: '场景',
      title: scenario.title,
      desc: scenario.goal,
      url: `${u(base, '/scenarios/')}#${scenario.slug}`,
      tags: scenario.stack || [],
    })
  }
  for (const event of updates.slice(0, 40)) {
    entries.push({ type: '更新', title: event.title, desc: event.summary || '', url: event.url, tags: event.tags || [] })
  }
  for (const page of docs.slice(0, 120)) {
    entries.push({ type: '文档', title: page.title, desc: page.category, url: page.url, tags: [page.category] })
  }
  return entries.map((entry) => ({ ...entry, desc: String(entry.desc || '').slice(0, 150) }))
}

function rss(updates, meta) {
  const items = updates
    .slice(0, 30)
    .map(
      (event) => `    <item>
      <title>${escapeHtml(event.title)}</title>
      <link>${escapeHtml(event.url)}</link>
      <guid isPermaLink="false">${escapeHtml(event.id)}</guid>
      <pubDate>${new Date(event.date).toUTCString()}</pubDate>
      <description>${escapeHtml(event.summary || '')}</description>
    </item>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtml(SITE.name)} · 更新雷达</title>
    <link>${SITE.url}${base}/updates/</link>
    <description>${escapeHtml(SITE.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date(meta?.lastRun || Date.now()).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`
}

function sitemap(routes) {
  const urls = routes
    .map(
      (route) =>
        `  <url><loc>${SITE.url}${base}${route}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

async function main() {
  console.log('')
  console.log('  DSH Academy · 构建静态站点')
  console.log('  ' + '─'.repeat(64))

  const coursesFile = await readJson(path.join(PATHS.content, 'courses.json'))
  const faqsFile = await readJson(path.join(PATHS.content, 'faqs.json'))
  const scenariosFile = await readJson(path.join(PATHS.content, 'scenarios.json'))
  if (!coursesFile || !faqsFile || !scenariosFile) {
    throw new Error('缺少 content/courses.json、faqs.json 或 scenarios.json')
  }

  const courses = coursesFile.courses
  const faqs = faqsFile.faqs
  const scenarios = scenariosFile.scenarios
  const updates = (await readJson(path.join(PATHS.data, 'updates.json'), [])) || []
  const meta = (await readJson(path.join(PATHS.data, 'meta.json'), null)) || {}
  const docsFile = (await readJson(path.join(PATHS.data, 'docs.json'), { pages: [] })) || { pages: [] }
  const plugins = (await readJson(path.join(PATHS.data, 'plugins.json'), null)) || { featured: [], recent: [] }

  await fs.rm(PATHS.dist, { recursive: true, force: true })
  await ensureDir(PATHS.dist)
  SITE.assetVersion = hash(
    `${await fs.readFile(path.join(PATHS.assets, 'css', 'main.css'), 'utf8')}${await fs.readFile(path.join(PATHS.assets, 'js', 'app.js'), 'utf8')}`,
  ).slice(0, 10)

  const counts = {}
  counts['/'] = await writePage('', homePage({ site: SITE, base, meta, courses, faqs, scenarios, updates, plugins }))
  counts['/courses/'] = await writePage('courses', coursesPage({ site: SITE, base, meta, courses }))
  for (const [index, course] of courses.entries()) {
    counts[`/courses/${course.slug}/`] = await writePage(
      path.join('courses', course.slug),
      lessonPage({ site: SITE, base, meta, course, courses, index }),
    )
  }
  counts['/scenarios/'] = await writePage('scenarios', scenariosPage({ site: SITE, base, meta, scenarios }))
  counts['/updates/'] = await writePage('updates', updatesPage({ site: SITE, base, meta, updates, docs: docsFile, plugins }))
  counts['/faq/'] = await writePage('faq', faqPage({ site: SITE, base, meta, faqs }))
  counts['/deploy/'] = await writePage('deploy', deployPage({ site: SITE, base, meta }))
  counts['/404'] = await writePage('404', notFoundPage({ site: SITE, base, meta }))

  // 404.html 兼容静态主机的根级兜底
  await fs.copyFile(path.join(PATHS.dist, '404', 'index.html'), path.join(PATHS.dist, '404.html'))

  await copyDir(PATHS.assets, path.join(PATHS.dist, 'assets'))

  const entries = searchIndex(courses, faqs, scenarios, updates, docsFile.pages || [])
  await writeJson(path.join(PATHS.dist, 'search-index.json'), entries)
  await fs.writeFile(path.join(PATHS.dist, 'feed.xml'), rss(updates, meta), 'utf8')
  await fs.writeFile(
    path.join(PATHS.dist, 'sitemap.xml'),
    sitemap(['/', '/courses/', ...courses.map((course) => `/courses/${course.slug}/`), '/scenarios/', '/updates/', '/faq/', '/deploy/']),
    'utf8',
  )
  await fs.writeFile(path.join(PATHS.dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}${base}/sitemap.xml\n`, 'utf8')
  await fs.writeFile(path.join(PATHS.dist, '.nojekyll'), '', 'utf8')
  await writeJson(path.join(PATHS.dist, 'manifest.webmanifest'), {
    name: SITE.name,
    short_name: 'DSH Academy',
    description: SITE.description,
    start_url: `${base}/`,
    display: 'standalone',
    background_color: '#05080f',
    theme_color: '#5b8cff',
    icons: [{ src: `${base}/assets/img/icon.svg`, sizes: 'any', type: 'image/svg+xml' }],
  })

  const assetChecks = [
    'assets/css/main.css',
    'assets/js/app.js',
    'assets/video/dsh-academy.mp4',
    'assets/video/hero-loop.mp4',
    'assets/img/hero-poster.jpg',
    'assets/img/tour-poster.jpg',
  ]
  const missing = []
  for (const asset of assetChecks) {
    try {
      await fs.access(path.join(PATHS.dist, asset))
    } catch {
      missing.push(asset)
    }
  }

  let total = 0
  const walk = async (dir) => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) await walk(full)
      else total += (await fs.stat(full)).size
    }
  }
  await walk(PATHS.dist)

  console.log(`  页面 ${Object.keys(counts).length} 个 · 搜索条目 ${entries.length} 条`)
  console.log(`  课程 ${courses.length} · FAQ ${faqs.length} · 场景 ${scenarios.length} · 事件 ${updates.length}`)
  console.log(`  产物 ${(total / 1024 / 1024).toFixed(1)} MB · 用时 ${((Date.now() - started) / 1000).toFixed(1)}s`)
  if (missing.length) console.log(`  ! 缺少资源：${missing.join(', ')}（运行 npm run video 生成）`)
  console.log(`  base path: ${base || '/'}`)
  console.log('')
}

main().catch((error) => {
  console.error('\n  构建失败：', error)
  process.exitCode = 1
})
