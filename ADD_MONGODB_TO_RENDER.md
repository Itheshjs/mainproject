# 🔧 How to Add MongoDB URI to Render

## ✅ Add as Environment Variable in Render Dashboard

**NOT from .env file** - Render uses environment variables set in the dashboard.

---

## 📋 Step-by-Step Instructions

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Login to your account
3. Click on your service: **mainproject**

### Step 2: Open Environment Tab
1. Click **"Environment"** tab (top menu)
2. You'll see a section: **"Environment Variables"**

### Step 3: Add New Variable
1. Click **"Add Environment Variable"** button
2. A form will appear with two fields:
   - **Key:** (text input)
   - **Value:** (text input, can be hidden/shown)

### Step 4: Enter MongoDB URI
1. **Key field:** Type exactly:
   ```
   MONGODB_URI
   ```
   (All caps, no spaces)

2. **Value field:** Paste your MongoDB Atlas connection string:
   ```
   mongodb+srv://itheshjs2004_db_user:xlhDOC@cluster0.xxxxx.mongodb.net/interviewprep?retryWrites=true&w=majority
   ```
   (Replace with your actual connection string)

3. Click **"Save Changes"** button

### Step 5: Wait for Redeploy
- Render will automatically detect the change
- Service will automatically redeploy
- Wait 2-3 minutes
- Check logs to see "MongoDB connected"

---

## 🎯 Visual Guide

```
Render Dashboard
├── Your Service (mainproject)
    ├── Overview
    ├── Logs
    ├── Environment  ← Click here
    │   └── Environment Variables
    │       └── Add Environment Variable
    │           ├── Key: MONGODB_URI
    │           └── Value: mongodb+srv://...
    ├── Settings
    └── ...
```

---

## ✅ What It Should Look Like

After adding, you'll see:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://...` (hidden/shown) |

---

## 🔍 How Your Code Uses It

Your `backend/server.js` already checks for this:

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewprep';
```

**How it works:**
- **Render:** `process.env.MONGODB_URI` will have your Atlas connection string
- **Local:** If not set, uses `localhost:27017` (your local MongoDB)

---

## ⚠️ Important Notes

1. **No .env file needed** - Render doesn't use .env files
2. **Environment variables only** - Set in Render dashboard
3. **Case sensitive** - `MONGODB_URI` must be exact
4. **No quotes needed** - Just paste the connection string directly

---

## 🧪 Verify It Works

After redeploy, check logs:
1. Go to **"Logs"** tab in Render
2. Look for: `MongoDB connected` ✅
3. If you see: `MongoDB connection error` ❌
   - Check connection string is correct
   - Check password is correct
   - Check network access is allowed in Atlas

---

## 📝 Quick Checklist

- [ ] Go to Render dashboard
- [ ] Click your service: mainproject
- [ ] Click "Environment" tab
- [ ] Click "Add Environment Variable"
- [ ] Key: `MONGODB_URI`
- [ ] Value: Your MongoDB Atlas connection string
- [ ] Click "Save Changes"
- [ ] Wait for redeploy (2-3 minutes)
- [ ] Check logs for "MongoDB connected"

---

**That's it! No .env file needed - just add it in Render dashboard! 🚀**









