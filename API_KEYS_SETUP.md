# AI API Keys Setup Guide

## Where to Paste Your API Keys

After getting your API keys from the providers below, replace the placeholder values in `backend/server.js`:

### 1. OpenAI API Key
**File:** `backend/server.js`  
**Lines:** 67-68  
**Replace:** `YOUR_OPENAI_API_KEY_HERE`

```javascript
openai: {
  name: 'OpenAI GPT-4',
  url: 'https://api.openai.com/v1/chat/completions',
  key: 'YOUR_OPENAI_API_KEY_HERE', // ← Replace this
  headers: { 'Authorization': 'Bearer YOUR_OPENAI_API_KEY_HERE', 'Content-Type': 'application/json' } // ← And this
},
```

### 2. Anthropic (Claude) API Key
**File:** `backend/server.js`  
**Lines:** 69-72  
**Replace:** `YOUR_ANTHROPIC_API_KEY_HERE`

```javascript
anthropic: {
  name: 'Claude',
  url: 'https://api.anthropic.com/v1/messages',
  key: 'YOUR_ANTHROPIC_API_KEY_HERE', // ← Replace this
  headers: { 'x-api-key': 'YOUR_ANTHROPIC_API_KEY_HERE', 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' } // ← And this
},
```

### 3. Mistral AI API Key
**File:** `backend/server.js`  
**Lines:** 73-76  
**Replace:** `YOUR_MISTRAL_API_KEY_HERE`

```javascript
mistral: {
  name: 'Mistral',
  url: 'https://api.mistral.ai/v1/chat/completions',
  key: 'YOUR_MISTRAL_API_KEY_HERE', // ← Replace this
  headers: { 'Authorization': 'Bearer YOUR_MISTRAL_API_KEY_HERE', 'Content-Type': 'application/json' } // ← And this
},
```

### 4. Cohere API Key
**File:** `backend/server.js`  
**Lines:** 77-80  
**Replace:** `YOUR_COHERE_API_KEY_HERE`

```javascript
cohere: {
  name: 'Cohere',
  url: 'https://api.cohere.ai/v1/chat',
  key: 'YOUR_COHERE_API_KEY_HERE', // ← Replace this
  headers: { 'Authorization': 'Bearer YOUR_COHERE_API_KEY_HERE', 'Content-Type': 'application/json' } // ← And this
},
```

### 5. OpenRouter API Key
**File:** `backend/server.js`  
**Lines:** 81-84  
**Replace:** `YOUR_OPENROUTER_API_KEY_HERE`

```javascript
openrouter: {
  name: 'OpenRouter',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  key: 'YOUR_OPENROUTER_API_KEY_HERE', // ← Replace this
  headers: { 'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY_HERE', 'Content-Type': 'application/json' } // ← And this
}
```

## How to Get Free API Keys

### 1. OpenAI (GPT-4)
- Visit: https://platform.openai.com/
- Sign up for free account
- Get $5 free credit (enough for ~1000 questions)
- **Free tier:** $5 credit, then pay-as-you-go

### 2. Anthropic (Claude)
- Visit: https://console.anthropic.com/
- Sign up for free account
- Get free API access with rate limits
- **Free tier:** Limited requests per month

### 3. Mistral AI
- Visit: https://console.mistral.ai/
- Sign up for free account
- Get free API access
- **Free tier:** Limited requests per month

### 4. Cohere
- Visit: https://cohere.ai/
- Sign up for free account
- Get free API access
- **Free tier:** Limited requests per month

### 5. OpenRouter (Recommended for Variety)
- Visit: https://openrouter.ai/
- Sign up for free account
- Access multiple AI models through one API
- **Free tier:** $5 free credit, then very cheap
- **Models available:** GPT-4, Claude, Mistral, and many more

## Why OpenRouter is Great

OpenRouter gives you access to multiple AI models through one API key:
- **GPT-4** (OpenAI)
- **Claude** (Anthropic) 
- **Mistral** (Mistral AI)
- **Llama** (Meta)
- **And many more...**

This means you get variety without managing multiple API keys!

## After Setting Up

1. **Restart your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Test the practice feature** - you'll now see different AI providers for each stage

3. **Each practice session** will use different AI models, giving you variety

## Cost Estimate

- **OpenRouter:** ~$0.01-0.05 per question (cheapest option)
- **OpenAI:** ~$0.03-0.06 per question
- **Others:** Varies, but generally $0.01-0.10 per question

For 100 practice questions: **$1-5 total** (very affordable!)

## Troubleshooting

If an API fails, the system automatically falls back to Gemini (your existing API) so practice never stops working.

