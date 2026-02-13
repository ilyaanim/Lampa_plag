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

    var processing = false;

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
    //  4. Принудительно триггерить видимость
    //     секции после DOM-перестановки.
    //     Lampa рендерит карточки только когда
    //     секция попадает в viewport (lazy load).
    // ==========================================
    function forceVisible(section) {
        if (!section) return;
        try {
            // Dispatch 'visible' event — Lampa Line слушает его
            // для рендеринга карточек внутри секции
            section.dispatchEvent(new CustomEvent('visible'));
        } catch (e) {}
        try {
            // Также триггерим на внутренних элементах
            var body = section.querySelector('.items-line__body');
            if (body) body.dispatchEvent(new CustomEvent('visible'));
            var cards = section.querySelector('.items-cards');
            if (cards) cards.dispatchEvent(new CustomEvent('visible'));
        } catch (e) {}
        try {
            // Layer.visible — Lampa пересчитывает видимость
            if (window.Lampa && Lampa.Layer && Lampa.Layer.visible) {
                Lampa.Layer.visible(section);
            }
        } catch (e) {}
    }

    // ==========================================
    //  5. Скрыть ненужные + переставить порядок
    //     + триггернуть видимость
    // ==========================================
    function hideAndReorder() {
        if (!isMainPage()) return;
        if (processing) return;
        processing = true;

        try {
            var sections = document.querySelectorAll('.items-line');
            if (!sections.length) return;

            var continueSection = null;
            var laterSection = null;
            var parent = null;
            var needsReorder = false;

            // Фаза 1: скрыть лишние, найти нужные
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

            // Фаза 2: проверить нужна ли перестановка
            // Ищем первый видимый элемент
            var firstVisible = parent.firstElementChild;
            while (firstVisible && firstVisible.style.display === 'none') {
                firstVisible = firstVisible.nextElementSibling;
            }

            if (continueSection && firstVisible !== continueSection) {
                needsReorder = true;
            } else if (!continueSection && laterSection && firstVisible !== laterSection) {
                needsReorder = true;
            }

            // Фаза 3: переставить если нужно
            if (needsReorder) {
                if (laterSection && laterSection.parentNode === parent) {
                    parent.insertBefore(laterSection, parent.firstChild);
                }
                if (continueSection && continueSection.parentNode === parent) {
                    parent.insertBefore(continueSection, parent.firstChild);
                }
            }

            // Фаза 4: принудительная видимость
            // (вызываем всегда — карточки могли не загрузиться)
            setTimeout(function () {
                forceVisible(continueSection);
                forceVisible(laterSection);
                // Layer.update пересчитает позиции
                try {
                    if (window.Lampa && Lampa.Layer && Lampa.Layer.update) {
                        Lampa.Layer.update();
                    }
                } catch (e) {}
            }, 50);

        } finally {
            processing = false;
        }
    }

    // ==========================================
    //  6. Retry-цикл — секции грузятся асинхронно
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
    //  7. MutationObserver — ловим новые секции
    //     (только прямые потомки, без subtree,
    //      чтобы forceVisible не вызывал рекурсию)
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

        // childList без subtree — ловим только добавление новых секций,
        // не реагируем на рендер карточек внутри секций
        observer.observe(target, { childList: true, subtree: false });
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    // ==========================================
    //  8. Обработчик смены activity
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
    //  9. Запуск плагина
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
    //  10. Инициализация
    // ==========================================
    if (window.appready) {
        start();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();
