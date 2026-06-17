# Icon State Feature - تغییر آیکون بر اساس وضعیت

## Overview | خلاصه

The extension icon now reflects the active/inactive state of the extension, allowing users to see at a glance whether the date conversion is enabled or disabled without opening the popup.

آیکون افزونه اکنون وضعیت فعال/غیرفعال افزونه را نمایش می‌دهد، به طوری که کاربران می‌توانند بدون باز کردن popup ببینند که تبدیل تاریخ فعال است یا خیر.

## Implementation Details | جزئیات پیاده‌سازی

### 1. Disabled Icons | آیکون‌های غیرفعال

Created grayscale versions of all icons:
- `icons/icon16-disabled.png` (16x16)
- `icons/icon48-disabled.png` (48x48)
- `icons/icon128-disabled.png` (128x128)

These icons are grayscale versions with reduced opacity and contrast to clearly indicate the "disabled" state.

### 2. Background Script Updates | به‌روزرسانی اسکریپت پس‌زمینه

Added `updateIcon(enabled)` function in `background.js`:
- Dynamically switches between normal and disabled icons
- Called when extension is toggled on/off
- Initialized on extension startup based on stored state

### 3. Key Features | ویژگی‌های کلیدی

1. **Visual Feedback**: Icon changes instantly when user toggles the extension
2. **Persistent State**: Icon reflects the correct state even after browser restart
3. **No User Interaction Required**: Users can see the status without opening the popup
4. **Smooth Integration**: Works seamlessly with existing toggle functionality

## User Experience | تجربه کاربری

### When Extension is Enabled | زمانی که افزونه فعال است
- **Icon**: Full color (purple/gradient)
- **Popup Status**: "وضعیت: فعال"
- **Behavior**: Dates are automatically converted on web pages

### When Extension is Disabled | زمانی که افزونه غیرفعال است
- **Icon**: Grayscale (faded)
- **Popup Status**: "وضعیت: غیرفعال"
- **Behavior**: No date conversion occurs

## Testing | تست

To test this feature:

1. Load the extension in Chrome
2. Open the popup and toggle the switch to OFF
3. Observe the icon turning grayscale
4. Toggle the switch back to ON
5. Observe the icon returning to full color
6. Close and reopen the browser - icon should maintain the correct state

برای تست این ویژگی:

1. افزونه را در کروم بارگذاری کنید
2. popup را باز کنید و سوئیچ را خاموش کنید
3. مشاهده کنید که آیکون خاکستری می‌شود
4. سوئیچ را دوباره روشن کنید
5. مشاهده کنید که آیکون به رنگ کامل برمی‌گردد
6. مرورگر را ببندید و دوباره باز کنید - آیکون باید وضعیت صحیح را حفظ کند

## Technical Notes | نکات فنی

- Uses `chrome.action.setIcon()` API to dynamically change the icon
- Icon state is synchronized with `chrome.storage.sync`
- Compatible with Manifest V3
- No additional permissions required

## Files Modified | فایل‌های تغییر یافته

1. `background.js` - Added `updateIcon()` function and icon initialization
2. `generate_disabled_icons.ps1` - New script to generate disabled icon versions
3. `generate_disabled_icons.py` - Alternative Python script (requires Pillow)

## Files Added | فایل‌های جدید

- `icons/icon16-disabled.png`
- `icons/icon48-disabled.png`
- `icons/icon128-disabled.png`
- `generate_disabled_icons.ps1`
- `generate_disabled_icons.py`
- `ICON_STATE_FEATURE.md` (this file)

## Future Enhancements | پیشرفت‌های آینده

- Badge text showing conversion count
- Different icon styles for different states
- Animation during state transition
- Custom icon themes

---

**Version**: 04.08.25  
**Date**: November 16, 2025  
**Status**: ✅ Implemented and Ready for Testing
