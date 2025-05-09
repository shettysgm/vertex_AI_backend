
/**
 * Backend Server for Vertex AI Integration
 * 
 * This Node.js Express server proxies requests to Vertex AI
 * It handles the authentication with Google Cloud and forwards requests.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(express.json());

// Google Cloud project configuration
const PROJECT_ID = process.env.GCP_PROJECT || 'apt-gear-425423-i9';
const LOCATION = process.env.GCP_LOCATION || 'us-central1';

// Create Google auth client
// This uses Application Default Credentials (ADC) when deployed to Google Cloud
// See: https://cloud.google.com/docs/authentication/application-default-credentials
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    project: PROJECT_ID,
    location: LOCATION
  });
});

// Proxy endpoint for Vertex AI
app.post('/vertex-ai', async (req, res) => {
  try {
    const { inputText, config, safety, stream, model } = req.body;
    
    if (!inputText) {
      return res.status(400).json({ error: 'Input text is required' });
    }
    
    // Validate model
    if (!model) {
      return res.status(400).json({ error: 'Model name is required' });
    }
    
    // Construct the Vertex AI endpoint
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:${stream ? 'streamGenerateContent' : 'generateContent'}`;
    
    console.log(`Making request to Vertex AI: ${endpoint}`);
    console.log(`Using model: ${model}, stream: ${stream}`);
    
    // Get auth client and token
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    if (!token || !token.token) {
      console.error('Failed to obtain authentication token');
      return res.status(500).json({ error: 'Authentication failed' });
    }
    
    // Create the request body for Vertex AI with the CORRECT format
    // For newer models like gemini-1.5-pro, we need to structure it differently
    const requestBody = {
      contents: [
        {
          role: "user",  // Using the valid 'user' role as specified in the error
          parts: [
            { 
              text: inputText 
            }
          ]
        }
      ]
    };
    
    // Add generation config if provided
    if (config && Object.keys(config).length > 0) {
      requestBody.generationConfig = config;
    }
    
    // Add safety settings if provided
    if (safety && safety.length > 0) {
      requestBody.safetySettings = safety;
    }
    
    console.log('Sending request to Vertex AI with body:', JSON.stringify(requestBody));
    
    // Make request to Vertex AI
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { rawError: errorText };
      }
      
      console.error('Vertex AI error:', errorData);
      return res.status(response.status).json({
        error: `Vertex AI Error: ${errorData.error?.message || response.status}`,
        details: errorData
      });
    }
    
    // For streaming responses, pipe the response directly
    if (stream) {
      // Set appropriate headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Forward the streaming response
      response.body.pipe(res);
      return;
    }
    
    // For regular responses, forward the JSON data
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Error processing Vertex AI request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Log request information
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Project: ${PROJECT_ID}, Location: ${LOCATION}`);
});
