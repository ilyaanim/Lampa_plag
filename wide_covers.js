(function () {
    'use strict';

    // ==========================================
    //  1. CSS
    // ==========================================
    var style = document.createElement('style');
    style.id = 'wide-covers-plugin-style';
    style.textContent = [
        // --- Layout: вертикальный ---
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

        // --- Poster: широкий с fade ---
        '.full-start-new__poster {',
        '  padding-bottom: 50% !important;',
        '  border-top-left-radius: 2em !important;',
        '  border-top-right-radius: 2em !important;',
        '  border-bottom-left-radius: 0 !important;',
        '  border-bottom-right-radius: 0 !important;',
        '  overflow: hidden !important;',
        '  position: relative !important;',
        '}',
        '.full-start-new__poster::after {',
        '  display: none !important;',
        '}',
        '.full-start-new__poster::before {',
        '  content: "" !important;',
        '  position: absolute !important;',
        '  top: 0 !important;',
        '  left: 0 !important;',
        '  width: 60% !important;',
        '  height: 100% !important;',
        '  background: linear-gradient(to right, rgba(0,0,0,0.10) 0%, transparent 100%) !important;',
        '  z-index: 1 !important;',
        '  pointer-events: none !important;',
        '  border-top-left-radius: 2em !important;',
        '}',
        '.full-start-new__poster .full-start-new__img {',
        '  object-fit: cover !important;',
        '  object-position: center 20% !important;',
        '  border-top-left-radius: 2em !important;',
        '  border-top-right-radius: 2em !important;',
        '  border-bottom-left-radius: 0 !important;',
        '  border-bottom-right-radius: 0 !important;',
        '  -webkit-mask-image: linear-gradient(to bottom, white 50%, transparent 100%) !important;',
        '  mask-image: linear-gradient(to bottom, white 50%, transparent 100%) !important;',
        '}',

        // --- Правая часть: поверх постера ---
        '.full-start-new__right {',
        '  position: relative !important;',
        '  z-index: 2 !important;',
        '  margin-top: -30em !important;',
        '  padding-left: 1.5em !important;',
        '  padding-right: 1.5em !important;',
        '}',

        // --- Выровнять секции ниже постера ---
        '.full-start-new ~ div,',
        '.full-start-new ~ section {',
        '  padding-left: 1.5em !important;',
        '  padding-right: 1.5em !important;',
        '}',
        '.full-start-new__title {',
        '  -webkit-line-clamp: 2 !important;',
        '  line-clamp: 2 !important;',
        '  text-shadow: none !important;',
        '}',
        // --- Логотип вместо текста ---
        '.full-start-new__title.has-logo {',
        '  display: block !important;',
        '  -webkit-line-clamp: unset !important;',
        '  line-clamp: unset !important;',
        '  overflow: visible !important;',
        '  -webkit-box-orient: unset !important;',
        '  font-size: 0 !important;',
        '}',
        '.full-start-new__title .wide-logo {',
        '  max-width: 18rem !important;',
        '  max-height: 6rem !important;',
        '  width: auto !important;',
        '  height: auto !important;',
        '  object-fit: contain !important;',
        '  object-position: left center !important;',
        '  display: block !important;',
        '  filter: drop-shadow(0 0.1rem 0.3rem rgba(0,0,0,0.5)) !important;',
        '}',
        '.full-start-new__description {',
        '  width: 100% !important;',
        '}',
        '.full-start-new__rate-line {',
        '  text-shadow: none !important;',
        '}',
        '.full-start-new {',
        '  padding-bottom: 1em !important;',
        '}',

        // --- Blur на фоновый backdrop ---
        '.full-start__background {',
        '  filter: blur(20px) brightness(0.4) !important;',
        '  -webkit-filter: blur(20px) brightness(0.4) !important;',
        '}',

        // --- Кнопки ---
        '.full-start-new__buttons .button--play span {',
        '  display: inline !important;',
        '}',
        '.full-start-new__buttons .full-start__button:not(.button--play) span {',
        '  display: none !important;',
        '}',

        // --- Скрыть реакции ---
        '.full-start-new__reactions {',
        '  display: none !important;',
        '}',

        // --- Плашки (TV, качество и др.) на постере ---
        '.full-start-new__poster .card__type {',
        '  position: absolute !important;',
        '  top: 1.2em !important;',
        '  left: 1.2em !important;',
        '  right: auto !important;',
        '  bottom: auto !important;',
        '  padding: 0.5em 0.7em !important;',
        '  font-size: 1.1em !important;',
        '  font-weight: 700 !important;',
        '  line-height: 1 !important;',
        '  border-radius: 0.6em !important;',
        '  z-index: 3 !important;',
        '  letter-spacing: 0.05em !important;',
        '}'
    ].join('\n');
    document.head.appendChild(style);

    // ==========================================
    //  2. Получить данные фильма из Activity
    // ==========================================
    function getMovie() {
        try {
            var act = Lampa.Activity.active();
            if (!act) return null;
            if (act.card && act.card.backdrop_path) return act.card;
            if (act.params && act.params.movie && act.params.movie.backdrop_path) return act.params.movie;
            if (act.movie && act.movie.backdrop_path) return act.movie;
            if (act.data && act.data.movie && act.data.movie.backdrop_path) return act.data.movie;
        } catch (e) {}
        return null;
    }

    // ==========================================
    //  3. Подменить постер на backdrop
    // ==========================================
    function swapPoster() {
        var img = document.querySelector('.full-start-new .full--poster');
        if (!img) return false;
        if (img.getAttribute('data-wide-done') === '1') return true;

        var currentSrc = img.getAttribute('src') || img.src || '';
        if (!currentSrc || currentSrc.indexOf('/t/p/') === -1) return false;

        var movie = getMovie();
        if (!movie) return false;

        img.setAttribute('data-wide-done', '1');

        var queryStart = currentSrc.indexOf('?');
        var query = queryStart !== -1 ? currentSrc.substring(queryStart) : '';
        var baseUrl = queryStart !== -1 ? currentSrc.substring(0, queryStart) : currentSrc;

        var tpIndex = baseUrl.indexOf('/t/p/');
        if (tpIndex === -1) return false;

        var prefix = baseUrl.substring(0, tpIndex);
        var newSrc = prefix + '/t/p/original' + movie.backdrop_path + query;
        var fallbackSrc = prefix + '/t/p/w1280' + movie.backdrop_path + query;

        img.onload = function () {
            var p = this.closest('.full-start-new__poster');
            if (p) p.classList.add('loaded');
        };

        img.onerror = function () {
            this.onerror = function () {};
            this.src = fallbackSrc;
        };

        img.src = newSrc;
        return true;
    }

    // ==========================================
    //  4. Переместить блок кнопок выше реакций
    // ==========================================
    function moveButtonsBlock() {
        var fullNew = document.querySelector('.full-start-new');
        if (!fullNew) return false;

        var buttons = fullNew.querySelector('.full-start-new__buttons');
        var reactions = fullNew.querySelector('.full-start-new__reactions');
        if (!buttons || !reactions) return false;

        if (buttons.getAttribute('data-wide-moved') === '1') return true;

        reactions.parentNode.insertBefore(buttons, reactions);
        buttons.setAttribute('data-wide-moved', '1');

        return true;
    }

    // ==========================================
    //  5. Определить тип медиа (movie / tv)
    // ==========================================
    function getMediaType() {
        try {
            var act = Lampa.Activity.active();
            if (act && act.method) return act.method;
            var movie = getMovie();
            if (movie) {
                if (movie.media_type) return movie.media_type;
                if (movie.first_air_date || movie.name) return 'tv';
            }
        } catch (e) {}
        return 'movie';
    }

    // ==========================================
    //  6. Заменить заголовок на логотип
    // ==========================================
    function fetchAndSetLogo() {
        var titleEl = document.querySelector('.full-start-new__title');
        if (!titleEl) { console.log('[Wide Covers] fetchLogo: no titleEl'); return; }
        if (titleEl.getAttribute('data-logo-done') === '1') return;
        titleEl.setAttribute('data-logo-done', '1');

        var movie = getMovie();
        if (!movie || !movie.id) { console.log('[Wide Covers] fetchLogo: no movie', movie); return; }

        var mediaType = getMediaType();
        console.log('[Wide Covers] fetchLogo:', movie.title || movie.name, 'id=' + movie.id, 'type=' + mediaType);

        var apiKey = '4ef0d7355d9ffb5151e987764708ce96';
        try {
            if (window.Lampa && Lampa.TMDB && Lampa.TMDB.key) apiKey = Lampa.TMDB.key();
        } catch (e) {}

        var lang = 'ru';
        try {
            if (window.Lampa && Lampa.Storage && Lampa.Storage.field) {
                lang = Lampa.Storage.field('tmdb_lang') || 'ru';
            }
        } catch (e) {}

        var url = 'https://api.themoviedb.org/3/' + mediaType + '/' + movie.id + '/images?api_key=' + apiKey + '&include_image_language=' + lang + ',en,null';
        console.log('[Wide Covers] fetchLogo URL:', url);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.timeout = 8000;
        xhr.onload = function () {
            console.log('[Wide Covers] fetchLogo response status:', xhr.status);
            try {
                var data = JSON.parse(xhr.responseText);
                console.log('[Wide Covers] fetchLogo logos count:', data.logos ? data.logos.length : 0);
                if (!data.logos || !data.logos.length) return;

                // Выбираем лого: предпочитаем язык пользователя, затем en, затем null
                var logos = data.logos;
                var best = null;
                for (var i = 0; i < logos.length; i++) {
                    var l = logos[i];
                    if (l.iso_639_1 === lang) { best = l; break; }
                }
                if (!best) {
                    for (var j = 0; j < logos.length; j++) {
                        if (logos[j].iso_639_1 === 'en') { best = logos[j]; break; }
                    }
                }
                if (!best) best = logos[0];

                console.log('[Wide Covers] fetchLogo best:', best.file_path, 'lang=' + best.iso_639_1);

                // Получаем proxy prefix из текущего постера
                var posterImg = document.querySelector('.full-start-new .full--poster');
                var logoSrc;
                if (posterImg) {
                    var src = posterImg.getAttribute('src') || posterImg.src || '';
                    var tpIdx = src.indexOf('/t/p/');
                    if (tpIdx !== -1) {
                        var prefix = src.substring(0, tpIdx);
                        var qStart = src.indexOf('?');
                        var query = qStart !== -1 ? src.substring(qStart) : '';
                        logoSrc = prefix + '/t/p/w500' + best.file_path + query;
                    }
                }
                if (!logoSrc) {
                    logoSrc = 'https://image.tmdb.org/t/p/w500' + best.file_path;
                }

                console.log('[Wide Covers] fetchLogo src:', logoSrc);

                // Проверяем, что titleEl ещё на месте
                titleEl = document.querySelector('.full-start-new__title');
                if (!titleEl) { console.log('[Wide Covers] fetchLogo: titleEl gone'); return; }

                var img = new Image();
                img.className = 'wide-logo';
                img.alt = movie.title || movie.name || '';
                img.onload = function () {
                    console.log('[Wide Covers] fetchLogo: image loaded OK');
                    titleEl.textContent = '';
                    titleEl.appendChild(img);
                    titleEl.classList.add('has-logo');
                };
                img.onerror = function () {
                    console.log('[Wide Covers] fetchLogo: image load FAILED');
                };
                img.src = logoSrc;
            } catch (e) {
                console.log('[Wide Covers] fetchLogo parse error:', e);
            }
        };
        xhr.onerror = function () { console.log('[Wide Covers] fetchLogo XHR error'); };
        xhr.ontimeout = function () { console.log('[Wide Covers] fetchLogo XHR timeout'); };
        xhr.send();
    }

    // ==========================================
    //  7. Retry
    // ==========================================
    function trySwap(attemptsLeft) {
        if (attemptsLeft <= 0) return;
        var posterDone = swapPoster();
        var btnDone = moveButtonsBlock();
        if (posterDone && btnDone) {
            fetchAndSetLogo();
            return;
        }
        setTimeout(function () { trySwap(attemptsLeft - 1); }, 150);
    }

    // ==========================================
    //  8. Listeners
    // ==========================================
    function initListeners() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') trySwap(20);
        });

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') trySwap(20);
        });
    }

    // ==========================================
    //  9. Start
    // ==========================================
    function start() {
        initListeners();
        trySwap(30);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

    try { if (window.Lampa && Lampa.Listener) start(); } catch (e) {}

})();
