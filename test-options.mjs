// Comprehensive options page test via CDP
import WebSocket from 'ws';

const tabId = process.argv[2] || '1DFEDFE2C8E9B208789924A8C764B8B5';
const wsUrl = `ws://127.0.0.1:9222/devtools/page/${tabId}`;
const ws = new WebSocket(wsUrl);
let msgId = 0;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) {
        ws.removeListener('message', handler);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalJS(expression, awaitPromise = false) {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function getConsoleErrors() {
  // Enable console API
  await send('Runtime.enable');
  // We can't easily get past console messages, so we'll just check for errors going forward
  return 'Console monitoring enabled (check for errors during tests)';
}

async function runTests() {
  const results = {};

  // Test 1: Verify RTL layout
  results.rtlLayout = await evalJS(`({
    dir: document.documentElement.dir,
    lang: document.documentElement.lang,
    title: document.title
  })`);

  // Test 2: Verify sidebar profiles
  results.sidebarProfiles = await evalJS(`Array.from(document.querySelectorAll('.profile-item')).map(e => ({
    id: e.dataset.id,
    name: e.querySelector('.name')?.textContent?.trim()
  }))`);

  // Test 3: Click on Claude profile and check form
  await evalJS(`document.querySelector('.profile-item[data-id="claude"]').click()`);
  await new Promise(r => setTimeout(r, 500));

  results.formAfterClick = await evalJS(`({
    title: document.getElementById('form-title')?.textContent?.trim(),
    nameInput: document.getElementById('field-name')?.value,
    colorInput: document.getElementById('field-color')?.value,
    dateConvCheckbox: document.getElementById('field-dateConv')?.checked,
    autoRtlCheckbox: document.getElementById('field-persianRtl')?.checked,
    fullRtlCheckbox: document.getElementById('field-fullrtl')?.checked,
    fontInput: document.getElementById('field-font')?.value,
    forceFontCheckbox: document.getElementById('field-forcefont')?.checked,
    minCharsInput: document.getElementById('field-minchars')?.value,
    whitelistValue: document.getElementById('field-whitelist')?.value,
    blacklistValue: document.getElementById('field-blacklist')?.value,
    profileId: document.getElementById('field-id')?.value
  })`);

  // Test 4: Test mutual RTL exclusion - check fullRtl checkbox
  const fullRtlBefore = await evalJS(`document.getElementById('field-fullrtl')?.checked`);
  const autoRtlBefore = await evalJS(`document.getElementById('field-persianRtl')?.checked`);

  // Click autoRtl to enable it (should already be enabled for Claude)
  await evalJS(`
    const cb = document.getElementById('field-persianRtl');
    if (!cb.checked) cb.click();
  `);
  await new Promise(r => setTimeout(r, 300));

  const autoRtlAfter = await evalJS(`document.getElementById('field-persianRtl')?.checked`);

  // Now click fullRtl - should disable autoRtl (mutual exclusion)
  await evalJS(`
    const cb2 = document.getElementById('field-fullrtl');
    if (!cb2.checked) cb2.click();
  `);
  await new Promise(r => setTimeout(r, 300));

  const autoRtlAfterFullRtl = await evalJS(`document.getElementById('field-persianRtl')?.checked`);
  const fullRtlAfterClick = await evalJS(`document.getElementById('field-fullrtl')?.checked`);
  const minCharsDisabled = await evalJS(`document.getElementById('field-minchars')?.disabled`);

  results.mutualExclusion = {
    autoRtlBefore,
    fullRtlBefore,
    autoRtlAfterEnabling: autoRtlAfter,
    autoRtlAfterFullRtlOn: autoRtlAfterFullRtl,
    fullRtlAfterClick,
    minCharsDisabledWhenFullRtl: minCharsDisabled,
    mutualExclusionWorks: autoRtlAfterFullRtl === false && fullRtlAfterClick === true
  };

  // Test 5: Test regex validation - enter an invalid regex
  await evalJS(`document.getElementById('field-whitelist').value = '[invalid'`);
  await evalJS(`document.getElementById('field-whitelist').dispatchEvent(new Event('input', {bubbles: true}))`);
  await new Promise(r => setTimeout(r, 500));

  results.regexValidation = await evalJS(`({
    validationErrors: document.getElementById('validation-errors')?.textContent?.trim()?.substring(0, 500),
    validationVisible: !document.getElementById('validation-errors')?.classList.contains('hidden'),
    saveButtonDisabled: document.getElementById('save-btn')?.disabled
  })`);

  // Test 6: Enter a valid regex
  await evalJS(`document.getElementById('field-whitelist').value = 'claude\\\\.ai'`);
  await evalJS(`document.getElementById('field-whitelist').dispatchEvent(new Event('input', {bubbles: true}))`);
  await new Promise(r => setTimeout(r, 500));

  results.validRegex = await evalJS(`({
    validationErrors: document.getElementById('validation-errors')?.textContent?.trim()?.substring(0, 500),
    validationVisible: !document.getElementById('validation-errors')?.classList.contains('hidden'),
    saveButtonDisabled: document.getElementById('save-btn')?.disabled
  })`);

  // Test 7: Check for unsaved indicator
  results.unsavedIndicator = await evalJS(`({
    visible: !document.getElementById('form-badge')?.classList.contains('hidden'),
    text: document.getElementById('form-badge')?.textContent?.trim()
  })`);

  // Test 8: Get full page structure summary
  results.pageStructure = await evalJS(`({
    sidebarItems: document.querySelectorAll('.profile-item').length,
    hasNewProfileBtn: !!document.getElementById('new-profile-btn'),
    hasBackBtn: !!document.getElementById('back-btn'),
    hasSaveBtn: !!document.getElementById('save-btn'),
    hasDeleteBtn: !!document.getElementById('delete-btn'),
    hasValidationErrors: !!document.getElementById('validation-errors'),
    formFields: Array.from(document.querySelectorAll('input, textarea, select')).map(e => ({
      id: e.id,
      type: e.type || e.tagName.toLowerCase(),
      value: e.value?.substring(0, 50)
    }))
  })`);

  return results;
}

ws.on('open', async () => {
  try {
    const results = await runTests();
    console.log(JSON.stringify(results, null, 2));
  } catch (e) {
    console.error('Test error:', e.message);
  }
  ws.close();
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err.message);
  process.exit(1);
});

ws.on('close', () => process.exit(0));

setTimeout(() => {
  console.error('Timeout');
  process.exit(1);
}, 30000);