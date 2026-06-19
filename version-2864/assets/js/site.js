(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5800);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var root = scope.parentElement || document;
      var searchInput = scope.querySelector('[data-search-input]');
      var regionFilter = scope.querySelector('[data-region-filter]');
      var yearFilter = scope.querySelector('[data-year-filter]');
      var emptyState = scope.querySelector('[data-empty-state]');
      var cards = selectAll('[data-filter-card]', root);
      var chips = selectAll('[data-category-chip]', scope);
      var activeCategory = 'all';

      function applyFilters() {
        var query = normalize(searchInput && searchInput.value);
        var region = regionFilter ? regionFilter.value : '';
        var year = yearFilter ? yearFilter.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchRegion = !region || card.getAttribute('data-region') === region;
          var matchYear = !year || card.getAttribute('data-year') === year;
          var matchCategory = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
          var isVisible = matchQuery && matchRegion && matchYear && matchCategory;

          card.classList.toggle('is-filtered-out', !isVisible);

          if (isVisible) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }

      if (regionFilter) {
        regionFilter.addEventListener('change', applyFilters);
      }

      if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeCategory = chip.getAttribute('data-category-chip') || 'all';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          applyFilters();
        });
      });

      applyFilters();
    });
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var playButton = shell.querySelector('[data-play-button]');
      var status = shell.querySelector('[data-player-status]');
      var source = video ? video.getAttribute('data-src') : '';
      var hlsInstance = null;
      var initialized = false;

      if (!video || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function requestPlay() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('请再次点击播放按钮开始播放');
          });
        }
      }

      function initializeSource() {
        if (initialized) {
          requestPlay();
          return;
        }

        initialized = true;
        setStatus('正在加载播放源');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', requestPlay, { once: true });
          video.load();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('');
            requestPlay();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请稍后重试');
            }
          });
          return;
        }

        setStatus('当前浏览器需要支持 HLS 才能播放此视频源');
      }

      function startPlayback() {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
        initializeSource();
      }

      if (playButton) {
        playButton.addEventListener('click', startPlayback);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener('playing', function () {
        setStatus('');
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
