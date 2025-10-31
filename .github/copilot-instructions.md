# Hover Zoom - AI Coding Agent Instructions

## Project Overview

Hover Zoom is a Chrome Manifest V3 extension that enlarges images/videos on hover for accessibility. The extension works across 27 languages and handles dynamic content (lazy loading, SPAs).

## Architecture

### Core Components
- **`core/background.js`**: Service Worker managing extension lifecycle, permissions, and script injection into tabs
- **`core/content.js`**: Main content script (830 lines) injected into web pages, handles all zoom/overlay logic
- **`core/zoom.css`**: Styling for zoom overlays (IDs: `#image-zoom-overlay`, `#image-zoom-viewer`)
- **`popup/`**: Extension popup UI for enabling/configuring the extension
- **`options/`**: Full options page with permissions management
- **`_locales/`**: i18n translations for 27 languages using Chrome's i18n API

### Data Flow
1. User hovers over image → `content.js` detects via `handleMouseOver()`
2. Media URL extracted from `<img>`, `<video>`, or `<a>` tags (including lazy-load attributes)
3. Display mode determined by settings: `natural` (side viewer) or `page` (full overlay)
4. Settings synced via `chrome.storage.local` (keys: `extensionEnabled`, `zoomMode`, `zoomFactor`)
5. Background script listens for settings changes and re-injects content scripts when needed

## Critical Patterns

### 1. Prevent Multiple Injections
```javascript
// ALWAYS use this pattern at the top of content scripts
const scriptId = 'hover-zoom-content-script';
if (window[scriptId]) return;
window[scriptId] = true;
```

### 2. Lazy Loading Support
The extension detects multiple lazy-load patterns in priority order:
- `src` → `data-src` → `data-lazy-src` → `data-original` → `srcset`
- `MutationObserver` watches for attribute changes to catch dynamic loading
- Global observer (`startGlobalObserver()`) monitors DOM changes for SPAs

### 3. Permission Handling
- Uses optional `<all_urls>` permission + `activeTab` fallback
- `injectScriptInTab()` silently fails on tabs without permission
- Options page provides UI to grant/revoke host permissions

### 4. Message Passing
Key message types between components:
- `SETTINGS_UPDATED`: Popup → Content scripts (reload settings)
- `EXTENSION_DISABLED`: Background → Content scripts (cleanup)
- `PERMISSIONS_GRANTED`: Options → Background (trigger re-injection)
- `REINJECT_ALL_TABS`: Options → Background (manual reactivation)

### 5. Event Cleanup
Always cleanup properly:
```javascript
// Remove event listeners, cancel RAF, disconnect observers
hideAllZoom(); // Stops videos, removes sources, clears RAF
removeEventListeners(); // Cleans up document-level listeners
```

## Development Workflows

### Testing Locally
1. Load unpacked extension from `chrome://extensions` (enable Developer Mode)
2. Changes to content/background scripts require extension reload
3. Changes to popup/options HTML/CSS: close and reopen popup/options
4. Test on various sites with lazy loading (Reddit, Instagram)

### Debugging
- Console logs prefixed with `Hover Zoom:` for filtering
- Background script logs: Right-click extension → "Inspect service worker"
- Content script logs: Regular page DevTools console
- Check permissions: `chrome.permissions.contains({origins: ['<all_urls>']})`

### Common Issues
- **Extension not working on new tabs**: Check if `chrome.tabs.onUpdated` listener fires at `status === 'complete'`
- **Multiple overlays**: Verify single injection pattern is working
- **Lazy-loaded images not detected**: Check if new lazy-load attributes are added to `MutationObserver` filter
- **Videos not playing**: Ensure `autoplay`, `muted`, `loop` attributes are set

## Internationalization (i18n)

All user-facing text uses Chrome's i18n API:
```javascript
chrome.i18n.getMessage('extensionName')
```

HTML placeholders automatically replaced:
```html
<span>__MSG_labelEnableExtension__</span>
```

### Adding New Strings
1. Add to `_locales/en/messages.json` (reference language)
2. Translate to all 27 languages (or use English as fallback)
3. Message keys use camelCase convention

## Coding Conventions

- **Variables**: `camelCase` for local, `UPPER_CASE` for constants
- **Functions**: Descriptive names (`handleMouseOver`, not `onHover`)
- **Async/await**: Preferred over `.then()` chains
- **Error handling**: Try-catch with fallback to defaults, silent failures for permission errors
- **Comments**: French in original code, use English for new contributions
- **IDs**: Prefix custom elements with `image-zoom-` to avoid conflicts

## Key Files to Modify

- **Add feature to zoom logic**: `core/content.js` (start at `handleMouseOver`)
- **Change popup UI**: `popup/popup.html` + `popup/popup.js`
- **Modify permissions flow**: `options/options.js` + `core/background.js`
- **Update styling**: `core/zoom.css` (affects both modes)
- **Add supported format**: Update `isImageUrl()` or `isVideoUrl()` arrays in `content.js`

## Testing Checklist

- [ ] Works on static images and videos
- [ ] Detects lazy-loaded content (data-src, etc.)
- [ ] Handles SPA navigation (YouTube, Reddit)
- [ ] Both zoom modes (`natural`, `page`) function correctly
- [ ] Escape key closes overlay
- [ ] Settings persist after browser restart
- [ ] Works without `<all_urls>` permission (activeTab only)
- [ ] No console errors on restricted pages (chrome://, file://)
- [ ] Translations display correctly in non-English locales
