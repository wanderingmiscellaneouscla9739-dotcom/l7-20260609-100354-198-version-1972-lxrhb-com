(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-site-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  all('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var select = scope.querySelector('[data-filter-select]');
    var cards = all('[data-movie-card]', scope);
    var empty = scope.querySelector('[data-empty-state]');

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var filter = select ? select.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var value = (card.getAttribute('data-filter-value') || '').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedFilter = !filter || value.indexOf(filter) !== -1;
        var matched = matchedKeyword && matchedFilter;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    if (select) {
      select.addEventListener('change', applyFilters);
    }
  });

  all('[data-hero]').forEach(function (hero) {
    var slides = all('.hero-slide', hero);
    var dots = all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      if (timer || slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        window.clearInterval(timer);
        timer = null;
        start();
      });
    });

    show(0);
    start();
  });
})();
