#!/usr/bin/env node
/**
 * DSH Academy 自动巡检爬虫
 * 每 3 天运行一次：抓取 npm 版本、GitHub Releases、官方文档变更、社区议题。
 * 无第三方依赖，产物写入 site/data/ 供静态站点构建使用。
 */
import path from 'node:path'
import { promises as fs } from 'node:fs'
import {
  PATHS,
  addDays,
  decodeEntities,
  ensureDir,
  fetchText,
  hash,
  readJson,
  shortDate,
  stripTags,
  writeJson,
} from './lib/common.mjs'

const NPM_PACKAGE = '@deepseek-ai/dsh'
const NPM_LATEST = `https://registry.npmjs.org/${encodeURIComponent(NPM_PACKAGE)}/latest`
const NPM_TAGS = `https://registry.npmjs.org/-/package/${encodeURIComponent(NPM_PACKAGE)}/dist-tags`
const RELEASES_ATOM = 'https://github.com/deepseek-ai/deepseek-harness/releases.atom'
const DOCS_LLMS = 'https://deepseek-harness.github.io/deepseek-harness/llms.txt'
const DOCS_ORIGIN = 'https://deepseek-harness.github.io'
const ISSUE_SEARCH =
  'https://api.github.com/search/issues?q=repo%3Adeepseek-ai%2Fdeepseek-harness+is%3Aissue&sort=updated&order=desc&per_page=15'
const PLUGIN_UPDATED =
  'https://api.github.com/search/repositories?q=topic%3Adsh-plugin&sort=updated&order=desc&per_page=12'
const PLUGIN_POPULAR =
  'https://api.github.com/search/repositories?q=topic%3Adsh-plugin&sort=stars&order=desc&per_page=9'

const startedAt = Date.now()
const now = new Date()
const log = (...args) => console.log(...args)
const results = []
const newEvents = []

function line(source, status, detail, ms) {
  const icon = status === 'ok' ? 'OK ' : status === 'degraded' ? 'WARN' : 'FAIL'
  log(`  [${icon}] ${source.padEnd(18)} ${String(detail).padEnd(46)} ${ms}ms`)
}

async function runSource(id, name, fn) {
  const t0 = Date.now()
  try {
    const result = (await fn()) ?? {}
    const ms = Date.now() - t0
    const status = result.status ?? 'ok'
    results.push({ id, name, status, ms, http: result.http ?? 200, items: result.items ?? 0, note: result.note ?? '' })
    line(name, status, result.note ?? `${result.items ?? 0} 项`, ms)
    return result
  } catch (error) {
    const ms = Date.now() - t0
    results.push({
      id,
      name,
      status: 'fail',
      ms,
      http: error.status ?? 0,
      items: 0,
      note: String(error.message || error).slice(0, 160),
    })
    line(name, 'fail', String(error.message || error).slice(0, 60), ms)
    return null
  }
}

/* ------------------------------- npm ------------------------------- */
async function crawlNpm(state) {
  const [latestRes, tagsRes] = await Promise.all([fetchText(NPM_LATEST), fetchText(NPM_TAGS)])
  if (latestRes.status !== 200) throw Object.assign(new Error(`npm registry ${latestRes.status}`), { status: latestRes.status })
  const latest = JSON.parse(latestRes.text)
  const tags = JSON.parse(tagsRes.text)
  const previous = state.npm?.latest
  const version = latest.version

  if (version && version !== previous) {
    newEvents.push({
      id: `npm-${version}`,
      type: 'release',
      title: `npm 发布 @deepseek-ai/dsh ${version}`,
      url: `https://www.npmjs.com/package/${NPM_PACKAGE}/v/${version}`,
      date: latestRes.response.headers.get('date') ? new Date(latestRes.response.headers.get('date')).toISOString() : now.toISOString(),
      summary: latest.description || '新的 npm 版本已发布。',
      tags: ['npm', tags.latest === version ? 'latest' : 'dist-tag'],
      source: 'npm Registry',
    })
  }

  state.npm = {
    latest: version,
    previous: previous && previous !== version ? previous : state.npm?.previous ?? null,
    tags,
    checkedAt: now.toISOString(),
  }
  return { status: 'ok', http: latestRes.status, items: 1, note: `v${version} · ${Object.keys(tags).length} 个 tag` }
}

/* ----------------------------- releases ---------------------------- */
function parseAtom(xml) {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => match[1])
  return entries.map((entry) => {
    const pick = (tag) => {
      const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(entry)
      return m ? decodeEntities(m[1]) : ''
    }
    const linkMatch = /<link[^>]*rel="alternate"[^>]*href="([^"]+)"/.exec(entry) || /<link[^>]*href="([^"]+)"/.exec(entry)
    return {
      id: pick('id'),
      title: pick('title').trim(),
      updated: pick('updated'),
      link: linkMatch ? linkMatch[1] : '',
      content: pick('content'),
    }
  })
}

async function crawlReleases(state) {
  const { text, status } = await fetchText(RELEASES_ATOM)
  if (status !== 200) throw Object.assign(new Error(`GitHub releases atom ${status}`), { status })
  const entries = parseAtom(text)
  const known = new Set(state.releases ?? [])
  const isFirst = known.size === 0
  const fresh = entries.filter((entry) => !known.has(entry.id))
  const take = isFirst ? entries.slice(0, 10) : fresh

  for (const entry of take) {
    const version = /dsh-v?([\w.-]+)/i.exec(entry.title)?.[1] ?? entry.title
    const summary = stripTags(entry.content).slice(0, 260)
    newEvents.push({
      id: `gh-${entry.id || entry.title}`,
      type: 'release',
      title: `GitHub Release · ${version}`,
      url: entry.link || RELEASES_ATOM,
      date: entry.updated || now.toISOString(),
      summary: summary || '查看发布说明了解变更。',
      tags: ['release', /rc|alpha|beta/i.test(version) ? '预发布' : '正式版'],
      source: 'GitHub Releases',
    })
  }

  state.releases = [...new Set([...(state.releases ?? []), ...entries.map((entry) => entry.id)])].slice(-60)
  return {
    status: 'ok',
    http: status,
    items: entries.length,
    note: isFirst ? `建立基线 ${entries.length} 条（展示最近 ${take.length} 条）` : `${entries.length} 条 · 新增 ${take.length}`,
  }
}

/* ------------------------------- docs ------------------------------ */
function parseLlms(text) {
  const pages = []
  let section = ''
  for (const raw of text.split('\n')) {
    const lineText = raw.trim()
    if (lineText.startsWith('## ')) {
      section = lineText.slice(3).trim()
      continue
    }
    if (section !== '简体中文') continue
    const match = /^- \[([^\]]+)\]\(([^)]+\.md)\)(?::\s*(.+))?$/.exec(lineText)
    if (!match) continue
    pages.push({ title: match[1].trim(), path: match[2], category: (match[3] || '文档').trim() })
  }
  return pages
}

async function mapLimit(items, limit, worker) {
  const output = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      output[index] = await worker(items[index], index)
    }
  })
  await Promise.all(runners)
  return output
}

async function crawlDocs(state) {
  const { text, status } = await fetchText(DOCS_LLMS)
  if (status !== 200) throw Object.assign(new Error(`llms.txt ${status}`), { status })
  const pages = parseLlms(text)
  if (!pages.length) throw new Error('llms.txt 中没有解析到中文页面')

  const previous = state.docs ?? {}
  const nextDocs = {}
  const changed = []
  const added = []
  let failures = 0

  await mapLimit(pages, 6, async (page) => {
    const url = new URL(page.path, DOCS_ORIGIN).href
    const old = previous[url]
    const headers = { Accept: 'text/markdown,text/plain;q=0.9,*/*;q=0.5' }
    if (old?.etag) headers['If-None-Match'] = old.etag
    if (old?.lastModified) headers['If-Modified-Since'] = old.lastModified
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(25000) })
      if (response.status === 304 && old) {
        nextDocs[url] = old
        return
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const body = await response.text()
      const digest = hash(body)
      const record = {
        title: page.title,
        url,
        category: page.category,
        hash: digest,
        etag: response.headers.get('etag') || '',
        lastModified: response.headers.get('last-modified') || '',
        checkedAt: now.toISOString(),
      }
      nextDocs[url] = record
      if (old && old.hash !== digest) changed.push({ title: page.title, url: page.path })
      if (!old) added.push({ title: page.title, url: page.path })
    } catch {
      failures++
      if (old) nextDocs[url] = old
    }
  })

  const firstRun = Object.keys(previous).length === 0
  if (firstRun) {
    newEvents.push({
      id: `docs-baseline-${shortDate(now.toISOString())}`,
      type: 'docs',
      title: `文档基线建立：${Object.keys(nextDocs).length} 个页面`,
      url: 'https://deepseek-harness.github.io/deepseek-harness/',
      date: now.toISOString(),
      summary: '巡检器已为官方中文文档建立内容指纹，之后每 3 天只报告真正发生变化的页面。',
      tags: ['文档', '基线'],
      source: '官方文档',
    })
  } else if (changed.length || added.length) {
    const bits = []
    if (changed.length) bits.push(`${changed.length} 页更新`)
    if (added.length) bits.push(`${added.length} 页新增`)
    newEvents.push({
      id: `docs-${shortDate(now.toISOString())}-${hash(changed.map((c) => c.url).join()).slice(0, 8)}`,
      type: 'docs',
      title: `官方文档变动：${bits.join(' · ')}`,
      url: changed[0]?.url ? new URL(changed[0].url, DOCS_ORIGIN).href : 'https://deepseek-harness.github.io/deepseek-harness/',
      date: now.toISOString(),
      summary: [...changed, ...added].slice(0, 6).map((page) => page.title).join('、') + (changed.length + added.length > 6 ? ' 等' : ''),
      tags: ['文档'],
      source: '官方文档',
    })
  }

  state.docs = nextDocs
  const total = Object.keys(nextDocs).length
  return {
    status: failures > 0 ? 'degraded' : 'ok',
    http: status,
    items: total,
    note: firstRun ? `建立基线 ${total} 页` : `${total} 页 · 更新 ${changed.length} · 新增 ${added.length}${failures ? ` · 失败 ${failures}` : ''}`,
  }
}

/* ---------------------------- community ---------------------------- */
async function crawlPlugins(state) {
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  const [updatedRes, popularRes] = await Promise.all([
    fetchText(PLUGIN_UPDATED, { headers }),
    fetchText(PLUGIN_POPULAR, { headers }),
  ])
  if (updatedRes.status !== 200) throw Object.assign(new Error(`GitHub repositories ${updatedRes.status}`), { status: updatedRes.status })
  const updatedPayload = JSON.parse(updatedRes.text)
  const normalize = (item) => ({
    fullName: item.full_name,
    name: item.name,
    url: item.html_url,
    description: stripTags(item.description || ''),
    stars: item.stargazers_count ?? 0,
    language: item.language || '',
    updatedAt: item.updated_at,
    topics: (item.topics || []).slice(0, 4),
  })
  const recent = (updatedPayload.items ?? []).map(normalize)
  let featured = recent.slice(0, 9)
  if (popularRes.status === 200) {
    const popular = (JSON.parse(popularRes.text).items ?? []).map(normalize)
    const relevant = popular.filter((plugin) => /dsh|deepseek|harness/i.test(`${plugin.fullName} ${plugin.description}`))
    featured = (relevant.length >= 4 ? relevant : popular).slice(0, 9)
  }

  const known = new Set((state.plugins?.recent ?? []).map((plugin) => plugin.fullName))
  const fresh = recent.filter((plugin) => !known.has(plugin.fullName))
  const today = shortDate(now.toISOString())
  let lastEventDate = state.plugins?.lastEventDate ?? null
  if (fresh.length && known.size > 0 && lastEventDate !== today) {
    newEvents.push({
      id: `plugins-${today}-${hash(fresh.map((plugin) => plugin.fullName).join()).slice(0, 6)}`,
      type: 'community',
      title: `社区插件雷达：${fresh.length} 个新项目`,
      url: 'https://github.com/topics/dsh-plugin',
      date: now.toISOString(),
      summary: fresh.slice(0, 4).map((plugin) => plugin.fullName).join('、'),
      tags: ['社区', '插件'],
      source: 'GitHub Topics',
    })
    lastEventDate = today
  }

  state.plugins = {
    recent,
    featured,
    total: updatedPayload.total_count ?? recent.length,
    checkedAt: now.toISOString(),
    lastEventDate,
  }
  return {
    status: popularRes.status === 200 ? 'ok' : 'degraded',
    http: updatedRes.status,
    items: recent.length,
    note: `${updatedPayload.total_count ?? recent.length} 个插件 · 最近更新 ${recent.length}`,
  }
}

async function crawlCommunity(state) {
  try {
    const { text, status } = await fetchText(ISSUE_SEARCH, {
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    })
    if (status !== 200) throw Object.assign(new Error(`GitHub search ${status}`), { status })
    const data = JSON.parse(text)
    const issues = (data.items ?? []).map((issue) => ({
      id: issue.id,
      title: issue.title,
      url: issue.html_url,
      date: issue.updated_at,
      state: issue.state,
      comments: issue.comments,
    }))
    const known = new Set((state.community?.issues ?? []).map((issue) => issue.id))
    for (const issue of issues.filter((issue) => !known.has(issue.id)).slice(0, 5)) {
      newEvents.push({
        id: `issue-${issue.id}`,
        type: 'community',
        title: `社区议题：${issue.title}`,
        url: issue.url,
        date: issue.date,
        summary: `${issue.state === 'open' ? '开放中' : '已关闭'} · ${issue.comments} 条讨论`,
        tags: ['社区', 'GitHub'],
        source: 'GitHub Issues',
      })
    }
    state.community = { issues, checkedAt: now.toISOString(), total: data.total_count ?? issues.length }
    return { status: 'ok', http: status, items: issues.length, note: `${data.total_count ?? issues.length} 个议题 · 最近 ${issues.length} 条` }
  } catch (error) {
    // 社区数据不是关键路径：API 限流时保留精选 FAQ，并标记降级。
    state.community = { ...(state.community ?? {}), checkedAt: now.toISOString(), degraded: true }
    return { status: 'degraded', http: error.status ?? 0, items: 0, note: 'API 限流，使用精选 FAQ 兜底' }
  }
}

/* ------------------------------- main ------------------------------ */
async function main() {
  log('')
  log('  DSH Academy · 内容巡检')
  log('  ' + '─'.repeat(64))
  await ensureDir(PATHS.data)
  await ensureDir(PATHS.reports)
  await ensureDir(path.join(PATHS.root, 'data'))

  const state = (await readJson(PATHS.state, null)) ?? {
    released: [],
    docs: {},
    npm: null,
    community: null,
    plugins: null,
  }
  if (!state.releases) state.releases = []
  if (!state.docs) state.docs = {}

  if (!(await fileExists(path.join(PATHS.data, 'updates.json')))) {
    await writeJson(path.join(PATHS.data, 'updates.json'), [])
  }

  await runSource('npm', 'npm Registry', () => crawlNpm(state))
  await runSource('releases', 'GitHub Releases', () => crawlReleases(state))
  await runSource('docs', '官方文档', () => crawlDocs(state))
  await runSource('community', '社区议题', () => crawlCommunity(state))
  await runSource('plugins', '社区插件', () => crawlPlugins(state))

  const updatesFile = path.join(PATHS.data, 'updates.json')
  const existing = (await readJson(updatesFile, [])) ?? []
  const seen = new Set(existing.map((event) => event.id))
  const additions = newEvents.filter((event) => !seen.has(event.id))
  const all = [...additions, ...existing]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 300)

  const docsIndex = Object.values(state.docs ?? {})
    .map(({ title, url, category }) => ({ title, url, category }))
    .sort((a, b) => a.category.localeCompare(b.category, 'zh-CN') || a.title.localeCompare(b.title, 'zh-CN'))

  const failedCritical = results.filter((result) => ['npm', 'releases', 'docs'].includes(result.id) && result.status === 'fail').length
  const status = failedCritical >= 2 ? 'offline' : results.some((result) => result.status !== 'ok') ? 'degraded' : 'ok'
  const nextRun = addDays(now, 3)
  nextRun.setHours(3, 0, 0, 0)

  const meta = {
    lastRun: now.toISOString(),
    nextRun: nextRun.toISOString(),
    schedule: '每 3 天 03:00（本机计划任务）/ GitHub Actions cron',
    durationMs: Date.now() - startedAt,
    status,
    version: state.npm?.latest ?? '0.2.2-rc.1',
    previousVersion: state.npm?.previous ?? null,
    docPages: docsIndex.length,
    docCategories: [...new Set(docsIndex.map((page) => page.category))].length,
    pluginTotal: state.plugins?.total ?? 0,
    newEvents: additions.length,
    totalEvents: all.length,
    sources: results,
    changes: additions.slice(0, 8).map(({ type, title, url }) => ({ type, title, url })),
    stats: {
      courses: 8,
      faqs: 14,
      scenarios: 6,
    },
  }

  await writeJson(updatesFile, all)
  await writeJson(path.join(PATHS.data, 'docs.json'), { updatedAt: now.toISOString(), pages: docsIndex })
  await writeJson(path.join(PATHS.data, 'plugins.json'), {
    updatedAt: now.toISOString(),
    total: state.plugins?.total ?? 0,
    featured: state.plugins?.featured ?? [],
    recent: state.plugins?.recent ?? [],
  })
  await writeJson(path.join(PATHS.data, 'meta.json'), meta)
  await writeJson(path.join(PATHS.data, 'crawl-report.json'), {
    ...meta,
    results,
    additions,
  })
  await writeJson(path.join(PATHS.root, 'data', 'state.json'), state)

  const stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  await writeJson(path.join(PATHS.reports, `crawl-${stamp}.json`), { ...meta, additions })
  await writeJson(path.join(PATHS.reports, 'crawl-latest.json'), { ...meta, additions })

  log('  ' + '─'.repeat(64))
  log(`  新增事件 ${additions.length} 条 · 时间线共 ${all.length} 条 · 用时 ${((Date.now() - startedAt) / 1000).toFixed(1)}s`)
  log(`  下次巡检：${nextRun.toLocaleString('zh-CN', { hour12: false })}`)
  log('')

  if (failedCritical >= 2) process.exitCode = 1
}

async function fileExists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

main().catch((error) => {
  console.error('\n  巡检失败：', error)
  process.exitCode = 1
})
