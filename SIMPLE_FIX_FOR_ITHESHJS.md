# 🚀 Simple Fix for https://itheshjs.github.io/mainproject/

## ✅ 3 Simple Steps to Make It Work

### Step 1: Deploy Backend (5 minutes)

1. Go to **https://render.com**
2. Sign up with GitHub (free)
3. Click **"New +"** → **"Web Service"**
4. Connect your repository
5. Fill in:
   - **Name**: `interview-prep-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Click **"Create Web Service"**
7. Wait 5-10 minutes
8. **Copy your URL** (e.g., `https://interview-prep-backend.onrender.com`)

---

### Step 2: Update 2 Files

#### File 1: `config.js` (Line 21)

**Change this:**
```javascript
: 'YOUR_BACKEND_URL';
```

**To this (use your Render URL from Step 1):**
```javascript
: 'https://interview-prep-backend.onrender.com';
```

#### File 2: `backend/server.js` (Line 45-47)

**Find this:**
```javascript
  // Add your GitHub Pages URL here (uncomment and replace with your actual URL):
  // 'https://yourusername.github.io',
  // 'https://yourusername.github.io/geminitest',
```

**Change to:**
```javascript
  'https://itheshjs.github.io',
  'https://itheshjs.github.io/mainproject',
```

---

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Configure for production"
git push origin main
```

Wait 2 minutes for GitHub Pages to update.

---

## ✅ Done!

Your site at **https://itheshjs.github.io/mainproject/** should now work exactly like it does locally!

---

## 🧪 Test It

1. Visit: https://itheshjs.github.io/mainproject/
2. Open browser console (F12)
3. Try to Sign Up or Log In
4. Check console - should see API calls going to your Render backend (not localhost)

---

## ⚠️ If Something Doesn't Work

**Check Browser Console (F12):**
- If you see "CORS error" → Make sure you updated `backend/server.js` and redeployed
- If you see "Failed to fetch" → Check backend URL in `config.js` is correct
- If backend shows "MongoDB connection error" → Set up MongoDB Atlas (see DEPLOYMENT_GUIDE.md)

---

**That's it! Just 3 steps! 🎉**









