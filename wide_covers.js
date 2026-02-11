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

        // --- Trailer: контейнер поверх постера ---
        '.wide-trailer-wrap {',
        '  position: absolute !important;',
        '  top: 0 !important;',
        '  left: 0 !important;',
        '  width: 100% !important;',
        '  height: 100% !important;',
        '  z-index: 0 !important;',
        '  overflow: hidden !important;',
        '  border-top-left-radius: 2em !important;',
        '  border-top-right-radius: 2em !important;',
        '  opacity: 0 !important;',
        '  transition: opacity 1s ease !important;',
        '}',
        '.wide-trailer-wrap.visible {',
        '  opacity: 1 !important;',
        '}',
        '.wide-trailer-wrap iframe,',
        '.wide-trailer-wrap > div {',
        '  position: absolute !important;',
        '  top: -60px !important;',
        '  left: 0 !important;',
        '  width: 100% !important;',
        '  height: calc(100% + 120px) !important;',
        '  pointer-events: none !important;',
        '  border: none !important;',
        '}',
        '.full-start-new__poster.trailer-playing .full-start-new__img {',
        '  opacity: 0 !important;',
        '  transition: opacity 1s ease !important;',
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

    function getMediaType() {
        try {
            var act = Lampa.Activity.active();
            if (act && act.method) return act.method;
            var movie = getMovie();
            if (movie) {
                if (movie.media_type) return movie.media_type;
                if (movie.first_air_date) return 'tv';
            }
        } catch (e) {}
        return 'movie';
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
    //  5. Трейлер через YT.Player (Lampa API)
    // ==========================================
    var trailerState = {
        player: null,
        wrap: null,
        timer: null,
        active: false,
        trailerList: [],
        currentIndex: 0
    };

    function fetchTrailers(movieId, mediaType, callback) {
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

        var results = [];
        var done = 0;
        var total = lang === 'en' ? 1 : 2;

        function finish() {
            done++;
            if (done >= total) callback(results);
        }

        function doFetch(lng) {
            var url = 'https://api.themoviedb.org/3/' + mediaType + '/' + movieId + '/videos?api_key=' + apiKey + '&language=' + lng;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.timeout = 8000;
            xhr.onload = function () {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.results && data.results.length) {
                        results = results.concat(data.results);
                    }
                } catch (e) {}
                finish();
            };
            xhr.onerror = xhr.ontimeout = function () { finish(); };
            xhr.send();
        }

        doFetch(lang);
        if (lang !== 'en') doFetch('en');
    }

    function sortTrailers(videos) {
        var yt = videos.filter(function (v) { return v.site === 'YouTube'; });
        if (!yt.length) return [];

        var scored = yt.map(function (v) {
            var s = 0;
            if (v.type === 'Trailer') s += 10;
            if (v.type === 'Teaser') s += 5;
            if (v.official) s += 3;
            return { video: v, score: s };
        });

        scored.sort(function (a, b) { return b.score - a.score; });
        return scored.map(function (s) { return s.video; });
    }

    // Загрузить YouTube IFrame API если ещё не загружен
    function ensureYTAPI(callback) {
        if (window.YT && window.YT.Player) {
            callback();
            return;
        }

        // Может уже загружается
        if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            var checkInterval = setInterval(function () {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkInterval);
                    callback();
                }
            }, 200);
            setTimeout(function () { clearInterval(checkInterval); }, 10000);
            return;
        }

        // Загружаем
        var oldCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
            if (oldCallback) oldCallback();
            callback();
        };

        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }

    function loadTrailer() {
        var poster = document.querySelector('.full-start-new__poster');
        console.log('[Wide Covers] loadTrailer: poster=', !!poster);
        if (!poster) return;
        if (poster.querySelector('.wide-trailer-wrap')) { console.log('[Wide Covers] trailer wrap already exists'); return; }

        var movie = getMovie();
        console.log('[Wide Covers] loadTrailer: movie=', movie ? movie.title + ' id=' + movie.id : 'null');
        if (!movie || !movie.id) return;

        var mediaType = getMediaType();
        console.log('[Wide Covers] loadTrailer: mediaType=', mediaType);

        trailerState.active = true;

        fetchTrailers(movie.id, mediaType, function (videos) {
            console.log('[Wide Covers] fetchTrailers result:', videos.length, 'videos');
            if (!trailerState.active) { console.log('[Wide Covers] not active anymore'); return; }

            var sorted = sortTrailers(videos);
            console.log('[Wide Covers] sorted trailers:', sorted.length, sorted.length ? sorted[0].key : 'none');
            if (!sorted.length) return;

            trailerState.trailerList = sorted;
            trailerState.currentIndex = 0;

            console.log('[Wide Covers] loading YT API...');
            ensureYTAPI(function () {
                console.log('[Wide Covers] YT API ready, active=', trailerState.active);
                if (!trailerState.active) return;
                tryPlayTrailer(poster);
            });
        });
    }

    function tryPlayTrailer(poster) {
        if (trailerState.currentIndex >= trailerState.trailerList.length) { console.log('[Wide Covers] no more trailers'); return; }
        if (trailerState.currentIndex >= 3) { console.log('[Wide Covers] max attempts reached'); return; }
        if (!trailerState.active) return;

        var videoId = trailerState.trailerList[trailerState.currentIndex].key;
        console.log('[Wide Covers] tryPlayTrailer #' + trailerState.currentIndex + ': ' + videoId);

        // Создаём контейнер
        var wrap = document.createElement('div');
        wrap.className = 'wide-trailer-wrap';

        var playerDiv = document.createElement('div');
        playerDiv.id = 'wide-trailer-player-' + Date.now();
        wrap.appendChild(playerDiv);

        poster.appendChild(wrap);
        trailerState.wrap = wrap;

        // Создаём YT.Player
        console.log('[Wide Covers] creating YT.Player for div #' + playerDiv.id);
        trailerState.player = new YT.Player(playerDiv.id, {
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                mute: 1,
                controls: 0,
                showinfo: 0,
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                iv_load_policy: 3,
                disablekb: 1,
                fs: 0
            },
            events: {
                onReady: function (event) {
                    console.log('[Wide Covers] YT onReady');
                    event.target.mute();
                    event.target.playVideo();

                    trailerState.timer = setTimeout(function () {
                        if (!trailerState.active) return;
                        if (trailerState.wrap !== wrap) return;
                        console.log('[Wide Covers] showing trailer');
                        wrap.classList.add('visible');
                        poster.classList.add('trailer-playing');
                    }, 5000);
                },
                onError: function (event) {
                    console.log('[Wide Covers] YT onError:', event.data);
                    cleanupCurrentTrailer();
                    trailerState.currentIndex++;
                    tryPlayTrailer(poster);
                },
                onStateChange: function (event) {
                    console.log('[Wide Covers] YT state:', event.data);
                    if (event.data === YT.PlayerState.ENDED) {
                        if (wrap.classList.contains('visible')) {
                            wrap.classList.remove('visible');
                            poster.classList.remove('trailer-playing');
                        }
                    }
                }
            }
        });
    }

    function cleanupCurrentTrailer() {
        if (trailerState.timer) {
            clearTimeout(trailerState.timer);
            trailerState.timer = null;
        }

        if (trailerState.player) {
            try { trailerState.player.destroy(); } catch (e) {}
            trailerState.player = null;
        }

        if (trailerState.wrap) {
            trailerState.wrap.remove();
            trailerState.wrap = null;
        }
    }

    function destroyTrailer() {
        trailerState.active = false;
        trailerState.trailerList = [];
        trailerState.currentIndex = 0;

        cleanupCurrentTrailer();

        var poster = document.querySelector('.full-start-new__poster');
        if (poster) poster.classList.remove('trailer-playing');
    }

    // ==========================================
    //  6. Retry
    // ==========================================
    function trySwap(attemptsLeft) {
        if (attemptsLeft <= 0) return;
        var posterDone = swapPoster();
        var btnDone = moveButtonsBlock();
        if (posterDone && btnDone) {
            loadTrailer();
            return;
        }
        setTimeout(function () { trySwap(attemptsLeft - 1); }, 150);
    }

    // ==========================================
    //  7. Listeners
    // ==========================================
    function initListeners() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                destroyTrailer();
                trySwap(20);
            }
        });

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                destroyTrailer();
                trySwap(20);
            }
            if (e.type === 'destroy' || e.type === 'back') {
                destroyTrailer();
            }
        });

        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'back') {
                destroyTrailer();
            }
        });
    }

    // ==========================================
    //  8. Start
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
