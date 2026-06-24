# Persianer Chrome Extension — AI Agent Guide

**پرشینر : تجربه روان فارسی در وب**

A Chrome extension (Manifest V3) for Gregorian → Jalali (Persian) date conversion, auto RTL detection, and full-page RTL — now with a profile system. Vanilla JS, no frameworks, no bundlers.

> Available skills: `/fix-readme-conflicts` — resolves Git merge conflict markers in README.md.

> 🧠 **Before editing, read the development skill file**: [`.github/skills/persianer-dev/SKILL.md`](.github/skills/persianer-dev/SKILL.md)
> It contains the complete workflow: edit-build-reload loop, file map, UI rules, coding conventions, debugging checklist, and live-testing via DevTools MCP.

## Quick Orientation

### Architecture
- **Dual-world**: ISOLATED content script (`content.js`) injects MAIN page scripts (`config.js` → `logger.js` → `script.js`) via `web_accessible_resources`.
- **CSP-safe transport**: Settings are passed via `data-persianer-*` attributes on `<html>`, not `postMessage`.
- **Profile system v2**: `profiles.js` (shared core) manages `chrome.storage.sync` schema with OR-merge logic. Loaded in all worlds (background, content, popup, options).
- **Storage I/O**: Always route through `PersianerProfiles.loadState/saveState` — never call `chrome.storage.sync` directly from UI code.

### Build Pipeline
```powershell
.\build.ps1 -Mode dev    # → build-dev/ (full logging, IS_DEV=true)
.\build.ps1 -Mode prod   # → build-prod/ (errors only, IS_DEV=false)
```
The user loads `build-dev/` unpacked in Chrome. Edit source files (root), rebuild, reload the extension.

### Key Files

| File | Purpose |
|---|---|
| `script.js` | ⚠ **Must suggest changes before editing** (see skill §6). Date detection, conversion, RTL application, MutationObserver. |
| `profiles.js` | Shared profile/match/merge/storage core. Loaded in all worlds. See [storage schema v2](.github/skills/persianer-dev/SKILL.md#3-storage-io-goes-through-the-shared-core) in the skill. |
| `content.js` | Per-tab injection, CSP-safe settings transport, late-loading detection. |
| `background.js` | Service worker — message routing, icon state, `reloadCurrentTab()`. |
| `popup.js` / `popup.html` | Popup UI with profile checkboxes, status card, "manage" button. |
| `options.js` / `options.html` / `options.css` | Full options page with sidebar, CRUD form, regex validation. |
| `config.js` | Feature flags, log levels (replaced at build time). |
| `logger.js` | Environment-aware logging utility. |
| `build.ps1` | PowerShell build script for dev/prod builds. |

### Essential Conventions
- **`IS_DEV` flag** in every script — set to `true` only in dev builds. Use for verbose logging.
- **No external dependencies** — 100% local, no network calls, no analytics.
- **Persian RTL UI** — `dir="rtl"`, `lang="fa"` on root containers. LTR only for code/regex inputs.
- **Reload policy** — `chrome.tabs.query({ active: true, currentWindow: true })` for the current tab only. Skip `chrome://`, `edge://`, `about:` URLs.
- **Off profile is exclusive** — activating it deactivates all others. Enforced in `profiles.js`, not in UI code.
- **Mutual RTL exclusion** — "persianRtl" and "fullPageRtl" are mutually exclusive in the options form.

### Reference Documentation (`.docs/`)
- [`QUICK_REFERENCE.md`](.docs/QUICK_REFERENCE.md) — Dev/prod mode quick commands and logging patterns
- [`TESTING.md`](.docs/TESTING.md) — Testing guide and expected conversion results
- [`DEV_PROD_MODE_GUIDE.md`](.docs/DEV_PROD_MODE_GUIDE.md) — Detailed dev/prod mode explanation
- [`BUILD_SUMMARY.md`](.docs/BUILD_SUMMARY.md) — Project status and file inventory
- [`ICON_STATE_FEATURE.md`](.docs/ICON_STATE_FEATURE.md) — Icon state change mechanics
- [`LATE_LOADING_FIX.md`](.docs/LATE_LOADING_FIX.md) — Late-loading content (SPA/dashboard) support
- [`MONTH_REPETITION_FIX.md`](.docs/MONTH_REPETITION_FIX.md) — Month repetition bug fix details
- [`RELEASE_NOTES.md`](.docs/RELEASE_NOTES.md) — Version history

### Testing
- Use `test.html`, `testlive.html`, and `test-options.html` for quick verification.
- Real-world testing on claude.ai, chatgpt.com, github.com, and google.com.
- For live testing against the user's already-loaded unpacked extension, use the chrome-devtools-mcp server (see skill §3.2, §7).

