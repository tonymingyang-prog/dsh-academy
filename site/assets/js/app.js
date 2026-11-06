/* DSH Academy — interactions. No dependencies. */
;(() => {
  const base = document.body?.dataset.base || ''
  const root = document.documentElement
  const $ = (selector, scope = document) => scope.querySelector(selector)
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)]

  /* --------------------------------- theme -------------------------------- */
  const themeBtn = $('[data-theme-toggle]')
  const sunIcon =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
  const moonIcon =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>'
  function syncThemeIcon() {
    if (!themeBtn) return
    themeBtn.innerHTML = root.dataset.theme === 'light' ? sunIcon : moonIcon
    themeBtn.setAttribute('aria-label', root.dataset.theme === 'light' ? '切换到深色模式' : '切换到浅色模式')
  }
  syncThemeIcon()
  themeBtn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light'
    root.dataset.theme = next
    try {
      localStorage.setItem('dsh-theme', next)
    } catch {}
    syncThemeIcon()
  })

  /* ---------------------------------- nav --------------------------------- */
  const nav = $('#site-nav')
  const menuBtn = $('[data-menu-toggle]')
  const navLinks = $('#nav-links')
  let lastScroll = 0
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12)
    const bar = $('#reading-bar')
    if (bar) {
      const height = document.documentElement.scrollHeight - window.innerHeight
      bar.style.width = height > 0 ? `${Math.min(100, (window.scrollY / height) * 100)}%` : '0%'
    }
    const top = $('[data-scroll-top]')
    if (top) top.classList.toggle('is-visible', window.scrollY > 700)
    lastScroll = window.scrollY
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  menuBtn?.addEventListener('click', () => {
    const open = navLinks?.classList.toggle('is-open')
    menuBtn.setAttribute('aria-expanded', String(Boolean(open)))
    menuBtn.innerHTML = open ? sunClose() : menuIcon()
  })
  function menuIcon() {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'
  }
  function sunClose() {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  }
  $$('.nav-link').forEach((link) => link.addEventListener('click', () => navLinks?.classList.remove('is-open')))
  $('[data-scroll-top]')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))

  /* --------------------------------- reveal ------------------------------- */
  const revealItems = $$('[data-reveal]')
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )
    revealItems.forEach((item) => observer.observe(item))
  } else {
    revealItems.forEach((item) => item.classList.add('is-in'))
  }

  /* -------------------------------- counters ------------------------------ */
  const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
  function animateCount(el) {
    const target = Number(el.dataset.count || 0)
    if (!Number.isFinite(target)) return
    const isCompact = el.dataset.format === 'compact'
    const duration = 1100
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(target * eased)
      el.textContent = isCompact && value >= 1000 ? compact.format(value) : value.toLocaleString('en-US')
      if (progress < 1) requestAnimationFrame(tick)
      else el.textContent = isCompact && target >= 1000 ? compact.format(target) : target.toLocaleString('en-US')
    }
    requestAnimationFrame(tick)
  }
  const countObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              animateCount(entry.target)
              countObserver.unobserve(entry.target)
            }
          }
        },
        { threshold: 0.4 },
      )
    : null
  $$('[data-count]').forEach((el) => (countObserver ? countObserver.observe(el) : animateCount(el)))

  /* -------------------------------- countdown ----------------------------- */
  const countdowns = $$('[data-countdown]')
  function renderCountdowns() {
    for (const el of countdowns) {
      const target = new Date(el.dataset.countdown || '')
      if (Number.isNaN(target.getTime())) {
        el.textContent = '—'
        continue
      }
      const diff = target.getTime() - Date.now()
      if (diff <= 0) {
        el.textContent = '即将执行'
        continue
      }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      el.textContent = days > 0 ? `${days} 天 ${hours} 小时` : `${hours} 小时 ${minutes} 分`
    }
  }
  renderCountdowns()
  if (countdowns.length) setInterval(renderCountdowns, 60000)

  /* ---------------------------------- copy -------------------------------- */
  const toast = $('#toast')
  let toastTimer
  function showToast(message) {
    if (!toast) return
    toast.querySelector('span').textContent = message
    toast.classList.add('is-visible')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800)
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      let ok = false
      try {
        ok = document.execCommand('copy')
      } catch {}
      area.remove()
      return ok
    }
  }
  document.addEventListener('click', async (event) => {
    const copyBtn = event.target.closest('[data-copy]')
    if (copyBtn) {
      const block = copyBtn.closest('.codeblock')
      const text = block?.querySelector('pre')?.innerText ?? ''
      showToast((await copyText(text)) ? '已复制到剪贴板' : '复制失败，请手动选择代码')
      return
    }
    const outBtn = event.target.closest('[data-copy-output]')
    if (outBtn) {
      const text = $('#deploy-output')?.innerText ?? ''
      showToast((await copyText(text)) ? '命令已复制' : '复制失败，请手动选择命令')
    }
  })

  /* --------------------------------- search ------------------------------- */
  const palette = $('#palette')
  const paletteInput = $('#palette-input')
  const paletteResults = $('#palette-results')
  let searchIndex = null
  let activeIndex = 0

  async function loadIndex() {
    if (searchIndex) return searchIndex
    try {
      const response = await fetch(`${base}/search-index.json`, { cache: 'no-cache' })
      if (!response.ok) throw new Error(String(response.status))
      searchIndex = await response.json()
    } catch {
      searchIndex = []
    }
    return searchIndex
  }

  function scoreEntry(entry, query) {
    const title = entry.title.toLowerCase()
    const desc = (entry.desc || '').toLowerCase()
    const tags = (entry.tags || []).join(' ').toLowerCase()
    let score = 0
    if (title === query) score += 100
    if (title.includes(query)) score += 40
    if (tags.includes(query)) score += 14
    if (desc.includes(query)) score += 8
    return score
  }

  function renderResults(query) {
    if (!paletteResults) return
    const q = query.trim().toLowerCase()
    let items
    if (!q) {
      const seen = new Set()
      items = (searchIndex || []).filter((entry) => {
        const key = entry.type + entry.title
        if (seen.has(key)) return false
        seen.add(key)
        return entry.type === '课程' || entry.type === '场景' || entry.type === 'FAQ'
      }).slice(0, 8)
    } else {
      items = (searchIndex || [])
        .map((entry) => ({ entry, score: scoreEntry(entry, q) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => item.entry)
    }
    activeIndex = 0
    if (!items.length) {
      paletteResults.innerHTML = `<div class="palette-empty">没有找到「${escapeHtmlText(query)}」。试试「插件」「沙箱」「部署」。</div>`
      return
    }
    paletteResults.innerHTML = items
      .map(
        (entry, index) => `<a class="palette-item${index === 0 ? ' is-active' : ''}" href="${escapeAttr(entry.url)}" data-palette-item>
        <span class="palette-type">${escapeHtmlText(entry.type)}</span>
        <span style="min-width:0"><span class="pi-title">${escapeHtmlText(entry.title)}</span><span class="pi-desc">${escapeHtmlText(entry.desc || '')}</span></span>
      </a>`,
      )
      .join('')
  }

  function escapeHtmlText(value = '') {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }
  function escapeAttr(value = '') {
    return escapeHtmlText(value).replace(/'/g, '&#39;')
  }

  async function openPalette() {
    if (!palette) return
    palette.classList.add('is-open')
    document.body.classList.add('no-scroll')
    await loadIndex()
    if (paletteInput) {
      paletteInput.value = ''
      paletteInput.focus()
    }
    renderResults('')
  }
  function closePalette() {
    palette?.classList.remove('is-open')
    document.body.classList.remove('no-scroll')
  }
  $$('[data-search-open]').forEach((button) => button.addEventListener('click', openPalette))
  $$('[data-search-close]').forEach((button) => button.addEventListener('click', closePalette))
  paletteInput?.addEventListener('input', () => renderResults(paletteInput.value))
  paletteResults?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-palette-item]')
    if (item) {
      closePalette()
    }
  })
  document.addEventListener('keydown', (event) => {
    const isOpen = palette?.classList.contains('is-open')
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      isOpen ? closePalette() : openPalette()
      return
    }
    if (event.key === 'Escape' && isOpen) {
      closePalette()
      return
    }
    if (!isOpen) return
    const items = $$('[data-palette-item]', paletteResults)
    if (!items.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items.forEach((item, index) => item.classList.toggle('is-active', index === activeIndex))
      items[activeIndex].scrollIntoView({ block: 'nearest' })
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      items[activeIndex]?.click()
    }
  })

  /* ------------------------------- FAQ filter ----------------------------- */
  const faqList = $('[data-faq-list]')
  if (faqList) {
    const search = $('[data-faq-search]')
    const chips = $$('[data-faq-filters] .filter-chip')
    const countEl = $('[data-faq-count]')
    const empty = $('[data-faq-empty]')
    let activeTag = 'all'
    const apply = () => {
      const query = (search?.value || '').trim().toLowerCase()
      let visible = 0
      $$('.faq-item', faqList).forEach((item) => {
        const tags = (item.dataset.tags || '').split(',').filter(Boolean)
        const text = (item.dataset.text || '').toLowerCase()
        const tagOK = activeTag === 'all' || tags.includes(activeTag)
        const textOK = !query || text.includes(query)
        const show = tagOK && textOK
        item.style.display = show ? '' : 'none'
        if (show) visible++
      })
      if (countEl) countEl.textContent = `${visible} 条`
      if (empty) empty.style.display = visible ? 'none' : ''
    }
    chips.forEach((chip) =>
      chip.addEventListener('click', () => {
        chips.forEach((item) => item.classList.remove('is-active'))
        chip.classList.add('is-active')
        activeTag = chip.dataset.tag || 'all'
        apply()
      }),
    )
    search?.addEventListener('input', apply)
    window.addEventListener('hashchange', openHashFaq)
    function openHashFaq() {
      if (!location.hash.startsWith('#faq-')) return
      const target = document.querySelector(location.hash)
      if (target instanceof HTMLDetailsElement) {
        target.open = true
        target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
    openHashFaq()
  }

  /* ------------------------------ course filter --------------------------- */
  const courseGrid = $('[data-course-grid]')
  if (courseGrid) {
    const chips = $$('[data-course-filters] .filter-chip')
    const search = $('[data-course-search]')
    const empty = $('[data-course-empty]')
    let activeLevel = 'all'
    const apply = () => {
      const query = (search?.value || '').trim().toLowerCase()
      let visible = 0
      $$('.course-card', courseGrid).forEach((card) => {
        const levelOK = activeLevel === 'all' || card.dataset.level === activeLevel
        const textOK = !query || (card.dataset.title || '').toLowerCase().includes(query)
        const show = levelOK && textOK
        card.style.display = show ? '' : 'none'
        if (show) visible++
      })
      if (empty) empty.style.display = visible ? 'none' : ''
    }
    chips.forEach((chip) =>
      chip.addEventListener('click', () => {
        chips.forEach((item) => item.classList.remove('is-active'))
        chip.classList.add('is-active')
        activeLevel = chip.dataset.level || 'all'
        apply()
      }),
    )
    search?.addEventListener('input', apply)
  }

  /* --------------------------------- progress ----------------------------- */
  const progressKey = 'dsh-progress'
  let completed = []
  try {
    const raw = JSON.parse(localStorage.getItem(progressKey) || '[]')
    completed = Array.isArray(raw) ? raw : []
  } catch {}
  function saveProgress() {
    try {
      localStorage.setItem(progressKey, JSON.stringify(completed))
    } catch {}
  }
  function refreshProgress() {
    $$('[data-progress]').forEach((bar) => {
      const slug = bar.dataset.progress
      const done = completed.includes(slug)
      bar.style.width = done ? '100%' : '0%'
      const label = $(`[data-progress-label="${slug}"]`)
      if (label) label.textContent = done ? '已完成' : '未开始'
    })
    const lessonBar = $('[data-lesson-progress]')
    const lessonLabel = $('[data-lesson-progress-label]')
    const completeBtn = $('[data-complete]')
    if (lessonBar && completeBtn) {
      const done = completed.includes(completeBtn.dataset.complete)
      lessonBar.style.width = done ? '100%' : '0%'
      if (lessonLabel) lessonLabel.textContent = done ? '100%' : '0%'
      completeBtn.classList.toggle('is-done', done)
      completeBtn.innerHTML = done
        ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m4 12 5 5L20 6"/></svg> 已完成 · 点击撤销'
        : '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m4 12 5 5L20 6"/></svg> 标记本课完成'
    }
  }
  $('[data-complete]')?.addEventListener('click', (event) => {
    const slug = event.currentTarget.dataset.complete
    if (completed.includes(slug)) completed = completed.filter((item) => item !== slug)
    else completed.push(slug)
    saveProgress()
    refreshProgress()
    showToast(completed.includes(slug) ? '已标记完成' : '已取消完成')
  })
  refreshProgress()

  /* ---------------------------------- video -------------------------------- */
  const shell = $('[data-video-shell]')
  const video = $('#intro-video')
  $('[data-play]')?.addEventListener('click', async () => {
    if (!video) return
    try {
      video.controls = true
      await video.play()
      shell?.classList.add('is-playing')
    } catch {
      video.controls = true
    }
  })
  video?.addEventListener('ended', () => {
    shell?.classList.remove('is-playing')
    video.controls = false
  })
  video?.addEventListener('click', () => {
    if (video.paused) {
      video.controls = true
      video.play()
      shell?.classList.add('is-playing')
    } else {
      video.pause()
    }
  })

  /* -------------------------------- deploy wizard ------------------------- */
  const targets = $$('[data-target]')
  if (targets.length) {
    const output = $('#deploy-output')
    const fields = $$('[data-field]')
    let target = 'local'
    const valueOf = (name) => ($(`[data-field="${name}"]`)?.value || '').trim()
    const syncFields = () => {
      $$('[data-show-for]').forEach((field) => {
        field.style.display = field.dataset.showFor === target ? '' : 'none'
      })
    }

    function generate() {
      const port = valueOf('port') || '4173'
      const repo = valueOf('repo') || 'your-name/dsh-academy'
      const branch = valueOf('branch') || 'gh-pages'
      const site = valueOf('site') || 'xxxxxxxx-xxxx-xxxx-xxxx'
      const image = valueOf('image') || 'dsh-academy'
      const repoName = repo.split('/')[1] || 'dsh-academy'
      let text = ''
      if (target === 'local') {
        text = `cd dsh-academy
npm run build
node scripts/deploy.mjs --target local --port ${port}

# 注册每 3 天自动巡检 + 登录自启
powershell -ExecutionPolicy Bypass -File deploy\\register-tasks.ps1

# 访问
# http://127.0.0.1:${port}`
      } else if (target === 'github') {
        text = `cd dsh-academy
$env:GITHUB_TOKEN = "ghp_xxx"
$env:GITHUB_REPO = "${repo}"
$env:SITE_BASE_PATH = "/${repoName}/"   # 用户主页仓库请删除这一行
npm run build
node scripts/deploy.mjs --target github --branch ${branch}

# 部署完成后：仓库 Settings → Pages → Branch: ${branch}`
      } else if (target === 'docker') {
        text = `cd dsh-academy
npm run build
docker build -t ${image} .
docker run -d --name ${image} -p ${port}:80 --restart unless-stopped ${image}

# 访问
# http://127.0.0.1:${port}`
      } else if (target === 'netlify') {
        text = `cd dsh-academy
$env:NETLIFY_AUTH_TOKEN = "nfp_xxx"
$env:NETLIFY_SITE_ID = "${site}"
npm run build
node scripts/deploy.mjs --target netlify

# 站点发布后可在 Netlify 面板绑定域名`
      }
      if (output) output.textContent = text
    }

    targets.forEach((card) =>
      card.addEventListener('click', () => {
        targets.forEach((item) => item.classList.remove('is-active'))
        card.classList.add('is-active')
        target = card.dataset.target
        syncFields()
        generate()
      }),
    )
    fields.forEach((field) => field.addEventListener('input', generate))
    syncFields()
    generate()
  }

  /* -------------------------------- hash open ----------------------------- */
  if (location.hash) {
    const target = document.querySelector(location.hash)
    if (target instanceof HTMLDetailsElement) {
      target.open = true
      setTimeout(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120)
    }
  }
})()
