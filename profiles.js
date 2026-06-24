/**
 * PersianerProfiles - Shared profile/match/merge/storage core
 * هسته مشترک پروفایل‌ها، تطبیق، ادغام و ذخیره‌سازی
 *
 * Loaded into: background (importScripts), content (content_scripts),
 * popup, and options pages. Exposes global `PersianerProfiles`.
 *
 * Storage schema (chrome.storage.sync, schemaVersion 2):
 *   {
 *     schemaVersion: 2,
 *     profiles: { "<id>": { id, name, builtin, deletable, editable, color, settings: {...} } },
 *     profileOrder: [id, ...],
 *     activeProfileIds: [id, ...],
 *     installDate: "ISO"
 *   }
 *
 * Profile.settings:
 *   dateConversion: bool, persianRtl: bool, minPersianChars: int,
 *   fullPageRtl: bool, font: string, blacklist: [regex-string], whitelist: [regex-string]
 */

(function (root) {
  'use strict';

  var SCHEMA_VERSION = 2;

  // Curated list of common Persian/web fonts offered in the dropdown.
  // Web pages cannot enumerate OS-installed fonts, so this is a fixed list
  // plus a free-text custom font field in the UI.
  var CURATED_FONTS = [
    'Sahel',
    'Vazir',
    'Vazirmatn',
    'Shabnam',
    'IRANSans',
    'IRANSansX',
    'Estedad',
    'Tahoma',
    'Segoe UI',
    'Arial'
  ];

  // Default font is empty — system continues without a custom font unless a
  // profile explicitly sets one. Built-in profiles set their own font values.
  var DEFAULT_FONT = '';
  var DEFAULT_MIN_CHARS = 10;

  // Built-in profile ids (reserved; user profiles use generated ids).
  var OFF_ID = 'off';
  var DEFAULT_ID = 'default';
  var IGNORE_LIST = ['*.github.com', '*.yadak.com', '*.claude.ai', '*.chatgpt.com', '*.openai.com', 'www.google.com']; 

  /**
   * Default settings object factory (fresh copy each call).
   */
  function defaultSettings() {
    return {
      dateConversion: false,
      persianRtl: false,
      minPersianChars: DEFAULT_MIN_CHARS,
      fullPageRtl: false,
      font: '',
      forceFont: false,
      blacklist: [],
      whitelist: []
    };
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Built-in profiles. `builtin:true` means shipped by the extension.
   * `deletable:false` / `editable:false` lock down special profiles.
   */
  function buildBuiltinProfiles() {
    return {
      off: {
        id: OFF_ID,
        name: 'خاموش',
        builtin: true,
        deletable: false,
        editable: false,
        color: '#9e9e9e',
        settings: {
          dateConversion: false,
          persianRtl: false,
          minPersianChars: DEFAULT_MIN_CHARS,
          fullPageRtl: false,
          font: '',
          forceFont: false,
          blacklist: [],
          whitelist: []
        }
      },
      default: {
        id: DEFAULT_ID,
        name: 'تبدیل تاریخ میلادی به شمسی',
        builtin: true,
        deletable: false,
        editable: true,
        color: '#48bb78',
        settings: {
          dateConversion: true,
          persianRtl: false,
          minPersianChars: DEFAULT_MIN_CHARS,
          fullPageRtl: false,
          font: '',
          forceFont: false,
          blacklist: IGNORE_LIST,
          whitelist: []
        }
      },
      smartRtl: {
        id: 'smartRtl',
        name: 'راست چین سازی هوشمند',
        builtin: true,
        deletable: true,
        editable: true,
        color: '#48bb78',
        settings: {
          dateConversion: false,
          persianRtl: true,
          minPersianChars: 2,
          fullPageRtl: false,
          font: 'Sahel',
          forceFont: true,
          blacklist: IGNORE_LIST,
          whitelist: []
        }
      },
      fullRtl: {
        id: 'fullRtl',
        name: 'راست چین سازی کل صفحه',
        builtin: true,
        deletable: true,
        editable: true,
        color: '#48bb78',
        settings: {
          dateConversion: false,
          persianRtl: false,
          minPersianChars: DEFAULT_MIN_CHARS,
          fullPageRtl: true,
          font: '',
          forceFont: false,
          blacklist: IGNORE_LIST,
          whitelist: ['openrouter.ai']
        }
      },
      forceFont: {
        id: 'forceFont',
        name: 'اعمال اجباری فونت فارسی',
        builtin: true,
        deletable: true,
        editable: true,
        color: '#48bb78',
        settings: {
          dateConversion: false,
          persianRtl: false,
          minPersianChars: DEFAULT_MIN_CHARS,
          fullPageRtl: false,
          font: 'Sahel',
          forceFont: true,
          blacklist: IGNORE_LIST,
          whitelist: []
        }
      },
      google: {
        id: 'google',
        name: 'بهبود جستجوی Google',
        builtin: true,
        deletable: true,
        editable: true,
        color: '#ea4335',
        settings: {
          dateConversion: true,
          persianRtl: true,
          minPersianChars: DEFAULT_MIN_CHARS,
          fullPageRtl: false,
          font: 'Sahel',
          forceFont: true,
          blacklist: [],
          whitelist: ['www.google.com']
        }
      },
      chatgpt: {
        id: 'chatgpt',
        name: 'بهبود ChatGPT',
        builtin: true,
        deletable: true,
        editable: true,
        color: '#10a37f',
        settings: {
          dateConversion: false,
          persianRtl: false,
          minPersianChars: DEFAULT_MIN_CHARS,
          fullPageRtl: false,
          font: 'Sahel',
          forceFont: true,
          blacklist: [],
          whitelist: ['^chatgpt\\.com$', '^chat\\.openai\\.com$', '^.*\\.openai\\.com$']
        }
      },
      claude: {
        id: 'claude',
        name: 'بهبود Claud',
        builtin: true,
        deletable: true,
        editable: true,
        color: '#d97757',
        settings: {
          dateConversion: true,
          persianRtl: true,
          minPersianChars: 2,
          fullPageRtl: false,
          font: 'Sahel',
          forceFont: false,
          blacklist: [],
          whitelist: ['^claude\\.ai$', '^.*\\.claude\\.ai$']
        }
      },
      github: {
        id: 'github',
        name: 'بهبود github.com',
        builtin: true,
        deletable: true,
        editable: true,
        color: '#48bb78',
        settings: {
          dateConversion: false,
          persianRtl: false,
          minPersianChars: DEFAULT_MIN_CHARS,
          fullPageRtl: false,
          font: 'Sahel',
          forceFont: true,
          blacklist: [],
          whitelist: ['*.github.com']
        }
      },
      // copilot: {
      //   id: 'copilot',
      //   name: 'هوش مصنوعی Copilot',
      //   builtin: true,
      //   deletable: true,
      //   editable: true,
      //   color: '#a371f0',
      //   settings: {
      //     dateConversion: true,
      //     persianRtl: true,
      //     minPersianChars: DEFAULT_MIN_CHARS,
      //     fullPageRtl: false,
      //     font: 'Sahel',
      //     forceFont: false,
      //     blacklist: [],
      //     whitelist: ['^github\\.com$', '^.*\\.github\\.com$', '^copilot\\.github\\.com$']
      //   }
      // }
    };
  }

  var DEFAULT_PROFILE_ORDER = [OFF_ID, DEFAULT_ID, 'smartRtl', 'fullRtl', 'forceFont', 'google', 'chatgpt', 'claude', 'copilot', 'github'];
  var DEFAULT_ACTIVE = [DEFAULT_ID, 'smartRtl', 'forceFont', 'google', 'chatgpt', 'claude', 'copilot', 'github'];

  /**
   * Build a fresh default state object.
   */
  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      profiles: buildBuiltinProfiles(),
      profileOrder: clone(DEFAULT_PROFILE_ORDER),
      activeProfileIds: clone(DEFAULT_ACTIVE),
      installDate: new Date().toISOString()
    };
  }

  /**
   * Generate a unique id for a new user profile.
   */
  function generateId(existingProfiles) {
    var id;
    do {
      id = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    } while (existingProfiles && existingProfiles[id]);
    return id;
  }

  /**
   * Create a new user profile with default settings.
   */
  function createUserProfile(name, existingProfiles) {
    var id = generateId(existingProfiles);
    return {
      id: id,
      name: name || 'پروفایل جدید',
      builtin: false,
      deletable: true,
      editable: true,
      color: '#48bb78',
      settings: defaultSettings()
    };
  }

  /**
   * Migrate legacy storage (enabled/autoRtlEnabled) to the profile schema.
   * Called on install/update when schemaVersion is missing or < 2.
   * - both true (or undefined) -> activeProfileIds = ["default"]
   * - both false               -> activeProfileIds = ["off"]
   */
  function migrateLegacy(storage) {
    var state = createDefaultState();
    if (storage && storage.installDate) {
      state.installDate = storage.installDate;
    }
    var enabled = storage ? storage.enabled : undefined;
    var autoRtl = storage ? storage.autoRtlEnabled : undefined;
    var anyOn = (enabled !== false) || (autoRtl !== false);
    state.activeProfileIds = anyOn ? [DEFAULT_ID] : [OFF_ID];
    return state;
  }

  /**
   * Ensure a loaded state is well-formed (fill missing built-ins, ids, order).
   * Defensive: older/corrupt storage should not break the extension.
   */
  function normalizeState(state) {
    if (!state || typeof state !== 'object') {
      return createDefaultState();
    }
    var builtins = buildBuiltinProfiles();
    var profiles = state.profiles && typeof state.profiles === 'object' ? state.profiles : {};
    // Ensure all built-ins exist and keep their locked flags.
    Object.keys(builtins).forEach(function (id) {
      var b = builtins[id];
      if (!profiles[id]) {
        profiles[id] = clone(b);
      } else {
        // Force immutable built-in flags.
        profiles[id].builtin = true;
        profiles[id].deletable = b.deletable;
        profiles[id].editable = b.editable;
        profiles[id].id = id;
      }
    });
    // Ensure every profile has a full settings object.
    Object.keys(profiles).forEach(function (id) {
      var p = profiles[id];
      if (!p.settings || typeof p.settings !== 'object') {
        p.settings = defaultSettings();
      }
      var s = p.settings;
      if (typeof s.dateConversion !== 'boolean') s.dateConversion = false;
      if (typeof s.persianRtl !== 'boolean') s.persianRtl = false;
      if (typeof s.fullPageRtl !== 'boolean') s.fullPageRtl = false;
      if (typeof s.minPersianChars !== 'number' || !isFinite(s.minPersianChars)) {
        s.minPersianChars = DEFAULT_MIN_CHARS;
      }
      if (typeof s.font !== 'string' || !s.font) s.font = DEFAULT_FONT;
      if (typeof s.forceFont !== 'boolean') s.forceFont = false;
      if (!Array.isArray(s.blacklist)) s.blacklist = [];
      if (!Array.isArray(s.whitelist)) s.whitelist = [];
    });
    // Ensure profileOrder contains all profile ids, built-ins first in canonical order.
    var order = Array.isArray(state.profileOrder) ? state.profileOrder.slice() : [];
    var seen = {};
    var merged = [];
    DEFAULT_PROFILE_ORDER.forEach(function (id) {
      if (profiles[id]) {
        merged.push(id);
        seen[id] = true;
      }
    });
    order.forEach(function (id) {
      if (!seen[id] && profiles[id]) {
        merged.push(id);
        seen[id] = true;
      }
    });
    Object.keys(profiles).forEach(function (id) {
      if (!seen[id]) {
        merged.push(id);
        seen[id] = true;
      }
    });
    // activeProfileIds: keep only valid ids; drop unknowns.
    var active = Array.isArray(state.activeProfileIds) ? state.activeProfileIds.slice() : [];
    active = active.filter(function (id) { return !!profiles[id]; });
    if (active.length === 0) {
      active = [DEFAULT_ID];
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      profiles: profiles,
      profileOrder: merged,
      activeProfileIds: active,
      installDate: state.installDate || new Date().toISOString()
    };
  }

  /**
   * Convert a wildcard pattern (containing *) into an anchored regex string.
   *
   * Supported syntax:
   *   *.yadak.com   → ^(.*\.)?yadak\.com$   (matches yadak.com + any subdomain)
   *   yadak.*       → ^yadak\..*$            (matches yadak.com, yadak.org, …)
   *   *             → ^.*$                   (matches everything)
   *
   * Patterns WITHOUT * are treated as raw regex (backward-compatible).
   */
  function wildcardToRegex(pattern) {
    // Escape all regex special characters EXCEPT *
    var escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // *.domain → (.*\.)?domain  — matches the bare domain AND any subdomain
    escaped = escaped.replace(/\*\\\./g, '(.*\\.)?');
    // Remaining * → .*  (any sequence)
    escaped = escaped.replace(/\*/g, '.*');
    return '^' + escaped + '$';
  }

  /**
   * Compile a list of pattern strings into RegExp objects, skipping invalid ones.
   * Patterns containing * are treated as wildcards; others as raw regex.
   * Returns { regexes: RegExp[], errors: [{pattern, message}] }.
   */
  function compileRegexList(patterns) {
    var regexes = [];
    var errors = [];
    if (!Array.isArray(patterns)) return { regexes: regexes, errors: errors };
    patterns.forEach(function (p) {
      if (typeof p !== 'string' || !p.trim()) return;
      try {
        var regexStr = p.indexOf('*') !== -1 ? wildcardToRegex(p) : p;
        regexes.push(new RegExp(regexStr));
      } catch (e) {
        errors.push({ pattern: p, message: e && e.message ? e.message : String(e) });
      }
    });
    return { regexes: regexes, errors: errors };
  }

  /**
   * Does a profile match a hostname?
   * - whitelist empty -> matches any host
   * - else at least one whitelist regex must match
   * - AND no blacklist regex may match
   * Invalid regexes are skipped (never block matching).
   */
  function matchProfile(profile, hostname) {
    if (!profile || !profile.settings) return false;
    var s = profile.settings;
    var wl = compileRegexList(s.whitelist).regexes;
    var bl = compileRegexList(s.blacklist).regexes;
    var i;
    for (i = 0; i < bl.length; i++) {
      if (bl[i].test(hostname)) return false;
    }
    if (wl.length === 0) return true;
    for (i = 0; i < wl.length; i++) {
      if (wl[i].test(hostname)) return true;
    }
    return false;
  }

  /**
   * Specificity score for a profile against a hostname:
   * higher = more specific. Non-empty whitelist that matches > empty whitelist.
   */
  function specificity(profile, hostname) {
    if (!profile || !profile.settings) return 0;
    var s = profile.settings;
    if (!Array.isArray(s.whitelist) || s.whitelist.length === 0) return 0;
    var wl = compileRegexList(s.whitelist).regexes;
    var matched = 0;
    for (var i = 0; i < wl.length; i++) {
      if (wl[i].test(hostname)) matched++;
    }
    return matched > 0 ? 10 + matched : 0;
  }

  /**
   * Among matched profiles, pick the most-specific one for scalar settings
   * (font, minPersianChars). Ties broken by profileOrder (earlier wins).
   */
  function mostSpecific(matchedProfiles, state) {
    if (!matchedProfiles || matchedProfiles.length === 0) return null;
    var order = state.profileOrder || [];
    var orderIndex = {};
    order.forEach(function (id, idx) { orderIndex[id] = idx; });
    var best = null;
    var bestScore = -1;
    var bestOrder = Infinity;
    matchedProfiles.forEach(function (p) {
      var score = specificity(p, '__host__'); // generic; real host handled by caller
      // Use whitelist non-empty as the specificity signal (host-independent here).
      var hasWl = p.settings.whitelist && p.settings.whitelist.length > 0;
      var score2 = hasWl ? 1 : 0;
      var ord = orderIndex[p.id] === undefined ? Infinity : orderIndex[p.id];
      if (score2 > bestScore || (score2 === bestScore && ord < bestOrder)) {
        best = p;
        bestScore = score2;
        bestOrder = ord;
      }
    });
    return best;
  }

  /**
   * Compute the effective merged settings for a hostname.
   * OR-merge over all ACTIVE profiles that match the hostname:
   *   - dateConversion / persianRtl / fullPageRtl -> OR
   *   - font / minPersianChars -> from most-specific matched profile
   * Returns { settings, matchedProfileIds }.
   * If no active profile matches, returns all-off settings.
   */
  function computeEffective(state, hostname) {
    var empty = defaultSettings();
    empty.dateConversion = false;
    empty.persianRtl = false;
    empty.fullPageRtl = false;
    var active = state.activeProfileIds || [];
    var matched = [];
    active.forEach(function (id) {
      var p = state.profiles[id];
      if (p && matchProfile(p, hostname)) {
        matched.push(p);
      }
    });
    if (matched.length === 0) {
      return { settings: empty, matchedProfileIds: [] };
    }
    var merged = defaultSettings();
    merged.dateConversion = false;
    merged.persianRtl = false;
    merged.fullPageRtl = false;
    matched.forEach(function (p) {
      var s = p.settings;
      if (s.dateConversion) merged.dateConversion = true;
      if (s.persianRtl) merged.persianRtl = true;
      if (s.fullPageRtl) merged.fullPageRtl = true;
      if (s.forceFont) merged.forceFont = true;
    });
    var scalarProfile = mostSpecific(matched, state);
    if (scalarProfile) {
      // Font may be empty string — that means "no custom font, use site default".
      merged.font = scalarProfile.settings.font || '';
      merged.minPersianChars = scalarProfile.settings.minPersianChars || DEFAULT_MIN_CHARS;
      merged.forceFont = !!scalarProfile.settings.forceFont;
    } else {
      merged.font = '';
      merged.minPersianChars = DEFAULT_MIN_CHARS;
      merged.forceFont = false;
    }
    return { settings: merged, matchedProfileIds: matched.map(function (p) { return p.id; }) };
  }

  /**
   * Is the "off" profile the only active one? (master-off state)
   */
  /**
   * Return a fresh default state (factory reset).
   * Replaces all profiles, order, and active list with built-in defaults.
   * Preserves the original installDate if present.
   * بازگشت به حالت پیش‌فرض کارخانه (بازنشانی همه پروفایل‌ها).
   */
  function resetToDefaults(existingState) {
    var fresh = createDefaultState();
    if (existingState && existingState.installDate) {
      fresh.installDate = existingState.installDate;
    }
    return fresh;
  }

  function isOffActive(state) {
    var active = state.activeProfileIds || [];
    return active.length === 1 && active[0] === OFF_ID;
  }

  /**
   * Apply the "off" mutual-exclusion rule to an activeProfileIds array.
   * - activating off clears everything else
   * - activating anything else clears off
   */
  function applyOffRule(activeIds, toggledId) {
    if (toggledId === OFF_ID) {
      return [OFF_ID];
    }
    return activeIds.filter(function (id) { return id !== OFF_ID; });
  }

  // ---- Storage I/O wrappers (chrome.storage.sync) ----

  function loadState(cb) {
    if (!chrome || !chrome.storage || !chrome.storage.sync) {
      var def = createDefaultState();
      if (cb) cb(def);
      return;
    }
    chrome.storage.sync.get(
      ['schemaVersion', 'profiles', 'profileOrder', 'activeProfileIds', 'installDate'],
      function (result) {
        var state;
        if (!result || result.schemaVersion === undefined || !result.profiles) {
          // First run or legacy: migrate from enabled/autoRtlEnabled if present.
          chrome.storage.sync.get(['enabled', 'autoRtlEnabled', 'installDate'], function (legacy) {
            state = migrateLegacy(legacy);
            // Persist the migrated state.
            chrome.storage.sync.set(state, function () {
              if (cb) cb(normalizeState(state));
            });
          });
        } else {
          state = normalizeState(result);
          if (cb) cb(state);
        }
      }
    );
  }

  function saveState(state, cb) {
    var normalized = normalizeState(state);
    if (!chrome || !chrome.storage || !chrome.storage.sync) {
      if (cb) cb(normalized);
      return;
    }
    chrome.storage.sync.set(normalized, function () {
      if (cb) cb(normalized);
    });
  }

  /**
   * Can the user delete this profile?
   * - Returns false for the protected built-ins ("off", "default") and any
   *   profile whose `deletable` flag is explicitly `false`.
   * - Returns true for all user-created profiles and built-ins that are
   *   marked `deletable: true` (e.g. google, claude, chatgpt, copilot).
   * این پروفایل قابل حذف توسط کاربر هست؟
   */
  function canDeleteProfile(profile) {
    if (!profile) return false;
    // Hard lock on the two special built-ins, even if `deletable` got tampered with.
    if (profile.id === OFF_ID || profile.id === DEFAULT_ID) return false;
    // Respect the explicit flag for every other profile.
    return profile.deletable !== false;
  }

  /**
   * Validate a profile's settings (regex lists). Returns array of error strings.
   */
  function validateProfile(profile) {
    var errors = [];
    if (!profile || !profile.name || !String(profile.name).trim()) {
      errors.push('نام پروفایل نمی‌تواند خالی باشد.');
    }
    if (profile && profile.settings) {
      var s = profile.settings;
      var wl = compileRegexList(s.whitelist);
      var bl = compileRegexList(s.blacklist);
      wl.errors.forEach(function (e) {
        errors.push('وایت‌لیست - الگوی نامعتبر: ' + e.pattern + ' (' + e.message + ')');
      });
      bl.errors.forEach(function (e) {
        errors.push('بلک‌لیست - الگوی نامعتبر: ' + e.pattern + ' (' + e.message + ')');
      });
      if (typeof s.minPersianChars !== 'number' ||
        s.minPersianChars < 0 || !isFinite(s.minPersianChars)) {
        errors.push('حداقل تعداد کاراکتر باید عددی نامنفی باشد.');
      }
    }
    return errors;
  }

  root.PersianerProfiles = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    OFF_ID: OFF_ID,
    DEFAULT_ID: DEFAULT_ID,
    CURATED_FONTS: CURATED_FONTS,
    DEFAULT_FONT: DEFAULT_FONT,
    DEFAULT_MIN_CHARS: DEFAULT_MIN_CHARS,
    DEFAULT_PROFILE_ORDER: DEFAULT_PROFILE_ORDER,
    defaultSettings: defaultSettings,
    buildBuiltinProfiles: buildBuiltinProfiles,
    createDefaultState: createDefaultState,
    createUserProfile: createUserProfile,
    generateId: generateId,
    migrateLegacy: migrateLegacy,
    normalizeState: normalizeState,
    compileRegexList: compileRegexList,
    matchProfile: matchProfile,
    specificity: specificity,
    mostSpecific: mostSpecific,
    computeEffective: computeEffective,
    isOffActive: isOffActive,
    applyOffRule: applyOffRule,
    resetToDefaults: resetToDefaults,
    loadState: loadState,
    saveState: saveState,
    validateProfile: validateProfile,
    canDeleteProfile: canDeleteProfile
  };

})(typeof self !== 'undefined' ? self : this);
