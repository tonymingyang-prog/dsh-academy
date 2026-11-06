import { escapeHtml } from './common.mjs'

/* --------------------------------- icons --------------------------------- */
const paths = {
  logo: '<path d="M7 17V7h4.2a5 5 0 0 1 0 10H7Z"/><path d="M17 7v10"/><path d="M17 12h-3"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8a2 2 0 0 0-3-.2Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.9 7.5-6 11a22 22 0 0 1-4 2Z"/><path d="M9 12H4s.5-2.8 2-4c1.5-1.2 4 0 4 0"/><path d="M12 15v5s2.8-.5 4-2c1.2-1.5 0-4 0-4"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  workflow: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M10 6.5h4a3 3 0 0 1 3 3V14"/><path d="m14 10 3-3 3 3"/>',
  sparkles: '<path d="m12 3 1.8 4.9L19 9.7l-4.4 3.1L15.8 18 12 15.3 8.2 18l1.2-5.2L5 9.7l5.2-1.8L12 3Z"/><path d="M19 3v3M20.5 4.5h-3"/><path d="M5 17v2M6 18H4"/>',
  plug: '<path d="M12 22v-4"/><path d="M8 8V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/><path d="M6 8h12v3a6 6 0 0 1-12 0V8Z"/><path d="M9 14v4M15 14v4"/>',
  terminal: '<path d="m5 8 4 4-4 4"/><path d="M12 16h7"/><rect x="2" y="3" width="20" height="18" rx="3"/>',
  shield: '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5a5.4 5.4 0 0 0-1.5-3.7 5 5 0 0 0-.1-3.6s-1.2-.4-4 1.5a13.4 13.4 0 0 0-7 0C4.6 1.3 3.4 1.7 3.4 1.7a5 5 0 0 0-.1 3.6A5.4 5.4 0 0 0 2 9c0 3.5 3 5.5 6 5.5a4.8 4.8 0 0 0-1 3.5v4"/><path d="M9 19c-3 .9-3-2-4-2.5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  external: '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
  code: '<path d="m8 6-6 6 6 6"/><path d="m16 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  play: '<path d="m6 3 14 9-14 9V3Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  zap: '<path d="M13 2 3 14h8l-1 8 11-13h-8l1-7Z"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
  gitBranch: '<path d="M6 3v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
  cloud: '<path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19h11.5Z"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5"/><path d="M12 12v10"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  command: '<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 0 0 0-6Z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.8"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.8-1.8"/>',
  frame: '<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/>',
}

export function icon(name, className = '') {
  const path = paths[name] || paths.info
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`
}

/* --------------------------------- utils --------------------------------- */
export function u(base, path = '/') {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${cleanBase}${clean}` || '/'
}

export function fmt(n) {
  return Number(n || 0).toLocaleString('en-US')
}

export function tag(text, tone = 'gray') {
  return `<span class="badge" data-tone="${tone}">${escapeHtml(text)}</span>`
}

export function codeBlock(code, lang = 'sh') {
  const content = typeof code === 'string' ? code : code?.content ?? ''
  const kind = typeof code === 'string' ? lang : code?.lang ?? lang
  if (!content) return ''
  const highlighted = escapeHtml(content)
    .replace(/^(\s*)(#|\/\/)(.*)$/gm, '$1<span class="c-comment">$2$3</span>')
    .replace(/^(\s*)(\$|PS&gt;|&gt;)(\s)/gm, '<span class="c-prompt">$1$2</span>$3')
  return `<div class="codeblock">
    <div class="code-head"><span class="code-lang">${escapeHtml(kind)}</span><button class="copy-btn" type="button" data-copy aria-label="复制代码">${icon('copy')}<span>复制</span></button></div>
    <pre><code>${highlighted}</code></pre>
  </div>`
}

export function levelTone(level = '') {
  if (/入门|基础|beginner/i.test(level)) return 'green'
  if (/进阶|intermediate/i.test(level)) return 'blue'
  return 'violet'
}

/* -------------------------------- navbar --------------------------------- */
const navItems = [
  ['home', '首页', '/'],
  ['courses', '课程', '/courses/'],
  ['scenarios', '场景', '/scenarios/'],
  ['updates', '更新', '/updates/'],
  ['faq', 'FAQ', '/faq/'],
  ['deploy', '部署', '/deploy/'],
]

export function navbar({ page, base, meta }) {
  const links = navItems
    .map(([key, label, href]) => `<a class="nav-link${page === key ? ' is-active' : ''}" href="${u(base, href)}">${label}</a>`)
    .join('')
  return `<header class="nav" id="site-nav">
  <div class="container nav-inner">
    <a class="brand" href="${u(base, '/')}" aria-label="DSH Academy 首页">
      <span class="brand-mark">${icon('logo')}</span>
      <span class="brand-name">DSH<span> Academy</span><span class="brand-sub">DeepSeek Harness</span></span>
    </a>
    <nav class="nav-links" id="nav-links" aria-label="主导航">${links}</nav>
    <div class="nav-actions">
      <span class="nav-version" title="当前 DSH 版本">${meta?.version ? `v${escapeHtml(meta.version)}` : 'v0.2.2'} <span class="dot"></span></span>
      <button class="search-btn" type="button" data-search-open aria-label="搜索（Ctrl K）">${icon('search')}<span>搜索</span><kbd>Ctrl K</kbd></button>
      <a class="icon-btn" href="https://github.com/deepseek-ai/deepseek-harness" target="_blank" rel="noreferrer" aria-label="GitHub">${icon('github')}</a>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="切换主题">${icon('moon')}</button>
      <button class="icon-btn menu-btn" type="button" data-menu-toggle aria-label="打开菜单">${icon('menu')}</button>
    </div>
  </div>
</header>`
}

/* --------------------------------- footer -------------------------------- */
export function footer({ base, meta }) {
  const statusText = meta?.status === 'ok' ? '巡检正常' : meta?.status === 'degraded' ? '部分降级' : '待巡检'
  return `<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="${u(base, '/')}">
          <span class="brand-mark">${icon('logo')}</span>
          <span class="brand-name">DSH<span> Academy</span></span>
        </a>
        <p>一座会自己更新的 DeepSeek Harness 中文教学站：课程、场景、社区雷达与一键部署流水线。</p>
      </div>
      <div>
        <h5>学习</h5>
        <div class="footer-links">
          <a href="${u(base, '/courses/')}">全部课程</a>
          <a href="${u(base, '/scenarios/')}">实战场景</a>
          <a href="${u(base, '/faq/')}">常见问题</a>
        </div>
      </div>
      <div>
        <h5>资源</h5>
        <div class="footer-links">
          <a href="${u(base, '/updates/')}">更新雷达</a>
          <a href="${u(base, '/deploy/')}">部署指南</a>
          <a href="https://deepseek-harness.github.io/deepseek-harness/" target="_blank" rel="noreferrer">官方文档 ${icon('arrowUpRight')}</a>
          <a href="https://github.com/deepseek-ai/deepseek-harness" target="_blank" rel="noreferrer">GitHub ${icon('arrowUpRight')}</a>
        </div>
      </div>
      <div>
        <h5>自动巡检</h5>
        <div class="footer-links">
          <a href="${u(base, '/updates/')}#sources">数据源与健康状态</a>
          <a href="${u(base, '/deploy/')}#automation">每 3 天自动更新</a>
          <a href="https://www.deepseek.com/harness/" target="_blank" rel="noreferrer">DeepSeek Harness 官网 ${icon('arrowUpRight')}</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} DSH Academy · 教学站由 DeepSeek Harness 驱动构建</span>
      <span class="footer-status"><span class="dot"></span>${statusText} · ${meta?.lastRun ? `最近巡检 ${new Date(meta.lastRun).toLocaleString('zh-CN', { hour12: false })}` : '等待首次巡检'}</span>
    </div>
  </div>
</footer>`
}

/* --------------------------------- layout -------------------------------- */
export function layout({ site, meta, page, title, description, base = '', body = '', head = '', bodyClass = '' }) {
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`
  const desc = description || site.description
  const assetQuery = site.assetVersion ? `?v=${site.assetVersion}` : ''
  const siteRoot = `${String(site.url || '').replace(/\/$/, '')}${base}`
  return `<!doctype html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${escapeHtml(`${siteRoot}/assets/img/tour-poster.jpg`)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.name)} · 更新雷达" href="${escapeHtml(`${siteRoot}/feed.xml`)}">
<meta name="theme-color" content="#05080f">
<meta name="color-scheme" content="dark light">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5b8cff"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#g)"/><path d="M9 22V10h5.2a6 6 0 0 1 0 12H9Z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 10v12M22 16h-3" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  )}">
<link rel="stylesheet" href="${u(base, '/assets/css/main.css')}${assetQuery}">
<noscript><style>
  .nav-links{display:flex!important;position:static!important;flex-direction:row!important;flex-wrap:wrap;padding:0!important;background:none!important;border:0!important;margin-left:6px!important}
  .search-btn,.menu-btn{display:none!important}
</style></noscript>
<script>
  document.documentElement.classList.add('js');
  (function () {
    try {
      var t = localStorage.getItem('dsh-theme');
      if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
      var done = JSON.parse(localStorage.getItem('dsh-progress') || '[]');
      window.__DSH_PROGRESS__ = Array.isArray(done) ? done : [];
    } catch (e) { window.__DSH_PROGRESS__ = []; }
  })();
</script>
${head}
</head>
<body class="${bodyClass}" data-base="${base}">
<a class="skip-link" href="#main">跳到主要内容</a>
<div class="backdrop" aria-hidden="true"></div>
<div class="reading-bar" id="reading-bar" aria-hidden="true"></div>
${navbar({ page, base, meta })}
${body}
${footer({ base, meta })}
<button class="scroll-top" type="button" data-scroll-top aria-label="回到顶部">${icon('chevronDown')}</button>
<div class="toast" id="toast" role="status" aria-live="polite">${icon('check')}<span></span></div>
<div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="全站搜索">
  <div class="palette-backdrop" data-search-close></div>
  <div class="palette-panel">
    <div class="palette-input-wrap">${icon('search')}<input id="palette-input" type="search" placeholder="搜索课程、场景、FAQ、更新…" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div>
    <div class="palette-results" id="palette-results"></div>
    <div class="palette-foot"><span>↑↓ 选择</span><span>↵ 打开</span><span>Esc 关闭</span></div>
  </div>
</div>
<script src="${u(base, '/assets/js/app.js')}${assetQuery}" defer></script>
${bodyClass === 'home' ? `<script>window.__HOME__ = true;</script>` : ''}
</body>
</html>`
}

/* -------------------------------- snippets ------------------------------- */
export function courseCard(course, base) {
  const steps = course.steps?.length ?? 0
  return `<article class="course-card" data-reveal data-course="${escapeHtml(course.slug)}" data-level="${escapeHtml(course.level || '')}" data-title="${escapeHtml(`${course.title} ${course.summary} ${(course.tags || []).join(' ')}`)}">
  <div class="course-top">
    <span class="course-num">LESSON ${String(course.order ?? 0).padStart(2, '0')}</span>
    ${tag(course.level || '入门', levelTone(course.level))}
  </div>
  <h3><a href="${u(base, `/courses/${course.slug}/`)}">${escapeHtml(course.title)}</a></h3>
  <p class="course-desc">${escapeHtml(course.summary)}</p>
  <div class="course-meta">
    <span>${icon('clock')} ${Number(course.duration || 15)} 分钟</span>
    <span class="sep"></span>
    <span>${steps} 个步骤</span>
  </div>
  <div class="course-foot">
    <a class="course-link" href="${u(base, `/courses/${course.slug}/`)}">开始学习 ${icon('arrowRight')}</a>
    <div>
      <div class="progress"><span data-progress="${escapeHtml(course.slug)}" style="width:0%"></span></div>
      <div class="progress-label" data-progress-label="${escapeHtml(course.slug)}">未开始</div>
    </div>
  </div>
</article>`
}

export function faqItem(faq, index, base, compact = false) {
  const tags = (faq.tags || []).map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join('')
  const fixes = (faq.fix || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('')
  const cmds = (faq.commands || []).map((command) => codeBlock(command)).join('')
  const links = (faq.links || [])
    .map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noreferrer">${escapeHtml(l.label)} ${icon('arrowUpRight')}</a>`)
    .join('')
  return `<details class="faq-item" id="faq-${escapeHtml(faq.id)}" data-tags="${escapeHtml((faq.tags || []).join(','))}" data-text="${escapeHtml(
    `${faq.question} ${faq.answer} ${(faq.tags || []).join(' ')}`,
  )}" ${compact ? '' : 'data-reveal'}>
  <summary>
    <span class="faq-index">${String(index + 1).padStart(2, '0')}</span>
    <span class="faq-q">${escapeHtml(faq.question)}</span>
    ${faq.hot ? `${tag('高频', 'amber')}` : ''}
    <span class="faq-chev">${icon('chevronDown')}</span>
  </summary>
  <div class="faq-body">
    <p class="faq-answer">${escapeHtml(faq.answer)}</p>
    <div class="faq-sub">
      ${faq.cause ? `<div><h5>原因</h5><p>${escapeHtml(faq.cause)}</p></div>` : ''}
      ${fixes ? `<div><h5>处理步骤</h5><ol>${fixes}</ol></div>` : ''}
      ${cmds ? `<div class="faq-commands"><h5>命令</h5>${cmds}</div>` : ''}
      ${tags ? `<div class="faq-sub"><h5>标签</h5><div class="scenario-stack">${tags}</div></div>` : ''}
    </div>
    ${links ? `<div class="faq-links">${links}</div>` : ''}
  </div>
</details>`
}

export function eventItem(event, base) {
  const typeLabel = { release: '版本', docs: '文档', community: '社区', npm: 'npm' }[event.type] || '更新'
  const tags = (event.tags || []).map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join('')
  return `<article class="event" data-type="${escapeHtml(event.type)}">
  <span class="event-dot" aria-hidden="true"></span>
  <div class="event-date">${new Date(event.date).toLocaleDateString('zh-CN')} <span class="badge" data-tone="${event.type === 'docs' ? 'cyan' : event.type === 'community' ? 'violet' : 'blue'}">${typeLabel}</span></div>
  <h3><a href="${escapeHtml(event.url)}" target="_blank" rel="noreferrer">${escapeHtml(event.title)}</a></h3>
  <p>${escapeHtml(event.summary || '')}</p>
  ${tags ? `<div class="event-tags">${tags}</div>` : ''}
</article>`
}
