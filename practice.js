// Interview Simulation: 4 stages x 5 questions, personalized from profile
// Stages:
// 1) Aptitude MCQs (scored)
// 2) Technical MCQs (scored)
// 3) Technical Interview (open-ended)
// 4) HR Interview (open-ended)
// Final summary shows total score from MCQ stages

(() => {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(async () => {
    const app = document.getElementById('practiceApp');
    if (!app) return;

    // Show loading state
    app.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 1.2rem; margin-bottom: 20px;">🔄 Loading Smart Practice...</div>
        <div style="color: #666;">Connecting to AI services...</div>
      </div>
    `;

    try {
      // Fetch profile to personalize questions
      const profile = await getUserProfile();
      const careerGoal = (profile && (profile.careerGoal || profile.careerGoal)) || 'software engineer';
      const preferredTech = (profile && (profile.preferredTechnology || profile.preferred_technology)) || 'JavaScript';

      console.log('User Profile:', { careerGoal, preferredTech });

  // Build stages for interview simulation using Gemini AI only
  const stages = await buildAllStagesWithGemini(careerGoal, preferredTech);

      if (!stages || stages.length === 0) {
  throw new Error('Failed to generate questions from Gemini AI');
      }

      console.log('Generated Stages:', stages);

    let currentStageIndex = 0;
    let currentQuestionIndex = 0;
    let score = 0; // MCQs only

    renderCurrent();

    function renderCurrent() {
      const stage = stages[currentStageIndex];
      const q = stage.questions[currentQuestionIndex];
      const isMCQ = Array.isArray(q.options) && q.options.length > 0 && typeof q.answer === 'number';

    app.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div><b>${escapeHTML(stage.title)}</b></div>
          <div style="color:#666;">Question ${currentQuestionIndex + 1} of 5</div>
      </div>
        <div class="question" style="font-size:1.05rem;margin-bottom:12px;">${escapeHTML(q.question)}</div>
        ${isMCQ ? renderMCQForm(q) : renderOpenForm()}
        <div id="feedback" class="feedback" style="margin-top:12px;"></div>
        <div style="margin-top:16px;color:#666;">Progress: Stage ${currentStageIndex + 1} of 4</div>
  <div style="margin-top:8px;color:#888;font-size:0.9rem;">Powered by: Gemini AI</div>
      `;

      const form = document.getElementById('answerForm');
      form.onsubmit = (e) => {
    e.preventDefault();
        if (isMCQ) handleMCQSubmit(q);
        else handleOpenSubmit(q);
      };
    }

    function handleMCQSubmit(q) {
      const selected = document.querySelector('input[name="option"]:checked');
      const feedback = document.getElementById('feedback');
      if (!selected) {
        feedback.textContent = 'Please select an option.';
        return;
      }
      const selectedIndex = parseInt(selected.value, 10);
        if (selectedIndex === q.answer) {
        score += 1;
        feedback.innerHTML = '<span style="color:green;font-weight:600;">Correct!</span>' + (q.explanation ? `<div style="margin-top:6px;">${escapeHTML(q.explanation)}</div>` : '');
      } else {
        feedback.innerHTML = '<span style="color:#d9534f;font-weight:600;">Wrong.</span>' +
          (typeof q.answer === 'number' && q.options[q.answer] ? ` <span>Correct: <b>${escapeHTML(q.options[q.answer])}</b></span>` : '') +
          (q.explanation ? `<div style="margin-top:6px;">${escapeHTML(q.explanation)}</div>` : '');
      }
      appendNextButton();
    }

    function handleOpenSubmit(q) {
      const text = document.querySelector('textarea[name="textAnswer"]').value.trim();
      const feedback = document.getElementById('feedback');
      if (text.length < 5) {
        feedback.textContent = 'Please provide a more detailed answer.';
        return;
      }
      feedback.innerHTML = 'Submitted.' + (q.explanation ? ` <span>${escapeHTML(q.explanation)}</span>` : '');
      appendNextButton();
    }

    function appendNextButton() {
      const feedback = document.getElementById('feedback');
      const nextBtn = document.createElement('button');
      nextBtn.className = 'signup-btn';
      nextBtn.style.marginLeft = '10px';
      nextBtn.type = 'button';
      nextBtn.textContent = currentStageIndex === stages.length - 1 && currentQuestionIndex === 4 ? 'Finish' : 'Next';
      nextBtn.addEventListener('click', goNext);
      feedback.appendChild(document.createElement('br'));
      feedback.appendChild(nextBtn);
    }

    function goNext() {
      currentQuestionIndex += 1;
      if (currentQuestionIndex >= 5) {
        currentStageIndex += 1;
        currentQuestionIndex = 0;
      }
      if (currentStageIndex >= stages.length) {
        showSummary();
  } else {
        renderCurrent();
  }
}

function showSummary() {
      // Score is from stage 1 and 2 (10 questions)
      const totalMCQs = 10;
  app.innerHTML = `
        <div class="stage-title" style="font-size:1.25rem;margin-bottom:10px;">Interview Complete!</div>
        <div class="summary" style="background:#f7fafd;border-radius:10px;padding:16px;">
          <p><b>Total MCQ Score:</b> ${score} / ${totalMCQs}</p>
          <p><b>Target Role:</b> ${escapeHTML(careerGoal)}</p>
          <p><b>Primary Tech:</b> ${escapeHTML(preferredTech)}</p>
          <p style="margin-top:8px;">Keep practicing. Focus on areas where your answers were uncertain or incorrect.</p>
        </div>
        <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="login-btn" onclick="window.location.href='index.html'">Back to Home</button>
          <button class="signup-btn" onclick="window.location.reload()">Restart Simulation</button>
    </div>
      `;
    }

    } catch (error) {
      console.error('Error in practice setup:', error);
      
      // Show error message with retry option
      app.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 1.2rem; margin-bottom: 20px; color: #d9534f;">❌ Connection Error</div>
          <div style="color: #666; margin-bottom: 20px;">
            ${error.message || 'Failed to connect to AI services'}
          </div>
          <div style="margin-bottom: 20px;">
            <strong>Please check:</strong><br>
            1. Backend server is running (cd backend && npm start)<br>
            2. Backend is accessible at http://localhost:3000<br>
            3. No firewall blocking the connection
          </div>
          <button class="signup-btn" onclick="window.location.reload()">🔄 Retry</button>
          <button class="login-btn" onclick="window.location.href='index.html'" style="margin-left: 10px;">🏠 Back to Home</button>
        </div>
      `;
    }

    // Builders
    // ===== Gemini-backed stage builders =====
    async function buildAllStagesWithGemini(goal, tech) {
      const [aptitude, technical, techOpen, hrOpen] = await Promise.all([
        generateMCQSet(goal, tech, 'aptitude'),
        generateMCQSet(goal, tech, 'technical'),
        generateOpenSet(goal, tech, 'technical_interview'),
        generateOpenSet(goal, tech, 'hr_interview'),
      ]);
      return [
        { title: 'Stage 1 – Aptitude Test', questions: aptitude },
        { title: 'Stage 2 – Technical Test', questions: technical },
        { title: 'Stage 3 – Technical Interview', questions: techOpen },
        { title: 'Stage 4 – HR Interview', questions: hrOpen },
      ];
    }

    const GEMINI_API_KEY = "AIzaSyC3IkDvwqAtlLO5cdrRx9ZEr0z0X_gWH3k";
    const GEMINI_URL = `http://localhost:3000/api/gemini-generate`;

    const PREV_Q_KEY = (kind, goal, tech) => `practice_prev_questions_${kind}_${(goal||'').toLowerCase()}_${(tech||'').toLowerCase()}`;
    function loadPrevQuestions(kind, goal, tech) {
      try {
        const raw = localStorage.getItem(PREV_Q_KEY(kind, goal, tech));
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (_) { return []; }
    }
    function savePrevQuestions(kind, goal, tech, questions) {
      try {
        const existing = loadPrevQuestions(kind, goal, tech);
        const merged = Array.from(new Set([...questions, ...existing])).slice(0, 50);
        localStorage.setItem(PREV_Q_KEY(kind, goal, tech), JSON.stringify(merged));
      } catch (_) {}
    }

    function uniqueTag() {
      const rand = Math.floor(Math.random() * 1e9);
      const r2 = Math.floor(Math.random() * 1e9);
      return `Seed:${rand}-${r2}-Ts:${Date.now()}-R:${Math.random().toString(36).slice(2)}-${cryptoLike()}`;
    }
    function cryptoLike() {
      try { return (self.crypto || window.crypto).getRandomValues(new Uint32Array(2)).join('-'); } catch (_) { return Math.random().toString(36).slice(2); }
    }

    async function generateMCQSet(goal, tech, kind) {
      const prev = loadPrevQuestions(kind, goal, tech);
      const prevSnippet = prev.length ? `Avoid repeating any of these questions/prompts (verbatim or paraphrased): ${JSON.stringify(prev.slice(0, 50))}.` : '';
      const schema = `Return ONLY a strict JSON array of 5 objects, each: {"question": string, "options": [string,string,string,string], "answer": number (0-3), "explanation": string}. Do NOT include markdown or any extra text.`;
      const profileTag = fingerprint(goal, tech);
      const variants = buildMCQPrompts(kind, goal, tech, schema, prevSnippet, profileTag);
      const chosen = sample(variants, 2);
      const texts = await Promise.all(chosen.map(p => fetchGemini(p, { temperature: 1.05, topP: 0.98 })));
      let merged = mergeMCQResults(texts) || fallbackMCQs(goal, tech);
      merged = shuffleArray(merged);
      savePrevQuestions(kind, goal, tech, merged.map(i => i.question));
      return merged.slice(0, 5);
    }

    async function generateOpenSet(goal, tech, kind) {
      const prev = loadPrevQuestions(kind, goal, tech);
      const prevSnippet = prev.length ? `Avoid repeating any of these prompts (verbatim or paraphrased): ${JSON.stringify(prev.slice(0, 50))}.` : '';
      const schema = `Return ONLY a strict JSON array of 5 objects, each: {"question": string, "explanation": string}. No markdown.`;
      const profileTag = fingerprint(goal, tech);
      const variants = buildOpenPrompts(kind, goal, tech, schema, prevSnippet, profileTag);
      const chosen = sample(variants, 2);
      const texts = await Promise.all(chosen.map(p => fetchGemini(p, { temperature: 1.05, topP: 0.98 })));
      let merged = mergeOpenResults(texts) || fallbackOpen(goal, tech, kind);
      merged = shuffleArray(merged);
      savePrevQuestions(kind, goal, tech, merged.map(i => i.question));
      return merged.slice(0, 5);
    }

    async function fetchGemini(prompt, gen = {}) {
      try {
        const payload = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: typeof gen.temperature === 'number' ? gen.temperature : 0.9,
            topP: typeof gen.topP === 'number' ? gen.topP : 0.9,
            topK: 40
          }
        };
        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text.startsWith('```')) {
          text = text.replace(/^```[a-zA-Z]*\s*/, '').replace(/```\s*$/, '');
        }
        return text;
      } catch (e) {
        return '';
      }
    }

    function tryParseJSON(s) {
      try { return JSON.parse(s); } catch (_) { return null; }
    }

    function validateMCQs(text) {
      const arr = tryParseJSON(text);
      if (!Array.isArray(arr)) return null;
      const clean = arr.filter(it => it && typeof it.question === 'string' && Array.isArray(it.options) && it.options.length === 4 && Number.isInteger(it.answer) && it.answer >= 0 && it.answer < 4)
        .map(it => ({ question: it.question, options: it.options, answer: it.answer, explanation: it.explanation || '' }));
      return clean.length === 5 ? clean : null;
    }

    function validateOpen(text) {
      const arr = tryParseJSON(text);
      if (!Array.isArray(arr)) return null;
      const clean = arr.filter(it => it && typeof it.question === 'string')
        .map(it => ({ question: it.question, explanation: it.explanation || 'Answer concisely with examples.' }));
      return clean.length === 5 ? clean : null;
    }

    // Fallbacks if API fails
    function fallbackMCQs(goal, tech) {
      const bank = [
        { question: `Which data structure best fits prioritizing user tickets for a ${goal}?`, options: ['Stack','Priority Queue','Queue','Set'], answer: 1, explanation: 'Priority Queue processes highest priority first.' },
        { question: `In ${tech}, what is the output type of typeof null?`, options: ['null','object','undefined','string'], answer: 1, explanation: 'Legacy quirk: typeof null === "object".' },
        { question: `Best structure for fast userId → profile lookup in ${tech}?`, options: ['Array','Map/Hash','Queue','List'], answer: 1, explanation: 'Hash maps provide average O(1) key lookup.' },
        { question: `Big-O for merging two sorted arrays of size n and m?`, options: ['O(n+m)','O(n log m)','O(log(n+m))','O(n*m)'], answer: 0, explanation: 'Linear merge across both arrays.' },
        { question: `Which complexity is best for real-time feed in ${goal}?`, options: ['O(n^2)','O(n log n)','O(log n)','O(1) amortized'], answer: 3, explanation: 'Aim near O(1) amortized for hot paths.' },
        { question: `In ${tech}, which DS is ideal for LRU cache order?`, options: ['Array','LinkedHashMap/Deque','Stack','Set'], answer: 1, explanation: 'Deque + hash gives O(1) update/evict.' },
        { question: `For a ${goal}, which is NOT stable sorting?`, options: ['Merge Sort','Insertion Sort','Heap Sort','Tim Sort'], answer: 2, explanation: 'Heap sort is not stable.' },
        { question: `What does debounce help with in ${tech}?`, options: ['Batch API calls','Limit rapid triggers','Memoize results','Parallelize code'], answer: 1, explanation: 'Debounce limits rapid triggers.' }
      ];
      return shuffleArray(bank).slice(0,5);
    }

    function fallbackOpen(goal, tech, kind) {
      if (kind === 'technical_interview') {
        const bankT = [
          { question: `Explain a project in ${tech} relevant to a ${goal}.`, explanation: 'Discuss design, trade-offs, and impact.' },
          { question: `How to profile and optimize a slow ${tech} endpoint?`, explanation: 'Describe measurement, bottlenecks, and fixes.' },
          { question: `Design a simple rate limiter for a ${goal} app.`, explanation: 'Consider token bucket/sliding window.' },
          { question: `How do you structure error handling in ${tech}?`, explanation: 'Show patterns and consistency.' },
          { question: `Pick a data structure you often use in ${tech} and why.`, explanation: 'Tie to use-cases and complexity.' }
        ];
        return shuffleArray(bankT).slice(0,5);
      }
      const bankH = [
        { question: `Why ${goal}?`, explanation: 'Connect motivation to role and impact.' },
        { question: `Tell me about a conflict you resolved.`, explanation: 'Use STAR; show empathy and outcomes.' },
        { question: `How do you handle pressure and deadlines?`, explanation: 'Prioritization and communication.' },
        { question: `What is your biggest learning recently?`, explanation: 'Be specific and actionable.' },
        { question: `Where do you see yourself in 2 years as a ${goal}?`, explanation: 'Show growth plan aligned with role.' },
        { question: `Describe feedback you received and how you acted on it.`, explanation: 'Demonstrate growth mindset.' }
      ];
      return shuffleArray(bankH).slice(0,5);
    }

    // Utilities
    async function getUserProfile() {
      try {
        const res = await fetch('http://localhost:3000/api/profile', { credentials: 'include' });
        const data = await res.json();
        return data && data.success ? data.user : null;
      } catch (_) {
        return null;
      }
    }

    function pickFive(arr) {
      // if more than 5, shuffle pick 5, else pad by cycling
      const out = [];
      const src = [...arr];
      for (let i = src.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [src[i], src[j]] = [src[j], src[i]];
      }
      while (out.length < 5) {
        out.push(src[out.length % src.length]);
        if (out.length >= 5) break;
      }
      return out;
    }

    function toMCQ(item) {
      return {
        question: item.q,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation || ''
      };
    }

    function renderMCQForm(q) {
      const opts = q.options.map((opt, i) => `<label style="display:block;margin-bottom:8px;"><input type="radio" name="option" value="${i}"> ${escapeHTML(opt)}</label>`).join('');
      return `
        <form id="answerForm">
          <div class="options">${opts}</div>
          <button class="btn" type="submit" style="margin-top:8px;">Submit</button>
        </form>
      `;
    }

    function renderOpenForm() {
      return `
        <form id="answerForm">
          <textarea name="textAnswer" rows="4" style="width:100%;margin-top:6px;" placeholder="Type your answer..."></textarea>
          <button class="btn" type="submit" style="margin-top:8px;">Submit</button>
        </form>
      `;
    }

    function escapeHTML(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // ===== Helpers for diverse, fresh generation =====
    function fingerprint(goal, tech) {
      const s = `${(goal||'').toLowerCase()}|${(tech||'').toLowerCase()}`;
      let h = 0;
      for (let i = 0; i < s.length; i += 1) {
        h = ((h << 5) - h) + s.charCodeAt(i);
        h |= 0;
      }
      return `${h >>> 0}`;
    }

    function buildMCQPrompts(kind, goal, tech, schema, prevSnippet, profileTag) {
      const baseApt = [
        `You are a senior interviewer. Create 5 MCQs focused on practical logic, estimation, and light complexity for a ${goal} using ${tech}. ${schema} ${prevSnippet} Use fresh scenarios. Tag:${uniqueTag()} PF:${profileTag}`,
        `Produce 5 distinct MCQs blending real-world ${goal} decision-making and basic time/space trade-offs in ${tech}. ${schema} ${prevSnippet} No duplicates. Tag:${uniqueTag()} PF:${profileTag}`,
        `Design 5 MCQs that test reasoning about data structures, simple algorithms, and pragmatic choices a ${goal} makes with ${tech}. ${schema} ${prevSnippet} Strictly new content. Tag:${uniqueTag()} PF:${profileTag}`
      ];
      const baseTech = [
        `Generate 5 MCQs to assess ${tech} fundamentals and debugging for a ${goal}. Include APIs, patterns, pitfalls. ${schema} ${prevSnippet} Keep them novel. Tag:${uniqueTag()} PF:${profileTag}`,
        `Craft 5 MCQs on ${tech} language/runtime specifics, tooling, and practical design for a ${goal}. ${schema} ${prevSnippet} Avoid prior patterns. Tag:${uniqueTag()} PF:${profileTag}`,
        `Create 5 MCQs for ${goal} in ${tech} emphasizing correctness, performance, and best practices. ${schema} ${prevSnippet} Must be unique. Tag:${uniqueTag()} PF:${profileTag}`
      ];
      return kind === 'aptitude' ? baseApt : baseTech;
    }

    function buildOpenPrompts(kind, goal, tech, schema, prevSnippet, profileTag) {
      const baseTech = [
        `Compose 5 technical interview prompts for a ${goal} specializing in ${tech}. Cover design, debugging, and trade-offs. Include an "explanation" hint. ${schema} ${prevSnippet} Fresh only. Tag:${uniqueTag()} PF:${profileTag}`,
        `Write 5 open-ended ${tech} prompts for a ${goal} about architecture and problem-solving. Provide brief guidance in "explanation". ${schema} ${prevSnippet} No repeats. Tag:${uniqueTag()} PF:${profileTag}`
      ];
      const baseHR = [
        `Create 5 HR interview prompts tailored to a ${goal} (behavioral, motivation, teamwork). Include guidance in "explanation". ${schema} ${prevSnippet} New content only. Tag:${uniqueTag()} PF:${profileTag}`,
        `Provide 5 HR-style questions for a ${goal} with succinct guidance in "explanation". ${schema} ${prevSnippet} Avoid past prompts. Tag:${uniqueTag()} PF:${profileTag}`
      ];
      return kind === 'technical_interview' ? baseTech : baseHR;
    }

    function sample(arr, n) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, Math.max(1, Math.min(n, copy.length)));
    }

    function mergeMCQResults(texts) {
      const all = [];
      for (const t of texts) {
        const arr = validateMCQs(t);
        if (arr) all.push(...arr);
      }
      const seen = new Set();
      const out = [];
      for (const q of all) {
        const key = (q.question || '').trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(q);
        if (out.length >= 5) break;
      }
      return out.length ? out : null;
    }

    function mergeOpenResults(texts) {
      const all = [];
      for (const t of texts) {
        const arr = validateOpen(t);
        if (arr) all.push(...arr);
      }
      const seen = new Set();
      const out = [];
      for (const q of all) {
        const key = (q.question || '').trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(q);
        if (out.length >= 5) break;
      }
      return out.length ? out : null;
    }

  // (Removed) Generate single question from specific AI API

    // Remove duplicate questions (exact matches and similar content)
    function removeDuplicateQuestions(questions) {
      const unique = [];
      const seenQuestions = new Set();
      const seenContent = new Set();
      
      for (const question of questions) {
        const questionKey = question.question.trim().toLowerCase();
        const contentHash = generateContentHash(question.question);
        
        // Check for exact duplicates
        if (seenQuestions.has(questionKey)) {
          continue;
        }
        
        // Check for similar content (prevent paraphrased duplicates)
        if (seenContent.has(contentHash)) {
          continue;
        }
        
        // Check against global question history
        if (isQuestionInHistory(questionKey)) {
          continue;
        }
        
        // Add to unique questions and mark as seen
        unique.push(question);
        seenQuestions.add(questionKey);
        seenContent.add(contentHash);
        
        // Add to global history
        addQuestionToHistory(questionKey);
      }
      
      return unique;
    }

    // Generate content hash for similarity detection
    function generateContentHash(text) {
      // Remove common words and create a hash
      const cleanText = text.toLowerCase()
        .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall)\b/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    }

    // Global question history management
    const GLOBAL_QUESTION_HISTORY_KEY = 'global_question_history';
    
    function isQuestionInHistory(questionKey) {
      try {
        const history = JSON.parse(localStorage.getItem(GLOBAL_QUESTION_HISTORY_KEY) || '[]');
        return history.some(h => h.question === questionKey);
      } catch (e) {
        return false;
      }
    }
    
    function addQuestionToHistory(questionKey) {
      try {
        const history = JSON.parse(localStorage.getItem(GLOBAL_QUESTION_HISTORY_KEY) || '[]');
        const timestamp = Date.now();
        
        // Add new question with timestamp
        history.push({ question: questionKey, timestamp });
        
        // Keep only last 1000 questions to prevent localStorage from getting too large
        if (history.length > 1000) {
          history.splice(0, history.length - 1000);
        }
        
        localStorage.setItem(GLOBAL_QUESTION_HISTORY_KEY, JSON.stringify(history));
      } catch (e) {
        console.warn('Could not save question to history:', e);
      }
    }

    // Purge old global history (older than 3 days) on each visit
    (function purgeOldHistory(){
      try {
        const raw = localStorage.getItem(GLOBAL_QUESTION_HISTORY_KEY);
        if (!raw) return;
        const now = Date.now();
        const arr = JSON.parse(raw) || [];
        const kept = arr.filter(it => (now - (it.timestamp||0)) < 3*24*60*60*1000).slice(-1000);
        localStorage.setItem(GLOBAL_QUESTION_HISTORY_KEY, JSON.stringify(kept));
      } catch (_) {}
    })();

    // Fill missing questions with unique fallbacks
    function fillWithUniqueFallbacks(existingQuestions, goal, tech, kind, targetCount) {
      if (existingQuestions.length >= targetCount) {
        return existingQuestions;
      }
      
      const needed = targetCount - existingQuestions.length;
      const fallbacks = kind === 'aptitude' || kind === 'technical' 
        ? fallbackMCQs(goal, tech) 
        : fallbackOpen(goal, tech, kind);
      
      const uniqueFallbacks = [];
      const existingKeys = new Set(existingQuestions.map(q => q.question.trim().toLowerCase()));
      
      for (const fallback of fallbacks) {
        if (uniqueFallbacks.length >= needed) break;
        
        const fallbackKey = fallback.question.trim().toLowerCase();
        
        // Check if this fallback is already in existing questions
        if (existingKeys.has(fallbackKey)) {
          continue;
        }
        
        // Check if this fallback is in global history
        if (isQuestionInHistory(fallbackKey)) {
          continue;
        }
        
        // Add to unique fallbacks
        uniqueFallbacks.push(fallback);
        existingKeys.add(fallbackKey);
        addQuestionToHistory(fallbackKey);
      }
      
      return [...existingQuestions, ...uniqueFallbacks];
    }

    // Shuffle array function
    function shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
  });
})();
