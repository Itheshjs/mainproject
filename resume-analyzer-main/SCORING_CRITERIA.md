# Resume Analyzer Scoring Criteria

## Overview
The Resume Analyzer uses AI (Gemini) to evaluate resumes and provides a score from **0 to 100**. The score is calculated based on four key criteria, each worth **25 points**.

## Scoring Breakdown (Total: 100 points)

### 1. Formatting & Readability (25 points)
**What is evaluated:**
- Is the layout clean and professional?
- Is the resume easy to parse and read?
- Is it free of formatting errors?
- Is the structure logical and well-organized?

**What to improve:**
- Use consistent formatting throughout
- Ensure proper spacing and margins
- Use clear section headers
- Avoid formatting errors (broken lines, inconsistent fonts, etc.)
- Make sure the resume is easy to scan quickly

### 2. Keyword Optimization (25 points)
**What is evaluated:**
- Does the resume use relevant industry keywords?
- Are important technical terms and skills mentioned?
- Is the resume optimized for ATS (Applicant Tracking System) scanning?

**What to improve:**
- Include relevant industry-specific keywords
- Mention technical skills and tools explicitly
- Use terminology that matches job descriptions
- Include certifications and qualifications
- Ensure keywords are naturally integrated (not just keyword stuffing)

### 3. Action Verbs & Impact (25 points)
**What is evaluated:**
- Do bullet points start with strong action verbs?
- Are achievements quantified with numbers/metrics?
- Do descriptions show impact and results?

**What to improve:**
- Start bullet points with action verbs (e.g., "Developed", "Implemented", "Led", "Increased")
- Quantify achievements with specific numbers (e.g., "Increased sales by 30%", "Managed team of 5")
- Show impact and results, not just responsibilities
- Use metrics, percentages, dollar amounts, timeframes
- Focus on accomplishments rather than duties

### 4. Content Clarity & Conciseness (25 points)
**What is evaluated:**
- Is the language clear, direct, and professional?
- Is the information relevant and focused?
- Is the resume concise without unnecessary details?
- Is the content easy to understand?

**What to improve:**
- Use clear, professional language
- Remove unnecessary words and filler content
- Focus on relevant information
- Keep descriptions concise but informative
- Ensure each section adds value
- Avoid jargon unless it's industry-standard

## How the Score is Calculated

The AI model (Gemini) analyzes the entire resume and evaluates each of the four criteria above. It then:
1. Assigns points for each criterion (0-25 points each)
2. Sums up the total score (0-100)
3. Provides detailed feedback on strengths, weaknesses, and improvements

## Score Interpretation

- **90-100**: Excellent resume, well-optimized for ATS and human reviewers
- **75-89**: Good resume with minor areas for improvement
- **60-74**: Average resume, needs significant improvements
- **Below 60**: Resume needs major revisions

## Additional Feedback Provided

The analyzer also provides:
- **Strengths**: What your resume does well
- **Weaknesses**: Areas where it's lacking
- **Improvements**: Specific, actionable suggestions
- **Overall Feedback**: Summary of the resume's effectiveness

## Technical Details

- **AI Model**: Google Gemini (temperature: 0.0 for consistent results)
- **Analysis Method**: Acts as a sophisticated ATS system
- **File Types Supported**: PDF, DOCX (max 5MB)
- **Score Range**: 0-100 (integer)

## Location of Scoring Logic

The scoring criteria are defined in:
- **File**: `resume-analyzer-main/src/ai/flows/analyze-resume.ts`
- **Lines**: 52-56 (scoring criteria in the AI prompt)

The AI prompt instructs the model to evaluate resumes based on these four criteria and calculate a score that reflects the actual content quality.















