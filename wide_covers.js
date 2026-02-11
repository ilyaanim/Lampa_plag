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
        '  -webkit-mask-image: linear-gradient(to bottom, white 50%, transparent 100%) !important;',
        '  mask-image: linear-gradient(to bottom, white 50%, transparent 100%) !important;',
        '}',
        '.wide-trailer-wrap.visible {',
        '  opacity: 1 !important;',
        '}',
        '.wide-trailer-wrap video {',
        '  position: absolute !important;',
        '  top: 0 !important;',
        '  left: 0 !important;',
        '  width: 100% !important;',
        '  height: 100% !important;',
        '  object-fit: cover !important;',
        '  pointer-events: none !important;',
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

        var scored = yt.map(function (v, idx) {
            // Тип: Trailer > Teaser > остальное
            var typeScore = 0;
            if (v.type === 'Trailer') typeScore = 2;
            else if (v.type === 'Teaser') typeScore = 1;
            var date = v.published_at ? new Date(v.published_at).getTime() : idx;
            return { video: v, typeScore: typeScore, date: date };
        });

        // Сначала по типу, потом по дате (самый новый первый)
        scored.sort(function (a, b) {
            if (a.typeScore !== b.typeScore) return b.typeScore - a.typeScore;
            return b.date - a.date;
        });
        return scored.map(function (s) { return s.video; });
    }

    // Piped API — получить прямую ссылку на видео
    var PIPED_INSTANCES = [
        'https://pipedapi.kavin.rocks',
        'https://pipedapi.adminforge.de',
        'https://api.piped.yt'
    ];

    function fetchDirectUrl(videoId, callback) {
        var tried = 0;

        function tryNext() {
            if (tried >= PIPED_INSTANCES.length) {
                console.log('[Wide Covers] all Piped instances failed');
                callback(null);
                return;
            }

            var apiUrl = PIPED_INSTANCES[tried] + '/streams/' + videoId;
            tried++;

            console.log('[Wide Covers] trying Piped:', apiUrl);
            var xhr = new XMLHttpRequest();
            xhr.open('GET', apiUrl);
            xhr.timeout = 6000;
            xhr.onload = function () {
                try {
                    var data = JSON.parse(xhr.responseText);

                    // Ищем mp4 поток с аудио (не videoOnly)
                    var streams = (data.videoStreams || []).filter(function (s) {
                        return !s.videoOnly && s.mimeType && s.mimeType.indexOf('video/mp4') !== -1;
                    });

                    // Сортируем по качеству (720p предпочтительно)
                    streams.sort(function (a, b) {
                        var qa = parseInt(a.quality) || 0;
                        var qb = parseInt(b.quality) || 0;
                        // Предпочитаем 720p, затем ближайшее к нему
                        var da = Math.abs(qa - 720);
                        var db = Math.abs(qb - 720);
                        return da - db;
                    });

                    if (streams.length && streams[0].url) {
                        console.log('[Wide Covers] got direct URL:', streams[0].quality, streams[0].mimeType);
                        callback(streams[0].url);
                        return;
                    }

                    // Fallback: HLS stream
                    if (data.hls) {
                        console.log('[Wide Covers] got HLS URL');
                        callback(data.hls);
                        return;
                    }

                    console.log('[Wide Covers] no suitable stream from this instance');
                    tryNext();
                } catch (e) {
                    console.log('[Wide Covers] Piped parse error:', e);
                    tryNext();
                }
            };
            xhr.onerror = xhr.ontimeout = function () {
                console.log('[Wide Covers] Piped request failed');
                tryNext();
            };
            xhr.send();
        }

        tryNext();
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
        trailerState.active = true;

        fetchTrailers(movie.id, mediaType, function (videos) {
            console.log('[Wide Covers] fetchTrailers result:', videos.length, 'videos');
            if (!trailerState.active) return;

            var sorted = sortTrailers(videos);
            console.log('[Wide Covers] ALL trailers:');
            sorted.forEach(function (v, i) {
                console.log('[Wide Covers]  #' + i + ': ' + v.type + ' | ' + v.name + ' | ' + (v.published_at || 'no date') + ' | key=' + v.key);
            });
            if (!sorted.length) return;

            trailerState.trailerList = sorted;
            trailerState.currentIndex = 0;

            tryPlayTrailer(poster);
        });
    }

    function tryPlayTrailer(poster) {
        if (trailerState.currentIndex >= trailerState.trailerList.length) { console.log('[Wide Covers] no more trailers'); return; }
        if (trailerState.currentIndex >= 3) return;
        if (!trailerState.active) return;

        var videoId = trailerState.trailerList[trailerState.currentIndex].key;
        console.log('[Wide Covers] tryPlayTrailer #' + trailerState.currentIndex + ': ' + videoId);

        fetchDirectUrl(videoId, function (directUrl) {
            if (!trailerState.active) return;

            if (directUrl) {
                playWithVideo(poster, directUrl);
            } else {
                // Fallback: следующий трейлер
                console.log('[Wide Covers] no direct URL, trying next trailer');
                trailerState.currentIndex++;
                tryPlayTrailer(poster);
            }
        });
    }

    function playWithVideo(poster, url) {
        var wrap = document.createElement('div');
        wrap.className = 'wide-trailer-wrap';

        var video = document.createElement('video');
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'auto');
        video.muted = true;
        video.loop = false;
        video.src = url;

        wrap.appendChild(video);
        poster.appendChild(wrap);
        trailerState.wrap = wrap;

        video.addEventListener('canplay', function () {
            console.log('[Wide Covers] video canplay');
        });

        video.addEventListener('error', function () {
            console.log('[Wide Covers] video error, trying next');
            cleanupCurrentTrailer();
            trailerState.currentIndex++;
            tryPlayTrailer(poster);
        });

        video.addEventListener('ended', function () {
            if (wrap.classList.contains('visible')) {
                wrap.classList.remove('visible');
                poster.classList.remove('trailer-playing');
            }
        });

        // Буфер 5 сек, затем показываем
        trailerState.timer = setTimeout(function () {
            if (!trailerState.active) return;
            if (trailerState.wrap !== wrap) return;
            console.log('[Wide Covers] showing trailer');
            wrap.classList.add('visible');
            poster.classList.add('trailer-playing');
        }, 5000);

        video.play().catch(function (e) {
            console.log('[Wide Covers] video play error:', e);
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
