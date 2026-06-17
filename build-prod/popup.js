/**
 * Popup Script - Controls extension UI and state
 * اسکریپت Popup - کنترل رابط کاربری و وضعیت افزونه
 */

(function() {
  'use strict';

  // Simple logging wrapper for popup
  // حلقه‌بندی ساده لاگ‌گیری برای popup
  const IS_DEV = false; // Production build // Set by build script
  const log = {
    debug: IS_DEV ? console.log.bind(console) : () => {},
    info: IS_DEV ? console.info.bind(console) : () => {},
    warn: IS_DEV ? console.warn.bind(console) : () => {},
    error: console.error.bind(console) // Always log errors
  };

  const toggleSwitch = document.getElementById('toggle-switch');
  const rtlToggleSwitch = document.getElementById('rtl-toggle-switch');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  /**
   * Update UI based on extension state
   * به‌روزرسانی رابط کاربری بر اساس وضعیت افزونه
   */
  function updateUI(enabled, autoRtlEnabled) {
    if (enabled) {
      toggleSwitch.classList.add('active');
    } else {
      toggleSwitch.classList.remove('active');
    }
    // Status dot + text reflect whether ANY feature is active
    // دات و متن وضعیت نشان‌دهنده فعال بودن حداقل یکی از ویژگی‌ها هستند
    const anyActive = enabled || autoRtlEnabled;
    if (anyActive) {
      statusDot.classList.remove('disabled');
      if (enabled && autoRtlEnabled) {
        statusText.textContent = 'وضعیت:  فعال';
        // statusText.textContent = 'وضعیت: تاریخ + راست‌چین فعال';
      } else if (enabled) {
        statusText.textContent = 'وضعیت:  فعال';
        // statusText.textContent = 'وضعیت: تبدیل تاریخ فعال';
      } else {
        statusText.textContent = 'وضعیت:  فعال';
        // statusText.textContent = 'وضعیت: راست‌چین فعال';
      }
    } else {
      statusDot.classList.add('disabled');
      statusText.textContent = 'وضعیت: غیرفعال';
    }
  }

  /**
   * Update RTL toggle UI
   * به‌روزرسانی رابط کاربری سوئیچ راست‌چین
   */
  function updateRtlUI(enabled) {
    if (enabled) {
      rtlToggleSwitch.classList.add('active');
    } else {
      rtlToggleSwitch.classList.remove('active');
    }
  }

  /**
   * Load current extension state
   * بارگذاری وضعیت فعلی افزونه
   */
  function loadState() {
    chrome.storage.sync.get(['enabled', 'autoRtlEnabled'], function(result) {
      const enabled = result.enabled !== false;
      const autoRtlEnabled = result.autoRtlEnabled !== false;
      updateUI(enabled, autoRtlEnabled);
      updateRtlUI(autoRtlEnabled);
      log.debug('Persianer Popup: Current state:', enabled ? 'enabled' : 'disabled',
        '| Auto RTL:', autoRtlEnabled ? 'enabled' : 'disabled');
    });
  }

  /**
   * Handle toggle switch change
   * مدیریت تغییر سوئیچ فعال/غیرفعال
   */
  function handleToggle() {
    const enabled = toggleSwitch.classList.contains('active');
    const newState = !enabled;
    
    log.debug('Persianer Popup: Toggle changed to:', newState ? 'enabled' : 'disabled');
    
    // Update storage
    // به‌روزرسانی ذخیره‌سازی
    chrome.storage.sync.set({ enabled: newState }, function() {
      if (chrome.runtime.lastError) {
        log.error('Persianer Popup: Error saving state:', chrome.runtime.lastError);
        return;
      }
      
      log.debug('Persianer Popup: State saved successfully');
      updateRtlUI(rtlToggleSwitch.classList.contains('active'));
      // Defer full UI update until after reload

      // Send message to background script
      // ارسال پیام به اسکریپت پس‌زمینه
      chrome.runtime.sendMessage({
        action: 'toggle',
        enabled: newState,
        reloadTabs: true
      }, function(response) {
        if (chrome.runtime.lastError) {
          log.error('Persianer Popup: Error sending message:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          log.debug('Persianer Popup: Extension state updated and tabs reloading');
          showConfirmation();
        }
      });
    });
  }

  /**
   * Show brief confirmation message
   * نمایش پیام تأیید کوتاه
   */
  function showConfirmation() {
    statusText.textContent = 'در حال بارگذاری...';
    setTimeout(function() { loadState(); }, 2000);
  }

  /**
   * Handle RTL toggle switch change
   * مدیریت تغییر سوئیچ RTL
   */
  function handleRtlToggle() {
    const enabled = rtlToggleSwitch.classList.contains('active');
    const newState = !enabled;

    log.debug('Persianer Popup: RTL toggle changed to:', newState ? 'enabled' : 'disabled');

    chrome.storage.sync.set({ autoRtlEnabled: newState }, function() {
      if (chrome.runtime.lastError) {
        log.error('Persianer Popup: Error saving RTL state:', chrome.runtime.lastError);
        return;
      }
      updateRtlUI(newState);

      // Notify content script to apply/remove RTL immediately without full reload
      // اطلاع به content script برای اعمال یا حذف فوری RTL بدون ریلود کامل
      chrome.runtime.sendMessage({
        action: 'toggleRtl',
        enabled: newState
      }, function(response) {
        if (chrome.runtime.lastError) {
          log.error('Persianer Popup: Error sending RTL message:', chrome.runtime.lastError);
        }
      });

      setTimeout(function() { loadState(); }, 800);
    });
  }

  /**
   * Initialize popup
   * راه‌اندازی popup
   */
  function initialize() {
    log.debug('Persianer Popup: Initializing...');
    
    // Load current state
    // بارگذاری وضعیت فعلی
    loadState();
    
    // Add event listener to toggle switch and its label
    // افزودن شنونده رویداد به سوئیچ و برچسب آن
    toggleSwitch.addEventListener('click', handleToggle);
    rtlToggleSwitch.addEventListener('click', handleRtlToggle);
    document.querySelector('label[for="toggle-switch"]').addEventListener('click', handleToggle);
    document.querySelector('label[for="rtl-toggle-switch"]').addEventListener('click', handleRtlToggle);
    
    log.debug('Persianer Popup: Initialized successfully');
  }

  // Initialize when DOM is ready
  // راه‌اندازی زمانی که DOM آماده است
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Handle errors
  // مدیریت خطاها
  window.addEventListener('error', function(event) {
    log.error('Persianer Popup: Error:', event.error);
  });

})();
