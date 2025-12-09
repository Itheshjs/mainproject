# Chatbot System - How It Works

## Overview
The Chatbot is a dual-mode AI assistant that helps users with interview preparation and career-related questions. It operates in two modes: **CSV Mode** (local database) and **Advanced Mode** (AI-powered via Gemini API).

## System Architecture

### Two Operating Modes

#### 1. **CSV Mode (Default)**
- **Data Source**: Local CSV file (`interview_qa.csv`)
- **Response Method**: Fuzzy matching against pre-loaded questions
- **Scope**: Any questions (not limited to job interviews)
- **Speed**: Fast, instant responses
- **Accuracy**: Depends on database coverage

#### 2. **Advanced Mode (AI-Powered)**
- **Data Source**: Google Gemini AI API
- **Response Method**: AI-generated responses
- **Scope**: Job interview related questions only
- **Speed**: Slower (API call required)
- **Accuracy**: High, context-aware responses
- **Features**: Supports text and image inputs

## How It Works

### CSV Mode Workflow

#### Step 1: Data Loading
When the page loads:
1. **Fetch CSV File**: Loads `interview_qa.csv` from the server
2. **Parse CSV**: Extracts questions and answers from the CSV
3. **Normalize Data**: Converts questions to lowercase and normalizes text
4. **Initialize Fuse.js**: Sets up fuzzy matching for intelligent search
5. **Load Aliases**: Registers question aliases for paraphrases

#### Step 2: User Query Processing
When a user sends a message:
1. **Receive Message**: Captures user's question
2. **Normalize Query**: Converts to lowercase, removes punctuation
3. **Search Database**: Uses multiple matching strategies:
   - **Alias Matching**: Checks if query matches known paraphrases
   - **Fuzzy Matching**: Uses Fuse.js for approximate matching
   - **Exact Matching**: Checks for exact matches
   - **Normalized Matching**: Matches normalized versions
   - **Partial Matching**: Scores based on word overlap

#### Step 3: Response Generation
1. **Find Best Match**: Selects the best matching question from database
2. **Return Answer**: Returns the corresponding answer from CSV
3. **Fallback**: If no match found, suggests switching to Advanced mode

### Advanced Mode Workflow

#### Step 1: Query Validation
When a user sends a message:
1. **Check Topic**: Validates if question is job interview related
2. **Keyword Check**: Uses keyword matching to determine relevance
3. **Reject Non-Relevant**: Rejects questions outside job interview scope

#### Step 2: API Request Preparation
1. **Build Payload**: Creates request payload with:
   - User's text message
   - Image data (if uploaded)
   - Chat history (for context)
2. **Send to Backend**: Forwards request to `/api/gemini-generate`

#### Step 3: Backend Processing
1. **Receive Request**: Backend receives the request
2. **Model Discovery**: Tries to discover compatible Gemini models
3. **Fallback Chain**: Attempts multiple models in order:
   - `gemini-2.5-flash` (preferred)
   - `gemini-2.5-pro`
   - `gemini-1.5-flash-latest`
   - `gemini-1.5-pro-latest`
   - `gemini-pro`
4. **API Call**: Makes request to Google Gemini API
5. **Return Response**: Sends AI-generated response back to frontend

#### Step 4: Response Display
1. **Format Response**: Removes markdown formatting
2. **Display Answer**: Shows AI-generated response
3. **Save to History**: Stores in chat history

## Matching Strategies (CSV Mode)

### 1. Alias Matching
- **Purpose**: Maps paraphrases to canonical questions
- **Example**: "tell me about yourself" → "introduce yourself"
- **Priority**: Highest (guaranteed match)

### 2. Fuzzy Matching (Fuse.js)
- **Purpose**: Approximate string matching
- **Threshold**: 0.55 confidence (55% match required)
- **Features**:
  - Ignores location of matches
  - Minimum 2 characters to match
  - Distance-based scoring
- **Priority**: High (if confidence ≥ 0.55)

### 3. Exact Matching
- **Purpose**: Perfect string matches
- **Method**: Case-insensitive comparison
- **Priority**: High

### 4. Normalized Matching
- **Purpose**: Matches after normalization
- **Normalization**: Removes punctuation, collapses whitespace
- **Priority**: Medium

### 5. Partial Matching (Scoring)
- **Purpose**: Word-based matching with scoring
- **Scoring System**:
  - Exact word match: +2 points
  - Partial word match (≥4 chars): +1 point
  - First word match: +3 points
  - Key phrase match: +5 points
- **Threshold**: Minimum 4 points required
- **Priority**: Low (fallback)

## Question Normalization

### Text Normalization Process:
1. **Lowercase**: Convert to lowercase
2. **Remove Punctuation**: Strip special characters
3. **Collapse Whitespace**: Multiple spaces → single space
4. **Trim**: Remove leading/trailing spaces

### Example:
```
Input:  "Tell me about yourself!"
Output: "tell me about yourself"
```

## CSV Data Structure

### Format 1 (with numeric ID):
```csv
Number. Question,Answer
1. Tell me about yourself,"I am a passionate professional..."
```

### Format 2 (simple):
```csv
Question,Answer
Tell me about yourself,"I am a passionate professional..."
```

### Special Rows:
- **Section Headers**: Lines starting with `#` (e.g., `#maths aptitude`)
- **Header Rows**: `Question,Answer` or `question,answer` (skipped)
- **Empty Rows**: Automatically filtered out

## Advanced Mode Features

### 1. Image Support
- **Upload Images**: Users can upload images with questions
- **Base64 Encoding**: Images converted to base64
- **Multimodal Input**: Gemini processes both text and images
- **Use Cases**: Analyzing resume screenshots, code snippets, diagrams

### 2. Context Awareness
- **Chat History**: Maintains conversation context
- **Session Management**: Tracks chat sessions
- **Persistent History**: Saves to MongoDB for logged-in users

### 3. Topic Filtering
- **Keyword List**: 30+ job interview related keywords
- **Validation**: Only processes relevant questions
- **Rejection Message**: Guides users to ask relevant questions

## Chat History Management

### For Logged-In Users:
- **MongoDB Storage**: Saves messages to database
- **Session Tracking**: Groups messages by chat session
- **History Retrieval**: Loads previous conversations
- **Backend Endpoint**: `/api/chat-history`

### For Non-Logged-In Users:
- **Local Storage**: Saves to browser's local storage
- **Session-Based**: Tied to browser session
- **No Persistence**: Cleared when browser data is cleared

## API Integration

### Backend Endpoint: `/api/gemini-generate`
- **Method**: POST
- **Purpose**: Proxy for Gemini API (hides API key)
- **Request Format**:
```json
{
  "contents": [{
    "role": "user",
    "parts": [
      { "text": "user message" },
      { "inline_data": { "mime_type": "image/jpeg", "data": "base64..." } }
    ]
  }]
}
```

### Response Format:
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "AI-generated response"
      }]
    }
  }]
}
```

## Error Handling

### CSV Mode Errors:
- **No Match Found**: Suggests switching to Advanced mode
- **Empty Database**: Shows error message
- **Load Failure**: Displays error with instructions

### Advanced Mode Errors:
- **API Failure**: Shows fallback message
- **Non-Relevant Question**: Rejects with guidance
- **Network Error**: Displays error message
- **Model Unavailable**: Falls back to alternative models

## Performance Considerations

### CSV Mode:
- **Speed**: Instant (no API calls)
- **Scalability**: Limited by CSV size
- **Memory**: Loads entire CSV into memory
- **Search Time**: O(n) for linear search, O(log n) for Fuse.js

### Advanced Mode:
- **Speed**: 1-5 seconds (API latency)
- **Scalability**: Unlimited (cloud-based)
- **Cost**: Per API call (Gemini API pricing)
- **Rate Limits**: Subject to API rate limits

## Configuration

### API Settings:
- **API Key**: Stored in backend (not exposed to frontend)
- **API URL**: `http://localhost:3000/api/gemini-generate`
- **Model Preference**: `gemini-2.5-flash` (with fallbacks)

### CSV Settings:
- **File Location**: `interview_qa.csv` (root directory)
- **Fuzzy Matching**: Threshold 0.45 (configurable)
- **Min Match Length**: 2 characters

## User Interface

### Mode Toggle:
- **Button**: "Advanced Mode" toggle
- **Visual Indicator**: Shows current mode
- **Mode Message**: Displays mode switch confirmation

### Chat Interface:
- **Message Input**: Text input with auto-resize
- **File Upload**: Image upload button
- **Send Button**: Submit message
- **Chat History**: Scrollable message container
- **Thinking Indicator**: Shows "Thinking..." during processing

## File Structure

### Frontend:
- **File**: `script.js`
- **Location**: Root directory
- **Size**: ~960 lines
- **Dependencies**: Fuse.js (for fuzzy matching)

### Backend:
- **File**: `backend/server.js`
- **Endpoint**: `/api/gemini-generate`
- **Function**: `callGeminiWithFallback()`

### Data:
- **File**: `interview_qa.csv`
- **Format**: CSV with questions and answers
- **Encoding**: UTF-8

## Key Functions

### `loadCSVData()`
- Loads and parses CSV file
- Initializes Fuse.js for fuzzy matching
- Registers question aliases

### `findBestMatch(userQuestion)`
- Implements all matching strategies
- Returns best matching question/answer pair
- Handles multiple input formats

### `generateBotResponse(incomingMessageDiv)`
- Main response generation function
- Routes to CSV or Advanced mode
- Handles errors and fallbacks

### `isJobInterviewRelated(message)`
- Validates if question is job interview related
- Uses keyword matching
- Returns boolean

### `normalizeText(text)`
- Normalizes text for matching
- Removes punctuation and whitespace
- Converts to lowercase

## Summary

The Chatbot system provides a flexible, dual-mode interface for interview preparation:

1. **CSV Mode**: Fast, local responses from pre-loaded database
2. **Advanced Mode**: AI-powered, context-aware responses via Gemini API
3. **Intelligent Matching**: Multiple strategies for finding relevant answers
4. **Multimodal Support**: Text and image inputs in Advanced mode
5. **History Management**: Persistent chat history for logged-in users
6. **Error Handling**: Graceful fallbacks and user guidance

The system is designed to be user-friendly, fast, and reliable, with automatic fallbacks and clear error messages to guide users.















