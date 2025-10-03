# 🚀 Deployment Checklist - Fix CORS and Make 25 Problems Visible

## Issues to Fix:

1. ❌ CORS error blocking frontend from accessing backend
2. ❌ Your 25 problems only visible in your session (need to clear cache)

## Step-by-Step Fix

### 1️⃣ **Deploy Backend Changes (Render)**

```bash
# Commit the CORS fix
git add backend/src/server.js
git add backend/src/models/User.js
git add backend/src/routes/users.js
git add backend/src/routes/problems.js
git commit -m "Fix CORS for Vercel + Add solved tracking + Increase problem limit"
git push origin main
```

**Wait for Render to auto-deploy** (or manually trigger deploy)

### 2️⃣ **Deploy Frontend Changes (Vercel)**

```bash
# Commit frontend changes
git add frontend/src/components/*.jsx
git add frontend/src/utils/api.js
git commit -m "Add solved tracking + Clear cache button + Input format guides"
git push origin main
```

**Vercel will auto-deploy**

### 3️⃣ **Verify Backend is Running**

Open in browser:
```
https://skypad-ide.onrender.com/api/health
```

Expected: `{"status":"ok"}`

### 4️⃣ **Test CORS is Fixed**

Open browser console and run:
```javascript
fetch('https://skypad-ide.onrender.com/api/problems?limit=5', {
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => r.json())
  .then(d => console.log('✅ CORS working!', d))
  .catch(e => console.error('❌ CORS still blocked:', e));
```

### 5️⃣ **Clear Your Browser Cache**

On your deployed Vercel site:

1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Check "Local storage"
5. Click "Clear site data"
6. Reload page

**Or use the "Clear Cache" button** I added to the Problems page!

### 6️⃣ **Verify Your 25 Problems Appear**

1. Go to Problems page
2. Check browser console
3. Should see: `✅ Loaded 25 problems from database`
4. All problems should be visible
5. Go to DSA Sheet
6. Problems with tags should appear in appropriate sections

---

## 📋 Environment Variables Checklist

### Render (Backend):

| Variable | Value | Required |
|----------|-------|----------|
| MONGODB_URI | `mongodb+srv://...` | ✅ Yes |
| JWT_SECRET | Any random string | ✅ Yes |
| PORT | Auto-set by Render | ⚠️ Auto |
| NODE_ENV | `production` | ⚠️ Optional |

### Vercel (Frontend):

| Variable | Value | Required |
|----------|-------|----------|
| VITE_BACKEND_URL | `https://skypad-ide.onrender.com` | ✅ Yes |
| VITE_SOCKET_URL | `https://skypad-ide.onrender.com` | ✅ Yes |

**Important**: No `/api` at the end!

---

## 🧪 Testing Checklist

After deployment, test these:

- [ ] Backend health check: `https://skypad-ide.onrender.com/api/health`
- [ ] Get problems: `https://skypad-ide.onrender.com/api/problems`
- [ ] Login from Vercel frontend
- [ ] View problems (should see all 25)
- [ ] Upload new problem
- [ ] Solve a problem
- [ ] Check DSA Sheet
- [ ] Verify solved checkmarks appear
- [ ] Test with different user account

---

## 🔍 Debugging

### If CORS Still Fails:

Check Render logs:
1. Render Dashboard → Your Service → Logs
2. Look for: `CORS blocked origin: ...`
3. Make sure you see: `[MongoDB] Connected`

### If Problems Don't Appear:

Check browser console:
1. F12 → Console tab
2. Look for: `Loaded X problems from database`
3. Check Network tab → `/api/problems` response
4. Verify response has `problems` array

### If Login Fails:

1. Check JWT_SECRET is set on Render
2. Check MONGODB_URI is valid
3. Test backend directly: `POST https://skypad-ide.onrender.com/api/auth/login`

---

## 📦 Files Changed (Need to Deploy)

### Backend:
- ✅ `src/server.js` - CORS fix
- ✅ `src/routes/problems.js` - Increased limit, better errors
- ✅ `src/routes/users.js` - Added solved tracking endpoints
- ✅ `src/models/User.js` - Added solvedProblems field

### Frontend:
- ✅ `components/Problems.jsx` - Fetch from DB, clear cache button
- ✅ `components/DSASheet.jsx` - Fetch from DB, no localStorage
- ✅ `components/ProblemSolver.jsx` - Reset button, better hints, sync solved
- ✅ `components/QuestionUpload.jsx` - Input format guide
- ✅ `components/CodeEditor.jsx` - Fixed textAreaRef
- ✅ `components/Dashboard.jsx` - Back button
- ✅ `components/Challenges.jsx` - Back button
- ✅ `components/Rewards.jsx` - Back button
- ✅ `components/InterviewExamine.jsx` - Back button
- ✅ `components/DashboardNavbar.jsx` - Higher z-index
- ✅ `utils/api.js` - Added solved problem APIs

---

## 🎯 Expected Results After Deployment

1. ✅ Login works from Vercel
2. ✅ All 25 problems visible to all users
3. ✅ DSA Sheet shows problems filtered by tags
4. ✅ Solved problems tracked in database
5. ✅ Green checkmarks show on solved problems
6. ✅ Progress bars update correctly
7. ✅ No CORS errors
8. ✅ All languages work
9. ✅ Test cases execute properly

---

## 🚨 Quick Deploy Commands

```bash
# From project root
git add .
git commit -m "Fix CORS + Database fetching + Solved tracking + UI improvements"
git push origin main
```

Wait 2-3 minutes for:
- Render to rebuild backend
- Vercel to rebuild frontend

Then test everything!

---

## 💡 Immediate Actions

1. **Deploy backend** - CORS fix is critical
2. **Deploy frontend** - Get latest UI improvements
3. **Clear browser cache** - Remove old localStorage
4. **Test with another user** - Verify problems are public
5. **Check all 25 problems appear** - Should work after cache clear

**Total deployment time: ~5 minutes** ⏱️

