// API Configuration for Development and Production
// This file automatically detects the environment and sets the correct API base URL

(function() {
  'use strict';
  
  // Detect if we're running on localhost (development) or deployed (production)
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
  
  // Set API base URL based on environment
  // IMPORTANT: Replace 'YOUR_BACKEND_URL' with your actual deployed backend URL
  // Examples: 
  // - Heroku: 'https://your-app-name.herokuapp.com'
  // - Render: 'https://your-app-name.onrender.com'
  // - Railway: 'https://your-app-name.railway.app'
  // - Vercel: 'https://your-app-name.vercel.app'
  const API_BASE_URL = isDevelopment 
    ? 'http://localhost:3000'  // Development: local backend
    : 'https://mainproject-8bhf.onrender.com';  // Production: deployed backend
  
  // Export configuration
  window.API_CONFIG = {
    BASE_URL: API_BASE_URL,
    API_URL: `${API_BASE_URL}/api`,
    // Individual endpoints
    LOGIN: `${API_BASE_URL}/api/login`,
    SIGNUP: `${API_BASE_URL}/api/signup`,
    PROFILE: `${API_BASE_URL}/api/profile`,
    LOGOUT: `${API_BASE_URL}/api/logout`,
    CHECK_DUPLICATES: `${API_BASE_URL}/api/check-duplicates`,
    GEMINI_GENERATE: `${API_BASE_URL}/api/gemini-generate`,
    AI_GENERATE: `${API_BASE_URL}/api/ai-generate`,
    CHAT_SESSIONS: `${API_BASE_URL}/api/chat-sessions`,
    CHAT_HISTORY: `${API_BASE_URL}/api/chat-history`,
    GENERATE_QUESTIONS: `${API_BASE_URL}/api/generate-questions`,
    RESUME_SCORE: `${API_BASE_URL}/api/resume-score`,
    MOCK_INTERVIEW_SCORE: `${API_BASE_URL}/api/mock-interview-score`,
    MOCK_INTERVIEW_SCORES: `${API_BASE_URL}/api/mock-interview-scores`,
    // Other service URLs (for local development)
    MOCK_INTERVIEW_URL: isDevelopment ? 'http://localhost:5000' : null,
    RESUME_ANALYZER_URL: isDevelopment ? 'http://localhost:9002' : null,
    isDevelopment: isDevelopment
  };
  
  console.log('API Configuration loaded:', {
    environment: isDevelopment ? 'Development' : 'Production',
    baseURL: API_BASE_URL
  });
})();

