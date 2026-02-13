(function () {
    'use strict';

    // ==========================================
    //  Плагин: New Main Menu
    //  Реорганизация главной страницы Lampa
    //  Порядок секций:
    //    1. Продолжить просмотр
    //    2. Позже
    //  Всё остальное — скрыто.
    // ==========================================

    // ==========================================
    //  1. Определить, находимся ли мы на Главной
    // ==========================================
    function isMainPage() {
        try {
            var act = Lampa.Activity.active();
            return act && act.component === 'main';
        } catch (e) {}
        return false;
    }

    // ==========================================
    //  2. Классификация заголовков секций
    // ==========================================
    function isContinueTitle(text) {
        return text.indexOf('Продолжить') !== -1 || text.indexOf('Continue') !== -1;
    }

    function isLaterTitle(text) {
        return text.indexOf('Позже') !== -1 || text.indexOf('Watch later') !== -1;
    }

    function isTitleAllowed(text) {
        return isContinueTitle(text) || isLaterTitle(text);
    }

    function getSectionTitle(section) {
        var el = section.querySelector('.items-line__title');
        return el ? (el.textContent || el.innerText || '').trim() : '';
    }

    // ==========================================
    //  3. Зарегистрировать секцию «Позже»
    //     через Lampa.ContentRows
    // ==========================================
    function registerWatchLaterRow() {
        Lampa.ContentRows.add({
            name: 'watch_later',
            title: 'Позже',
            index: 2,
            screen: ['main'],
            call: function (params, screen) {
                var results = Lampa.Favorite.get({ type: 'wath' });
                if (!results || !results.length) return;

                return function (call) {
                    call({
                        results: results.slice(0, 20),
                        title: 'Позже'
                    });
                };
            }
        });
    }

    // ==========================================
    //  4. Скрыть ненужные + переставить порядок
    //     Вызывается многократно (retry), поэтому
    //     каждый раз пересканирует все секции.
    // ==========================================
    function hideAndReorder() {
        if (!isMainPage()) return;

        var sections = document.querySelectorAll('.items-line');
        if (!sections.length) return;

        var continueSection = null;
        var laterSection = null;
        var parent = null;

        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var text = getSectionTitle(section);

            if (isContinueTitle(text)) {
                continueSection = section;
                section.style.display = '';
                if (!parent) parent = section.parentNode;
            } else if (isLaterTitle(text)) {
                laterSection = section;
                section.style.display = '';
                if (!parent) parent = section.parentNode;
            } else {
                section.style.display = 'none';
            }
        }

        if (!parent) return;

        // --- Переставляем DOM-порядок ---
        // Сначала ставим «Позже» в начало контейнера,
        // потом «Продолжить» перед ним.
        // Итого: Продолжить → Позже → (скрытое)
        if (laterSection && laterSection.parentNode === parent) {
            parent.insertBefore(laterSection, parent.firstChild);
        }
        if (continueSection && continueSection.parentNode === parent) {
            parent.insertBefore(continueSection, parent.firstChild);
        }
    }

    // ==========================================
    //  5. Retry-цикл — секции грузятся асинхронно
    //     «Продолжить просмотр» может появиться
    //     позже «Позже», поэтому проверяем долго.
    // ==========================================
    var retryTimer = null;

    function startRetry() {
        stopRetry();
        var attempts = 0;
        var maxAttempts = 60; // 60 × 300ms = 18 сек

        retryTimer = setInterval(function () {
            attempts++;
            if (attempts > maxAttempts || !isMainPage()) {
                stopRetry();
                return;
            }
            hideAndReorder();
        }, 300);

        // Первый вызов сразу
        hideAndReorder();
    }

    function stopRetry() {
        if (retryTimer) {
            clearInterval(retryTimer);
            retryTimer = null;
        }
    }

    // ==========================================
    //  6. MutationObserver — ловим секции
    //     которые добавляются при подгрузке
    // ==========================================
    var observer = null;

    function startObserver() {
        stopObserver();
        if (!isMainPage()) return;

        var target = document.querySelector('.scroll__body');
        if (!target) return;

        observer = new MutationObserver(function () {
            if (!isMainPage()) {
                stopObserver();
                return;
            }
            hideAndReorder();
        });

        observer.observe(target, { childList: true, subtree: true });
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    // ==========================================
    //  7. Обработчик смены activity
    // ==========================================
    function onActivityChange() {
        if (isMainPage()) {
            hideAndReorder();
            startObserver();
            startRetry();
        } else {
            stopObserver();
            stopRetry();
        }
    }

    // ==========================================
    //  8. Запуск плагина
    // ==========================================
    function start() {
        registerWatchLaterRow();

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' || e.type === 'complite') {
                setTimeout(onActivityChange, 200);
            }
        });

        // Если уже на Главной
        setTimeout(onActivityChange, 300);
    }

    // ==========================================
    //  9. Инициализация
    // ==========================================
    if (window.appready) {
        start();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();
