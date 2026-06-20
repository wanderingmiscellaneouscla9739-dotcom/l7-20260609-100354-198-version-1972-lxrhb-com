(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    initHeroSlider();
    initFilters();
    initPlayers();
  });

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var input = document.querySelector("[data-filter-input]");
    var clear = document.querySelector("[data-filter-clear]");
    var year = document.querySelector("[data-filter-year]");
    var type = document.querySelector("[data-filter-type]");
    var category = document.querySelector("[data-filter-category]");
    var empty = document.querySelector("[data-empty-state]");

    if (!cards.length || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || params.get("tag") || "";
    if (q) {
      input.value = q;
    }

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var categoryValue = category ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
        var matched = matchesKeyword && matchesYear && matchesType && matchesCategory;

        card.classList.toggle("hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        if (year) {
          year.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (category && !category.hasAttribute("data-lock")) {
          category.value = "";
        }
        apply();
      });
    }

    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-cover");
      var src = box.getAttribute("data-video");
      var loaded = false;
      var hls = null;

      if (!video || !src) {
        return;
      }

      function load() {
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
          } else {
            video.src = src;
          }
          loaded = true;
        }

        if (button) {
          button.classList.add("is-hidden");
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", load);
      }

      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          load();
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }
})();
