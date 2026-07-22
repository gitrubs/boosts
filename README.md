# Boosts

Small userscripts that add shortcuts and workflow improvements to websites used in Zen, Arc, Firefox, and Chromium-based browsers.

## Table of contents

- [Boosts](#boosts)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Creating a boost](#creating-a-boost)
    - [Automatic updates from GitHub](#automatic-updates-from-github)
  - [Button boosts](#button-boosts)
  - [Login boosts](#login-boosts)

## Installation

Install a userscript manager:

- **Firefox-based browsers (including Zen):** [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)
- **Chromium-based browsers (including Chrome and Arc):** [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

To install a boost with Violentmonkey:

1. Open its **Raw file** link below while signed in to GitHub.
2. Copy raw file URL from browser address bar.
3. Open Violentmonkey dashboard and select **New script from URL**.
4. Paste URL and confirm installation.

For Tampermonkey, open **Dashboard → Utilities → Import from URL**, paste raw file URL, then install script.

## Creating a boost

Copy this metadata block to top of a new script:

```javascript
// ==UserScript==
// @name         Script name
// @namespace    https://github.com/gitrubs/boosts
// @version      1.0.0
// @description  Clear English description of what the script does.
// @author       <you-github-username>
// @match        https://example.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
```

Customize `@name`, `@description`, and `@match`. Add another `@match` line for each supported URL pattern. Keep versions in `major.minor.patch` format and increment version whenever installed script changes.

### Automatic updates from GitHub

For public repositories, add these lines before `// ==/UserScript==`, replacing path and filename:

```javascript
// @downloadURL  https://raw.githubusercontent.com/gitrubs/boosts/refs/heads/main/path/script.js
// @updateURL    https://raw.githubusercontent.com/gitrubs/boosts/refs/heads/main/path/script.js
```

Userscript manager checks `@updateURL`, compares `@version`, then downloads newer script from `@downloadURL`. Private GitHub repositories cannot use permanent raw URLs for unattended updates because extension cannot authenticate with GitHub. Signed `?token=...` URLs are temporary and must not be stored in scripts.

## Button boosts

| Boost | Description | Raw file |
| --- | --- | --- |
| GitHub PR link copier | Adds floating button to copy current GitHub PR title and link as rich text. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/buttons/github-pr.js) |
| GitHub PR rich-text copier and shortcut | Adds floating copy button plus <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>Ctrl</kbd> + <kbd>L</kbd> shortcut. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/buttons/github-copy-pr-keybind.js) |
| GitHub to Cursor Review | Adds GitHub PR button that opens matching PR in Cursor Review. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/buttons/github-to-cursor-review.js) |
| Cursor Review to GitHub | Adds Cursor Review button that opens matching GitHub PR. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/buttons/cursor-to-github-pr.js) |
| Cursor Review PR and stack copier | Copies current Cursor Review PR or full stacked-PR list with clean links and stack counters. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/buttons/cursor-review-stacked-pr.js) |
| Jira task link copier | Adds floating button to copy Jira issue title and clean link as rich text. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/buttons/jira-task.js) |
| Jira rich-link copier | Adds floating button that copies Jira issue key, title, and link from issue or board views. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/buttons/jira-issue-rich-txt.js) |

## Login boosts

| Boost | Description | Raw file |
| --- | --- | --- |
| Google account auto-selector | Prompts for preferred email on first use, then selects that account on Google account chooser pages. Use **Configure target Google account** from userscript manager menu to change it. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/login/google-email-select.js) |
| Jira Google login | Automatically clicks Google login on Atlassian sign-in pages. | [Raw file](https://github.com/gitrubs/boosts/raw/refs/heads/main/login/jira-google-login.js) |
