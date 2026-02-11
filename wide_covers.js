(function () {
    'use strict';

    // ==========================================
    //  1. CSS: backdrop с градиентом, текст поверх
    // ==========================================
    var style = document.createElement('style');
    style.id = 'wide-covers-plugin-style';
    style.textContent = [

        /* Вертикальная раскладка */
        '.full-start-new__body {',
        '  flex-direction: column !important;',
        '  align-items: stretch !important;',
        '  position: relative !important;',
        '}',

        /* Постер — полная ширина, большой */
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

        /* Градиент поверх постера — прозрачный сверху → тёмный снизу */
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

        /* Картинка — cover, без скруглений */
        '.full-start-new__poster .full-start-new__img {',
        '  object-fit: cover !important;',
        '  object-position: center 20% !important;',
        '  border-radius: 0 !important;',
        '}',

        /* Текст — наезжает на постер снизу */
        '.full-start-new__right {',
        '  position: relative !important;',
        '  z-index: 2 !important;',
        '  margin-top: -12em !important;',
        '  padding-left: 1.5em !important;',
        '  padding-right: 1.5em !important;',
        '}',

        /* Заголовок — до 2 строк */
        '.full-start-new__title {',
        '  -webkit-line-clamp: 2 !important;',
        '  line-clamp: 2 !important;',
        '  text-shadow: 0 0.1em 0.4em rgba(0,0,0,0.7) !important;',
        '}',

        /* Описание — полная ширина */
        '.full-start-new__description {',
        '  width: 100% !important;',
        '}',

        /* Рейтинги и кнопки — тень для читаемости */
        '.full-start-new__rate-line {',
        '  text-shadow: 0 0.05em 0.3em rgba(0,0,0,0.5) !important;',
        '}',

        /* Убираем отступ у всего блока снизу */
        '.full-start-new {',
        '  padding-bottom: 1em !important;',
        '}',

    ].join('\n');
    document.head.appendChild(style);

    // ==========================================
    //  2. Swap poster → backdrop
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

            img.onerror = function () {};

            img.src = url;
        }
    }

    // ==========================================
    //  3. Listeners
    // ==========================================
    function initListeners() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(swapPoster, 50);
                setTimeout(swapPoster, 300);
                setTimeout(swapPoster, 1000);
            }
        });

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

    if (window.Lampa && Lampa.Listener) {
        try { initListeners(); } catch (e) {}
    }

})();
