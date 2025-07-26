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
