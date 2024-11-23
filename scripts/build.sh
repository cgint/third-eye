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

# Build the container
echo "Building container..."
docker build --platform $TARGET_PLATFORM -t $IMAGE_NAME .

echo "Container built successfully!"
echo "Local image name: $IMAGE_NAME" 