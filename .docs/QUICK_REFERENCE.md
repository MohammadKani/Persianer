# Quick Reference - Dev/Prod Modes

## 🚀 Quick Commands

```powershell
# Development Build (full logging)
.\build.ps1 -Mode dev

# Production Build (errors only)
.\build.ps1 -Mode prod
```

## 📝 Logging in Code

```javascript
// Use Logger methods (automatically respects mode)
Logger.debug('Debug message');      // Dev only
Logger.info('Info message');        // Dev only
Logger.warn('Warning message');     // Dev only
Logger.error('Error message');      // Always logged
Logger.conversion('Convert log');   // Dev only
Logger.performance('Perf metric');  // Dev only
```

## 🔍 Mode Detection

```javascript
// In script.js (page context)
const isDev = typeof CONFIG !== 'undefined' && CONFIG.mode === 'development';

// In background.js/popup.js (extension context)
const isDev = IS_DEV; // Set by build script
```

## 📊 Build Comparison

| Feature | Dev Build | Prod Build |
|---------|-----------|------------|
| Folder | `build-dev/` | `build-prod/` |
| Version | `X.X.X-dev` | `X.X.X` |
| Name | `Name [DEV]` | `Name` |
| Logging | Full | Errors only |
| Performance | Normal | Optimized |

## ✅ Workflow

1. Edit source files (root directory)
2. Build for testing: `.\build.ps1 -Mode dev`
3. Load `build-dev/` in Chrome
4. Test and debug
5. Build for release: `.\build.ps1 -Mode prod`
6. Test `build-prod/` build
7. Zip and distribute

## ⚠️ Remember

- **Never** edit files in `build-*` folders
- **Always** rebuild after code changes
- **Test** both modes before release
- **Use** Logger methods, not console.log
