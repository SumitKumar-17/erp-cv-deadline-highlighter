/**
 * Background Script for ERP CV Deadline Highlighter
 * Author: Sumit Kumar
 * GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter
 */

console.log('ERP CV Deadline Highlighter - Service Worker Started');
console.log('Developed by: Sumit Kumar');
console.log('GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    console.log('✅ First time installation - Welcome!');
    
    chrome.tabs.create({
      url: 'https://github.com/SumitKumar-17/erp-cv-deadline-highlighter'
    }).catch(error => {
      console.log('GitHub tab not opened:', error.message);
    });
  } else if (details.reason === 'update') {
    console.log('✅ Extension updated successfully');
  }
});

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
    console.error('Background message handler error:', error);
    sendResponse({ 
      success: false, 
      message: error.message 
    });
  }
  
  return true; // Keep message channel open for async responses
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 Extension startup - Ready to highlight deadlines!');
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log('🖱️ Extension icon clicked');
  
  try {
    if (!tab.url || !tab.url.includes('erp.iitkgp.ac.in')) {
      console.log('Not on ERP page, showing guidance');
      return;
    }
    
    await chrome.tabs.sendMessage(tab.id, { action: 'toggle-legend' });
    
  } catch (error) {
    console.error('Error handling icon click:', error);
    
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['styles.css']
      });
      
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'toggle-legend' });
        } catch (retryError) {
          console.error('Retry toggle failed:', retryError);
        }
      }, 1000);
      
    } catch (injectionError) {
      console.error('Script injection failed:', injectionError);
    }
  }
});

console.log('Background script initialization complete');

