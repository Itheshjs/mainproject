# 🔧 Fix: OpenRouter API Key 401 Unauthorized Error

## ❌ Problem

You're getting this error:
```
Backend error: 401 Client Error: Unauthorized for url: https://openrouter.ai/api/v1/chat/completions
```

This means your OpenRouter API key is **invalid, expired, or missing**.

---

## ✅ Solution: Get a New OpenRouter API Key

### Step 1: Sign Up / Login to OpenRouter

1. **Go to:** https://openrouter.ai/
2. **Click:** "Sign In" or "Get Started"
3. **Sign up with:**
   - Google account (easiest)
   - GitHub account
   - Email account

### Step 2: Get Your API Key

1. **After login, go to:** https://openrouter.ai/keys
2. **Click:** "Create Key" or "New Key"
3. **Enter a name:** e.g., "Mock Interview Bot"
4. **Copy the API key** (starts with `sk-or-v1-...`)
   - ⚠️ **Save it immediately** - you won't see it again!

### Step 3: Add API Key to Your Project

**Option A: Using .env file (Recommended)**

1. **Go to:** `mock-interview-bot/mock-interview-bot/`
2. **Create a file named:** `.env`
3. **Add this line:**
   ```
   OPENROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_API_KEY_HERE
   ```
   (Replace with your actual API key)

4. **Save the file**

**Option B: Set Environment Variable (Windows)**

1. **Open PowerShell or Command Prompt**
2. **Navigate to project:**
   ```powershell
   cd C:\xampp-new\htdocs\geminitest\mock-interview-bot\mock-interview-bot
   ```
3. **Set environment variable:**
   ```powershell
   $env:OPENROUTER_API_KEY="sk-or-v1-YOUR_ACTUAL_API_KEY_HERE"
   ```
4. **Run Flask:**
   ```powershell
   python app.py
   ```

---

## 🔧 Updated Code

The code has been updated to:
- ✅ Check for environment variable first
- ✅ Fall back to hardcoded key (for backward compatibility)
- ✅ Show warning if key is missing

---

## 🧪 Test the Fix

1. **Add your API key** (using Option A or B above)
2. **Restart Flask server:**
   ```powershell
   python app.py
   ```
3. **Try the interview again**
4. **Should work now!** ✅

---

## 💡 Alternative: Use Gemini API Instead

If OpenRouter is giving you trouble, you can switch to Gemini API (which you're already using in your main project):

### Option: Use Gemini API

1. **You already have Gemini API key** (from your main project)
2. **Update `app.py`** to use Gemini instead of OpenRouter
3. **Benefits:**
   - Free tier available
   - Already configured in your project
   - No additional signup needed

**Would you like me to modify the code to use Gemini API instead?**

---

## 📋 Quick Checklist

- [ ] Sign up for OpenRouter account
- [ ] Get API key from https://openrouter.ai/keys
- [ ] Create `.env` file in `mock-interview-bot/mock-interview-bot/`
- [ ] Add `OPENROUTER_API_KEY=your_key_here` to `.env`
- [ ] Restart Flask server
- [ ] Test interview

---

## 🆘 Still Not Working?

### Check These:

1. **API Key Format:**
   - Must start with: `sk-or-v1-`
   - No extra spaces
   - Complete key copied

2. **.env File Location:**
   - Must be in: `mock-interview-bot/mock-interview-bot/.env`
   - Not in parent directory

3. **Restart Server:**
   - Stop Flask (Ctrl+C)
   - Start again: `python app.py`

4. **Check OpenRouter Account:**
   - Make sure account is active
   - Check if you have credits/balance
   - Verify API key is enabled

---

## 🎯 Recommended: Use Gemini API

Since you're already using Gemini in your main project, I can help you switch the mock interview bot to use Gemini API instead. This would:
- ✅ Use your existing API key
- ✅ No additional signup needed
- ✅ Consistent with your main project
- ✅ Free tier available

**Let me know if you want me to switch it to Gemini!**

---

**Get a new OpenRouter API key and add it to your project! 🚀**









