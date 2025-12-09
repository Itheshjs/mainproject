# 🔧 Fix: MongoDB Still Connecting to Localhost

## ❌ Problem

Your backend is still trying to connect to `localhost:27017` instead of MongoDB Atlas.

**Error shows:**
```
MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
servers: Map(1) { 'localhost:27017' => ... }
```

This means `MONGODB_URI` environment variable is **not set** or **not being read**.

---

## ✅ Solution: Verify Environment Variable in Render

### Step 1: Check Environment Variable Exists

1. **Go to Render Dashboard**
   - https://dashboard.render.com
   - Click your service: **mainproject**

2. **Go to Environment Tab**
   - Click **"Environment"** tab
   - Scroll to **"Environment Variables"** section

3. **Verify `MONGODB_URI` Exists**
   - Look for a row with Key: `MONGODB_URI`
   - If it's **NOT there** → Go to Step 2
   - If it **IS there** → Go to Step 3

---

### Step 2: Add Environment Variable (If Missing)

1. **Click "Add Environment Variable"**

2. **Enter Exactly:**
   - **Key:** `MONGODB_URI`
     - Must be exact: All caps, no spaces
     - Case sensitive!
   
   - **Value:** Your MongoDB Atlas connection string
     - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/interviewprep?retryWrites=true&w=majority`
     - Replace `username` with your database username
     - Replace `password` with your database password
     - Make sure `interviewprep` is the database name

3. **Example Value:**
   ```
   mongodb+srv://itheshjs2004_db_user:xlhDOC@cluster0.abc123.mongodb.net/interviewprep?retryWrites=true&w=majority
   ```

4. **Click "Save Changes"**

5. **Wait for Auto-Redeploy** (2-3 minutes)

---

### Step 3: Verify Environment Variable Format (If It Exists)

If `MONGODB_URI` already exists, check:

1. **Click on the variable** to edit it

2. **Verify Format:**
   - ✅ Starts with: `mongodb+srv://`
   - ✅ Has username:password before `@`
   - ✅ Has cluster URL: `cluster0.xxxxx.mongodb.net`
   - ✅ Has database name: `/interviewprep`
   - ✅ Has query params: `?retryWrites=true&w=majority`

3. **Common Mistakes:**
   - ❌ Missing `mongodb+srv://` prefix
   - ❌ Wrong password (check for typos)
   - ❌ Missing database name `/interviewprep`
   - ❌ Extra spaces or quotes
   - ❌ Key name wrong (should be `MONGODB_URI` exactly)

4. **Fix and Save**

---

### Step 4: Force Manual Redeploy

After fixing the environment variable:

1. **Go to "Manual Deploy" tab** (or "Deploys" tab)
2. **Click "Clear build cache & deploy"** (or "Deploy latest commit")
3. **Wait 3-5 minutes** for redeploy

---

### Step 5: Check Logs Again

After redeploy, check logs:

1. **Go to "Logs" tab**
2. **Look for:**
   - ✅ `MongoDB connected` → Success!
   - ❌ `MongoDB connection error` → Still has issue

---

## 🔍 How to Get Correct Connection String

### From MongoDB Atlas:

1. **Go to MongoDB Atlas Dashboard**
   - https://cloud.mongodb.com

2. **Database → Connect → Connect your application**

3. **Select:**
   - Driver: **Node.js**
   - Version: **5.5 or later**

4. **Copy the connection string:**
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Replace:**
   - `<username>` → Your database username (e.g., `itheshjs2004_db_user`)
   - `<password>` → Your database password (e.g., `xlhDOC`)

6. **Add database name:**
   - Before the `?`, add `/interviewprep`
   - Result: `...mongodb.net/interviewprep?retryWrites=true&w=majority`

7. **Final format:**
   ```
   mongodb+srv://itheshjs2004_db_user:xlhDOC@cluster0.xxxxx.mongodb.net/interviewprep?retryWrites=true&w=majority
   ```

---

## ✅ Verification Checklist

- [ ] Environment variable named exactly: `MONGODB_URI`
- [ ] Value starts with: `mongodb+srv://`
- [ ] Username and password are correct (no `<` or `>`)
- [ ] Database name `/interviewprep` is included
- [ ] No extra spaces or quotes
- [ ] Saved in Render dashboard
- [ ] Service redeployed after adding/updating
- [ ] Logs show "MongoDB connected" (not error)

---

## 🐛 Still Not Working?

### Check These:

1. **Password Special Characters:**
   - If password has special characters, they might need URL encoding
   - Example: `@` becomes `%40`, `#` becomes `%23`
   - Or regenerate password without special characters

2. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Make sure "Allow Access from Anywhere" (0.0.0.0/0) is added

3. **Database User:**
   - Go to MongoDB Atlas → Database Access
   - Verify user exists and password is correct

4. **Connection String Format:**
   - Must be exactly: `mongodb+srv://username:password@cluster...`
   - No spaces
   - No quotes needed in Render

---

## 🎯 Quick Fix Steps

1. **Render Dashboard** → Your Service → **Environment** tab
2. **Check if `MONGODB_URI` exists**
3. **If missing:** Add it with correct connection string
4. **If exists:** Verify format is correct
5. **Save** → Wait for redeploy
6. **Check logs** → Should see "MongoDB connected"

---

**The issue is that Render can't find the `MONGODB_URI` environment variable. Make sure it's set correctly! 🚀**









