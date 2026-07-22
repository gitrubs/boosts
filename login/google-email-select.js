// ==UserScript==
// @name         Google Account Auto-Selector
// @namespace    https://github.com/gitrubs/boosts
// @version      1.1.0
// @description  Automatically selects a configured account on Google account chooser pages.
// @author       gitrubs
// @match        https://accounts.google.com/v3/signin/accountchooser*
// @match        https://accounts.google.com/AccountChooser*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'targetEmail';

    function configureTargetEmail() {
        const currentEmail = GM_getValue(STORAGE_KEY, '');
        const input = window.prompt('Email address to select on Google account chooser:', currentEmail);

        if (input === null) return currentEmail;

        const email = input.trim();
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValidEmail) {
            window.alert('Enter a valid email address.');
            return currentEmail;
        }

        GM_setValue(STORAGE_KEY, email);
        return email;
    }

    let targetEmail = GM_getValue(STORAGE_KEY, '');
    let observer;

    function selectAccount() {
        if (!targetEmail) return false;

        const accountItem = Array.from(document.querySelectorAll('[data-identifier]'))
            .find((element) => element.dataset.identifier === targetEmail);

        if (!accountItem) return false;

        accountItem.click();
        observer?.disconnect();
        return true;
    }

    GM_registerMenuCommand('Configure target Google account', () => {
        targetEmail = configureTargetEmail();
        selectAccount();
    });

    if (!targetEmail) {
        targetEmail = configureTargetEmail();
    }

    if (!targetEmail || selectAccount()) return;

    observer = new MutationObserver(selectAccount);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
