// ==UserScript==
// @name         Cursor Review PR and Stack Copier
// @namespace    https://github.com/gitrubs/boosts
// @version      3.2.1
// @description  Copies clean links for the current Cursor Review pull request or its full stack.
// @author       gitrubs
// @match        https://review.cursor.com/*
// @match        https://*.review.cursor.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Extrai e constrói a URL limpa apontando apenas até o número do PR (sem o slug da branch)
    function buildCleanCursorUrl(path) {
        const targetPath = path || window.location.pathname;
        const match = targetPath.match(/\/github\/pr\/([^\/]+)\/([^\/]+)\/(\d+)/);

        if (match) {
            const [, org, repo, prNum] = match;
            return `https://review.cursor.com/github/pr/${org}/${repo}/${prNum}`;
        }

        return window.location.href.split('#')[0];
    }

    // Copia o payload em plainText e HTML (para manter hiperlink no GChat / Slack)
    function copyPayload(plainText, htmlText, btnElement, successLabel) {
        const blobHtml = new Blob([htmlText], { type: "text/html" });
        const blobText = new Blob([plainText], { type: "text/plain" });

        const data = [new ClipboardItem({
            ["text/html"]: blobHtml,
            ["text/plain"]: blobText
        })];

        navigator.clipboard.write(data).then(() => {
            showSuccessState(btnElement, successLabel);
        }).catch(err => {
            navigator.clipboard.writeText(plainText);
            showSuccessState(btnElement, successLabel);
            console.error("Erro ao copiar via Clipboard API:", err);
        });
    }

    // --- Botão 1: Copiar Apenas o PR Atual ---
    function copyCurrentPR(btn) {
        const cleanUrl = buildCleanCursorUrl(window.location.pathname);

        // Captura número do PR
        const matchNum = window.location.pathname.match(/\/(\d+)(\/|$)/);
        const prNumberStr = matchNum ? `#${matchNum[1]}` : "";

        // Captura título do PR
        const titleEl = document.querySelector('button.TextareaWithInlineEdit_editButton__BEwW5, .PrHeaderTitle_prHeaderTitleRegion___bjAa');
        let title = titleEl ? titleEl.innerText.trim() : document.title.split('·')[0].trim();

        if (prNumberStr && title.includes(prNumberStr)) {
            title = title.replace(prNumberStr, '').trim();
        }

        const fullTitle = `${title} ${prNumberStr}`.trim();
        const emoji = "🚀";

        const plainText = `${emoji} ${fullTitle} (${cleanUrl})`;
        const htmlText = `<span>${emoji}</span> <span><a href="${cleanUrl}">${fullTitle}</a></span>`;

        copyPayload(plainText, htmlText, btn, "✅ PR Copiado!");
    }

    // --- Botão 2: Copiar Toda a Stack com Contador [N/M] ---
    function copyStackPRs(btn) {
        // Busca todos os links interativos da árvore da Stack
        const stackRowEls = Array.from(document.querySelectorAll('a[class*="StackViz_stackVizRow"]'));

        if (stackRowEls.length === 0) {
            alert("Nenhuma stack encontrada na página ou o painel da Stack está colapsado.");
            return;
        }

        // A árvore do Graphite/Cursor exibe o topo em cima e a base embaixo.
        // Invertemos para ordenar do PR base [1/M] até o topo [M/M].
        const reversedRows = [...stackRowEls].reverse();
        const total = reversedRows.length;

        const items = reversedRows.map((row, index) => {
            const path = row.getAttribute('href') || '';
            const cleanUrl = buildCleanCursorUrl(path);

            // Extrai número do PR
            const numSpan = row.querySelector('.utilities_fontStyleTabularNums__F_L_Z, [class*="textColorLowContrast"]');
            const prNum = numSpan ? numSpan.innerText.trim() : '';

            // Extrai contêiner do título
            const contentsEl = row.querySelector('.StackViz_stackVizRowContents__Z5xmg');
            let rawText = contentsEl ? contentsEl.innerText.trim() : row.innerText.trim();

            if (prNum) {
                rawText = rawText.replace(prNum, '').trim();
            }

            // Clean-up de status do review e tempo acumulados na UI
            let title = rawText.replace(/\b(Draft|Changes requested|Approved|In review|\d+[smhd])\b/gi, '').trim();
            title = title.replace(/\s+/g, ' ');

            const counter = `[${index + 1}/${total}]`;
            const fullTitle = `${title} ${prNum}`.trim();

            return {
                fullTitle,
                cleanUrl,
                counter
            };
        });

        const emoji = "🚀";

        // Constrói formato em texto puro e HTML
        const plainLines = items.map(item => `${emoji} ${item.fullTitle} (${item.cleanUrl}) ${item.counter}`);
        const htmlLines = items.map(item => `<div><span>${emoji}</span> <span><a href="${item.cleanUrl}">${item.fullTitle}</a></span> <span>${item.counter}</span></div>`);

        const plainText = plainLines.join('\n');
        const htmlText = htmlLines.join('');

        copyPayload(plainText, htmlText, btn, `✅ Stack Copiada (${total})!`);
    }

    // Feedback visual temporário no botão
    function showSuccessState(btn, text) {
        const originalText = btn.innerHTML;
        const originalBg = btn.style.backgroundColor;

        btn.innerHTML = text;
        btn.style.backgroundColor = "#0969da";

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = originalBg;
        }, 2000);
    }

    // --- Interface dos Botões Flutuantes ---
    const container = document.createElement('div');
    container.id = 'cursor-pr-copier-container';
    container.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        gap: 8px;
        background: rgba(15, 17, 23, 0.85);
        padding: 6px;
        border-radius: 8px;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    const createBtn = (label, onClick, defaultBg, hoverBg) => {
        const b = document.createElement('button');
        b.innerHTML = label;
        b.style = `
            padding: 8px 14px;
            background-color: ${defaultBg};
            color: white;
            border: none;
            border-radius: 6px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.15s ease, background-color 0.15s ease;
        `;
        b.onmouseover = () => b.style.backgroundColor = hoverBg;
        b.onmouseout = () => b.style.backgroundColor = defaultBg;
        b.onclick = () => onClick(b);
        return b;
    };

    const btnPR = createBtn('🚀 Copiar PR', copyCurrentPR, '#2ea44f', '#2c974b');
    const btnStack = createBtn('🥞 Copiar Stack', copyStackPRs, '#6f42c1', '#5a32a3');

    container.appendChild(btnPR);
    container.appendChild(btnStack);
    document.body.appendChild(container);
})();
