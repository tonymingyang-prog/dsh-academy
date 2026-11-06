#!/usr/bin/env node
/**
 * 一键部署：local / github / netlify / docker
 *
 * 示例：
 *   node scripts/deploy.mjs --target local --port 4173
 *   $env:GITHUB_TOKEN="ghp_..."; $env:GITHUB_REPO="you/dsh-academy"
 *   node scripts/deploy.mjs --target github --branch gh-pages
 *   $env:NETLIFY_AUTH_TOKEN="..."; $env:NETLIFY_SITE_ID="..."
 *   node scripts/deploy.mjs --target netlify
 */
import { execFileSync, spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { PATHS, ensureDir } from './lib/common.mjs'

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const index = args.indexOf(name)
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback
}
const has = (name) => args.includes(name)
const target = getArg('--target', 'local')
const port = getArg('--port', process.env.PORT || '4173')
const branch = getArg('--branch', process.env.GITHUB_BRANCH || 'gh-pages')
const dryRun = has('--dry-run')

const log = (...values) => console.log(...values)
const fail = (message) => {
  console.error(`\n  ✗ ${message}\n`)
  process.exit(1)
}

async function ensureBuild() {
  if (has('--no-build')) return
  try {
    await fs.access(path.join(PATHS.dist, 'index.html'))
  } catch {
    log('  未发现 dist/，先执行构建…')
    execFileSync(process.execPath, [path.join(PATHS.root, 'scripts', 'build.mjs')], { cwd: PATHS.root, stdio: 'inherit' })
  }
}

async function walk(dir, prefix = '') {
  const files = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name === '.nojekyll') continue
    const full = path.join(dir, entry.name)
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...(await walk(full, rel)))
    else files.push({ file: full, rel })
  }
  return files
}

/* --------------------------------- local --------------------------------- */
async function deployLocal() {
  if (has('--stop')) {
    const pidFile = path.join(PATHS.root, 'data', 'server.pid')
    try {
      const pid = Number(JSON.parse(await fs.readFile(pidFile, 'utf8')).pid)
      process.kill(pid)
      await fs.rm(pidFile, { force: true })
      log(`  已停止本地服务（PID ${pid}）`)
    } catch {
      log('  没有找到正在运行的本地服务。')
    }
    return
  }

  try {
    await fs.access(path.join(PATHS.dist, 'index.html'))
  } catch {
    fail('dist/index.html 不存在，请先运行 npm run build')
  }

  const response = await fetch(`http://127.0.0.1:${port}/healthz`).catch(() => null)
  if (response?.ok) {
    log(`  端口 ${port} 已有服务在运行：http://127.0.0.1:${port}/`)
    return
  }

  const child = spawn(process.execPath, [path.join(PATHS.root, 'scripts', 'serve.mjs'), '--port', String(port)], {
    cwd: PATHS.root,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
    windowsHide: true,
  })
  child.unref()
  await ensureDir(path.join(PATHS.root, 'data'))
  await fs.writeFile(
    path.join(PATHS.root, 'data', 'server.pid'),
    `${JSON.stringify({ pid: child.pid, port: Number(port), startedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  )

  let healthy = false
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 250))
    const check = await fetch(`http://127.0.0.1:${port}/healthz`).catch(() => null)
    if (check?.ok) {
      healthy = true
      break
    }
  }
  if (!healthy) fail(`服务没有在端口 ${port} 上就绪，请查看日志或换一个端口。`)
  log('')
  log(`  ✓ 已启动：http://127.0.0.1:${port}/`)
  log(`  PID 写入 data/server.pid；停止：node scripts/deploy.mjs --target local --stop`)
}

/* -------------------------------- github --------------------------------- */
async function api(urlPath, options = {}) {
  const token = process.env.GITHUB_TOKEN
  const response = await fetch(`https://api.github.com${urlPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'dsh-academy-deploy',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : {}
  if (!response.ok) {
    const hint = response.status === 403 ? '（token 缺少 repo 权限，或被限流）' : ''
    throw new Error(`${options.method || 'GET'} ${urlPath} → ${response.status} ${data.message || ''}${hint}`)
  }
  return data
}

async function deployGitHub() {
  const token = process.env.GITHUB_TOKEN
  const repo = getArg('--repo', process.env.GITHUB_REPO) || 'owner/repo'

  const files = await walk(PATHS.dist)
  const totalBytes = (await Promise.all(files.map(async (item) => (await fs.stat(item.file)).size))).reduce((a, b) => a + b, 0)
  log(`  目标仓库 ${repo} · 分支 ${branch} · ${files.length} 个文件 · ${(totalBytes / 1024 / 1024).toFixed(1)} MB`)

  if (dryRun) {
    for (const item of files.slice(0, 20)) log(`    ${item.rel}`)
    if (files.length > 20) log(`    … 其余 ${files.length - 20} 个文件`)
    log('  dry-run 完成，未调用 GitHub API。')
    return
  }

  if (!token) fail('缺少 GITHUB_TOKEN 环境变量（需要 repo 权限的 PAT）。')
  if (!repo.includes('/')) fail('缺少仓库参数：--repo owner/name 或 GITHUB_REPO。')

  const user = await api('/user')
  log(`  已认证：${user.login}`)
  const repoInfo = await api(`/repos/${repo}`)
  let headSha
  try {
    const ref = await api(`/repos/${repo}/git/ref/heads/${branch}`)
    headSha = ref.object.sha
  } catch (error) {
    if (!String(error.message).includes('404')) throw error
    const baseRef = await api(`/repos/${repo}/git/ref/heads/${repoInfo.default_branch}`)
    headSha = baseRef.object.sha
    log(`  分支 ${branch} 不存在，将从 ${repoInfo.default_branch} 创建。`)
  }
  const headCommit = await api(`/repos/${repo}/git/commits/${headSha}`)

  const blobs = []
  const concurrency = 5
  for (let index = 0; index < files.length; index += concurrency) {
    const chunk = files.slice(index, index + concurrency)
    const results = await Promise.all(
      chunk.map(async (item) => {
        const content = await fs.readFile(item.file)
        const blob = await api(`/repos/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({ content: content.toString('base64'), encoding: 'base64' }),
        })
        return { path: item.rel, mode: '100644', type: 'blob', sha: blob.sha }
      }),
    )
    blobs.push(...results)
    log(`  上传 ${Math.min(index + concurrency, files.length)}/${files.length}`)
  }

  const tree = await api(`/repos/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: blobs }),
  })
  const message = getArg('--message', `chore: publish DSH Academy ${new Date().toISOString().slice(0, 16)}`)
  const commit = await api(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }),
  })

  if (headSha === commit.sha) {
    log('  内容没有变化，跳过提交。')
  } else {
    try {
      await api(`/repos/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: true }),
      })
    } catch (error) {
      if (!/404|422/.test(String(error.message))) throw error
      await api(`/repos/${repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
      })
    }
  }

  const [owner, name] = repo.split('/')
  const url = name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? `https://${owner}.github.io/` : `https://${owner}.github.io/${name}/`
  log('')
  log(`  ✓ 已推送 ${branch} 分支（commit ${commit.sha.slice(0, 7)}）`)
  log(`  访问地址：${url}`)
  log('  首次部署请在仓库 Settings → Pages 选择该分支；之后每次推送自动更新。')
  log(`  仓库：https://github.com/${repo}`)
}

/* -------------------------------- netlify -------------------------------- */
async function deployNetlify() {
  const token = process.env.NETLIFY_AUTH_TOKEN
  const site = getArg('--site', process.env.NETLIFY_SITE_ID)
  if (!token) fail('缺少 NETLIFY_AUTH_TOKEN。')
  if (!site) fail('缺少 NETLIFY_SITE_ID（站点设置 → Site ID）。')

  const zip = path.join(os.tmpdir(), `dsh-academy-${Date.now()}.zip`)
  log('  打包 dist/ …')
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `Compress-Archive -Path '${path.join(PATHS.dist, '*')}' -DestinationPath '${zip}' -Force`,
    ],
    { stdio: 'inherit' },
  )
  const body = await fs.readFile(zip)
  log(`  上传 ${(body.length / 1024 / 1024).toFixed(1)} MB …`)

  const response = await fetch(`https://api.netlify.com/api/v1/sites/${site}/deploys`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/zip' },
    body,
  })
  const deploy = await response.json()
  if (!response.ok) fail(`Netlify 返回 ${response.status}：${deploy.message || JSON.stringify(deploy)}`)
  await fs.rm(zip, { force: true })

  let state = deploy.state
  let current = deploy
  for (let attempt = 0; attempt < 40 && state !== 'ready' && state !== 'error'; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const poll = await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    current = await poll.json()
    state = current.state
  }
  if (state !== 'ready') fail(`部署状态：${state}。请到 Netlify 面板查看日志。`)
  log('')
  log(`  ✓ 部署完成：${current.ssl_url || current.deploy_ssl_url || deploy.deploy_ssl_url}`)
  log(`  管理页：${current.admin_url || ''}`)
}

/* --------------------------------- docker -------------------------------- */
async function deployDocker() {
  const image = getArg('--image', 'dsh-academy')
  try {
    execFileSync('docker', ['--version'], { stdio: 'ignore' })
  } catch {
    fail('未找到 docker 命令。请先安装 Docker Desktop，或改用 --target local。')
  }
  log(`  构建镜像 ${image} …`)
  execFileSync('docker', ['build', '-t', image, '.'], { cwd: PATHS.root, stdio: 'inherit' })
  try {
    execFileSync('docker', ['rm', '-f', image], { stdio: 'ignore' })
  } catch {}
  log('  启动容器…')
  execFileSync('docker', ['run', '-d', '--name', image, '-p', `${port}:80`, '--restart', 'unless-stopped', image], { stdio: 'inherit' })
  log('')
  log(`  ✓ 容器已启动：http://127.0.0.1:${port}/`)
  log(`  查看日志：docker logs -f ${image}`)
}

/* ---------------------------------- main --------------------------------- */
async function main() {
  if (!['local', 'github', 'netlify', 'docker'].includes(target)) {
    fail(`未知 target：${target}。支持 local / github / netlify / docker。`)
  }
  log('')
  log(`  DSH Academy · 部署 → ${target}`)
  log('  ' + '─'.repeat(56))
  await ensureBuild()

  if (!has('--no-verify')) {
    execFileSync(process.execPath, [path.join(PATHS.root, 'scripts', 'verify.mjs')], { cwd: PATHS.root, stdio: 'inherit' })
  }

  if (target === 'local') await deployLocal()
  else if (target === 'github') await deployGitHub()
  else if (target === 'netlify') await deployNetlify()
  else if (target === 'docker') await deployDocker()
  log('')
}

main().catch((error) => {
  console.error(`\n  ✗ 部署失败：${error.message}\n`)
  process.exitCode = 1
})
