const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-XSS-Protection');
  res.removeHeader('Pragma');
  res.removeHeader('Expires');
  // Prefer Cache-Control
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  // CORS headers for all responses
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || isLocalhostOrigin(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

// Allow multiple origins for CORS
const allowedOrigins = [
  'http://localhost',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:9002',
];

// Allow all localhost ports for development
function isLocalhostOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.hostname === 'localhost';
  } catch {
    return false;
  }
}

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || isLocalhostOrigin(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB (Compass/local)
mongoose.connect('mongodb://localhost:27017/interviewprep')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// User schema
const UserSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  usertype: String,
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true },
  password: String,
  // Deterministic password fingerprint to prevent duplicate passwords across accounts
  passwordFingerprint: { type: String, unique: true, sparse: true },
  location: String,
  careerGoal: String,
  preferredTechnologies: [String]
});
const User = mongoose.model('User', UserSchema);

// Resume Score schema
const ResumeScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: Number,
  timestamp: { type: Date, default: Date.now }
});
const ResumeScore = mongoose.model('ResumeScore', ResumeScoreSchema);
// Store resume score (called from resume analyzer)
app.post('/api/resume-score', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const { score, timestamp } = req.body;
  if (typeof score !== 'number') {
    return res.status(400).json({ success: false, message: 'Score must be a number' });
  }
  try {
    // Save with userId
    const entry = new ResumeScore({ userId: req.session.userId, score, timestamp: timestamp ? new Date(timestamp) : new Date() });
    await entry.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to save score' });
  }
});

// Get all resume scores for logged-in user
app.get('/api/resume-score', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const scores = await ResumeScore.find({ userId: req.session.userId }).sort({ timestamp: -1 });
    res.json({ success: true, scores });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch scores' });
  }
});

// Sign Up
app.post('/api/signup', async (req, res) => {
  const { username, fullName, usertype, phone, email, password, location, careerGoal, preferredTechnologies } = req.body;

  // Server-side validation: standard email format and password complexity
  const rawEmail = String(email || '').trim();
  const parts = rawEmail.split('@');
  const normalizedEmail = parts.length === 2 ? `${parts[0]}@${parts[1].toLowerCase()}` : rawEmail;
  // Restrict to Gmail only to mirror frontend
  const isValidEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(normalizedEmail);
  if (!isValidEmail) {
    return res.status(400).json({ success: false, message: 'Only Gmail addresses are allowed (e.g., name@gmail.com).' });
  }
  // Normalize phone: digits only
  const normalizedPhone = String(phone || '').replace(/\D/g, '');
  if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
    return res.status(400).json({ success: false, message: 'Phone must be exactly 10 digits.' });
  }
  const pwd = String(password || '');
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const hasMinLen = pwd.length >= 8;
  if (!(hasLower && hasUpper && hasNumber && hasSpecial && hasMinLen)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 chars and include uppercase, lowercase, number, and special character' });
  }

  const hashed = await bcrypt.hash(pwd, 10);
  // Compute deterministic fingerprint for duplicate password detection (not a replacement for hashing)
  const passwordFingerprint = crypto.createHash('sha256').update(pwd, 'utf8').digest('hex');
  try {
    // Uniqueness checks (email exact, phone tolerant of formatting)
    const existingByEmail = await User.findOne({ email: normalizedEmail });
    if (existingByEmail) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    if (normalizedPhone) {
      // Exact match on normalized digits (we store digits-only)
      const existingByPhone = await User.findOne({ phone: normalizedPhone });
      if (existingByPhone) {
        return res.status(409).json({ success: false, message: 'Phone already exists' });
      }
    }
    // Check for existing password via fingerprint (fast path)
    let existingByPassword = await User.findOne({ passwordFingerprint });
    if (!existingByPassword) {
      // Slow-path migration for legacy users without fingerprint
      // Try to find any user with missing fingerprint whose bcrypt-hash matches this password
      // We limit the scan to reduce load
      const candidates = await User.find({ passwordFingerprint: { $exists: false } }).select('password').limit(1000);
      for (const cand of candidates) {
        try {
          if (cand && typeof cand.password === 'string' && await bcrypt.compare(pwd, cand.password)) {
            existingByPassword = cand;
            // Backfill the fingerprint for this user
            await User.updateOne({ _id: cand._id }, { $set: { passwordFingerprint } });
            break;
          }
        } catch (_) {}
      }
    }
    if (existingByPassword) {
      return res.status(409).json({ success: false, message: 'Password already exists' });
    }

    const user = new User({ 
      username, 
      fullName, 
      usertype, 
      phone: normalizedPhone, 
      email: normalizedEmail, 
      password: hashed, 
      passwordFingerprint, 
      location, 
      careerGoal, 
      preferredTechnologies 
    });
    await user.save();
    req.session.userId = user._id;
    res.json({ success: true });
  } catch (e) {
    // Fallback for unexpected duplicate errors
    if (e && e.code === 11000) {
      if (e.keyPattern && e.keyPattern.email) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
      if (e.keyPattern && e.keyPattern.phone) {
        return res.status(409).json({ success: false, message: 'Phone already exists' });
      }
      if (e.keyPattern && e.keyPattern.passwordFingerprint) {
        return res.status(409).json({ success: false, message: 'Password already exists' });
      }
    }
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// Duplicate check endpoint for signup pre-validation
app.post('/api/check-duplicates', async (req, res) => {
  try {
    const phoneRaw = String((req.body && req.body.phone) || '').replace(/\D/g, '');
    const pwd = String((req.body && req.body.password) || '');
    const result = { phoneExists: false, passwordExists: false };

    // Phone check (only if provided)
    if (phoneRaw) {
      const byPhone = await User.findOne({ phone: phoneRaw }).select('_id');
      result.phoneExists = !!byPhone;
    }

    // Password check (fingerprint + legacy backfill probe)
    if (pwd) {
      const fingerprint = crypto.createHash('sha256').update(pwd, 'utf8').digest('hex');
      let byPwd = await User.findOne({ passwordFingerprint: fingerprint }).select('_id');
      if (!byPwd) {
        const candidates = await User.find({ passwordFingerprint: { $exists: false } }).select('password').limit(1000);
        for (const cand of candidates) {
          try {
            if (cand && typeof cand.password === 'string' && await bcrypt.compare(pwd, cand.password)) {
              byPwd = cand;
              break;
            }
          } catch (_) {}
        }
      }
      result.passwordExists = !!byPwd;
    }

    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Duplicate check failed' });
  }
});

// Log In
app.post('/api/login', async (req, res) => {
  console.log('LOGIN ATTEMPT:', req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
  console.log('LOGIN SUCCESS: userId', user._id);
    req.session.userId = user._id;
    // Exclude password from returned user object
    const { password, ...userData } = user.toObject();
    res.json({ success: true, user: userData });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get User Profile
app.get('/api/profile', async (req, res) => {
  console.log('PROFILE REQUEST: session.userId =', req.session.userId);
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error logging out' });
    }
    res.json({ success: true });
  });
});

// Chat models
const ChatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ChatMessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' },
  role: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);
const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

// Chat endpoints used by frontend
app.get('/api/chat-sessions', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const sessions = await ChatSession.find({ userId: req.session.userId }).sort({ updatedAt: -1 });
    res.json({ success: true, sessions });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

app.post('/api/chat-sessions', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const title = (req.body && req.body.title) || 'New chat';
    const session = await ChatSession.create({ userId: req.session.userId, title });
    res.json({ success: true, session });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

app.get('/api/chat-history', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ success: false, message: 'sessionId required' });
    const sessionDoc = await ChatSession.findOne({ _id: sessionId, userId: req.session.userId });
    if (!sessionDoc) return res.status(404).json({ success: false, message: 'Session not found' });
    const messages = await ChatMessage.find({ sessionId }).sort({ timestamp: 1 });
    res.json({ success: true, messages });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

app.post('/api/chat-history', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const { sessionId, role, text, timestamp } = req.body || {};
    if (!sessionId || !role || !text) {
      return res.status(400).json({ success: false, message: 'sessionId, role and text are required' });
    }
    const sessionDoc = await ChatSession.findOne({ _id: sessionId, userId: req.session.userId });
    if (!sessionDoc) return res.status(404).json({ success: false, message: 'Session not found' });
    const msg = await ChatMessage.create({ sessionId, role, text, timestamp: timestamp ? new Date(timestamp) : new Date() });
    await ChatSession.updateOne({ _id: sessionId }, { $set: { updatedAt: new Date() } });
    res.json({ success: true, message: msg });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to save message' });
  }
});

// Passthrough for Gemini generateContent to avoid exposing API key in browser
app.post('/api/gemini-generate', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await callGeminiWithFallback(payload);
    if (!result.ok) {
      // Graceful soft-success so frontend shows a reply instead of error toast
      const fallbackText = result.error || 'Unable to reach Gemini right now. Please try again in a moment.';
      return res.status(200).json({ candidates: [{ content: { parts: [{ text: fallbackText }] } }] });
    }
    return res.status(200).json(result.data);
  } catch (e) {
    res.status(500).json({ success: false, error: 'AI gateway error' });
  }
});

// Alias endpoint for flexibility on the frontend
app.post('/api/ai-generate', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await callGeminiWithFallback(payload);
    if (!result.ok) {
      const fallbackText = result.error || 'Unable to reach Gemini right now. Please try again later.';
      return res.status(200).json({ candidates: [{ content: { parts: [{ text: fallbackText }] } }] });
    }
    return res.status(200).json(result.data);
  } catch (e) {
    res.status(500).json({ success: false, error: 'AI gateway error' });
  }
});

// Internal helper to call Gemini models with graceful fallback across model ids / API versions
async function callGeminiWithFallback(payload) {
  const apiKey = AI_APIS.gemini.key;
  const headers = AI_APIS.gemini.headers;
  // 0) Try to discover a compatible model for this key via ListModels
  const preferred = [
    'gemini-2.5-flash', // <-- Use your preferred model first
    'gemini-2.5-pro',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-pro'
  ];
  let discovered = [];
  try {
    const lmResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const lmData = await lmResp.json();
    if (lmResp.ok && Array.isArray(lmData && lmData.models)) {
      const models = lmData.models.map(m => m && m.name ? String(m.name) : '').filter(Boolean);
      // models are like models/gemini-1.5-pro-latest → extract id
      const ids = models.map(n => n.replace(/^models\//, ''));
      // keep only those that include generateContent if provided
      const supports = (m) => {
        try {
          const rec = lmData.models.find(x => String(x.name).endsWith(m));
          if (!rec) return true; // if unknown, try anyway
          const methods = rec && Array.isArray(rec.supportedGenerationMethods) ? rec.supportedGenerationMethods : [];
          return methods.includes('generateContent');
        } catch (_) { return true; }
      };
      const ranked = preferred.concat(ids);
      discovered = ranked.filter((id, idx, arr) => arr.indexOf(id) === idx && ids.includes(id) && supports(id));
    }
  } catch (_) {}

  const endpoints = [];
  // Prefer v1beta for AI Studio keys
  discovered.forEach(id => {
    endpoints.push(`https://generativelanguage.googleapis.com/v1beta/models/${id}:generateContent`);
  });
  // Also try v1 for the same ids
  discovered.forEach(id => {
    endpoints.push(`https://generativelanguage.googleapis.com/v1/models/${id}:generateContent`);
  });
  // Fallback static list if discovery failed
  if (endpoints.length === 0) {
    ['gemini-1.5-pro-latest','gemini-1.5-flash-latest','gemini-1.5-pro','gemini-1.5-flash','gemini-pro'].forEach(id => {
      endpoints.push(`https://generativelanguage.googleapis.com/v1beta/models/${id}:generateContent`);
      endpoints.push(`https://generativelanguage.googleapis.com/v1/models/${id}:generateContent`);
    });
  }
  for (const url of endpoints) {
    try {
      const resp = await fetch(`${url}?key=${apiKey}`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await resp.json();
      if (resp.ok && data && data.candidates) return { ok: true, data };
      const message = (data && data.error && data.error.message) ? data.error.message : 'Gemini API error';
      // If NOT_FOUND or unsupported, try next endpoint; otherwise surface error
      if (resp.status === 404 || /not found|unsupported/i.test(message)) {
        continue;
      }
      return { ok: false, status: resp.status, error: message, raw: data };
    } catch (e) {
      // try next
    }
  }
  return { ok: false, status: 404, error: 'No compatible Gemini model found' };
}

// Lightweight GET endpoint for quick status tests in browser
app.get('/api/ai-generate', (req, res) => {
  res.json({ ok: true, method: 'GET', message: 'Use POST to generate responses at this endpoint.' });
});

// AI API Configuration
// AI API Configuration
const AI_APIS = {
  gemini: {
    name: 'Gemini',
    // CHANGE 1: Use the v1beta endpoint and your chosen model ID
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    // CHANGE 2: Keep your key. Note: It's safer to use process.env.GEMINI_API_KEY
    // but we'll use the hardcoded one for this single change.
    key: 'AIzaSyD1rHu4wfE9C8VrYrByZJI7nzSU4NAnIMY', 
    headers: { 'Content-Type': 'application/json' }
  }
};

// AI Question Generation Endpoint
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { type, careerGoal, technology, questionCount = 5, apiProvider = 'gemini' } = req.body;
    
    if (!type || !careerGoal || !technology) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const apiConfig = AI_APIS[apiProvider];
    if (!apiConfig) {
      return res.status(400).json({ success: false, message: 'Invalid API provider' });
    }

    const questions = await generateQuestionsWithAPI(apiConfig, type, careerGoal, technology, questionCount);
    
    res.json({ 
      success: true, 
      questions, 
      apiProvider: apiConfig.name,
      type 
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate questions' });
  }
});

// Function to generate questions using different AI APIs
async function generateQuestionsWithAPI(apiConfig, type, careerGoal, technology, questionCount) {
  const prompt = buildPrompt(type, careerGoal, technology, questionCount);
  
  try {
    let response;
    
    if (apiConfig.name === 'Gemini') {
      response = await fetchGemini(apiConfig, prompt);
    } else {
      // All other APIs use OpenRouter format
      response = await fetchOpenRouter(apiConfig, prompt);
    }
    
    return parseQuestions(response, type);
  } catch (error) {
    console.error(`Error with ${apiConfig.name}:`, error);
    // Fallback to Gemini if other API fails
    if (apiConfig.name !== 'Gemini') {
      return await generateQuestionsWithAPI(AI_APIS.gemini, type, careerGoal, technology, questionCount);
    }
    throw error;
  }
}

// API-specific fetch functions
async function fetchGemini(apiConfig, prompt) {
  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.9, topP: 0.9, topK: 40 }
  };
  
  const response = await fetch(`${apiConfig.url}?key=${apiConfig.key}`, {
    method: 'POST',
    headers: apiConfig.headers,
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function fetchOpenRouter(apiConfig, prompt) {
  // Map API names to OpenRouter model names
  const modelMap = {
    'DeepSeek V3.1': 'deepseek/deepseek-coder',
    'GPT-OSS-120B': 'openai/gpt-4o-mini',
    'Mistral Small 3.2 24B': 'mistralai/mistral-7b-instruct',
    'Llama 4 Maverick': 'meta-llama/llama-3.1-8b-instruct',
    'Qwen3 Coder 48B': 'qwen/qwen2.5-7b-instruct'
  };
  
  const model = modelMap[apiConfig.name] || 'openai/gpt-4o-mini';
  
  const payload = {
    model: model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    max_tokens: 1000
  };
  
  const response = await fetch(apiConfig.url, {
    method: 'POST',
    headers: apiConfig.headers,
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

// Build prompts for different question types
function buildPrompt(type, careerGoal, technology, questionCount) {
  const basePrompt = `Generate ${questionCount} interview questions for a ${careerGoal} specializing in ${technology}. `;
  
  switch (type) {
    case 'aptitude':
      return basePrompt + `Focus on logical reasoning, problem-solving, and analytical thinking. Return ONLY a JSON array with objects containing: {"question": "question text", "options": ["option1", "option2", "option3", "option4"], "answer": 0-3, "explanation": "brief explanation"}`;
    
    case 'technical':
      return basePrompt + `Focus on ${technology} fundamentals, debugging, and best practices. Return ONLY a JSON array with objects containing: {"question": "question text", "options": ["option1", "option2", "option3", "option4"], "answer": 0-3, "explanation": "brief explanation"}`;
    
    case 'technical_interview':
      return basePrompt + `Focus on open-ended technical questions about system design, architecture, and problem-solving. Return ONLY a JSON array with objects containing: {"question": "question text", "explanation": "brief guidance for answering"}`;
    
    case 'hr_interview':
      return basePrompt + `Focus on behavioral questions, motivation, teamwork, and soft skills. Return ONLY a JSON array with objects containing: {"question": "question text", "explanation": "brief guidance for answering"}`;
    
    default:
      return basePrompt + `Return ONLY a JSON array with objects containing: {"question": "question text", "explanation": "brief guidance"}`;
  }
}

// Parse questions from AI response
function parseQuestions(response, type) {
  try {
    // Clean the response
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const questions = JSON.parse(cleanResponse);
    
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }
    
    // Validate and clean questions
    return questions.map(q => {
      if (type === 'aptitude' || type === 'technical') {
        return {
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: typeof q.answer === 'number' && q.answer >= 0 && q.answer < 4 ? q.answer : 0,
          explanation: q.explanation || ''
        };
      } else {
        return {
          question: q.question || '',
          explanation: q.explanation || 'Provide a detailed answer with examples.'
        };
      }
    }).slice(0, 5); // Ensure max 5 questions
    
  } catch (error) {
    console.error('Failed to parse questions:', error);
    // Return fallback questions
    return generateFallbackQuestions(type, 5);
  }
}

// Fallback questions if API fails
function generateFallbackQuestions(type, count) {
  const questions = [];
  
  if (type === 'aptitude' || type === 'technical') {
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `Sample ${type} question ${i + 1}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: i % 4,
        explanation: 'This is a fallback question.'
      });
    }
  } else {
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `Sample ${type} question ${i + 1}`,
        explanation: 'This is a fallback question.'
      });
    }
  }
  
  return questions;
}

app.listen(3000, () => console.log('Server running on http://localhost:3000'));