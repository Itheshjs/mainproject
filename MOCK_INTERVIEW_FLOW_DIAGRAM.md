# Mock Interview Score Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MOCK INTERVIEW SCORING FLOW                       │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: USER STARTS INTERVIEW
┌──────────────────────────┐
│  User clicks              │
│  "Mock Interview"        │
│  • Enters job title      │
│  • Uploads resume        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Flask Backend (app.py)  │
│  Generates 10 questions  │
│  using GPT-3.5-turbo     │
└────────┬─────────────────┘
         │
         ▼

Step 2: ANSWERING QUESTIONS (Repeats 10 times)
┌──────────────────────────────────────────┐
│  User answers question 1-10               │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  AI evaluates answer (0-10 scale)        │
│  • Relevance:    0-2.5 points           │
│  • Clarity:      0-2.5 points           │
│  • Confidence:   0-2.5 points           │
│  • Correctness:  0-2.5 points           │
│  Example: 7.5/10                        │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Score stored internally                 │
│  scores = [7, 8, 6.5, 7.5, ...]         │
└──────────────────────────────────────────┘

Step 3: INTERVIEW COMPLETION (After 10 questions)
┌──────────────────────────────────────────┐
│  Backend calculates average:             │
│  avg = (7+8+6.5+7.5+...)/10 = 7.5      │
│                                          │
│  Converts to 0-100 scale:               │
│  final_score = 7.5 × 10 = 75/100       │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Returns to frontend:                    │
│  {                                       │
│    "average_score": 75,                 │
│    "is_final": true,                    │
│    "question": "Closing message..."     │
│  }                                       │
└────────┬─────────────────────────────────┘
         │
         ▼

Step 4: DISPLAY & SAVE SCORE
┌──────────────────────────────────────────┐
│  Frontend displays:                      │
│  🎯 Final Interview Score: 75/100       │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  POST /api/mock-interview-score          │
│  {                                       │
│    score: 75,                           │
│    jobTitle: "Software Engineer",       │
│    timestamp: "2025-11-25T10:30:00Z"   │
│  }                                       │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Saved to MongoDB:                       │
│  MockInterviewScore collection           │
│  • userId: ObjectId(...)                │
│  • score: 75                            │
│  • jobTitle: "Software Engineer"        │
│  • timestamp: 2025-11-25...             │
│  • totalQuestions: 10                   │
└────────┬─────────────────────────────────┘
         │
         ▼

Step 5: VIEW SCORES
┌──────────────────────────────────────────┐
│  Track Progress Modal (index.html)       │
│  ┌────────────────────────────────────┐ │
│  │  Resume Score:     85/100          │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │ │
│  │                                    │ │
│  │  Smart Practice:   80%             │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │ │
│  │                                    │ │
│  │  Mock Interview:   75/100  ⬅ NEW! │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │ │
│  │  Latest: 11/25/25 • Software Eng   │ │
│  │                                    │ │
│  │  Recent Attempts:                  │ │
│  │  • 11/25/25 • SE — 75/100         │ │
│  │  • 11/24/25 • DA — 68/100         │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  Profile Page (profile.html)             │
│  ┌────────────────────────────────────┐ │
│  │  Resume Analysis Score:            │ │
│  │     ╭─────────╮                    │ │
│  │     │   85    │  ← Circle gradient │ │
│  │     ╰─────────╯                    │ │
│  │                                    │ │
│  │  Smart Practice Score:             │ │
│  │     ╭─────────╮                    │ │
│  │     │   80%   │                    │ │
│  │     ╰─────────╯                    │ │
│  │                                    │ │
│  │  Mock Interview Score:   ⬅ NEW!   │ │
│  │     ╭─────────╮                    │ │
│  │     │ 75/100  │                    │ │
│  │     ╰─────────╯                    │ │
│  │  11/25/25 • Software Engineer      │ │
│  │                                    │ │
│  │  Recent Attempts:                  │ │
│  │  • 11/25/25 • SE — 75/100         │ │
│  │  • 11/24/25 • DA — 68/100         │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
KEY COMPONENTS
═══════════════════════════════════════════════════════════════════════════

Backend (Node.js):
├── server.js
│   ├── POST /api/mock-interview-score ────────► Save scores to MongoDB
│   └── GET /api/mock-interview-scores ────────► Retrieve user's scores

Mock Interview Bot (Python Flask):
├── app.py
│   └── POST /ask ────────────────────────────► Generate questions & scores
└── index.html
    ├── askQuestion() ────────────────────────► Fetch questions from backend
    └── saveMockInterviewScore() ─────────────► Save final score via API

Frontend Display:
├── index.html (Track Progress)
│   ├── loadMockInterviewScores() ────────────► Fetch & display scores
│   └── setMockDonut() ───────────────────────► Update donut chart
├── profile.html
│   └── Mock Interview Score section
└── profile.js
    └── loadMockInterviewScore() ─────────────► Fetch & display in profile


═══════════════════════════════════════════════════════════════════════════
SCORE CONVERSION REFERENCE
═══════════════════════════════════════════════════════════════════════════

Individual Answer Scoring (0-10):
┌─────────┬──────────────────────────────────────┐
│  Score  │  Quality                             │
├─────────┼──────────────────────────────────────┤
│  9-10   │  Excellent (all criteria met)        │
│  7-8    │  Good (most criteria met)            │
│  5-6    │  Fair (some criteria met)            │
│  3-4    │  Poor (few criteria met)             │
│  0-2    │  Very Poor (minimal criteria met)    │
└─────────┴──────────────────────────────────────┘

Final Score Conversion (0-100):
┌─────────────┬──────────────────────────────────┐
│  Average    │  Final Score                     │
├─────────────┼──────────────────────────────────┤
│  10.0/10    │  100/100  (Perfect!)            │
│  9.0/10     │  90/100   (Excellent)           │
│  8.0/10     │  80/100   (Very Good)           │
│  7.5/10     │  75/100   (Good)                │
│  7.0/10     │  70/100   (Above Average)       │
│  6.0/10     │  60/100   (Average)             │
│  5.0/10     │  50/100   (Below Average)       │
└─────────────┴──────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
TESTING EXAMPLE
═══════════════════════════════════════════════════════════════════════════

Complete Interview Example:
Q1: "Tell me about yourself" → Answer: "I'm a developer..." → Score: 8/10
Q2: "What are your strengths?" → Answer: "I excel at..." → Score: 7/10
Q3: "Describe a challenge..." → Answer: "Once I faced..." → Score: 7.5/10
...
Q10: "Any questions for us?" → Answer: "Yes, I'd like..." → Score: 8/10

Average: (8+7+7.5+...+8)/10 = 7.5/10
Final Score: 7.5 × 10 = 75/100

User sees:
🎯 Final Interview Score: 75/100

Saved to database:
{
  userId: "507f1f77bcf86cd799439011",
  score: 75,
  jobTitle: "Software Engineer",
  timestamp: "2025-11-25T10:30:00.000Z",
  totalQuestions: 10
}
```
