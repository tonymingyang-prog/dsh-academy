import { escapeHtml } from './lib/common.mjs'
import { codeBlock, courseCard, eventItem, faqItem, fmt, icon, layout, levelTone, tag, u } from './lib/ui.mjs'

const pad = (n) => String(n).padStart(2, '0')

function rich(text = '') {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

const compactFmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/* ---------------------------------- home --------------------------------- */
export function homePage({ site, base, meta, courses, faqs, scenarios, updates, plugins }) {
  const hotFaqs = faqs.filter((faq) => faq.hot).slice(0, 5)
  const preview = hotFaqs.length ? hotFaqs : faqs.slice(0, 5)
  const pluginList = (plugins?.featured ?? []).slice(0, 6)
  const docCount = meta?.docPages ?? 95
  const pluginTotal = meta?.pluginTotal ?? plugins?.total ?? 0

  const features = [
    ['layers', '一切皆插件', 'Cordis 组合树把模型、工具、界面都拆成可替换插件；想改哪一层就换哪一层，而不是 fork 整个项目。'],
    ['terminal', '工具、技能与工作流', 'Shell、文件、浏览器、子智能体与 Workflow 编排，把「会聊天」变成「能交付」。'],
    ['shield', '审批与沙箱', '按工作区粒度控制读写与命令权限，危险操作先审批；远程部署时也能收住边界。'],
    ['cpu', '多模型路由', 'DeepSeek 原生、OpenAI 兼容与 Anthropic Messages 端点都能接；按会话选择模型。'],
    ['globe', 'Web UI 与远程访问', '本机 3080 端口开箱即用；反向代理、公网 URL 与受信 Host 让团队共用一套 Harness。'],
    ['refresh', '可复现的自动化', '定时巡检、无人值守构建、一条命令发布；教学站本身就是这套流程的样板。'],
  ]

  const stages = [
    ['装好', '15 分钟', 'Node 环境、npx 启动、工作区与模型密钥', 'terminal'],
    ['配好', '30 分钟', '审批策略、沙箱、技能与模型路由', 'shield'],
    ['用起来', '2 小时', '目标驱动任务、子智能体、批量工作流', 'workflow'],
    ['上线', '10 分钟', '自动巡检 + 构建 + 部署，一条命令', 'rocket'],
  ]

  const body = `<main id="main">
  <section class="hero">
    <video class="hero-video" autoplay muted loop playsinline poster="${u(base, '/assets/img/hero-poster.jpg')}" aria-hidden="true">
      <source src="${u(base, '/assets/video/hero-loop.mp4')}" type="video/mp4">
    </video>
    <div class="container">
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="status-pill"><span class="pulse"></span> 内容巡检运行中 · 每 <b>3 天</b> 自动更新</div>
          <h1><span>把 DeepSeek Harness</span><em class="gradient-text">学透，也部署上线</em></h1>
          <p class="hero-sub">从第一次 <strong>dsh web</strong>，到插件开发、技能封装、Workflow 编排与自动发布。课程、场景、社区雷达与部署流水线，全部可运行、可复现。</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="${u(base, '/courses/install-first-run/')}">${icon('play')} 开始第一课</a>
            <a class="btn btn-ghost" href="${u(base, '/deploy/')}">${icon('rocket')} 看部署方案</a>
          </div>
          <p class="hero-note">${icon('check')} 基于 DSH ${escapeHtml(meta?.version ?? '0.2.2-rc.1')} · ${docCount} 页官方文档索引 · 无需注册</p>
          <div class="hero-stats">
            <div><div class="stat-value" data-count="${courses.length}">${courses.length}</div><div class="stat-label">门系统课程</div></div>
            <div><div class="stat-value" data-count="${docCount}">${docCount}</div><div class="stat-label">页文档已索引</div></div>
            <div><div class="stat-value" data-count="${pluginTotal}" data-format="compact">${compactFmt.format(pluginTotal)}</div><div class="stat-label">个社区插件</div></div>
            <div><div class="stat-value"><span data-count="3">3</span><small>天</small></div><div class="stat-label">自动巡检周期</div></div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="terminal">
            <div class="terminal-bar"><i></i><i></i><i></i><span class="terminal-title">dsh — academy@local</span></div>
            <div class="terminal-body">
              <div class="ln"><span class="term-dim"># 1. 启动 Harness</span></div>
              <div class="ln"><span class="term-prompt">$</span> <span class="term-cmd">npx @deepseek-ai/dsh web</span></div>
              <div class="ln term-ok">  ✓ web profile ready</div>
              <div class="ln term-accent">  → http://127.0.0.1:3080</div>
              <div class="ln">&nbsp;</div>
              <div class="ln"><span class="term-dim"># 2. 巡检并重建教学站</span></div>
              <div class="ln"><span class="term-prompt">$</span> <span class="term-cmd">node scripts/crawl.mjs</span></div>
              <div class="ln term-ok">  ✓ ${docCount} docs · ${updates.length} events</div>
              <div class="ln term-ok">  ✓ next run in 3 days</div>
              <div class="ln"><span class="term-prompt">$</span> <span class="term-cmd">node scripts/deploy.mjs</span><span class="term-cursor"></span></div>
            </div>
            <div class="terminal-foot"><span class="dot" style="width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block"></span> 本机预览 · 自动部署就绪</div>
          </div>
          <div class="float-card">
            <span class="fc-icon">${icon('check')}</span>
            <div><b>上线成功</b><span>3 个页面 · 412 ms</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <div class="lead" data-reveal>
          <div class="eyebrow">Why DSH</div>
          <h2 class="section-title">不是又一个聊天框，<br class="no-wrap">而是可组装的 Agent 运行时</h2>
          <p class="section-sub">DeepSeek Harness 用插件树承载模型、工具、会话与界面。理解这六个切面，后面的课程就有了地图。</p>
        </div>
        <a class="btn btn-ghost btn-sm" href="${u(base, '/courses/')}" data-reveal data-delay="1">查看完整路线 ${icon('arrowRight')}</a>
      </div>
      <div class="feature-grid">
        ${features
          .map(
            ([ic, title, desc], index) => `<article class="feature" data-reveal data-delay="${(index % 3) + 1}">
          <span class="index">0${index + 1}</span>
          <div class="feature-icon">${icon(ic)}</div>
          <h3>${title}</h3>
          <p>${desc}</p>
        </article>`,
          )
          .join('')}
      </div>
    </div>
  </section>

  <section class="section" id="courses">
    <div class="container">
      <div class="section-head">
        <div class="lead" data-reveal>
          <div class="eyebrow">Curriculum</div>
          <h2 class="section-title">8 门课，从环境到上线</h2>
          <p class="section-sub">每门课都有可执行步骤、常见坑和验收清单。进度保存在本机，不登录也能接着学。</p>
        </div>
        <a class="btn btn-ghost btn-sm" href="${u(base, '/courses/')}" data-reveal data-delay="1">全部课程 ${icon('arrowRight')}</a>
      </div>
      <div class="course-grid">
        ${courses.map((course) => courseCard(course, base)).join('')}
      </div>
    </div>
  </section>

  <section class="section tight">
    <div class="container">
      <div class="section-head">
        <div class="lead" data-reveal>
          <div class="eyebrow">Learning path</div>
          <h2 class="section-title">四步，把「会用」变成「能交付」</h2>
        </div>
      </div>
      <div class="pipeline">
        ${stages
          .map(
            ([title, time, desc, ic], index) => `<article class="pipe-step" data-reveal data-delay="${index + 1}">
          <span class="pipe-icon">${icon(ic)}</span>
          <h4>${title} <span class="dim mono" style="font-size:10px;margin-left:6px">${time}</span></h4>
          <p>${desc}</p>
        </article>`,
          )
          .join('')}
      </div>
    </div>
  </section>

  <section class="section" id="scenarios">
    <div class="container">
      <div class="section-head">
        <div class="lead" data-reveal>
          <div class="eyebrow">Scenarios</div>
          <h2 class="section-title">六个能直接抄的场景</h2>
          <p class="section-sub">不是玩具 demo：每个场景都给出目标、栈、命令与验收标准，包含这座教学站自己的自动更新流水线。</p>
        </div>
        <a class="btn btn-ghost btn-sm" href="${u(base, '/scenarios/')}" data-reveal data-delay="1">进入场景库 ${icon('arrowRight')}</a>
      </div>
      <div class="scenario-grid">
        ${scenarios
          .slice(0, 6)
          .map(
            (scenario, index) => `<article class="scenario-card" data-reveal data-delay="${(index % 3) + 1}">
          <div class="scenario-icon">${icon(scenario.icon || 'sparkles')}</div>
          <h3>${escapeHtml(scenario.title)}</h3>
          <p class="scenario-tagline">${escapeHtml(scenario.tagline)}</p>
          <p class="scenario-goal">${escapeHtml(scenario.goal)}</p>
          <div class="scenario-stack">${(scenario.stack || []).map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join('')}</div>
          <div class="scenario-foot"><a class="course-link" href="${u(base, `/scenarios/#${scenario.slug}`)}">查看实现 ${icon('arrowRight')}</a></div>
        </article>`,
          )
          .join('')}
      </div>
    </div>
  </section>

  <section class="section tight" id="tour">
    <div class="container">
      <div class="section-head">
        <div class="lead" data-reveal>
          <div class="eyebrow">60s tour</div>
          <h2 class="section-title">先看一遍，再动手</h2>
          <p class="section-sub">一段无旁白的动态导览：Harness 启动、巡检、构建、发布，四个动作串成一条流水线。</p>
        </div>
      </div>
      <div class="video-shell" data-video-shell data-reveal>
        <video id="intro-video" preload="metadata" playsinline poster="${u(base, '/assets/img/tour-poster.jpg')}">
          <source src="${u(base, '/assets/video/dsh-academy.mp4')}" type="video/mp4">
        </video>
        <div class="video-overlay">
          <span class="video-badge">${icon('play')} 平台导览 · 无旁白</span>
          <div class="video-caption">
            <div><h3>从一条命令，到一座会自己更新的站</h3><p>约 30 秒 · 1080p · 自动静音播放</p></div>
            <button class="play-btn" type="button" data-play aria-label="播放导览视频">${icon('play')}</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="updates">
    <div class="container">
      <div class="section-head">
        <div class="lead" data-reveal>
          <div class="eyebrow">Live radar</div>
          <h2 class="section-title">官方一更新，这里就知道</h2>
          <p class="section-sub">每 3 天抓取 npm 版本、GitHub Releases 与 ${docCount} 页官方文档指纹；只把真正变化的内容写进时间线。</p>
        </div>
        <a class="btn btn-ghost btn-sm" href="${u(base, '/updates/')}" data-reveal data-delay="1">打开更新雷达 ${icon('arrowRight')}</a>
      </div>
      <div class="update-grid">
        <div class="timeline">
          ${updates.slice(0, 4).map((event) => eventItem(event, base)).join('') || '<div class="empty-state">等待第一次巡检数据…</div>'}
        </div>
        <aside class="panel" data-reveal>
          <h4>巡检状态</h4>
          <div class="live-row"><span class="dot ${meta?.status === 'degraded' ? 'warn' : ''}"></span><span class="grow">最近巡检</span><span class="val">${meta?.lastRun ? new Date(meta.lastRun).toLocaleDateString('zh-CN') : '—'}</span></div>
          <div class="live-row"><span class="dot"></span><span class="grow">下次巡检</span><span class="val countdown" data-countdown="${meta?.nextRun ?? ''}">—</span></div>
          <div class="live-row"><span class="dot"></span><span class="grow">当前版本</span><span class="val">v${escapeHtml(meta?.version ?? '0.2.2-rc.1')}</span></div>
          <div class="live-row"><span class="dot"></span><span class="grow">文档覆盖</span><span class="val">${docCount} 页</span></div>
          <div class="live-row"><span class="dot"></span><span class="grow">社区插件</span><span class="val">${fmt(pluginTotal)}</span></div>
          <a class="course-link" style="margin-top:14px" href="${u(base, '/updates/')}#sources">查看数据源健康 ${icon('arrowRight')}</a>
        </aside>
      </div>
    </div>
  </section>

  ${
    pluginList.length
      ? `<section class="section tight" id="plugins">
    <div class="container">
      <div class="section-head">
        <div class="lead" data-reveal>
          <div class="eyebrow">Ecosystem</div>
          <h2 class="section-title">社区正在长出来</h2>
          <p class="section-sub">GitHub 上带 <span class="mono">dsh-plugin</span> 话题的项目，每轮巡检同步一次。装之前先读源码，插件等同本地代码。</p>
        </div>
        <a class="btn btn-ghost btn-sm" href="https://github.com/topics/dsh-plugin" target="_blank" rel="noreferrer" data-reveal data-delay="1">浏览全部 ${icon('arrowUpRight')}</a>
      </div>
      <div class="scenario-grid">
        ${pluginList
          .map(
            (plugin, index) => `<a class="scenario-card" href="${escapeHtml(plugin.url)}" target="_blank" rel="noreferrer" data-reveal data-delay="${(index % 3) + 1}">
          <div class="course-top"><span class="course-num">${escapeHtml(plugin.language || 'PLUGIN')}</span><span class="badge" data-tone="gray">${escapeHtml((plugin.updatedAt || '').slice(0, 10))}</span></div>
          <h3 style="margin-top:8px">${escapeHtml(plugin.name)}</h3>
          <p class="scenario-tagline">${escapeHtml(plugin.description || plugin.fullName)}</p>
          <div class="scenario-stack">${(plugin.topics || []).slice(0, 3).map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>
          <div class="scenario-foot"><span class="course-link">${escapeHtml(plugin.fullName)} ${icon('arrowUpRight')}</span></div>
        </a>`,
          )
          .join('')}
      </div>
    </div>
  </section>`
      : ''
  }

  <section class="section" id="faq-preview">
    <div class="container">
      <div class="section-head">
        <div class="lead" data-reveal>
          <div class="eyebrow">Troubleshooting</div>
          <h2 class="section-title">社区最常卡住的，先给你答案</h2>
          <p class="section-sub">端口、密钥、沙箱、审批、代理、插件兼容……每一条都给出症状、原因和可执行修复命令。</p>
        </div>
        <a class="btn btn-ghost btn-sm" href="${u(base, '/faq/')}" data-reveal data-delay="1">全部 ${faqs.length} 个问题 ${icon('arrowRight')}</a>
      </div>
      <div class="faq-list">
        ${preview.map((faq, index) => faqItem(faq, index, base, false)).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="cta-band" data-reveal>
        <div class="eyebrow">Ship it</div>
        <h2>这座站，本身就是一套<br class="no-wrap">自动化部署样板</h2>
        <p>克隆、改内容、跑一条 <span class="mono">npm run ship</span>：巡检、构建、验收、发布全部串好。也提供 GitHub Actions、Windows 计划任务与 Docker 三种落地方式。</p>
        <div class="cta-code">${codeBlock({ lang: 'powershell', content: 'cd dsh-academy\nnpm run ship' })}</div>
        <div class="cta-actions">
          <a class="btn btn-primary" href="${u(base, '/deploy/')}">${icon('rocket')} 进入部署控制台</a>
          <a class="btn btn-ghost" href="${u(base, '/courses/automation-deploy/')}">${icon('book')} 学习部署课程</a>
        </div>
      </div>
    </div>
  </section>
</main>`

  return layout({
    site,
    meta,
    base,
    page: 'home',
    title: '',
    description: site.description,
    body,
    bodyClass: 'home',
  })
}

/* ------------------------------- courses -------------------------------- */
export function coursesPage({ site, base, meta, courses }) {
  const levels = [...new Set(courses.map((course) => course.level).filter(Boolean))]
  const body = `<main id="main">
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="${u(base, '/')}">首页</a>${icon('chevronRight')}<span>课程</span></div>
      <div class="eyebrow">Curriculum</div>
      <h1>完整学习路线</h1>
      <p class="lead">8 个模块按依赖顺序排列。前四门把 Harness 用顺手，后四门把它接进团队流程并部署上线。建议每门课动手跑一遍命令，再读「常见坑」。</p>
      <div class="page-stats">
        <div class="page-stat"><b>${courses.length}</b>门课程</div>
        <div class="page-stat"><b>${courses.reduce((sum, course) => sum + (course.steps?.length || 0), 0)}</b>个实操步骤</div>
        <div class="page-stat"><b>${courses.reduce((sum, course) => sum + (course.duration || 0), 0)}</b>分钟总时长</div>
      </div>
    </div>
  </section>
  <section class="section tight">
    <div class="container">
      <div class="faq-tools">
        <div class="filter-chips" data-course-filters>
          <button class="filter-chip is-active" data-level="all">全部</button>
          ${levels.map((level) => `<button class="filter-chip" data-level="${escapeHtml(level)}">${escapeHtml(level)}</button>`).join('')}
        </div>
        <div class="search-field" style="margin-left:auto">
          ${icon('search')}<input type="search" placeholder="搜索课程…" data-course-search>
        </div>
      </div>
      <div class="course-grid" data-course-grid>
        ${courses.map((course) => courseCard(course, base)).join('')}
      </div>
      <div class="empty-state" data-course-empty style="display:none">没有匹配的课程，换个关键词试试。</div>
    </div>
  </section>
</main>`
  return layout({ site, meta, base, page: 'courses', title: '课程', description: 'DeepSeek Harness 中文系统课程：安装、模型、会话、权限、技能、插件、工作流与自动部署。', body })
}

/* --------------------------------- lesson -------------------------------- */
export function lessonPage({ site, base, meta, course, courses, index }) {
  const prev = courses[index - 1]
  const next = courses[index + 1]
  const body = `<main id="main">
  <div class="container">
    <div class="lesson-grid">
      <aside class="lesson-aside">
        <div class="aside-title">课程目录</div>
        <nav class="aside-list">
          ${courses
            .map(
              (item, i) => `<a class="aside-item${item.slug === course.slug ? ' is-active' : ''}" href="${u(base, `/courses/${item.slug}/`)}">
            <span class="n">${pad(i + 1)}</span><span>${escapeHtml(item.title)}</span>
          </a>`,
            )
            .join('')}
        </nav>
        <div class="lesson-progress">
          <div class="lp-head"><span>本课进度</span><span data-lesson-progress-label>0%</span></div>
          <div class="progress" style="width:100%"><span data-lesson-progress style="width:0%"></span></div>
        </div>
      </aside>
      <article class="lesson-body">
        <div class="breadcrumb"><a href="${u(base, '/')}">首页</a>${icon('chevronRight')}<a href="${u(base, '/courses/')}">课程</a>${icon('chevronRight')}<span>${escapeHtml(course.title)}</span></div>
        <div class="course-top" style="justify-content:flex-start;gap:10px">
          <span class="course-num">LESSON ${pad(course.order || index + 1)}</span>
          ${tag(course.level || '入门', levelTone(course.level))}
        </div>
        <h1>${escapeHtml(course.title)}</h1>
        <p class="lesson-lead">${escapeHtml(course.summary)}</p>
        <div class="lesson-meta">
          <span>${icon('clock')} ${Number(course.duration || 15)} 分钟</span>
          <span>${icon('book')} ${course.steps?.length || 0} 个步骤</span>
          <span>${icon('activity')} ${escapeHtml(course.level || '入门')}</span>
        </div>
        ${
          course.objectives?.length
            ? `<div class="objectives"><h3>学完你能</h3><ul>${course.objectives.map((objective) => `<li>${escapeHtml(objective)}</li>`).join('')}</ul></div>`
            : ''
        }
        ${(course.steps || [])
          .map(
            (step, i) => `<section class="step">
          <div class="step-head"><span class="step-num">STEP ${pad(i + 1)}</span><h2>${escapeHtml(step.title)}</h2></div>
          ${rich(step.body || '')}
          ${step.code ? codeBlock(step.code) : ''}
          ${step.tip ? `<div class="tip">${icon('info')}<span>${escapeHtml(step.tip)}</span></div>` : ''}
        </section>`,
          )
          .join('')}
        ${
          course.pitfalls?.length
            ? `<section class="step"><div class="step-head"><span class="step-num">PITFALLS</span><h2>常见坑</h2></div>
          <div class="pitfalls">${course.pitfalls
            .map((pitfall) => `<div class="pitfall">${icon('alert')}<div><b>${escapeHtml(pitfall.problem)}</b><span>${escapeHtml(pitfall.fix)}</span></div></div>`)
            .join('')}</div></section>`
            : ''
        }
        ${
          course.checklist?.length
            ? `<div class="checklist"><h3>验收清单</h3><ul>${course.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`
            : ''
        }
        ${
          course.links?.length
            ? `<div class="faq-links">${course.links
                .map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ${icon('arrowUpRight')}</a>`)
                .join('')}</div>`
            : ''
        }
        <div class="lesson-actions">
          <button class="btn btn-ghost complete-btn" type="button" data-complete="${escapeHtml(course.slug)}">${icon('check')} 标记本课完成</button>
          <a class="btn btn-ghost btn-sm" href="${u(base, '/courses/')}">返回课程列表</a>
        </div>
        <nav class="lesson-nav">
          ${prev ? `<a href="${u(base, `/courses/${prev.slug}/`)}"><div class="ln-label">上一课</div><div class="ln-title">${escapeHtml(prev.title)}</div></a>` : '<span></span>'}
          ${next ? `<a class="next" href="${u(base, `/courses/${next.slug}/`)}"><div class="ln-label">下一课</div><div class="ln-title">${escapeHtml(next.title)}</div></a>` : '<span></span>'}
        </nav>
      </article>
    </div>
  </div>
</main>`
  return layout({
    site,
    meta,
    base,
    page: 'courses',
    title: `${course.title} · 第 ${course.order} 课`,
    description: course.summary,
    body,
    bodyClass: 'lesson',
  })
}

/* ------------------------------- scenarios ------------------------------- */
export function scenariosPage({ site, base, meta, scenarios }) {
  const body = `<main id="main">
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="${u(base, '/')}">首页</a>${icon('chevronRight')}<span>场景</span></div>
      <div class="eyebrow">Scenarios</div>
      <h1>把能力装进真实流程</h1>
      <p class="lead">六个可以直接复用的场景：每个都写明业务目标、技术栈、执行步骤与最终交付物。第一个场景就是这座教学站自己的自动更新流水线。</p>
    </div>
  </section>
  <section class="section tight">
    <div class="container">
      <div class="course-grid">
        ${scenarios
          .map(
            (scenario, index) => `<article class="course-card" id="${escapeHtml(scenario.slug)}" data-reveal data-delay="${(index % 2) + 1}">
          <div class="course-top">
            <span class="course-num">${icon(scenario.icon || 'sparkles')} SCENARIO ${pad(index + 1)}</span>
            ${tag(scenario.level || '进阶', levelTone(scenario.level))}
          </div>
          <h3>${escapeHtml(scenario.title)}</h3>
          <p class="course-desc">${escapeHtml(scenario.goal)}</p>
          <div class="scenario-stack">${(scenario.stack || []).map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join('')}</div>
          <div class="step" style="margin-top:20px;padding-top:18px">
            <h4 style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);margin-bottom:10px">执行步骤</h4>
            <ol style="display:grid;gap:7px;list-style:none;counter-reset:sc">
              ${(scenario.steps || [])
                .map(
                  (step) => `<li style="position:relative;padding-left:24px;font-size:12.8px;color:var(--muted);counter-increment:sc">
                <span style="position:absolute;left:0;top:1px;font-family:var(--mono);font-size:10px;color:var(--brand)">${pad(0)}</span>${escapeHtml(step)}</li>`,
                )
                .join('')}
            </ol>
          </div>
          ${(scenario.commands || []).map((command) => codeBlock(command)).join('')}
          <div class="course-foot" style="margin-top:16px">
            <span class="dim" style="font-size:12px">${escapeHtml(scenario.outcome || '')}</span>
          </div>
        </article>`,
          )
          .join('')}
      </div>
    </div>
  </section>
</main>`
  return layout({ site, meta, base, page: 'scenarios', title: '实战场景', description: '六个 DeepSeek Harness 实战场景：自动巡检部署、目标驱动重构、工作流审计、技能周报、Web UI 上线与 MCP 记忆。', body })
}

/* --------------------------------- updates ------------------------------- */
export function updatesPage({ site, base, meta, updates, docs, plugins }) {
  const types = [
    ['all', '全部'],
    ['release', '版本发布'],
    ['docs', '文档变动'],
    ['community', '社区动态'],
  ]
  const categories = {}
  for (const page of docs.pages || []) {
    categories[page.category] = (categories[page.category] || 0) + 1
  }
  const statusTone = meta?.status === 'ok' ? 'green' : meta?.status === 'degraded' ? 'amber' : 'gray'

  const body = `<main id="main">
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="${u(base, '/')}">首页</a>${icon('chevronRight')}<span>更新雷达</span></div>
      <div class="eyebrow">Live radar</div>
      <h1>更新雷达</h1>
      <p class="lead">npm 版本、GitHub Releases、${meta?.docPages ?? 95} 页官方文档指纹与社区插件，每 3 天自动巡检一次。只记录真正的变化，不制造噪音。</p>
      <div class="page-stats">
        <div class="page-stat"><b>${updates.length}</b>条时间线事件</div>
        <div class="page-stat"><b>${meta?.docPages ?? 95}</b>页文档覆盖</div>
        <div class="page-stat"><b>${fmt(meta?.pluginTotal ?? 0)}</b>个社区插件</div>
        <div class="page-stat"><b>v${escapeHtml(meta?.version ?? '—')}</b>当前版本</div>
      </div>
    </div>
  </section>

  <section class="section tight" id="sources">
    <div class="container">
      <div class="update-grid">
        <div>
          <div class="faq-tools">
            <div class="filter-chips" data-update-filters>
              ${types.map(([key, label], i) => `<button class="filter-chip${i === 0 ? ' is-active' : ''}" data-type="${key}">${label}</button>`).join('')}
            </div>
            <span class="dim" style="font-size:12px;margin-left:auto" data-update-count>${updates.length} 条</span>
          </div>
          <div class="timeline" data-update-timeline>
            ${updates.map((event) => eventItem(event, base)).join('') || '<div class="empty-state">还没有巡检数据。</div>'}
          </div>
        </div>
        <aside>
          <div class="panel" style="margin-bottom:16px">
            <h4>巡检状态 ${tag(meta?.status === 'ok' ? '正常' : meta?.status === 'degraded' ? '降级' : '未知', statusTone)}</h4>
            <div class="live-row"><span class="dot"></span><span class="grow">最近巡检</span><span class="val">${meta?.lastRun ? new Date(meta.lastRun).toLocaleString('zh-CN', { hour12: false }) : '—'}</span></div>
            <div class="live-row"><span class="dot"></span><span class="grow">下次巡检</span><span class="val countdown" data-countdown="${meta?.nextRun ?? ''}">—</span></div>
            <div class="live-row"><span class="dot"></span><span class="grow">本轮耗时</span><span class="val">${meta?.durationMs ? `${(meta.durationMs / 1000).toFixed(1)}s` : '—'}</span></div>
            <div class="live-row"><span class="dot"></span><span class="grow">巡检周期</span><span class="val">每 3 天 03:00</span></div>
          </div>
          <div class="panel">
            <h4>数据源健康</h4>
            ${(meta?.sources || [])
              .map(
                (source) => `<div class="live-row">
              <span class="dot ${source.status === 'ok' ? '' : source.status === 'degraded' ? 'warn' : 'fail'}"></span>
              <span class="grow">${escapeHtml(source.name)}</span>
              <span class="val">${source.status === 'ok' ? 'OK' : source.status === 'degraded' ? 'DEGRADED' : 'FAIL'} · ${source.ms}ms</span>
            </div>`,
              )
              .join('') || '<p class="dim" style="font-size:12px">尚未运行巡检。</p>'}
          </div>
          <div class="panel" style="margin-top:16px">
            <h4>文档覆盖</h4>
            <p class="dim" style="font-size:12px;margin-bottom:8px">按官方文档分区统计，共 ${meta?.docPages ?? 95} 页。</p>
            <div class="doc-cats">${Object.entries(categories)
              .map(([name, count]) => `<span class="chip">${escapeHtml(name)} · ${count}</span>`)
              .join('')}</div>
            <a class="course-link" style="margin-top:14px" href="https://deepseek-harness.github.io/deepseek-harness/" target="_blank" rel="noreferrer">打开官方文档 ${icon('arrowUpRight')}</a>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="section tight">
    <div class="container">
      <div class="section-head">
        <div class="lead">
          <div class="eyebrow">Docs map</div>
          <h2 class="section-title">文档地图</h2>
          <p class="section-sub">巡检器为每个页面建立了内容指纹。下面是当前索引到的页面，点击直达官方原文。</p>
        </div>
      </div>
      ${Object.entries(
        Object.groupBy
          ? Object.groupBy(docs.pages || [], (page) => page.category)
          : (docs.pages || []).reduce((acc, page) => ((acc[page.category] ||= []).push(page), acc), {}),
      )
        .map(
          ([category, pages]) => `<details class="faq-item" style="margin-bottom:10px">
        <summary><span class="faq-q">${escapeHtml(category)}</span><span class="badge" data-tone="gray">${pages.length} 页</span><span class="faq-chev">${icon('chevronDown')}</span></summary>
        <div class="faq-body" style="padding-left:20px">
          <div class="footer-links">${pages
            .map((page) => `<a href="${escapeHtml(page.url)}" target="_blank" rel="noreferrer">${escapeHtml(page.title)} ${icon('arrowUpRight')}</a>`)
            .join('')}</div>
        </div>
      </details>`,
        )
        .join('')}
    </div>
  </section>

  ${
    (plugins?.recent ?? []).length
      ? `<section class="section tight">
    <div class="container">
      <div class="section-head">
        <div class="lead"><div class="eyebrow">Ecosystem</div><h2 class="section-title">最近活跃的社区插件</h2><p class="section-sub">按 GitHub Topics 最近更新时间排序。插件会以你的权限运行，安装前请阅读源码。</p></div>
        <a class="btn btn-ghost btn-sm" href="https://github.com/topics/dsh-plugin" target="_blank" rel="noreferrer">全部 ${icon('arrowUpRight')}</a>
      </div>
      <div class="scenario-grid">
        ${(plugins.recent || [])
          .slice(0, 6)
          .map(
            (plugin, index) => `<a class="scenario-card" href="${escapeHtml(plugin.url)}" target="_blank" rel="noreferrer" data-reveal data-delay="${(index % 3) + 1}">
          <div class="course-top"><span class="course-num">${escapeHtml(plugin.language || 'REPO')}</span><span class="badge" data-tone="gray">${escapeHtml((plugin.updatedAt || '').slice(0, 10))}</span></div>
          <h3 style="margin-top:8px">${escapeHtml(plugin.name)}</h3>
          <p class="scenario-tagline">${escapeHtml(plugin.description || plugin.fullName)}</p>
          <div class="scenario-foot"><span class="course-link">${escapeHtml(plugin.fullName)} ${icon('arrowUpRight')}</span></div>
        </a>`,
          )
          .join('')}
      </div>
    </div>
  </section>`
      : ''
  }

  <section class="section tight">
    <div class="container">
      <div class="cta-band">
        <div class="eyebrow">Automation</div>
        <h2>让巡检自己跑起来</h2>
        <p>注册 Windows 计划任务，或把仓库推到 GitHub 用 Actions 托管。两种方式都是每 3 天一轮，失败会保留上一份可用数据。</p>
        <div class="cta-actions">
          <a class="btn btn-primary" href="${u(base, '/deploy/')}#automation">${icon('refresh')} 配置自动巡检</a>
          <a class="btn btn-ghost" href="${u(base, '/deploy/')}">${icon('book')} 阅读部署手册</a>
        </div>
      </div>
    </div>
  </section>
</main>`
  return layout({ site, meta, base, page: 'updates', title: '更新雷达', description: `DeepSeek Harness 更新雷达：npm 版本、GitHub Releases、官方文档与社区插件，每 3 天自动巡检。`, body })
}

/* ----------------------------------- faq --------------------------------- */
export function faqPage({ site, base, meta, faqs }) {
  const tagCounts = {}
  for (const faq of faqs) for (const t of faq.tags || []) tagCounts[t] = (tagCounts[t] || 0) + 1
  const tags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)
    .map(([t]) => t)
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }).replaceAll('</', '<\\/')

  const body = `<main id="main">
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="${u(base, '/')}">首页</a>${icon('chevronRight')}<span>常见问题</span></div>
      <div class="eyebrow">Troubleshooting</div>
      <h1>常见问题与修复手册</h1>
      <p class="lead">来自官方文档、社区讨论与本机实测的高频问题。每条都按「症状 → 原因 → 处理」组织，命令可直接复制。</p>
      <div class="page-stats">
        <div class="page-stat"><b>${faqs.length}</b>个问题</div>
        <div class="page-stat"><b>${tags.length}</b>个分类</div>
        <div class="page-stat"><b>Windows</b>优先覆盖</div>
      </div>
    </div>
  </section>
  <section class="section tight">
    <div class="container">
      <div class="faq-tools">
        <div class="search-field">
          ${icon('search')}<input type="search" placeholder="搜索问题、报错或命令…" data-faq-search aria-label="搜索常见问题">
        </div>
        <div class="filter-chips" data-faq-filters>
          <button class="filter-chip is-active" data-tag="all">全部</button>
          ${tags.map((t) => `<button class="filter-chip" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('')}
        </div>
        <span class="dim" style="font-size:12px;margin-left:auto" data-faq-count>${faqs.length} 条</span>
      </div>
      <div class="faq-list" data-faq-list>
        ${faqs.map((faq, index) => faqItem(faq, index, base)).join('')}
      </div>
      <div class="empty-state" data-faq-empty style="display:none">没有匹配的问题。试试「端口」「密钥」「沙箱」或直接看官方文档。</div>
      <div class="cta-band" style="margin-top:36px">
        <div class="eyebrow">Still stuck</div>
        <h2>还是卡住了？</h2>
        <p>先去官方文档按页面搜索；如果确认是 bug，带上复现步骤提交到 GitHub Discussions。提问时附上版本号、系统与实际报错，解决速度会快很多。</p>
        <div class="cta-actions">
          <a class="btn btn-primary" href="https://deepseek-harness.github.io/deepseek-harness/" target="_blank" rel="noreferrer">${icon('book')} 官方文档</a>
          <a class="btn btn-ghost" href="https://github.com/deepseek-ai/deepseek-harness/discussions" target="_blank" rel="noreferrer">${icon('github')} GitHub Discussions</a>
        </div>
      </div>
    </div>
  </section>
  <script type="application/ld+json">${jsonLd}</script>
</main>`
  return layout({ site, meta, base, page: 'faq', title: '常见问题', description: 'DeepSeek Harness 常见问题：端口占用、API Key、Node 版本、插件安装、沙箱拒绝、审批、上下文压缩、反向代理 403 等。', body })
}

/* --------------------------------- deploy -------------------------------- */
export function deployPage({ site, base, meta }) {
  const body = `<main id="main">
  <section class="page-hero">
    <div class="container">
      <div class="breadcrumb"><a href="${u(base, '/')}">首页</a>${icon('chevronRight')}<span>部署</span></div>
      <div class="eyebrow">Deploy console</div>
      <h1>把教学站，变成你的站</h1>
      <p class="lead">不是一份「部署说明」，而是一条已经跑通的流水线：巡检 → 构建 → 验收 → 发布。本机、GitHub Pages、Docker、Netlify 四条路径任选。</p>
      <div class="page-stats">
        <div class="page-stat"><b>1</b>条命令发布</div>
        <div class="page-stat"><b>3 天</b>自动巡检</div>
        <div class="page-stat"><b>0</b>运行时依赖</div>
        <div class="page-stat"><b>4</b>种部署目标</div>
      </div>
    </div>
  </section>

  <section class="section tight">
    <div class="container">
      <div class="panel" style="padding:26px">
        <div class="eyebrow" style="margin-bottom:12px">Pipeline</div>
        <h2 style="font-size:22px;margin-bottom:14px">一条流水线，五个阶段</h2>
        <div class="pipeline-map">
          <div class="pm-node">${icon('refresh')}<b>巡检</b><span>crawl.mjs</span></div>
          <div class="pm-node">${icon('database')}<b>归一化</b><span>data/*.json</span></div>
          <div class="pm-node">${icon('frame')}<b>构建</b><span>build.mjs</span></div>
          <div class="pm-node">${icon('shield')}<b>验收</b><span>verify.mjs</span></div>
          <div class="pm-node">${icon('rocket')}<b>发布</b><span>deploy.mjs</span></div>
        </div>
        <p class="dim" style="font-size:12.5px">静态产物零运行时依赖；巡检失败时保留上一次可用数据，构建与发布互不阻塞。</p>
      </div>

      <div class="section-head" style="margin-top:46px">
        <div class="lead"><div class="eyebrow">Wizard</div><h2 class="section-title">生成你的部署命令</h2><p class="section-sub">选择目标、填入参数，右侧实时生成可直接粘贴的命令。密钥只作为环境变量示例，不会写入站点。</p></div>
      </div>
      <div class="target-grid" data-targets>
        <button class="target-card is-active" type="button" data-target="local"><span class="t-icon">${icon('server')}</span><b>本机 / 内网</b><span>零配置，计划任务常驻</span></button>
        <button class="target-card" type="button" data-target="github"><span class="t-icon">${icon('github')}</span><b>GitHub Pages</b><span>免费、可绑定域名</span></button>
        <button class="target-card" type="button" data-target="docker"><span class="t-icon">${icon('box')}</span><b>Docker</b><span>任意云主机 / NAS</span></button>
        <button class="target-card" type="button" data-target="netlify"><span class="t-icon">${icon('cloud')}</span><b>Netlify</b><span>拖拽或 API 发布</span></button>
      </div>
      <div class="wizard-grid">
        <div class="panel" style="padding:22px">
          <div class="field"><label for="w-port">监听端口</label><input id="w-port" data-field="port" value="4173" inputmode="numeric"><span class="hint">本机与 Docker 共用，避免与 DSH 的 3080 冲突</span></div>
          <div class="field" data-show-for="github"><label for="w-repo">GitHub 仓库</label><input id="w-repo" data-field="repo" placeholder="your-name/dsh-academy"><span class="hint">需要 repo 权限的 GITHUB_TOKEN</span></div>
          <div class="field" data-show-for="github"><label for="w-branch">发布分支</label><input id="w-branch" data-field="branch" value="gh-pages"><span class="hint">用户主页仓库可改成 main</span></div>
          <div class="field" data-show-for="netlify"><label for="w-site">Netlify Site ID</label><input id="w-site" data-field="site" placeholder="xxxxxxxx-xxxx-xxxx"><span class="hint">站点设置 → Site ID</span></div>
          <div class="field" data-show-for="docker"><label for="w-image">镜像名</label><input id="w-image" data-field="image" value="dsh-academy"><span class="hint">构建后可直接推到镜像仓库</span></div>
          <div class="field" data-show-for="local"><label for="w-interval">巡检周期</label><input id="w-interval" value="每 3 天 03:00" disabled><span class="hint">Windows 计划任务 DSHAcademy-Refresh</span></div>
          <p class="dim" style="font-size:11px;line-height:1.7;margin-top:6px">在项目根目录执行。首次部署前先运行一次 <span class="mono">npm run build</span>。</p>
        </div>
        <div class="output">
          <div class="out-head"><span>PowerShell · 生成结果</span><button class="copy-btn" type="button" data-copy-output>${icon('copy')}<span>复制</span></button></div>
          <pre id="deploy-output"></pre>
        </div>
      </div>
    </div>
  </section>

  <section class="section tight" id="automation">
    <div class="container">
      <div class="section-head">
        <div class="lead"><div class="eyebrow">Automation</div><h2 class="section-title">每 3 天，自动巡检与发布</h2><p class="section-sub">两条互相独立的自动化链路：本机计划任务负责开发机上的刷新，GitHub Actions 负责公网仓库的定时构建。任一条都能单独工作。</p></div>
      </div>
      <div class="deploy-grid">
        <div class="deploy-card">
          <h3>${icon('calendar')} Windows 计划任务</h3>
          <p>注册 <b>DSHAcademy-Refresh</b> 每 3 天 03:00 巡检并构建；登录启动项会在后台拉起 <b>4173</b> 预览服务。</p>
          ${codeBlock({ lang: 'powershell', content: 'powershell -ExecutionPolicy Bypass -File deploy\\register-tasks.ps1\nschtasks /Query /TN "DSHAcademy-Refresh" /V /FO LIST' })}
        </div>
        <div class="deploy-card">
          <h3>${icon('gitBranch')} GitHub Actions</h3>
          <p>仓库内置 <span class="mono">.github/workflows/update-and-deploy.yml</span>：cron 每 3 天抓取、构建并发布到 Pages，push 时也会跑一次。</p>
          ${codeBlock({ lang: 'yaml', content: 'on:\n  schedule:\n    - cron: "0 3 */3 * *"\n  workflow_dispatch:\n  push:\n    branches: [main]' })}
        </div>
      </div>
    </div>
  </section>

  <section class="section tight">
    <div class="container">
      <div class="section-head">
        <div class="lead"><div class="eyebrow">Guides</div><h2 class="section-title">四条部署路径</h2><p class="section-sub">所有命令都在 Windows PowerShell 下验证过；Linux/macOS 去掉 <span class="mono">$env:</span> 前缀即可。</p></div>
      </div>
      <div class="deploy-grid">
        <div class="deploy-card" id="local">
          <h3>${icon('server')} 本机 / 内网</h3>
          <p>构建后以零依赖静态服务器托管，后台启动并写入 PID。适合团队内网、演示与离线环境。</p>
          ${codeBlock({ lang: 'powershell', content: 'npm run build\nnpm run deploy -- --target local --port 4173\n# 打开 http://127.0.0.1:4173' })}
        </div>
        <div class="deploy-card" id="github">
          <h3>${icon('github')} GitHub Pages</h3>
          <p>通过 Git Data API 把 <span class="mono">dist/</span> 写成一次提交，不需要本地 git。推送到 gh-pages 后在仓库设置里启用 Pages。</p>
          ${codeBlock({ lang: 'powershell', content: '$env:GITHUB_TOKEN = "ghp_xxx"\n$env:GITHUB_REPO = "your-name/dsh-academy"\nnpm run build\nnode scripts/deploy.mjs --target github --branch gh-pages' })}
        </div>
        <div class="deploy-card" id="docker">
          <h3>${icon('box')} Docker</h3>
          <p>多阶段构建：Node 里生成静态产物，Nginx 托管。镜像不包含源码与爬虫，体积小、重启即恢复。</p>
          ${codeBlock({ lang: 'powershell', content: 'npm run build\ndocker build -t dsh-academy .\ndocker run -d --name dsh-academy -p 8080:80 --restart unless-stopped dsh-academy' })}
        </div>
        <div class="deploy-card" id="netlify">
          <h3>${icon('cloud')} Netlify</h3>
          <p>打包 <span class="mono">dist/</span> 后调用 Deploy API，适合已有 Netlify 站点或需要预览环境。</p>
          ${codeBlock({ lang: 'powershell', content: '$env:NETLIFY_AUTH_TOKEN = "xxx"\n$env:NETLIFY_SITE_ID = "xxxxxxxx-xxxx"\nnpm run build\nnode scripts/deploy.mjs --target netlify' })}
        </div>
      </div>
    </div>
  </section>

  <section class="section tight">
    <div class="container">
      <div class="wizard-grid">
        <div class="panel">
          <h4>环境变量</h4>
          <div class="live-row"><span class="grow mono" style="font-size:12px">GITHUB_TOKEN</span><span class="val">GitHub PAT（repo）</span></div>
          <div class="live-row"><span class="grow mono" style="font-size:12px">GITHUB_REPO</span><span class="val">owner/name</span></div>
          <div class="live-row"><span class="grow mono" style="font-size:12px">NETLIFY_AUTH_TOKEN</span><span class="val">个人访问令牌</span></div>
          <div class="live-row"><span class="grow mono" style="font-size:12px">NETLIFY_SITE_ID</span><span class="val">站点 ID</span></div>
          <div class="live-row"><span class="grow mono" style="font-size:12px">SITE_BASE_PATH</span><span class="val">子路径，如 /dsh-academy/</span></div>
          <div class="live-row"><span class="grow mono" style="font-size:12px">PORT</span><span class="val">本地服务端口</span></div>
        </div>
        <div class="panel">
          <h4>发布前验收</h4>
          <div class="live-row"><span class="dot"></span><span class="grow">巡检数据完整（npm / releases / docs）</span><span class="val">必过</span></div>
          <div class="live-row"><span class="dot"></span><span class="grow">构建退出码为 0，search-index 可解析</span><span class="val">必过</span></div>
          <div class="live-row"><span class="dot"></span><span class="grow">首页 / 课程 / FAQ / 更新 四页可访问</span><span class="val">必过</span></div>
          <div class="live-row"><span class="dot"></span><span class="grow">移动端 390px 无横向滚动</span><span class="val">建议</span></div>
          <div class="live-row"><span class="dot"></span><span class="grow">视频与字体本地化，无外部 CDN</span><span class="val">已内置</span></div>
        </div>
      </div>
      <div class="tip" style="margin-top:18px">${icon('lock')}<span>密钥只放在环境变量或 CI Secrets 中。部署脚本不会把 token 写入任何文件；构建产物里也不包含凭据。</span></div>
    </div>
  </section>
</main>`
  return layout({ site, meta, base, page: 'deploy', title: '部署控制台', description: 'DeepSeek Harness 教学平台的自动化部署：本机、GitHub Pages、Docker、Netlify，以及每 3 天自动巡检的 Windows 计划任务与 GitHub Actions。', body })
}

/* ---------------------------------- 404 ---------------------------------- */
export function notFoundPage({ site, base, meta }) {
  const body = `<main id="main">
  <section class="page-hero" style="min-height:70vh;display:flex;align-items:center">
    <div class="container" style="text-align:center">
      <div class="eyebrow" style="justify-content:center">404</div>
      <h1 style="font-size:clamp(50px,8vw,90px)" class="gradient-text">页面走丢了</h1>
      <p class="lead" style="margin:16px auto 26px">这条路径不存在，可能是链接过期，或某次巡检改写了页面标题。</p>
      <div class="hero-cta" style="justify-content:center">
        <a class="btn btn-primary" href="${u(base, '/')}">${icon('arrowRight')} 回到首页</a>
        <a class="btn btn-ghost" href="${u(base, '/courses/')}">${icon('book')} 去课程列表</a>
      </div>
    </div>
  </section>
</main>`
  return layout({ site, meta, base, page: '404', title: '页面不存在', description: '页面不存在', body })
}
