# ERP CV Deadline Highlighter 🎯

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

A professional Chrome extension designed to highlight CV deadlines in ERP systems with color-coded visual indicators for better deadline management. Perfect for students managing placement applications with multiple deadlines.

## 👨‍💻 Developer

**Sumit Kumar**
- GitHub: [@SumitKumar-17](https://github.com/SumitKumar-17)
- Repository: [erp-cv-deadline-highlighter](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter)

## ✨ Features

### 🎨 Smart Color Coding
- **🟢 Green**: Upcoming deadlines (more than 24 hours)
- **🟠 Orange**: Critical deadlines (within 24 hours) with pulsing animation
- **🔴 Red**: Overdue deadlines with urgent pulsing animation

### 🚀 Advanced Functionality
- **Real-time Monitoring**: Continuously scans and updates deadline status
- **Intelligent Tooltips**: Hover over highlighted rows for detailed deadline information
- **Smooth Animations**: Professional CSS transitions and effects
- **Performance Optimized**: Efficient processing with minimal resource usage
- **Auto-start/stop**: Configurable timing with safety mechanisms

### 🎛️ User Controls
- **Start/Stop**: Manual control over the highlighting process
- **Clear Highlights**: Remove all highlights with one click
- **Status Monitoring**: Real-time status indicator and processing statistics
- **Keyboard Shortcuts**: Quick access via keyboard combinations

### 🔧 Technical Features
- **Modular Architecture**: Clean, maintainable code structure
- **Error Handling**: Robust error management and logging
- **Cross-browser Support**: Built for modern Chrome browsers
- **Responsive Design**: Works across different screen sizes
- **Accessibility**: High contrast and reduced motion support

## 🏗️ Architecture

```
extension/
├── manifest.json          # Extension configuration
├── content.js            # Main highlighting logic
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── styles.css            # Content script styles
├── background.js         # Background service worker
├── icons/                # Extension icons
└── README.md             # Documentation
```

## 🛠️ Installation

### Method 1: Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/SumitKumar-17/erp-cv-deadline-highlighter.git
   cd erp-cv-deadline-highlighter
   ```

2. **Enable Developer Mode**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the extension folder
   - The extension will appear in your toolbar

### Method 2: Chrome Web Store (Coming Soon)
- Install directly from the Chrome Web Store
- Automatic updates and easy management

## 📖 Usage Guide

### Getting Started

1. **Navigate to ERP System**
   - Open your ERP placement portal
   - Navigate to the CV deadline page

2. **Activate the Extension**
   - Click the extension icon in your toolbar
   - Click "Start Highlighting" button
   - Watch as deadlines are automatically color-coded

3. **Monitor Deadlines**
   - Green rows: Safe to ignore for now
   - Orange rows: Need attention within 24 hours
   - Red rows: Immediate action required (overdue)

### Advanced Usage

#### Keyboard Shortcuts
- `Ctrl+S` (or `Cmd+S`): Start highlighting
- `Ctrl+Q` (or `Cmd+Q`): Stop highlighting  
- `Ctrl+C` (or `Cmd+C`): Clear highlights

#### Context Menu
- Right-click on any ERP page for quick actions
- Access start/stop functions without opening popup
- Direct link to GitHub repository

#### Tooltip Information
Hover over any highlighted row to see:
- Exact deadline date and time
- Current status (upcoming/warning/overdue)
- Time remaining or overdue duration

## ⚙️ Configuration

### Default Settings
```javascript
const CONFIG = {
  refreshInterval: 1000,    // 1 second refresh rate
  autoStopTime: 300000,     // Auto-stop after 5 minutes
  colors: {
    upcoming: '#4CAF50',    // Green
    warning: '#FF9800',     // Orange  
    overdue: '#F44336'      // Red
  }
};
```

### Customization
- Modify `content.js` to adjust colors and timing
- Update XPath selectors for different ERP layouts
- Customize refresh intervals and auto-stop timing

## 🔧 Development

### Prerequisites
- Chrome Browser (Version 88+)
- Basic knowledge of JavaScript, HTML, CSS
- Understanding of Chrome Extension APIs

### Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/SumitKumar-17/erp-cv-deadline-highlighter.git
   cd erp-cv-deadline-highlighter
   ```

2. **Load in Developer Mode**
   - Follow installation instructions above
   - Enable "Developer mode" for live reloading

3. **Make Changes**
   - Edit source files
   - Click refresh icon in Chrome extensions page
   - Test changes immediately

### Code Structure

#### Core Components

**content.js** - Main Logic
```javascript
// Configuration and initialization
const CONFIG = { /* settings */ };

// Core functions
function highlightDeadlines() { /* main highlighting logic */ }
function getDeadlineStatus() { /* status determination */ }
function applyDeadlineHighlight() { /* visual styling */ }
```

**popup.js** - User Interface
```javascript
class PopupController {
  // Handles all popup interactions
  // Communicates with content script
  // Manages UI state and notifications
}
```

**background.js** - Service Worker
```javascript
// Extension lifecycle management
// Context menu creation
// Cross-tab communication
// Performance monitoring
```

### Testing

1. **Manual Testing**
   - Load extension in developer mode
   - Navigate to ERP system
   - Test all functionality buttons
   - Verify color coding accuracy

2. **Edge Cases**
   - Test with invalid date formats
   - Check behavior with empty tables
   - Verify error handling

3. **Performance Testing**
   - Monitor CPU and memory usage
   - Test with large datasets
   - Verify smooth animations

## 🚀 Deployment

### Preparing for Chrome Web Store

1. **Update Version**
   ```json
   {
     "version": "1.0.1",
     "version_name": "1.0.1 Beta"
   }
   ```

2. **Create Distribution Package**
   ```bash
   # Remove development files
   rm -rf .git/
   
   # Create ZIP package
   zip -r extension-v1.0.0.zip .
   ```

3. **Submit to Chrome Web Store**
   - Visit Chrome Developer Dashboard
   - Upload ZIP file
   - Fill required information
   - Submit for review

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Types of Contributions
- 🐛 Bug reports and fixes
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX improvements
- 🔧 Performance optimizations

### Contributing Process

1. **Fork the Repository**
   ```bash
   git fork https://github.com/SumitKumar-17/erp-cv-deadline-highlighter.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Standards
- Use modern JavaScript (ES6+)
- Follow consistent formatting
- Add JSDoc comments for functions
- Handle errors gracefully
- Write descriptive commit messages

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Working
```
Problem: Extension icon shows but no highlighting occurs
Solution: 
1. Verify you're on the correct ERP page
2. Check browser console for errors
3. Reload the extension in chrome://extensions/
4. Try manually clicking "Start Highlighting"
```

#### Performance Issues
```
Problem: Browser becomes slow or unresponsive
Solution:
1. Reduce refresh interval in CONFIG
2. Clear highlights and restart
3. Check for memory leaks in console
4. Disable other extensions temporarily
```

#### Incorrect Color Coding
```
Problem: Wrong colors or missing highlights
Solution:
1. Verify date format matches expected pattern
2. Check XPath selectors are correct
3. Look for JavaScript errors in console
4. Test with different deadline dates
```

### Debug Mode

Enable detailed logging:
```javascript
// Add to content.js
const DEBUG = true;

if (DEBUG) {
  console.log('Debug info:', data);
}
```

### Error Reporting

Please report issues with:
- Browser version and OS
- Exact steps to reproduce
- Console error messages
- Screenshots if relevant

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Sumit Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **IIT Kharagpur** - For the ERP system that inspired this extension
- **Chrome Extension Community** - For excellent documentation and examples
- **Open Source Community** - For tools and libraries used in development

## 📞 Support

Having issues? Need help? Here are your options:

### GitHub Issues
- [Report Bug](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter/issues/new?template=bug_report.md)
- [Request Feature](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter/issues/new?template=feature_request.md)
- [View All Issues](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter/issues)

### Contact Developer
- GitHub: [@SumitKumar-17](https://github.com/SumitKumar-17)
- Email: Available through GitHub profile

---

<div align="center">

**Made with ❤️ by [Sumit Kumar](https://github.com/SumitKumar-17)**

[⭐ Star this repository](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter) • [🔄 Fork](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter/fork) • [📥 Download](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter/archive/main.zip)

</div>
