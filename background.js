/**
 * Background Script for ERP CV Deadline Highlighter
 * Author: Sumit Kumar
 * GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter
 */

// Extension installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🚀 ERP CV Deadline Highlighter installed/updated');
  console.log('👨‍💻 Developed by: Sumit Kumar');
  console.log('🔗 GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter');
  
  if (details.reason === 'install') {
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'ERP CV Deadline Highlighter',
      message: 'Extension installed successfully! Navigate to ERP system to start highlighting deadlines.'
    });
    
    // Open GitHub repository on first install
    chrome.tabs.create({
      url: 'https://github.com/SumitKumar-17/erp-cv-deadline-highlighter'
    });
  } else if (details.reason === 'update') {
    // Show update notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'ERP CV Deadline Highlighter Updated',
      message: `Updated to version ${chrome.runtime.getManifest().version}`
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if we're on the correct page
    if (!tab.url.includes('erp.iitkgp.ac.in')) {
      // Show notification to navigate to ERP system
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Navigate to ERP System',
        message: 'Please navigate to the ERP placement page to use this extension.'
      });
      return;
    }
    
    // Try to inject content script if not already present
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
  } catch (error) {
    console.error('Error handling icon click:', error);
  }
});

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'start-highlighting',
    title: 'Start Deadline Highlighting',
    contexts: ['page'],
    documentUrlPatterns: ['*://erp.iitkgp.ac.in/*']
  });
  
  chrome.contextMenus.create({
    id: 'stop-highlighting',
    title: 'Stop Deadline Highlighting',
    contexts: ['page'],
    documentUrlPatterns: ['*://erp.iitkgp.ac.in/*']
  });
  
  chrome.contextMenus.create({
    id: 'separator',
    type: 'separator',
    contexts: ['page'],
    documentUrlPatterns: ['*://erp.iitkgp.ac.in/*']
  });
  
  chrome.contextMenus.create({
    id: 'open-github',
    title: 'View on GitHub',
    contexts: ['page'],
    documentUrlPatterns: ['*://erp.iitkgp.ac.in/*']
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    switch (info.menuItemId) {
      case 'start-highlighting':
        await chrome.tabs.sendMessage(tab.id, { action: 'start' });
        break;
        
      case 'stop-highlighting':
        await chrome.tabs.sendMessage(tab.id, { action: 'stop' });
        break;
        
      case 'open-github':
        chrome.tabs.create({
          url: 'https://github.com/SumitKumar-17/erp-cv-deadline-highlighter'
        });
        break;
    }
  } catch (error) {
    console.error('Context menu error:', error);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case 'notification':
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: request.title || 'ERP CV Deadline Highlighter',
          message: request.message
        });
        sendResponse({ success: true });
        break;
        
      case 'get-version':
        sendResponse({ version: chrome.runtime.getManifest().version });
        break;
        
      case 'open-options':
        chrome.runtime.openOptionsPage();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, message: 'Unknown action' });
    }
  } catch (error) {
    console.error('Background message handler error:', error);
    sendResponse({ success: false, message: error.message });
  }
  
  return true; // Keep message channel open
});

// Tab update listener to inject content script
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only inject when page is completely loaded and URL matches
  if (changeInfo.status === 'complete' && 
      tab.url && 
      tab.url.includes('erp.iitkgp.ac.in') &&
      tab.url.includes('showmenu.htm')) {
    
    try {
      // Check if content script is already injected
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => typeof window.isExtensionActive !== 'undefined'
      });
      
      // If content script is not present, inject it
      if (!results[0]?.result) {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });
        
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ['styles.css']
        });
        
        console.log('Content script injected into ERP page');
      }
    } catch (error) {
      console.error('Error injecting content script:', error);
    }
  }
});

// Handle extension suspension/wake
chrome.runtime.onSuspend.addListener(() => {
  console.log('Extension suspending...');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension starting up...');
});

// Storage management
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes, namespace);
});

// Performance monitoring
let performanceMetrics = {
  startTime: Date.now(),
  messagesHandled: 0,
  errorsOccurred: 0
};

// Log performance metrics periodically
setInterval(() => {
  const uptime = Date.now() - performanceMetrics.startTime;
  console.log('📊 Extension Metrics:', {
    uptime: `${Math.floor(uptime / 1000)}s`,
    messagesHandled: performanceMetrics.messagesHandled,
    errorsOccurred: performanceMetrics.errorsOccurred
  });
}, 300000); // Every 5 minutes
