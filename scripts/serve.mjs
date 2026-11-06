#!/usr/bin/env node
/**
 * 零依赖静态服务器：本地预览 / 内网托管。
 * 用法：node scripts/serve.mjs [--port 4173] [--host 127.0.0.1]
 */
import http from 'node:http'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { createReadStream } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { PATHS } from './lib/common.mjs'

const args = process.argv.slice(2)
function argValue(name, fallback) {
  const index = args.indexOf(name)
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback
}

const port = Number(argValue('--port', process.env.PORT || 4173))
const host = argValue('--host', process.env.HOST || '127.0.0.1')
const base = (process.env.SITE_BASE_PATH || '').replace(/\/$/, '')
const root = PATHS.dist

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
}
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.svg', '.webmanifest'])

async function resolveFile(urlPath) {
  let pathname
  try {
    pathname = decodeURIComponent(urlPath.split('?')[0])
  } catch {
    return null
  }
  if (base && pathname.startsWith(base)) pathname = pathname.slice(base.length) || '/'
  if (!pathname.startsWith('/')) pathname = `/${pathname}`
  const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  let file = path.join(root, safe)
  if (!file.startsWith(root)) return null
  try {
    const stat = await fs.stat(file)
    if (stat.isDirectory()) file = path.join(file, 'index.html')
  } catch {
    if (!path.extname(file)) file = path.join(root, safe, 'index.html')
  }
  try {
    const stat = await fs.stat(file)
    if (!stat.isFile()) return null
    return { file, stat }
  } catch {
    return null
  }
}

const server = http.createServer(async (request, response) => {
  const started = Date.now()
  if (request.url === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ status: 'ok', time: new Date().toISOString(), base: base || '/' }))
    return
  }
  const found = await resolveFile(request.url || '/')
  if (!found) {
    const notFound = path.join(root, '404.html')
    try {
      const body = await fs.readFile(notFound)
      response.writeHead(404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
      response.end(request.method === 'HEAD' ? undefined : body)
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      response.end('404 Not Found')
    }
    return
  }

  const ext = path.extname(found.file).toLowerCase()
  const contentType = MIME[ext] || 'application/octet-stream'
  const headers = {
    'content-type': contentType,
    'x-content-type-options': 'nosniff',
    'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
  }

  if (request.method === 'HEAD') {
    response.writeHead(200, { ...headers, 'content-length': found.stat.size })
    response.end()
    return
  }

  const acceptGzip = String(request.headers['accept-encoding'] || '').includes('gzip')
  if (COMPRESSIBLE.has(ext) && acceptGzip && found.stat.size > 1024) {
    const raw = await fs.readFile(found.file)
    const compressed = gzipSync(raw, { level: 6 })
    response.writeHead(200, { ...headers, 'content-encoding': 'gzip', 'content-length': compressed.length, vary: 'accept-encoding' })
    response.end(compressed)
  } else {
    response.writeHead(200, { ...headers, 'content-length': found.stat.size })
    createReadStream(found.file).pipe(response)
  }
  if (process.env.DSH_ACADEMY_LOG === '1') {
    console.log(`${request.method} ${request.url} ${response.statusCode} ${Date.now() - started}ms`)
  }
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n  端口 ${port} 已被占用。换一个：node scripts/serve.mjs --port 4174\n`)
  } else {
    console.error(error)
  }
  process.exit(1)
})

server.listen(port, host, () => {
  console.log('')
  console.log('  DSH Academy · 本地预览')
  console.log('  ' + '─'.repeat(56))
  console.log(`  → http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}${base || ''}/`)
  console.log(`  根目录：${root}`)
  console.log(`  健康检查：http://127.0.0.1:${port}/healthz`)
  console.log('  Ctrl+C 停止')
  console.log('')
})
