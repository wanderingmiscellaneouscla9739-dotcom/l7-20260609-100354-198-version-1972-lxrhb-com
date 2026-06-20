(function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

    forms.forEach(function (form) {
        var input = form.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-filter-list]");
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]")) : [];
        var url = new URL(window.location.href);
        var query = url.searchParams.get("q") || "";

        if (input && query) {
            input.value = query;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selects = Array.prototype.slice.call(form.querySelectorAll("[data-filter-select]"));

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-title") || "").toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;

                selects.forEach(function (select) {
                    var key = select.getAttribute("data-filter-select");
                    var value = select.value;
                    var cardValue = card.getAttribute("data-" + key) || "";

                    if (value && cardValue !== value) {
                        matched = false;
                    }
                });

                card.hidden = !matched;
            });
        }

        form.addEventListener("input", applyFilter);
        form.addEventListener("change", applyFilter);
        form.addEventListener("submit", function (event) {
            if (cards.length) {
                event.preventDefault();
                applyFilter();
            }
        });

        applyFilter();
    });
})();
