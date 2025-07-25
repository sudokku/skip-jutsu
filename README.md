# Skip Jutsu - Enhanced Chrome Extension for jut.su

A Chrome extension that enhances your anime watching experience on jut.su by automating common actions and providing seamless episode transitions.

## Features

- **Auto Skip Intro**: Automatically clicks the "Skip intro" button when it appears
- **Auto Next Episode**: Automatically navigates to the next episode
- **Auto Fullscreen**: Attempts to enter fullscreen mode on episode transitions
- **Auto Play**: Starts video playback automatically
- **Fallback Controls**: Manual fullscreen trigger via keyboard shortcut
- **Enhanced Error Handling**: Multiple approaches for fullscreen and autoplay

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder

## Setup for Full Functionality

### For Personal Use (Recommended)

To enable fullscreen without user interaction, launch Chrome with special flags:

**macOS:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
--enable-features=AutomaticFullscreenContentSetting \
--autoplay-policy=no-user-gesture-required \
--user-data-dir="/tmp/chrome-dev"
```

**Windows:**
```bash
chrome.exe --enable-features=AutomaticFullscreenContentSetting --autoplay-policy=no-user-gesture-required --user-data-dir="C:\temp\chrome-dev"
```

**Linux:**
```bash
google-chrome --enable-features=AutomaticFullscreenContentSetting --autoplay-policy=no-user-gesture-required --user-data-dir="/tmp/chrome-dev"
```

### Site Permissions

After launching Chrome with flags:
1. Go to `chrome://settings/content/automaticFullscreen`
2. Add `https://jut.su` to the allowed sites list

## Usage

1. Navigate to any anime episode on jut.su
2. The extension will automatically:
   - Skip intro sequences when they appear
   - Navigate to the next episode when current one ends
   - Attempt to enter fullscreen mode
   - Start video playback automatically

### Manual Controls

- **Ctrl+Shift+F**: Manual fullscreen trigger (works anytime on jut.su)

## How It Works

- Uses `MutationObserver` to watch for skip buttons appearing on the page
- Stores navigation state using Chrome's storage API
- Implements multiple fallback methods for fullscreen:
  1. Video element fullscreen (preferred)
  2. Document fullscreen (fallback)
  3. Autoplay only (if fullscreen fails)

## Troubleshooting

### Fullscreen Not Working
- Ensure you launched Chrome with the required flags
- Check that jut.su is in your automatic fullscreen allowed sites
- Try the manual trigger: Ctrl+Shift+F

### Videos Not Autoplaying
- Make sure `--autoplay-policy=no-user-gesture-required` flag is set
- Check Chrome's autoplay settings for jut.su

### Extension Not Loading
- Verify you have Developer mode enabled in chrome://extensions/
- Check the console for any JavaScript errors

## Technical Details

- **Manifest Version**: 3
- **Permissions**: activeTab, scripting, storage
- **Target Site**: https://jut.su/*
- **Video Player**: Video.js based player detection

## Security Note

This extension is designed for personal use with development flags enabled. The fullscreen bypass methods require Chrome to be launched with specific flags that disable certain security restrictions. This is safe for personal use but should not be done on systems where security is a primary concern.

## Future Enhancements

Potential features being considered:
- Quality selector automation
- Subtitle management
- Episode tracking
- Additional keyboard shortcuts
- Dark mode toggle

## No need to get up from your cozy bed :)