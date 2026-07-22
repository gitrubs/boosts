// ==UserScript==
// @name         Open PR in GitHub from Cursor Review
// @namespace    https://github.com/gitrubs/boosts
// @version      1.0.2
// @description  Adds a button to open the current Cursor Review pull request in GitHub.
// @author       gitrubs
// @match        https://review.cursor.com/github/pr/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

function injectOpenPrButton() {
    if (document.getElementById('cursor-open-pr-btn')) return;
    if (!document.body) return;

    const button = document.createElement('button');
    button.id = 'cursor-open-pr-btn';
    button.innerText = '🐙 Open in GitHub';

    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#24292e',
      color: '#ffffff',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      zIndex: '999999',
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 'bold',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      transition: 'background-color 0.2s ease'
    });

    button.addEventListener('mouseenter', () => button.style.backgroundColor = '#2ea44f');
    button.addEventListener('mouseleave', () => button.style.backgroundColor = '#24292e');

    document.body.appendChild(button);

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
