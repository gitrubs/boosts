// ==UserScript==
// @name         GitHub PR Link Copier
// @namespace    https://github.com/gitrubs/boosts
// @version      1.0.1
// @description  Adds a button to copy the current GitHub pull request title and link as rich text.
// @author       gitrubs
// @match        https://github.com/*/*/pull/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

function injectCopyButton() {
    // 1. Evita duplicatas se o botão já estiver lá
    if (document.getElementById('arc-pr-copy-btn')) return;

    // 2. Garante que o body da página já existe antes de injetar
    if (!document.body) return;

    // Cria o botão
    const button = document.createElement('button');
    button.id = 'arc-pr-copy-btn';
    button.innerText = '📋 Copy PR';

    // Estiliza o botão (Preto, flutuante no canto inferior direito)
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#000000',
      color: '#ffffff',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      zIndex: '999999', // Garante que fique por cima da interface do GitHub
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 'bold',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      transition: 'background-color 0.2s ease'
    });

    // Adiciona o botão à página
    document.body.appendChild(button);

    // Lógica de clique do botão
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

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
