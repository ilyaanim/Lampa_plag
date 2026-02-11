(function () {
    'use strict';

    // ==========================================
    //  1. Inject CSS immediately (no body class needed)
    // ==========================================
    var style = document.createElement('style');
    style.id = 'wide-covers-plugin-style';
    style.textContent = [
        '.full-start-new__body { flex-direction: column !important; align-items: stretch !important; }',
        '.full-start-new__left { width: 100% !important; max-width: 100% !important; margin-right: 0 !important; margin-bottom: 1.5em !important; }',
        '.full-start-new__poster { padding-bottom: 45% !important; border-radius: 1.2em !important; overflow: hidden !important; }',
        '.full-start-new__poster .full-start-new__img { object-fit: cover !important; object-position: center 20% !important; border-radius: 1.2em !important; }',
        '.full-start-new__description { width: 100% !important; }',
        '.full-start-new__title { -webkit-line-clamp: 2 !important; line-clamp: 2 !important; }'
    ].join('\n');
    document.head.appendChild(style);

    // ==========================================
    //  2. Swap poster → backdrop on Full Detail page
    // ==========================================
    function swapPoster() {
        var imgs = document.querySelectorAll('.full-start-new .full--poster');

        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];
            if (img.getAttribute('data-wide-done')) continue;

            var movie = null;
            try {
                var act = Lampa.Activity.active();
                movie = act && act.params ? act.params.movie : null;
            } catch (e) {
                continue;
            }

            if (!movie || !movie.backdrop_path) continue;

            img.setAttribute('data-wide-done', '1');

            var url = 'https://image.tmdb.org/t/p/w1280' + movie.backdrop_path;

            img.onload = function () {
                var p = this.closest('.full-start-new__poster');
                if (p) p.classList.add('loaded');
            };

            img.onerror = function () {
                // fallback — keep original poster
            };

            img.src = url;
        }
    }

    // ==========================================
    //  3. Listen to ALL relevant Lampa events
    // ==========================================
    function initListeners() {
        // 'full' event — fires when movie detail page is loaded
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(swapPoster, 50);
                setTimeout(swapPoster, 300);
                setTimeout(swapPoster, 1000);
            }
        });

        // 'activity' event — fires on screen transitions
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                setTimeout(swapPoster, 200);
                setTimeout(swapPoster, 800);
            }
        });
    }

    // ==========================================
    //  4. Start
    // ==========================================
    if (window.appready) {
        initListeners();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                initListeners();
            }
        });
    }

    // Also register listeners immediately in case 'ready' already fired
    if (window.Lampa && Lampa.Listener) {
        try { initListeners(); } catch (e) {}
    }

})();
