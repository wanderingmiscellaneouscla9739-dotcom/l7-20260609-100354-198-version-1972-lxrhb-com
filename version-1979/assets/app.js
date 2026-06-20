(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var list = document.querySelector("[data-filter-list]");
    if (!list || (!input && !select)) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-row"));
    var queryInput = document.querySelector("[data-query-input]");
    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        queryInput.value = q;
      }
    }
    function apply() {
      var term = input ? input.value.trim().toLowerCase() : "";
      var type = select ? select.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var cardType = (card.getAttribute("data-type") || text).toLowerCase();
        var visible = (!term || text.indexOf(term) !== -1) && (!type || cardType.indexOf(type) !== -1 || text.indexOf(type) !== -1);
        card.classList.toggle("is-hidden", !visible);
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function setupMoviePlayer(source) {
  var video = document.querySelector("[data-player-video]");
  var trigger = document.querySelector("[data-player-trigger]");
  var hlsInstance = null;
  var loaded = false;
  function load() {
    if (!video || loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    loaded = true;
  }
  function play() {
    if (!video) {
      return;
    }
    load();
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
    video.controls = true;
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }
  if (trigger) {
    trigger.addEventListener("click", play);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
