(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');

  if (header && menuButton) {
    menuButton.addEventListener('click', function () {
      var isOpen = header.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var track = slider.querySelector('.hero-track');
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function move(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + current * 100 + '%)';

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        move(dotIndex);
        restart();
      });
    });

    move(0);
    restart();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchSelect = document.querySelector('[data-search-select]');
  var searchResults = document.querySelector('[data-search-results]');

  function renderSearch() {
    if (!searchInput || !searchResults || !window.SITE_CATALOG) {
      return;
    }

    var keyword = searchInput.value.trim().toLowerCase();
    var region = searchSelect ? searchSelect.value : '';

    if (!keyword && !region) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    var matches = window.SITE_CATALOG.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags
      ].join(' ').toLowerCase();
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var regionMatch = !region || item.region === region;
      return keywordMatch && regionMatch;
    }).slice(0, 24);

    if (!matches.length) {
      searchResults.classList.add('active');
      searchResults.innerHTML = '<p class="section-desc">换一个关键词继续浏览更多影片。</p>';
      return;
    }

    searchResults.classList.add('active');
    searchResults.innerHTML = '<div class="movie-grid">' + matches.map(function (item) {
      return '<article class="movie-card compact-card">' +
        '<a class="card-cover" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="play-mark">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + item.year + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '</div>' +
        '</article>';
    }).join('') + '</div>';
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderSearch);
  }

  if (searchSelect) {
    searchSelect.addEventListener('change', renderSearch);
  }

  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));

  if (chips.length && filterCards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-chip');

        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });

        filterCards.forEach(function (card) {
          var show = value === 'all' || card.getAttribute('data-category') === value;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  var configNode = document.getElementById('video-config');
  var player = document.querySelector('[data-player]');

  if (configNode && player) {
    var config = JSON.parse(configNode.textContent);
    var video = player.querySelector('video');
    var layer = player.querySelector('.play-layer');
    var button = player.querySelector('.play-button');
    var hlsInstance = null;

    function attachVideo() {
      if (!video || video.dataset.ready === '1') {
        return;
      }

      var sourceUrl = config.src;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else {
        video.src = sourceUrl;
      }

      video.dataset.ready = '1';
    }

    function beginPlay(event) {
      if (event) {
        event.preventDefault();
      }

      attachVideo();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', beginPlay);
    }

    if (layer) {
      layer.addEventListener('click', beginPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.dataset.ready !== '1') {
          beginPlay();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
