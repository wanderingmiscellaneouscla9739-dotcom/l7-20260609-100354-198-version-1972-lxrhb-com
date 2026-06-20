(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        setupHero();
        setupFilters();
        setupPlayer();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (slides.length <= 1) {
                return;
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot") || 0);
                show(index);
                restart();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var section = root.closest(".section-inner") || document;
            var input = root.querySelector("[data-search-input]");
            var year = root.querySelector("[data-year-filter]");
            var region = root.querySelector("[data-region-filter]");
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var empty = section.querySelector("[data-empty-result]");

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var selectedYear = year ? year.value : "";
                var selectedRegion = region ? region.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
                    var shouldShow = matchQuery && matchYear && matchRegion;

                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            apply();
        });
    }

    function setupPlayer() {
        var video = document.querySelector("[data-player]");
        var trigger = document.querySelector("[data-play-trigger]");

        if (!video || !trigger) {
            return;
        }

        var stream = video.getAttribute("data-stream");
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared || !stream) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function play() {
            prepare();
            trigger.classList.add("is-hidden");
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    trigger.classList.remove("is-hidden");
                });
            }
        }

        trigger.addEventListener("click", play);

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            trigger.classList.add("is-hidden");
        });

        video.addEventListener("pause", function () {
            if (!video.ended) {
                trigger.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }
}());
