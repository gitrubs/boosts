// ==UserScript==
// @name         Open GitHub PR in Cursor Review
// @namespace    https://github.com/gitrubs/boosts
// @version      1.1.2
// @description  Adds a button to open the current GitHub pull request in Cursor Review.
// @author       gitrubs
// @match        https://github.com/*/*/pull/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    function getCursorUrl() {
        const currentUrl = window.location.href;
        // Regex to extract owner, repo, and PR number
        const prMatch = currentUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);

        if (prMatch) {
            const [_, owner, repo, prNumber] = prMatch;
            return `https://app.graphite.com/github/pr/${owner}/${repo}/${prNumber}`;
        }
        return null;
    }

    function injectButton() {
        const redirectUrl = getCursorUrl();
        if (!redirectUrl) return;

        // Uses attribute selector to match classes starting with or containing the target string
        const container = document.querySelector('div[class*="prc-PageHeader-Actions"]');
        if (!container) return;

        let button = document.getElementById('cursor-review-button');

        // If button already exists, just update its target URL (handles SPA navigation)
        if (button) {
            button.dataset.url = redirectUrl;
            return;
        }

        // Create the button
        button = document.createElement('button');
        button.id = 'cursor-review-button';
        button.innerText = 'Open in Cursor Review';
        button.dataset.url = redirectUrl;

        // Apply GitHub-like styling
        button.style.backgroundColor = '#000'; // GitHub green
        button.style.color = 'white';
        button.style.border = '1px solid rgba(240,246,252,0.1)';
        button.style.borderRadius = '6px';
        button.style.padding = '5px 12px';
        button.style.fontSize = '14px';
        button.style.fontWeight = '500';
        button.style.cursor = 'pointer';
        button.style.marginLeft = '8px';
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.transition = 'background-color 0.2s';

        // Hover effect
        button.onmouseover = () => button.style.backgroundColor = '#464444';
        button.onmouseout = () => button.style.backgroundColor = '#000';

        // Click logic
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(button.dataset.url, '_blank');
        });

        // Insert the button into the container
        container.appendChild(button);
    }

    // Run initially
    injectButton();

    // Listen for GitHub's SPA page transitions
    document.addEventListener('turbo:load', injectButton);

    // Backup Observer to catch elements rendered dynamically after turbo:load
    const observer = new MutationObserver(() => {
        injectButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
