(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    var forms = selectAll('[data-filter-form], [data-filter-panel]');
    var cards = selectAll('[data-card]');
    if (!forms.length || !cards.length) {
      return;
    }
    var empty = document.querySelector('[data-empty-state]');
    function apply() {
      var keywordInputs = selectAll('[data-filter-input]');
      var typeSelect = document.querySelector('[data-filter-type]');
      var yearSelect = document.querySelector('[data-filter-year]');
      var keyword = normalize(keywordInputs.map(function (input) {
        return input.value;
      }).filter(Boolean).join(' '));
      var typeValue = normalize(typeSelect ? typeSelect.value : '');
      var yearValue = normalize(yearSelect ? yearSelect.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;
        if (keyword && searchText.indexOf(keyword) === -1) {
          matched = false;
        }
        if (typeValue && cardType.indexOf(typeValue) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    selectAll('[data-filter-input], [data-filter-type], [data-filter-year]').forEach(function (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    });
  }

  function initPlayer() {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-button]');
    var overlay = document.querySelector('[data-player-overlay]');
    if (!video || !button) {
      return;
    }
    var streamUrl = video.getAttribute('data-stream');
    var loaded = false;
    function attachStream() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
    }
    function playVideo() {
      attachStream();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }
    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
