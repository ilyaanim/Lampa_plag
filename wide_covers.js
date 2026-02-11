(function () {
    'use strict';

    var STORAGE_KEY = 'wide_covers_enabled';
    var STYLE_ID = 'wide-covers-plugin-style';

    // ==========================================
    //  CSS: wide poster layout with !important
    // ==========================================
    var css = `
        body.wide-covers--enabled .full-start-new__body {
            flex-direction: column !important;
            align-items: stretch !important;
        }

        body.wide-covers--enabled .full-start-new__left {
            width: 100% !important;
            max-width: 100% !important;
            margin-right: 0 !important;
            margin-bottom: 1.5em !important;
        }

        body.wide-covers--enabled .full-start-new__poster {
            padding-bottom: 45% !important;
            border-radius: 1.2em !important;
            overflow: hidden !important;
        }

        body.wide-covers--enabled .full-start-new__img {
            object-fit: cover !important;
            object-position: center 20% !important;
            border-radius: 1.2em !important;
        }

        body.wide-covers--enabled .full-start-new__right {
            margin-top: 0 !important;
        }

        body.wide-covers--enabled .full-start-new__title {
            -webkit-line-clamp: 2 !important;
            line-clamp: 2 !important;
        }

        body.wide-covers--enabled .full-start-new__description {
            width: 100% !important;
        }
    `;

    // ==========================================
    //  TMDB image URL
    // ==========================================
    function tmdbImg(path, size) {
        if (!path) return '';
        size = size || 'w780';
        try {
            if (Lampa.TMDB && Lampa.TMDB.img) return Lampa.TMDB.img(path, size);
        } catch (e) {}
        try {
            if (Lampa.Api && Lampa.Api.img) return Lampa.Api.img(path, size);
        } catch (e) {}
        return 'https://image.tmdb.org/t/p/' + size + path;
    }

    function isEnabled() {
        return Lampa.Storage.get(STORAGE_KEY, 'true') === 'true';
    }

    function updateBodyClass() {
        if (isEnabled()) {
            document.body.classList.add('wide-covers--enabled');
        } else {
            document.body.classList.remove('wide-covers--enabled');
        }
    }

    function injectCSS() {
        var existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==========================================
    //  Swap poster image to backdrop via direct DOM
    // ==========================================
    function swapPoster() {
        if (!isEnabled()) return;

        // Find ALL poster images on page
        var imgs = document.querySelectorAll('.full-start-new .full--poster');

        imgs.forEach(function (img) {
            if (img.dataset.wideSwapped) return;

            // Get movie data from current activity
            var movie = null;
            try {
                var act = Lampa.Activity.active();
                if (act && act.params) movie = act.params.movie;
            } catch (e) {}

            if (!movie || !movie.backdrop_path) return;

            img.dataset.wideSwapped = '1';

            var backdropUrl = tmdbImg(movie.backdrop_path, 'w1280');

            img.onload = function () {
                var poster = img.closest('.full-start-new__poster');
                if (poster) poster.classList.add('loaded');
            };

            img.src = backdropUrl;
        });
    }

    // ==========================================
    //  Hook: Lampa 'full' event
    // ==========================================
    function hookFullDetail() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                updateBodyClass();

                // Delay to ensure DOM is ready
                setTimeout(swapPoster, 50);
                setTimeout(swapPoster, 300);
                setTimeout(swapPoster, 800);
            }
        });
    }

    // ==========================================
    //  Hook: activity changes
    // ==========================================
    function hookActivity() {
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' && e.component === 'full') {
                updateBodyClass();

                setTimeout(swapPoster, 100);
                setTimeout(swapPoster, 500);
                setTimeout(swapPoster, 1500);
            }
        });
    }

    // ==========================================
    //  Settings
    // ==========================================
    function addSettings() {
        Lampa.Lang.add({
            wide_covers_enabled_label: {
                ru: 'Широкий постер',
                en: 'Wide Poster',
                uk: 'Широкий постер',
                be: 'Шырокі пастэр'
            },
            wide_covers_description: {
                ru: 'На странице фильма: широкий backdrop сверху, информация снизу',
                en: 'On movie page: wide backdrop on top, info below',
                uk: 'На сторінці фільму: широкий backdrop зверху, інформація знизу',
                be: 'На старонцы фільма: шырокі backdrop зверху, інфармацыя знізу'
            }
        });

        Lampa.Params.select(STORAGE_KEY, {
            'true': Lampa.Lang.translate('settings_param_enabled') || 'Вкл',
            'false': Lampa.Lang.translate('settings_param_disabled') || 'Выкл'
        }, 'true');

        var templateHtml = '<div class="settings-param selector" data-name="' + STORAGE_KEY + '" data-type="select">' +
            '<div class="settings-param__name">#{wide_covers_enabled_label}</div>' +
            '<div class="settings-param__value"></div>' +
            '<div class="settings-param__descr">#{wide_covers_description}</div>' +
            '</div>';

        Lampa.Template.add('settings_wide_covers', templateHtml);

        if (Lampa.Settings && Lampa.Settings.listener) {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name === 'interface') {
                    e.body.find('[data-name="interface_size"]').after(
                        Lampa.Template.get('settings_wide_covers')
                    );
                }
            });
        }

        Lampa.Storage.listener.follow('change', function (e) {
            if (e.name === STORAGE_KEY) {
                updateBodyClass();
            }
        });
    }

    // ==========================================
    //  Init
    // ==========================================
    function startPlugin() {
        injectCSS();
        updateBodyClass();
        hookFullDetail();
        hookActivity();
        addSettings();

        // Also try swapping on any existing page
        setTimeout(swapPoster, 200);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
