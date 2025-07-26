# Skip Jutsu - Chrome Extension

The browser extension component that automatically handles intro skipping, episode navigation, and communicates with the fullscreen server.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this `extension` folder

## Files

- `manifest.json` - Extension configuration and permissions
- `content.js` - Main extension logic that runs on jut.su pages

## Features

- **Auto Skip Intro**: Automatically clicks "Skip intro" buttons
- **Auto Next Episode**: Automatically navigates to next episode  
- **WebSocket Communication**: Sends fullscreen requests to local server
- **Fallback Mode**: Works without server (limited functionality)
- **Manual Controls**: Ctrl+Shift+F for manual fullscreen trigger

## How it works

1. Uses `MutationObserver` to watch for skip buttons appearing
2. Detects episode transitions via Chrome storage API
3. Sends WebSocket message to `ws://localhost:8765` for fullscreen
4. Falls back to browser fullscreen API if server unavailable

## Extension-only mode

If you don't want to run the fullscreen server, the extension will still:
- Skip intros automatically
- Navigate to next episodes automatically  
- Attempt browser fullscreen (may be blocked by security policies)

## Debugging

Open Chrome DevTools (F12) on jut.su and check the Console tab for extension logs:
- `Fullscreen requested for: [URL]` - Extension is working
- `External fullscreen server not available` - Server not running
- `WebSocket not available` - Connection failed 