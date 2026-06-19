(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Hero carousel
  const track = document.querySelector('[data-hero-track]');
  const dotsWrap = document.querySelector('[data-hero-dots]');
  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    let index = 0;
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', '切换推荐 ' + (i + 1));
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach((d, j) => d.classList.toggle('active', j === index));
    }
    setInterval(() => go(index + 1), 5200);
  }

  // search & filter on card lists
  const toolbar = document.querySelector('[data-filter-toolbar]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  if (toolbar && cards.length) {
    const q = toolbar.querySelector('[data-q]');
    const region = toolbar.querySelector('[data-region]');
    const type = toolbar.querySelector('[data-type]');
    const sort = toolbar.querySelector('[data-sort]');
    const empty = document.querySelector('[data-empty]');

    function apply() {
      const query = (q && q.value || '').trim().toLowerCase();
      const regionVal = region && region.value || 'all';
      const typeVal = type && type.value || 'all';
      const sortVal = sort && sort.value || 'default';
      let visible = cards.filter(card => {
        const hay = (card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.genre + ' ' + card.dataset.tags).toLowerCase();
        const okQ = !query || hay.includes(query);
        const okRegion = regionVal === 'all' || card.dataset.region === regionVal;
        const okType = typeVal === 'all' || card.dataset.type === typeVal;
        return okQ && okRegion && okType;
      });
      visible.sort((a, b) => {
        const sa = +a.dataset.score || 0;
        const sb = +b.dataset.score || 0;
        const ya = +a.dataset.year || 0;
        const yb = +b.dataset.year || 0;
        if (sortVal === 'year') return yb - ya || sb - sa;
        if (sortVal === 'score') return sb - sa || yb - ya;
        return 0;
      });
      cards.forEach(card => card.classList.add('hidden'));
      visible.forEach(card => card.classList.remove('hidden'));
      if (empty) empty.classList.toggle('hidden', visible.length !== 0);
    }
    [q, region, type, sort].forEach(el => el && el.addEventListener('input', apply));
    apply();
  }

  // detail player
  const player = document.querySelector('[data-player]');
  if (player) {
    const video = player.querySelector('video');
    const playBtn = player.querySelector('[data-play]');
    const sourceButtons = Array.from(document.querySelectorAll('[data-source]'));
    let current = null;
    let hls = null;

    function useSource(src, kind) {
      current = src;
      sourceButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.source === src));
      if (hls) {
        hls.destroy();
        hls = null;
      }
      if (kind === 'm3u8' && window.Hls && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      video.load();
    }

    sourceButtons.forEach(btn => {
      btn.addEventListener('click', () => useSource(btn.dataset.source, btn.dataset.kind));
    });
    if (sourceButtons[0]) {
      useSource(sourceButtons[0].dataset.source, sourceButtons[0].dataset.kind);
    }
    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        try { await video.play(); } catch (e) {}
      });
    }
  }
})();
