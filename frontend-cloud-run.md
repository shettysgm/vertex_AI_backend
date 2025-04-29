
# Frontend Cloud Run Deployment Guide

This guide outlines the steps to deploy the frontend application to Google Cloud Run.

## Prerequisites

1. Google Cloud SDK installed
2. Docker installed
3. Access to Google Cloud Registry or Artifact Registry
4. Backend already deployed to Cloud Run

## Step 1: Build and Deploy

1. Set the backend URL in your `.env` file:
```
VITE_BACKEND_URL=https://vertex-ai-backend-xxxx.run.app
```

2. Deploy using Cloud Build:
```bash
gcloud builds submit --config cloudbuild.yaml
```

Alternatively, you can deploy manually:

```bash
# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/furallies-frontend .
docker push gcr.io/YOUR_PROJECT_ID/furallies-frontend

# Deploy to Cloud Run
gcloud run deploy furallies-frontend \
  --image gcr.io/YOUR_PROJECT_ID/furallies-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Step 2: Verify Deployment

1. Access your deployed application at the URL provided by Cloud Run
2. Verify that the frontend can communicate with the backend

## Environment Variables

The frontend requires:
- `VITE_BACKEND_URL`: The URL of your deployed backend service

## Troubleshooting

### CORS Issues
If you encounter CORS issues:
1. Verify the backend allows requests from the frontend domain
2. Check for any network errors in the browser console

### Connection Errors
If the frontend cannot connect to the backend:
1. Ensure the backend URL is correct in the `.env` file
2. Verify the backend is running and accessible
