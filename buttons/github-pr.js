// ==UserScript==
// @name         GitHub PR Link Copier
// @namespace    https://github.com/gitrubs/boosts
// @version      1.1.0
// @description  Adds a button to copy the current GitHub pull request title and link as rich text.
// @author       gitrubs
// @match        https://github.com/*/*/pull/*
// @require      https://raw.githubusercontent.com/gitrubs/boosts/refs/heads/main/lib/boost-dock.js
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
