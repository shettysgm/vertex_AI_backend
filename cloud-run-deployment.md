
# Cloud Run Deployment Guide

This guide provides clear instructions for deploying both frontend and backend services to Google Cloud Run from a single repository.

## Prerequisites

1. Google Cloud SDK installed and configured
2. Docker installed
3. Git repository with both frontend and backend code

## Deployment Options

### Option 1: Deploy with Cloud Build (Recommended)

The simplest way to deploy both services is using the provided `cloudbuild.yaml`:

```bash
# From the repository root
gcloud builds submit --config cloudbuild.yaml
```

This will:
1. Build and deploy the backend first
2. Automatically capture the backend URL
3. Configure the frontend with this URL
4. Build and deploy the frontend

### Option 2: Manual Deployment

If you prefer more control, you can deploy each service manually:

#### Step 1: Deploy Backend

```bash
# Navigate to backend directory
cd backend

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/vertex-ai-backend
gcloud run deploy vertex-ai-backend \
  --image gcr.io/YOUR_PROJECT_ID/vertex-ai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT=YOUR_PROJECT_ID,GCP_LOCATION=us-central1
```

#### Step 2: Get Backend URL

```bash
BACKEND_URL=$(gcloud run services describe vertex-ai-backend \
  --format="value(status.url)" --region=us-central1)
echo "Backend URL: $BACKEND_URL"
```

#### Step 3: Deploy Frontend

```bash
# Return to repository root
cd ..

# Create .env file with backend URL
echo "VITE_BACKEND_URL=$BACKEND_URL" > .env

# Build and deploy frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/furallies-frontend
gcloud run deploy furallies-frontend \
  --image gcr.io/YOUR_PROJECT_ID/furallies-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Important Notes

1. **Separate Services**: Cloud Run requires frontend and backend to be deployed as separate services, even though they can be in the same Git repository.

2. **Environment Configuration**: The frontend needs to know the backend URL after deployment. This is handled automatically in the cloudbuild.yaml approach.

3. **Service Accounts**: Ensure your Cloud Run service has appropriate permissions:
   - The backend service needs Vertex AI User role
   - The deployment account needs Cloud Run Admin role

## Troubleshooting

### Frontend Cannot Connect to Backend

If your frontend shows connection errors:

1. Verify the backend URL in your deployed frontend:
   ```bash
   # Get the frontend URL
   FRONTEND_URL=$(gcloud run services describe furallies-frontend \
     --format="value(status.url)" --region=us-central1)
   
   # Check the deployed environment
   curl $FRONTEND_URL/.env || echo "Environment file not accessible"
   ```

2. You may need to redeploy the frontend with the correct backend URL

### Backend Authentication Issues

If your backend shows authentication errors when accessing Vertex AI:

1. Verify the service account has the correct permissions
2. Check that the Vertex AI API is enabled in your project
3. Verify environment variables are correctly set

## Monitoring

Monitor both services through Google Cloud Console:
- Cloud Run > Services > furallies-frontend > Logs
- Cloud Run > Services > vertex-ai-backend > Logs
