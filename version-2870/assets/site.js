(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function initMenu() {
        var button = one('.menu-toggle');
        var nav = one('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var slides = all('.hero-slide');
        var tabs = all('.hero-tab');
        if (!slides.length || !tabs.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            tabs.forEach(function (tab, i) {
                tab.classList.toggle('is-active', i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function initFilters() {
        var containers = all('[data-filter-scope]');
        containers.forEach(function (container) {
            var input = one('.js-filter-input', container);
            var type = one('.js-filter-type', container);
            var year = one('.js-filter-year', container);
            var cards = all('.movie-card', container);
            var empty = one('.empty-state', container);
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : '';
                var t = type ? type.value.trim().toLowerCase() : '';
                var y = year ? year.value.trim() : '';
                var shown = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-year') || ''
                    ].join(' ').toLowerCase();
                    var typeText = (card.getAttribute('data-type') || '').toLowerCase();
                    var yearText = card.getAttribute('data-year') || '';
                    var match = (!q || text.indexOf(q) !== -1) && (!t || typeText.indexOf(t) !== -1) && (!y || yearText === y);
                    card.style.display = match ? '' : 'none';
                    if (match) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', shown === 0);
                }
            }
            [input, type, year].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', apply);
                    el.addEventListener('change', apply);
                }
            });
        });
    }

    window.setupVideoPlayer = function (videoId, overlayId, buttonId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var button = document.getElementById(buttonId);
        if (!video || !source) {
            return;
        }
        var bound = false;
        function bindSource() {
            if (bound) {
                return;
            }
            bound = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function start() {
            bindSource();
            if (overlay) {
                overlay.classList.add('player-overlay-hidden');
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
}());
