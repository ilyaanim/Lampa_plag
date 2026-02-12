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

        // --- Убрать маску скролла на странице фильма ---
        '.scroll--mask:has(.full-start-new) {',
        '  -webkit-mask-image: none !important;',
        '  mask-image: none !important;',
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
        '.full-start-new__title.has-logo {',
        '  margin-bottom: 1rem !important;',
        '}',
        '.full-start-new__title .wide-logo {',
        '  max-width: 35rem !important;',
        '  max-height: 12rem !important;',
        '  width: auto !important;',
        '  height: auto !important;',
        '  object-fit: contain !important;',
        '  object-position: left center !important;',
        '  display: block !important;',
        '  filter: none !important;',
        '}',
        '.full-start-new__tagline {',
        '  font-size: 1.2em !important;',
        '}',
        '.full-start-new__description {',
        '  width: 100% !important;',
        '  font-size: 1em !important;',
        '}',
        // --- Обёртка описание + актёры ---
        '.wide-descr-row {',
        '  display: flex !important;',
        '  align-items: flex-start !important;',
        '  gap: 2em !important;',
        '  padding-left: 1.5em !important;',
        '  padding-right: 1.5em !important;',
        '}',
        '.wide-descr-row .full-descr {',
        '  flex: 1 !important;',
        '  min-width: 0 !important;',
        '  font-size: 0.95em !important;',
        '}',
        '.wide-cast {',
        '  display: flex !important;',
        '  gap: 1.2em !important;',
        '  flex-shrink: 0 !important;',
        '}',
        '.wide-cast__person {',
        '  display: flex !important;',
        '  flex-direction: column !important;',
        '  align-items: center !important;',
        '  width: 5em !important;',
        '}',
        '.wide-cast__photo {',
        '  width: 4.5em !important;',
        '  height: 4.5em !important;',
        '  border-radius: 50% !important;',
        '  object-fit: cover !important;',
        '  background: #3e3e3e !important;',
        '}',
        '.wide-cast__name {',
        '  margin-top: 0.4em !important;',
        '  font-size: 0.8em !important;',
        '  text-align: center !important;',
        '  color: rgba(255,255,255,0.7) !important;',
        '  line-height: 1.2 !important;',
        '  overflow: hidden !important;',
        '  display: -webkit-box !important;',
        '  -webkit-line-clamp: 2 !important;',
        '  -webkit-box-orient: vertical !important;',
        '}',
        '.full-start-new__rate-line {',
        '  text-shadow: none !important;',
        '}',
        '.wide-avg-rate {',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  background: rgba(255,255,255,0.15) !important;',
        '  border-radius: 0.8em !important;',
        '  padding: 0.5em 0.7em !important;',
        '  font-size: 1.3em !important;',
        '  font-weight: 700 !important;',
        '  color: #fff !important;',
        '  gap: 0.3em !important;',
        '}',
        '.wide-avg-rate .wide-avg-star {',
        '  width: 1em !important;',
        '  height: 1em !important;',
        '  flex-shrink: 0 !important;',
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

        // --- Плашка TV + год/страна на постере ---
        '.wide-poster-info {',
        '  position: absolute !important;',
        '  top: 1.2em !important;',
        '  left: 1.2em !important;',
        '  z-index: 3 !important;',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  gap: 0.5em !important;',
        '}',
        '.wide-poster-info .card__type {',
        '  position: static !important;',
        '  padding: 0.4em 0.6em !important;',
        '  font-size: 1.1em !important;',
        '  font-weight: 700 !important;',
        '  line-height: 1 !important;',
        '  border-radius: 0.5em !important;',
        '  letter-spacing: 0.05em !important;',
        '  flex-shrink: 0 !important;',
        '}',
        '.wide-poster-info .wide-head-text {',
        '  color: rgba(255,255,255,0.9) !important;',
        '  font-size: 1.1em !important;',
        '  text-shadow: 0 1px 3px rgba(0,0,0,0.7) !important;',
        '  white-space: nowrap !important;',
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
    //  5. Переместить год/страну на постер рядом с TV badge
    // ==========================================
    function moveHeadToPoster() {
        var poster = document.querySelector('.full-start-new__poster');
        var head = document.querySelector('.full-start-new__head');
        if (!poster || !head) return;
        if (poster.querySelector('.wide-poster-info')) return;

        var wrap = document.createElement('div');
        wrap.className = 'wide-poster-info';

        // Переносим badge (TV) если есть
        var badge = poster.querySelector('.card__type');
        if (badge) wrap.appendChild(badge);

        // Копируем текст из head (год, страна)
        var headText = head.textContent.trim();
        if (headText) {
            var span = document.createElement('span');
            span.className = 'wide-head-text';
            span.textContent = headText;
            wrap.appendChild(span);
        }

        poster.appendChild(wrap);

        // Скрываем оригинальный head
        head.style.display = 'none';
    }

    // ==========================================
    //  6. Скрыть заголовок "Подробно"
    // ==========================================
    function hideDetailTitle() {
        var titles = document.querySelectorAll('.items-line__title');
        for (var i = 0; i < titles.length; i++) {
            var text = titles[i].textContent.trim();
            if (text === 'Подробно' || text === 'Details') {
                titles[i].style.display = 'none';
                break;
            }
        }
    }

    // ==========================================
    //  7. Убрать жанры из строки деталей
    // ==========================================
    function removeGenresFromDetails() {
        var details = document.querySelector('.full-start-new__details');
        if (!details) return;
        if (details.getAttribute('data-genres-removed') === '1') return;
        details.setAttribute('data-genres-removed', '1');

        // Жанры — span содержащий "|" (разделитель жанров), без ":" (как в "Сезоны: 1")
        var spans = details.querySelectorAll('span');
        for (var i = 0; i < spans.length; i++) {
            var text = spans[i].textContent;
            if (text.indexOf('|') !== -1 && text.indexOf(':') === -1) {
                // Удаляем span жанров и предшествующий разделитель ●
                var prev = spans[i].previousSibling;
                if (prev && prev.nodeType === 3 && prev.textContent.indexOf('●') !== -1) {
                    prev.remove();
                }
                spans[i].remove();
            }
        }
    }

    // ==========================================
    //  7. Заменить рейтинги на средний
    // ==========================================
    function mergeRatings() {
        var rateLine = document.querySelector('.full-start-new__rate-line');
        if (!rateLine) return;
        if (rateLine.getAttribute('data-rates-merged') === '1') return;
        rateLine.setAttribute('data-rates-merged', '1');

        var rates = rateLine.querySelectorAll('.full-start__rate');
        var values = [];
        for (var i = 0; i < rates.length; i++) {
            var divs = rates[i].querySelectorAll('div');
            if (divs.length) {
                var val = parseFloat(divs[0].textContent);
                if (!isNaN(val) && val > 0) values.push(val);
            }
        }

        if (!values.length) return;

        var avg = 0;
        for (var j = 0; j < values.length; j++) avg += values[j];
        avg = (avg / values.length).toFixed(1);

        // Убираем все отдельные рейтинги
        for (var k = 0; k < rates.length; k++) {
            rates[k].style.display = 'none';
        }

        // Вставляем средний рейтинг перед первым оставшимся элементом
        var badge = document.createElement('span');
        badge.className = 'wide-avg-rate';
        badge.innerHTML = '<svg class="wide-avg-star" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5c.4 0 .7.2.9.6l2.5 5.1 5.6.8c.4.1.7.3.8.7.1.3 0 .7-.3.9l-4.1 4 1 5.6c.1.4 0 .7-.3 1-.3.2-.7.2-1 .1L12 18.8l-5 2.6c-.4.2-.7.2-1-.1-.3-.2-.4-.6-.3-1l1-5.6-4.1-4c-.3-.3-.4-.6-.3-.9.1-.4.4-.6.8-.7l5.6-.8 2.5-5.1c.2-.4.5-.6.9-.6z" stroke-linejoin="round"/></svg> ' + avg;
        rateLine.insertBefore(badge, rateLine.firstChild);

        // Переносим детали (сезоны, серии, время) в строку рейтингов
        var details = document.querySelector('.full-start-new__details');
        if (details) {
            var spans = details.querySelectorAll('span');
            for (var m = 0; m < spans.length; m++) {
                var clone = spans[m].cloneNode(true);
                clone.style.cssText = 'font-size:1.12em; color:rgba(255,255,255,0.6); margin-left:0.4em;';
                rateLine.appendChild(clone);
            }
            details.style.display = 'none';
        }

        // Убираем разделители ● из rate-line
        var walker = document.createTreeWalker(rateLine, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        for (var n = 0; n < textNodes.length; n++) {
            textNodes[n].textContent = textNodes[n].textContent.replace(/\s*●\s*/g, '');
        }
    }

    // ==========================================
    //  8. Определить тип медиа (movie / tv)
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
    //  9. Загрузить 3 главных актёров рядом с описанием
    // ==========================================
    function fetchAndShowCast() {
        var descrBody = document.querySelector('.full-descr');
        if (!descrBody) return;
        if (descrBody.getAttribute('data-cast-done') === '1') return;
        descrBody.setAttribute('data-cast-done', '1');

        var movie = getMovie();
        if (!movie || !movie.id) return;

        var mediaType = getMediaType();
        var apiKey = '4ef0d7355d9ffb5151e987764708ce96';
        try {
            if (window.Lampa && Lampa.TMDB && Lampa.TMDB.key) apiKey = Lampa.TMDB.key();
        } catch (e) {}

        var url = 'https://api.themoviedb.org/3/' + mediaType + '/' + movie.id + '/credits?api_key=' + apiKey;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.timeout = 8000;
        xhr.onload = function () {
            try {
                var data = JSON.parse(xhr.responseText);
                var cast = data.cast;
                if (!cast || !cast.length) return;

                // Берём первых 3 с фото
                var top = [];
                for (var i = 0; i < cast.length && top.length < 3; i++) {
                    if (cast[i].profile_path) top.push(cast[i]);
                }
                if (!top.length) return;

                // Получаем proxy prefix
                var posterImg = document.querySelector('.full-start-new .full--poster');
                var prefix = 'https://image.tmdb.org';
                var query = '';
                if (posterImg) {
                    var src = posterImg.getAttribute('src') || posterImg.src || '';
                    var tpIdx = src.indexOf('/t/p/');
                    if (tpIdx !== -1) {
                        prefix = src.substring(0, tpIdx);
                        var qStart = src.indexOf('?');
                        if (qStart !== -1) query = src.substring(qStart);
                    }
                }

                // Оборачиваем описание в flex-строку
                var parent = descrBody.parentNode;
                if (!parent) return;

                var row = document.createElement('div');
                row.className = 'wide-descr-row';
                parent.insertBefore(row, descrBody);
                row.appendChild(descrBody);

                // Создаём блок актёров
                var castDiv = document.createElement('div');
                castDiv.className = 'wide-cast';

                for (var j = 0; j < top.length; j++) {
                    var person = top[j];
                    var card = document.createElement('div');
                    card.className = 'wide-cast__person';

                    var photo = document.createElement('img');
                    photo.className = 'wide-cast__photo';
                    photo.src = prefix + '/t/p/w185' + person.profile_path + query;
                    photo.alt = person.name;

                    var name = document.createElement('div');
                    name.className = 'wide-cast__name';
                    name.textContent = person.name;

                    card.appendChild(photo);
                    card.appendChild(name);
                    castDiv.appendChild(card);
                }

                row.appendChild(castDiv);
            } catch (e) {}
        };
        xhr.onerror = xhr.ontimeout = function () {};
        xhr.send();
    }

    // ==========================================
    //  10. Заменить заголовок на логотип
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

                // Выбираем лого: приоритет en, затем любое
                var logos = data.logos;
                var best = null;
                for (var i = 0; i < logos.length; i++) {
                    if (logos[i].iso_639_1 === 'en') { best = logos[i]; break; }
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
    //  8. Retry
    // ==========================================
    function trySwap(attemptsLeft) {
        if (attemptsLeft <= 0) return;
        var posterDone = swapPoster();
        var btnDone = moveButtonsBlock();
        if (posterDone && btnDone) {
            moveHeadToPoster();
            removeGenresFromDetails();
            mergeRatings();
            hideDetailTitle();
            fetchAndSetLogo();
            fetchAndShowCast();
            return;
        }
        setTimeout(function () { trySwap(attemptsLeft - 1); }, 150);
    }

    // ==========================================
    //  9. Listeners
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
    //  10. Start
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
