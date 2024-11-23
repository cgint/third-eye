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

# Tag the container for Google Container Registry
echo "Tagging container..."
docker tag $IMAGE_NAME gcr.io/$PROJECT_ID/$IMAGE_NAME

# Push the container to Google Container Registry
echo "Pushing container to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME

echo "Container pushed successfully!"
echo "Container URL: gcr.io/$PROJECT_ID/$IMAGE_NAME" 