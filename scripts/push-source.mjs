#!/usr/bin/env node
/**
 * 把项目源码（不含 dist / 构建缓存 / 密钥）提交到 GitHub 主分支。
 * 需要 GITHUB_TOKEN 与 GITHUB_REPO；可选 GITHUB_HOMEPAGE。
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { PATHS } from './lib/common.mjs'

const token = process.env.GITHUB_TOKEN
const repo = process.env.GITHUB_REPO
if (!token || !repo) {
  console.error('缺少 GITHUB_TOKEN / GITHUB_REPO')
  process.exit(1)
}

const api = async (urlPath, options = {}) => {
  const response = await fetch(`https://api.github.com${urlPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'dsh-academy-source',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : {}
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${urlPath} → ${response.status} ${data.message || ''}`)
  return data
}

const EXCLUDE_DIRS = new Set(['.git', 'node_modules', 'dist', '.video-work', 'scripts/video-assets', '.github'])
const EXCLUDE_FILES = new Set(['.github-token', 'msyh.ttc', 'data/server.pid', 'deploy/serve-hidden.vbs'])

async function walk(dir, prefix = '') {
  const files = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      files.push(...(await walk(path.join(dir, entry.name), rel)))
    } else {
      if (EXCLUDE_FILES.has(rel) || rel.startsWith('reports/')) continue
      if (rel.endsWith('.log')) continue
      const stat = await fs.stat(path.join(dir, entry.name))
      if (stat.size > 50 * 1024 * 1024) continue
      files.push({ full: path.join(dir, entry.name), rel, size: stat.size })
    }
  }
  return files
}

async function main() {
  const homepage = process.env.GITHUB_HOMEPAGE
  if (homepage) {
    await api(`/repos/${repo}`, {
      method: 'PATCH',
      body: JSON.stringify({
        homepage,
        description: 'DeepSeek Harness 中文教学平台：课程、场景、自动巡检与一键部署',
      }),
    })
    console.log('repo homepage updated')
  }

  const files = await walk(PATHS.root)
  const total = files.reduce((sum, file) => sum + file.size, 0)
  console.log(`source files: ${files.length} · ${(total / 1024 / 1024).toFixed(1)} MB`)

  const ref = await api(`/repos/${repo}/git/ref/heads/main`)
  const headSha = ref.object.sha
  const headCommit = await api(`/repos/${repo}/git/commits/${headSha}`)

  const tree = []
  const concurrency = 4
  for (let index = 0; index < files.length; index += concurrency) {
    const chunk = files.slice(index, index + concurrency)
    const blobs = await Promise.all(
      chunk.map(async (file) => {
        const content = await fs.readFile(file.full)
        const blob = await api(`/repos/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({ content: content.toString('base64'), encoding: 'base64' }),
        })
        return { path: file.rel, mode: '100644', type: 'blob', sha: blob.sha }
      }),
    )
    tree.push(...blobs)
    console.log(`uploaded ${Math.min(index + concurrency, files.length)}/${files.length}`)
  }

  const newTree = await api(`/repos/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree }),
  })
  const commit = await api(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'feat: import DSH Academy source',
      tree: newTree.sha,
      parents: [headSha],
    }),
  })
  await api(`/repos/${repo}/git/refs/heads/main`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: true }),
  })

  console.log(`✓ source pushed: ${commit.sha.slice(0, 7)}`)
}

main().catch((error) => {
  console.error('source push failed:', error.message)
  process.exitCode = 1
})
