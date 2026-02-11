(function () {
    'use strict';

    var STORAGE_KEY = 'wide_covers_enabled';
    var STYLE_ID = 'wide-covers-plugin-style';

    // ==========================================
    //  CSS: Full Detail View — wide poster layout
    // ==========================================
    var css = `
        /* ===== Full Detail View: wide poster on top, text below ===== */

        body.wide-covers--enabled .full-start-new__body {
            flex-direction: column;
            align-items: stretch;
        }

        body.wide-covers--enabled .full-start-new__left {
            width: 100%;
            max-width: 100%;
            margin-right: 0;
            margin-bottom: 1.5em;
        }

        body.wide-covers--enabled .full-start-new__poster {
            padding-bottom: 45%;
            border-radius: 1.2em;
            overflow: hidden;
        }

        body.wide-covers--enabled .full-start-new__img {
            object-fit: cover;
            object-position: center 20%;
            border-radius: 1.2em;
        }

        body.wide-covers--enabled .full-start-new__right {
            margin-top: 0;
        }

        body.wide-covers--enabled .full-start-new__title {
            -webkit-line-clamp: 2;
            line-clamp: 2;
        }

        body.wide-covers--enabled .full-start-new__description {
            width: 100%;
        }
    `;

    // ==========================================
    //  Helper: build TMDB image URL
    // ==========================================
    function tmdbImg(path, size) {
        if (!path) return '';
        size = size || 'w780';
        if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.img === 'function') {
            return Lampa.TMDB.img(path, size);
        }
        if (window.Lampa && Lampa.Api && typeof Lampa.Api.img === 'function') {
            return Lampa.Api.img(path, size);
        }
        return 'https://image.tmdb.org/t/p/' + size + path;
    }

    // ==========================================
    //  Check if plugin is enabled
    // ==========================================
    function isEnabled() {
        return Lampa.Storage.get(STORAGE_KEY, 'true') === 'true';
    }

    // ==========================================
    //  Update body class
    // ==========================================
    function updateBodyClass() {
        document.body.classList.toggle('wide-covers--enabled', isEnabled());
    }

    // ==========================================
    //  Inject CSS
    // ==========================================
    function injectCSS() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==========================================
    //  Swap poster to backdrop on Full Detail page
    // ==========================================
    function hookFullDetail() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                if (!isEnabled()) return;

                var movie = e.data && e.data.movie;
                if (!movie || !movie.backdrop_path) return;

                var backdropUrl = tmdbImg(movie.backdrop_path, 'w1280');

                // Find the poster image in the full detail page
                try {
                    var render = e.object.activity.render();
                    var img = render.find('.full--poster');

                    if (img.length && img[0]) {
                        var posterEl = render.find('.full-start-new__poster');

                        // Set backdrop image
                        img[0].onload = function () {
                            posterEl.addClass('loaded');
                        };

                        img[0].src = backdropUrl;
                    }
                } catch (ex) {
                    console.warn('[Wide Covers] Error swapping poster:', ex);
                }
            }
        });
    }

    // ==========================================
    //  Also observe DOM for poster images
    //  (fallback in case Listener doesn't catch it)
    // ==========================================
    function observeFullPage() {
        var observer = new MutationObserver(function (mutations) {
            if (!isEnabled()) return;

            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType !== 1) continue;

                    // Check if a full-start-new block appeared
                    var fullBlock = null;
                    if (node.classList && node.classList.contains('full-start-new')) {
                        fullBlock = node;
                    } else if (node.querySelector) {
                        fullBlock = node.querySelector('.full-start-new');
                    }

                    if (fullBlock) {
                        processFullBlock(fullBlock);
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function processFullBlock(block) {
        if (!isEnabled()) return;
        if (block.dataset.wideCoverDone) return;
        block.dataset.wideCoverDone = '1';

        var img = block.querySelector('.full--poster');
        if (!img) return;

        // Try to get movie data from the activity
        // The img src might already be set to poster — we need backdrop_path
        // We'll watch for the src to be set and then swap it
        var swapped = false;

        function trySwap() {
            if (swapped) return;

            // Get the current activity's movie data
            try {
                var activity = Lampa.Activity.active();
                var movie = activity && activity.params && activity.params.movie;
                if (movie && movie.backdrop_path) {
                    swapped = true;
                    var backdropUrl = tmdbImg(movie.backdrop_path, 'w1280');
                    var posterEl = block.querySelector('.full-start-new__poster');

                    img.onload = function () {
                        if (posterEl) posterEl.classList.add('loaded');
                    };

                    img.src = backdropUrl;
                }
            } catch (ex) {
                // ignore
            }
        }

        // Watch for img src changes
        var imgObserver = new MutationObserver(function () {
            trySwap();
        });
        imgObserver.observe(img, { attributes: true, attributeFilter: ['src'] });

        // Also try immediately
        setTimeout(trySwap, 100);
        setTimeout(trySwap, 500);
    }

    // ==========================================
    //  Settings
    // ==========================================
    function addSettings() {
        Lampa.Lang.add({
            wide_covers_title: {
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
            },
            wide_covers_enabled_label: {
                ru: 'Широкий постер',
                en: 'Wide Poster',
                uk: 'Широкий постер',
                be: 'Шырокі пастэр'
            }
        });

        Lampa.Params.select(STORAGE_KEY, {
            'true': '#{settings_param_enabled}',
            'false': '#{settings_param_disabled}'
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
        observeFullPage();
        addSettings();

        console.log('[Wide Covers] Plugin v2.0.0 loaded');
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
