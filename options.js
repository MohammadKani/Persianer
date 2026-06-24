/**
 * Options Page Script — Profile CRUD controller
 * اسکریپت صفحه تنظیمات — کنترلر ایجاد/ویرایش/حذف پروفایل
 *
 * ساختار Zero Omega-style: نوار کناری لیست پروفایل‌ها + فرم ویرایش.
 * ذخیره‌سازی از طریق chrome.runtime.sendMessage({action:'saveProfiles'}).
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
    profileList: document.getElementById('profile-list'),
    newProfileBtn: document.getElementById('new-profile-btn'),
    sidebarHome: document.getElementById('sidebar-home'),
    formTitle: document.getElementById('form-title'),
    formBadge: document.getElementById('form-badge'),
    backBtn: document.getElementById('back-btn'),
    formEmpty: document.getElementById('form-empty'),
    profileCards: document.getElementById('profile-cards'),
    profileCardsGrid: document.getElementById('profile-cards-grid'),
    profileForm: document.getElementById('profile-form'),
    fieldId: document.getElementById('field-id'),
    fieldName: document.getElementById('field-name'),
    fieldColor: document.getElementById('field-color'),
    colorHex: document.getElementById('color-hex'),
    fieldDateConv: document.getElementById('field-dateConv'),
    fieldPersianRtl: document.getElementById('field-persianRtl'),
    fieldMinchars: document.getElementById('field-minchars'),
    mincharsRow: document.getElementById('minchars-row'),
    fieldFullrtl: document.getElementById('field-fullrtl'),
    fieldFont: document.getElementById('field-font'),
    fieldForcefont: document.getElementById('field-forcefont'),
    fontCombobox: document.getElementById('font-combobox'),
    fontComboboxBtn: document.getElementById('font-combobox-btn'),
    fontComboboxList: document.getElementById('font-combobox-list'),
    fieldWhitelist: document.getElementById('field-whitelist'),
    fieldBlacklist: document.getElementById('field-blacklist'),
    validationErrors: document.getElementById('validation-errors'),
    saveBtn: document.getElementById('save-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    unsavedIndicator: document.getElementById('unsaved-indicator'),
    toast: document.getElementById('toast')
  };

  let state = null;
  let formSnapshot = null;   // baseline of last fillForm — used for dirty detection
  let suppressDirty = false; // true while fillForm is programmatically setting values

  /**
   * Capture the current form field values as the "clean" baseline.
   * فرم را به‌عنوان وضعیت پایه (تمیز) ثبت می‌کند.
   */
  function snapshotForm() {
    formSnapshot = {
      name: el.fieldName.value,
      color: el.fieldColor.value,
      dateConv: el.fieldDateConv.checked,
      persianRtl: el.fieldPersianRtl.checked,
      minchars: el.fieldMinchars.value,
      fullrtl: el.fieldFullrtl.checked,
      font: el.fieldFont.value,
      forceFont: el.fieldForcefont.checked,
      whitelist: el.fieldWhitelist.value,
      blacklist: el.fieldBlacklist.value
    };
    el.unsavedIndicator.classList.add('hidden');
  }

  /**
   * Compare current form values against the snapshot.
   * If any field differs, show the "unsaved changes" warning.
   * اگر فیلدی تغییر کرده باشد، هشدار تغییرات ذخیره‌نشده نمایش داده می‌شود.
   */
  function checkDirty() {
    if (suppressDirty || !formSnapshot) return;
    const dirty =
      el.fieldName.value !== formSnapshot.name ||
      el.fieldColor.value !== formSnapshot.color ||
      el.fieldDateConv.checked !== formSnapshot.dateConv ||
      el.fieldPersianRtl.checked !== formSnapshot.persianRtl ||
      el.fieldMinchars.value !== formSnapshot.minchars ||
      el.fieldFullrtl.checked !== formSnapshot.fullrtl ||
      el.fieldFont.value !== formSnapshot.font ||
      el.fieldForcefont.checked !== formSnapshot.forceFont ||
      el.fieldWhitelist.value !== formSnapshot.whitelist ||
      el.fieldBlacklist.value !== formSnapshot.blacklist;
    el.unsavedIndicator.classList.toggle('hidden', !dirty);
  }
  let selectedId = null;

  // ---- Font combobox ----
  function populateFontList() {
    renderFontCombobox('');
  }

  function renderFontCombobox(filterText) {
    const list = el.fontComboboxList;
    list.innerHTML = '';
    const filter = (filterText || '').trim().toLowerCase();
    const fonts = PersianerProfiles.CURATED_FONTS.slice();
    const matched = filter
      ? fonts.filter((f) => f.toLowerCase().indexOf(filter) !== -1)
      : fonts;
    if (matched.length === 0) {
      const li = document.createElement('li');
      li.className = 'no-match';
      li.textContent = 'موردی یافت نشد';
      list.appendChild(li);
      return;
    }
    const currentVal = (el.fieldFont.value || '').trim().toLowerCase();
    matched.forEach((f) => {
      const li = document.createElement('li');
      li.textContent = f;
      li.dataset.value = f;
      if (f.toLowerCase() === currentVal) li.classList.add('active');
      li.addEventListener('mousedown', (e) => {
        e.preventDefault(); // keep input focus
        el.fieldFont.value = f;
        closeFontCombobox();
        updateForcefontEnabled();
        checkDirty();
      });
      list.appendChild(li);
    });
  }

  function openFontCombobox() {
    el.fontComboboxList.classList.remove('hidden');
    el.fontComboboxBtn.classList.add('open');
    renderFontCombobox(el.fieldFont.value);
  }

  function closeFontCombobox() {
    el.fontComboboxList.classList.add('hidden');
    el.fontComboboxBtn.classList.remove('open');
  }

  function toggleFontCombobox() {
    if (el.fontComboboxList.classList.contains('hidden')) {
      openFontCombobox();
    } else {
      closeFontCombobox();
    }
  }

  // ---- State load ----
  function loadState() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getProfiles' }, (resp) => {
        if (chrome.runtime.lastError) {
          log.error('Options: getProfiles error:', chrome.runtime.lastError);
          resolve(null);
          return;
        }
        resolve(resp && resp.success ? resp.state : null);
      });
    });
  }

  function saveState(newState) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'saveProfiles', state: newState }, (resp) => {
        if (chrome.runtime.lastError) {
          log.error('Options: saveProfiles error:', chrome.runtime.lastError);
          resolve(null);
          return;
        }
        resolve(resp && resp.success ? resp.state : null);
      });
    });
  }

  // ---- Sidebar render ----
  function renderSidebar() {
    el.profileList.innerHTML = '';
    const order = state.profileOrder || [];
    order.forEach((id) => {
      const p = state.profiles[id];
      if (!p) return;
      const item = document.createElement('div');
      item.className = 'profile-item' + (id === selectedId ? ' active' : '');
      item.dataset.id = id;

      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = p.color || '#9e9e9e';

      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = p.name || id;

      item.appendChild(dot);
      item.appendChild(name);

      if (p.editable === false) {
        const lock = document.createElement('span');
        lock.className = 'lock';
        lock.textContent = '🔒';
        item.appendChild(lock);
      }

      item.addEventListener('click', () => selectProfile(id));
      el.profileList.appendChild(item);
    });
  }

  // ---- Form render ----
  function selectProfile(id) {
    selectedId = id;
    renderSidebar();
    const p = state.profiles[id];
    if (!p) {
      showCardsView();
      return;
    }
    showFormView();
    fillForm(p);
  }

  /**
   * Show the cards overview (default landing view).
   * نمای کارتی پروفایل‌ها (نمای پیش‌فرض هنگام باز شدن صفحه تنظیمات).
   */
  function showCardsView() {
    selectedId = null;
    el.profileCards.classList.remove('hidden');
    el.formEmpty.classList.add('hidden');
    el.profileForm.classList.add('hidden');
    el.backBtn.classList.add('hidden');
    el.formBadge.classList.add('hidden');
    el.formTitle.textContent = 'پروفایل‌ها';
    document.getElementById('reset-section').classList.remove('hidden');
    renderSidebar();
    renderProfileCards();
  }

  /**
   * Show the edit form for a profile.
   * نمایش فرم ویرایش برای یک پروفایل.
   */
  function showFormView() {
    el.profileCards.classList.add('hidden');
    el.formEmpty.classList.add('hidden');
    el.profileForm.classList.remove('hidden');
    el.backBtn.classList.remove('hidden');
    document.getElementById('reset-section').classList.add('hidden');
  }

  // ---- Profile cards view ----
  function renderProfileCards() {
    if (!el.profileCardsGrid) return;
    el.profileCardsGrid.innerHTML = '';
    const order = state.profileOrder || [];
    const activeIds = new Set(state.activeProfileIds || []);

    order.forEach((id) => {
      const p = state.profiles[id];
      if (!p) return;
      const card = buildProfileCard(p, activeIds.has(id));
      el.profileCardsGrid.appendChild(card);
    });

    // "+ new profile" card always at the end
    el.profileCardsGrid.appendChild(buildNewProfileCard());
  }

  /**
   * Toggle a profile on/off.
   * روشن/خاموش کردن یک پروفایل.
   */
  async function handleToggleProfile(id, turnOn) {
    if (!state) return;

    let newActiveIds;
    if (id === PersianerProfiles.OFF_ID) {
      // Toggling the "off" profile — on = everything off, off = activate default
      newActiveIds = turnOn ? [PersianerProfiles.OFF_ID] : [PersianerProfiles.DEFAULT_ID];
    } else {
      // Remove "off" from active set whenever a real profile is toggled
      newActiveIds = (state.activeProfileIds || []).filter((x) => x !== PersianerProfiles.OFF_ID);
      if (turnOn) {
        if (!newActiveIds.includes(id)) {
          newActiveIds.push(id);
        }
      } else {
        newActiveIds = newActiveIds.filter((x) => x !== id);
        // If nothing active, fall back to "off"
        if (newActiveIds.length === 0) {
          newActiveIds = [PersianerProfiles.OFF_ID];
        }
      }
    }

    state.activeProfileIds = newActiveIds;
    const saved = await saveState(state);
    if (saved) {
      state = saved;
      renderSidebar();
      renderProfileCards();
    } else {
      showToast('خطا در تغییر وضعیت پروفایل.', 'error');
    }
  }

  function buildProfileCard(p, isActive) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    if (isActive) card.classList.add('active');
    if (p.editable === false) card.classList.add('locked');
    card.dataset.id = p.id;
    // Use the profile's own color as a top accent on the card
    card.style.setProperty('--card-accent', p.color || '#9e9e9e');

    const s = p.settings || PersianerProfiles.defaultSettings();

    // ---- Header ----
    const header = document.createElement('div');
    header.className = 'profile-card-header';

    const dot = document.createElement('span');
    dot.className = 'profile-card-dot';
    dot.style.background = p.color || '#9e9e9e';
    header.appendChild(dot);

    const name = document.createElement('span');
    name.className = 'profile-card-name';
    name.textContent = p.name || p.id;
    header.appendChild(name);

    // Toggle switch — on/off profile activation
    const toggleContainer = document.createElement('label');
    toggleContainer.className = 'profile-card-toggle';
    toggleContainer.title = isActive ? 'غیرفعال کردن پروفایل' : 'فعال کردن پروفایل';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = isActive;
    toggleInput.className = 'profile-toggle-input';

    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'profile-toggle-slider';

    toggleContainer.appendChild(toggleInput);
    toggleContainer.appendChild(toggleSlider);

    // Allow toggle on "off" profile even though it's locked for editing
    if (p.editable === false && p.id !== PersianerProfiles.OFF_ID) {
      toggleInput.disabled = true;
      toggleContainer.title = 'غیرقابل تغییر';
    }

    // Stop propagation so toggle clicks don't navigate to the edit form
    toggleContainer.addEventListener('click', (e) => e.stopPropagation());

    toggleInput.addEventListener('change', (e) => {
      e.stopPropagation();
      handleToggleProfile(p.id, toggleInput.checked);
    });

    header.appendChild(toggleContainer);

    // // Lock badge only for non-editable profiles
    // if (p.editable === false) {
    //   const b = document.createElement('span');
    //   b.className = 'profile-card-badge locked';
    //   b.textContent = '🔒';
    //   b.title = 'غیرقابل ویرایش';
    //   header.appendChild(b);
    // }
    card.appendChild(header);

    // ---- Features ----
    const features = document.createElement('div');
    features.className = 'profile-card-features';

    // Date conversion
    features.appendChild(
      makeFeatureRow('📅', s.dateConversion ? 'تبدیل تاریخ شمسی' : 'تبدیل تاریخ غیرفعال', !s.dateConversion)
    );

    // RTL mode
    let rtlLabel;
    if (s.fullPageRtl) rtlLabel = 'کل صفحه RTL';
    else if (s.persianRtl) rtlLabel = 'فقط جملات فارسی';
    else rtlLabel = 'راست‌چین غیرفعال';
    features.appendChild(makeFeatureRow('↩️', 'راست‌چین: ' + rtlLabel, !(s.persianRtl || s.fullPageRtl)));

    // Font
    const fontLabel = s.font ? ('فونت: ' + s.font + (s.forceFont ? ' (اجباری)' : '')) : 'فونت: پیش‌فرض سایت';
    features.appendChild(makeFeatureRow('🔤', fontLabel, !s.font));

    // Whitelist / blacklist counts
    const wl = (s.whitelist || []).length;
    const bl = (s.blacklist || []).length;
    if (wl || bl) {
      const parts = [];
      if (wl) parts.push('وایت: ' + wl);
      if (bl) parts.push('بلک: ' + bl);
      features.appendChild(makeFeatureRow('🎯', parts.join(' • '), false));
    }

    card.appendChild(features);

    // ---- Footer ----
    // const footer = document.createElement('div');
    // footer.className = 'profile-card-footer';

    // const meta = document.createElement('span');
    // meta.className = 'profile-card-meta';
    // meta.textContent = p.builtin ? 'ساخته شده توسط افزونه' : 'ساخته شده توسط شما';
    // footer.appendChild(meta);

    // const editBtn = document.createElement('button');
    // editBtn.type = 'button';
    // editBtn.className = 'profile-card-edit';
    // editBtn.textContent = 'ویرایش';
    // editBtn.addEventListener('click', (e) => {
    //   e.stopPropagation();
    //   selectProfile(p.id);
    // });
    // footer.appendChild(editBtn);

    // card.appendChild(footer);

    // Whole card is clickable
    card.addEventListener('click', () => selectProfile(p.id));

    return card;
  }

  function makeFeatureRow(icon, text, isDisabled) {
    const row = document.createElement('div');
    row.className = 'profile-feature' + (isDisabled ? ' disabled' : '');

    const ic = document.createElement('span');
    ic.className = 'profile-feature-icon';
    ic.textContent = icon;

    const val = document.createElement('span');
    val.className = 'profile-feature-value';
    val.textContent = text;

    row.appendChild(ic);
    row.appendChild(val);
    return row;
  }

  function buildNewProfileCard() {
    const card = document.createElement('div');
    card.className = 'profile-card new-card';
    card.id = 'new-profile-card';
    card.title = 'ساخت پروفایل جدید';

    const icon = document.createElement('div');
    icon.className = 'new-icon';
    icon.textContent = '+';
    card.appendChild(icon);

    const label = document.createElement('div');
    label.className = 'new-label';
    label.textContent = 'پروفایل جدید';
    card.appendChild(label);

    const sub = document.createElement('div');
    sub.className = 'profile-card-meta';
    sub.style.textAlign = 'center';
    sub.textContent = 'با تنظیمات دلخواه شما';
    card.appendChild(sub);

    card.addEventListener('click', () => handleNewProfile());
    return card;
  }

  function fillForm(p) {
    suppressDirty = true;
    el.formEmpty.classList.add('hidden');
    el.profileForm.classList.remove('hidden');

    el.formTitle.textContent = p.name || p.id;
    el.fieldId.value = p.id;
    el.fieldName.value = p.name || '';
    el.fieldColor.value = p.color || '#48bb78';
    el.colorHex.textContent = p.color || '#48bb78';

    const s = p.settings || PersianerProfiles.defaultSettings();
    el.fieldDateConv.checked = !!s.dateConversion;
    el.fieldPersianRtl.checked = !!s.persianRtl;
    el.fieldMinchars.value = s.minPersianChars || PersianerProfiles.DEFAULT_MIN_CHARS;
    el.fieldFullrtl.checked = !!s.fullPageRtl;
    el.fieldFont.value = s.font || '';
    el.fieldForcefont.checked = !!s.forceFont;
    el.fieldWhitelist.value = (s.whitelist || []).join('\n');
    el.fieldBlacklist.value = (s.blacklist || []).join('\n');

    updateMincharsEnabled();
    updateBadges(p);
    updateLockState(p);
    updateForcefontEnabled();
    closeFontCombobox();
    el.validationErrors.classList.add('hidden');
    el.validationErrors.innerHTML = '';
    suppressDirty = false;
    snapshotForm();
  }

  function updateBadges(p) {
    el.formBadge.classList.remove('hidden', 'builtin', 'locked');
    el.formBadge.textContent = '';
    if (p.builtin) {
      el.formBadge.textContent = 'پیش‌فرض افزونه';
      el.formBadge.classList.add('builtin');
    } else if (p.editable === false) {
      el.formBadge.textContent = 'غیرقابل ویرایش';
      el.formBadge.classList.add('locked');
    } else {
      // User profile, editable — no badge.
      el.formBadge.classList.add('hidden');
    }
  }

  function updateLockState(p) {
    const locked = p.editable === false;
    // "off" profile: everything disabled, name disabled
    el.fieldName.disabled = locked;
    el.fieldColor.disabled = locked;
    el.fieldDateConv.disabled = locked;
    el.fieldPersianRtl.disabled = locked;
    el.fieldMinchars.disabled = locked;
    el.fieldFullrtl.disabled = locked;
    el.fieldFont.disabled = locked;
    el.fieldForcefont.disabled = locked;
    el.fieldWhitelist.disabled = locked;
    el.fieldBlacklist.disabled = locked;
    el.saveBtn.disabled = locked;
    el.saveBtn.style.opacity = locked ? '0.5' : '1';

    // Delete button: only for deletable profiles.
    // Source of truth is PersianerProfiles.canDeleteProfile(), which hard-locks
    // the built-in "off" and "default" profiles regardless of their flags.
    if (PersianerProfiles.canDeleteProfile(p)) {
      el.deleteBtn.classList.remove('hidden');
    } else {
      el.deleteBtn.classList.add('hidden');
    }
  }

  function updateMincharsEnabled() {
    el.fieldMinchars.disabled = !el.fieldPersianRtl.checked;
    el.mincharsRow.style.opacity = el.fieldPersianRtl.checked ? '1' : '0.5';
  }

  /**
   * "اعمال اجباری فونت" (forceFont) only makes sense when a font is set.
   * If the font field is empty, disable the forceFont checkbox.
   * اعمال اجباری فونت فقط وقتی معنی دارد که فونتی تنظیم شده باشد.
   */
  function updateForcefontEnabled() {
    const hasFont = !!(el.fieldFont.value && el.fieldFont.value.trim());
    const isLocked = el.fieldFont.disabled && el.fieldName.disabled;
    if (!hasFont) {
      el.fieldForcefont.checked = false;
    }
    el.fieldForcefont.disabled = isLocked || !hasFont;
    el.fieldForcefont.closest('.toggle-row').style.opacity = (hasFont && !isLocked) ? '1' : '0.5';
  }

  /**
   * "راست‌چین جملات فارسی" (persianRtl) and "راست‌چین کل صفحه" (fullPageRtl)
   * are mutually exclusive — enabling one disables the other.
   * راست‌چین جملات و راست‌چین کل صفحه متضاد هستند.
   */
  function enforceRtlExclusion(changedField) {
    if (changedField === 'persianRtl' && el.fieldPersianRtl.checked) {
      el.fieldFullrtl.checked = false;
    } else if (changedField === 'fullrtl' && el.fieldFullrtl.checked) {
      el.fieldPersianRtl.checked = false;
      updateMincharsEnabled();
    }
  }

  // ---- Collect form -> profile object ----
  function collectForm() {
    const id = el.fieldId.value;
    const existing = state.profiles[id] || {};
    const lines = (txt) =>
      txt
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const profile = {
      id: id,
      name: el.fieldName.value.trim() || 'پروفایل',
      builtin: !!existing.builtin,
      deletable: existing.deletable !== false,
      editable: existing.editable !== false,
      color: el.fieldColor.value,
      settings: {
        dateConversion: el.fieldDateConv.checked,
        persianRtl: el.fieldPersianRtl.checked,
        minPersianChars: parseInt(el.fieldMinchars.value, 10) || PersianerProfiles.DEFAULT_MIN_CHARS,
        fullPageRtl: el.fieldFullrtl.checked,
        font: el.fieldFont.value.trim() || '',
        forceFont: el.fieldForcefont.checked,
        whitelist: lines(el.fieldWhitelist.value),
        blacklist: lines(el.fieldBlacklist.value)
      }
    };
    return profile;
  }

  // ---- Save ----
  async function handleSave(e) {
    e.preventDefault();
    if (!state) return;
    const id = el.fieldId.value;
    if (!id || !state.profiles[id]) {
      showToast('پروفایل نامعتبر است.', 'error');
      return;
    }
    if (state.profiles[id].editable === false) {
      showToast('این پروفایل غیرقابل ویرایش است.', 'error');
      return;
    }

    const profile = collectForm();

    // Validate
    const errors = PersianerProfiles.validateProfile(profile);
    if (errors.length > 0) {
      el.validationErrors.classList.remove('hidden');
      el.validationErrors.innerHTML =
        '<ul><li>' + errors.map(escapeHtml).join('</li><li>') + '</li></ul>';
      showToast('خطا در اعتبارسنجی.', 'error');
      return;
    }
    el.validationErrors.classList.add('hidden');

    // Merge into state
    state.profiles[id] = profile;
    const saved = await saveState(state);
    if (saved) {
      state = saved;
      renderSidebar();
      renderProfileCards();
      fillForm(state.profiles[id]);
      showToast('ذخیره شد', 'success');
    } else {
      showToast('خطا در ذخیره‌سازی.', 'error');
    }
  }

  // ---- Delete ----
  async function handleDelete() {
    if (!state) return;
    const id = el.fieldId.value;
    const p = state.profiles[id];
    // Defense in depth: even if the UI somehow surfaced the button,
    // refuse to delete a protected built-in.
    if (!PersianerProfiles.canDeleteProfile(p)) {
      showToast('این پروفایل قابل حذف نیست.', 'error');
      return;
    }
    if (!confirm('پروفایل «' + (p.name || id) + '» حذف شود؟')) return;

    delete state.profiles[id];
    state.profileOrder = (state.profileOrder || []).filter((x) => x !== id);
    // Remove from active if present
    state.activeProfileIds = (state.activeProfileIds || []).filter((x) => x !== id);
    if (state.activeProfileIds.length === 0) {
      state.activeProfileIds = [PersianerProfiles.DEFAULT_ID];
    }

    const saved = await saveState(state);
    if (saved) {
      state = saved;
      showCardsView();
      showToast('پروفایل حذف شد', 'success');
    } else {
      showToast('خطا در حذف.', 'error');
    }
  }

  // ---- Reset to factory defaults ----
  function handleReset() {
    if (!state) return;
    if (!confirm('⚠️ همه پروفایل‌های ساخته‌شده توسط شما حذف می‌شوند و پروفایل‌های پیش‌فرض به حالت اولیه برمی‌گردند.\n\nآیا ادامه می‌دهید؟')) {
      return;
    }
    if (!confirm('این عملیات قابل بازگشت نیست. تمام تنظیمات شخصی شما از بین خواهد رفت.\n\nمطمئن هستید؟')) {
      return;
    }
    // Send reset request to background
    chrome.runtime.sendMessage({ action: 'resetProfiles' }, (resp) => {
      if (chrome.runtime.lastError) {
        log.error('Options: resetProfiles error:', chrome.runtime.lastError);
        showToast('خطا در بازنشانی.', 'error');
        return;
      }
      if (resp && resp.success && resp.state) {
        state = resp.state;
        showCardsView();
        showToast('همه تنظیمات به حالت پیش‌فرض بازنشانی شد.', 'success');
      } else {
        showToast('خطا در بازنشانی.', 'error');
      }
    });
  }

  // ---- New profile ----
  function handleNewProfile() {
    if (!state) return;
    const profile = PersianerProfiles.createUserProfile('پروفایل جدید', state.profiles);
    state.profiles[profile.id] = profile;
    state.profileOrder.push(profile.id);
    // Select it in the form (not yet saved to storage until user clicks Save)
    selectedId = profile.id;
    renderSidebar();
    showFormView();
    fillForm(profile);
    el.fieldName.focus();
    el.fieldName.select();
  }

  // ---- Toast ----
  let toastTimer = null;
  function showToast(msg, type) {
    el.toast.textContent = msg;
    el.toast.className = 'toast show ' + (type || '');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.className = 'toast hidden';
    }, 2200);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---- Init ----
  async function initialize() {
    populateFontList();
    state = await loadState();
    if (!state) {
      showToast('بارگذاری وضعیت ناموفق بود.', 'error');
      return;
    }

    // Pre-select from ?profile=<id> query param (used by popup edit gear)
    const params = new URLSearchParams(location.search);
    const preselect = params.get('profile');
    if (preselect && state.profiles[preselect]) {
      selectProfile(preselect);
    } else {
      showCardsView();
    }

    // Events
    el.profileForm.addEventListener('submit', handleSave);
    el.profileForm.addEventListener('input', checkDirty);
    el.profileForm.addEventListener('change', checkDirty);
    el.deleteBtn.addEventListener('click', handleDelete);
    el.newProfileBtn.addEventListener('click', handleNewProfile);
    el.backBtn.addEventListener('click', showCardsView);
    document.getElementById('reset-btn').addEventListener('click', handleReset);
    el.sidebarHome.addEventListener('click', showCardsView);
    el.fieldColor.addEventListener('input', () => {
      el.colorHex.textContent = el.fieldColor.value;
    });
    // RTL mutual exclusion: persianRtl <-> fullPageRtl
    el.fieldPersianRtl.addEventListener('change', () => {
      enforceRtlExclusion('persianRtl');
      updateMincharsEnabled();
    });
    el.fieldFullrtl.addEventListener('change', () => {
      enforceRtlExclusion('fullrtl');
    });
    el.fieldName.addEventListener('input', () => {
      el.formTitle.textContent = el.fieldName.value || el.fieldId.value || 'پروفایل';
    });

    // Font combobox events
    el.fontComboboxBtn.addEventListener('click', toggleFontCombobox);
    el.fieldFont.addEventListener('focus', openFontCombobox);
    el.fieldFont.addEventListener('input', () => {
      if (!el.fontComboboxList.classList.contains('hidden')) {
        renderFontCombobox(el.fieldFont.value);
      }
      updateForcefontEnabled();
      checkDirty();
    });
    el.fieldFont.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFontCombobox();
    });
    // Close combobox when clicking outside it
    document.addEventListener('mousedown', (e) => {
      if (!el.fontCombobox.contains(e.target)) closeFontCombobox();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  window.addEventListener('error', (e) => {
    log.error('Options: error:', e.error);
  });
})();
