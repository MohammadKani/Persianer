# Quick Test Guide - راهنمای تست سریع

## Testing the Icon State Feature

### Step 1: Load Extension | مرحله ۱: بارگذاری افزونه
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `Persianer` folder
4. The extension icon should appear in the toolbar with **full color** (enabled state)

### Step 2: Test Toggle OFF | مرحله ۲: تست خاموش کردن
1. Click the extension icon to open the popup
2. Click the toggle switch to turn it OFF
3. **Expected Result**: 
   - Icon should turn **grayscale/faded** immediately
   - Status should show "وضعیت: غیرفعال"
   - Current tab will reload

### Step 3: Test Toggle ON | مرحله ۳: تست روشن کردن
1. Click the extension icon again
2. Click the toggle switch to turn it ON
3. **Expected Result**:
   - Icon should return to **full color** immediately
   - Status should show "وضعیت: فعال"
   - Current tab will reload

### Step 4: Test Persistence | مرحله ۴: تست ماندگاری
1. Set the extension to OFF (grayscale icon)
2. Close Chrome completely
3. Reopen Chrome
4. **Expected Result**: Icon should still be **grayscale** (disabled state persisted)

### Step 5: Visual Verification | مرحله ۵: بررسی بصری

#### Enabled State (فعال):
- ✅ Icon: Full color (purple/gradient)
- ✅ Popup: Green dot, "وضعیت: فعال"
- ✅ Functionality: Dates converted on pages

#### Disabled State (غیرفعال):
- ✅ Icon: Grayscale/faded
- ✅ Popup: Gray dot, "وضعیت: غیرفعال"
- ✅ Functionality: No date conversion

## Troubleshooting | عیب‌یابی

### Icon Not Changing?
1. Check browser console for errors (F12 → Console)
2. Reload the extension (`chrome://extensions/` → Reload button)
3. Verify disabled icons exist in `icons/` folder

### State Not Persisting?
1. Check if storage permissions are granted
2. Clear extension storage: Right-click icon → "Manage extension" → "Clear data"
3. Toggle the extension again

### Console Logs to Check | لاگ‌های کنسول برای بررسی
```
Persianer: Icon updated to enabled state
تبدیل تاریخ: آیکون به حالت فعال تغییر کرد

Persianer: Icon updated to disabled state
تبدیل تاریخ: آیکون به حالت غیرفعال تغییر کرد
```

## Success Criteria | معیارهای موفقیت

- [ ] Icon changes immediately when toggled
- [ ] Icon state persists after browser restart
- [ ] Enabled icon is full color
- [ ] Disabled icon is grayscale
- [ ] No console errors
- [ ] Popup status matches icon state

---

**Ready to Test!** | **آماده برای تست!**
