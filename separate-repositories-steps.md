
# Repository Separation Steps

## 1. Create New Repositories
1. Create `furallies-frontend` repository on GitHub
2. Create `vertex-ai-backend` repository on GitHub

## 2. Frontend Repository Setup
Create and copy these files to `furallies-frontend`:

```bash
# Core configuration files
cp vite.config.ts package.json tsconfig.json postcss.config.js \
   tailwind.config.ts components.json nginx.conf index.html \
   .gitignore ./furallies-frontend/

# Source files
cp -r src ./furallies-frontend/
cp -r public ./furallies-frontend/

# Environment files
cp .env* ./furallies-frontend/
```

## 3. Backend Repository Setup
Create and copy these files to `vertex-ai-backend`:

```bash
# Backend files
cp -r backend/* ./vertex-ai-backend/
cp backend/.dockerignore ./vertex-ai-backend/
cp backend/.gitignore ./vertex-ai-backend/

# Environment example
cp backend/server.env.example ./vertex-ai-backend/.env.example
```

## 4. Update Frontend Configuration

1. In the frontend repository, update `.env`:
```env
VITE_BACKEND_URL=https://vertex-ai-backend-xxxx.run.app
```

2. Remove any backend-related files from the frontend repository:
```bash
rm -rf backend/
```

## 5. Initialize Git and Push

### Frontend:
```bash
cd furallies-frontend
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/yourusername/furallies-frontend.git
git push -u origin main
```

### Backend:
```bash
cd vertex-ai-backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/yourusername/vertex-ai-backend.git
git push -u origin main
```

## 6. Deploy to Cloud Run

### Backend Deployment:
```bash
cd vertex-ai-backend
gcloud builds submit --config cloudbuild.yaml
```

After backend is deployed, get its URL:
```bash
BACKEND_URL=$(gcloud run services describe vertex-ai-backend \
  --format="value(status.url)" --region=us-central1)
```

### Frontend Deployment:
```bash
cd ../furallies-frontend

# Update .env with backend URL
echo "VITE_BACKEND_URL=$BACKEND_URL" > .env

# Deploy
gcloud builds submit --config cloudbuild.yaml
```

## 7. Verify Deployment

1. Test backend health endpoint:
```bash
curl $BACKEND_URL/health
```

2. Access frontend URL and verify it can communicate with backend using the Backend Status Indicator component.

## Common Issues

1. CORS errors:
   - Check backend CORS configuration in server.js
   - Verify frontend is using correct backend URL

2. Environment variables:
   - Ensure all required env vars are set in Cloud Run
   - Check frontend .env has correct backend URL

3. Authentication:
   - Verify service account permissions for Vertex AI
   - Check Google Cloud APIs are enabled
