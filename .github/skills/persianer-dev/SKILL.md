---
name: persianer-dev
description: 'Use when: working on the Persianer Chrome extension (Persian/Jalali date conversion, RTL, profile system, popup, options page, content/page scripts, build pipeline). Covers Manifest V3 conventions, dual-world architecture (ISOLATED content + MAIN page), chrome.storage.sync schema v2, OR-merge profile logic, IS_DEV flag, and live testing with the chrome-devtools-mcp server against the user''s already-loaded unpacked extension — no rebuild required for UI tweaks when the dev build is current.'
---

# Persianer Development Skill

A focused workflow for editing, testing, and shipping the **Persianer** Chrome extension.
Optimized for **simple code, simple debugging, and a fantastic Persian RTL UX**.

---

## 1. Project Snapshot

| Aspect | Value |
|---|---|
| Type | Chrome Extension (Manifest V3) |
| Language | Vanilla JS (no framework, no bundler) |
| Storage | `chrome.storage.sync`, schema v2 |
| Worlds | **ISOLATED** content script + **MAIN** page script |
| Build | PowerShell (`build.ps1 -Mode dev|prod`) → `build-dev/` or `build-prod/` |
| UI dirs | `popup.html`, `options.html` + `options.css` |
| Test pages | `test.html`, `testlive.html`, `test-options.html` |
| Brand | Persianer (پرشینر) — تجربه روان فارسی در وب |

> **Single source of truth** = `chrome.storage.sync`. No network calls, no analytics.

---

## 2. File Map (what to touch for what)

| Goal | Edit |
|---|---|
| Date detection / conversion logic | `script.js` (⚠ see §6 — always suggest first) |
| RTL application, MutationObserver | `script.js` |
| Profile / whitelist / merge logic | `profiles.js` (shared by all worlds) |
| Settings read/write, message routing | `background.js` (service worker) |
| Per-tab injection + CSP-safe transport | `content.js` |
| Popup UI + checkboxes | `popup.html`, `popup.js` |
| Options page (sidebar + form) | `options.html`, `options.js`, `options.css` |
| Feature flags / log levels | `config.js` |
| Permissions, version, web_accessible_resources | `manifest.json` |
| Build pipeline / copy rules | `build.ps1` |

---

## 3. The Standard Loop (no rebuild dance)

> The user keeps Chrome running with **Load unpacked → `build-dev/`**. Use this loop.

```
1. EDIT    →  edit the source file under z:\Dev\Persianer\
2. BUILD   →  powershell -File build.ps1 -Mode dev     (fast, ~1s)
3. RELOAD  →  chrome://extensions → click ↻ on Persianer
4. INSPECT →  use chrome-devtools-mcp against the running tab:
                mcp_chrome_devto3_take_snapshot
                mcp_chrome_devto3_evaluate_script
                mcp_chrome_devto3_console (for logs)
5. ITERATE →  repeat 1-4 until done
```

### 3.1 Skip the build for pure-UI work
If you only changed `popup.html` / `popup.js` / `options.html` / `options.js` / `options.css`:
- After step 3 (reload extension), the **next open of popup/options** picks up the new files.
- For content/page scripts you **must** rebuild + reload (the content script is cached in the tab).

### 3.2 Verify MCP is wired to the user's Chrome
Before testing, confirm DevTools MCP is connected:
```
mcp_chrome_devto3_list_pages
```
You should see the user's real Chrome tabs (not a headless browser). If you see only `about:blank` from a sandboxed instance, **ask the user** to attach MCP to their launched Chrome (see §9).

---

## 4. UI / UX Rules (Persianer style)

Every UI change must follow these. They are non-negotiable.

### 4.1 Persian-RTL baseline
- `dir="rtl"` and `lang="fa"` on the root container of every owned page (`popup.html`, `options.html`).
- LTR only for code/IDs/regex inputs (`dir="ltr"` on `<textarea>` and `<input>` that hold code).
- Use **Vazirmatn / Sahel / IRANSans**-style spacing; generous line-height (≥ 1.6) for Persian text.

### 4.2 The five visible states
Every toggleable surface must show all five:
1. **Default** (enabled, but not for this page)
2. **Active here** (green dot + "منطبق با این صفحه" badge)
3. **Off** (red dot / `-disabled` icon)
4. **Loading** (skeleton or disabled with subtle spinner)
5. **Error** (toast: see §4.5)

### 4.3 Mutual exclusion is explicit
- **راست‌چین جملات فارسی** ↔ **راست‌چین کل صفحه** are mutually exclusive in the form.
- Toggling one **disables the other in the same tick**, and **disables the min-chars field** when full-page is on.
- Implement as: one `change` handler that owns the pair, never scatter the logic.

### 4.4 "Off" is exclusive
- Activating the **خاموش** profile **deactivates all others** and switches the icon to `icons/icon*-disabled.png`.
- Activating any non-off profile removes **خاموش** from `activeProfileIds`.
- This is enforced in the merge/normalize step in `profiles.js` — never reimplement it in UI code.

### 4.5 Feedback within 300ms
- **Optimistic UI** for checkboxes: flip the visual state immediately, revert on storage error.
- **Toast** (bottom-center, RTL-aware) for save / delete / error. Auto-dismiss in 2.5s.
- **Unsaved indicator** (`⚠ تغییرات ذخیره نشده`) appears the moment the form differs from baseline.

### 4.6 Accessibility minima
- Every icon-only button needs `aria-label` in Persian.
- Switches use real `<input type="checkbox" class="switch">` (so screen readers + keyboard work).
- Focus ring must be visible (`:focus-visible` outline, not just `:focus`).
- Color is **never** the only signal (dot + label + badge together).

### 4.7 Density & rhythm
- 8px base spacing scale. Toggles: 44px tall, font 14-15px.
- Sidebar item height: 48px. Form row vertical rhythm: 16px.
- Cards: 12px radius, 1px border, soft shadow on hover only.

---

## 5. Coding Rules (keep it simple to debug)

### 5.1 No magic, no framework
- Plain functions, plain objects, plain DOM. No build step beyond the file copier.
- One global per file (`PersianerProfiles`, `PersianerLogger`, `PersianerConverter`).
- IIFE wrapper, `'use strict'`, never pollute `window`.

### 5.2 The `IS_DEV` flag
Every script that logs has:
```js
const IS_DEV = false; // set to true by build.ps1 -Mode dev in dev builds
```
Use this for verbose logging. **Production must set it to `false`** and the build script enforces this for `build-prod`.

### 5.3 Storage I/O goes through the shared core
- **Never** call `chrome.storage.sync.get/set` directly from UI code.
- Route through `PersianerProfiles.loadState(cb)` / `saveProfiles` message in `background.js`.
- Reason: migration, validation, and `Off`-exclusivity all live there in one place.

### 5.4 CSP-safe transport between worlds
- ISOLATED → MAIN: write `data-persianer-*` attributes on `<html>`, then inject `script.js`.
- Never use `postMessage` for settings (it breaks under strict CSP).
- Live re-apply uses **CustomEvents** on `document`:
  `Persianer-rtl-toggle`, `Persianer-fullrtl-toggle`, `Persianer-font-change`, `Persianer-reconvert`.

### 5.5 Defensive regex
- Each whitelist/blacklist entry is a regex **string**. Compile lazily.
- Compile errors are **swallowed at runtime** (with one console.warn) so a single bad pattern can't break a whole profile.
- Show compile errors to the user **only in the validation panel of the options form**, not at runtime.

### 5.6 Reload policy
- Reloads target **the current active tab only**:
  `chrome.tabs.query({ active: true, currentWindow: true }, ...)`
- Skip reloads for `chrome://`, `edge://`, `about:`, the Chrome Web Store, and the PDF viewer.
- Prefer the live CustomEvent flow when the change is local (font, RTL toggle). Reload only for whitelist/blacklist or full-page RTL flips.

---

## 6. ⚠ `script.js` change protocol

Per the project rules in `.github/copilot-instructions.md`:

> "suggest your code and give my acceptance before change into `script.js`"

So before any edit to `script.js`:
1. **Show the proposed diff** in a fenced code block with `// filepath: script.js` header.
2. List **what tests** you'll run to verify (e.g., "reload `testlive.html`, assert `2024-11-15 → ۱۴۰۳/۰۸/۲۵` in the conversation list").
3. **Wait for explicit acceptance** ("بله" / "apply" / "go") before calling the edit tool.

For any other file, edit directly — this rule is unique to `script.js` because the conversion logic is the most user-visible and the most regression-prone.

---

## 7. Debugging Checklist (in order)

| Symptom | First check |
|---|---|
| Popup shows nothing | `chrome://extensions` → Errors button on Persianer card |
| Profile toggle does nothing | `background.js` console (service worker) — message routed? |
| Dates not converting | Page console → `PersianerConverter` global present? `<html data-persianer-dateconv>` set? |
| RTL not applied | `<html data-persianer-autortl>` / `data-persianer-fullrtl` set? Is `script.js` even loaded? (`typeof PersianerConverter`) |
| "Off" doesn't kill features | `isOffActive(state)` check in `profiles.js` — bug in merge? |
| Build missing files | `Get-ChildItem build-dev` — compare with §2 map |
| Regex does nothing | Compile error swallowed? Check `PersianerProfiles.compileRegexes` warn logs |
| Save button does nothing | Look for `validation-errors` hidden div — validation may be blocking |

**Fast MCP probe** (paste into `mcp_chrome_devto3_evaluate_script`):
```js
() => {
  const html = document.documentElement;
  return {
    dateConv: html.dataset.persianerDateconv,
    autoRtl:  html.dataset.persianerAutortl,
    fullRtl:  html.dataset.persianerFullrtl,
    font:     html.dataset.persianerFont,
    hasMain:  typeof window.PersianerConverter !== 'undefined',
  };
}
```

---

## 8. Verification Checklist (before saying "done")

- [ ] `build.ps1 -Mode dev` runs without errors
- [ ] Extension reloads cleanly (no red Errors button)
- [ ] Popup opens, profile list renders, toggle round-trips through `chrome.storage.sync`
- [ ] Options page: edit a built-in whitelist, save, reload options page, value persists
- [ ] `test.html` shows correct Jalali conversion for all listed formats
- [ ] `testlive.html` shows live-updated dates as time passes
- [ ] Activating **خاموش** removes all other active profiles and icon switches to `-disabled`
- [ ] Invalid regex is reported in validation panel but does **not** crash the profile at runtime
- [ ] On a non-matching host (e.g., `example.com` with no whitelist hit), nothing converts — silently
- [ ] No console errors in the page world after a hard refresh

---

## 9. MCP / Chrome connection notes

The user runs Chrome with the extension already loaded (unpacked from `build-dev/`).
The chrome-devtools-mcp server must be configured with:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--browserUrl", "http://127.0.0.1:9222"]
    }
  }
}
```

…where Chrome was launched with `--remote-debugging-port=9222 --user-data-dir=<separate>`.
See `userMemory/chrome-cdp-debugging.md` for the silent-drop pitfall on the default profile.

If the MCP tools return only a sandboxed `about:blank` and not the user's real tabs,
**stop and ask the user** to restart the MCP server — it cannot be done from this side.

---

## 10. What this skill is **not**

- ❌ Not a build script — use `build.ps1`.
- ❌ Not a tester — use the test pages + MCP.
- ❌ Not a designer — the look is already settled (Zero Omega sidebar + Persian RTL cards).
- ❌ Not a refactor guide — keep changes scoped; larger refactors go through a separate proposal.

Keep this skill short. If a section grows past ~40 lines, split it into a referenced file.
