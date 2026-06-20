(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      show(0);
      start();
    }

    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));

    filters.forEach(function (input) {
      if (input.hasAttribute("data-load-query")) {
        var params = new URLSearchParams(window.location.search);
        var value = params.get("q");
        if (value) {
          input.value = value;
        }
      }

      function apply() {
        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
          card.classList.toggle("hidden-card", query && text.indexOf(query) === -1);
        });
      }

      input.addEventListener("input", apply);
      apply();
    });
  });
})();
