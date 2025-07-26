#!/bin/bash

# Skip Jutsu Extension Packager
# Creates a distributable zip file of the Chrome extension

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
EXTENSION_DIR="extension"
OUTPUT_DIR="dist"
ZIP_NAME="skip-jutsu-extension.zip"
TEMP_DIR="temp_package"

echo -e "${BLUE}Skip Jutsu Extension Packager${NC}"
echo -e "${BLUE}================================${NC}"

# Check if extension directory exists
if [ ! -d "$EXTENSION_DIR" ]; then
    echo -e "${RED}Error: $EXTENSION_DIR directory not found!${NC}"
    echo "Make sure you're running this script from the project root."
    exit 1
fi

# Check if required extension files exist
required_files=("manifest.json" "content.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$EXTENSION_DIR/$file" ]; then
        echo -e "${RED}Error: Required file $EXTENSION_DIR/$file not found!${NC}"
        exit 1
    fi
done

echo -e "${YELLOW}📁 Preparing package directory...${NC}"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Remove any existing zip file
if [ -f "$OUTPUT_DIR/$ZIP_NAME" ]; then
    echo -e "${YELLOW}🗑️  Removing existing $ZIP_NAME${NC}"
    rm "$OUTPUT_DIR/$ZIP_NAME"
fi

# Create temporary directory for packaging
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi
mkdir -p "$TEMP_DIR"

echo -e "${YELLOW}📦 Copying extension files...${NC}"

# Copy extension files to temp directory
cp -r "$EXTENSION_DIR"/* "$TEMP_DIR/"

# Remove README.md from the package (not needed in the actual extension)
if [ -f "$TEMP_DIR/README.md" ]; then
    rm "$TEMP_DIR/README.md"
    echo -e "${YELLOW}📝 Removed README.md from package (not needed in extension)${NC}"
fi

# Read version from manifest.json
if command -v jq > /dev/null 2>&1; then
    VERSION=$(jq -r '.version' "$TEMP_DIR/manifest.json" 2>/dev/null || echo "unknown")
    if [ "$VERSION" != "unknown" ]; then
        ZIP_NAME="skip-jutsu-extension-v${VERSION}.zip"
    fi
fi

echo -e "${YELLOW}🗜️  Creating zip file: $ZIP_NAME${NC}"

# Create the zip file
cd "$TEMP_DIR"
zip -r "../$OUTPUT_DIR/$ZIP_NAME" . -x "*.DS_Store" "*.git*" "Thumbs.db"
cd ..

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Get file size
if command -v du > /dev/null 2>&1; then
    FILE_SIZE=$(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)
    echo -e "${GREEN}✅ Package created successfully!${NC}"
    echo -e "${GREEN}📁 Location: $OUTPUT_DIR/$ZIP_NAME${NC}"
    echo -e "${GREEN}📏 Size: $FILE_SIZE${NC}"
else
    echo -e "${GREEN}✅ Package created successfully!${NC}"
    echo -e "${GREEN}📁 Location: $OUTPUT_DIR/$ZIP_NAME${NC}"
fi

echo ""
echo -e "${BLUE}📋 Installation Instructions:${NC}"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (top right toggle)"
echo "3. Click 'Load unpacked' and select the extracted folder"
echo "   OR"
echo "4. Drag and drop the zip file onto the extensions page"
echo ""
echo -e "${YELLOW}💡 Tip: Share this zip file with others for easy installation!${NC}" 