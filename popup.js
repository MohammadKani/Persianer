/**
 * Popup Script - Profile-based UI controller
 * اسکریپت Popup - کنترلر رابط کاربری مبتنی بر پروفایل
 *
 * نمایش:
 *  - وضعیت کلی (آیا برای تب جاری هیچ ویژگی فعالی هست؟)
 *  - لیست پروفایل‌ها با چک‌باکس فعال‌سازی، نقطه رنگ، نام،
 *    نشان «منطبق با این صفحه» و دکمه ویرایش (باز کردن صفحه تنظیمات)
 *  - دکمه «مدیریت پروفایل‌ها»
 */

(function () {
  'use strict';

  const IS_DEV = false;
  const log = {
    debug: IS_DEV ? console.log.bind(console) : () => {},
    info: IS_DEV ? console.info.bind(console) : () => {},
    warn: IS_DEV ? console.warn.bind(console) : () => {},
    error: console.error.bind(console)
  };

  const el = {
    statusHost: document.getElementById('domain-badge'),
    cardDate: document.getElementById('card-date'),
    cardRtl: document.getElementById('card-rtl'),
    cardFont: document.getElementById('card-font'),
    profileList: document.getElementById('profile-list'),
    manageBtn: document.getElementById('manage-btn')
  };

  let currentState = null;
  let currentHostname = '';

  // SVG icons
  const GEAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';

  /**
   * Get the hostname of the current active tab.
   * گرفتن نام میزبان تب فعال فعلی.
   */
  function getCurrentHostname() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (tab && tab.url) {
          try {
            resolve(new URL(tab.url).hostname || '');
          } catch (e) {
            resolve('');
          }
        } else {
          resolve('');
        }
      });
    });
  }

  /**
   * Load the full profile state from background (which reads chrome.storage.sync).
   * بارگذاری وضعیت کامل پروفایل‌ها از پس‌زمینه.
   */
  function loadState() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getProfiles' }, (resp) => {
        if (chrome.runtime.lastError) {
          log.error('Popup: getProfiles error:', chrome.runtime.lastError);
          resolve(null);
          return;
        }
        resolve(resp && resp.success ? resp.state : null);
      });
    });
  }

  /**
   * Set a feature card's active/inactive visual state.
   * تنظیم وضعیت بصری فعال/غیرفعال کارت ویژگی.
   */
  function setFeatureCard(card, isActive) {
    if (!card) return;
    const statusEl = card.querySelector('.feature-status');
    if (isActive) {
      card.classList.remove('inactive');
      card.classList.add('active');
      if (statusEl) statusEl.textContent = 'فعال';
    } else {
      card.classList.remove('active');
      card.classList.add('inactive');
      if (statusEl) statusEl.textContent = 'غیرفعال';
    }
  }

  /**
   * Render the whole popup from currentState + currentHostname.
   * رندر کل popup بر اساس وضعیت و نام میزبان جاری.
   */
  function render() {
    if (!currentState) {
      el.statusHost.textContent = '';
      el.profileList.innerHTML = '';
      setFeatureCard(el.cardDate, false);
      setFeatureCard(el.cardRtl, false);
      setFeatureCard(el.cardFont, false);
      return;
    }

    const state = currentState;
    const host = currentHostname;
    el.statusHost.textContent = host || '';

    // Effective settings for this tab
    const result = PersianerProfiles.computeEffective(state, host);
    const s = result.settings;
    const anyFeatureOn = s.dateConversion || s.persianRtl || s.fullPageRtl;
    const offActive = PersianerProfiles.isOffActive(state);

    // Update feature cards
    setFeatureCard(el.cardDate, s.dateConversion);
    setFeatureCard(el.cardRtl, s.persianRtl || s.fullPageRtl);
    setFeatureCard(el.cardFont, s.forceFont || (s.font && s.font !== 'Sahel'));

    // Update status pill
    // (status pill removed from UI — feature cards now convey status)

    // Build profile list in profileOrder
    const order = state.profileOrder || [];
    const active = state.activeProfileIds || [];
    const matchedIds = result.matchedProfileIds || [];

    el.profileList.innerHTML = '';
    order.forEach((id) => {
      const p = state.profiles[id];
      if (!p) return;
      const isActive = active.indexOf(id) !== -1;
      const isMatched = matchedIds.indexOf(id) !== -1;
      const isOff = id === PersianerProfiles.OFF_ID;

      const row = document.createElement('div');
      row.className = 'profile-row';
      row.dataset.id = id;
      row.title = p.name || id;

      // toggle switch
      const toggleContainer = document.createElement('label');
      toggleContainer.className = 'profile-toggle';
      toggleContainer.style.setProperty('--profile-color', p.color || '#9e9e9e');
      toggleContainer.title = isActive ? 'غیرفعال کردن پروفایل' : 'فعال کردن پروفایل';

      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.checked = isActive;
      toggleInput.className = 'profile-toggle-input';

      const toggleSlider = document.createElement('span');
      toggleSlider.className = 'profile-toggle-slider';

      toggleContainer.appendChild(toggleInput);
      toggleContainer.appendChild(toggleSlider);
      toggleContainer.addEventListener('click', (e) => e.stopPropagation());

      toggleInput.addEventListener('change', () => toggleProfile(id));

      row.appendChild(toggleContainer);

      // // color dot
      // const dot = document.createElement('div');
      // dot.className = 'color-dot';
      // dot.style.background = p.color || '#9e9e9e';
      // row.appendChild(dot);

      // name
      const name = document.createElement('div');
      name.className = 'profile-name';
      name.textContent = p.name || id;
      row.appendChild(name);

      // match badge
      if (isMatched && !isOff) {
        const badge = document.createElement('span');
        badge.className = 'match-badge';
        badge.textContent = 'فعال در این صفحه';
        row.appendChild(badge);
      }

      // // edit gear (only for editable profiles)
      // if (p.editable !== false) {
      //   const gear = document.createElement('button');
      //   gear.className = 'edit-gear';
      //   gear.title = 'ویرایش پروفایل';
      //   gear.innerHTML = GEAR_SVG;
      //   gear.addEventListener('click', (e) => {
      //     e.stopPropagation();
      //     openOptionsForProfile(id);
      //   });
      //   row.appendChild(gear);
      // }

      row.addEventListener('click', () => toggleProfile(id));
      el.profileList.appendChild(row);
    });
  }

  /**
   * Toggle a profile's active state. Applies the off mutual-exclusion rule
   * on the background side, then re-renders.
   * تغییر وضعیت فعال بودن یک پروفایل.
   */
  function toggleProfile(id) {
    if (!currentState) return;

    let active;
    if (id === PersianerProfiles.OFF_ID) {
      // Toggling "off": on → only off, off → activate default
      const offActive = (currentState.activeProfileIds || []).indexOf(PersianerProfiles.OFF_ID) !== -1;
      active = offActive ? [PersianerProfiles.DEFAULT_ID] : [PersianerProfiles.OFF_ID];
    } else {
      active = (currentState.activeProfileIds || []).slice();
      const idx = active.indexOf(id);
      if (idx === -1) {
        active.push(id);
      } else {
        active.splice(idx, 1);
      }
      // If user unchecked everything, keep default active (avoid empty state).
      if (active.length === 0) active.push(PersianerProfiles.DEFAULT_ID);
    }

    const msg = { action: 'setActiveProfiles', activeProfileIds: active };
    // Only send toggledId for non-off so background applies the off-removal rule
    if (id !== PersianerProfiles.OFF_ID) msg.toggledId = id;

    chrome.runtime.sendMessage(
      msg,
      (resp) => {
        if (chrome.runtime.lastError) {
          log.error('Popup: setActiveProfiles error:', chrome.runtime.lastError);
          return;
        }
        if (resp && resp.success && resp.state) {
          currentState = resp.state;
          render();
        }
      }
    );
  }

  /**
   * Open the options page. Optionally pass a profile id to pre-select
   * via a query parameter the options page reads on load.
   * باز کردن صفحه تنظیمات (با انتخاب اختیاری یک پروفایل).
   */
  function openOptionsForProfile(profileId) {
    const url = profileId
      ? chrome.runtime.getURL('options.html') + '?profile=' + encodeURIComponent(profileId)
      : chrome.runtime.getURL('options.html');
    chrome.tabs.create({ url: url });
  }

  /**
   * Initialize popup.
   * راه‌اندازی popup.
   */
  async function initialize() {
    log.debug('Popup: initializing');
    currentHostname = await getCurrentHostname();
    currentState = await loadState();
    render();

    el.manageBtn.addEventListener('click', () => openOptionsForProfile(null));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  window.addEventListener('error', (e) => {
    log.error('Popup: error:', e.error);
  });
})();
