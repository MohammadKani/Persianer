/**
 * Background Service Worker - Extension lifecycle management
 * سرویس ورکر پس‌زمینه - مدیریت چرخه حیات افزونه
 */

// Load the shared profile core into the service worker scope.
// بارگذاری هسته مشترک پروفایل‌ها در محیط سرویس ورکر.
importScripts('profiles.js');

// Simple logging wrapper for background service worker
// حلقه‌بندی ساده لاگ‌گیری برای سرویس ورکر پس‌زمینه
const IS_DEV = false; // Set by build script
const log = {
  debug: IS_DEV ? console.log.bind(console) : () => {},
  info: IS_DEV ? console.info.bind(console) : () => {},
  warn: IS_DEV ? console.warn.bind(console) : () => {},
  error: console.error.bind(console) // Always log errors
};

/**
 * Update extension icon based on whether ANY feature is active
 * به‌روزرسانی آیکون افزونه بر اساس فعال بودن حداقل یک ویژگی
 */
function updateIcon(enabled) {
  const iconSuffix = enabled ? '' : '-disabled';
  
  chrome.action.setIcon({
    path: {
      16: `icons/icon16${iconSuffix}.png`,
      48: `icons/icon48${iconSuffix}.png`,
      128: `icons/icon128${iconSuffix}.png`
    }
  }).then(() => {
    log.debug(`Persianer: Icon updated to ${enabled ? 'enabled' : 'disabled'} state`);
  }).catch((error) => {
    log.error('Persianer: Error updating icon:', error);
  });
}

/**
 * Refresh icon from the current profile state.
 * Icon is "enabled" if any active profile other than "off" is active.
 * آیکون: فعال اگر هر پروفایل فعال غیر از «خاموش» وجود داشته باشد.
 */
function refreshIcon() {
  PersianerProfiles.loadState(function (state) {
    const anyActive = !PersianerProfiles.isOffActive(state) &&
      (state.activeProfileIds || []).length > 0;
    updateIcon(anyActive);
  });
}

// Initialize extension on install/update
// راه‌اندازی اولیه افزونه هنگام نصب/به‌روزرسانی
chrome.runtime.onInstalled.addListener(function (details) {
  log.debug('Persianer: Extension installed/updated', details.reason);

  PersianerProfiles.loadState(function (state) {
    // loadState already migrates legacy enabled/autoRtlEnabled on first run.
    log.debug('Persianer: Profile state ready. active=', state.activeProfileIds);
    refreshIcon();
  });

  if (details.reason === 'install') {
    log.debug('Persianer: First time installation');
  }
});

// Handle messages from content scripts, popup, and options page
// مدیریت پیام‌ها از اسکریپت‌های محتوا، popup و صفحه تنظیمات
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  log.debug('Persianer: Received message:', request);

  // Return the full profile state to popup/options.
  if (request.action === 'getProfiles') {
    PersianerProfiles.loadState(function (state) {
      sendResponse({ success: true, state: state });
    });
    return true; // async
  }

  // Save the entire profile state (from options page CRUD).
  if (request.action === 'saveProfiles') {
    PersianerProfiles.saveState(request.state, function (state) {
      refreshIcon();
      // Reload current tab so content.js recomputes effective settings.
      reloadCurrentTab();
      sendResponse({ success: true, state: state });
    });
    return true;
  }

  // Reset all profiles to factory defaults (from options page reset button).
  if (request.action === 'resetProfiles') {
    PersianerProfiles.loadState(function (current) {
      var fresh = PersianerProfiles.resetToDefaults(current);
      PersianerProfiles.saveState(fresh, function (state) {
        refreshIcon();
        reloadCurrentTab();
        sendResponse({ success: true, state: state });
      });
    });
    return true;
  }

  // Toggle which profiles are active (from popup checkboxes).
  // Applies the "off" mutual-exclusion rule when request.toggledId is provided.
  if (request.action === 'setActiveProfiles') {
    PersianerProfiles.loadState(function (state) {
      let active = Array.isArray(request.activeProfileIds)
        ? request.activeProfileIds.slice()
        : state.activeProfileIds.slice();
      if (request.toggledId) {
        active = PersianerProfiles.applyOffRule(active, request.toggledId);
      }
      // Keep only valid ids.
      active = active.filter(function (id) { return !!state.profiles[id]; });
      if (active.length === 0) active = [PersianerProfiles.DEFAULT_ID];
      state.activeProfileIds = active;
      PersianerProfiles.saveState(state, function (saved) {
        refreshIcon();
        reloadCurrentTab();
        sendResponse({ success: true, state: saved });
      });
    });
    return true;
  }

  // Open the full options/management page.
  if (request.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
  }

  // Legacy: keep 'reload' working for content scripts that request it.
  if (request.action === 'reload') {
    reloadCurrentTab();
    sendResponse({ success: true });
    return true;
  }

  return true;
});

/**
 * Reload only the current active tab to apply extension state changes
 * بارگذاری مجدد فقط تب فعال فعلی برای اعمال تغییرات وضعیت افزونه
 */
function reloadCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      const tab = tabs[0];
      // Skip chrome:// and edge:// URLs (can't reload these)
      // عبور از URLهای chrome:// و edge:// (قابل بارگذاری مجدد نیستند)
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
        chrome.tabs.reload(tab.id).catch(function (error) {
          log.warn('Persianer: Could not reload tab:', error);
        });
      }
    }
  });
}

log.debug('Persianer: Background service worker initialized');

// Initialize icon on startup
// راه‌اندازی آیکون هنگام شروع
refreshIcon();
