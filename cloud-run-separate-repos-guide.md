
# Separating Frontend and Backend for Cloud Run

This guide provides step-by-step instructions for separating your frontend and backend code into distinct repositories for easier Cloud Run deployment.

## Why Separate Repositories for Cloud Run?

Cloud Run works best with focused, single-purpose services. While you can deploy from a monorepo, separate repositories offer:

- Simpler deployment process through Cloud Run's direct GitHub integration
- Cleaner CI/CD pipeline configuration
- Independent versioning and release cycles
- Easier team collaboration with separate codebases

## Step 1: Create Two New Repositories

1. Create a new GitHub repository for your frontend (e.g., `furallies-frontend`)
2. Create a new GitHub repository for your backend (e.g., `vertex-ai-backend`)

## Step 2: Set Up the Frontend Repository

1. Clone your new frontend repository:
```bash
git clone https://github.com/yourusername/furallies-frontend.git
cd furallies-frontend
```

2. Copy your frontend files from the original project:
```bash
# Copy essential frontend files
cp -r /path/to/original/src .
cp -r /path/to/original/public .
cp /path/to/original/index.html .
cp /path/to/original/vite.config.ts .
cp /path/to/original/tsconfig*.json .
cp /path/to/original/tailwind.config.ts .
cp /path/to/original/postcss.config.js .
cp /path/to/original/.env* .
cp /path/to/original/components.json .
cp /path/to/original/Dockerfile .
cp /path/to/original/nginx.conf .
```

3. Create a package.json file if not copied:
```bash
npm init -y
```

4. Add required dependencies:
```bash
npm install react react-dom @tanstack/react-query
# Add all other dependencies based on your original package.json
```

5. Create a simplified cloudbuild.yaml:
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/furallies-frontend', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/furallies-frontend']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'furallies-frontend'
      - '--image=gcr.io/$PROJECT_ID/furallies-frontend'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      
images:
  - 'gcr.io/$PROJECT_ID/furallies-frontend'
```

6. Commit and push:
```bash
git add .
git commit -m "Initial frontend setup"
git push origin main
```

## Step 3: Set Up the Backend Repository

1. Clone your new backend repository:
```bash
git clone https://github.com/yourusername/vertex-ai-backend.git
cd vertex-ai-backend
```

2. Copy your backend files:
```bash
cp -r /path/to/original/backend/* .
cp /path/to/original/backend/.dockerignore .
```

3. Create a simplified cloudbuild.yaml:
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/vertex-ai-backend', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/vertex-ai-backend']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'vertex-ai-backend'
      - '--image=gcr.io/$PROJECT_ID/vertex-ai-backend'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--set-env-vars=GCP_PROJECT=$PROJECT_ID,GCP_LOCATION=us-central1'
      
images:
  - 'gcr.io/$PROJECT_ID/vertex-ai-backend'
```

4. Commit and push:
```bash
git add .
git commit -m "Initial backend setup"
git push origin main
```

## Step 4: Deploy to Cloud Run

### Backend Deployment:

1. Navigate to Cloud Run in your Google Cloud Console
2. Click "Create Service"
3. Select "Continuously deploy from a repository"
4. Connect your backend repository
5. Configure the build:
   - Branch: main
   - Build Type: Dockerfile
   - Source Location: / (root directory)
6. Configure the service:
   - Service name: vertex-ai-backend
   - Region: us-central1
   - Authentication: Allow unauthenticated invocations
7. Set environment variables:
   - GCP_PROJECT: your-project-id
   - GCP_LOCATION: us-central1

### Frontend Deployment:

1. After deploying the backend, get the backend URL:
```bash
gcloud run services describe vertex-ai-backend --format="value(status.url)" --region=us-central1
```

2. Navigate to Cloud Run in your Google Cloud Console
3. Click "Create Service"
4. Select "Continuously deploy from a repository"
5. Connect your frontend repository
6. Configure the build:
   - Branch: main
   - Build Type: Dockerfile
   - Source Location: / (root directory)
7. Configure the service:
   - Service name: furallies-frontend
   - Region: us-central1
   - Authentication: Allow unauthenticated invocations
8. Set environment variables:
   - VITE_BACKEND_URL: https://vertex-ai-backend-xxxx.run.app (from step 1)

## Step 5: Verify the Connection

1. Access your frontend service URL
2. Verify it can communicate with the backend service
3. Check Cloud Run logs for both services to detect any issues

## Troubleshooting

### Environment Variables
Make sure your frontend's `.env` file or environment variables include the correct backend URL:
```
VITE_BACKEND_URL=https://vertex-ai-backend-xxxx.run.app
```

### CORS Issues
If you encounter CORS issues, verify your backend server.js includes proper CORS setup:
```javascript
app.use(cors());
```

### Connection Timeouts
Ensure the backend service is properly deployed and accessible. Check Cloud Run logs for any errors.
