
import os
import pdfplumber
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Config ---
OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

VALID_JOB_KEYWORDS = [
    "developer", "engineer", "designer", "manager", "analyst", "tester",
    "architect", "consultant", "intern", "administrator", "specialist",
    "scientist", "technician", "coordinator", "supervisor"
]

INTERVIEW_STAGES = [
    "introduction", "strengths", "weaknesses", "experience",
    "technical", "technical2", "technical3",
    "behavioral", "behavioral2", "final_question"
]


@app.route("/")
def index():
    return send_file("index.html")


# --- Extract resume text ---
def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        return "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())


@app.route("/upload", methods=["POST"])
def upload_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["resume"]
    text = extract_text_from_pdf(file)
    return jsonify({"text": text})


@app.route("/ask", methods=["POST"])
def ask_question():
    try:
        data = request.json
        resume_text = data.get("resume", "")
        job_title = data.get("job", "").strip().lower()
        history = data.get("history", [])
        scores = data.get("scores", [])

        # --- Validate job title ---
        if not any(keyword in job_title for keyword in VALID_JOB_KEYWORDS):
            return jsonify({
                "error": "Invalid job title. Please enter a proper title like 'Software Engineer' or 'Data Analyst'."
            }), 400

        question_number = len(history) + 1

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://localhost:5000",
            "X-Title": "Mock Interview Bot",
            "Content-Type": "application/json"
        }

        # --- If interview is over (10 answers given) ---
        if len(history) >= 10:
            avg_score = round(sum(scores) / len(scores), 1) if scores else 0

            closing_prompt = f"""
You are an interviewer finishing a mock interview for the role of {job_title}.
Here is the full Q&A so far:
{chr(10).join(history)}

The candidate's total average score was {avg_score}/10.

Now write a short, realistic closing message as in real interviews:
- Mention the candidate's performance (strong areas & areas to improve)
- Congratulate or encourage them
- Keep it professional (4–6 sentences max)
"""

            payload = {
                "model": "openai/gpt-3.5-turbo",
                "messages": [{"role": "user", "content": closing_prompt}]
            }

            response = requests.post(OPENROUTER_BASE_URL, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            closing_message = result["choices"][0]["message"]["content"].strip()

            return jsonify({
                "question": closing_message,
                "stage": "closing",
                "is_final": True,
                "average_score": avg_score
            })

        # --- Otherwise, ask next question + score last answer ---
        current_stage = INTERVIEW_STAGES[min(question_number - 1, len(INTERVIEW_STAGES) - 1)]
        last_answer = history[-1] if history else None

        scoring_prompt = f"""
You are an interviewer for the role of {job_title}.
Candidate's resume:
{resume_text}

Conversation so far:
{chr(10).join(history) if history else "No prior questions yet."}

If there is a new candidate answer (the last line), evaluate it.
Give:
1. A score out of 10 (based on relevance, clarity, confidence, correctness)
2. One-line constructive feedback.
3. Then ask the next question based on that answer and resume.

Respond **strictly in JSON** like this:
{{
  "score": <number>,
  "feedback": "<short feedback>",
  "next_question": "<your next interview question>"
}}
"""

        payload = {
            "model": "openai/gpt-3.5-turbo",
            "messages": [{"role": "user", "content": scoring_prompt}]
        }

        response = requests.post(OPENROUTER_BASE_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"].strip()

        # Try to parse model JSON safely
        import json
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = {
                "score": 7,
                "feedback": "Good response. Try to be more specific next time.",
                "next_question": content
            }

        score = parsed.get("score", 7)
        feedback = parsed.get("feedback", "Good response.")
        next_question = parsed.get("next_question", "Can you elaborate more?")

        scores.append(score)

        return jsonify({
            "question": next_question,
            "feedback": feedback,
            "score": score,
            "average_score": round(sum(scores) / len(scores), 1),
            "stage": current_stage,
            "is_final": False,
            "scores": scores
        })

    except Exception as e:
        print("Backend error:", str(e))
        return jsonify({"error": f"Backend failure: {str(e)}"}), 500


if __name__ == "__main__":
    print("Starting Flask app with scoring enabled...")
    app.run(debug=True)
