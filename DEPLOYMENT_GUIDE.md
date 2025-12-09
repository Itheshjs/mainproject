# Deployment Guide for Interview Prep Pro

This guide will help you deploy your Interview Prep Pro application to GitHub Pages (frontend) and a cloud hosting service (backend).

## Problem: Why It's Not Working on GitHub Pages

Your project uses hardcoded `localhost:3000` URLs for API calls. When deployed to GitHub Pages:
- GitHub Pages only serves **static files** (HTML, CSS, JS)
- Your backend server running on `localhost:3000` is **not accessible** from the deployed site
- API calls fail because they're trying to reach a server that doesn't exist in production

## Solution Overview

1. **Frontend (GitHub Pages)**: Already configured with `config.js` to automatically detect environment
2. **Backend**: Deploy to a cloud service (Heroku, Render, Railway, etc.)
3. **Configuration**: Update `config.js` with your deployed backend URL

---

## Step 1: Deploy Backend to Cloud Service

### Option A: Deploy to Render (Recommended - Free Tier Available)

1. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

3. **Configure the Service**
   - **Name**: `interview-prep-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free tier is fine

4. **Set Environment Variables**
   - Add MongoDB connection string if using MongoDB Atlas (see Step 2)
   - Add any API keys if needed

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your service URL (e.g., `https://interview-prep-backend.onrender.com`)

### Option B: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name
   ```

4. **Set MongoDB Connection** (if using MongoDB Atlas)
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

6. **Get Your Backend URL**
   - Your app will be at: `https://your-app-name.herokuapp.com`

### Option C: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **New Project** → **Deploy from GitHub**
3. **Select Repository** → **Add Service** → **GitHub Repo**
4. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. **Get Your Backend URL**: `https://your-app-name.railway.app`

---

## Step 2: Set Up MongoDB (If Not Already Done)

Your backend uses MongoDB. For production, use **MongoDB Atlas** (free tier available):

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create a Cluster**
   - Choose free tier (M0)
   - Select a region close to your backend

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Update Backend Code**
   - In `backend/server.js`, change:
     ```javascript
     mongoose.connect('mongodb://localhost:27017/interviewprep')
     ```
   - To:
     ```javascript
     mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interviewprep')
     ```

5. **Add to Cloud Service Environment Variables**
   - In Render/Heroku/Railway, add:
     - Key: `MONGODB_URI`
     - Value: Your MongoDB Atlas connection string

---

## Step 3: Update CORS Settings

1. **Open `backend/server.js`**

2. **Find the `allowedOrigins` array** (around line 38)

3. **Add your GitHub Pages URL**:
   ```javascript
   const allowedOrigins = [
     'http://localhost',
     'http://localhost:5500',
     'http://127.0.0.1:5500',
     'http://localhost:9002',
     'https://yourusername.github.io',  // Add this
     'https://yourusername.github.io/geminitest',  // Or this if using subdirectory
   ];
   ```

4. **Commit and push** the changes

5. **Redeploy** your backend service

---

## Step 4: Update Frontend Configuration

1. **Open `config.js`** in your project root

2. **Find this line** (around line 20):
   ```javascript
   : 'YOUR_BACKEND_URL';      // Production: deployed backend (UPDATE THIS!)
   ```

3. **Replace `YOUR_BACKEND_URL`** with your actual backend URL:
   ```javascript
   : 'https://interview-prep-backend.onrender.com';  // Example for Render
   // OR
   : 'https://your-app-name.herokuapp.com';  // Example for Heroku
   // OR
   : 'https://your-app-name.railway.app';  // Example for Railway
   ```

4. **Save the file**

---

## Step 5: Deploy Frontend to GitHub Pages

1. **Commit All Changes**
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main branch** (or your default branch)
   - Select **/ (root)** as the folder
   - Click **Save**

3. **Wait for Deployment**
   - GitHub Pages will deploy your site
   - Your site will be available at: `https://yourusername.github.io/geminitest` (or your repo name)

---

## Step 6: Test Your Deployment

1. **Visit your GitHub Pages URL**
   - Example: `https://yourusername.github.io/geminitest`

2. **Test Authentication**
   - Try signing up
   - Try logging in
   - Check if profile loads

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Check Console for any errors
   - Check Network tab to see if API calls are going to your backend URL

4. **Common Issues**:
   - **CORS Errors**: Make sure you added your GitHub Pages URL to `allowedOrigins` in backend
   - **404 Errors**: Check that your backend URL in `config.js` is correct
   - **Connection Refused**: Make sure your backend service is running and accessible

---

## Troubleshooting

### Backend Not Responding
- Check if your backend service is running (Render/Heroku dashboard)
- Check backend logs for errors
- Verify MongoDB connection string is correct

### CORS Errors
- Ensure your GitHub Pages URL is in `allowedOrigins` array
- Make sure you redeployed backend after adding the URL
- Check browser console for specific CORS error messages

### API Calls Failing
- Verify `config.js` has the correct backend URL
- Check Network tab in browser DevTools to see actual API calls
- Ensure backend endpoints are accessible (try opening backend URL in browser)

### Session/Authentication Issues
- Backend services may have different session handling
- Consider using JWT tokens instead of sessions for better cloud compatibility
- Check if your cloud service supports session storage

---

## Additional Notes

- **Free Tier Limitations**: Free tiers may have cold starts (first request takes longer)
- **Environment Variables**: Never commit API keys or secrets to GitHub
- **Database**: MongoDB Atlas free tier is sufficient for small projects
- **HTTPS**: All cloud services provide HTTPS by default (required for production)

---

## Quick Checklist

- [ ] Backend deployed to cloud service (Render/Heroku/Railway)
- [ ] MongoDB Atlas set up and connected
- [ ] Backend CORS updated with GitHub Pages URL
- [ ] `config.js` updated with backend URL
- [ ] All changes committed and pushed
- [ ] GitHub Pages enabled
- [ ] Tested authentication flow
- [ ] Tested API calls in browser console

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check backend service logs
3. Verify all URLs are correct
4. Ensure CORS is properly configured
5. Test backend endpoints directly (e.g., `https://your-backend.com/api/profile`)

Good luck with your deployment! 🚀









