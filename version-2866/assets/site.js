(function () {
  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
        play();
      });
    });

    activate(0);
    play();
  }

  function setupFilters() {
    var shell = document.querySelector("[data-filter-shell]");
    var grid = document.querySelector("[data-card-grid]");
    if (!shell || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var input = shell.querySelector("[data-filter-search]");
    var region = shell.querySelector("[data-filter-region]");
    var type = shell.querySelector("[data-filter-type]");
    var genre = shell.querySelector("[data-filter-genre]");
    var category = shell.querySelector("[data-filter-category]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q");

    if (queryValue && input) {
      input.value = queryValue;
    }

    function match(card) {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var genreValue = normalize(genre && genre.value);
      var categoryValue = normalize(category && category.value);
      var text = normalize(card.getAttribute("data-text"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardType = normalize(card.getAttribute("data-type"));
      var cardGenre = normalize(card.getAttribute("data-genre"));
      var cardCategory = normalize(card.getAttribute("data-category"));
      return (!query || text.indexOf(query) !== -1) &&
        (!regionValue || cardRegion === regionValue) &&
        (!typeValue || cardType === typeValue) &&
        (!genreValue || cardGenre.indexOf(genreValue) !== -1) &&
        (!categoryValue || cardCategory === categoryValue);
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("visible", visible === 0);
      }
    }

    [input, region, type, genre, category].forEach(function (field) {
      if (!field) {
        return;
      }
      field.addEventListener(field.tagName === "INPUT" ? "input" : "change", apply);
    });

    apply();
  }

  function setupPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var layer = box.querySelector(".player-layer");
      if (!video) {
        return;
      }

      var started = false;
      var stream = video.getAttribute("data-stream");

      function start() {
        if (!stream) {
          return;
        }
        if (!started) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
          } else {
            video.src = stream;
          }
          started = true;
        }

        if (layer) {
          layer.classList.add("hidden");
        }

        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (layer) {
              layer.classList.remove("hidden");
            }
          });
        }
      }

      if (layer) {
        layer.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
