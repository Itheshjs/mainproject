const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const advancedModeButton = document.querySelector("#advanced-mode");
// API setup
const API_KEY = "AIzaSyC3IkDvwqAtlLO5cdrRx9ZEr0z0X_gWH3k";
const API_URL = `http://localhost:3000/api/gemini-generate`;
// Initialize user message and file data
const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};
// Store chat history
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;
// CSV data storage
let csvData = [];
let fuse = null; // Fuse.js instance for fuzzy matching
let isAdvancedMode = false;
let currentChatSessionId = null;
let CHAT_LOCAL = false;
// Alias mapping for paraphrases → canonical question (normalized)
let aliasMap = {};
const normalizeText = (text) => String(text || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
function addQuestionAlias(canonicalQuestion, aliases) {
  const canon = normalizeText(canonicalQuestion);
  (aliases || []).forEach(a => {
    const key = normalizeText(a);
    if (key) aliasMap[key] = canon;
  });
}
// Parse a single CSV line respecting quoted commas
const parseCSVLine = (line) => {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // Handle escaped quotes within quoted field
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  // Trim spaces and surrounding quotes
  return fields.map(f => {
    let v = f.trim();
    if (v.startsWith('"') && v.endsWith('"')) {
      v = v.slice(1, -1).replace(/""/g, '"');
    }
    return v;
  });
};

// Load CSV data
const loadCSVData = async () => {
  try {
    console.log('Starting to load CSV data...');
    const response = await fetch('interview_qa.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    console.log('Raw CSV text:', csvText);
    
    const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== '');
    console.log('Number of rows after filtering:', rows.length);
    
    const normalize = (text) => text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ') // remove punctuation
      .replace(/\s+/g, ' ') // collapse whitespace
      .trim();

    csvData = rows.map(row => {
      // Skip comment/section headers
      if (row.trim().startsWith('#')) return null;

      // Parse respecting quotes
      const parts = parseCSVLine(row);

      // Skip header rows - check both "question" and "Question" (case-insensitive)
      if (parts[0] && parts[0].toLowerCase() === 'question') return null;
      if (row.includes('Question Number') && parts[0] === 'Question Number') return null;

      // Filter out empty parts from trailing commas
      const nonEmptyParts = parts.filter(p => p.trim() !== '');

      let question;
      let answer;

      // Software development format with leading numeric id
      if (nonEmptyParts.length >= 3 && /^\d+$/.test(nonEmptyParts[0])) {
        question = nonEmptyParts[1];
        answer = nonEmptyParts[2];
      } else if (nonEmptyParts.length >= 2) {
        // Generic question,answer format
        question = nonEmptyParts[0];
        answer = nonEmptyParts[1];
      } else {
        console.warn('Skipping invalid row:', row);
        return null;
      }

      // Trim and validate question and answer
      question = question ? question.trim() : '';
      answer = answer ? answer.trim() : '';
      
      if (!question || !answer) {
        console.warn('Skipping row with missing data:', row);
        return null;
      }

      console.log('Processing row:', { question, answer });
      return { question: question.toLowerCase(), question_normalized: normalize(question), answer };
    }).filter(item => item !== null);
    
    console.log('Final CSV data loaded:', csvData);

    // Register default aliases so paraphrases map to the same canonical question
    addQuestionAlias('tell me about yourself', [
      'please give me a brief about yourself',
      'give me a brief about yourself',
      'brief about yourself',
      'introduce yourself'
    ]);

    // Initialize Fuse.js for fuzzy matching if available
    try {
      if (window.Fuse && Array.isArray(csvData) && csvData.length > 0) {
        const fuseOptions = {
          includeScore: true,
          threshold: 0.45, // lower = stricter; adjust for recall vs precision
          distance: 200,
          keys: [
            { name: 'question', weight: 0.5 },
            { name: 'question_normalized', weight: 0.5 }
          ],
          ignoreLocation: true,
          minMatchCharLength: 2,
        };
        fuse = new window.Fuse(csvData, fuseOptions);
        console.log('Fuse initialized for fuzzy matching.');
      } else {
        console.warn('Fuse.js not available; using fallback matching.');
      }
    } catch (e) {
      console.warn('Failed to init Fuse:', e);
    }
    
    if (csvData.length === 0) {
      throw new Error('No valid questions found in CSV');
    }
    
    // Show success message in chat
    const messageContent = `<div class="message-text">Interview data loaded successfully! (${csvData.length} questions available)</div>`;
    const botMessageDiv = createMessageElement(messageContent, "bot-message");
    chatBody.appendChild(botMessageDiv);
    
  } catch (error) {
    console.error('Error loading CSV:', error);
    // Show error in chat
    const messageContent = `<div class="message-text">Error loading interview data: ${error.message}. Please make sure you're accessing the page through http://localhost/geminitest/</div>`;
    const botMessageDiv = createMessageElement(messageContent, "bot-message");
    chatBody.appendChild(botMessageDiv);
  }
};
// Load CSV data when page loads
loadCSVData();
// Toggle advanced mode
advancedModeButton.addEventListener('click', () => {
  isAdvancedMode = !isAdvancedMode;
  advancedModeButton.classList.toggle('active');
  const messageContent = `<div class="message-text">Switched to ${isAdvancedMode ? 'Advanced API' : 'CSV'} mode</div>`;
  const botMessageDiv = createMessageElement(messageContent, "bot-message");
  chatBody.appendChild(botMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
});
// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Persist chat message to backend
async function persistChat(role, text) {
  try {
    if (CHAT_LOCAL) {
      localPersistChat(role, text);
      return;
    }
    const resp = await fetch('http://localhost:3000/api/chat-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role, text, timestamp: new Date().toISOString(), sessionId: currentChatSessionId })
    });
    if (resp.status === 401) { switchToLocalChat(); localPersistChat(role, text); }
  } catch (e) { /* ignore */ }
}

// Load chat sessions and messages
async function loadChatSessions() {
  const list = document.getElementById('chat-sessions');
  if (!list) return;
  list.innerHTML = '<li style="color:#6b7280; padding:6px;">Loading…</li>';
  try {
    if (CHAT_LOCAL) { loadChatSessionsLocal(); return; }
    const res = await fetch('http://localhost:3000/api/chat-sessions', { credentials: 'include' });
    const data = await res.json();
    if (res.status === 401) { switchToLocalChat(); loadChatSessionsLocal(); return; }
    if (!data.success || !Array.isArray(data.sessions)) throw new Error();
    list.innerHTML = '';
    data.sessions.forEach(s => {
      const li = document.createElement('li');
      li.style.padding = '8px';
      li.style.border = '1px solid #e5e7eb';
      li.style.borderRadius = '8px';
      li.style.cursor = 'pointer';
      li.textContent = s.title || new Date(s.createdAt).toLocaleString();
      li.addEventListener('click', () => {
        currentChatSessionId = s._id;
        loadChatHistory();
      });
      list.appendChild(li);
      if (!currentChatSessionId) currentChatSessionId = s._id;
    });
    if (currentChatSessionId) loadChatHistory();
  } catch (_) {
    switchToLocalChat();
    loadChatSessionsLocal();
  }
}

async function ensureSession(titleHint) {
  if (currentChatSessionId) return currentChatSessionId;
  try {
    if (CHAT_LOCAL) { currentChatSessionId = localEnsureSession(titleHint); return currentChatSessionId; }
    const res = await fetch('http://localhost:3000/api/chat-sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ title: titleHint || 'New chat' })
    });
    const data = await res.json();
    if (res.status === 401) { switchToLocalChat(); currentChatSessionId = localEnsureSession(titleHint); return currentChatSessionId; }
    if (data.success && data.session) {
      currentChatSessionId = data.session._id;
    }
  } catch (_) {}
  return currentChatSessionId;
}

// Render messages for current session
async function loadChatHistory() {
  const list = document.getElementById('chat-history-list');
  if (!list) return;
  list.innerHTML = '<li style="color:#6b7280; padding:6px;">Loading…</li>';
  try {
    if (!currentChatSessionId) { list.innerHTML=''; return; }
    if (CHAT_LOCAL) { loadChatHistoryLocal(); return; }
    const res = await fetch('http://localhost:3000/api/chat-history?sessionId=' + encodeURIComponent(currentChatSessionId), { credentials: 'include' });
    const data = await res.json();
    if (res.status === 401) { switchToLocalChat(); return; }
    if (!data.success || !Array.isArray(data.messages)) throw new Error();
    // Build Q/A pairs and render only questions; expand to show answer on click
    list.innerHTML = '';
    const msgs = data.messages;
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].role !== 'user') continue;
      const q = msgs[i];
      const a = (i + 1 < msgs.length && msgs[i + 1].role === 'bot') ? msgs[i + 1] : null;
      const li = document.createElement('li');
      li.style.padding = '10px';
      li.style.border = '1px solid #e5e7eb';
      li.style.borderRadius = '8px';
      li.style.background = '#f8fafc';
      li.style.cursor = 'pointer';
      const ts = q.timestamp ? new Date(q.timestamp).toLocaleString() : '';
      const title = document.createElement('div');
      title.style.fontWeight = '600';
      title.style.color = '#111827';
      title.textContent = q.text.length > 80 ? q.text.slice(0, 80) + '…' : q.text;
      const meta = document.createElement('div');
      meta.style.color = '#6b7280';
      meta.style.fontSize = '12px';
      meta.textContent = ts;
      const detail = document.createElement('div');
      detail.style.display = 'none';
      detail.style.marginTop = '8px';
      detail.style.padding = '8px';
      detail.style.background = '#ffffff';
      detail.style.border = '1px solid #dcfce7';
      detail.style.borderRadius = '6px';
      detail.textContent = a ? a.text : 'No answer yet.';
      li.appendChild(title);
      li.appendChild(meta);
      li.appendChild(detail);
      li.addEventListener('click', () => {
        detail.style.display = (detail.style.display === 'none') ? 'block' : 'none';
      });
      list.appendChild(li);
    }
  } catch (_) {
    list.innerHTML = '<li style="color:#b91c1c; padding:6px;">Unable to load history.</li>';
  }
}
// Check if message is job interview related
const isJobInterviewRelated = (message) => {
  const interviewKeywords = [
    'interview', 'job', 'career', 'resume', 'cv', 'application',
    'position', 'role', 'hiring', 'recruitment', 'candidate',
    'employer', 'employee', 'work', 'professional', 'experience',
    'skills', 'qualification', 'salary', 'compensation', 'benefits',
    'company', 'organization', 'industry', 'workplace', 'office',
    'preparation', 'prep', 'practice', 'mock', 'behavioral',
    'technical', 'assessment', 'screening', 'recruiter', 'hiring manager',
    'job search', 'career development', 'professional growth',
    'work experience', 'job application', 'job offer', 'job market'
  ];
  
  const messageLower = message.toLowerCase();
  return interviewKeywords.some(keyword => messageLower.includes(keyword));
};
// Find best matching question from CSV
const findBestMatch = (userQuestion) => {
  if (!csvData || csvData.length === 0) {
    console.error('CSV data is not loaded or empty');
    return null;
  }

  const userQuestionLower = userQuestion.toLowerCase().trim();
  const normalize = (text) => text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
  const userNormalized = normalize(userQuestion);

  // Alias check (guaranteed mapping when defined)
  try {
    const aliasCanon = aliasMap[normalizeText(userQuestion)];
    if (aliasCanon && Array.isArray(csvData)) {
      const aliased = csvData.find(item => item && item.question_normalized === aliasCanon);
      if (aliased) {
        console.log('Alias matched to canonical question:', aliasCanon, aliased);
        return aliased;
      }
    }
  } catch (_) {}
  // Build candidate inputs from multi-line text
  const candidateInputs = [userQuestion]
    .concat(userQuestion.split(/\r?\n/))
    .map(t => t.trim())
    .filter((t, idx, arr) => t.length > 0 && arr.indexOf(t) === idx);
  let bestMatch = null;
  let highestScore = 0;

  console.log('Current CSV data:', csvData);
  console.log('Searching for match for:', userQuestionLower);

  // If Fuse is ready, try fuzzy matching first
  try {
    if (fuse) {
      const results = fuse.search(userNormalized);
      if (Array.isArray(results) && results.length > 0) {
        const top = results[0];
        // Convert score (0 best) into confidence and gate it
        const score = typeof top.score === 'number' ? top.score : 1;
        const confidence = 1 - Math.min(Math.max(score, 0), 1);
        console.log('Fuse top result:', top, 'confidence:', confidence);
        if (confidence >= 0.55) {
          return top.item;
        }
      }
    }
  } catch (e) { console.warn('Fuse search failed, falling back:', e); }

  // Evaluate each candidate line separately (fallback heuristic)
  for (const candidate of candidateInputs) {
    const candidateLower = candidate.toLowerCase().trim();
    const candidateNormalized = normalize(candidate);

    // Exact match (strict)
    const exactMatch = csvData.find(item => item.question.toLowerCase() === candidateLower);
    if (exactMatch) {
      console.log('Found exact match for candidate:', candidate, exactMatch);
      return exactMatch;
    }

    // Normalized exact match
    const normalizedExact = csvData.find(item => item.question_normalized === candidateNormalized);
    if (normalizedExact) {
      console.log('Found normalized exact match for candidate:', candidate, normalizedExact);
      return normalizedExact;
    }

    // Partial match scoring
    csvData.forEach(item => {
      const questionWords = item.question_normalized.split(' ');
      const userWords = candidateNormalized.split(' ');
      
      let score = 0;
      userWords.forEach((word) => {
        if (questionWords.includes(word)) {
          score += 2;
        } else {
          questionWords.forEach(qWord => {
            if (qWord.length >= 4 && word.length >= 4 && (qWord.includes(word) || word.includes(qWord))) {
              score += 1;
            }
          });
        }
      });

      // Bonus points for matching first words and key phrases
      if (userWords[0] === questionWords[0]) score += 3;
      if (item.question_normalized.includes('prepare for a job interview') && candidateNormalized.includes('prepare for a job interview')) score += 5;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    });
  }

  console.log('Best match:', bestMatch, 'Score:', highestScore);
  // Require a higher threshold to avoid irrelevant matches
  return highestScore >= 4 ? bestMatch : null;
};
// Generate bot response using API or CSV
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  
  if (isAdvancedMode) {
    // API mode - Only for job interview related questions
    if (!isJobInterviewRelated(userData.message) && !userData.file.data) {
      messageElement.innerText = "I can only help with job interview related questions. Please ask about interviews, careers, or job-related topics.";
      userData.file = {};
      incomingMessageDiv.classList.remove("thinking");
      chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
      return;
    }

    // Prepare the request payload
    const requestPayload = {
      contents: [{
        role: "user",
        parts: []
      }]
    };

    // Add text message if present
    if (userData.message) {
      requestPayload.contents[0].parts.push({ text: userData.message });
    }

    // Add image if present
    if (userData.file.data) {
      const base64Image = userData.file.data.split(',')[1];
      requestPayload.contents[0].parts.push({
        inline_data: {
          mime_type: userData.file.mime_type,
          data: base64Image
        }
      });
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response from API');
      }
      
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      messageElement.innerText = apiResponseText;
      persistChat('bot', apiResponseText);
      
      chatHistory.push({
        role: "model",
        parts: [{ text: apiResponseText }]
      });
    } catch (error) {
      console.error('API Error:', error);
      messageElement.innerText = "Sorry, I encountered an error processing your request. Please try again.";
      messageElement.style.color = "#ff0000";
    }
  } else {
    // CSV mode - Open to any questions
    console.log('CSV Mode - Current data:', csvData);
    const match = findBestMatch(userData.message);
    console.log('Found match:', match);
    
    if (match) {
      messageElement.innerText = match.answer;
      persistChat('bot', match.answer);
    } else {
      messageElement.innerText = "I'm sorry, I couldn't find a relevant answer in my database. Try switching to Advanced mode for more comprehensive responses.";
      persistChat('bot', "I'm sorry, I couldn't find a relevant answer in my database. Try switching to Advanced mode for more comprehensive responses.");
    }
  }

  userData.file = {};
  incomingMessageDiv.classList.remove("thinking");
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
};
// Handle outgoing message
const handleOutgoingMessage = async (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  
  // Only proceed if there's either a message or a file
  if (!message && !userData.file.data) return;

  const messageContent = `
    <div class="message-text">
      ${message}
      ${userData.file.data ? `<img src="${userData.file.data}" alt="Uploaded image" style="max-width: 200px; margin-top: 10px;">` : ''}
    </div>
  `;
  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  await ensureSession(message.slice(0, 40));
  persistChat('user', message);

  // Clear input and file data
  messageInput.value = "";
  messageInput.style.height = `${initialInputHeight}px`;
  userData.message = message;
  
  // Generate bot response
  const incomingMessageDiv = createMessageElement(
    '<div class="message-text">Thinking...</div>',
    "bot-message",
    "thinking"
  );
  chatBody.appendChild(incomingMessageDiv);
  generateBotResponse(incomingMessageDiv);

  // Reset file data after sending
  if (userData.file.data) {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = "";
    fileUploadWrapper.classList.remove("active");
    userData.file = {
      data: null,
      mime_type: null,
    };
  }
};
// Handle Enter key press
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleOutgoingMessage(e);
  }
});
// Handle file upload
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      userData.file = {
        data: e.target.result,
        mime_type: file.type,
      };
      fileUploadWrapper.querySelector("img").src = e.target.result;
      fileUploadWrapper.classList.add("active");
      // Automatically send the message when a file is selected
      handleOutgoingMessage(new Event('submit'));
    };
    reader.readAsDataURL(file);
  }
});
// Handle file cancel
fileCancelButton.addEventListener("click", () => {
  fileInput.value = "";
  fileUploadWrapper.querySelector("img").src = "";
  fileUploadWrapper.classList.remove("active");
  userData.file = {
    data: null,
    mime_type: null,
  };
});
// Handle send button click
sendMessage.addEventListener("click", handleOutgoingMessage);
// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});
// Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
  onClickOutside: (e) => {
    if (e.target.id === "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
});
document.querySelector(".chat-form").appendChild(picker);
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
  document.body.classList.remove("chatbot-fullscreen");
});
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

// Back button inside chat header to exit fullscreen/chat
const backHomeBtn = document.getElementById('chat-back-home');
if (backHomeBtn) {
  backHomeBtn.addEventListener('click', () => {
    document.body.classList.remove('show-chatbot');
    document.body.classList.remove('chatbot-fullscreen');
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
  });
}

// Profile Button Functionality
const profileBtn = document.getElementById('profile-btn');

// Check if user is logged in and show profile button
async function checkUserLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/profile', {
      credentials: 'include'
    });
    const result = await response.json();
    
    if (result.success) {
      // User is logged in, show profile button and hide login/signup
      profileBtn.style.display = 'inline-flex';
      document.querySelector('.login-btn').style.display = 'none';
      document.querySelector('.signup-btn').style.display = 'none';
      
      // Store user data for profile page
      window.userProfileData = result.user;
      return true;
    } else {
      // User is not logged in, show login/signup buttons
      document.querySelector('.login-btn').style.display = 'inline-block';
      document.querySelector('.signup-btn').style.display = 'inline-block';
      window.userProfileData = null;
      return false;
    }
  } catch (error) {
    console.error('Error checking user login status:', error);
    // If server is not running, show login/signup buttons
    document.querySelector('.login-btn').style.display = 'inline-block';
    document.querySelector('.signup-btn').style.display = 'inline-block';
    window.userProfileData = null;
    return false;
  }
}

// Redirect to profile.html after verifying session live
if (profileBtn) {
  profileBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/profile', { credentials: 'include' });
      const result = await res.json();
      if (result && result.success && result.user) {
        try { localStorage.setItem('profileUser', JSON.stringify(result.user)); } catch (_) {}
        window.location.href = 'profile.html';
      } else {
        alert('Please log in to view your profile.');
      }
    } catch (_) {
      alert('Please log in to view your profile.');
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing profile...');
  try { if (typeof initializeProfile === 'function') initializeProfile(); } catch (_) {}
  checkUserLogin();
  // Load history if chat is already visible
  try { if (document.body.classList.contains('show-chatbot')) loadChatSessions(); } catch (_) {}
  const newBtn = document.getElementById('new-chat');
  if (newBtn) newBtn.addEventListener('click', async () => { currentChatSessionId = null; await ensureSession('New chat'); loadChatSessions(); });

  // Smart Practice
  const spCard = document.getElementById('smart-practice-card');
  const spModal = document.getElementById('sp-modal');
  const spClose = document.getElementById('sp-close');
  const spCareer = document.getElementById('sp-career');
  const spTech = document.getElementById('sp-tech');
  const spStart = document.getElementById('sp-start');
  const spSetup = document.getElementById('sp-setup');
  const spQuiz = document.getElementById('sp-quiz');
  const spQwrap = document.getElementById('sp-qwrap');
  const spNext = document.getElementById('sp-next');
  const spResult = document.getElementById('sp-result');
  const spScore = document.getElementById('sp-score');
  const spReview = document.getElementById('sp-review');

  let spQuestions = [];
  let spIndex = 0;
  let spCorrect = 0;
  let spAnswers = [];

  function openSP() { spModal.style.display = 'block'; }
  function closeSP() { spModal.style.display = 'none'; }

  function prefillProfile() {
    try {
      if (window.userProfileData) {
        if (!spCareer.value) spCareer.value = window.userProfileData.careerGoal || '';
        if (!spTech.value && Array.isArray(window.userProfileData.preferredTechnologies)) spTech.value = window.userProfileData.preferredTechnologies[0] || '';
      }
    } catch (_) {}
  }

  function renderQuestion() {
    const q = spQuestions[spIndex];
    if (!q) return;
    spQwrap.innerHTML = '';
    const h = document.createElement('h3'); h.textContent = `Q${spIndex+1}. ${q.question}`; spQwrap.appendChild(h);
    if (Array.isArray(q.options)) {
      q.options.forEach((opt, idx) => {
        const lbl = document.createElement('label');
        lbl.style.display = 'block'; lbl.style.margin = '8px 0';
        const inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'sp_opt'; inp.value = String(idx);
        lbl.appendChild(inp);
        const span = document.createElement('span'); span.textContent = ' ' + opt; lbl.appendChild(span);
        spQwrap.appendChild(lbl);
      });
    }
  }

  async function startPractice() {
    const career = spCareer.value.trim();
    const tech = spTech.value.trim();
    if (!career || !tech) { alert('Please provide Career Goal and Technology.'); return; }
    try {
      const res = await fetch('http://localhost:3000/api/generate-questions', {
        method: 'POST', headers: { 'Content-Type':'application/json' }, credentials: 'include',
        body: JSON.stringify({ type:'technical', careerGoal: career, technology: tech, questionCount:5 })
      });
      const data = await res.json();
      if (!data.success || !Array.isArray(data.questions) || data.questions.length === 0) throw new Error();
      spQuestions = data.questions;
      spIndex = 0; spCorrect = 0; spAnswers = [];
      spSetup.style.display = 'none'; spResult.style.display = 'none'; spQuiz.style.display = 'block';
      renderQuestion();
    } catch (_) {
      alert('Unable to generate questions. Ensure backend is running.');
    }
  }

  function nextQuestion() {
    const q = spQuestions[spIndex];
    const sel = document.querySelector('input[name="sp_opt"]:checked');
    if (!sel) { alert('Please select an answer.'); return; }
    const chosen = Number(sel.value);
    const correct = typeof q.answer === 'number' ? q.answer : 0;
    const isCorrect = chosen === correct;
    if (isCorrect) spCorrect += 1;
    spAnswers.push({ question: q.question, chosen, correct, options: q.options, explanation: q.explanation });
    spIndex += 1;
    if (spIndex < spQuestions.length) {
      renderQuestion();
    } else {
      const scorePct = Math.round((spCorrect / spQuestions.length) * 100);
      spQuiz.style.display = 'none';
      spResult.style.display = 'block';
      spScore.textContent = `Score: ${spCorrect}/${spQuestions.length} (${scorePct}%)`;
      spReview.innerHTML = '';
      spAnswers.forEach((a, i) => {
        const li = document.createElement('li');
        const correctText = a.options && a.options[a.correct] ? a.options[a.correct] : '';
        const chosenText = a.options && a.options[a.chosen] ? a.options[a.chosen] : '';
        li.textContent = `Q${i+1}: ${a.question} — Your answer: ${chosenText} | Correct: ${correctText}`;
        if (a.explanation) { const em = document.createElement('div'); em.style.fontSize='12px'; em.style.color='#6b7280'; em.textContent = a.explanation; li.appendChild(em); }
        spReview.appendChild(li);
      });
    }
  }

  if (spCard) spCard.addEventListener('click', () => { prefillProfile(); openSP(); });
  if (spClose) spClose.addEventListener('click', closeSP);
  if (spStart) spStart.addEventListener('click', startPractice);
  if (spNext) spNext.addEventListener('click', nextQuestion);
});

// Local fallback storage for unauthenticated users
function switchToLocalChat() {
  CHAT_LOCAL = true;
  if (!localStorage.getItem('chat_sessions')) localStorage.setItem('chat_sessions', JSON.stringify([]));
}
function localEnsureSession(title) {
  let sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
  const id = 'local_' + Date.now();
  sessions.unshift({ _id: id, title: title || 'New chat', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  return id;
}
function loadChatSessionsLocal() {
  const list = document.getElementById('chat-sessions');
  const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
  list.innerHTML = '';
  sessions.forEach(s => {
    const li = document.createElement('li');
    li.style.padding = '8px';
    li.style.border = '1px solid #e5e7eb';
    li.style.borderRadius = '8px';
    li.style.cursor = 'pointer';
    li.textContent = s.title;
    li.addEventListener('click', () => { currentChatSessionId = s._id; loadChatHistoryLocal(); });
    list.appendChild(li);
    if (!currentChatSessionId) currentChatSessionId = s._id;
  });
  if (currentChatSessionId) loadChatHistoryLocal();
}
function localPersistChat(role, text) {
  if (!currentChatSessionId) currentChatSessionId = localEnsureSession(text.slice(0,40));
  const key = 'chat_msgs_' + currentChatSessionId;
  const msgs = JSON.parse(localStorage.getItem(key) || '[]');
  msgs.push({ role, text, timestamp: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(msgs));
  loadChatHistoryLocal();
}
function loadChatHistoryLocal() {
  const list = document.getElementById('chat-history-list');
  const key = 'chat_msgs_' + currentChatSessionId;
  const msgs = JSON.parse(localStorage.getItem(key) || '[]');
  list.innerHTML = '';
  for (let i = 0; i < msgs.length; i++) {
    if (msgs[i].role !== 'user') continue;
    const q = msgs[i];
    const a = (i + 1 < msgs.length && msgs[i + 1].role === 'bot') ? msgs[i + 1] : null;
    const li = document.createElement('li');
    li.style.padding = '10px';
    li.style.border = '1px solid #e5e7eb';
    li.style.borderRadius = '8px';
    li.style.background = '#f8fafc';
    li.style.cursor = 'pointer';
    const ts = new Date(q.timestamp).toLocaleString();
    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.style.color = '#111827';
    title.textContent = q.text.length > 80 ? q.text.slice(0, 80) + '…' : q.text;
    const meta = document.createElement('div');
    meta.style.color = '#6b7280';
    meta.style.fontSize = '12px';
    meta.textContent = ts;
    const detail = document.createElement('div');
    detail.style.display = 'none';
    detail.style.marginTop = '8px';
    detail.style.padding = '8px';
    detail.style.background = '#ffffff';
    detail.style.border = '1px solid #dcfce7';
    detail.style.borderRadius = '6px';
    detail.textContent = a ? a.text : 'No answer yet.';
    li.appendChild(title);
    li.appendChild(meta);
    li.appendChild(detail);
    li.addEventListener('click', () => {
      detail.style.display = (detail.style.display === 'none') ? 'block' : 'none';
    });
    list.appendChild(li);
  }
}

// Logout functionality
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    const result = await response.json();
    
    if (result.success) {
      // Hide profile button and show login/signup buttons
      profileBtn.style.display = 'none';
      document.querySelector('.login-btn').style.display = 'inline-block';
      document.querySelector('.signup-btn').style.display = 'inline-block';
      
      // Close profile modal
      closeProfileModal();
      
      // Redirect to homepage
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error logging out:', error);
    alert('Error logging out. Please try again.');
  }
});

// Add navigation functionality to login and signup buttons
document.querySelector('.login-btn').addEventListener('click', () => {
  window.location.href = 'login.html';
});

document.querySelector('.signup-btn').addEventListener('click', () => {
  window.location.href = 'signup.html';
});

// Attach to Track Progress card: open modal implemented in index.html
function handleTrackProgressClick(e) {
  e.preventDefault();
  if (typeof window.openProgressModal === 'function') {
    window.openProgressModal();
  } else {
    // Fallback: navigate with query to trigger modal
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('showProgress', '1');
      window.location.href = url.toString();
    } catch (_) {
      window.location.href = 'index.html?showProgress=1';
    }
  }
}

const trackProgressEl = document.getElementById('track-progress-card');
if (trackProgressEl) {
  trackProgressEl.addEventListener('click', handleTrackProgressClick);
}