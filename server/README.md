# Skip Jutsu - Fullscreen Server

A cross-platform Python WebSocket server that receives fullscreen requests from the browser extension and sends F11 keystrokes to enable true fullscreen mode.

## Quick Start

### Option 1: Standard Setup
```bash
python setup.py
python fullscreen_server.py
```

### Option 2: Virtual Environment Setup (Recommended for macOS/Homebrew Python)
```bash
./setup-venv.sh
./activate-server.sh  # Quick startup script
```

### Option 3: Manual Virtual Environment
```bash
# Create virtual environment
python3 -m venv skip-jutsu-env

# Activate it
source skip-jutsu-env/bin/activate  # macOS/Linux
# OR
skip-jutsu-env\Scripts\activate     # Windows

# Install dependencies
pip install websockets pynput pygetwindow  # pygetwindow only on Windows

# Run server
python fullscreen_server.py
```

## What setup.py does

The `setup.py` script automatically installs required Python packages:

- **websockets** - WebSocket server for communication with browser extension
- **pynput** - Cross-platform library for sending keyboard inputs (F11)
- **pygetwindow** - (Windows only) Library for finding and focusing windows

For **externally managed Python environments** (like macOS with Homebrew), it will:
1. Try normal pip install
2. Fall back to `pip install --user`
3. Fall back to `pip install --break-system-packages` (if needed)
4. Provide troubleshooting suggestions if all methods fail

## Virtual Environment Benefits

Using a virtual environment (via `setup-venv.sh`) is recommended because:
- ✅ Avoids conflicts with system Python packages
- ✅ Works around "externally managed environment" restrictions
- ✅ Cleaner, isolated dependencies
- ✅ Easier to remove/recreate if needed
- ✅ Creates a convenient `activate-server.sh` startup script

## How it works

1. **Listens** on `ws://localhost:8765` for WebSocket connections
2. **Receives** JSON messages from browser extension like:
   ```json
   {"action": "fullscreen", "url": "https://jut.su/...", "timestamp": 1234567890}
   ```
3. **Focuses** the Chrome browser window
4. **Sends** F11 keystroke to trigger browser fullscreen
5. **Logs** the result

## Platform Support

### Windows
- Uses `pygetwindow` to find Chrome windows
- Uses `pynput` or PowerShell for keystrokes
- Searches for "Chrome" or "Chromium" windows

### macOS  
- Uses `osascript` to focus Chrome
- Uses `pynput` or `osascript` for keystrokes
- Activates "Google Chrome" application
- **Virtual environment recommended** due to Homebrew Python restrictions

### Linux
- Uses `xdotool` to find and focus browser (if available)
- Uses `pynput` or `xdotool` for keystrokes
- Searches for Chrome/Chromium windows

## Files in this directory

- `fullscreen_server.py` - Main WebSocket server
- `setup.py` - Dependency installer with fallback methods
- `setup-venv.sh` - Virtual environment setup script (Unix/macOS)
- `activate-server.sh` - Quick startup script (created by setup-venv.sh)
- `skip-jutsu-env/` - Virtual environment directory (created when using venv setup)

## Troubleshooting

### Server won't start
```bash
# Check if dependencies are installed
python -c "import websockets, pynput; print('Dependencies OK')"

# If using virtual environment, make sure it's activated
source skip-jutsu-env/bin/activate  # Then try again
```

### Externally managed environment error (macOS)
```bash
# Use virtual environment setup instead
./setup-venv.sh

# Then use the generated quick start script
./activate-server.sh
```

### Dependencies missing on Linux
```bash
# Ubuntu/Debian
sudo apt install python3-pip xdotool

# Then install Python packages
python3 setup.py
# OR use virtual environment
./setup-venv.sh
```

### Fullscreen not working
- **Is Chrome focused?** The browser window must be active
- **Check server logs** - Look for error messages in terminal
- **Try manually** - Press F11 in Chrome to test if it works normally

## Server Architecture

```
Browser Extension ─── WebSocket ─── Python Server ─── OS Keystroke ─── Browser
     (jut.su)        (port 8765)    (fullscreen_server.py)    (F11)     (Chrome)
```

## Extending the server

The WebSocket protocol is simple JSON. To add new features:

1. **Add new action type** in extension:
   ```javascript
   ws.send(JSON.stringify({action: 'volume_up'}));
   ```

2. **Handle it in server**:
   ```python
   elif action == 'volume_up':
       controller.press(Key.up)
   ```

## Development Workflow

### Using Virtual Environment
```bash
# Setup once
./setup-venv.sh

# Daily development
source skip-jutsu-env/bin/activate
# Make changes to fullscreen_server.py
python fullscreen_server.py
deactivate  # When done

# Quick startup
./activate-server.sh
```

### Using System Python
```bash
# Setup once
python setup.py

# Daily development
python fullscreen_server.py
```

## Security Note

This server only listens on `localhost` (127.0.0.1) and cannot be accessed from other machines. It only responds to requests from browser extensions running on the same computer. 