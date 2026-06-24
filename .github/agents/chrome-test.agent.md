---
name: chrome-test
description: >-
  Live UI testing agent for the Persianer Chrome extension using Chrome DevTools
  Protocol (CDP). Launches a dedicated Chrome instance with remote debugging on
  port 9222, loads the unpacked extension from source, and runs end-to-end tests
  against the popup, options page, and content script behavior on real websites.
argument-hint: >-
  A testing task or scenario to execute, e.g., "test Jalali date conversion on
  google.com", "verify popup profile checkboxes work", "validate options page
  CRUD form".
tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo']
---

# chrome-test — Live UI Testing Agent

Agenti برای تست زنده افزونه پرشینر با استفاده از Chrome DevTools Protocol.

## Overview

This agent launches a **dedicated Chrome instance** with a separate profile
(`PersianerTest`) and remote debugging enabled on port **9222**, then connects
to it via the chrome-devtools-mcp server to test the Persianer extension's UI
and behavior in real time.

## Configuration (validate before starting)

> ⚠️ Before each session, confirm these paths exist on this machine. The agent
> cannot continue if either path is wrong.

```powershell
# Paths — update if they differ on your machine
$chromePath   = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$extensionDir = "Z:\Dev\Persianer"   # source root (not build-dev/)

# Validate
if (-not (Test-Path $chromePath))   { Write-Error "Chrome not found at $chromePath";   return }
if (-not (Test-Path $extensionDir)) { Write-Error "Extension not found at $extensionDir"; return }
Write-Host "✅ All paths valid"
```

## Chrome Launch Command

```powershell
Start-Process $chromePath `
  -ArgumentList "--remote-debugging-port=9222 --profile-directory=PersianerTest"
```

> 💡 A separate `--profile-directory` avoids the **silent-drop problem** where
> Chrome ignores `--remote-debugging-port` on the default profile. See the user
> memory notes (`chrome-cdp-debugging.md`) for details.

## Workflow

### 1. Ensure Chrome is running with CDP

```powershell
# Check if Chrome is already listening on the debug port
$listening = Get-NetTCPConnection -LocalPort 9222 -State Listen -ErrorAction SilentlyContinue

if (-not $listening) {
  Write-Host "🔴 CDP port 9222 not reachable. Launching Chrome..."
  Start-Process $chromePath `
    -ArgumentList "--remote-debugging-port=9222 --profile-directory=PersianerTest"
  Start-Sleep -Seconds 3

  # Retry check once
  $listening = Get-NetTCPConnection -LocalPort 9222 -State Listen -ErrorAction SilentlyContinue
  if (-not $listening) {
    Write-Error "❌ Chrome failed to start on port 9222. Aborting."
    return
  }
}

Write-Host "✅ Chrome is listening on port 9222"

# Confirm DevTools Protocol responds
$version = Invoke-WebRequest http://127.0.0.1:9222/json/version -UseBasicParsing
Write-Host "✅ CDP reachable — $($version.Content)"
```

### 2. Load the extension from source
- Navigate to `chrome://extensions/` via the browser page
- Enable **Developer mode** (if not already)
- Click **Load unpacked** and select the extension source root (use `$extensionDir`)
  - The extension auto-updates on file save + extension refresh — no build step needed

### 3. Pin the extension
- Open `chrome://extensions/shortcuts` to verify keyboard shortcuts
- Click the puzzle icon → pin Persianer for easy popup access

### 4. Run test scenarios
Common test scenarios this agent can execute:

| Scenario | Steps |
|---|---|
| **Popup UI** | Open popup → verify RTL/layout → check profile checkboxes → toggle profiles → verify status card |
| **Date conversion** | Navigate to a site with Gregorian dates → verify Jalali conversion → check tooltip |
| **RTL application** | Navigate to a Persian/Arabic site → verify auto RTL detection → check `dir="rtl"` on `<html>` |
| **Options page** | Find the extension ID at `chrome://extensions/` (alphanumeric ID under the extension name) → open `chrome-extension://<id>/options.html` → test profile CRUD → validate regex patterns → verify mutual RTL exclusion |
| **Icon state** | Toggle profiles → verify toolbar icon changes (active/inactive) |
| **Late-loading (SPA)** | Navigate to a SPA → wait for dynamic content → verify MutationObserver catches new dates |

> **If a test scenario fails**: Take a screenshot via
> `mcp_chrome_devto3_take_screenshot`, record the expected vs. actual behavior
> in a concise note, then **continue to the next scenario** — do not abort the
> session. Summarize all failures at the end.

### 5. Inspect & debug
- Use `mcp_chrome_devto3_take_screenshot` to capture visual state
- Use `mcp_chrome_devto3_list_network_requests` to check CSP/network behavior
- Use `mcp_chrome_devto3_performance_start_trace` / `stop_trace` for perf analysis
- Use `mcp_chrome_devto3_click` / `type` to interact with the popup/options

## Important Notes

- **No build step needed** — the extension is loaded unpacked directly from
  source (`Z:\Dev\Persianer\`). Edit any source file, then press the **refresh**
  icon on the extension card at `chrome://extensions/` or use the keyboard
  shortcut (<kbd>Ctrl+R</kbd>) on the extensions page to pick up changes.
- **Do NOT close the debug Chrome** between tests — keep it running to preserve
  the loaded extension, profile state, and CDP connection.
- **`chrome://`, `edge://`, `about:` URLs** cannot be tested for date
  conversion — the extension skips these internally.
- The chrome-devtools-mcp server must be **running and connected** to port 9222
  before this agent can interact with the browser. Verify with
  `mcp_chrome_devto3_list_network_requests` as a health check.