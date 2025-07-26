# Skip Jutsu - Enhanced Chrome Extension for jut.su

A Chrome extension that enhances your anime watching experience on jut.su by automating common actions and providing seamless episode transitions with **true fullscreen support**.

## Project Structure

```
skip-jutsu/
├── extension/              # Chrome extension files
│   ├── manifest.json       # Extension configuration
│   ├── content.js          # Main extension logic
│   └── README.md           # Extension-specific docs
├── server/                 # Fullscreen automation server
│   ├── fullscreen_server.py  # WebSocket server
│   ├── setup.py            # Dependency installer
│   └── README.md           # Server-specific docs
├── dist/                   # Generated extension packages
├── package-extension.sh    # 📦 Extension packaging script
├── setup-all.sh           # 🚀 Complete automation script
└── README.md               # This file
```

## Features

- **Auto Skip Intro**: Automatically clicks the "Skip intro" button when it appears
- **Auto Next Episode**: Automatically navigates to the next episode
- **True Auto Fullscreen**: Uses system-level F11 keystroke for reliable fullscreen
- **Auto Play**: Starts video playbook automatically
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Personal Browser Session**: Works with your regular browser and preserves watch history

## Quick Setup (Automated)

### 🚀 One-Command Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd skip-jutsu

# Run the automated setup
./setup-all.sh
```

The setup script will show you a menu:
```
╔══════════════════════════════════════╗
║         Skip Jutsu Setup             ║
║      Complete Automation Tool       ║
╚══════════════════════════════════════╝

What would you like to do?
1) 📦 Package extension only
2) 🐍 Setup server only  
3) 🚀 Setup everything (extension + server)
4) 🏃 Quick start (setup + run server)
5) ❌ Exit
```

**Recommended**: Choose option **3** for first-time setup, then option **4** for daily use.

### 📦 Extension Packaging Only
```bash
# Package extension into a distributable zip
./package-extension.sh
```

This creates `dist/skip-jutsu-extension-v1.0.zip` that you can:
- Install directly in Chrome
- Share with others
- Upload to Chrome Web Store

## Manual Setup

### 1. Install the Chrome Extension
```bash
# Navigate to the extension directory
cd extension/

# Follow the README instructions to install in Chrome
```
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" 
3. Click "Load unpacked" and select the `extension/` folder
4. OR drag `dist/skip-jutsu-extension-v*.zip` to the extensions page

### 2. Set Up Fullscreen Server (Optional but Recommended)
```bash
# Navigate to the server directory  
cd server/

# Install dependencies
python setup.py

# Start the fullscreen server
python fullscreen_server.py
```

### 3. Start Watching
1. Navigate to any anime episode on jut.su
2. The extension will automatically handle everything!

## How It Works

### With Fullscreen Server (Recommended)
```
Episode ends → Extension detects → WebSocket message → Server sends F11 → Browser fullscreen → Video plays
```

### Without Server (Fallback)
```
Episode ends → Extension tries browser fullscreen API → May be blocked by browser security
```

## Automation Scripts

### 🚀 setup-all.sh (Master Script)
**Complete automation tool with interactive menu:**
- Package extension into distributable zip
- Setup Python server dependencies
- Run server immediately
- Show final installation instructions

**Usage:**
```bash
./setup-all.sh
# Choose from menu options
```

### 📦 package-extension.sh (Extension Packager)
**Creates a clean, distributable zip file:**
- Copies extension files
- Removes development files (README.md)
- Auto-detects version from manifest.json
- Creates `dist/skip-jutsu-extension-v{version}.zip`

**Usage:**
```bash
./package-extension.sh
# Creates: dist/skip-jutsu-extension-v1.0.zip (4KB)
```

**Features:**
- ✅ Smart version detection from manifest.json
- ✅ Excludes unnecessary files (.DS_Store, .git, etc.)
- ✅ Cross-platform compatible
- ✅ Automatic file size reporting
- ✅ Installation instructions

## Component Documentation

- **Extension**: See [extension/README.md](extension/README.md) for extension-specific details
- **Server**: See [server/README.md](server/README.md) for server setup and troubleshooting

## Platform-Specific Setup

### Windows
```bash
cd server/
python setup.py
python fullscreen_server.py
```

### macOS
```bash
cd server/
python3 setup.py
python3 fullscreen_server.py
```

### Linux
```bash
# May need xdotool for window management
sudo apt install xdotool  # Ubuntu/Debian

cd server/
python3 setup.py
python3 fullscreen_server.py
```

## Usage

### Automatic Mode
- Just navigate to jut.su and start watching
- Extension handles intro skipping and episode transitions  
- If the server is running, fullscreen will work seamlessly

### Manual Controls
- **Ctrl+Shift+F**: Force fullscreen attempt (works anytime on jut.su)

## Distribution

### For Personal Use
```bash
./setup-all.sh  # Option 3: Setup everything
```

### For Sharing with Friends
```bash
./package-extension.sh  # Creates distributable zip
# Share: dist/skip-jutsu-extension-v1.0.zip
```

### For Your Brother's Windows Machine
```bash
# Copy just the server folder
cp -r server/ /path/to/usb/skip-jutsu-server/
# He only needs to run: python setup.py && python fullscreen_server.py
```

## Why This Architecture?

### **Separation of Concerns**
- **Extension**: Handles web page interaction and detection
- **Server**: Handles system-level automation (F11 keystrokes)
- **Scripts**: Handle packaging and setup automation

### **Benefits**
1. **Simple**: Extension works independently, server is optional
2. **Reliable**: F11 always works, regardless of browser security settings  
3. **Personal**: Uses your regular browser with all your accounts and history
4. **Cross-platform**: Same code works on Windows, Mac, and Linux
5. **Extensible**: Easy to add new features via WebSocket protocol
6. **Automated**: One-command setup and packaging

### **Deployment Flexibility**
- **Extension only**: Basic functionality (skip intro, next episode)
- **Extension + Server**: Full functionality including reliable fullscreen
- **Packaged**: Easy distribution via zip files

## Troubleshooting

### Extension Issues
- Check [extension/README.md](extension/README.md) for extension-specific troubleshooting

### Server Issues  
- Check [server/README.md](server/README.md) for server setup and debugging

### Script Issues
```bash
# Make sure scripts are executable
chmod +x *.sh

# Run from project root
ls -la  # Should see: extension/, server/, *.sh files
```

### Quick Checks
```bash
# Test extension: Look for console logs in Chrome DevTools on jut.su
# Test server: Should see "Waiting for fullscreen requests..." message
# Test connection: Extension logs should show "Fullscreen requested for: [URL]"
```

## Future Enhancements

The modular WebSocket architecture makes it easy to add:
- Quality selector automation
- Subtitle management  
- Episode tracking and bookmarks
- Custom keyboard shortcuts
- Volume control
- Multi-monitor fullscreen support

## Contributing

Each component can be developed independently:
- **Extension development**: Work in `extension/` directory
- **Server development**: Work in `server/` directory  
- **New features**: Extend the WebSocket protocol for communication
- **Packaging**: Extend automation scripts as needed

## No need to get up from your cozy bed :)