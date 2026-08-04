// ==UserScript==
// @name         Jira Task Link Copier
// @namespace    https://github.com/gitrubs/boosts
// @version      1.1.0
// @description  Adds a button to copy the current Jira issue title and clean link as rich text.
// @author       gitrubs
// @match        https://*.atlassian.net/browse/*
// @require      https://raw.githubusercontent.com/gitrubs/boosts/refs/heads/main/lib/boost-dock.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

function injectJiraCopyButton() {
  // 1. Evita duplicatas se o botão já estiver lá
  if (document.getElementById('arc-jira-copy-btn')) return;

  // 2. Garante que o body da página já existe antes de injetar
  if (!document.body) return;

  // Cria o botão
  const button = document.createElement('button');
  button.id = 'arc-jira-copy-btn';
  button.className = 'boosts-dock-btn';
  button.innerText = '🔗 Copy Jira Link';

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

    // 1. Get the Title (Summary)
    const titleElement = document.querySelector(
      'h1[data-testid="issue.views.issue-base.foundation.summary.heading"]'
    );
    const title = titleElement ? titleElement.innerText.trim() : document.title.split(' - ')[0].trim();

    // 2. Get the clean URL (remove query params)
    const url = window.location.origin + window.location.pathname;

    const plainText = `${title} (${url})`;
    const htmlText = `<span><a href="${url}">${title}</a></span>`;

    // 3. Execução da Cópia via Clipboard API
    const blobHtml = new Blob([htmlText], { type: 'text/html' });
    const blobText = new Blob([plainText], { type: 'text/plain' });

    const data = [
      new ClipboardItem({
        ['text/html']: blobHtml,
        ['text/plain']: blobText,
      }),
    ];

    navigator.clipboard.write(data).then(() => {
      // Feedback visual no próprio botão
      button.innerText = '✅ Copiado!';
      button.style.backgroundColor = '#36B37E'; // Jira Success Green

      // Retorna o botão ao normal após 1.5 segundos
      setTimeout(() => {
        button.innerText = '🔗 Copy Jira Link';
        button.style.backgroundColor = '#000000';
      }, 1500);

      console.log('✅ Payload enviado:', plainText);
    }).catch((err) => {
      navigator.clipboard.writeText(plainText);
      console.error('Erro ao copiar Rich Text:', err);
    });
  });
}

// Injeta imediatamente se a página já estiver carregada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectJiraCopyButton);
} else {
  injectJiraCopyButton();
}

// Como o Jira é um SPA pesado, um MutationObserver garante que o botão
// sobreviva a navegações internas sem recarregar a página.
const observer = new MutationObserver(() => {
  if (!document.getElementById('arc-jira-copy-btn')) {
    injectJiraCopyButton();
  }
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}
