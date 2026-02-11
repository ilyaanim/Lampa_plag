(function () {
    'use strict';

    // ==========================================
    //  1. CSS: backdrop с градиентом, текст поверх,
    //     кнопка воспроизведения у заголовка
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

        // --- Poster: широкий с градиентом ---
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
        '  border-top-left-radius: 2em !important;',
        '  border-top-right-radius: 2em !important;',
        '  border-bottom-left-radius: 0 !important;',
        '  border-bottom-right-radius: 0 !important;',
        '}',

        // --- Правая часть: поверх постера ---
        '.full-start-new__right {',
        '  position: relative !important;',
        '  z-index: 2 !important;',
        '  margin-top: -30em !important;',
        '  padding-left: 1.5em !important;',
        '  padding-right: 1.5em !important;',
        '}',
        '.full-start-new__title {',
        '  -webkit-line-clamp: 2 !important;',
        '  line-clamp: 2 !important;',
        '  text-shadow: 0 0.1em 0.4em rgba(0,0,0,0.7) !important;',
        '  margin-bottom: 0 !important;',
        '  flex-shrink: 1 !important;',
        '  min-width: 0 !important;',
        '}',
        '.full-start-new__description {',
        '  width: 100% !important;',
        '}',
        '.full-start-new__rate-line {',
        '  text-shadow: 0 0.05em 0.3em rgba(0,0,0,0.5) !important;',
        '}',
        '.full-start-new {',
        '  padding-bottom: 1em !important;',
        '}',

        // --- Blur на фоновый backdrop под постером ---
        '.full-start__background {',
        '  filter: blur(20px) !important;',
        '  -webkit-filter: blur(20px) !important;',
        '}',

        // --- Title row: заголовок + кнопка ---
        '.wide-title-row {',
        '  display: flex !important;',
        '  align-items: flex-end !important;',
        '  justify-content: space-between !important;',
        '  gap: 1em !important;',
        '  margin-bottom: 0.3em !important;',
        '}',

        // --- Кнопка воспроизведения (Netflix-style) ---
        '.wide-title-row .button--play {',
        '  flex-shrink: 0 !important;',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  gap: 0.4em !important;',
        '  background: rgba(255,255,255,1) !important;',
        '  color: #000 !important;',
        '  border-radius: 2em !important;',
        '  padding: 0.5em 1.5em 0.5em 1.1em !important;',
        '  font-size: 1.3em !important;',
        '  font-weight: 600 !important;',
        '  cursor: pointer !important;',
        '  transition: background 0.2s !important;',
        '  white-space: nowrap !important;',
        '  margin-left: auto !important;',
        '  margin-right: 3em !important;',
        '  margin-bottom: 0.2em !important;',
        '}',
        '.wide-title-row .button--play:hover,',
        '.wide-title-row .button--play.focus {',
        '  background: rgba(255,255,255,0.75) !important;',
        '}',
        '.wide-title-row .button--play span {',
        '  display: inline !important;',
        '  color: #000 !important;',
        '  font-weight: 600 !important;',
        '}',
        '.wide-title-row .button--play svg {',
        '  width: 1.1em !important;',
        '  height: 1.1em !important;',
        '  fill: #000 !important;',
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
    //  4. Переместить кнопку Play к заголовку
    // ==========================================
    function movePlayButton() {
        var fullNew = document.querySelector('.full-start-new');
        if (!fullNew) return false;

        // Уже перемещена?
        if (fullNew.querySelector('.wide-title-row')) return true;

        var title = fullNew.querySelector('.full-start-new__title');
        var playBtn = fullNew.querySelector('.button--play');
        if (!title || !playBtn) return false;

        // Создаём flex-обёртку
        var wrapper = document.createElement('div');
        wrapper.className = 'wide-title-row';

        // Вставляем обёртку на место заголовка
        title.parentNode.insertBefore(wrapper, title);

        // Перемещаем заголовок и кнопку внутрь
        wrapper.appendChild(title);
        wrapper.appendChild(playBtn);

        return true;
    }

    // ==========================================
    //  5. Retry
    // ==========================================
    function trySwap(attemptsLeft) {
        if (attemptsLeft <= 0) return;
        var posterDone = swapPoster();
        var btnDone = movePlayButton();
        if (posterDone && btnDone) return;
        setTimeout(function () { trySwap(attemptsLeft - 1); }, 150);
    }

    // ==========================================
    //  6. Listeners
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
    //  7. Start
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
