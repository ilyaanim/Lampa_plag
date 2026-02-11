(function () {
    'use strict';

    var PLUGIN_NAME = 'wide_covers';
    var STORAGE_KEY = 'wide_covers_enabled';
    var STYLE_ID = 'wide-covers-plugin-style';

    // ==========================================
    //  CSS for wide covers
    // ==========================================
    var css = `
        body.wide-covers--enabled .card:not(.card--wide):not(.card--collection) {
            width: 22em;
        }

        body.wide-covers--enabled .card:not(.card--wide):not(.card--collection) .card__view {
            padding-bottom: 56%;
        }

        body.wide-covers--enabled .card:not(.card--wide):not(.card--collection) .card__img {
            object-fit: cover;
        }

        body.wide-covers--enabled .card:not(.card--wide):not(.card--collection).focus .card__view::after,
        body.wide-covers--enabled .card:not(.card--wide):not(.card--collection).hover .card__view::after {
            border-radius: 1.4em;
        }

        body.wide-covers--enabled .items-line--type-cards {
            min-height: 18em;
        }

        body.wide-covers--enabled .card:not(.card--wide):not(.card--collection) .card__vote {
            font-size: 1.1em;
        }

        body.wide-covers--enabled .card:not(.card--wide):not(.card--collection) .card__type {
            font-size: 0.7em;
        }

        body.wide-covers--enabled .card:not(.card--wide):not(.card--collection) .card__quality {
            font-size: 0.7em;
        }
    `;

    // ==========================================
    //  Helper: build TMDB image URL
    // ==========================================
    function tmdbImg(path, size) {
        if (!path) return '';
        size = size || 'w780';
        // Use Lampa.TMDB.img if available, otherwise construct manually
        if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.img === 'function') {
            return Lampa.TMDB.img(path, size);
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
    //  Update body class based on setting
    // ==========================================
    function updateBodyClass() {
        document.body.classList.toggle('wide-covers--enabled', isEnabled());
    }

    // ==========================================
    //  Inject CSS into <head>
    // ==========================================
    function injectCSS() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==========================================
    //  Process a single card element:
    //  swap poster image -> backdrop image
    // ==========================================
    function processCard(card) {
        // Skip cards that already have wide/collection style
        if (card.classList.contains('card--wide') || card.classList.contains('card--collection')) return;

        // Skip if already processed
        if (card.dataset.wideCoverProcessed) return;
        card.dataset.wideCoverProcessed = '1';

        if (!isEnabled()) return;

        var data = card.card_data;
        if (!data || !data.backdrop_path) return;

        var img = card.querySelector('.card__img');
        if (!img) return;

        var backdropUrl = tmdbImg(data.backdrop_path, 'w780');

        // Function to swap image to backdrop
        function swapToBackdrop() {
            if (!isEnabled()) return;
            if (!img.src) return;

            // Only swap if it's a TMDB poster image or loading placeholder
            var src = img.src;
            var isTmdb = src.indexOf('image.tmdb.org') !== -1;
            var isLoading = src.indexOf('img_load') !== -1;

            if (isTmdb || isLoading) {
                // Don't swap if already backdrop
                if (src === backdropUrl) return;

                img.src = backdropUrl;
            }
        }

        // Watch for src changes (lazy loading sets src on visible)
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'src') {
                    swapToBackdrop();
                    break;
                }
            }
        });

        observer.observe(img, { attributes: true, attributeFilter: ['src'] });

        // Try to swap immediately if image already has src
        swapToBackdrop();
    }

    // ==========================================
    //  Observe DOM for new cards
    // ==========================================
    function observeCards() {
        function scanNode(node) {
            if (node.nodeType !== 1) return;

            if (node.classList && node.classList.contains('card')) {
                processCard(node);
            }

            var cards = node.querySelectorAll ? node.querySelectorAll('.card') : [];
            for (var i = 0; i < cards.length; i++) {
                processCard(cards[i]);
            }
        }

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    scanNode(added[j]);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Process existing cards
        var existingCards = document.querySelectorAll('.card');
        for (var i = 0; i < existingCards.length; i++) {
            processCard(existingCards[i]);
        }
    }

    // ==========================================
    //  Re-process all cards (e.g. on toggle)
    // ==========================================
    function reprocessAllCards() {
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            if (card.classList.contains('card--wide') || card.classList.contains('card--collection')) continue;

            var data = card.card_data;
            if (!data) continue;

            var img = card.querySelector('.card__img');
            if (!img) continue;

            if (isEnabled() && data.backdrop_path) {
                img.src = tmdbImg(data.backdrop_path, 'w780');
            } else if (data.poster_path) {
                img.src = tmdbImg(data.poster_path);
            }

            // Reset processed flag so new cards get watched again
            delete card.dataset.wideCoverProcessed;
        }
    }

    // ==========================================
    //  Add settings section
    // ==========================================
    function addSettings() {
        // Add translation strings
        Lampa.Lang.add({
            wide_covers_title: {
                ru: 'Широкие обложки',
                en: 'Wide Covers',
                uk: 'Широкі обкладинки',
                be: 'Шырокія вокладкі'
            },
            wide_covers_description: {
                ru: 'Заменяет стандартные постеры на широкие обложки (backdrop)',
                en: 'Replaces standard posters with wide covers (backdrop)',
                uk: 'Замінює стандартні постери на широкі обкладинки (backdrop)',
                be: 'Замяняе стандартныя пастэры на шырокія вокладкі (backdrop)'
            },
            wide_covers_enabled_label: {
                ru: 'Широкие обложки',
                en: 'Wide Covers',
                uk: 'Широкі обкладинки',
                be: 'Шырокія вокладкі'
            }
        });

        // Register parameter
        Lampa.Params.select(STORAGE_KEY, {
            'true': '#{settings_param_enabled}',
            'false': '#{settings_param_disabled}'
        }, 'true');

        // Add settings template
        var templateHtml = '<div class="settings-param selector" data-name="' + STORAGE_KEY + '" data-type="select">' +
            '<div class="settings-param__name">#{wide_covers_enabled_label}</div>' +
            '<div class="settings-param__value"></div>' +
            '<div class="settings-param__descr">#{wide_covers_description}</div>' +
            '</div>';

        Lampa.Template.add('settings_wide_covers', templateHtml);

        // Listen for settings open and inject our settings section
        if (Lampa.Settings && Lampa.Settings.listener) {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name === 'interface') {
                    e.body.find('[data-name="interface_size"]').after(Lampa.Template.get('settings_wide_covers'));
                }
            });
        }

        // Listen for storage changes to toggle feature
        Lampa.Storage.listener.follow('change', function (e) {
            if (e.name === STORAGE_KEY) {
                updateBodyClass();
                reprocessAllCards();
            }
        });
    }

    // ==========================================
    //  Plugin initialization
    // ==========================================
    function startPlugin() {
        // Inject styles
        injectCSS();

        // Set body class
        updateBodyClass();

        // Start observing cards
        observeCards();

        // Add settings
        addSettings();

        console.log('[Wide Covers] Plugin loaded, version 1.0.0');
    }

    // Wait for Lampa to be ready
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
