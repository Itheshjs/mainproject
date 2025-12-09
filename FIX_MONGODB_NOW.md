# 🔧 Fix MongoDB Connection - Quick Steps

Your backend is deployed but needs MongoDB. Here's how to fix it:

## ✅ Your Backend URL:
**https://mainproject-8bhf.onrender.com**

---

## 🚀 Quick Fix (5 minutes)

### Step 1: Set Up MongoDB Atlas (Free)

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Sign up** (free account)
3. **Create a Free Cluster:**
   - Click "Build a Database"
   - Choose **"M0 FREE"** tier
   - Select region (closest to you)
   - Click "Create"
   - Wait 3-5 minutes

### Step 2: Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 3: Create Database User

1. Go to **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username (e.g., `interviewprep`)
5. Enter password (save it!)
6. Click **"Add User"**

### Step 4: Allow Network Access

1. Go to **"Network Access"** (left menu)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for simplicity)
   - Or add: `0.0.0.0/0`
4. Click **"Confirm"**

### Step 5: Update Connection String

Take your connection string and:
1. Replace `<username>` with your database username
2. Replace `<password>` with your database password
3. Add database name at the end:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/interviewprep?retryWrites=true&w=majority
   ```

**Example:**
```
mongodb+srv://interviewprep:MyPassword123@cluster0.abc123.mongodb.net/interviewprep?retryWrites=true&w=majority
```

### Step 6: Add to Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your service: **mainproject**
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - **Key:** `MONGODB_URI`
   - **Value:** Your connection string (from Step 5)
6. Click **"Save Changes"**
7. Render will automatically redeploy (wait 2-3 minutes)

---

## ✅ Done!

After redeployment, check the logs. You should see:
```
MongoDB connected
```

Instead of:
```
MongoDB connection error
```

---

## 🧪 Test It

1. Visit: https://mainproject-8bhf.onrender.com/api/profile
2. Should return JSON (even if "Not authenticated" - that's OK!)

---

## 📝 Next Steps

After MongoDB is fixed:

1. ✅ **config.js** - Already updated with your backend URL
2. ✅ **backend/server.js** - Already updated with CORS settings
3. ✅ **MongoDB** - Set up Atlas and add to Render (do this now!)

Then push to GitHub:
```bash
git add .
git commit -m "Configure for production"
git push origin main
```

Your site at **https://itheshjs.github.io/mainproject/** will work! 🎉









