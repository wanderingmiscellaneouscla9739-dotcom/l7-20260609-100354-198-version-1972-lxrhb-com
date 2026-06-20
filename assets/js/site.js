(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var heroIndex = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === heroIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === heroIndex);
      });
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showHero(heroIndex + 1);
        }, 5800);
      }
    }

    if (slides.length) {
      showHero(0);
      restartHero();
      if (prev) {
        prev.addEventListener('click', function () {
          showHero(heroIndex - 1);
          restartHero();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showHero(heroIndex + 1);
          restartHero();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
          restartHero();
        });
      });
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var grid = scope.querySelector('[data-filter-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
      var input = scope.querySelector('[data-filter-input]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var regionSelect = scope.querySelector('[data-filter-region]');
      var sortSelect = scope.querySelector('[data-sort]');
      var emptyState = scope.querySelector('[data-empty-state]');

      function cardText(card) {
        return normalise([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
      }

      function applyFilter() {
        var query = normalise(input && input.value);
        var type = normalise(typeSelect && typeSelect.value);
        var region = normalise(regionSelect && regionSelect.value);
        var sortValue = sortSelect ? sortSelect.value : 'year-desc';
        var visible = 0;
        var ordered = cards.slice();

        ordered.sort(function (a, b) {
          if (sortValue === 'year-asc') {
            return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
          }
          if (sortValue === 'title-asc') {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
          }
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });

        ordered.forEach(function (card) {
          grid.appendChild(card);
          var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
          var matchesType = !type || normalise(card.getAttribute('data-type')).indexOf(type) !== -1;
          var matchesRegion = !region || normalise(card.getAttribute('data-region')).indexOf(region) !== -1;
          var matches = matchesQuery && matchesType && matchesRegion;
          card.classList.toggle('is-hidden', !matches);
          if (matches) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, typeSelect, regionSelect, sortSelect].forEach(function (element) {
        if (element) {
          element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', applyFilter);
        }
      });

      var queryInput = scope.querySelector('[data-query-input]');
      if (queryInput) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q');
        if (queryValue) {
          queryInput.value = queryValue;
        }
      }

      applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      if (!video || !overlay) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var attached = false;

      function attachStream() {
        if (attached) {
          return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.hlsInstance = hls;
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1600);
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function startPlayback() {
        overlay.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        attachStream().then(function () {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              overlay.classList.remove('is-hidden');
            });
          }
        });
      }

      overlay.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (!attached) {
          startPlayback();
        }
      });
    });
  });
})();
