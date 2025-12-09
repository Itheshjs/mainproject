// Interview Simulation: 4 stages x 5 questions, personalized from profile
// Stages:
// 1) Aptitude MCQs (scored)
// 2) Technical MCQs (scored)
// 3) Technical Scenario MCQs (scored)
// 4) HR Scenario MCQs (scored)
// Final summary shows total score across all MCQ stages

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
    const stageStats = stages.map(stage => ({
      title: stage.title,
      kind: stage.kind,
      correct: 0,
      total: stage.questions.length
    }));

    renderCurrent();

    function renderCurrent() {
      const stage = stages[currentStageIndex];
      let q = stage.questions[currentQuestionIndex];
      const isMCQ = Array.isArray(q.options) && q.options.length > 0 && typeof q.answer === 'number';
      if (!isMCQ) {
        const fallbackPool = fallbackMCQs(careerGoal, preferredTech, stage.kind);
        if (fallbackPool.length) {
          const fallback = fallbackPool[currentQuestionIndex % fallbackPool.length];
          stage.questions[currentQuestionIndex] = fallback;
          q = fallback;
        } else {
          console.warn('Missing MCQ data; skipping to next question.');
          appendNextButton();
          return;
        }
      }
      
      // Remove 'Powered by: Gemini AI' text from the question if it exists
      const cleanQuestion = q.question.replace(/\s*Powered by: Gemini AI\s*/gi, '').trim();

    app.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div><b>${escapeHTML(stage.title)}</b></div>
          <div style="color:#666;">Question ${currentQuestionIndex + 1} of 5</div>
      </div>
        <div class="question" style="font-size:1.05rem;margin-bottom:12px;">${escapeHTML(cleanQuestion)}</div>
        ${renderMCQForm(q)}
        <div id="feedback" class="feedback" style="margin-top:12px;"></div>
        <div style="margin-top:16px;color:#666;">Progress: Stage ${currentStageIndex + 1} of 4</div>
      `;

      const form = document.getElementById('answerForm');
      form.onsubmit = (e) => {
    e.preventDefault();
        handleMCQSubmit(q);
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
        if (stageStats[currentStageIndex]) {
          stageStats[currentStageIndex].correct = Math.min(
            stageStats[currentStageIndex].correct + 1,
            stageStats[currentStageIndex].total
          );
        }
        feedback.innerHTML = '<span style="color:green;font-weight:600;">Correct!</span>' + (q.explanation ? `<div style="margin-top:6px;">${escapeHTML(q.explanation)}</div>` : '');
      } else {
        feedback.innerHTML = '<span style="color:#d9534f;font-weight:600;">Wrong.</span>' +
          (typeof q.answer === 'number' && q.options[q.answer] ? ` <span>Correct: <b>${escapeHTML(q.options[q.answer])}</b></span>` : '') +
          (q.explanation ? `<div style="margin-top:6px;">${escapeHTML(q.explanation)}</div>` : '');
      }
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

async function showSummary() {
      const totalMCQs = stageStats.reduce((sum, stat) => sum + stat.total, 0);
      const percentageScore = Math.round(totalMCQs ? (score / totalMCQs) * 100 : 0);
      const stageBreakdown = stageStats.map(stat => {
        const pct = stat.total ? Math.round((stat.correct / stat.total) * 100) : 0;
        return {
          title: stat.title,
          kind: stat.kind,
          correct: stat.correct,
          total: stat.total,
          percentage: pct
        };
      });
      const stageGraph = stageBreakdown.map(stat => `
        <div class="stage-row">
          <div class="stage-row__header">
            <span>${escapeHTML(stat.title)}</span>
            <span>${stat.correct}/${stat.total} (${stat.percentage}%)</span>
          </div>
          <div class="stage-row__bar">
            <div class="stage-row__bar-fill" style="width:${stat.percentage}%;"></div>
          </div>
        </div>
      `).join('');
      const delta = stageBreakdown.reduce((acc, stat) => acc + stat.correct, 0);
      
      // Save the practice score
      try {
        const response = await fetch(window.API_CONFIG ? window.API_CONFIG.BASE_URL + '/api/smart-practice-score' : 'http://localhost:3000/api/smart-practice-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            score: percentageScore,
            percentage: percentageScore,
            totalQuestions: totalMCQs,
            correctAnswers: score,
            stage: 'All Stages',
            stageBreakdown
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to save practice score');
        }
      } catch (error) {
        console.error('Error saving practice score:', error);
        // Continue showing the summary even if saving fails
      }
      
      app.innerHTML = `
        <div class="stage-title" style="font-size:1.25rem;margin-bottom:10px;">Interview Complete!</div>
        <div class="summary" style="background:#f7fafd;border-radius:10px;padding:16px;">
          <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center;">
            <div style="flex:1;min-width:220px;">
              <p style="margin:0 0 8px 0;"><b>Total MCQ Score:</b> ${score} / ${totalMCQs} (${percentageScore}%)</p>
              <p style="margin:0;"><b>Target Role:</b> ${escapeHTML(careerGoal)}</p>
              <p style="margin:0;"><b>Primary Tech:</b> ${escapeHTML(preferredTech)}</p>
            </div>
            <div style="min-width:220px;">
              <div style="font-size:0.9rem;color:#475569;">Overall Accuracy</div>
              <div style="font-size:2.25rem;font-weight:700;color:#0f172a;">${percentageScore}%</div>
              <div style="font-size:0.85rem;color:#64748b;">${delta}/${totalMCQs} correct</div>
            </div>
          </div>
          <div class="stage-breakdown">
            <h3 style="margin:12px 0 4px 0;">Stage Performance</h3>
            ${stageGraph}
          </div>
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
      const [aptitude, technical, technicalInterview, hrInterview] = await Promise.all([
        generateMCQSet(goal, tech, 'aptitude'),
        generateMCQSet(goal, tech, 'technical'),
        generateMCQSet(goal, tech, 'technical_interview'),
        generateMCQSet(goal, tech, 'hr_interview'),
      ]);
      return [
        { title: 'Stage 1 – Aptitude Test', kind: 'aptitude', questions: aptitude },
        { title: 'Stage 2 – Technical Test', kind: 'technical', questions: technical },
        { title: 'Stage 3 – Technical Interview (MCQ)', kind: 'technical_interview', questions: technicalInterview },
        { title: 'Stage 4 – HR Interview (MCQ)', kind: 'hr_interview', questions: hrInterview },
      ];
    }

    const GEMINI_API_KEY = "AIzaSyC3IkDvwqAtlLO5cdrRx9ZEr0z0X_gWH3k";
    const GEMINI_URL = window.API_CONFIG ? window.API_CONFIG.GEMINI_GENERATE : `http://localhost:3000/api/gemini-generate`;

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
      let merged = mergeMCQResults(texts) || fallbackMCQs(goal, tech, kind);
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

    // Fallbacks if API fails
    function fallbackMCQs(goal, tech, kind) {
      const base = [
        { question: `Which data structure best fits prioritizing user tickets for a ${goal}?`, options: ['Stack','Priority Queue','Queue','Set'], answer: 1, explanation: 'Priority Queue processes highest priority first.' },
        { question: `In ${tech}, what is the output type of typeof null?`, options: ['null','object','undefined','string'], answer: 1, explanation: 'Legacy quirk: typeof null === "object".' },
        { question: `Best structure for fast userId → profile lookup in ${tech}?`, options: ['Array','Map/Hash','Queue','List'], answer: 1, explanation: 'Hash maps provide average O(1) key lookup.' },
        { question: `Big-O for merging two sorted arrays of size n and m?`, options: ['O(n+m)','O(n log m)','O(log(n+m))','O(n*m)'], answer: 0, explanation: 'Linear merge across both arrays.' },
        { question: `Which complexity is best for real-time feed in ${goal}?`, options: ['O(n^2)','O(n log n)','O(log n)','O(1) amortized'], answer: 3, explanation: 'Aim near O(1) amortized for hot paths.' },
        { question: `In ${tech}, which DS is ideal for LRU cache order?`, options: ['Array','LinkedHashMap/Deque','Stack','Set'], answer: 1, explanation: 'Deque + hash gives O(1) update/evict.' },
        { question: `For a ${goal}, which is NOT stable sorting?`, options: ['Merge Sort','Insertion Sort','Heap Sort','Tim Sort'], answer: 2, explanation: 'Heap sort is not stable.' },
        { question: `What does debounce help with in ${tech}?`, options: ['Batch API calls','Limit rapid triggers','Memoize results','Parallelize code'], answer: 1, explanation: 'Debounce limits rapid triggers.' }
      ];
      const techInterview = [
        { question: `You inherit a ${tech} microservice failing under load. What is your first diagnostic step?`, options: ['Add retry loops','Profile and inspect metrics','Scale database writes blindly','Disable logging'], answer: 1, explanation: 'Start with observability to target the fix.' },
        { question: `A recruiter asks how you ensure API backwards compatibility as a ${goal}. Best answer?`, options: ['Always rewrite clients','Version APIs and add contract tests','Ship breaking changes if faster','Ignore as long as docs update'], answer: 1, explanation: 'Versioning plus contract tests preserves clients.' },
        { question: `During a design interview, you are asked about caching strategy. What should you confirm first?`, options: ['Deployment schedule','Consistency needs and TTL','Office location','Team size'], answer: 1, explanation: 'Caching approach depends on required consistency and freshness.' },
        { question: `Debugging a failing CI pipeline in ${tech}, what helps narrow the issue fastest?`, options: ['Re-run blindly','Check commit diff + failing step logs','Roll back the repo','Clear npm cache'], answer: 1, explanation: 'Logs plus diff point to root cause quickly.' },
        { question: `System design interviewer asks about messaging. Which trade-off matters most?`, options: ['Queue color','Async vs sync delivery guarantees','Number of interns','UI theme'], answer: 1, explanation: 'Reliability vs latency is central.' }
      ];
      const hrInterview = [
        { question: `A teammate is missing deadlines repeatedly. What is your first move?`, options: ['Escalate immediately','Offer support and understand blockers','Ignore it','Publicly call them out'], answer: 1, explanation: 'Start with empathy and identify root causes.' },
        { question: `You disagree with your manager's approach. How do you respond?`, options: ['Quit instantly','Discuss data and propose alternatives','Rally others against manager','Do nothing at all'], answer: 1, explanation: 'Constructive feedback with data shows maturity.' },
        { question: `A cross-functional partner sends an urgent request while you are swamped. Best reaction?`, options: ['Say yes then miss deadlines','Clarify priority trade-offs','Ignore them','Complain on social media'], answer: 1, explanation: 'Clarify priorities and negotiate timelines.' },
        { question: `What shows growth mindset in a ${goal} HR round?`, options: ['Avoiding feedback','Sharing a lesson from failure','Blaming others','Hiding mistakes'], answer: 1, explanation: 'Reflecting on failures demonstrates learning.' },
        { question: `How do you showcase cultural fit?`, options: ['Describe collaboration habits','Talk only about salary','Criticize prior teams','Claim you never make mistakes'], answer: 0, explanation: 'Collaboration examples highlight fit.' }
      ];
      if (kind === 'technical_interview') {
        return shuffleArray(techInterview).slice(0, 5);
      }
      if (kind === 'hr_interview') {
        return shuffleArray(hrInterview).slice(0, 5);
      }
      return shuffleArray(base).slice(0, 5);
    }

    // Utilities
    async function getUserProfile() {
      try {
        const apiUrl = window.API_CONFIG ? window.API_CONFIG.PROFILE : 'http://localhost:3000/api/profile';
        const res = await fetch(apiUrl, { credentials: 'include' });
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
      const baseTechInterview = [
        `Draft 5 scenario-based MCQs for a ${goal} that simulate technical interview follow-ups in ${tech}. Focus on architecture choices, debugging tactics, and trade-offs. ${schema} ${prevSnippet} Tag:${uniqueTag()} PF:${profileTag}`,
        `Provide 5 MCQs that mirror live technical interview questions for ${goal} professionals using ${tech}. Stress reasoning, scalability, and integrations. ${schema} ${prevSnippet} Tag:${uniqueTag()} PF:${profileTag}`
      ];
      const baseHR = [
        `Generate 5 MCQs that test behavioral judgement, stakeholder communication, and cultural fit for a ${goal}. Situations should feel like HR interview prompts with multiple-choice responses. ${schema} ${prevSnippet} Tag:${uniqueTag()} PF:${profileTag}`,
        `Create 5 situational MCQs for HR style interviews targeting a ${goal}. Each question should assess decision making, ethics, or teamwork dynamics. ${schema} ${prevSnippet} Tag:${uniqueTag()} PF:${profileTag}`
      ];
      switch (kind) {
        case 'aptitude':
          return baseApt;
        case 'technical':
          return baseTech;
        case 'technical_interview':
          return baseTechInterview;
        case 'hr_interview':
          return baseHR;
        default:
          return baseTech;
      }
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
