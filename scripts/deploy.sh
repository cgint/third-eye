#!/bin/bash

# Exit on error
set -e

# Get the project ID from gcloud config
PROJECT_ID="gen-lang-client-0910640178" # $(gcloud config get-value project)
IMAGE_NAME="third-eye"
SERVICE_NAME="third-eye"
REGION="europe-west1"  # Change this if you want to use a different region

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --memory 512Mi \
  --cpu 1 \
  --port 8000

echo "Deployment complete!"
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"
