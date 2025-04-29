
# Vertex AI Backend Deployment Guide

This guide will walk you through deploying the Vertex AI backend proxy service to Google Cloud Run.

## Prerequisites

1. Google Cloud account with billing enabled
2. Google Cloud SDK installed locally (or use Cloud Shell)
3. Vertex AI API enabled in your Google Cloud project
4. Node.js and npm installed on your development machine

## Step 1: Create the Backend Server

1. Create a new directory for your backend project:
   ```bash
   mkdir vertex-ai-backend
   cd vertex-ai-backend
   ```

2. Initialize a new Node.js project:
   ```bash
   npm init -y
   ```

3. Install required dependencies:
   ```bash
   npm install express cors google-auth-library dotenv
   ```

4. Create a `server.js` file by copying the example provided:
   ```bash
   # Copy the example server.js file to your project
   cp /path/to/your/frontend/backend/server.js.example ./server.js
   ```

## Step 2: Set Up Google Cloud Service Account

1. In the Google Cloud Console, navigate to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name your service account (e.g., "vertex-ai-proxy")
4. Grant the following roles:
   - "Vertex AI User"
   - "Vertex AI Service Agent"
5. Create and download the JSON key file
6. Store the key file securely (do not commit to version control)

## Step 3: Create a .env File

Create a `.env` file in your backend project:

```
GCP_PROJECT=apt-gear-425423-i9
GCP_LOCATION=us-central1
PORT=8080
```

## Step 4: Modify server.js File

Make sure your server.js file loads environment variables:

```javascript
// Add this at the top of your server.js file
require('dotenv').config();
```

## Step 5: Deploy to Cloud Run

### Option 1: Deploy with Dockerfile

1. Create a `Dockerfile` in your backend project:

```dockerfile
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["node", "server.js"]
```

2. Create a `.dockerignore` file:
```
node_modules
.env
.git
*.md
```

3. Build and deploy with Cloud Run:
```bash
# Build the container
gcloud builds submit --tag gcr.io/apt-gear-425423-i9/vertex-ai-backend

# Deploy to Cloud Run
gcloud run deploy vertex-ai-backend \
  --image gcr.io/apt-gear-425423-i9/vertex-ai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT=apt-gear-425423-i9,GCP_LOCATION=us-central1
```

### Option 2: Deploy directly from source

```bash
gcloud run deploy vertex-ai-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT=apt-gear-425423-i9,GCP_LOCATION=us-central1
```

## Step 6: Update Frontend Configuration

Once deployed, Cloud Run will provide you with a service URL. Copy this URL and update your frontend `.env` file:

```
VITE_BACKEND_URL=https://vertex-ai-backend-abcd1234.run.app
```

## Step 7: Verify Deployment

Test your backend deployment by making a request to the health endpoint:

```bash
curl https://your-cloud-run-url.run.app/health
```

You should get a response like:
```json
{"status":"ok"}
```

## Service Account Authentication in Cloud Run

When deploying to Cloud Run, you have two options for handling Google Cloud authentication:

### Option 1: Use the default service account

By default, Cloud Run will use the default compute service account. You need to ensure this account has the necessary Vertex AI permissions:

1. Go to IAM & Admin > IAM
2. Find the compute service account (usually ends with @developer.gserviceaccount.com)
3. Add the "Vertex AI User" role

### Option 2: Use a specific service account

You can specify a custom service account when deploying:

```bash
gcloud run deploy vertex-ai-backend \
  --image gcr.io/apt-gear-425423-i9/vertex-ai-backend \
  --platform managed \
  --region us-central1 \
  --service-account=vertex-ai-proxy@apt-gear-425423-i9.iam.gserviceaccount.com \
  --allow-unauthenticated
```

## Troubleshooting

### 1. Authentication Issues

If you see authentication errors in your Cloud Run logs:
- Verify the service account has the correct permissions
- Check that you've enabled the Vertex AI API in your project

### 2. CORS Issues

If your frontend can't connect to the backend:
- Verify your CORS configuration in server.js
- Check that the frontend is sending requests to the correct URL

### 3. Request Timeout

If requests are timing out:
- Increase the Cloud Run instance timeout setting
- Consider optimizing your proxy logic for faster responses

### 4. Monitoring and Logs

- View logs in Google Cloud Console under Cloud Run > Services > vertex-ai-backend > Logs
- Set up alerts for error conditions or high latency

## Next Steps

- Add authentication between your frontend and backend
- Implement rate limiting to control costs
- Add caching to improve performance
- Set up monitoring and alerting
