#!/bin/bash

# Exit on error
set -e

# Source configuration
CONFIG_FILE="scripts/build.config"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Configuration file not found: $CONFIG_FILE"
    exit 1
fi

source "$CONFIG_FILE"

echo "About to run container: $IMAGE_NAME"

# Run the container
echo "Running container..."
docker run -it --platform $TARGET_PLATFORM -p $PORT:$PORT -e GEMINI_API_KEY -t $IMAGE_NAME
