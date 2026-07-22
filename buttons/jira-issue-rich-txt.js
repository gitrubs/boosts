// ==UserScript==
// @name         Jira Rich-Link Copier
// @namespace    https://github.com/gitrubs/boosts
// @version      1.2.2
// @description  Adds a button to copy a Jira issue key, title, and link as rich text.
// @author       gitrubs
// @match        https://*.atlassian.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Helper to extract the clean URL and Issue Key dynamically on click
    function getJiraData() {
        let match = window.location.href.match(/browse\/([A-Z0-9]+-\d+)/);
        let issueKey = match ? match[1] : null;

        // Fallback for board views where the issue is a query param (?selectedIssue=KEY)
        if (!issueKey) {
            const urlParams = new URLSearchParams(window.location.search);
            issueKey = urlParams.get('selectedIssue');
        }

        if (issueKey) {
            return {
                url: `${window.location.origin}/browse/${issueKey}`,
                key: issueKey
            };
        }
        return null;
    }

    // Helper to find the issue title/summary safely from Jira's DOM
    function getIssueTitle(issueKey) {
        const headingEl = document.querySelector('h1[data-testid="issue.views.issue-base.foundation.summary.heading"]');
        if (headingEl && headingEl.innerText) {
            return `${issueKey} - ${headingEl.innerText.trim()}`;
        }

        // Fallback to document title if the SPA views haven't finished rendering the H1
        let docTitle = document.title;
        docTitle = docTitle.replace(/ - Jira$/, '');
        return docTitle || issueKey;
    }

    function injectButton() {
        // Prevent duplicate buttons
        if (document.getElementById('jira-rich-copy-button')) return;

        const button = document.createElement('button');
        button.id = 'jira-rich-copy-button';
        button.innerText = 'Copy Rich Link';

        // Floating fixed styles to bypass Jira's layout engine
        button.style.position = 'fixed';
        button.style.bottom = '1.5rem';
        button.style.left = '1.5rem';
        button.style.zIndex = '99999'; // Forces it on top of all Jira view layers

        // Clean Jira-like styling
        button.style.backgroundColor = '#0052CC'; // Atlassian Blue
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '3px';
        button.style.padding = '0 16px';
        button.style.fontSize = '14px';
        button.style.fontWeight = '500';
        button.style.cursor = 'pointer';
        button.style.height = '40px';
        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.transition = 'background-color 0.1s ease';
        button.style.borderRadius = '8px';
        button.style.height = '48px';

        button.onmouseover = () => button.style.backgroundColor = '#0747A6';
        button.onmouseout = () => button.style.backgroundColor = '#0052CC';

        button.addEventListener('click', async (e) => {
            e.preventDefault();

            const jiraData = getJiraData();
            if (!jiraData) {
                // Friendly error if clicked on a page that isn't a task
                const originalText = button.innerText;
                button.innerText = 'No Issue Found';
                button.style.backgroundColor = '#DE350B'; // Atlassian Red
                setTimeout(() => {
                    button.innerText = originalText;
                    button.style.backgroundColor = '#0052CC';
                }, 2000);
                return;
            }

            const url = jiraData.url;
            const title = getIssueTitle(jiraData.key);

            // Clean payloads without emojis
            const plainText = `${title} (${url})`;
            const htmlText = `<span><a href="${url}">${title}</a></span>`;

            const blobHtml = new Blob([htmlText], { type: "text/html" });
            const blobText = new Blob([plainText], { type: "text/plain" });

            const data = [new ClipboardItem({
                ["text/html"]: blobHtml,
                ["text/plain"]: blobText
            })];

            try {
                await navigator.clipboard.write(data);

                // Pure text visual feedback
                const originalText = button.innerText;
                button.innerText = 'Copied!';
                button.style.backgroundColor = '#00875A'; // Atlassian Green
                setTimeout(() => {
                    button.innerText = originalText;
                    button.style.backgroundColor = '#0052CC';
                }, 2000);
            } catch (err) {
                console.error('Failed to write to clipboard: ', err);
            }
        });

        document.body.appendChild(button);
    }

    // Run execution guards
    if (document.body) {
        injectButton();
    } else {
        window.addEventListener('DOMContentLoaded', injectButton);
    }

    // Occasional safety loop in case Jira completely wipes out the document body layout
    setInterval(injectButton, 3000);
})();
