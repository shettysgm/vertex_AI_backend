
# Splitting Frontend and Backend into Separate Repositories

This guide will walk you through the process of splitting your monorepo into separate frontend and backend repositories.

## Prerequisites

- Git installed on your machine
- GitHub account or other Git hosting service
- Access to create new repositories

## Step 1: Prepare Your Local Environment

1. Clone your existing repository (if you haven't already):
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2. Create new directories for the separated repositories:
```bash
mkdir ../furallies-frontend
mkdir ../furallies-backend
```

## Step 2: Extract Backend Files

1. Copy backend files to the new backend repository:
```bash
cp -r backend/* ../furallies-backend/
cp backend/.dockerignore ../furallies-backend/
cp backend/.gitignore ../furallies-backend/ 2>/dev/null || cp .gitignore ../furallies-backend/
```

2. Create a README.md for the backend repository:
```bash
echo "# FurAllies Backend

This is the backend service for the FurAllies application, providing Vertex AI integration.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables by copying the example:
\`\`\`bash
cp server.env.example .env
\`\`\`

3. Run the development server:
\`\`\`bash
node server.js
\`\`\`

## Deployment

See \`deployment-guide.md\` for instructions on deploying to Google Cloud Run.
" > ../furallies-backend/README.md
```

3. Initialize git in the backend repository:
```bash
cd ../furallies-backend
git init
git add .
git commit -m "Initial commit: Extract backend from monorepo"
```

## Step 3: Extract Frontend Files

1. Copy frontend files to the new frontend repository:
```bash
cd ../your-repo
cp -r src ../furallies-frontend/
cp -r public ../furallies-frontend/
cp .env* ../furallies-frontend/ 2>/dev/null
cp vite.config.ts ../furallies-frontend/
cp tsconfig*.json ../furallies-frontend/
cp tailwind.config.ts ../furallies-frontend/
cp postcss.config.js ../furallies-frontend/
cp nginx.conf ../furallies-frontend/
cp index.html ../furallies-frontend/
cp Dockerfile ../furallies-frontend/
cp components.json ../furallies-frontend/
cp .gitignore ../furallies-frontend/
```

2. Create a README.md for the frontend repository:
```bash
echo "# FurAllies Frontend

This is the frontend application for FurAllies, a pet emotion analysis tool powered by Vertex AI.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables by copying the example:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Update the \`.env\` file with your backend URL:
\`\`\`
VITE_BACKEND_URL=http://localhost:8080
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## Deployment

See \`cloud-run-deployment.md\` for instructions on deploying to Google Cloud Run.
" > ../furallies-frontend/README.md
```

3. Create a package.json for the frontend:
```bash
cd ../furallies-frontend
cp ../your-repo/package.json .
```

4. Initialize git in the frontend repository:
```bash
git init
git add .
git commit -m "Initial commit: Extract frontend from monorepo"
```

## Step 4: Update Deployment Files

1. Create a separate cloudbuild.yaml for the frontend:

```bash
echo "steps:
  # Build and deploy frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/\$PROJECT_ID/furallies-frontend', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/\$PROJECT_ID/furallies-frontend']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'furallies-frontend'
      - '--image=gcr.io/\$PROJECT_ID/furallies-frontend'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      
images:
  - 'gcr.io/\$PROJECT_ID/furallies-frontend'" > cloudbuild.yaml
```

2. Create a separate cloudbuild.yaml for the backend:
```bash
cd ../furallies-backend
echo "steps:
  # Build and deploy backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/\$PROJECT_ID/vertex-ai-backend', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/\$PROJECT_ID/vertex-ai-backend']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'vertex-ai-backend'
      - '--image=gcr.io/\$PROJECT_ID/vertex-ai-backend'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      
images:
  - 'gcr.io/\$PROJECT_ID/vertex-ai-backend'" > cloudbuild.yaml
```

## Step 5: Push to Remote Repositories

1. Create new repositories on GitHub (or your preferred Git hosting service)
2. Add the remote origin to each local repository:

Frontend:
```bash
cd ../furallies-frontend
git remote add origin https://github.com/your-username/furallies-frontend.git
git push -u origin main
```

Backend:
```bash
cd ../furallies-backend
git remote add origin https://github.com/your-username/furallies-backend.git
git push -u origin main
```

## Step 6: Set Up CI/CD for Each Repository

1. Configure GitHub Actions or Google Cloud Build triggers for each repository
2. Set up required secrets for deployment (e.g., GCP service account keys)

## Notes on Connecting Frontend to Backend

After splitting the repositories, you'll need to:

1. Deploy the backend first
2. Get the backend URL from Cloud Run
3. Update the frontend's `.env` file with the backend URL before deploying:
```
VITE_BACKEND_URL=https://vertex-ai-backend-xxxx.run.app
```

## Cleanup

Once you've successfully migrated to separate repositories, you can archive or delete the original monorepo.
