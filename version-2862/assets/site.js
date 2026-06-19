(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    function showSlide(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const yearSelect = scope.querySelector('[data-year-filter]');
    const typeSelect = scope.querySelector('[data-type-filter]');
    const count = scope.querySelector('[data-filter-count]');
    const list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(' '));
        const matchQuery = !query || haystack.includes(query);
        const matchYear = !year || normalize(card.dataset.year) === year;
        const matchType = !type || normalize(card.dataset.type) === type;
        const shouldShow = matchQuery && matchYear && matchType;
        card.classList.toggle('is-hidden-card', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();
