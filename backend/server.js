const fetch = require('node-fetch');

// Gemini API endpoint for interview questions
app.post('/api/gemini-questions', async (req, res) => {
  const GEMINI_API_KEY = 'AIzaSyC3IkDvwqAtlLO5cdrRx9ZEr0z0X_gWH3k'; // Replace with your actual key
  const prompt = `Generate random interview simulation questions for:
    Stage 1: 2 MCQs on aptitude, reasoning, verbal ability (with options, answer index, explanation).
    Stage 2: 2 MCQs or coding challenges (with options if MCQ, answer index, explanation).
    Stage 3: 2 technical interview questions (text answer, explanation).
    Stage 4: 2 HR interview questions (text answer, explanation). Format as JSON.`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    // Parse Gemini response
    try {
      const text = data.candidates[0].content.parts[0].text;
      res.json({ success: true, questions: JSON.parse(text) });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Failed to parse Gemini response.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gemini API error.' });
  }
});

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  res.removeHeader('X-Frame-Options');
  next();
});

// Allow multiple origins for CORS
const allowedOrigins = [
  'http://localhost',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
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
  phone: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  careerGoal: String,
  preferredTechnologies: [String]
});
const User = mongoose.model('User', UserSchema);

// Sign Up
app.post('/api/signup', async (req, res) => {
  const { username, fullName, usertype, phone, email, password, location, careerGoal, preferredTechnologies } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = new User({ 
      username, 
      fullName, 
      usertype, 
      phone, 
      email, 
      password: hashed, 
      location, 
      careerGoal, 
      preferredTechnologies 
    });
    await user.save();
    req.session.userId = user._id;
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Email already exists' });
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

app.listen(3000, () => console.log('Server running on http://localhost:3000')); 