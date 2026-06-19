(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function getSearchText(card) {
    return (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
  }

  function renderSearchPanel(panel, query) {
    if (!panel) {
      return;
    }

    var keyword = query.trim().toLowerCase();
    if (!keyword) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }

    var source = window.MOVIE_INDEX || [];
    var results = source.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.tags]
        .join(" ")
        .toLowerCase()
        .indexOf(keyword) !== -1;
    }).slice(0, 8);

    if (!results.length) {
      panel.innerHTML = "<p>没有找到匹配影片</p>";
      panel.classList.add("is-open");
      return;
    }

    panel.innerHTML = results.map(function (item) {
      return '<a href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><br><small>' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</small></a>';
    }).join("");
    panel.classList.add("is-open");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function filterNearestGrid(form, query) {
    var block = form.closest("section") || document;
    var cards = Array.prototype.slice.call(block.querySelectorAll("[data-filter-grid] .movie-card"));
    var keyword = query.trim().toLowerCase();

    cards.forEach(function (card) {
      var matched = !keyword || getSearchText(card).indexOf(keyword) !== -1;
      card.classList.toggle("hidden-by-filter", !matched);
    });
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".site-search"));

    forms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var panel = form.querySelector(".search-panel");

      if (!input) {
        return;
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        filterNearestGrid(form, input.value);
        renderSearchPanel(panel, input.value);
      });

      input.addEventListener("input", function () {
        filterNearestGrid(form, input.value);
        renderSearchPanel(panel, input.value);
      });

      input.addEventListener("focus", function () {
        renderSearchPanel(panel, input.value);
      });
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".site-search")) {
        document.querySelectorAll(".search-panel").forEach(function (panel) {
          panel.classList.remove("is-open");
        });
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-src");
      var hlsInstance = null;
      var prepared = false;

      if (!video || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function prepare() {
        if (prepared) {
          return Promise.resolve();
        }

        prepared = true;
        setStatus("视频加载中…");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("");
          return Promise.resolve();
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
            setStatus("");
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频暂时无法加载，请稍后重试");
            }
          });

          return Promise.resolve();
        }

        video.src = source;
        setStatus("");
        return Promise.resolve();
      }

      function play() {
        prepare().then(function () {
          var promise = video.play();
          player.classList.add("is-playing");

          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              player.classList.remove("is-playing");
              setStatus("点击播放器控制栏开始播放");
            });
          }
        });
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        setStatus("");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });

      video.addEventListener("error", function () {
        setStatus("视频暂时无法加载，请稍后重试");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initSearch();
    initPlayers();
  });
})();
