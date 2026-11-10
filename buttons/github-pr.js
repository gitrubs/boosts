// ==UserScript==
// @name         GitHub PR Link Copier
// @namespace    https://github.com/gitrubs/boosts
// @version      1.4.0
// @description  Adds a button to copy the current GitHub pull request title, link, and team reviewers with their status as rich text.
// @author       gitrubs
// @match        https://github.com/*/*/pull/*
// @require      https://raw.githubusercontent.com/gitrubs/boosts/refs/heads/main/lib/boost-dock.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

const REVIEW_STATUS = {
  PENDING: '⚪',
  APPROVED: '✅',
  CHANGES_REQUESTED: '🔴',
  COMMENTED: '💬',
};

function getReviewersSection() {
  return document.querySelector('section[aria-label="Reviewers"]')
    ?? document.querySelector('form[id^="pull-request-reviewers-form"]');
}

// Status of a single reviewer row from its indicator icons / tooltip text
function getRowStatus(scope) {
  const tips = [...scope.querySelectorAll('[data-component="Tooltip"]')].map((t) => t.textContent.toLowerCase());
  if (scope.querySelector('.octicon-file-diff, .octicon-x') || tips.some((t) => /requested changes|changes requested/.test(t))) {
    return REVIEW_STATUS.CHANGES_REQUESTED;
  }
  if (scope.querySelector('.octicon-check') || tips.some((t) => /approved/.test(t))) {
    return REVIEW_STATUS.APPROVED;
  }
  if (scope.querySelector('.octicon-comment') || tips.some((t) => /left review comments|commented/.test(t))) {
    return REVIEW_STATUS.COMMENTED;
  }
  return REVIEW_STATUS.PENDING;
}

// Team status = highest priority of its nested members' statuses (changes > approved > commented > pending)
function getTeamStatus(link) {
  const li = link.closest('li');
  const members = [...(li?.querySelectorAll('.nestedMemberList__ARn9iU > li, ul[aria-label^="Members of"] > li') ?? [])];
  const statuses = members.map(getRowStatus);
  if (statuses.includes(REVIEW_STATUS.CHANGES_REQUESTED)) return REVIEW_STATUS.CHANGES_REQUESTED;
  if (statuses.includes(REVIEW_STATUS.APPROVED)) return REVIEW_STATUS.APPROVED;
  if (statuses.includes(REVIEW_STATUS.COMMENTED)) return REVIEW_STATUS.COMMENTED;
  return REVIEW_STATUS.PENDING;
}

// Returns one { status, team } entry per requested team reviewer, e.g. { status: '⚪', team: '@app-team' }
function getTeamReviews() {
  const section = getReviewersSection();
  if (!section) return [];

  const seen = new Set();
  const reviews = [];

  section.querySelectorAll('a[href*="/orgs/"][href*="/teams/"]').forEach((link) => {
    if (link.closest('details')) return; // skip the reviewer picker menu
    const slug = link.getAttribute('href').split('/teams/')[1]?.split(/[/?#]/)[0];
    if (!slug || seen.has(slug)) return;
    seen.add(slug);

    let status;
    if (link.closest('li')?.querySelector('ul[aria-label^="Members of"]')) {
      status = getTeamStatus(link);
    } else {
      const row = link.closest('.js-reviewer-team')?.parentElement ?? link.closest('li') ?? link.parentElement?.parentElement ?? link;
      status = getRowStatus(row);
    }

    reviews.push({ status, team: `@${decodeURIComponent(slug)}` });
  });

  return reviews;
}

function injectCopyButton() {
    // 1. Evita duplicatas se o botão já estiver lá
    if (document.getElementById('arc-pr-copy-btn')) return;

    // 2. Garante que o body da página já existe antes de injetar
    if (!document.body) return;

    // Cria o botão
    const button = document.createElement('button');
    button.id = 'arc-pr-copy-btn';
    button.className = 'boosts-dock-btn';
    button.innerText = '📋 Copy PR';

    // Estiliza o botão (Preto)
    Object.assign(button.style, {
      backgroundColor: '#000000',
      color: '#ffffff',
    });

    BoostDock.mount(button, { order: BoostDock.ORDER.COPY });

    // Lógica de clique do botão
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const prTitleEl = document.querySelector('.js-issue-title, bdi.js-issue-title, [data-testid="issue-title"]');
      const prNumber = window.location.pathname.match(/\/pull\/(\d+)/)?.[1];

      let finalTitle = "";
      const prUrl = window.location.href.split('#')[0];

      if (prTitleEl) {
        const title = prTitleEl.innerText.trim();
        finalTitle = prNumber ? `${title} #${prNumber}` : title;
      } else {
        finalTitle = document.title.split(' · ')[0].replace('Pull Request #', '#');
      }

      finalTitle = finalTitle.replace(/\s+by\s+.+$/i, '').trim();
      const emojiCode = "🚀";

      const teamReviews = getTeamReviews();
      const teamPlainText = teamReviews.map(({ status, team }) => `\n${status} ${team}`).join('');
      const teamHtml = teamReviews.map(({ status, team }) => `<br><span>${status} ${team}</span>`).join('');

      const plainText = `[${emojiCode} ${finalTitle}](${prUrl})${teamPlainText}`;
      const htmlText = `<a href="${prUrl}">${emojiCode} ${finalTitle}</a>${teamHtml}`;

      const blobHtml = new Blob([htmlText], { type: "text/html" });
      const blobText = new Blob([plainText], { type: "text/plain" });

      const data = [new ClipboardItem({
        ["text/html"]: blobHtml,
        ["text/plain"]: blobText
      })];

      navigator.clipboard.write(data).then(() => {
        button.innerText = "✅ Copiado!";
        button.style.backgroundColor = "#238636";

        setTimeout(() => {
          button.innerText = "📋 Copy PR";
          button.style.backgroundColor = "#000000";
        }, 1500);

        console.log("✅ Payload enviado:", plainText);
      }).catch(err => {
        navigator.clipboard.writeText(plainText);
        console.error("Erro ao copiar Rich Text:", err);
      });
    });
  }

  // 3. Estratégia de injeção robusta
  // Tenta injetar imediatamente se a página já estiver carregada
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCopyButton);
  } else {
    injectCopyButton();
  }

  // 4. Lida com a navegação interna (SPA) do GitHub
  document.addEventListener('turbo:load', injectCopyButton);
  document.addEventListener('pjax:end', injectCopyButton);
