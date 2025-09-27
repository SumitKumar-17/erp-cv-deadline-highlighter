/**
 * ERP CV Deadline Highlighter
 * Author: Sumit Kumar
 * GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter
 * 
 * A Chrome extension to highlight CV deadlines in ERP systems with color-coded
 * visual indicators for better deadline management.
 */

// Configuration constants
const CONFIG = {
  frameName: "myframe",
  templateXPath: "/html/body/table/tbody/tr[3]/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/div[3]/div[3]/div/table/tbody/tr[{number}]/td[12]",
  startNumber: 2,
  endNumber: 600,
  colors: {
   upcoming: '#00FF00',   // Green for upcoming deadlines
overdue:  '#E53935',   // Strong Red for overdue deadlines
warning:  '#FB8C00',   // Amber/Orange for soon-to-expire
border:   '#BDBDBD'    // Neutral Grey for borders

  },
  refreshInterval: 1000,    // 1 second refresh rate
  autoStopTime: 300000     // Auto-stop after 5 minutes
};

// Global variables
let intervalID = null;
let targetFrame = null;
let isExtensionActive = false;
let processedRows = new Set();

// Initialize extension
function initializeExtension() {
  console.log('🚀 ERP CV Deadline Highlighter - Starting...');
  console.log('👨‍💻 Developed by: Sumit Kumar');
  console.log('🔗 GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter');
  
  // Try to find the target frame
  targetFrame = window.frames[CONFIG.frameName];
  
  // Alternative: try to find frame by accessing frames collection
  if (!targetFrame && window.frames.length > 0) {
    for (let i = 0; i < window.frames.length; i++) {
      try {
        if (window.frames[i].name === CONFIG.frameName) {
          targetFrame = window.frames[i];
          break;
        }
      } catch (e) {
        // Cross-origin frame access error, skip
        continue;
      }
    }
  }
  
  // If still no frame, try to work with the main document
  if (!targetFrame) {
    console.warn('⚠️ Target frame not found. Trying to work with main document...');
    targetFrame = window;
  }
  
  isExtensionActive = true;
  startHighlighting();
  return true;
}

// Start the highlighting process
function startHighlighting() {
  if (intervalID) {
    clearInterval(intervalID);
  }
  
  intervalID = setInterval(highlightDeadlines, CONFIG.refreshInterval);
  
  // Auto-stop after configured time
  setTimeout(() => {
    stopHighlighting();
    console.log('⏰ Extension auto-stopped after 5 minutes');
  }, CONFIG.autoStopTime);
}

/**
 * Generates XPath expressions from template
 * @param {string} templateXPath - Template XPath with {number} placeholder
 * @param {number} startNumber - Starting row number
 * @param {number} endNumber - Ending row number
 * @returns {Array<string>} Array of XPath expressions
 */
function generateXPathExpressions(templateXPath, startNumber, endNumber) {
  const xpaths = [];

  for (let i = startNumber; i <= endNumber; i++) {
    const xpath = templateXPath.replace('{number}', i);
    xpaths.push(xpath.trim());
  }

  return xpaths;
}

/**
 * Parses date and time from text content
 * @param {string} timeTextContent - Date time string in DD-MM-YYYY HH:MM format
 * @returns {Date|null} Parsed Date object or null if invalid
 */
function getElementDateTimeFromText(timeTextContent) {
  try {
    if (!timeTextContent || timeTextContent.trim() === '') {
      return null;
    }

    // Parse the time text and create a Date object
    const parts = timeTextContent.trim().split(/[- :]/);
    
    if (parts.length < 5) {
      console.warn('⚠️ Invalid date format:', timeTextContent);
      return null;
    }

    const year = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
    const day = parseInt(parts[0], 10);
    const hour = parseInt(parts[3], 10);
    const minute = parseInt(parts[4], 10);

    // Validate parsed values
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      console.warn('⚠️ Invalid date components:', { year, month, day, hour, minute });
      return null;
    }

    const elementDateTime = new Date(year, month, day, hour, minute);
    
    // Check if date is valid
    if (isNaN(elementDateTime.getTime())) {
      console.warn('⚠️ Invalid date created:', timeTextContent);
      return null;
    }

    return elementDateTime;
  } catch (error) {
    console.error('❌ Error parsing date:', error, timeTextContent);
    return null;
  }
}

/**
 * Selects all related elements in a table row for styling
 * @param {HTMLElement} element - The deadline element (resume upload end)
 * @returns {Array<HTMLElement>} Array of elements to be styled
 */
function getRowElements(element) {
  const elements = [];
  
  if (!element) {
    return elements;
  }

  try {
    let currentElement = element;
    
    // Add current element (resume upload end)
    elements.push(currentElement);
    
    // Traverse backwards through siblings to get all row elements
    const siblingLabels = [
      'Resume Upload Start',
      'Application Status', 
      'Additional Details',
      'Additional Details',  
      'Additional Details',
      'Apply/Acceptance',
      'Apply/Acceptance', 
      'PPT',
      'Additional Details',
      'Company'
    ];
    
    for (let i = 0; i < siblingLabels.length; i++) {
      currentElement = currentElement?.previousElementSibling;
      if (currentElement) {
        elements.push(currentElement);
      }
    }
    
    return elements.filter(el => el !== null);
  } catch (error) {
    console.error('❌ Error selecting row elements:', error);
    return [element]; // Return at least the original element
  }
}

/**
 * Determines deadline status and returns appropriate color
 * @param {Date} deadlineDate - The deadline date
 * @param {Date} currentDate - Current date
 * @returns {Object} Color information and status
 */
function getDeadlineStatus(deadlineDate, currentDate) {
  const timeDiff = deadlineDate.getTime() - currentDate.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  if (timeDiff < 0) {
    return {
      color: CONFIG.colors.overdue,
      status: 'overdue',
      message: 'Overdue'
    };
  } else if (hoursDiff <= 24) {
    return {
      color: CONFIG.colors.warning,
      status: 'warning',
      message: 'Due within 24 hours'
    };
  } else {
    return {
      color: CONFIG.colors.upcoming,
      status: 'upcoming',
      message: 'Upcoming'
    };
  }
}

/**
 * Applies styling to deadline elements with smooth animations
 * @param {HTMLElement} element - The deadline element
 * @param {Date} elementDateTime - Deadline date/time
 * @param {Date} currentDateTime - Current date/time
 */
function applyDeadlineHighlight(element, elementDateTime, currentDateTime) {
  const rowElements = getRowElements(element);
  const deadlineStatus = getDeadlineStatus(elementDateTime, currentDateTime);
  
  rowElements.forEach((el) => {
    if (el && el.style) {
      // Apply smooth transition
      el.style.transition = 'all 0.3s ease-in-out';
      el.style.backgroundColor = deadlineStatus.color;
      el.style.borderColor = CONFIG.colors.border;
      el.style.borderWidth = '1px';
      el.style.borderStyle = 'solid';
      
      // Add subtle shadow for better visibility
      el.style.boxShadow = `0 2px 4px rgba(0,0,0,0.1)`;
      
      // Add tooltip with deadline information
      const timeRemaining = getTimeRemaining(elementDateTime, currentDateTime);
      el.title = `Deadline: ${elementDateTime.toLocaleString()}\nStatus: ${deadlineStatus.message}\n${timeRemaining}`;
      
      // Add custom class for identification
      el.classList.add('erp-deadline-highlighted');
      el.classList.add(`erp-status-${deadlineStatus.status}`);
    }
  });
}

/**
 * Calculates and formats time remaining until deadline
 * @param {Date} deadlineDate - The deadline date
 * @param {Date} currentDate - Current date
 * @returns {string} Formatted time remaining string
 */
function getTimeRemaining(deadlineDate, currentDate) {
  const timeDiff = deadlineDate.getTime() - currentDate.getTime();
  
  if (timeDiff < 0) {
    const overdue = Math.abs(timeDiff);
    const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
    const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `Overdue by: ${days}d ${hours}h`;
  } else {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `Time remaining: ${days}d ${hours}h ${minutes}m`;
  }
}


/**
 * Main function to highlight deadlines in the ERP table
 */
function highlightDeadlines() {
  if (!isExtensionActive || !targetFrame) {
    return;
  }

  try {
    const generatedXPaths = generateXPathExpressions(
      CONFIG.templateXPath, 
      CONFIG.startNumber, 
      CONFIG.endNumber
    );
    
    let processedCount = 0;
    let highlightedCount = 0;
    
    for (let i = 0; i < generatedXPaths.length; i++) {
      const xpath = generatedXPaths[i];
      
      try {
        const element = targetFrame.document.evaluate(
          xpath, 
          targetFrame.document, 
          null, 
          XPathResult.FIRST_ORDERED_NODE_TYPE, 
          null
        ).singleNodeValue;
        
        if (!element) {
          continue;
        }
        
        const timeText = element.textContent?.trim();
        
        if (!timeText) {
          continue;
        }
        
        processedCount++;
        
        // Skip if already processed (optimization)
        const rowId = `row-${i}-${timeText}`;
        if (processedRows.has(rowId)) {
          continue;
        }
        
        // Get deadline date and time
        const elementDateTime = getElementDateTimeFromText(timeText);
        
        if (!elementDateTime) {
          console.debug(`⚠️ Could not parse date from: "${timeText}"`);
          continue;
        }
        
        // Get the current date and time
        const currentDate = new Date();
        
        console.debug(`📅 Processing deadline: ${timeText} -> ${elementDateTime.toLocaleString()}, Current: ${currentDate.toLocaleString()}`);
        
        // Apply highlighting
        applyDeadlineHighlight(element, elementDateTime, currentDate);
        
        processedRows.add(rowId);
        highlightedCount++;
        
      } catch (elementError) {
        // Silently continue for individual element errors
        console.debug('Element processing error:', elementError);
      }
    }
    
    // Log statistics periodically
    if (processedCount > 0) {
      console.log(`📊 Processed: ${processedCount} rows, Highlighted: ${highlightedCount} deadlines`);
    }
    
  } catch (error) {
    console.error('❌ Error in highlightDeadlines:', error);
  }
}

/**
 * Stops the highlighting process
 */
function stopHighlighting() {
  if (intervalID) {
    clearInterval(intervalID);
    intervalID = null;
  }
  isExtensionActive = false;
  console.log('⏹️ Extension stopped');
}

/**
 * Clears all highlights from the page
 */
function clearHighlights() {
  try {
    if (targetFrame && targetFrame.document) {
      const highlightedElements = targetFrame.document.querySelectorAll('.erp-deadline-highlighted');
      highlightedElements.forEach(el => {
        el.style.backgroundColor = '';
        el.style.borderColor = '';
        el.style.borderWidth = '';
        el.style.borderStyle = '';
        el.style.boxShadow = '';
        el.title = '';
        el.classList.remove('erp-deadline-highlighted', 'erp-status-overdue', 'erp-status-warning', 'erp-status-upcoming');
      });
      processedRows.clear();
      console.log('🧹 Highlights cleared');
    }
  } catch (error) {
    console.error('❌ Error clearing highlights:', error);
  }
}

// Message listener for popup communication
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      switch (request.action) {
        case 'start':
          if (!isExtensionActive) {
            const success = initializeExtension();
            sendResponse({ 
              success: success, 
              message: success ? 'Extension started' : 'Failed to start extension' 
            });
          } else {
            sendResponse({ success: false, message: 'Extension already running' });
          }
          break;
          
        case 'stop':
          stopHighlighting();
          sendResponse({ success: true, message: 'Extension stopped' });
          break;
          
        case 'clear':
          clearHighlights();
          sendResponse({ success: true, message: 'Highlights cleared' });
          break;
          
        case 'status':
          sendResponse({ 
            isActive: isExtensionActive,
            processedRows: processedRows.size
          });
          break;
        
      case 'ping':
        sendResponse({ 
          success: true, 
          message: 'Content script is active',
          isActive: isExtensionActive
        });
        break;
        
      default:
        sendResponse({ success: false, message: 'Unknown action' });
      }
    } catch (error) {
      console.error('❌ Message handler error:', error);
      sendResponse({ success: false, message: error.message });
    }
    
    return true; // Keep message channel open
  });
} else {
  console.warn('⚠️ Chrome runtime not available, message listener not set up');
}

// Safe initialization function
function safeInitialize() {
  try {
    if (window.location.href.includes('showmenu.htm') || 
        window.location.href.includes('erp.iitkgp.ac.in')) {
      console.log('📍 On ERP page, attempting to initialize...');
      initializeExtension();
    } else {
      console.log('📍 Not on target ERP page, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Error during safe initialization:', error);
  }
}

// Multiple initialization strategies for better compatibility
const initStrategies = [
  // Strategy 1: Wait for DOM content loaded
  () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(safeInitialize, 2000);
      });
    } else {
      setTimeout(safeInitialize, 2000);
    }
  },
  
  // Strategy 2: Wait for window load (everything including frames)
  () => {
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        setTimeout(safeInitialize, 3000);
      });
    } else {
      setTimeout(safeInitialize, 1000);
    }
  }
];

// Execute initialization strategies
initStrategies.forEach((strategy, index) => {
  try {
    strategy();
  } catch (error) {
    console.error(`❌ Initialization strategy ${index + 1} failed:`, error);
  }
});

// Expose global flag to prevent duplicate initialization
window.isExtensionActive = isExtensionActive;

