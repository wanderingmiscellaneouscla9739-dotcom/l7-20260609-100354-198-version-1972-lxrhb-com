(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.getElementById('mobileNav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var carousel = document.getElementById('heroCarousel');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var next = carousel.querySelector('[data-hero-next]');
    var prev = carousel.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
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
    };

    var startTimer = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    startTimer();
  }

  var searchInput = document.querySelector('[data-card-search]');

  if (searchInput) {
    var searchableItems = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row, .compact-card'));

    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();

      searchableItems.forEach(function (item) {
        var text = (
          item.getAttribute('data-title') + ' ' +
          item.getAttribute('data-year') + ' ' +
          item.getAttribute('data-region') + ' ' +
          item.getAttribute('data-tags') + ' ' +
          item.textContent
        ).toLowerCase();

        item.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    });
  }

  var video = document.getElementById('moviePlayer');

  if (video) {
    var source = video.getAttribute('data-src');
    var playButton = document.querySelector('[data-play-button]');
    var message = document.querySelector('[data-player-message]');

    var setMessage = function (text) {
      if (message && text) {
        message.textContent = text;
        message.classList.add('is-visible');
      }
    };

    var hideButton = function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    };

    var showButton = function () {
      if (playButton) {
        playButton.classList.remove('is-hidden');
      }
    };

    if (source) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('当前播放源暂时无法加载，请刷新页面后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    var playVideo = function () {
      var action = video.play();
      hideButton();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          showButton();
          setMessage('浏览器阻止了自动播放，请再次点击播放。');
        });
      }
    };

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('ended', showButton);
  }
})();
