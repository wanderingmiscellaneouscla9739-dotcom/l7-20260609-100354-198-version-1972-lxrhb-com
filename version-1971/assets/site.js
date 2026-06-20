(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startSlides() {
        if (slides.length < 2) {
            return;
        }

        slideTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (slideTimer) {
                window.clearInterval(slideTimer);
            }

            showSlide(index);
            startSlides();
        });
    });

    showSlide(0);
    startSlides();

    Array.prototype.slice.call(document.querySelectorAll('[data-strip-button]')).forEach(function (button) {
        button.addEventListener('click', function () {
            var target = document.querySelector(button.getAttribute('data-strip-target'));
            if (!target) {
                return;
            }

            var direction = button.getAttribute('data-strip-button') === 'left' ? -1 : 1;
            target.scrollBy({ left: direction * 420, behavior: 'smooth' });
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-filter-year]');
        var region = scope.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var empty = scope.querySelector('[data-filter-empty]');

        function getValue(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function applyFilter() {
            var query = getValue(input);
            var selectedYear = getValue(year);
            var selectedRegion = getValue(region);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesYear = !selectedYear || cardYear === selectedYear;
                var matchesRegion = !selectedRegion || cardRegion === selectedRegion;
                var show = matchesQuery && matchesYear && matchesRegion;

                card.classList.toggle('hidden-by-filter', !show);

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, year, region].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
    });
})();
