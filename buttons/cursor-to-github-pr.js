// ==UserScript==
// @name         Open PR in GitHub from Cursor Review
// @namespace    https://github.com/gitrubs/boosts
// @version      1.1.1
// @description  Adds a button to open the current Cursor Review pull request in GitHub.
// @author       gitrubs
// @match        https://app.graphite.com/github/pr/*
// @require      https://raw.githubusercontent.com/gitrubs/boosts/refs/heads/main/lib/boost-dock.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

function injectOpenPrButton() {
    if (document.getElementById('cursor-open-pr-btn')) return;
    if (!document.body) return;

    const button = document.createElement('button');
    button.id = 'cursor-open-pr-btn';
    button.className = 'boosts-dock-btn';
    button.innerText = '🐙 Open in GitHub';

    Object.assign(button.style, {
      backgroundColor: '#24292e',
      color: '#ffffff',
    });

    button.addEventListener('mouseenter', () => button.style.backgroundColor = '#2ea44f');
    button.addEventListener('mouseleave', () => button.style.backgroundColor = '#24292e');

    BoostDock.mount(button, { order: BoostDock.ORDER.NAV });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Extract owner, repo, and PR number from the Cursor URL
      const match = window.location.href.match(/github\/pr\/([^\/]+)\/([^\/]+)\/(\d+)/);

      if (match) {
        const [, owner, repo, prNumber] = match;
        const githubUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}`;
        window.open(githubUrl, '_blank');
      } else {
        button.innerText = '❌ URL mismatch';
        setTimeout(() => button.innerText = '🐙 Open in GitHub', 2000);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectOpenPrButton);
  } else {
    injectOpenPrButton();
  }

  const observer = new MutationObserver(() => {
    if (!document.getElementById('cursor-open-pr-btn')) {
      injectOpenPrButton();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
