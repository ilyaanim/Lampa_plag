(function () {
    'use strict';

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
    //  2. Построить URL через Lampa API (с прокси)
    // ==========================================
    function buildImgUrl(path, size) {
        if (!path) return '';
        size = size || 'original';
        try {
            // Lampa.Api.img() — правильный способ, учитывает прокси
            return Lampa.Api.img(path, size);
        } catch (e) {}
        try {
            return Lampa.TMDB.image('t/p/' + size + path);
        } catch (e) {}
        return 'https://image.tmdb.org/t/p/' + size + path;
    }

    // ==========================================
    //  3. Подмена постера на backdrop
    // ==========================================
    function swapPoster() {
        var img = document.querySelector('.full-start-new .full--poster');
        if (!img) return false;
        if (img.getAttribute('data-wide-done') === '1') return true;

        var movie = null;
        try {
            var act = Lampa.Activity.active();
            movie = act && act.params ? act.params.movie : null;
        } catch (e) {
            return false;
        }

        if (!movie || !movie.backdrop_path) return false;

        img.setAttribute('data-wide-done', '1');

        // original → w1280 fallback
        var urlOriginal = buildImgUrl(movie.backdrop_path, 'original');
        var urlFallback = buildImgUrl(movie.backdrop_path, 'w1280');

        img.onload = function () {
            var p = this.closest('.full-start-new__poster');
            if (p) p.classList.add('loaded');
        };

        img.onerror = function () {
            this.onerror = function () {};
            this.src = urlFallback;
        };

        img.src = urlOriginal;

        return true;
    }

    // ==========================================
    //  4. Агрессивный retry пока не сработает
    // ==========================================
    function trySwapWithRetry(attempts, delay) {
        if (attempts <= 0) return;
        if (swapPoster()) return;

        setTimeout(function () {
            trySwapWithRetry(attempts - 1, delay);
        }, delay);
    }

    // ==========================================
    //  5. Listeners
    // ==========================================
    function initListeners() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                trySwapWithRetry(10, 100);
            }
        });

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                trySwapWithRetry(10, 150);
            }
        });
    }

    // ==========================================
    //  6. Start
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
