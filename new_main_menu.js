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

    // Заголовки секций которые оставляем (частичное совпадение)
    var KEEP_TITLES = ['Продолжить', 'Позже', 'Continue', 'Watch later'];

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
    //  2. Проверить, разрешён ли заголовок
    // ==========================================
    function isTitleAllowed(text) {
        if (!text) return false;
        for (var i = 0; i < KEEP_TITLES.length; i++) {
            if (text.indexOf(KEEP_TITLES[i]) !== -1) return true;
        }
        return false;
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
    //  4. Обработать одну секцию (.items-line)
    //     — скрыть если не в списке разрешённых
    // ==========================================
    function processSection(section) {
        if (!section) return;
        if (section.getAttribute('data-nmm-done') === '1') return;
        section.setAttribute('data-nmm-done', '1');

        var titleEl = section.querySelector('.items-line__title');
        var text = titleEl ? (titleEl.textContent || titleEl.innerText || '').trim() : '';

        if (!isTitleAllowed(text)) {
            section.style.display = 'none';
        }
    }

    // ==========================================
    //  5. Обработать все секции на странице
    // ==========================================
    function processAllSections() {
        if (!isMainPage()) return;

        var sections = document.querySelectorAll('.items-line');
        for (var i = 0; i < sections.length; i++) {
            processSection(sections[i]);
        }
    }

    // ==========================================
    //  6. Retry-цикл — секции загружаются
    //     асинхронно, проверяем многократно
    // ==========================================
    function retryProcess(attemptsLeft) {
        if (attemptsLeft <= 0) return;
        if (!isMainPage()) return;

        processAllSections();

        setTimeout(function () {
            retryProcess(attemptsLeft - 1);
        }, 500);
    }

    // ==========================================
    //  7. MutationObserver — ловим секции
    //     которые добавляются позже (подгрузка)
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
            processAllSections();
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
    //  8. Обработчик смены activity
    // ==========================================
    function onActivityChange() {
        if (isMainPage()) {
            processAllSections();
            startObserver();
            retryProcess(30); // 30 × 500ms = 15 сек
        } else {
            stopObserver();
        }
    }

    // ==========================================
    //  9. Запуск плагина
    // ==========================================
    function start() {
        // Регистрируем секцию «Позже»
        registerWatchLaterRow();

        // Слушаем переходы между страницами
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' || e.type === 'complite') {
                setTimeout(onActivityChange, 300);
            }
        });

        // Если уже на Главной — обработать сразу
        setTimeout(onActivityChange, 500);
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
