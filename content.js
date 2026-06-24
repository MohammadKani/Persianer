/**
 * Content Script - Loads and manages the conversion/RTL script per profile
 * اسکریپت محتوا - بارگذاری و مدیریت اسکریپت بر اساس پروفایل‌ها
 */

(function() {
  'use strict';

  let scriptInjected = false;

  // Compute the effective merged settings for THIS page's hostname, then
  // inject script.js if any feature is on. All profile matching/merging
  // happens in the shared PersianerProfiles core (loaded before content.js).
  // محاسبه تنظیمات مؤثر برای نام میزبان این صفحه، سپس تزریق اسکریپت.
  PersianerProfiles.loadState(function (state) {
    const hostname = location.hostname || '';
    const result = PersianerProfiles.computeEffective(state, hostname);
    const s = result.settings;

    const anyFeatureOn = s.dateConversion || s.persianRtl || s.fullPageRtl;

    if (anyFeatureOn) {
      injectConversionScript(s);
      if (s.dateConversion) {
        setupLateLoadingHandlers();
      }
    }
  });

  /**
   * Inject a script file into the page context
   * تزریق فایل اسکریپت به محیط صفحه
   */
  function injectScript(fileName, onLoadCallback) {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(fileName);
        script.type = 'text/javascript';
        
        script.onerror = function() {
          console.error(`Persianer: Failed to load ${fileName}`);
          reject(new Error(`Failed to load ${fileName}`));
        };
        
        script.onload = function() {
          console.log(`Persianer: ${fileName} loaded successfully`);
          if (onLoadCallback) onLoadCallback();
          
          // Remove script tag after loading to keep DOM clean
          setTimeout(() => {
            script.remove();
          }, 100);
          
          resolve();
        };
        
        (document.head || document.documentElement).appendChild(script);
      } catch (error) {
        console.error(`Persianer: Error injecting ${fileName}:`, error);
        reject(error);
      }
    });
  }

  /**
   * Inject the main conversion script into the page context.
   * Passes the effective merged settings via data attributes on <html> (CSP-safe).
   * تزریق اسکریپت اصلی به محیط صفحه. تنظیمات از طریق data attributes منتقل می‌شود.
   */
  async function injectConversionScript(settings) {
    if (scriptInjected) {
      console.log('Persianer: Script already injected, updating attributes only');
      applySettingsAttributes(settings);
      return;
    }
    
    try {
      applySettingsAttributes(settings);

      // Inject scripts in order: config.js -> logger.js -> script.js
      // تزریق اسکریپت‌ها به ترتیب: config.js -> logger.js -> script.js
      await injectScript('config.js');
      await injectScript('logger.js');
      await injectScript('script.js', () => {
        console.log('Persianer: script loaded successfully');
        scriptInjected = true;
      });
      
    } catch (error) {
      console.error('Persianer: Error injecting scripts:', error);
      scriptInjected = false;
    }
  }

  /**
   * Write the effective settings onto <html> as data attributes.
   * نوشتن تنظیمات مؤثر روی <html> به‌صورت ویژگی‌های data.
   */
  function applySettingsAttributes(settings) {
    const html = document.documentElement;
    html.setAttribute('data-persianer-enabled', settings.dateConversion ? 'true' : 'false');
    html.setAttribute('data-persianer-autortl', settings.persianRtl ? 'true' : 'false');
    html.setAttribute('data-persianer-fullrtl', settings.fullPageRtl ? 'true' : 'false');
    html.setAttribute('data-persianer-minchars', String(settings.minPersianChars));
    html.setAttribute('data-persianer-font', settings.font || 'Sahel');
    html.setAttribute('data-persianer-forcefont', settings.forceFont ? 'true' : 'false');
  }

  /**
   * Setup handlers for late-loading content (e.g., Azure dashboards, SPAs)
   * راه‌اندازی مدیریت‌کننده‌های محتوای دیررس (مثل داشبورد Azure، اپلیکیشن‌های تک‌صفحه‌ای)
   */
  function setupLateLoadingHandlers() {
    try {
      let eventDebounceTimeout = null;
      
      function debounceConversionEvent(eventName, delay) {
        console.log('Persianer: ' + eventName + ' detected');
        if (eventDebounceTimeout) {
          clearTimeout(eventDebounceTimeout);
        }
        eventDebounceTimeout = setTimeout(triggerConversionEvent, delay);
      }

      // Handle visibility changes (e.g., dashboard widgets loading when visible)
      // مدیریت تغییرات نمایش (مثلاً ویجت‌های داشبورد که هنگام نمایش بارگذاری می‌شوند)
      document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
          debounceConversionEvent('Page became visible', 500);
        }
      });

      // Handle popstate events for SPAs
      // مدیریت رویدادهای popstate برای اپلیکیشن‌های تک‌صفحه‌ای
      window.addEventListener('popstate', function() {
        debounceConversionEvent('Popstate event', 500);
      });

      // Handle hash changes
      // مدیریت تغییرات hash
      window.addEventListener('hashchange', function() {
        debounceConversionEvent('Hash change', 500);
      });

      // Monitor for large DOM updates (e.g., dashboard rendering)
      // رصد به‌روزرسانی‌های بزرگ DOM (مثلاً رندر داشبورد)
      let mutationCount = 0;
      let mutationCheckTimeout = null;
      
      const contentObserver = new MutationObserver(function(mutations) {
        mutationCount += mutations.length;
        
        // Throttle mutation checks
        if (mutationCheckTimeout) {
          clearTimeout(mutationCheckTimeout);
        }
        
        mutationCheckTimeout = setTimeout(function() {
          // If we detect many mutations, likely content has loaded
          // اگر تعداد زیادی تغییر تشخیص دهیم، احتمالاً محتوا بارگذاری شده
          if (mutationCount > 50) {  // Increased threshold from 10 to 50
            mutationCount = 0;
            console.log('Persianer: Large DOM update detected');
            triggerConversionEvent();
          } else {
            mutationCount = 0;  // Reset if threshold not met
          }
        }, 1000);  // Check after 1 second of mutations
      });

      contentObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      // REMOVED aggressive 5-second interval for better performance

      console.log('Persianer: Late-loading handlers setup complete');
      
    } catch (error) {
      console.error('Persianer: Error setting up late-loading handlers:', error);
    }
  }

  /**
   * Trigger a custom event to notify script.js to re-process the page
   * فعال‌سازی رویداد سفارشی برای اطلاع به script.js جهت پردازش مجدد صفحه
   */
  function triggerConversionEvent() {
    try {
      const event = new CustomEvent('Persianer-reconvert', {
        bubbles: true,
        detail: { timestamp: Date.now() }
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Persianer: Error triggering conversion event:', error);
    }
  }

  // Listen for messages from popup/background
  // گوش دادن به پیام‌های popup/background
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'reload') {
      window.location.reload();
      sendResponse({ status: 'reloading' });
    }

    // Live-apply effective settings without a full reload (optional path).
    // Updates the data attributes and dispatches toggle events so script.js
    // can react. The primary apply path is a tab reload from background.
    if (request.action === 'applySettings' && request.settings) {
      applySettingsAttributes(request.settings);
      document.dispatchEvent(new CustomEvent('Persianer-rtl-toggle', {
        bubbles: true,
        detail: { enabled: request.settings.persianRtl }
      }));
      document.dispatchEvent(new CustomEvent('Persianer-fullrtl-toggle', {
        bubbles: true,
        detail: { enabled: request.settings.fullPageRtl }
      }));
      document.dispatchEvent(new CustomEvent('Persianer-font-change', {
        bubbles: true,
        detail: { font: request.settings.font, forceFont: request.settings.forceFont }
      }));
      if (request.settings.dateConversion) {
        triggerConversionEvent();
      }
      sendResponse({ status: 'applied' });
    }

    return true;
  });

})();
