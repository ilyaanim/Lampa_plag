(function () {
    'use strict';

    // ==========================================
    //  1. CSS
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
    //  2. Подмена: берём текущий src постера,
    //     меняем размер на original и путь на backdrop
    // ==========================================
    function swapPoster() {
        var img = document.querySelector('.full-start-new .full--poster');
        if (!img) {
            console.log('[Wide Covers] No .full--poster img found');
            return false;
        }
        if (img.getAttribute('data-wide-done') === '1') return true;

        // Ждём пока Lampa загрузит постер (src будет содержать tmdb URL)
        var currentSrc = img.getAttribute('src') || img.src || '';
        console.log('[Wide Covers] Current img src:', currentSrc);

        if (!currentSrc || currentSrc.indexOf('/t/p/') === -1) {
            console.log('[Wide Covers] Src not ready yet, waiting...');
            return false;
        }

        // Получаем данные фильма — пробуем несколько способов
        var movie = null;
        try {
            var act = Lampa.Activity.active();
            console.log('[Wide Covers] Activity:', act ? Object.keys(act).join(',') : 'null');

            if (act) {
                // Способ 1: act.params.movie
                if (act.params && act.params.movie) movie = act.params.movie;
                // Способ 2: act.movie
                else if (act.movie) movie = act.movie;
                // Способ 3: act.card
                else if (act.card) movie = act.card;
                // Способ 4: act.params.card
                else if (act.params && act.params.card) movie = act.params.card;
                // Способ 5: act.data
                else if (act.data && act.data.movie) movie = act.data.movie;

                if (!movie) console.log('[Wide Covers] params keys:', act.params ? Object.keys(act.params).join(',') : 'no params');
            }
        } catch (e) {
            console.log('[Wide Covers] Error getting activity:', e);
            return false;
        }

        // Способ 6: найти backdrop_path из URL страницы + TMDB fetch
        // Способ 7: если есть data-атрибуты на элементе
        if (!movie) {
            try {
                var allActs = Lampa.Activity.all ? Lampa.Activity.all() : null;
                if (allActs && allActs.length) {
                    for (var a = allActs.length - 1; a >= 0; a--) {
                        var ac = allActs[a];
                        if (ac && ac.params && ac.params.movie) { movie = ac.params.movie; break; }
                        if (ac && ac.movie) { movie = ac.movie; break; }
                        if (ac && ac.card) { movie = ac.card; break; }
                    }
                    console.log('[Wide Covers] Found via Activity.all():', movie ? movie.title : 'still null');
                }
            } catch (e2) {}
        }

        if (!movie || !movie.backdrop_path) {
            console.log('[Wide Covers] No movie or no backdrop_path:', movie ? (movie.title + ' keys:' + Object.keys(movie).join(',')) : 'null');
            return false;
        }

        console.log('[Wide Covers] Movie found:', movie.title, 'backdrop:', movie.backdrop_path);

        img.setAttribute('data-wide-done', '1');

        // Берём текущий URL (с прокси или без) и модифицируем:
        // 1. Заменяем размер на original
        // 2. Заменяем путь файла на backdrop_path
        var newSrc = currentSrc.replace(/\/t\/p\/[^\/]+\//, '/t/p/original/');
        // Заменяем имя файла (последнюю часть пути после /t/p/size/)
        var tmdbPathIndex = newSrc.indexOf('/t/p/');
        if (tmdbPathIndex !== -1) {
            var prefix = newSrc.substring(0, tmdbPathIndex) + '/t/p/original';
            newSrc = prefix + movie.backdrop_path;
        }

        var fallbackSrc = currentSrc.replace(/\/t\/p\/[^\/]+\//, '/t/p/w1280/');
        var fIndex = fallbackSrc.indexOf('/t/p/');
        if (fIndex !== -1) {
            var fPrefix = fallbackSrc.substring(0, fIndex) + '/t/p/w1280';
            fallbackSrc = fPrefix + movie.backdrop_path;
        }

        console.log('[Wide Covers] Swapping poster:', currentSrc, '->', newSrc);

        img.onload = function () {
            var p = this.closest('.full-start-new__poster');
            if (p) p.classList.add('loaded');
            console.log('[Wide Covers] Backdrop loaded OK');
        };

        img.onerror = function () {
            console.log('[Wide Covers] Original failed, trying w1280:', fallbackSrc);
            this.onerror = function () {
                console.log('[Wide Covers] w1280 also failed');
            };
            this.src = fallbackSrc;
        };

        img.src = newSrc;
        return true;
    }

    // ==========================================
    //  3. Retry: пробуем пока не получится
    // ==========================================
    function trySwap(attemptsLeft) {
        if (attemptsLeft <= 0) return;
        if (swapPoster()) return;

        setTimeout(function () {
            trySwap(attemptsLeft - 1);
        }, 150);
    }

    // ==========================================
    //  4. Listeners
    // ==========================================
    function initListeners() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                trySwap(20);
            }
        });

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                trySwap(20);
            }
        });
    }

    // ==========================================
    //  5. Start
    // ==========================================
    function start() {
        console.log('[Wide Covers] Plugin starting...');
        initListeners();
        // Сразу пробуем подменить (страница фильма может быть уже открыта)
        trySwap(30);
        console.log('[Wide Covers] Plugin ready');
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                start();
            }
        });
    }

    // Fallback: если 'ready' уже прошёл
    try {
        if (window.Lampa && Lampa.Listener) {
            start();
        }
    } catch (e) {
        console.log('[Wide Covers] Fallback error:', e);
    }

})();
