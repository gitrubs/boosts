// ==UserScript==
// @name         Boost Dock (library)
// @namespace    https://github.com/gitrubs/boosts
// @version      1.0.0
// @description  Shared floating-button dock for boosts userscripts.
// @author       gitrubs
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const DOCK_ID = 'boosts-dock';
    const STYLE_ID = 'boosts-dock-styles';

    /** @type {{ ACTION: number, COPY: number, NAV: number }} */
    const ORDER = {
        ACTION: 0,
        COPY: 10,
        NAV: 20,
    };

    let mountSeq = 0;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${DOCK_ID} {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;
                pointer-events: none;
            }

            #${DOCK_ID} > * {
                pointer-events: auto;
            }

            .boosts-dock-btn {
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                font-weight: 600;
                font-size: 14px;
                line-height: 1.2;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transition: background-color 0.2s ease, transform 0.15s ease;
            }

            .boosts-dock-btn:hover {
                transform: translateY(-1px);
            }

            .boosts-dock-group {
                display: flex;
                gap: 8px;
                background: rgba(15, 17, 23, 0.85);
                padding: 6px;
                border-radius: 8px;
                backdrop-filter: blur(8px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function getDock() {
        injectStyles();

        let dock = document.getElementById(DOCK_ID);
        if (dock) return dock;

        dock = document.createElement('div');
        dock.id = DOCK_ID;
        (document.body || document.documentElement).appendChild(dock);
        return dock;
    }

    function sortDock(dock) {
        [...dock.children]
            .sort((a, b) => {
                const orderA = Number(a.dataset.boostOrder) || 0;
                const orderB = Number(b.dataset.boostOrder) || 0;
                if (orderA !== orderB) return orderA - orderB;
                return (Number(a.dataset.boostMountSeq) || 0) - (Number(b.dataset.boostMountSeq) || 0);
            })
            .forEach((child) => dock.appendChild(child));
    }

    function stripPositioning(el) {
        el.style.position = '';
        el.style.bottom = '';
        el.style.right = '';
        el.style.left = '';
        el.style.top = '';
        el.style.zIndex = '';
    }

    window.BoostDock = {
        ORDER,

        mount(el, { order = ORDER.COPY } = {}) {
            if (!el) return;

            el.dataset.boostOrder = String(order);
            el.dataset.boostMountSeq = String(++mountSeq);
            stripPositioning(el);

            const dock = getDock();
            dock.appendChild(el);
            sortDock(dock);
        },

        unmount(el) {
            if (!el) return;
            el.remove();

            const dock = document.getElementById(DOCK_ID);
            if (dock && !dock.children.length) dock.remove();
        },
    };
})();
