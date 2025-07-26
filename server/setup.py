#!/usr/bin/env python3
"""
Setup script for Skip Jutsu fullscreen server
Installs required dependencies for cross-platform keystroke automation
Handles externally managed Python environments (macOS Homebrew, etc.)
"""

import subprocess
import sys
import platform
import os

def run_command(cmd):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Command failed: {cmd}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command: {e}")
        return False

def install_package(package):
    """Install a package using pip with multiple fallback methods"""
    methods = [
        # Method 1: Try normal pip install
        f"{sys.executable} -m pip install {package}",
        # Method 2: Try with --user flag
        f"{sys.executable} -m pip install --user {package}",
        # Method 3: Try with --break-system-packages (risky but sometimes needed)
        f"{sys.executable} -m pip install --break-system-packages {package}",
    ]
    
    for i, method in enumerate(methods, 1):
        print(f"  Attempt {i}: {method.split()[-2:]} ", end="")
        if run_command(method):
            print("✅ Success")
            return True
        else:
            print("❌ Failed")
    
    return False

def check_virtual_env():
    """Check if we're in a virtual environment"""
    return hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )

def suggest_virtual_env():
    """Suggest creating a virtual environment"""
    print("\n🔧 Alternative: Create a virtual environment")
    print("This is the safest approach for externally managed Python:")
    print()
    print("1. Create virtual environment:")
    print(f"   python3 -m venv skip-jutsu-env")
    print()
    print("2. Activate it:")
    if platform.system() == "Windows":
        print("   skip-jutsu-env\\Scripts\\activate")
    else:
        print("   source skip-jutsu-env/bin/activate")
    print()
    print("3. Install dependencies:")
    print("   python setup.py")
    print()
    print("4. Run server:")
    print("   python fullscreen_server.py")
    print()

def main():
    print("Skip Jutsu Setup")
    print("================")
    print(f"Platform: {platform.system()}")
    print(f"Python: {sys.version}")
    
    # Check if in virtual environment
    if check_virtual_env():
        print("✅ Running in virtual environment")
    else:
        print("⚠️  Running in system Python")
    
    # Required packages
    packages = ["websockets", "pynput"]
    
    # Windows-specific package
    if platform.system() == "Windows":
        packages.append("pygetwindow")
    
    print(f"Installing packages: {', '.join(packages)}")
    print()
    
    failed = []
    for package in packages:
        print(f"Installing {package}...")
        if install_package(package):
            print(f"✅ {package} installed successfully")
        else:
            print(f"❌ Failed to install {package}")
            failed.append(package)
        print()
    
    if failed:
        print(f"❌ Failed to install: {', '.join(failed)}")
        print("\n🔧 Troubleshooting options:")
        print()
        print("Option 1: Install with Homebrew (macOS):")
        for package in failed:
            if package == "websockets":
                print("   # websockets not available via brew, use pip")
            elif package == "pynput":
                print("   # pynput not available via brew, use pip")
        print()
        print("Option 2: Manual pip install:")
        print(f"   pip install --user {' '.join(failed)}")
        print()
        print("Option 3: Use pipx (if available):")
        print("   brew install pipx")
        for package in failed:
            print(f"   pipx install {package}")
        print()
        suggest_virtual_env()
        return False
    else:
        print("✅ All dependencies installed successfully!")
        print()
        print("🚀 Ready to run:")
        print("   python fullscreen_server.py")
        print()
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 