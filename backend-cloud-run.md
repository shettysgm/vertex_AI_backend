
# Backend Cloud Run Deployment Guide

This guide outlines the steps to deploy the backend application to Google Cloud Run.

## Prerequisites

1. Google Cloud SDK installed
2. Docker installed
3. Access to Google Cloud Registry or Artifact Registry
4. Vertex AI API enabled in your Google Cloud project

## Step 1: Build and Deploy

Deploy using Cloud Build:
```bash
gcloud builds submit --config cloudbuild.yaml
```

Alternatively, you can deploy manually:

```bash
# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/vertex-ai-backend .
docker push gcr.io/YOUR_PROJECT_ID/vertex-ai-backend

# Deploy to Cloud Run
gcloud run deploy vertex-ai-backend \
  --image gcr.io/YOUR_PROJECT_ID/vertex-ai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT=YOUR_PROJECT_ID,GCP_LOCATION=us-central1
```

## Step 2: Get the Backend URL

After deployment, get the service URL:
```bash
gcloud run services describe vertex-ai-backend --format="value(status.url)" --region=us-central1
```

Save this URL to use in the frontend configuration.

## Environment Variables

The backend service requires these environment variables:
- `GCP_PROJECT`: Your Google Cloud project ID
- `GCP_LOCATION`: The region for Vertex AI (e.g., us-central1)
- `PORT`: Set to 8080 for Cloud Run

## Service Account Configuration

Ensure your Cloud Run service has the appropriate service account with these roles:
- Vertex AI User
- Cloud Run Admin (for deployment)

## Troubleshooting

### Authentication Issues
If you see authentication errors in your Cloud Run logs:
- Verify the service account has the correct permissions
- Check that you've enabled the Vertex AI API in your project

### Monitoring Logs
View logs in Google Cloud Console under Cloud Run > Services > vertex-ai-backend > Logs
