(function () {
    'use strict';

    var BASE = 'https://image.tmdb.org/t/p/';

    // ==========================================
    //  1. CSS: backdrop с градиентом, текст поверх
    // ==========================================
    var style = document.createElement('style');
    style.id = 'wide-covers-plugin-style';
    style.textContent = [
        '.full-start-new__body {',
        '  flex-direction: column !important;',
        '  align-items: stretch !important;',
        '  position: relative !important;',
        '}',
        '.full-start-new__left {',
        '  width: 100% !important;',
        '  max-width: 100% !important;',
        '  margin-right: 0 !important;',
        '  margin-bottom: 0 !important;',
        '}',
        '.full-start-new__poster {',
        '  padding-bottom: 50% !important;',
        '  border-radius: 0 !important;',
        '  overflow: hidden !important;',
        '  position: relative !important;',
        '}',
        '.full-start-new__poster::after {',
        '  content: "" !important;',
        '  position: absolute !important;',
        '  bottom: 0 !important;',
        '  left: 0 !important;',
        '  right: 0 !important;',
        '  height: 75% !important;',
        '  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%) !important;',
        '  z-index: 1 !important;',
        '  pointer-events: none !important;',
        '}',
        '.full-start-new__poster .full-start-new__img {',
        '  object-fit: cover !important;',
        '  object-position: center 20% !important;',
        '  border-radius: 0 !important;',
        '}',
        '.full-start-new__right {',
        '  position: relative !important;',
        '  z-index: 2 !important;',
        '  margin-top: -12em !important;',
        '  padding-left: 1.5em !important;',
        '  padding-right: 1.5em !important;',
        '}',
        '.full-start-new__title {',
        '  -webkit-line-clamp: 2 !important;',
        '  line-clamp: 2 !important;',
        '  text-shadow: 0 0.1em 0.4em rgba(0,0,0,0.7) !important;',
        '}',
        '.full-start-new__description {',
        '  width: 100% !important;',
        '}',
        '.full-start-new__rate-line {',
        '  text-shadow: 0 0.05em 0.3em rgba(0,0,0,0.5) !important;',
        '}',
        '.full-start-new {',
        '  padding-bottom: 1em !important;',
        '}'
    ].join('\n');
    document.head.appendChild(style);

    // ==========================================
    //  2. Получить URL backdrop
    // ==========================================
    function getBackdropUrl(movie) {
        if (!movie) return '';

        // Если есть массив backdrops — берём самый большой
        if (movie.images && movie.images.backdrops && movie.images.backdrops.length) {
            var sorted = movie.images.backdrops.slice().sort(function (a, b) {
                return (b.width || 0) - (a.width || 0);
            });
            return BASE + 'original' + sorted[0].file_path;
        }

        if (movie.backdrop_path) {
            return BASE + 'original' + movie.backdrop_path;
        }

        return '';
    }

    // ==========================================
    //  3. Мгновенный перехват: когда Lampa ставит
    //     poster src — сразу меняем на backdrop
    // ==========================================
    var srcObserver = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (m.attributeName !== 'src') continue;

            var img = m.target;
            if (!img.classList || !img.classList.contains('full--poster')) continue;
            if (img.getAttribute('data-wide-done')) continue;

            var src = img.getAttribute('src') || '';

            // Пропускаем placeholder и broken
            if (!src || src.indexOf('img_load') !== -1 || src.indexOf('img_broken') !== -1) continue;

            // Получаем данные фильма
            var movie = null;
            try {
                var act = Lampa.Activity.active();
                movie = act && act.params ? act.params.movie : null;
            } catch (e) {
                continue;
            }

            if (!movie) continue;

            var backdropUrl = getBackdropUrl(movie);
            if (!backdropUrl) continue;

            // Проверяем: src уже backdrop? Не меняем.
            if (movie.backdrop_path && src.indexOf(movie.backdrop_path) !== -1) continue;

            // Меняем на backdrop сразу
            img.setAttribute('data-wide-done', '1');

            img.onload = function () {
                var p = this.closest('.full-start-new__poster');
                if (p) p.classList.add('loaded');
            };

            img.onerror = function () {
                // Fallback: w1280
                if (movie.backdrop_path) {
                    this.onerror = function () {};
                    this.src = BASE + 'w1280' + movie.backdrop_path;
                }
            };

            img.src = backdropUrl;
        }
    });

    srcObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['src'],
        subtree: true
    });

    // ==========================================
    //  4. Fallback: если перехват не сработал
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

            var backdropUrl = getBackdropUrl(movie);
            if (!backdropUrl) continue;

            img.setAttribute('data-wide-done', '1');

            img.onload = function () {
                var p = this.closest('.full-start-new__poster');
                if (p) p.classList.add('loaded');
            };

            img.onerror = function () {
                if (movie && movie.backdrop_path) {
                    this.onerror = function () {};
                    this.src = BASE + 'w1280' + movie.backdrop_path;
                }
            };

            img.src = backdropUrl;
        }
    }

    function initListeners() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(swapPoster, 50);
                setTimeout(swapPoster, 300);
            }
        });

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                setTimeout(swapPoster, 200);
            }
        });
    }

    // ==========================================
    //  5. Start
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

    if (window.Lampa && Lampa.Listener) {
        try { initListeners(); } catch (e) {}
    }

})();
