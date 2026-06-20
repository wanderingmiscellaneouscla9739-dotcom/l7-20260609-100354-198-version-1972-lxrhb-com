(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    var source = window.SEARCH_INDEX || [];

    function paramsQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function card(item) {
        return [
            '<article class="movie-card" data-movie-card>',
            '<a href="' + item.url + '">',
            '<div class="movie-cover"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="play-chip">▶</span></div>',
            '<div class="movie-info">',
            '<div class="meta-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
            '<h3>' + escapeHtml(item.title) + '</h3>',
            '<p>' + escapeHtml(item.summary) + '</p>',
            '<div class="card-foot"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function render(query) {
        var normalized = query.trim().toLowerCase();
        var matched = normalized
            ? source.filter(function (item) {
                return item.text.toLowerCase().indexOf(normalized) !== -1;
            })
            : source.slice(0, 48);

        matched = matched.slice(0, 120);

        if (results) {
            results.innerHTML = matched.map(card).join('');
        }

        if (empty) {
            empty.classList.toggle('is-visible', matched.length === 0);
        }
    }

    if (input) {
        input.value = paramsQuery();
        input.addEventListener('input', function () {
            render(input.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value.trim() : '';
            var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
            window.history.replaceState({}, '', url);
            render(query);
        });
    }

    render(input ? input.value : '');
})();
