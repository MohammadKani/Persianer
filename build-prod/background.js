/**
 * Background Service Worker - Extension lifecycle management
 * سرویس ورکر پس‌زمینه - مدیریت چرخه حیات افزونه
 */

// Simple logging wrapper for background service worker
// حلقه‌بندی ساده لاگ‌گیری برای سرویس ورکر پس‌زمینه
const IS_DEV = false; // Production build // Set by build script
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
 * Read both feature flags and update icon accordingly
 * خواندن هر دو پرچم و به‌روزرسانی آیکون بر اساس آن‌ها
 */
function refreshIcon() {
  chrome.storage.sync.get(['enabled', 'autoRtlEnabled'], function(result) {
    const anyActive = (result.enabled !== false) || (result.autoRtlEnabled !== false);
    updateIcon(anyActive);
  });
}

// Initialize extension on install
// راه‌اندازی اولیه افزونه هنگام نصب
chrome.runtime.onInstalled.addListener(function(details) {
  log.debug('Persianer: Extension installed/updated');
  
  // Set default settings
  chrome.storage.sync.get(['enabled', 'autoRtlEnabled'], function(result) {
    if (result.enabled === undefined) {
      chrome.storage.sync.set({ 
        enabled: true,
        autoRtlEnabled: true,
        installDate: new Date().toISOString()
      }, function() {
        log.debug('Persianer: Default settings initialized');
        updateIcon(true);
      });
    } else {
      // Icon active if either feature is on
      // آیکون فعال اگر حتی یکی از دو ویژگی فعال باشد
      refreshIcon();
    }
  });

  // Show welcome message on first install
  // نمایش پیام خوش‌آمد در اولین نصب
  if (details.reason === 'install') {
    log.debug('Persianer: First time installation');
    log.debug('تبدیل تاریخ: نصب برای اولین بار');
    
    // You can open a welcome page here if needed
    // می‌توانید صفحه خوش‌آمد را اینجا باز کنید
    // chrome.tabs.create({ url: 'welcome.html' });
  }
});

// Handle messages from content scripts and popup
// مدیریت پیام‌ها از اسکریپت‌های محتوا و popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  log.debug('Persianer: Received message:', request);
  
  if (request.action === 'toggle') {
    // Update enabled state
    // به‌روزرسانی وضعیت فعال/غیرفعال
    chrome.storage.sync.set({ enabled: request.enabled }, function() {
      log.debug(`Persianer: Extension ${request.enabled ? 'enabled' : 'disabled'}`);
      
      // Icon reflects both features — read autoRtlEnabled from storage
      // آیکون هر دو ویژگی را منعکس می‌کند — مقدار autoRtlEnabled از storage خوانده شود
      refreshIcon();
      
      // Reload only current active tab to apply changes
      // بارگذاری مجدد فقط تب فعال فعلی برای اعمال تغییرات
      if (request.reloadTabs !== false) {
        reloadCurrentTab();
      }
      
      sendResponse({ success: true, enabled: request.enabled });
    });
    
    return true; // Keep message channel open for async response
  }

  if (request.action === 'toggleRtl') {
    // Forward RTL toggle to the active tab's content script
    // ارسال تغییر راست چین به content script تب فعال
    chrome.storage.sync.set({ autoRtlEnabled: request.enabled }, function() {
      // Update icon: active if either feature is on
      // آیکون: فعال اگر حتی یکی از دو ویژگی فعال باشد
      refreshIcon();
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'applyRtl',
          enabled: request.enabled
        }, function(response) {
          if (chrome.runtime.lastError) {
            log.debug('Persianer: Could not reach content script for RTL toggle:', chrome.runtime.lastError.message);
          }
        });
      }
    });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'getStatus') {
    // Return current status
    // بازگشت وضعیت فعلی
    chrome.storage.sync.get(['enabled'], function(result) {
      sendResponse({ enabled: result.enabled !== false });
    });
    
    return true; // Keep message channel open for async response
  }
});

/**
 * Reload only the current active tab to apply extension state changes
 * بارگذاری مجدد فقط تب فعال فعلی برای اعمال تغییرات وضعیت افزونه
 */
function reloadCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0]) {
      const tab = tabs[0];
      // Skip chrome:// and edge:// URLs (can't reload these)
      // عبور از URLهای chrome:// و edge:// (قابل بارگذاری مجدد نیستند)
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
        chrome.tabs.reload(tab.id).catch(function(error) {
          log.warn('Persianer: Could not reload tab:', error);
        });
      }
    }
  });
}

// Handle extension icon click (opens popup)
// مدیریت کلیک روی آیکون افزونه (باز کردن popup)
chrome.action.onClicked.addListener(function(tab) {
  log.debug('Persianer: Extension icon clicked');
  log.debug('تبدیل تاریخ: کلیک روی آیکون افزونه');
  // Popup will open automatically due to manifest configuration
  // popup به صورت خودکار باز می‌شود (تنظیم شده در manifest)
});

log.debug('Persianer: Background service worker initialized');
log.debug('تبدیل تاریخ: سرویس ورکر پس‌زمینه راه‌اندازی شد');

// Initialize icon on startup
// راه‌اندازی آیکون هنگام شروع
chrome.storage.sync.get(['enabled'], function(result) {
  const enabled = result.enabled !== false; // Default to enabled
  updateIcon(enabled);
  log.debug(`Persianer: Startup - Extension is ${enabled ? 'enabled' : 'disabled'}`);
  log.debug(`تبدیل تاریخ: راه‌اندازی - افزونه ${enabled ? 'فعال' : 'غیرفعال'} است`);
});
