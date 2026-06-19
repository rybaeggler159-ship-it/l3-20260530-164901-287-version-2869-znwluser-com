
(function(){
  const data = window.SITE_DATA || { movies: [], categories: [] };
  const movies = data.movies || [];
  const movieMap = new Map(movies.map(m => [m.num, m]));

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function norm(s){ return String(s || '').toLowerCase(); }
  function clampText(s, n){
    s = String(s || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }
  function posterStyle(movie){
    const seed = movie.num || 1;
    const hueA = (seed * 37) % 360;
    const hueB = (hueA + 34) % 360;
    const hueC = (hueA + 84) % 360;
    return `--bgA:hsl(${hueA} 76% 42%);--bgB:hsl(${hueB} 70% 18%);--bgC:hsl(${hueC} 72% 30%)`;
  }
  function posterLabel(movie){
    return (movie.type_primary || movie.type || '').replace(/\s+/g, '').slice(0, 4) || '影片';
  }
  function buildPoster(movie, titleMode=false){
    const initial = (movie.title || '片').slice(0, 2);
    const title = titleMode ? '' : `<div class="poster-title">${movie.title}</div>`;
    return `
      <div class="poster" style="${posterStyle(movie)}">
        <div class="poster-tag">${posterLabel(movie)}</div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:18px;">
          <div style="width:100%;max-width:220px;aspect-ratio:1/1;border-radius:30px;background:linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.12);display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(10px);">
            <div style="text-align:center;padding:12px 14px;">
              <div style="font-size:42px;font-weight:900;line-height:1;color:#fff;text-shadow:0 10px 24px rgba(0,0,0,.35)">${initial}</div>
              <div style="margin-top:8px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.76)">${movie.year || ''}</div>
            </div>
          </div>
        </div>
        ${title}
      </div>`;
  }
  function movieCard(movie){
    const cat = movie.category || movie.genre || movie.type;
    const title = escapeHtml(movie.title);
    return `
      <article class="card" data-filterable="true" data-title="${norm(movie.title)}" data-genre="${norm(movie.genre)}" data-region="${norm(movie.region)}" data-type="${norm(movie.type)}" data-year="${movie.year}" data-category="${norm(cat)}">
        <a href="${movie.slug}.html" aria-label="${title}">${buildPoster(movie)}</a>
        <div class="card-body">
          <div class="card-meta"><span class="badge">${escapeHtml(movie.category || cat)}</span><span>${escapeHtml(movie.region || '')}</span><span>${escapeHtml(movie.year || '')}</span></div>
          <h3 class="card-title"><a href="${movie.slug}.html">${title}</a></h3>
          <p class="card-desc">${escapeHtml(movie.one_line || movie.summary || '')}</p>
          <div class="meter"><b>#${String(movie.num).padStart(4, '0')}</b><span>热度 ${movie.score || 0}</span></div>
          <div class="card-actions"><a class="btn primary" href="${movie.slug}.html">查看详情</a><button class="btn ghost js-quick-play" data-slug="${movie.slug}">在线播放</button></div>
        </div>
      </article>`;
  }
  function listRow(movie, index){
    const title = escapeHtml(movie.title);
    return `
      <div class="list-row" data-filterable="true" data-title="${norm(movie.title)}" data-genre="${norm(movie.genre)}" data-region="${norm(movie.region)}" data-type="${norm(movie.type)}" data-year="${movie.year}" data-category="${norm(movie.category)}">
        <div class="list-no">${String(index + 1).padStart(2, '0')}</div>
        <div>
          <div class="list-title"><a href="${movie.slug}.html">${title}</a></div>
          <div class="list-meta">${escapeHtml(movie.genre || '')} · ${escapeHtml(movie.region || '')} · ${escapeHtml(movie.year || '')}</div>
        </div>
        <div class="list-meta">${escapeHtml(movie.category || '')}</div>
        <div class="list-meta">热度 ${movie.score || 0}</div>
        <a class="btn primary" href="${movie.slug}.html">详情</a>
      </div>`;
  }
  function escapeHtml(str){
    return String(str || '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }
  function setActiveNav(){
    const page = document.body.dataset.page || '';
    qsa('.nav a').forEach(a => {
      if (a.dataset.page === page) a.classList.add('active');
    });
  }
  function applyFilter(root){
    const search = norm(qs('[data-search-input]', root)?.value || '');
    const genre = norm(qs('[data-filter-genre]', root)?.value || 'all');
    const region = norm(qs('[data-filter-region]', root)?.value || 'all');
    const year = norm(qs('[data-filter-year]', root)?.value || 'all');
    let visible = 0;
    qsa('[data-filterable="true"]', root).forEach(el => {
      const ok = (!search || el.dataset.title.includes(search) || el.dataset.genre.includes(search) || el.dataset.region.includes(search) || el.dataset.type.includes(search) || el.dataset.category.includes(search))
        && (genre === 'all' || el.dataset.genre.includes(genre) || el.dataset.category.includes(genre))
        && (region === 'all' || el.dataset.region.includes(region))
        && (year === 'all' || String(el.dataset.year) === year);
      el.dataset.hidden = ok ? 'false' : 'true';
      if (ok) visible += 1;
    });
    const counter = qs('[data-result-count]', root);
    if (counter) counter.textContent = visible;
    const empty = qs('[data-empty]', root);
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }

  function initHeroSearch(){
    qsa('.searchbar').forEach(bar => {
      const input = qs('input', bar);
      const button = qs('button', bar);
      if (!input || !button) return;
      const go = () => {
        const q = encodeURIComponent((input.value || '').trim());
        window.location.href = q ? `search.html?q=${q}` : 'search.html';
      };
      button.addEventListener('click', go);
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          go();
        }
      });
    });
  }

  function initSearchBlocks(){
    qsa('[data-search-root]').forEach(root => {
      qsa('input,select', root).forEach(el => el.addEventListener('input', () => applyFilter(root)));
      const reset = qs('[data-reset-filter]', root);
      if (reset) reset.addEventListener('click', () => {
        qsa('input,select', root).forEach(el => {
          if (el.tagName === 'INPUT') el.value = '';
          if (el.tagName === 'SELECT') el.value = 'all';
        });
        applyFilter(root);
      });
      applyFilter(root);
    });
  }
  function initHeroCarousel(){
    const stage = qs('[data-hero-stage]');
    if (!stage) return;
    const slides = qsa('.hero-slide', stage);
    const dots = qsa('.hero-dot', document);
    if (!slides.length) return;
    let current = 0;
    function show(i){
      slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
      current = i;
    }
    dots.forEach((dot, idx) => dot.addEventListener('click', () => show(idx)));
    show(0);
    setInterval(() => show((current + 1) % slides.length), 5000);
  }
  function initQuickPlay(){
    qsa('.js-quick-play').forEach(btn => btn.addEventListener('click', () => {
      const slug = btn.dataset.slug;
      if (slug) window.location.href = `${slug}.html#player`;
    }));
  }
  function initDetailPlayer(){
    const video = qs('[data-player-video]');
    const status = qs('[data-player-status]');
    const load = qs('[data-player-load]');
    const stream = qs('[data-player-stream]')?.dataset.stream || '';
    if (!video || !stream) return;
    const HlsCtor = window.Hls;
    function setStatus(text){ if (status) status.textContent = text; }
    function attach(){
      if (video.dataset.ready === '1') return;
      video.dataset.ready = '1';
      if (HlsCtor && HlsCtor.isSupported && HlsCtor.isSupported()) {
        const hls = new HlsCtor();
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(HlsCtor.Events && HlsCtor.Events.MANIFEST_PARSED || 'hlsManifestParsed', function(){
          setStatus('HLS 已就绪，点击播放即可开始观看。');
        });
        hls.on(HlsCtor.Events && HlsCtor.Events.ERROR || 'hlsError', function(_, data){
          setStatus('HLS 发生错误，已保留原始播放地址。');
          try { video.src = stream; } catch(e){}
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        setStatus('浏览器原生支持 HLS，已绑定 m3u8 播放源。');
      } else {
        video.src = document.body.dataset.fallbackMp4 || video.dataset.fallback || '';
        setStatus('当前浏览器未检测到 HLS 支持，已切换到备用播放源。');
      }
    }
    if (load) load.addEventListener('click', () => { attach(); video.play().catch(()=>{}); setStatus('正在尝试播放...'); });
    video.addEventListener('play', () => setStatus('正在播放'));
    video.addEventListener('pause', () => setStatus('已暂停'));
    attach();
  }
  function populateSearchPage(){
    const grid = qs('[data-search-grid]');
    if (!grid) return;
    const list = (window.SITE_DATA && window.SITE_DATA.movies) ? window.SITE_DATA.movies.slice() : [];
    grid.innerHTML = list.map(movieCard).join('');
    initQuickPlay();
  }
  function populateLists(){
    qsa('[data-movie-list]').forEach(el => {
      const kind = el.dataset.movieList;
      let list = movies.slice();
      if (kind === 'featured') list = list.slice(0, 24);
      if (kind === 'hot') list = list.slice().sort((a,b)=> (b.score||0) - (a.score||0)).slice(0, 50);
      if (kind === 'latest') list = list.slice().sort((a,b)=> (b.year||0) - (a.year||0)).slice(0, 50);
      if (kind === 'related') {
        const ids = (el.dataset.relatedIds || '').split(',').map(s => parseInt(s, 10)).filter(Boolean);
        list = ids.map(id => movieMap.get(id)).filter(Boolean);
      }
      if (kind === 'category') {
        const cat = el.dataset.category || '';
        list = list.filter(m => m.category === cat).slice(0, parseInt(el.dataset.limit || '60', 10));
      }
      if (kind === 'all') list = list.slice(0, parseInt(el.dataset.limit || '60', 10));
      el.innerHTML = list.map(movieCard).join('');
    });
  }
  function initDynamicPages(){
    populateLists();
    initQuickPlay();
    initHeroSearch();
    initSearchBlocks();
    populateSearchPage();
    initHeroCarousel();
    initDetailPlayer();
    setActiveNav();
  }
  document.addEventListener('DOMContentLoaded', initDynamicPages);
})();
