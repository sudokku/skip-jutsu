#!/bin/bash

# Skip Jutsu Virtual Environment Setup
# For systems with externally managed Python (like macOS with Homebrew)

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

VENV_NAME="skip-jutsu-env"

echo -e "${BLUE}Skip Jutsu Virtual Environment Setup${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Check if virtual environment already exists
if [ -d "$VENV_NAME" ]; then
    echo -e "${YELLOW}Virtual environment '$VENV_NAME' already exists.${NC}"
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing existing virtual environment...${NC}"
        rm -rf "$VENV_NAME"
    else
        echo -e "${GREEN}Using existing virtual environment.${NC}"
    fi
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_NAME" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv "$VENV_NAME"
    echo -e "${GREEN}✅ Virtual environment created.${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source "$VENV_NAME/bin/activate"

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install packages
echo -e "${YELLOW}Installing required packages...${NC}"
packages="websockets pynput"

# Add Windows-specific package if needed (though this script is for Unix-like systems)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    packages="$packages pygetwindow"
fi

pip install $packages

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}To use the server:${NC}"
echo "1. Activate virtual environment:"
echo -e "   ${YELLOW}source $VENV_NAME/bin/activate${NC}"
echo ""
echo "2. Run the server:"
echo -e "   ${YELLOW}python fullscreen_server.py${NC}"
echo ""
echo "3. When done, deactivate:"
echo -e "   ${YELLOW}deactivate${NC}"
echo ""

# Create a simple activation script
cat > activate-server.sh << 'EOF'
#!/bin/bash
# Quick activation script for Skip Jutsu server

VENV_NAME="skip-jutsu-env"

if [ ! -d "$VENV_NAME" ]; then
    echo "Virtual environment not found. Run setup-venv.sh first."
    exit 1
fi

echo "Activating virtual environment and starting server..."
source "$VENV_NAME/bin/activate"
python fullscreen_server.py
EOF

chmod +x activate-server.sh

echo -e "${GREEN}💡 Bonus: Created 'activate-server.sh' for quick startup!${NC}"
echo -e "   Just run: ${YELLOW}./activate-server.sh${NC}" 