# 🔧 Installation & Troubleshooting Guide

## Quick Installation

### Step 1: Enable Developer Mode
1. Open Chrome and navigate to: `chrome://extensions/`
2. Toggle "Developer mode" ON (top right corner)

### Step 2: Load Extension
1. Click "Load unpacked"
2. Select the `extension` folder
3. The extension should appear in your toolbar

## 🛠️ Troubleshooting Service Worker Issues

### Issue: "Service worker registration failed. Status code: 15"

This error typically occurs when:
1. **Files are missing** - Ensure all files are present
2. **Permissions issue** - Check file permissions
3. **Chrome version** - Ensure Chrome version 88+ 

### Solutions:

#### Solution 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "ERP CV Deadline Highlighter"
3. Click the refresh/reload icon 🔄
4. Check for errors in the extension details

#### Solution 2: Check Service Worker
1. Go to `chrome://extensions/`
2. Click "Details" on the extension
3. Click "Inspect views: service worker"
4. Check console for errors

#### Solution 3: Verify File Structure
Ensure your extension folder contains:
```
extension/
├── manifest.json ✓
├── background.js ✓
├── content.js ✓
├── popup.html ✓
├── popup.js ✓
├── popup.css ✓
├── styles.css ✓
└── icons/
    ├── icon16.png ✓
    ├── icon32.png ✓
    ├── icon48.png ✓
    └── icon128.png ✓
```

#### Solution 4: Chrome Flags (if needed)
If issues persist, try enabling:
1. Go to `chrome://flags/`
2. Search for "extension-service-worker"
3. Enable relevant flags
4. Restart Chrome

## 🧪 Testing the Extension

### Step 1: Load Extension Successfully
- No errors in chrome://extensions/
- Extension icon appears in toolbar
- Service worker shows as "active"

### Step 2: Navigate to ERP System
```
https://erp.iitkgp.ac.in/IIT_ERP3/showmenu.htm
```

### Step 3: Test Functionality
1. Click extension icon → popup should open
2. Click "Start Highlighting" → should work without errors
3. Check browser console (F12) for any errors
4. Verify table rows get colored highlighting

## 📊 Debugging Console Commands

### Check Extension Status
```javascript
// In browser console on ERP page
console.log('Extension active:', window.isExtensionActive);
```

### Manual Trigger
```javascript
// Force start highlighting
if (typeof highlightDeadlines === 'function') {
  highlightDeadlines();
}
```

### Service Worker Debug
```javascript
// In service worker console
console.log('Service worker running');
chrome.runtime.getManifest();
```

## 🔍 Common Error Messages & Fixes

### "Cannot read properties of undefined (reading 'onClicked')"
**Fixed in current version** - Removed conflicting onClicked listener

### "Uncaught TypeError: Cannot read properties of undefined (reading 'onMessage')"
**Fixed in current version** - Added proper chrome.runtime availability check

### "Frame access denied"
**Handled gracefully** - Extension falls back to main document if frame access fails

## 🚨 If Problems Persist

### Method 1: Clean Reinstall
1. Remove extension from Chrome
2. Restart Chrome browser
3. Reinstall extension following steps above

### Method 2: Check Chrome Version
```bash
# Check Chrome version
google-chrome --version
# Should be 88 or higher
```

### Method 3: Try Incognito Mode
1. Enable extension in incognito mode
2. Test functionality there
3. This helps isolate extension conflicts

### Method 4: Check Permissions
Ensure Chrome has permission to:
- Access the ERP site
- Create notifications
- Execute scripts

## 📞 Getting Help

If issues continue:

1. **Check Console Errors**
   - Open DevTools (F12)
   - Look for red error messages
   - Note the exact error text

2. **Extension Details**
   - Go to chrome://extensions/
   - Click "Details" on the extension
   - Check for any error messages

3. **Report Issues**
   - Include Chrome version
   - Include exact error messages
   - Include steps to reproduce

## 🎯 Success Indicators

Extension is working correctly when:
- ✅ No errors in chrome://extensions/
- ✅ Service worker shows "active" status
- ✅ Popup opens when icon is clicked
- ✅ "Start Highlighting" button works
- ✅ Table rows get colored on ERP page
- ✅ No console errors on ERP page

---

**Extension should now work perfectly! 🎉**

*If you continue having issues, the extension code itself is solid - it's likely a Chrome setup or permissions issue.*
