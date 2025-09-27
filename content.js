/**
 * ERP CV Deadline Highlighter
 * Author: Sumit Kumar
 * GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter
 * 
 * A Chrome extension to highlight CV deadlines in ERP systems with color-coded
 * visual indicators for better deadline management.
 */

// Prevent duplicate script loading
if (window.erpDeadlineHighlighterLoaded) {
    console.log('ERP Deadline Highlighter already loaded, skipping...');
} else {
    window.erpDeadlineHighlighterLoaded = true;

    // Configuration constants
    const CONFIG = {
        frameName: "myframe",
        templateXPath: "/html/body/table/tbody/tr[3]/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/div[3]/div[3]/div/table/tbody/tr[{number}]/td[12]",
        startNumber: 2,
        endNumber: 600,
        colors: {
            upcoming: '#00ff08',   // Green for upcoming deadlines
            overdue: '#ff0000',    // Red for overdue deadlines
            warning: '#ddff00',    // Yellow for soon-to-expire
        },
        refreshInterval: 1000,    // 1 second refresh rate
        autoStopTime: 300000     // Auto-stop after 5 minutes
    };

    // Global variables
    let intervalID = null;
    let targetFrame = null;
    let isExtensionActive = false;
    let processedRows = new Set();
    let legendWidget = null;
    let isLegendVisible = false;

    // Initialize extension
    function initializeExtension() {
        if (isExtensionActive) {
            console.log('Extension already active, skipping initialization');
            return true;
        }

        console.log('ERP CV Deadline Highlighter - Starting...');
        console.log('Developed by: Sumit Kumar');
        console.log('GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter');

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
            console.warn('Target frame not found. Trying to work with main document...');
            targetFrame = window;
        }

        isExtensionActive = true;

        // Create floating legend if it doesn't exist
        if (!legendWidget) {
            createFloatingLegend();
            isLegendVisible = true;
        }

        updateLegendStatus();
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
                console.warn('Invalid date format:', timeTextContent);
                return null;
            }

            const year = parseInt(parts[2], 10);
            const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
            const day = parseInt(parts[0], 10);
            const hour = parseInt(parts[3], 10);
            const minute = parseInt(parts[4], 10);

            // Validate parsed values
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
                console.warn('Invalid date components:', { year, month, day, hour, minute });
                return null;
            }

            const elementDateTime = new Date(year, month, day, hour, minute);

            // Check if date is valid
            if (isNaN(elementDateTime.getTime())) {
                console.warn('Invalid date created:', timeTextContent);
                return null;
            }

            return elementDateTime;
        } catch (error) {
            console.error('Error parsing date:', error, timeTextContent);
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
            console.error('Error selecting row elements:', error);
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
     * Creates the floating legend widget
     */
    function createFloatingLegend() {
        if (legendWidget) {
            return legendWidget; // Already exists
        }

        // Create main container
        legendWidget = document.createElement('div');
        legendWidget.id = 'erp-deadline-legend';
        legendWidget.innerHTML = `
    <div class="legend-header">
      <div class="legend-title">
        <span class="legend-icon">🎯</span>
        <span>ERP CV Deadline Highlighter</span>
      </div>
      <button class="legend-toggle" id="legendToggle" title="Toggle Legend">
        <span class="toggle-icon">−</span>
      </button>
    </div>
    
    <div class="legend-content" id="legendContent">
      <!-- Status Section -->
      <div class="legend-status">
        <div class="status-row">
          <span class="status-dot" id="statusDot"></span>
          <span class="status-text" id="statusText">Inactive</span>
        </div>
        <div class="stats-row">
          <span class="stats-text" id="statsText">0 rows processed</span>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="legend-controls">
        <button class="legend-btn legend-btn-start" id="startBtn">
          <span class="btn-icon">▶</span> Start
        </button>
        <button class="legend-btn legend-btn-stop" id="stopBtn">
          <span class="btn-icon">⏸</span> Stop
        </button>
        <button class="legend-btn legend-btn-clear" id="clearBtn">
          <span class="btn-icon">🧹</span> Clear
        </button>
      </div>
      
      <!-- Color Legend -->
      <div class="legend-colors">
        <div class="legend-subtitle">Color Guide:</div>
        <div class="color-items">
          <div class="color-item">
            <span class="color-sample" style="background: ${CONFIG.colors.upcoming}"></span>
            <span class="color-label">Upcoming</span>
          </div>
          <div class="color-item">
            <span class="color-sample" style="background: ${CONFIG.colors.warning}"></span>
            <span class="color-label">Due soon (24h)</span>
          </div>
          <div class="color-item">
            <span class="color-sample" style="background: ${CONFIG.colors.overdue}"></span>
            <span class="color-label">Overdue</span>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="legend-footer">
        <div class="author-info">
          <span>by <strong>Sumit Kumar</strong></span>
          <a href="https://github.com/SumitKumar-17/erp-cv-deadline-highlighter" target="_blank" class="github-link" title="View on GitHub">
            🔗
          </a>
        </div>
      </div>
    </div>
  `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = getLegendStyles();
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(legendWidget);

        // Bind events
        bindLegendEvents();

        console.log('✅ Floating legend created');
        return legendWidget;
    }

    /**
     * Returns CSS styles for the floating legend
     */
    function getLegendStyles() {
        return `
    #erp-deadline-legend {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 280px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      border: 1px solid #e9ecef;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      z-index: 999999;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
    }
    
    #erp-deadline-legend.collapsed .legend-content {
      display: none;
    }
    
    .legend-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border-radius: 12px 12px 0 0;
      cursor: move;
    }
    
    .legend-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
    }
    
    .legend-toggle {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .legend-toggle:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    .legend-content {
      padding: 16px;
    }
    
    .legend-status {
      margin-bottom: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #dee2e6;
    }
    
    .status-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6c757d;
      transition: all 0.3s ease;
    }
    
    .status-dot.active {
      background: #4CAF50;
      box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
      animation: pulse-dot 2s infinite;
    }
    
    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
    }
    
    .status-text {
      font-weight: 500;
      color: #495057;
    }
    
    .stats-text {
      font-size: 12px;
      color: #6c757d;
    }
    
    .legend-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .legend-btn {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.2s ease;
    }
    
    .legend-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .legend-btn:active {
      transform: translateY(0);
    }
    
    .legend-btn-start {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    }
    
    .legend-btn-stop {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
    }
    
    .legend-btn-clear {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
    }
    
    .legend-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .legend-colors {
      margin-bottom: 16px;
    }
    
    .legend-subtitle {
      font-weight: 600;
      margin-bottom: 8px;
      color: #495057;
    }
    
    .color-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .color-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .color-sample {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .color-label {
      font-size: 12px;
      color: #6c757d;
    }
    
    .legend-footer {
      border-top: 1px solid #e9ecef;
      padding-top: 12px;
    }
    
    .author-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #6c757d;
    }
    
    .github-link {
      color: #4CAF50;
      text-decoration: none;
      font-size: 14px;
      transition: all 0.2s ease;
    }
    
    .github-link:hover {
      transform: scale(1.2);
    }
    
    /* Draggable functionality */
    #erp-deadline-legend.dragging {
      transform: rotate(5deg);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
    }
  `;
    }

    /**
     * Binds events to legend elements
     */
    function bindLegendEvents() {
        const toggle = document.getElementById('legendToggle');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const clearBtn = document.getElementById('clearBtn');

        // Toggle legend visibility
        toggle.addEventListener('click', () => {
            toggleLegend();
        });

        // Start highlighting
        startBtn.addEventListener('click', () => {
            if (!isExtensionActive) {
                initializeExtension();
                updateLegendStatus();
            }
        });

        // Stop highlighting
        stopBtn.addEventListener('click', () => {
            stopHighlighting();
            updateLegendStatus();
        });

        // Clear highlights
        clearBtn.addEventListener('click', () => {
            clearHighlights();
            updateLegendStatus();
        });

        // Make legend draggable
        makeLegendDraggable();

        // Update status initially
        updateLegendStatus();
    }

    /**
     * Toggles legend expanded/collapsed state
     */
    function toggleLegend() {
        if (!legendWidget) return;

        const content = document.getElementById('legendContent');
        const toggleIcon = legendWidget.querySelector('.toggle-icon');

        if (isLegendVisible) {
            // Collapse
            content.style.display = 'none';
            toggleIcon.textContent = '+';
            legendWidget.style.width = '200px';
            isLegendVisible = false;
        } else {
            // Expand
            content.style.display = 'block';
            toggleIcon.textContent = '−';
            legendWidget.style.width = '280px';
            isLegendVisible = true;
        }
    }

    /**
     * Updates legend status display
     */
    function updateLegendStatus() {
        if (!legendWidget) return;

        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const statsText = document.getElementById('statsText');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');

        if (isExtensionActive) {
            statusDot.classList.add('active');
            statusText.textContent = 'Active - Monitoring deadlines';
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            statusDot.classList.remove('active');
            statusText.textContent = 'Inactive';
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }

        statsText.textContent = `${processedRows.size} rows processed`;
    }

    /**
     * Makes the legend draggable
     */
    function makeLegendDraggable() {
        const header = legendWidget.querySelector('.legend-header');
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.legend-toggle')) return;

            isDragging = true;
            legendWidget.classList.add('dragging');

            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            legendWidget.style.transform = `translate(${currentX}px, ${currentY}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;

            isDragging = false;
            legendWidget.classList.remove('dragging');
        });
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
                        console.debug(`Could not parse date from: "${timeText}"`);
                        continue;
                    }

                    // Get the current date and time
                    const currentDate = new Date();

                    console.debug(`Processing deadline: ${timeText} -> ${elementDateTime.toLocaleString()}, Current: ${currentDate.toLocaleString()}`);

                    // Apply highlighting
                    applyDeadlineHighlight(element, elementDateTime, currentDate);

                    processedRows.add(rowId);
                    highlightedCount++;

                } catch (elementError) {
                    // Silently continue for individual element errors
                    console.debug('Element processing error:', elementError);
                }
            }

            // Log statistics periodically and update legend
            if (processedCount > 0) {
                console.log(`📊 Processed: ${processedCount} rows, Highlighted: ${highlightedCount} deadlines`);
                updateLegendStatus();
            }

        } catch (error) {
            console.error('Error in highlightDeadlines:', error);
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
        updateLegendStatus();
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
                    el.style.boxShadow = '';
                    el.title = '';
                    el.classList.remove('erp-deadline-highlighted', 'erp-status-overdue', 'erp-status-warning', 'erp-status-upcoming');
                });
                processedRows.clear();
                updateLegendStatus();
                console.log('Highlights cleared');
            }
        } catch (error) {
            console.error('Error clearing highlights:', error);
        }
    }

    // Message listener for popup communication
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('Received message:', request.action);
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
                        break; case 'ping':
                        sendResponse({
                            success: true,
                            message: 'Content script is active',
                            isActive: isExtensionActive
                        });
                        break;

                    case 'toggle-legend':
                        if (!legendWidget) {
                            createFloatingLegend();
                            isLegendVisible = true;
                        } else {
                            toggleLegend();
                        }
                        sendResponse({
                            success: true,
                            message: 'Legend toggled',
                            visible: isLegendVisible
                        });
                        break;

                    default:
                        sendResponse({ success: false, message: 'Unknown action' });
                }
            } catch (error) {
                console.error('Message handler error:', error);
                try {
                    sendResponse({ success: false, message: error.message });
                } catch (responseError) {
                    console.error('Failed to send error response:', responseError);
                }
            }

            return true; // Keep message channel open
        });
    } else {
        console.warn('Chrome runtime not available, message listener not set up');
    }

    // Safe initialization function
    function safeInitialize() {
        try {
            if (window.location.href.includes('showmenu.htm') ||
                window.location.href.includes('erp.iitkgp.ac.in')) {
                console.log('On ERP page, creating floating legend...');

                // Always create the legend when on ERP page
                if (!legendWidget) {
                    createFloatingLegend();
                    isLegendVisible = true;
                }

                // Auto-start highlighting if not already active
                if (!isExtensionActive) {
                    console.log('Auto-starting deadline highlighting...');
                    initializeExtension();
                }
            } else {
                console.log('Not on target ERP page, skipping initialization');
            }
        } catch (error) {
            console.error('Error during safe initialization:', error);
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
            console.error(`Initialization strategy ${index + 1} failed:`, error);
        }
    });

    // Expose global flag to prevent duplicate initialization
    window.isExtensionActive = isExtensionActive;

} 
