
# Furallies AI Assistant

An AI-powered assistant for dog owners that provides personalized advice based on their dog's characteristics and behavior.

## Features

- Analysis of dog behavior based on breed, location, and personality
- Emotional state assessment
- Integration with both Google's Gemini API and Vertex AI
- Personalized recommendations for dog care

## Setup Instructions

### Local Development

1. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key to `.env` (`VITE_GEMINI_API_KEY`)

2. **Start the backend (for Vertex AI)**:
   ```bash
   cd backend
   npm install
   node server.js
   ```

3. **Start the frontend**:
   ```bash
   npm install
   npm run dev
   ```

4. **Test backend connectivity**:
   ```bash
   ./check-backend.sh
   ```

### Cloud Run Deployment

1. **Install Google Cloud CLI** if you haven't already:
   ```bash
   # For macOS
   brew install --cask google-cloud-sdk
   # For other platforms, see: https://cloud.google.com/sdk/docs/install
   ```

2. **Login to Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Deploy both services using the script**:
   ```bash
   ./deploy-to-cloud-run.sh
   ```

   This script will:
   - Deploy the backend to Cloud Run
   - Capture the backend URL
   - Update the frontend environment with the backend URL
   - Deploy the frontend to Cloud Run

## Switching Between Gemini API and Vertex AI

In the application, use the toggle in the settings panel to switch between:

- **Gemini API**: Uses your API key directly from the frontend (simpler)
- **Vertex AI**: Uses the backend proxy to access Vertex AI (more powerful models)

## Troubleshooting

- If you see "Backend Offline" message, check that:
  - Your backend server is running (for local development)
  - The VITE_BACKEND_URL in .env is correct 
  - Run `./check-backend.sh` to diagnose connection issues
