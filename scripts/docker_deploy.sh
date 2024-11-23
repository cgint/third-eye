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

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform $PLATFORM \
  --region $REGION \
  ${ALLOW_UNAUTHENTICATED:+"--allow-unauthenticated"} \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --memory $MEMORY \
  --cpu $CPU \
  --port $PORT

echo "Deployment complete!"
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"
