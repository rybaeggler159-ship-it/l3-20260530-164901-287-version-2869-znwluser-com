(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var activeChip = 'all';

  if (filterInput && q) {
    filterInput.value = q;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : q);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-text'));
      var type = normalize(card.getAttribute('data-type'));
      var region = normalize(card.getAttribute('data-region'));
      var year = normalize(card.getAttribute('data-year'));
      var chipMatch = activeChip === 'all' || text.indexOf(activeChip) !== -1 || type.indexOf(activeChip) !== -1 || region.indexOf(activeChip) !== -1 || year.indexOf(activeChip) !== -1;
      var textMatch = !query || text.indexOf(query) !== -1;
      var show = chipMatch && textMatch;

      card.classList.toggle('is-hidden', !show);

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeChip = normalize(chip.getAttribute('data-chip-filter')) || 'all';
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyFilters();
    });
  });

  applyFilters();
})();
