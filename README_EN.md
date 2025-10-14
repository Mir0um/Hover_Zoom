# Hover Zoom

![Extension icon](icons/icon128.png)

A simple, lightweight, and efficient Chrome extension designed for accessibility. It enlarges images and videos on hover, helping users—especially those with visual impairments—browse the web more comfortably.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0.6-green.svg)](https://github.com/Mir0um/Hover_Zoom)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue.svg)](https://chromewebstore.google.com/detail/gkhghnhoflimlafecekklclepijjaemp)

---

## Demo

![Hover Zoom demonstration](demo.gif)

## Main Features

### 🖼️ Intelligent Media Detection
* **Hover magnification**: No need to click; simply hover over an element to activate it.
* **Multi-Source Detection**: Works on `<img>` and `<video>` tags as well as `<a>` links pointing to image or video files.
* **Lazy Loading Support**: Automatically detects deferred-loaded images via `data-src`, `data-lazy-src`, `data-original`, and `srcset`.
* **Dynamic Content**: Real-time DOM monitoring to detect dynamically added media (SPAs, infinite scroll).
* **Supported image formats**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`, `.apng`, `.ico`, `.tif`, `.tiff`
* **Supported video formats**: `.mp4`, `.webm`, `.ogg`, `.ogv`, `.mov`, `.mkv`, `.flv`

### 🎬 Optimized Video Playback
* **Automatic playback**: Videos start automatically in muted and looped mode in the preview window.
* **Smart management**: Automatic playback stop when closing the preview to save resources.

### 📐 Flexible Display Modes
1. **Natural Mode (beside)**: Displays the enlarged media in a floating window next to the cursor.
    * Configurable zoom factor (default 2x, adjustable from 1x to infinity in 0.1 increments)
    * Smart positioning: automatically places itself on the right or left to stay visible
    * Ideal for quick inspection without losing page context
2. **Full Page Mode (overlay)**: Displays the media in large format overlaying the page content.
    * Takes up the full width of the window
    * Perfect for viewing details in high resolution
    * Semi-transparent background to maintain context

### ⚙️ Configuration and Control
* **Intuitive Popup Interface**: Enable/disable the extension and change display modes with one click.
* **Complete Options Page**: Advanced management of website access permissions.
* **Permission Management**: 
    * Works with `activeTab` for minimal access
    * Optional `<all_urls>` permission for automatic activation on all sites
    * Interface to grant/revoke permissions per site
* **Automatic Save**: All your settings are saved instantly and synchronized across tabs.

### ⌨️ Convenient Controls
* **Quick close with Escape**: Press `Escape` to instantly close any preview.
* **Smooth Animations**: Seamless transitions with animation effects when showing and hiding.

### 🚀 Performance and Compatibility
* **Manifest V3 Architecture**: Uses the latest Chrome Extensions API version for better security and performance.
* **Optimized Service Worker**: Minimal background resource consumption.
* **Smart Injection**: Scripts are only activated on pages where they are needed.
* **Anti-Multiple Injection Protection**: Lock system to prevent conflicts and duplicates.

## Supported Languages

The extension is available in **27 languages**:

🌍 **European**: French, English, German, Spanish, Italian, Dutch, Polish, Portuguese, Russian, Swedish, Norwegian, Finnish, Danish, Czech, Hungarian, Ukrainian, Turkish

🌏 **Asian**: Chinese Simplified, Japanese, Korean, Hindi, Thai, Vietnamese, Indonesian, Malay

🌍 **Others**: Arabic, Bengali

The interface automatically adapts to your browser's language.

## Installation

You can install the extension directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/gkhghnhoflimlafecekklclepijjaemp).

### Manual Installation (Developers)

1. **Download the project**:
    ```bash
    git clone https://github.com/Mir0um/Hover_Zoom.git
    ```
    *OR download the project as a ZIP file and extract it.*

2. **Open Google Chrome** and navigate to `chrome://extensions`.

3. **Enable Developer Mode**: Toggle the switch in the upper right corner of the page.

4. **Load the extension**:
    * Click **"Load unpacked"**
    * Select the project folder (the one containing `manifest.json`)

5. **That's it!** The Hover Zoom icon should appear in your Chrome toolbar.

### Permission Management

On first use, the extension works with minimal access (`activeTab`). For an optimal experience on all sites:

1. Click the extension icon
2. Click **"Open options"** or **"Manage permissions"**
3. Grant the `<all_urls>` permission if you wish

You can revoke this permission at any time from the options page.

## How to Use

### Quick Setup
1. **Click the extension icon** in the toolbar to open the popup.
2. **Enable the extension** with the main toggle switch.
3. **Choose your magnification mode**:
    * `Natural Mode (beside)`: Ideal for quickly inspecting images without losing context
    * `Full Page Mode (overlay)`: Perfect for viewing images in great detail
4. **Adjust the zoom factor** (natural mode only) according to your needs.

### Daily Usage
* Simply hover over any image or video to enlarge it
* The preview displays automatically and follows your mouse
* Press `Escape` or move your mouse away from the element to close
* Changes are saved instantly and applied to all tabs

## Technical Architecture

### Project Structure
```
Hover_Zoom/
├── manifest.json           # Manifest V3 configuration
├── core/
│   ├── background.js      # Service Worker (lifecycle management)
│   ├── content.js         # Main script (830 lines)
│   ├── permissions.js     # Permission management
│   └── zoom.css           # Overlay styles
├── popup/                 # Popup interface
├── options/               # Complete options page
├── _locales/             # Translations (27 languages)
└── icons/                # Extension icons
```

### Data Flow
1. User hovers over media → `content.js` detects via `handleMouseOver()`
2. URL extraction from `src`, `data-src`, `data-lazy-src`, etc.
3. Display according to mode: `natural` (side viewer) or `page` (full-screen overlay)
4. Settings synchronized via `chrome.storage.local`
5. Service Worker (`background.js`) re-injects scripts when configuration changes

## Contributing

Contributions are welcome! If you have ideas for improvements or bug fixes, feel free to:

1. **Fork the project**
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Commit your changes**: `git commit -m 'Add my-feature'`
4. **Push to the branch**: `git push origin feature/my-feature`
5. **Open a Pull Request**

### Contribution Guide

Before contributing, please consult the [.github/copilot-instructions.md](.github/copilot-instructions.md) file which contains:
* Project coding conventions
* Critical patterns to respect
* Development workflows
* Testing checklists

### Report a Bug

If you find a bug, open an [issue](https://github.com/Mir0um/Hover_Zoom/issues) with:
* A clear description of the problem
* Steps to reproduce it
* Your Chrome and extension versions
* Screenshots if relevant

## Roadmap

### Current Version: 2.0.6
✅ Manifest V3 architecture  
✅ Lazy loading support  
✅ Dynamic content detection  
✅ 27 supported languages  
✅ Advanced permission management  

### Upcoming Versions
🔜 Per-site customizable zoom mode  
🔜 Animated GIF support with controls  
🔜 Customizable keyboard shortcuts  
🔜 Dark mode for interface  
🔜 Image gallery support  

## FAQ

### The extension doesn't work on a site
Check that the extension is enabled in the popup and that you've granted the necessary permissions. Some sites (like `chrome://` or `file://`) are protected by Chrome.

### How to temporarily disable the extension?
Click the extension icon and turn off the main toggle. You can also use Chrome's extension manager.

### Videos don't play
Make sure your browser supports the video format and that the site allows autoplay. The extension plays videos muted to bypass restrictions.

### How to change the zoom size?
In natural mode, you can adjust the zoom factor in the popup (from 1x to infinity in 0.1 increments).

## Credits

* **Creator**: Sartoris Jean-Paul (Miroum)
* **Inspiration**: This project is heavily inspired by the excellent extension [**Imagus** by TheFantasticWarrior](https://github.com/TheFantasticWarrior/chrome-extension-imagus), which set a high bar in this area.

## License

This project is distributed under the [MIT License](LICENSE). You are free to use, modify, and distribute it.

---

## Support

If you appreciate this extension, feel free to:
* ⭐ Star it on GitHub
* ✍️ Leave a review on the Chrome Web Store
* 🐛 Report bugs or suggest improvements
* 💬 Share the extension with your friends

**Developed with ❤️ to improve web accessibility**