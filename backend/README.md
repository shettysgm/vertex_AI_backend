
# Vertex AI Backend Service

This repository contains the backend service for Vertex AI integration with proper authentication.

## Architecture Overview

This is a standalone backend service that:
1. Authenticates with Google Cloud using service account credentials
2. Proxies requests to Vertex AI APIs
3. Streams responses back to the client application

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Google Cloud credentials

Option A: For local development
- Create a service account with Vertex AI access
- Download the JSON key file
- Set the environment variable: `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-key.json`

Option B: For Cloud Run deployment
- The service will use the Cloud Run service account automatically
- Ensure the service account has the necessary permissions (Vertex AI User role)

### 3. Configure environment variables

Copy the `.env.example` file to `.env` and update with your configuration:
```
GCP_PROJECT=your-project-id
GCP_LOCATION=us-central1
PORT=8080
```

### 4. Run the server locally

```bash
npm start
```

## Deployment to Cloud Run

```bash
gcloud run deploy vertex-ai-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

After deployment, update your frontend `.env` file with your Cloud Run service URL:
```
VITE_BACKEND_URL=https://your-cloud-run-url.run.app
```

## API Documentation

### Health Check
- `GET /health`
- Returns status information about the backend

### Vertex AI Proxy
- `POST /vertex-ai`
- Forwards requests to Vertex AI with proper authentication
- Request body should include:
  - `inputText`: The text to process
  - `config`: Generation configuration
  - `safety`: Safety settings
  - `stream`: Whether to stream the response
  - `model`: The Gemini model to use
