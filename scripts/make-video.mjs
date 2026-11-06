#!/usr/bin/env node
/**
 * 生成平台导览视频与封面图（纯 ffmpeg，无需浏览器录屏）。
 * 产物：site/assets/video/dsh-academy.mp4、site/assets/img/hero-poster.jpg
 */
import { execFileSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { PATHS, ensureDir } from './lib/common.mjs'

const WORK = path.join(PATHS.root, '.video-work')
const OUT_VIDEO = path.join(PATHS.assets, 'video', 'dsh-academy.mp4')
const OUT_LOOP = path.join(PATHS.assets, 'video', 'hero-loop.mp4')
const OUT_POSTER = path.join(PATHS.assets, 'img', 'tour-poster.jpg')
const OUT_HERO_POSTER = path.join(PATHS.assets, 'img', 'hero-poster.jpg')
const W = 1920
const H = 1080
const DURATION = 30

const texts = {}

function textFile(name, content) {
  texts[name] = content
  return `${name}.txt`
}

/* ------------------------------- 文案与排版 ------------------------------- */
const brand = textFile('t-brand', 'D S H   A C A D E M Y')
const topRight = textFile('t-topright', 'DEEPSEEK HARNESS  ·  2026')
const footLeft = textFile('t-footleft', '每 3 天自动巡检  ·  一条命令部署')
const footRight = textFile('t-footright', 'dsh-academy.local')
const heroKicker = textFile('t-hero-kicker', '中 文 教 学 与 自 动 化 实 践')
const hero1 = textFile('t-hero1', '把 DeepSeek Harness 学透')
const hero2 = textFile('t-hero2', '也把它部署上线')
const heroMeta = textFile('t-hero-meta', '8 门课程  ·  6 个实战场景  ·  每 3 天自动更新的内容雷达')
const heroVersion = textFile('t-hero-version', '基于 DeepSeek Harness 0.2.2  ·  零运行时依赖')

const pluginTitle = textFile('t-plugin-title', '一切皆插件')
const pluginSub = textFile('t-plugin-sub', '模型  ·  工具  ·  技能  ·  界面，全部可替换')
const pluginFoot = textFile('t-plugin-foot', 'CORDIS 组合树  /  热重载  /  版本化配置')

const termTitle = textFile('t-term-title', 'dsh — PowerShell')
const termLines = [
  textFile('t-term1', 'PS> npx @deepseek-ai/dsh web'),
  textFile('t-term2', '    OK  profile web ready'),
  textFile('t-term3', '    ->  http://127.0.0.1:3080'),
  textFile('t-term4', 'PS> node scripts/crawl.mjs'),
  textFile('t-term5', '    OK  95 docs  /  12 releases  /  0 failed'),
  textFile('t-term6', 'PS> npm run ship'),
  textFile('t-term7', '    OK  build 0.6 MB  ->  deployed'),
]

const pathKicker = textFile('t-path-kicker', 'L E A R N   ·   P R A C T I C E   ·   S H I P')
const pathTitle = textFile('t-path-title', '从会用到能交付')
const pathLabel1 = textFile('t-path-label1', '系统课程')
const pathLabel2 = textFile('t-path-label2', '实战场景')
const pathLabel3 = textFile('t-path-label3', '修复手册')
const pathNum1 = textFile('t-path-num1', '08')
const pathNum2 = textFile('t-path-num2', '06')
const pathNum3 = textFile('t-path-num3', '14')
const pathFoot = textFile('t-path-foot', '课程  →  场景  →  部署，一条完整路径')

const outro1 = textFile('t-outro1', '每 3 天，自动更新')
const outro2 = textFile('t-outro2', '一条命令，部署上线')
const outroPipe = textFile('t-outro-pipe', 'crawl  →  build  →  verify  →  deploy')
const outroBrand = textFile('t-outro-brand', 'D S H   A C A D E M Y   ·   2 0 2 6')

/* -------------------------------- filter -------------------------------- */
function fadeAlpha(start, end, fade = 0.7) {
  return `'if(lt(t,${start}),0,if(lt(t,${start + fade}),(t-${start})/${fade},if(lt(t,${end - fade}),1,if(lt(t,${end}),(${end}-t)/${fade},0))))'`
}

function dt({ file, font = 'msyhbd.ttc', size = 32, color = '0xffffff', x = 0, y = 0, start = 0, end = DURATION, center = false, fade = 0.7, alpha = null }) {
  const xExpr = center ? '(w-tw)/2' : String(Math.round(x))
  const alphaExpr = alpha ?? fadeAlpha(start, end, fade)
  return `drawtext=fontfile=${font}:textfile=${file}:fontsize=${size}:fontcolor=${color}:x=${xExpr}:y=${Math.round(y)}:enable='between(t,${start},${end})':alpha=${alphaExpr}:shadowcolor=0x000000@0.35:shadowx=0:shadowy=3`
}

function mono({ file, size = 28, color = '0xdbe7ff', x = 0, y = 0, start = 0, end = DURATION, fade = 0.4 }) {
  return dt({ file, font: 'consola.ttf', size, color, x, y, start, end, fade })
}

const slides = []

/* 片头 0 - 5.8 */
slides.push(
  dt({ file: heroKicker, size: 22, color: '0x7b8db0', x: 0, y: 336, center: true, start: 0.45, end: 5.8 }),
  dt({ file: hero1, size: 94, color: '0xf2f6ff', x: 0, y: 398, center: true, start: 0.7, end: 5.8 }),
  dt({ file: hero2, size: 94, color: '0x8fb2ff', x: 0, y: 520, center: true, start: 0.95, end: 5.8 }),
  dt({ file: heroMeta, size: 27, color: '0x97a6bf', x: 0, y: 672, center: true, start: 1.25, end: 5.8, fade: 0.6 }),
  dt({ file: heroVersion, size: 20, color: '0x667792', x: 0, y: 730, center: true, start: 1.5, end: 5.8, fade: 0.6 }),
)

/* 一切皆插件 5.8 - 11.6 */
slides.push(
  dt({ file: pluginTitle, size: 104, color: '0xf2f6ff', x: 260, y: 360, start: 6.1, end: 11.6 }),
  dt({ file: pluginSub, size: 38, color: '0xa9b8d4', x: 264, y: 512, start: 6.4, end: 11.6 }),
  dt({ file: pluginFoot, size: 24, color: '0x7b8db0', x: 264, y: 596, start: 6.75, end: 11.6 }),
  // 装饰性三条竖线
  `drawbox=x=260:y=690:w=1:h=110:color=0x5b8cff@0.55:t=fill:enable='between(t,6.6,11.6)'`,
  `drawbox=x=284:y=690:w=1:h=110:color=0x8b5cf6@0.35:t=fill:enable='between(t,6.6,11.6)'`,
  `drawbox=x=308:y=690:w=1:h=110:color=0x22d3ee@0.25:t=fill:enable='between(t,6.6,11.6)'`,
)

/* 终端 11.6 - 17.6 */
const termStart = 11.9
slides.push(
  dt({ file: textFile('t-term-kicker', '从 第 一 条 命 令 开 始'), size: 24, color: '0x8fb2ff', x: 260, y: 190, start: 11.9, end: 17.6 }),
  `drawbox=x=240:y=250:w=1440:h=560:color=0x04090f@0.86:t=fill:enable='between(t,11.8,17.6)'`,
  `drawbox=x=240:y=250:w=1440:h=560:color=0x5b8cff@0.30:t=2:enable='between(t,11.8,17.6)'`,
  `drawbox=x=240:y=250:w=1440:h=48:color=0x0b1422@0.98:t=fill:enable='between(t,11.8,17.6)'`,
  `drawbox=x=266:y=268:w=12:h=12:color=0xff5f57@0.95:t=fill:enable='between(t,11.8,17.6)'`,
  `drawbox=x=288:y=268:w=12:h=12:color=0xfebc2e@0.95:t=fill:enable='between(t,11.8,17.6)'`,
  `drawbox=x=310:y=268:w=12:h=12:color=0x28c840@0.95:t=fill:enable='between(t,11.8,17.6)'`,
  dt({ file: termTitle, font: 'consola.ttf', size: 19, color: '0x7b8db0', x: 350, y: 262, start: 11.9, end: 17.6, fade: 0.4 }),
)
termLines.forEach((file, index) => {
  const start = termStart + 0.25 + index * 0.52
  slides.push(mono({ file, size: index === 0 || index === 3 || index === 6 ? 30 : 28, color: index === 1 || index === 2 || index === 5 || index === 6 ? '0x67e8b9' : '0xdbe7ff', x: 300, y: 340 + index * 60, start, end: 17.6, fade: 0.35 }))
})

/* 路径 17.6 - 23.4 */
slides.push(
  dt({ file: pathKicker, size: 22, color: '0x8fb2ff', x: 0, y: 290, center: true, start: 17.9, end: 23.4 }),
  dt({ file: pathTitle, size: 96, color: '0xf2f6ff', x: 0, y: 344, center: true, start: 18.1, end: 23.4 }),
)
const cols = [
  [pathNum1, pathLabel1, 560],
  [pathNum2, pathLabel2, 960],
  [pathNum3, pathLabel3, 1360],
]
cols.forEach(([num, label, x], index) => {
  slides.push(
    dt({ file: num, size: 64, color: '0x8fb2ff', x, y: 526, center: false, start: 18.5 + index * 0.18, end: 23.4 }),
    dt({ file: label, size: 22, color: '0x97a6bf', x: x + 3, y: 610, start: 18.6 + index * 0.18, end: 23.4 }),
  )
})
slides.push(dt({ file: pathFoot, size: 26, color: '0x667792', x: 0, y: 742, center: true, start: 19.2, end: 23.4 }))

/* 结尾 23.4 - 30 */
slides.push(
  dt({ file: outro1, size: 82, color: '0xf2f6ff', x: 0, y: 356, center: true, start: 23.8, end: 29.2 }),
  dt({ file: outro2, size: 82, color: '0x8fb2ff', x: 0, y: 476, center: true, start: 24.05, end: 29.2 }),
  dt({ file: outroPipe, font: 'consola.ttf', size: 26, color: '0x9fb0cb', x: 0, y: 620, center: true, start: 24.5, end: 29.2 }),
  dt({ file: outroBrand, size: 22, color: '0x667792', x: 0, y: 700, center: true, start: 24.9, end: 29.2 }),
)

/* 常驻元素 */
slides.unshift(
  dt({ file: brand, size: 17, color: '0x7f93b5', x: 80, y: 56, start: 0, end: DURATION, alpha: `'0.9'` }),
  dt({ file: footLeft, size: 15, color: '0x5d6d88', x: 80, y: 1022, start: 0, end: DURATION, alpha: `'0.8'` }),
)
// 右对齐的常驻文本
slides.push(
  `drawtext=fontfile=consola.ttf:textfile=${topRight}:fontsize=13:fontcolor=0x5d6d88:x=w-tw-80:y=58:alpha='0.85'`,
  `drawtext=fontfile=consola.ttf:textfile=${footRight}:fontsize=14:fontcolor=0x4f5f7a:x=w-tw-80:y=1022:alpha='0.8'`,
)

const filter = [
  'drawgrid=w=96:h=96:t=1:c=0x8fb2ff@0.04',
  'vignette=PI/4',
  `drawbox=x=0:y=${H - 5}:w=iw:h=5:color=0x000000@0.5:t=fill`,
  `drawbox=x=0:y=${H - 5}:w='iw*t/${DURATION}':h=3:color=0x5b8cff@0.85:t=fill`,
  'fade=t=in:st=0:d=0.6',
  'fade=t=out:st=28.4:d=1.6',
  ...slides,
].join(',')

/* -------------------------------- 执行 --------------------------------- */
async function main() {
  await ensureDir(WORK)
  await ensureDir(path.dirname(OUT_VIDEO))
  await ensureDir(path.dirname(OUT_POSTER))

  for (const [name, content] of Object.entries(texts)) {
    await fs.writeFile(path.join(WORK, `${name}.txt`), content, 'utf8')
  }
  await fs.writeFile(path.join(WORK, 'filter.txt'), filter, 'utf8')

  const fontDir = 'C:\\Windows\\Fonts'
  for (const [source, target] of [
    ['msyh.ttc', 'msyh.ttc'],
    ['msyhbd.ttc', 'msyhbd.ttc'],
    ['consola.ttf', 'consola.ttf'],
  ]) {
    await fs.copyFile(path.join(fontDir, source), path.join(WORK, target))
  }

  console.log('  渲染 1920x1080 / 30s 导览视频…')
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      `gradients=s=${W}x${H}:r=30:c0=0x04070e:c1=0x0a1730:c2=0x180b2c:c3=0x04121f:nb_colors=4:speed=0.02:type=radial:d=${DURATION}`,
      '-vf',
      filter,
      '-t',
      String(DURATION),
      '-r',
      '30',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      OUT_VIDEO,
    ],
    { cwd: WORK, stdio: 'inherit' },
  )

  console.log('  生成封面图…')
  execFileSync(
    'ffmpeg',
    ['-y', '-hide_banner', '-loglevel', 'error', '-ss', '3.8', '-i', OUT_VIDEO, '-frames:v', '1', '-q:v', '3', OUT_POSTER],
    { stdio: 'inherit' },
  )

  console.log('  渲染首页无文字背景循环…')
  const loopFilter = [
    'drawgrid=w=96:h=96:t=1:c=0x8fb2ff@0.05',
    'vignette=PI/4',
    'eq=brightness=0.0:saturation=1.05',
    'format=yuv420p',
  ].join(',')
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      `gradients=s=${W}x${H}:r=30:c0=0x04070e:c1=0x0a1730:c2=0x180b2c:c3=0x04121f:nb_colors=4:speed=0.03:type=radial:d=12`,
      '-vf',
      loopFilter,
      '-t',
      '12',
      '-r',
      '30',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '27',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      OUT_LOOP,
    ],
    { cwd: WORK, stdio: 'inherit' },
  )
  execFileSync(
    'ffmpeg',
    ['-y', '-hide_banner', '-loglevel', 'error', '-ss', '2.4', '-i', OUT_LOOP, '-frames:v', '1', '-q:v', '4', OUT_HERO_POSTER],
    { stdio: 'inherit' },
  )

  const videoSize = (await fs.stat(OUT_VIDEO)).size
  const loopSize = (await fs.stat(OUT_LOOP)).size
  const posterSize = (await fs.stat(OUT_POSTER)).size
  console.log(`  视频 ${(videoSize / 1024 / 1024).toFixed(1)} MB · 背景循环 ${(loopSize / 1024 / 1024).toFixed(1)} MB · 封面 ${(posterSize / 1024).toFixed(0)} KB`)
}

main().catch((error) => {
  console.error('  视频生成失败：', error)
  process.exitCode = 1
})
