# Persianer Chrome Extension
Chrome extension: Gregorian → Jalali date conversion. 

## Required Files
1. `manifest.json` (Manifest V3)
2. `content.js` - Injects script.js
3. `background.js` - Service worker
4. `popup.html` - Persian RTL UI
5. `popup.js` - UI controller
6. `icons/` - 16x16, 48x48, 128x128 PNG
7. `README.md` - Bilingual docs

### manifest.json
- Manifest V3, permissions: `["storage", "activeTab"]`, host_permissions: `["<all_urls>"]`
- web_accessible_resources: `["script.js"]`

### content.js
- the `script.js` file

### popup.html + popup.js
- Persian RTL UI
- Toggle switch for enable/disable
- Visual status indicator

## Critical Rules
1. suggest your code and give my accepatnce before change into  **`script.js`**
2. Use Manifest V3
3. Add `web_accessible_resources: ["script.js"]`
4. Reload **current tab only** (not all tabs): `chrome.tabs.query({ active: true, currentWindow: true })`
5. Persian text: `dir="rtl"`
6. Settings: `chrome.storage.sync`
7. No external dependencies
8. All tests must be done on `test.html` pages

## Behavior
- Enabled by default
- No data collection
- 100% local processing (no dependency on external services)
- Persian RTL UI

