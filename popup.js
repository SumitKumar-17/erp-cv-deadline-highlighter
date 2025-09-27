/**
 * Popup script for ERP CV Deadline Highlighter
 * Author: Sumit Kumar
 * GitHub: https://github.com/SumitKumar-17/erp-cv-deadline-highlighter
 */

class PopupController {
  constructor() {
    this.elements = {
      startBtn: document.getElementById('startBtn'),
      stopBtn: document.getElementById('stopBtn'),
      clearBtn: document.getElementById('clearBtn'),
      statusIndicator: document.getElementById('statusIndicator'),
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      stats: document.getElementById('stats'),
      processedCount: document.getElementById('processedCount')
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.checkStatus();
    
    // Check status periodically
    setInterval(() => this.checkStatus(), 2000);
  }
  
  bindEvents() {
    this.elements.startBtn.addEventListener('click', () => this.startHighlighting());
    this.elements.stopBtn.addEventListener('click', () => this.stopHighlighting());
    this.elements.clearBtn.addEventListener('click', () => this.clearHighlights());
  }
  
  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
  
  async sendMessageToActiveTab(message) {
    try {
      const tab = await this.getCurrentTab();
      
      if (!tab.url.includes('erp.iitkgp.ac.in')) {
        throw new Error('Please navigate to the ERP system first');
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, message);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  async startHighlighting() {
    try {
      this.setLoading(true);
      const response = await this.sendMessageToActiveTab({ action: 'start' });
      
      if (response.success) {
        this.showSuccess('✅ Extension started successfully');
        this.updateStatus(true);
      } else {
        this.showError(`${response.message}`);
      }
    } catch (error) {
      this.showError(`Error: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }
  
  async stopHighlighting() {
    try {
      this.setLoading(true);
      const response = await this.sendMessageToActiveTab({ action: 'stop' });
      
      if (response.success) {
        this.showSuccess('⏹️ Extension stopped');
        this.updateStatus(false);
      } else {
        this.showError(`${response.message}`);
      }
    } catch (error) {
      this.showError(`Error: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }
  
  async clearHighlights() {
    try {
      this.setLoading(true);
      const response = await this.sendMessageToActiveTab({ action: 'clear' });
      
      if (response.success) {
        this.showSuccess('Highlights cleared');
        this.elements.processedCount.textContent = '0';
      } else {
        this.showError(`${response.message}`);
      }
    } catch (error) {
      this.showError(`Error: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }
  
  async checkStatus() {
    try {
      const response = await this.sendMessageToActiveTab({ action: 'status' });
      this.updateStatus(response.isActive, response.processedRows || 0);
    } catch (error) {
      this.updateStatus(false, 0, 'Not connected to ERP page');
    }
  }
  
  updateStatus(isActive, processedRows = 0, customMessage = null) {
    const { statusDot, statusText, processedCount, startBtn, stopBtn } = this.elements;
    
    if (customMessage) {
      statusText.textContent = customMessage;
      statusDot.className = 'status-dot inactive';
      startBtn.disabled = true;
      stopBtn.disabled = true;
      return;
    }
    
    if (isActive) {
      statusText.textContent = 'Active - Monitoring deadlines';
      statusDot.className = 'status-dot active';
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusText.textContent = 'Inactive';
      statusDot.className = 'status-dot inactive';
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
    
    processedCount.textContent = processedRows.toString();
  }
  
  setLoading(isLoading) {
    const buttons = [this.elements.startBtn, this.elements.stopBtn, this.elements.clearBtn];
    buttons.forEach(btn => {
      btn.disabled = isLoading;
      if (isLoading) {
        btn.classList.add('loading');
      } else {
        btn.classList.remove('loading');
      }
    });
  }
  
  showSuccess(message) {
    this.showNotification(message, 'success');
  }
  
  showError(message) {
    this.showNotification(message, 'error');
  }
  
  showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(notification, container.firstChild);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 's':
        event.preventDefault();
        document.getElementById('startBtn').click();
        break;
      case 'q':
        event.preventDefault();
        document.getElementById('stopBtn').click();
        break;
      case 'c':
        event.preventDefault();
        document.getElementById('clearBtn').click();
        break;
    }
  }
});
