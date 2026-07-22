// ==UserScript==
// @name         Jira Google Login Auto-Click
// @namespace    https://github.com/gitrubs/boosts
// @version      1.1.1
// @description  Automatically clicks the Google login button on Atlassian sign-in pages.
// @author       gitrubs
// @match        https://id.atlassian.com/login*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Seletor extraído diretamente do seu HTML
    const TARGET_ID = 'google-auth-button';

    const triggerLogin = () => {
        const btn = document.getElementById(TARGET_ID);
        if (btn) {
            console.log('[Boosts] Botão Google detectado. Disparando clique...');
            btn.click();
            // Desativa o observer para poupar recursos após cumprir a missão
            observer.disconnect();
        }
    };

    // Observer para lidar com a renderização dinâmica do React/Atlassian Kit
    const observer = new MutationObserver((mutations) => {
        triggerLogin();
    });

    // Configuração do Observer: observa mudanças em toda a árvore do root
    const rootContainer = document.getElementById('root') || document.body;
    observer.observe(rootContainer, {
        childList: true,
        subtree: true
    });

    // Tentativa imediata (caso o elemento já esteja no DOM)
    triggerLogin();
})();
