/**
 * Background Script for ERP CV Deadline Highlighter
 * Author: Sumit Kumar
 * GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter
 */

console.log('🚀 ERP CV Deadline Highlighter - Service Worker Started');
console.log('👨‍💻 Developed by: Sumit Kumar');
console.log('🔗 GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter');

// Extension installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    console.log('✅ First time installation - Welcome!');
    
    // Try to open GitHub (optional - will fail silently if not allowed)
    chrome.tabs.create({
      url: 'https://github.com/SumitKumar-17/erp-cv-deadline-highlighter'
    }).catch(error => {
      console.log('GitHub tab not opened:', error.message);
    });
  } else if (details.reason === 'update') {
    console.log('✅ Extension updated successfully');
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.action);
  
  try {
    switch (request.action) {
      case 'get-version':
        sendResponse({ 
          version: chrome.runtime.getManifest().version,
          success: true 
        });
        break;
        
      default:
        sendResponse({ 
          success: false, 
          message: `Unknown action: ${request.action}` 
        });
    }
  } catch (error) {
    console.error('❌ Background message handler error:', error);
    sendResponse({ 
      success: false, 
      message: error.message 
    });
  }
  
  return true; // Keep message channel open for async responses
});

// Clean startup
chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 Extension startup - Ready to highlight deadlines!');
});

/**
 * IMPORTANT NOTES:
 *
 * 1. NO chrome.action.onClicked - We use default_popup in manifest
 * 2. NO context menus - Simplified to avoid conflicts  
 * 3. All user interaction through popup interface
 * 4. Minimal background script to avoid service worker issues
 * 5. Error handling for all async operations
 */

console.log('✅ Background script initialization complete');

