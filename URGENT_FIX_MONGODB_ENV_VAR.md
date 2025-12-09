# 🚨 URGENT: Fix MongoDB Environment Variable

## ❌ Problem

Your backend is **still** trying to connect to `localhost:27017` instead of MongoDB Atlas.

**This means:** The `MONGODB_URI` environment variable is **NOT being read** by Render.

---

## ✅ Immediate Fix Steps

### Step 1: Go to Render Environment Tab

1. **Open Render Dashboard**
   - https://dashboard.render.com
   - Click your service: **mainproject**

2. **Click "Environment" Tab**
   - Top menu → **"Environment"**

3. **Check Environment Variables Section**
   - Scroll down to see all variables

---

### Step 2: Verify MONGODB_URI Exists

**Look for a variable with Key: `MONGODB_URI`**

**If it DOES NOT exist:**
- Go to Step 3 (Add it)

**If it EXISTS:**
- Go to Step 4 (Check format)

---

### Step 3: Add MONGODB_URI (If Missing)

1. **Click "Add Environment Variable"** button

2. **Enter Exactly:**
   - **Key:** `MONGODB_URI`
     - Must be **exact**: All caps, no spaces
     - Case sensitive!
   
   - **Value:** Copy and paste this EXACT string:
     ```
     mongodb+srv://itheshjs2004_db_user:xlhDOC@cluster0.asb7stc.mongodb.net/interviewprep?retryWrites=true&w=majority
     ```
     - **NO quotes**
     - **NO spaces**
     - **Copy exactly as shown**

3. **Click "Save Changes"**

4. **Wait for Auto-Redeploy** (2-3 minutes)

---

### Step 4: Verify MONGODB_URI Format (If It Exists)

1. **Click on `MONGODB_URI`** to view/edit

2. **Check the Value:**
   - ✅ Must start with: `mongodb+srv://`
   - ✅ Must have: `itheshjs2004_db_user:xlhDOC@`
   - ✅ Must have: `cluster0.asb7stc.mongodb.net`
   - ✅ Must have: `/interviewprep` (database name)
   - ✅ Must have: `?retryWrites=true&w=majority` (or `?appName=Cluster0`)

3. **Correct Format:**
   ```
   mongodb+srv://itheshjs2004_db_user:xlhDOC@cluster0.asb7stc.mongodb.net/interviewprep?retryWrites=true&w=majority
   ```

4. **If Wrong:**
   - Click to edit
   - Replace with correct format above
   - Save

---

### Step 5: Force Manual Redeploy

**After adding/updating the variable:**

1. **Go to "Manual Deploy" tab** (or "Deploys" tab)

2. **Click "Clear build cache & deploy"** button
   - This ensures the new environment variable is loaded

3. **Wait 3-5 minutes** for redeploy

---

### Step 6: Verify It Works

**After redeploy, check logs:**

1. **Go to "Logs" tab**

2. **Look for:**
   - ✅ `MongoDB connected` → **SUCCESS!**
   - ❌ `MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017` → Still wrong

---

## 🔍 Common Mistakes

### ❌ Wrong Key Name:
- `mongodb_uri` (lowercase) → Wrong!
- `MONGODB_URI ` (with space) → Wrong!
- `MongoDB_URI` (mixed case) → Wrong!

### ✅ Correct Key Name:
- `MONGODB_URI` (all caps, no spaces) → Correct!

---

### ❌ Wrong Value Format:
- Missing `mongodb+srv://` prefix
- Missing `/interviewprep` database name
- Wrong password
- Extra spaces or quotes
- Still has `<db_password>` placeholder

### ✅ Correct Value Format:
```
mongodb+srv://itheshjs2004_db_user:xlhDOC@cluster0.asb7stc.mongodb.net/interviewprep?retryWrites=true&w=majority
```

---

## 🎯 Exact Steps to Fix Right Now

1. **Render Dashboard** → **mainproject** → **Environment** tab

2. **Check if `MONGODB_URI` exists:**
   - If NO → Click "Add Environment Variable"
   - If YES → Click on it to edit

3. **Set Key:** `MONGODB_URI` (exact, all caps)

4. **Set Value:** (Copy this EXACT string)
   ```
   mongodb+srv://itheshjs2004_db_user:xlhDOC@cluster0.asb7stc.mongodb.net/interviewprep?retryWrites=true&w=majority
   ```

5. **Save Changes**

6. **Manual Deploy** → "Clear build cache & deploy"

7. **Wait 3-5 minutes**

8. **Check Logs** → Should see "MongoDB connected"

---

## ✅ Verification Checklist

- [ ] Environment variable Key is exactly: `MONGODB_URI`
- [ ] Value starts with: `mongodb+srv://`
- [ ] Value has username: `itheshjs2004_db_user`
- [ ] Value has password: `xlhDOC` (no `<db_password>`)
- [ ] Value has database: `/interviewprep`
- [ ] No extra spaces or quotes
- [ ] Saved in Render
- [ ] Manual redeploy done
- [ ] Logs show "MongoDB connected"

---

## 🚨 If Still Not Working

### Check These:

1. **Password Special Characters:**
   - If password has special chars, they might need URL encoding
   - Or regenerate password in Atlas without special chars

2. **Network Access in Atlas:**
   - MongoDB Atlas → Network Access
   - Must have "Allow Access from Anywhere" (0.0.0.0/0)

3. **Database User:**
   - MongoDB Atlas → Database Access
   - Verify user `itheshjs2004_db_user` exists
   - Verify password is `xlhDOC`

4. **Connection String Test:**
   - Try the connection string in MongoDB Compass
   - If it works there, it should work in Render

---

**The environment variable is definitely not being read. Double-check it's set correctly in Render! 🚀**









