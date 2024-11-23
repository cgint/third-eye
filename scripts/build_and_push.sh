#!/bin/bash

# Exit on error
set -e

# Get the project ID from gcloud config
PROJECT_ID="gen-lang-client-0910640178" # $(gcloud config get-value project)
IMAGE_NAME="third-eye"
REGION="europe-west1"  # Change this if you want to use a different region
TARGET_PLATFORM="linux/amd64"

# Build the container
echo "Building container..."
docker build --platform $TARGET_PLATFORM -t $IMAGE_NAME .

# Tag the container for Google Container Registry
echo "Tagging container..."
docker tag $IMAGE_NAME gcr.io/$PROJECT_ID/$IMAGE_NAME

# Push the container to Google Container Registry
echo "Pushing container to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME

echo "Container built and pushed successfully!"
echo "Container URL: gcr.io/$PROJECT_ID/$IMAGE_NAME"
