# Development & Deployment Guide

## Quick Start

### 1. Load Extension in Developer Mode
```bash
# Open Chrome and navigate to:
chrome://extensions/

# Enable Developer Mode (toggle in top right)
# Click "Load unpacked"
# Select the extension folder
```

### 2. Test the Extension
- Navigate to `erp.iitkgp.ac.in/IIT_ERP3/showmenu.htm`
- Click the extension icon
- Test all features (Start, Stop, Clear)
- Check console for any errors

### 3. Development Workflow
```bash
# Make changes to source files
# Reload extension in chrome://extensions/
# Test changes immediately
# Repeat until satisfied
```

## 🔧 File Structure Overview

```
extension/
├── manifest.json          # Extension metadata & permissions
├── content.js            # Main logic (runs on ERP pages)
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality & communication
├── popup.css             # Popup styling
├── styles.css            # Injected styles for highlighted elements
├── background.js         # Service worker for extension lifecycle
├── icons/                # Extension icons (create these)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md             # Main documentation
├── LICENSE               # MIT License
└── DEVELOPMENT.md        # This file
```

## 📝 Code Documentation

### Core Functions in content.js

#### `initializeExtension()`
- Initializes the extension when loaded
- Sets up target frame reference
- Starts the highlighting process
- Returns success/failure status

#### `highlightDeadlines()`
- Main function that runs on interval
- Generates XPath expressions for table rows
- Processes each deadline element
- Applies appropriate color coding

#### `getDeadlineStatus(deadlineDate, currentDate)`
- Determines if deadline is upcoming, warning, or overdue
- Returns color and status information
- Calculates time differences

#### `applyDeadlineHighlight(element, elementDateTime, currentDateTime)`
- Applies visual styling to table rows
- Creates smooth animations and transitions
- Adds informative tooltips

### Popup Communication

#### Message Types
```javascript
// Start highlighting
{ action: 'start' }

// Stop highlighting  
{ action: 'stop' }

// Clear all highlights
{ action: 'clear' }

// Get current status
{ action: 'status' }
```

#### Response Format
```javascript
{
  success: boolean,
  message: string,
  isActive?: boolean,
  processedRows?: number
}
```

## 🎨 Styling System

### CSS Classes Applied
- `.erp-deadline-highlighted` - Base class for all highlighted elements
- `.erp-status-upcoming` - Green styling for safe deadlines
- `.erp-status-warning` - Orange styling for urgent deadlines  
- `.erp-status-overdue` - Red styling for overdue deadlines

### Color Scheme
```css
:root {
  --upcoming-color:rgb(0, 255, 8);    /* Green */
  --warning-color: #FF9800;     /* Orange */
  --overdue-color: #F44336;     /* Red */
  --border-color: #E0E0E0;      /* Light gray */
}
```

### Animations
- Pulsing effect for warning deadlines
- Stronger pulsing for overdue deadlines
- Smooth hover transitions
- Loading animations

## 🔍 Debugging

### Enable Debug Mode
Add to content.js:
```javascript
const DEBUG = true;

function debugLog(message, data) {
  if (DEBUG) {
    console.log(`[ERP Highlighter] ${message}`, data);
  }
}
```

### Common Debug Points
1. XPath element selection
2. Date parsing accuracy
3. Color application success
4. Performance metrics
5. Error handling

### Browser Console Commands
```javascript
// Check if extension is active
window.isExtensionActive

// View processed rows
window.processedRows

// Manual trigger
window.highlightDeadlines()
```

## ⚡ Performance Optimization

### Current Optimizations
- Processes only changed elements
- Uses efficient XPath selectors
- Implements smart caching
- Limits processing frequency
- Auto-stops after timeout

### Performance Monitoring
```javascript
// Add to background.js
let performanceMetrics = {
  startTime: Date.now(),
  messagesHandled: 0,
  errorsOccurred: 0
};
```

### Memory Management
- Clear processed rows cache periodically
- Remove event listeners on stop
- Clean up intervals and timeouts
- Optimize DOM queries

## 🧪 Testing Checklist

### Functionality Tests
- [ ] Extension loads without errors
- [ ] Start button activates highlighting
- [ ] Stop button deactivates highlighting
- [ ] Clear button removes all highlights
- [ ] Status indicator updates correctly
- [ ] Tooltips show correct information

### Visual Tests
- [ ] Colors match design specification
- [ ] Animations are smooth
- [ ] Hover effects work properly
- [ ] Responsive design functions
- [ ] High contrast mode supported

### Performance Tests
- [ ] No memory leaks after extended use
- [ ] CPU usage remains reasonable
- [ ] Large tables process efficiently
- [ ] Browser doesn't freeze or lag

### Error Handling Tests
- [ ] Invalid date formats handled gracefully
- [ ] Missing elements don't break extension
- [ ] Network errors managed properly
- [ ] Permission issues handled

## 📦 Packaging for Distribution

### Pre-packaging Checklist
- [ ] All features tested and working
- [ ] Version number updated in manifest.json
- [ ] Icons created and optimized
- [ ] README.md updated
- [ ] No debug code in production files
- [ ] Performance optimized

### Create Distribution Package
```bash
# Remove development files
rm -rf .git/
rm DEVELOPMENT.md

# Create ZIP for Chrome Web Store
zip -r erp-cv-deadline-highlighter-v1.0.0.zip . -x "*.DS_Store" "node_modules/*"
```

### Chrome Web Store Submission

#### Required Information
- **Name**: ERP CV Deadline Highlighter
- **Summary**: Color-coded deadline highlighting for ERP placement systems
- **Category**: Productivity
- **Language**: English
- **Developer**: Sumit Kumar

#### Store Listing Assets
- **Icon**: 128x128 PNG
- **Screenshots**: 1280x800 or 640x400 PNG
- **Promotional Images**: Optional but recommended

#### Privacy & Permissions
- Justify each permission in manifest.json
- Provide privacy policy if collecting data
- Explain host permissions usage

## 🔄 Update Process

### Version Management
```json
{
  "version": "1.0.1",
  "version_name": "1.0.1 - Bug Fixes"
}
```

### Update Types
- **Patch (1.0.x)**: Bug fixes, minor improvements
- **Minor (1.x.0)**: New features, enhancements
- **Major (x.0.0)**: Breaking changes, major redesign

### Release Process
1. Update version in manifest.json
2. Update README.md with changes
3. Test thoroughly
4. Create release notes
5. Package and submit to store
6. Update GitHub repository

## 🤝 Contributing Guidelines

### Code Style
- Use modern JavaScript (ES6+)
- 2-space indentation
- Semicolons required
- Descriptive variable names
- JSDoc comments for functions

### Commit Messages
```
feat: add keyboard shortcuts for popup controls
fix: resolve date parsing issue with edge cases
docs: update installation instructions
style: improve popup button styling
perf: optimize XPath element selection
```

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request
6. Respond to review feedback

## 🛡️ Security Considerations

### Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Permission Minimization
- Only request necessary permissions
- Use activeTab instead of broad host permissions
- Explain permission usage to users

### Data Privacy
- No personal data collection
- No external API calls
- Local processing only
- No tracking or analytics

## 📊 Analytics & Monitoring

### Usage Metrics (Optional)
- Extension activation frequency
- Feature usage statistics
- Error occurrence rates
- Performance benchmarks

### Error Reporting
```javascript
window.addEventListener('error', (event) => {
  console.error('Extension error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});
```

## 🔮 Future Enhancements

### Planned Features
- [ ] Custom color themes
- [ ] Sound notifications for deadlines
- [ ] Export deadline data
- [ ] Multiple ERP system support
- [ ] Mobile browser compatibility

### Technical Improvements
- [ ] WebAssembly for better performance
- [ ] Service worker optimization
- [ ] Progressive Web App features
- [ ] Offline functionality
- [ ] Cloud sync capabilities

---

**Happy Development! 🚀**

For questions or support, please visit the [GitHub repository](https://github.com/SumitKumar-17/erp-cv-deadline-highlighter).
