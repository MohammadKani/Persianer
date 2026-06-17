/**
 * Configuration file for Persianer Extension
 * فایل پیکربندی برای افزونه تبدیل تاریخ
 * 
 * This file controls environment-specific settings
 * این فایل تنظیمات مخصوص محیط را کنترل می‌کند
 */

const CONFIG = {
  // Environment mode: 'development' or 'production'
  // حالت محیط: 'development' یا 'production'
  mode: 'development',
  
  // Enable/disable console logging (only logs in development mode)
  // فعال/غیرفعال کردن لاگ کنسول (فقط در حالت development)
  enableLogging: true,
  
  // Log levels: 'debug', 'info', 'warn', 'error'
  // سطوح لاگ: 'debug', 'info', 'warn', 'error'
  logLevel: 'debug',
  
  // Feature flags
  // پرچم‌های ویژگی
  features: {
    // Show detailed conversion logs
    // نمایش لاگ‌های تفصیلی تبدیل
    detailedConversionLogs: true,
    
    // Show performance tracking
    // نمایش ردیابی عملکرد
    performanceTracking: true,
    
    // Show mutation observer logs
    // نمایش لاگ‌های رصدگر تغییرات
    mutationLogs: true,
    
    // Show format detection logs
    // نمایش لاگ‌های تشخیص فرمت
    formatDetectionLogs: true,
    
    // Auto RTL: force RTL direction on elements containing Persian text (>=20 chars)
    // راست‌چین خودکار: اعمال جهت روی المان‌هایی که حاوی متن فارسی هستند (بیش از ۲۰ کاراکتر)
    autoRtl: true
  },
  
  // Performance settings
  // تنظیمات عملکرد
  performance: {
    // Mutation observer throttle delay (ms)
    // تأخیر محدودساز رصدگر تغییرات (میلی‌ثانیه)
    mutationThrottleDelay: 500,
    
    // Mutation batch size limit
    // حد اندازه دسته تغییرات
    mutationBatchSize: 50,
    
    // Large DOM update threshold
    // آستانه به‌روزرسانی بزرگ DOM
    largeDomUpdateThreshold: 50
  }
};

// Freeze config in production to prevent modifications
// قفل کردن پیکربندی در حالت production برای جلوگیری از تغییرات
if (CONFIG.mode === 'production') {
  Object.freeze(CONFIG);
  Object.freeze(CONFIG.features);
  Object.freeze(CONFIG.performance);
}
