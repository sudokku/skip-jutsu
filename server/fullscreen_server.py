#!/usr/bin/env python3
"""
Simple WebSocket and HTTP server for Skip Jutsu extension
Handles fullscreen requests by sending F11 keystrokes to the focused browser
"""

import asyncio
import websockets
import json
import time
import sys
import os
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

# Cross-platform imports
try:
    from pynput import keyboard
    from pynput.keyboard import Key
    PYNPUT_AVAILABLE = True
except ImportError:
    PYNPUT_AVAILABLE = False
    print("pynput not available. Install with: pip install pynput")

# Platform-specific window management
PLATFORM = sys.platform
if PLATFORM == "win32":
    try:
        import pygetwindow as gw
        WINDOW_MANAGER_AVAILABLE = True
    except ImportError:
        WINDOW_MANAGER_AVAILABLE = False
        print("pygetwindow not available. Install with: pip install pygetwindow")
elif PLATFORM == "darwin":  # macOS
    WINDOW_MANAGER_AVAILABLE = True  # We'll use osascript
else:  # Linux
    WINDOW_MANAGER_AVAILABLE = True  # We'll use xdotool

def log_message(message):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

class FullscreenAutomator:
    def __init__(self):
        if PYNPUT_AVAILABLE:
            self.controller = keyboard.Controller()
        else:
            self.controller = None
        
    def find_and_focus_browser(self):
        """Find and focus the browser window"""
        try:
            if PLATFORM == "win32" and WINDOW_MANAGER_AVAILABLE:
                # Windows
                chrome_windows = gw.getWindowsWithTitle("Chrome")
                if not chrome_windows:
                    chrome_windows = gw.getWindowsWithTitle("Chromium")
                if chrome_windows:
                    chrome_windows[0].activate()
                    return True
                    
            elif PLATFORM == "darwin":
                # macOS - use osascript to focus Chrome
                result = os.system('osascript -e "tell application \\"Google Chrome\\" to activate" 2>/dev/null')
                return result == 0
                
            else:
                # Linux - use xdotool (if available)
                result = os.system('xdotool search --name "Chrome|Chromium" windowactivate 2>/dev/null')
                return result == 0
                
        except Exception as e:
            log_message(f"❌ Window focus failed: {e}")
            
        return False
    
    def send_f11_keystroke(self):
        """Send F11 keystroke using the best available method"""
        try:
            if self.controller:
                # Method 1: pynput (preferred)
                self.controller.press(Key.f11)
                self.controller.release(Key.f11)
                return True
                
            else:
                # Method 2: Platform-specific commands
                if PLATFORM == "win32":
                    # PowerShell command for Windows
                    cmd = 'powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\"{F11}\")"'
                    result = os.system(cmd)
                    return result == 0
                    
                elif PLATFORM == "darwin":
                    # osascript for macOS (F11 is key code 103)
                    result = os.system('osascript -e "tell application \\"System Events\\" to key code 103" 2>/dev/null')
                    return result == 0
                    
                else:
                    # xdotool for Linux
                    result = os.system('xdotool key F11 2>/dev/null')
                    return result == 0
                    
        except Exception as e:
            log_message(f"❌ Keystroke failed: {e}")
            
        return False
    
    def handle_fullscreen_action(self, url, source="unknown"):
        """Handle fullscreen request from any source"""
        log_message(f"🎬 Fullscreen requested for: {url} (via {source})")
        
        # Focus browser first
        log_message("🔍 Attempting to focus browser window...")
        focused = self.find_and_focus_browser()
        if focused:
            log_message("✅ Browser window focused successfully")
            # Small delay to ensure focus takes effect
            time.sleep(0.2)
            
            # Send F11
            log_message("⌨️  Sending F11 keystroke...")
            success = self.send_f11_keystroke()
            if success:
                log_message("✅ F11 keystroke sent successfully")
                return True
            else:
                log_message("❌ Failed to send F11 keystroke")
                return False
        else:
            log_message("❌ Could not focus browser window")
            return False
    
    async def handle_websocket_request(self, websocket, path):
        """Handle incoming WebSocket messages"""
        client_ip = websocket.remote_address[0] if websocket.remote_address else "unknown"
        log_message(f"🔌 New WebSocket connection from {client_ip}")
        
        try:
            async for message in websocket:
                try:
                    log_message(f"📥 Received WebSocket message: {message}")
                    data = json.loads(message)
                    action = data.get('action')
                    
                    if action == 'fullscreen':
                        url = data.get('url', 'unknown')
                        self.handle_fullscreen_action(url, "WebSocket")
                    else:
                        log_message(f"❓ Unknown action: {action}")
                        
                except json.JSONDecodeError:
                    log_message("❌ Invalid JSON received")
                except Exception as e:
                    log_message(f"❌ Error handling request: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            log_message(f"🔌 WebSocket connection closed by {client_ip}")
        except Exception as e:
            log_message(f"❌ WebSocket error: {e}")

# Global automator instance
automator = None

class HTTPRequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler for fullscreen requests"""
    
    def log_message(self, format, *args):
        """Override default logging to use our custom logger"""
        pass  # Disable default HTTP logging
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        global automator
        
        if self.path == '/fullscreen':
            try:
                # Get client IP
                client_ip = self.client_address[0]
                log_message(f"🌐 New HTTP request from {client_ip}")
                
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    body = self.rfile.read(content_length)
                    data = json.loads(body.decode('utf-8'))
                    log_message(f"📥 Received HTTP message: {data}")
                    
                    action = data.get('action')
                    if action == 'fullscreen':
                        url = data.get('url', 'unknown')
                        success = automator.handle_fullscreen_action(url, "HTTP")
                        
                        # Send response
                        self.send_response(200 if success else 500)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        
                        response = {"success": success, "message": "F11 sent" if success else "Failed"}
                        self.wfile.write(json.dumps(response).encode('utf-8'))
                    else:
                        self.send_response(400)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        response = {"error": f"Unknown action: {action}"}
                        self.wfile.write(json.dumps(response).encode('utf-8'))
                else:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
            except Exception as e:
                log_message(f"❌ HTTP request error: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {"error": str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

def run_http_server():
    """Run HTTP server in a separate thread"""
    try:
        httpd = HTTPServer(('localhost', 8765), HTTPRequestHandler)
        log_message("🌐 HTTP server started on http://localhost:8765")
        httpd.serve_forever()
    except Exception as e:
        log_message(f"❌ HTTP server error: {e}")

def check_dependencies():
    """Check if required dependencies are available"""
    missing = []
    
    if not PYNPUT_AVAILABLE:
        missing.append("pynput")
    
    if PLATFORM == "win32" and not WINDOW_MANAGER_AVAILABLE:
        missing.append("pygetwindow")
    
    if missing:
        print(f"\nMissing dependencies: {', '.join(missing)}")
        print("Install with: pip install " + " ".join(missing))
        return False
    
    return True

async def main():
    """Main async function"""
    global automator
    
    print("Skip Jutsu Fullscreen Server")
    print("============================")
    
    if not check_dependencies():
        print("\nPlease install missing dependencies and try again.")
        return
    
    automator = FullscreenAutomator()
    
    print(f"Platform: {PLATFORM}")
    print("Starting dual-protocol server on localhost:8765")
    print("- HTTP endpoint: http://localhost:8765/fullscreen")
    print("- WebSocket endpoint: ws://localhost:8766")
    print("Waiting for fullscreen requests from browser extension...")
    print("Press Ctrl+C to stop\n")
    
    try:
        # Start HTTP server in a separate thread
        http_thread = threading.Thread(target=run_http_server, daemon=True)
        http_thread.start()
        
        # Start WebSocket server
        async with websockets.serve(
            lambda ws, path: automator.handle_websocket_request(ws, path), 
            "localhost", 
            8766  # Use different port for WebSocket to avoid conflict
        ):
            log_message("🚀 Dual-protocol server started successfully")
            # Keep the server running indefinitely
            await asyncio.Future()  # run forever
            
    except KeyboardInterrupt:
        log_message("🛑 Server stopped by user")
    except Exception as e:
        log_message(f"❌ Server error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log_message("🛑 Server stopped by user")
    except Exception as e:
        log_message(f"❌ Failed to start server: {e}")
        print("\nTrying alternative event loop setup...")
        try:
            # Alternative approach for some Python/platform combinations
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(main())
        except Exception as e2:
            log_message(f"❌ Alternative setup also failed: {e2}")
            print("Please check your Python installation and try again.") 