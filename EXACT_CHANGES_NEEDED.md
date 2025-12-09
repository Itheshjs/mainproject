# 📝 Exact Changes You Need to Make

## For: https://itheshjs.github.io/mainproject/

---

## 🔧 Change 1: Update `config.js`

**File Location:** `C:\xampp-new\htdocs\geminitest\config.js`

**Line 21 - Change FROM:**
```javascript
    : 'YOUR_BACKEND_URL';      // Production: deployed backend (UPDATE THIS!)
```

**Change TO:**
```javascript
    : 'https://YOUR_RENDER_BACKEND_URL.onrender.com';  // Replace with your actual Render URL
```

**Example (after you deploy to Render):**
```javascript
    : 'https://interview-prep-backend.onrender.com';
```

---

## 🔧 Change 2: Update `backend/server.js`

**File Location:** `C:\xampp-new\htdocs\geminitest\backend\server.js`

**Lines 45-47 - Change FROM:**
```javascript
  // Add your GitHub Pages URL here (uncomment and replace with your actual URL):
  // 'https://yourusername.github.io',
  // 'https://yourusername.github.io/geminitest',
```

**Change TO:**
```javascript
  'https://itheshjs.github.io',
  'https://itheshjs.github.io/mainproject',
```

**Complete section should look like:**
```javascript
const allowedOrigins = [
  'http://localhost',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:9002',
  'https://itheshjs.github.io',
  'https://itheshjs.github.io/mainproject',
];
```

---

## 📋 Quick Checklist

- [ ] Deploy backend to Render (get your backend URL)
- [ ] Update `config.js` line 21 with your Render backend URL
- [ ] Update `backend/server.js` lines 45-47 with your GitHub Pages URLs
- [ ] Save both files
- [ ] Commit and push to GitHub
- [ ] Wait 2 minutes
- [ ] Test at https://itheshjs.github.io/mainproject/

---

## 🎯 The Simplest Way (Copy-Paste Ready)

After you deploy backend to Render and get your URL, just do this:

### 1. Edit `config.js`:
Find line 21, replace with:
```javascript
    : 'https://YOUR_RENDER_URL_HERE.onrender.com';
```

### 2. Edit `backend/server.js`:
Find lines 45-47, replace with:
```javascript
  'https://itheshjs.github.io',
  'https://itheshjs.github.io/mainproject',
```

### 3. Push:
```bash
git add .
git commit -m "Fix production URLs"
git push
```

**Done!** ✅









