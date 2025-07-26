#!/bin/bash

# Skip Jutsu Complete Setup Script
# Handles extension packaging and server setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Skip Jutsu Setup             ║${NC}"
echo -e "${CYAN}║      Complete Automation Tool       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if we're in a virtual environment
check_virtual_env() {
    [[ -n "$VIRTUAL_ENV" ]] || [[ -n "$CONDA_DEFAULT_ENV" ]]
}

# Function to show menu
show_menu() {
    echo -e "${BLUE}What would you like to do?${NC}"
    echo "1) 📦 Package extension only"
    echo "2) 🐍 Setup server only"
    echo "3) 🌍 Setup server with virtual environment (recommended for macOS)"
    echo "4) 🚀 Setup everything (extension + server)"
    echo "5) 🌐 Setup everything with virtual environment"
    echo "6) 🏃 Quick start (setup + run server)"
    echo "7) ❌ Exit"
    echo ""
}

# Function to package extension
package_extension() {
    echo -e "${YELLOW}📦 Packaging Chrome Extension...${NC}"
    
    if [ -f "./package-extension.sh" ]; then
        ./package-extension.sh
    else
        echo -e "${RED}Error: package-extension.sh not found!${NC}"
        return 1
    fi
}

# Function to setup server with virtual environment
setup_server_venv() {
    echo -e "${YELLOW}🌍 Setting up Python server with virtual environment...${NC}"
    
    if [ ! -d "server" ]; then
        echo -e "${RED}Error: server directory not found!${NC}"
        return 1
    fi
    
    cd server
    
    echo -e "${YELLOW}🔧 Running virtual environment setup...${NC}"
    if [ -f "setup-venv.sh" ]; then
        ./setup-venv.sh
    else
        echo -e "${RED}Error: setup-venv.sh not found!${NC}"
        cd ..
        return 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ Server setup with virtual environment complete!${NC}"
}

# Function to setup server
setup_server() {
    echo -e "${YELLOW}🐍 Setting up Python server...${NC}"
    
    if [ ! -d "server" ]; then
        echo -e "${RED}Error: server directory not found!${NC}"
        return 1
    fi
    
    cd server
    
    # Check if Python is available
    if command_exists python3; then
        PYTHON_CMD="python3"
    elif command_exists python; then
        PYTHON_CMD="python"
    else
        echo -e "${RED}Error: Python not found! Please install Python first.${NC}"
        cd ..
        return 1
    fi
    
    echo -e "${YELLOW}📥 Installing server dependencies...${NC}"
    if $PYTHON_CMD setup.py; then
        cd ..
        echo -e "${GREEN}✅ Server setup complete!${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Standard setup failed. This might be due to externally managed Python.${NC}"
        echo ""
        echo -e "${BLUE}💡 Suggestion: Try virtual environment setup instead${NC}"
        echo "   Run this script again and choose option 3 or 5"
        echo ""
        echo -e "${YELLOW}Or manually run:${NC}"
        echo "   cd server && ./setup-venv.sh"
        cd ..
        return 1
    fi
}

# Function to run server
run_server() {
    echo -e "${YELLOW}🚀 Starting fullscreen server...${NC}"
    
    if [ ! -d "server" ]; then
        echo -e "${RED}Error: server directory not found!${NC}"
        return 1
    fi
    
    cd server
    
    # Check if virtual environment exists
    if [ -d "skip-jutsu-env" ]; then
        echo -e "${GREEN}🌍 Using virtual environment...${NC}"
        if [ -f "activate-server.sh" ]; then
            ./activate-server.sh
        else
            source skip-jutsu-env/bin/activate
            python fullscreen_server.py
        fi
    else
        # Check if Python is available
        if command_exists python3; then
            PYTHON_CMD="python3"
        elif command_exists python; then
            PYTHON_CMD="python"
        else
            echo -e "${RED}Error: Python not found!${NC}"
            cd ..
            return 1
        fi
        
        echo -e "${GREEN}🎯 Server starting... Press Ctrl+C to stop${NC}"
        echo ""
        $PYTHON_CMD fullscreen_server.py
    fi
}

# Function to show final instructions
show_final_instructions() {
    echo ""
    echo -e "${CYAN}🎉 Setup Complete!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. 📦 Install extension:"
    echo "   • Open Chrome → chrome://extensions/"
    echo "   • Enable Developer mode"
    echo "   • Load unpacked → select 'extension/' folder"
    echo "   • OR drag dist/skip-jutsu-extension-v*.zip to extensions page"
    echo ""
    echo "2. 🖥️  Start server (when needed):"
    if [ -f "server/activate-server.sh" ]; then
        echo "   • Run: cd server && ./activate-server.sh"
    else
        echo "   • Run: cd server && python fullscreen_server.py"
    fi
    echo "   • OR run: ./setup-all.sh and choose option 6"
    echo ""
    echo "3. 🍿 Enjoy:"
    echo "   • Go to jut.su and start watching!"
    echo "   • Extension will handle intro skipping and episode transitions"
    echo "   • If server is running, fullscreen will work automatically"
    echo ""
}

# Main execution
main() {
    while true; do
        show_menu
        read -p "Choose an option (1-7): " choice
        echo ""
        
        case $choice in
            1)
                package_extension
                ;;
            2)
                setup_server
                ;;
            3)
                setup_server_venv
                ;;
            4)
                package_extension
                echo ""
                setup_server
                if [ $? -eq 0 ]; then
                    show_final_instructions
                fi
                ;;
            5)
                package_extension
                echo ""
                setup_server_venv
                show_final_instructions
                ;;
            6)
                package_extension
                echo ""
                if setup_server_venv || setup_server; then
                    echo ""
                    run_server
                fi
                ;;
            7)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please choose 1-7.${NC}"
                echo ""
                ;;
        esac
        
        if [ "$choice" != "6" ]; then
            echo ""
            echo -e "${YELLOW}Press Enter to continue...${NC}"
            read
            clear
        fi
    done
}

# Check if script is being run from correct directory
if [ ! -f "package-extension.sh" ] || [ ! -d "extension" ] || [ ! -d "server" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory.${NC}"
    echo "Expected structure:"
    echo "  skip-jutsu/"
    echo "  ├── extension/"
    echo "  ├── server/"
    echo "  ├── package-extension.sh"
    echo "  └── setup-all.sh"
    exit 1
fi

# Start main function
main 