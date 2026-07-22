// ==UserScript==
// @name         GitHub PR Rich-Text Copier and Shortcut
// @namespace    https://github.com/gitrubs/boosts
// @version      2.1.1
// @description  Copies a GitHub pull request as rich text using a button or Hyper+L shortcut.
// @author       gitrubs
// @match        https://github.com/*/*/pull/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. INJECT FLOATING BUTTON STYLES
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        #vm-gh-copy-floating-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 600;
            line-height: 20px;
            color: var(--button-default-textColor-rest, #24292f);
            background-color: var(--button-default-bgColor-rest, #f6f8fa);
            border: 1px solid var(--button-default-borderColor-rest, rgba(27,31,36,0.15));
            border-radius: 6px;
            box-shadow: var(--color-shadow-medium, 0 3px 6px rgba(140,149,159,0.15));
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s cubic-bezier(0.3, 0, 0.5, 1);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }

        #vm-gh-copy-floating-btn:hover {
            background-color: var(--button-default-bgColor-hover, #f3f4f6);
            border-color: var(--button-default-borderColor-hover, rgba(27,31,36,0.15));
            transform: translateY(-2px);
            box-shadow: var(--color-shadow-large, 0 8px 24px rgba(140,149,159,0.2));
        }

        #vm-gh-copy-floating-btn:active {
            background-color: var(--button-default-bgColor-active, #ebecf0);
            transform: translateY(0);
        }

        /* Feedback state success */
        #vm-gh-copy-floating-btn.success {
            color: var(--fgColor-success, #1a7f37);
            background-color: var(--bgColor-success-muted, #dafbe1);
            border-color: var(--borderColor-success-muted, rgba(74,194,107,0.4));
        }
    `;
    document.head.appendChild(style);

    // ==========================================
    // 2. CORE COPY LOGIC
    // ==========================================
    function executeCopy() {
        const prTitleEl = document.querySelector('.js-issue-title, bdi.js-issue-title, [data-testid="issue-title"]');
        const prNumberEl = document.querySelector('.gh-header-number, [data-testid="issue-number"]');

        let finalTitle = "";
        const prUrl = window.location.href.split('#')[0];

        if (prTitleEl) {
            const title = prTitleEl.innerText.trim();
            const number = prNumberEl?.innerText.trim() || "";
            finalTitle = `${title} ${number}`;
        } else {
            finalTitle = document.title.split(' · ')[0].replace('Pull Request #', '#');
        }

        finalTitle = finalTitle.replace(/\s+by\s+.+$/i, '').trim();

        const emojiCode = "🚀";
        const plainText = `${emojiCode} ${finalTitle} (${prUrl})`;
        const htmlText = `<span>${emojiCode}</span> <span><a href="${prUrl}">${finalTitle}</a></span>`;

        const blobHtml = new Blob([htmlText], { type: "text/html" });
        const blobText = new Blob([plainText], { type: "text/plain" });

        const data = [new ClipboardItem({
            ["text/html"]: blobHtml,
            ["text/plain"]: blobText
        })];

        navigator.clipboard.write(data).then(() => {
            provideVisualFeedback();
        }).catch(err => {
            navigator.clipboard.writeText(plainText);
            console.error("Erro ao copiar via Script:", err);
            provideVisualFeedback();
        });
    }

    // ==========================================
    // 3. VISUAL FEEDBACK ACTIONS
    // ==========================================
    function provideVisualFeedback() {
        // Flash tab title
        const oldTitle = document.title;
        document.title = "✅ Copiado!";
        setTimeout(() => { document.title = oldTitle; }, 1500);

        // Flash floating button
        const btn = document.getElementById('vm-gh-copy-floating-btn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✨ Copiado!';
            btn.classList.add('success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('success');
            }, 1500);
        }
    }

    // ==========================================
    // 4. BUTTON INJECTION LOGIC
    // ==========================================
    function injectFloatingButton() {
        // Prevent duplicates
        if (document.getElementById('vm-gh-copy-floating-btn')) return;

        // Create the element
        const btn = document.createElement('button');
        btn.id = 'vm-gh-copy-floating-btn';
        btn.innerHTML = '📋 Copy PR';
        btn.type = 'button';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            executeCopy();
        });

        // Append safely to the body context
        document.body.appendChild(btn);
    }

    // ==========================================
    // 5. EVENT LISTENERS & LIFECYCLE
    // ==========================================

    // Initial runtime load
    if (window.location.href.includes('/pull/')) {
        injectFloatingButton();
    }

    // GitHub SPA transitions (Turbo framework handlers)
    document.addEventListener('turbo:render', () => {
        if (window.location.href.includes('/pull/')) {
            injectFloatingButton();
        } else {
            // Remove button if navigating away from a PR page to a standard repo page
            const btn = document.getElementById('vm-gh-copy-floating-btn');
            if (btn) btn.remove();
        }
    });

    // Fallback Mutation Observer for dynamic elements rendering
    const observer = new MutationObserver(() => {
        if (window.location.href.includes('/pull/')) {
            injectFloatingButton();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Hyper + L Hotkey fallback
    document.addEventListener('keydown', (event) => {
        const isHyperNoShift = event.metaKey && event.altKey && event.ctrlKey;

        if (event.code === 'KeyL' && isHyperNoShift) {
            event.preventDefault();
            event.stopPropagation();
            executeCopy();
        }
    }, true);

})();
