# Mock Interview Bot - How It Works

## Overview
The Mock Interview Bot is an AI-powered interview simulation system that conducts realistic mock interviews based on your resume and a target job title. It uses GPT-3.5-turbo (via OpenRouter) to generate questions, evaluate answers, and provide real-time feedback.

## How It Works

### 1. **Initial Setup**
When you start the interview:
- **Upload Resume**: You upload a PDF resume
- **Enter Job Title**: You specify the target job title (e.g., "Software Engineer", "Data Analyst")
- **Resume Extraction**: The system extracts text from your PDF resume using `pdfplumber`

### 2. **Interview Flow**
The interview follows a structured progression through multiple stages:

#### Interview Stages (in order):
1. **Introduction** - Initial greeting and setup
2. **Strengths** - Questions about your strengths
3. **Weaknesses** - Questions about your weaknesses
4. **Experience** - Questions about your work experience
5. **Technical** - Technical questions (Stage 1)
6. **Technical2** - Technical questions (Stage 2)
7. **Technical3** - Technical questions (Stage 3)
8. **Behavioral** - Behavioral questions (Stage 1)
9. **Behavioral2** - Behavioral questions (Stage 2)
10. **Final Question** - Final question before closing
11. **Closing** - Interview conclusion with feedback

### 3. **Question Generation Process**

For each question, the AI:
1. **Analyzes Context**:
   - Reviews your resume content
   - Considers the job title
   - Looks at previous Q&A history
   - Tracks current interview stage

2. **Generates Question**:
   - Creates contextually relevant questions
   - Adapts based on your previous answers
   - Progresses through interview stages naturally
   - Uses GPT-3.5-turbo via OpenRouter API

3. **Evaluates Answer** (after you respond):
   - Scores your answer out of 10 points
   - Provides constructive feedback
   - Generates the next question based on your response

### 4. **Scoring System**

#### How Answers Are Scored (0-10 points):
The AI evaluates each answer based on:
- **Relevance** (0-2.5 points): How relevant is the answer to the question?
- **Clarity** (0-2.5 points): Is the answer clear and well-structured?
- **Confidence** (0-2.5 points): Does the answer show confidence and professionalism?
- **Correctness** (0-2.5 points): Is the answer factually correct and appropriate?

#### Scoring Response Format:
```json
{
  "score": 8,
  "feedback": "Good response. Try to be more specific next time.",
  "next_question": "Can you tell me about a challenging project you worked on?"
}
```

### 5. **Real-Time Feedback**

After each answer, you receive:
- **Immediate Score**: Your score for that specific answer (0-10)
- **Constructive Feedback**: One-line feedback on how to improve
- **Average Score**: Running average of all your answers
- **Next Question**: Contextually relevant follow-up question

### 6. **Interview Completion**

After 10 questions:
- **Final Average Score**: Calculated from all 10 answers
- **Closing Message**: AI-generated summary including:
  - Performance highlights (strong areas)
  - Areas for improvement
  - Professional encouragement
  - 4-6 sentence summary

## Technical Details

### Backend (Flask - Python)
- **File**: `mock-interview-bot/mock-interview-bot/app.py`
- **Framework**: Flask with CORS enabled
- **API**: OpenRouter API (GPT-3.5-turbo)
- **Resume Parsing**: pdfplumber library

### Key Endpoints:

#### 1. `/upload` (POST)
- Uploads and extracts text from PDF resume
- Returns extracted resume text

#### 2. `/ask` (POST)
- Receives: resume text, job title, chat history, scores
- Returns: next question, feedback, score, average score, stage
- Validates job title against valid keywords

### Frontend (HTML/JavaScript)
- **File**: `mock-interview-bot/mock-interview-bot/index.html`
- **Framework**: Vanilla JavaScript with Tailwind CSS
- **Features**: Real-time chat interface, stage indicator, score tracking

### Valid Job Keywords
The system validates job titles against these keywords:
- developer, engineer, designer, manager, analyst, tester
- architect, consultant, intern, administrator, specialist
- scientist, technician, coordinator, supervisor

## Interview Process Flow

```
1. User uploads resume PDF
   ↓
2. System extracts text from PDF
   ↓
3. User enters job title
   ↓
4. System validates job title
   ↓
5. Interview starts (Stage: Introduction)
   ↓
6. AI generates first question based on resume + job title
   ↓
7. User provides answer
   ↓
8. AI evaluates answer:
   - Scores (0-10)
   - Provides feedback
   - Generates next question
   ↓
9. Process repeats for 10 questions
   ↓
10. After 10th answer:
    - Calculate final average score
    - Generate closing message
    - Interview ends
```

## AI Prompt Structure

### For Regular Questions:
```
You are an interviewer for the role of {job_title}.
Candidate's resume:
{resume_text}

Conversation so far:
{history}

If there is a new candidate answer (the last line), evaluate it.
Give:
1. A score out of 10 (based on relevance, clarity, confidence, correctness)
2. One-line constructive feedback.
3. Then ask the next question based on that answer and resume.

Respond **strictly in JSON** like this:
{
  "score": <number>,
  "feedback": "<short feedback>",
  "next_question": "<your next interview question>"
}
```

### For Closing Message:
```
You are an interviewer finishing a mock interview for the role of {job_title}.
Here is the full Q&A so far:
{history}

The candidate's total average score was {avg_score}/10.

Now write a short, realistic closing message as in real interviews:
- Mention the candidate's performance (strong areas & areas to improve)
- Congratulate or encourage them
- Keep it professional (4–6 sentences max)
```

## Features

### ✅ What It Does:
- **Contextual Questions**: Questions adapt based on your resume and previous answers
- **Real-time Scoring**: Get immediate feedback after each answer
- **Progressive Stages**: Interview naturally progresses through different stages
- **Resume-Based**: Questions are tailored to your actual experience
- **Professional Feedback**: Constructive feedback to help you improve

### ⚠️ Limitations:
- **10 Questions Maximum**: Interview ends after 10 questions
- **PDF Only**: Currently only supports PDF resumes
- **Job Title Validation**: Must contain valid job keywords
- **Single AI Model**: Uses GPT-3.5-turbo only (via OpenRouter)

## Score Interpretation

- **9-10**: Excellent answer - highly relevant, clear, confident, and correct
- **7-8**: Good answer - solid response with minor improvements needed
- **5-6**: Average answer - needs more detail or clarity
- **3-4**: Below average - significant improvements needed
- **0-2**: Poor answer - not relevant or incorrect

## How to Use

1. **Start the Flask server**:
   ```bash
   cd mock-interview-bot/mock-interview-bot
   python app.py
   ```

2. **Open the interface**:
   - Navigate to `http://localhost:5000` (or the port Flask uses)

3. **Upload your resume**:
   - Select a PDF file
   - Enter your target job title

4. **Start the interview**:
   - Click "Start Interview"
   - Answer questions as they appear
   - Review feedback and scores after each answer

5. **Complete the interview**:
   - Answer all 10 questions
   - Review your final average score
   - Read the closing feedback

## Configuration

### API Key
The system uses OpenRouter API. The API key is configured in `app.py`:
```python
OPENROUTER_API_KEY = "your-api-key-here"
```

### Model
Currently uses: `openai/gpt-3.5-turbo` via OpenRouter

## File Structure

```
mock-interview-bot/
├── mock-interview-bot/
│   ├── app.py              # Flask backend (main logic)
│   ├── index.html          # Frontend interface
│   ├── requirements.txt    # Python dependencies
│   └── venv/               # Virtual environment
└── MOCK_INTERVIEW_BOT_EXPLANATION.md  # This file
```

## Dependencies

- **Flask**: Web framework
- **flask-cors**: CORS support
- **pdfplumber**: PDF text extraction
- **requests**: HTTP requests to OpenRouter API
- **python-dotenv**: Environment variable management

## Summary

The Mock Interview Bot provides a realistic interview simulation by:
1. Analyzing your resume and job requirements
2. Generating contextually relevant questions
3. Evaluating your answers in real-time
4. Providing constructive feedback
5. Tracking your performance throughout the interview
6. Concluding with a comprehensive summary

It's designed to help you practice for real interviews by simulating the actual interview experience with AI-powered question generation and evaluation.















