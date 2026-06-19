(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (mobileToggle && mobilePanel) {
      mobileToggle.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(
      document.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll(".hero-dot"),
    );
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var searchForms = Array.prototype.slice.call(
      document.querySelectorAll("form[role='search']"),
    );
    searchForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[type='search']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    var pageInput = document.querySelector("#page-search");
    var yearSelect = document.querySelector("#year-filter");
    var regionSelect = document.querySelector("#region-filter");
    var filterButton = document.querySelector("#filter-button");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".searchable-card"),
    );
    var noResults = document.querySelector(".no-results");
    var globalBox = document.querySelector(".global-search-results");
    var params = new URLSearchParams(window.location.search);
    var initialSearch = params.get("search") || "";

    function normalize(text) {
      return String(text || "")
        .toLowerCase()
        .trim();
    }

    function cardMatches(card, keyword, year, region) {
      var haystack = normalize(
        [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
        ].join(" "),
      );
      var yearOk = !year || card.getAttribute("data-year") === year;
      var regionOk = !region || card.getAttribute("data-region") === region;
      return (
        yearOk && regionOk && (!keyword || haystack.indexOf(keyword) !== -1)
      );
    }

    function renderGlobal(keyword) {
      if (!globalBox || !keyword || !window.SITE_MOVIES) {
        if (globalBox) {
          globalBox.classList.remove("is-visible");
          globalBox.innerHTML = "";
        }
        return;
      }

      var results = window.SITE_MOVIES.filter(function (item) {
        return (
          normalize(
            [item.title, item.year, item.region, item.genre, item.tags].join(
              " ",
            ),
          ).indexOf(keyword) !== -1
        );
      }).slice(0, 18);

      if (!results.length) {
        globalBox.classList.remove("is-visible");
        globalBox.innerHTML = "";
        return;
      }

      globalBox.innerHTML = results
        .map(function (item) {
          return (
            '<a class="search-result-link" href="./' +
            item.url +
            '"><strong>' +
            item.title +
            "</strong><span>" +
            item.year +
            " · " +
            item.region +
            "</span></a>"
          );
        })
        .join("");
      globalBox.classList.add("is-visible");
    }

    function applyFilters() {
      var keyword = normalize(pageInput ? pageInput.value : initialSearch);
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var ok = cardMatches(card, keyword, year, region);
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle(
          "is-visible",
          cards.length > 0 && shown === 0,
        );
      }

      renderGlobal(keyword);
    }

    if (pageInput) {
      if (initialSearch) {
        pageInput.value = initialSearch;
      }
      pageInput.addEventListener("input", applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }

    if (regionSelect) {
      regionSelect.addEventListener("change", applyFilters);
    }

    if (filterButton) {
      filterButton.addEventListener("click", applyFilters);
    }

    if (initialSearch || pageInput || yearSelect || regionSelect) {
      applyFilters();
    }
  });
})();
