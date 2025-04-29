
#!/bin/bash

# Exit on error
set -e

echo "=== Furallies Cloud Run Deployment ==="
echo "This script will deploy both backend and frontend to Cloud Run"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "You need to login to gcloud first. Run: gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "No project selected. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "Using Google Cloud project: $PROJECT_ID"

# Step 1: Deploy backend
echo "=== Deploying backend ==="
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/vertex-ai-backend
gcloud run deploy vertex-ai-backend \
    --image gcr.io/$PROJECT_ID/vertex-ai-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars GCP_PROJECT=$PROJECT_ID,GCP_LOCATION=us-central1

# Get the backend URL
BACKEND_URL=$(gcloud run services describe vertex-ai-backend --format="value(status.url)" --region=us-central1)
echo "Backend deployed at: $BACKEND_URL"

# Step 2: Update frontend environment with backend URL
cd ..
echo "VITE_BACKEND_URL=$BACKEND_URL" > .env

echo "=== Deploying frontend ==="
gcloud builds submit --tag gcr.io/$PROJECT_ID/furallies-frontend
gcloud run deploy furallies-frontend \
    --image gcr.io/$PROJECT_ID/furallies-frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

# Get the frontend URL
FRONTEND_URL=$(gcloud run services describe furallies-frontend --format="value(status.url)" --region=us-central1)

echo "=== Deployment Complete ==="
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "You can now access your application at: $FRONTEND_URL"
