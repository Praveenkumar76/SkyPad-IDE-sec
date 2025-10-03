# CORS Error Fix - Deployment Guide

## Error Analysis

You're getting:
```
Access to fetch at 'https://skypad-ide.onrender.com/api/auth/login' from origin 'https://sky-pad-ide.vercel.app' has been blocked by CORS policy
```

This means your **backend on Render** is blocking requests from your **frontend on Vercel**.

## ✅ Fix Applied

I've updated `backend/src/server.js` with proper CORS configuration:

### Changes Made:

1. **Added wildcard for Vercel domains**:
   ```javascript
   origin.endsWith('.vercel.app')  // Allows any Vercel deployment
   ```

2. **Added proper headers**:
   ```javascript
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
   ```

3. **Added OPTIONS handler**:
   ```javascript
   app.options('*', cors(corsOptions));  // Handle preflight requests
   ```

## 🚀 Deploy the Fix

### Step 1: Commit and Push Changes

```bash
git add backend/src/server.js
git commit -m "Fix CORS for Vercel deployment"
git push origin main
```

### Step 2: Redeploy on Render

Your Render backend should auto-deploy when you push to GitHub. If not:

1. Go to your Render dashboard
2. Find your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete

### Step 3: Verify CORS is Fixed

After redeployment, test with:

```bash
curl -X OPTIONS https://skypad-ide.onrender.com/api/auth/login \
  -H "Origin: https://sky-pad-ide.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

You should see in the response:
```
Access-Control-Allow-Origin: https://sky-pad-ide.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

## 🔧 Alternative: Quick Test Locally

### Test backend locally first:

1. **Terminal 1** (Backend):
```bash
cd backend
npm start
```

2. **Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

3. Open `http://localhost:5173` and test if login works

If it works locally, the issue is deployment-specific.

## Environment Variables on Render

Make sure these are set in your Render dashboard:

### Required Environment Variables:

1. **MONGODB_URI**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/skypad-ide
   ```

2. **JWT_SECRET**
   ```
   any-random-secure-string-here
   ```

3. **PORT** (optional, Render sets this)
   ```
   5000
   ```

4. **NODE_ENV** (optional)
   ```
   production
   ```

## Vercel Environment Variables

Set this in your Vercel project settings:

### VITE_API_URL (or VITE_BACKEND_URL):
```
https://skypad-ide.onrender.com
```

Make sure there's NO `/api` at the end!

## Common CORS Issues

### Issue 1: Mixed HTTP/HTTPS
- Frontend: HTTPS (Vercel)
- Backend: HTTP ❌

**Solution**: Make sure Render backend uses HTTPS (it should by default)

### Issue 2: Trailing Slashes
- Frontend calls: `https://skypad-ide.onrender.com/api/`
- Backend expects: `https://skypad-ide.onrender.com/api`

**Solution**: Our code handles this in `api.js` with `.replace(/\/$/, '')`

### Issue 3: Credentials
- If using cookies/sessions, both sides must support credentials
- Frontend: `credentials: 'include'` in fetch
- Backend: `credentials: true` in CORS ✅ (already set)

## Testing After Deployment

### 1. Test Backend Directly

Open in browser:
```
https://skypad-ide.onrender.com/api/health
```

Should return: `{"status":"ok"}`

### 2. Test Problems Endpoint

```
https://skypad-ide.onrender.com/api/problems?limit=10
```

Should return your 25 problems!

### 3. Test from Frontend

Open browser console on Vercel site:
```javascript
fetch('https://skypad-ide.onrender.com/api/problems?limit=10')
  .then(r => r.json())
  .then(d => console.log('Problems:', d.problems.length))
  .catch(e => console.error('Error:', e));
```

## If Still Not Working

### Check Render Logs:

1. Go to Render dashboard
2. Click your backend service
3. Click "Logs" tab
4. Look for CORS errors or blocked requests
5. Check if you see: `CORS blocked origin: https://sky-pad-ide.vercel.app`

### Temporary Debug Mode:

Add this temporarily to see all CORS requests:

```javascript
app.use((req, res, next) => {
  console.log('Request from origin:', req.headers.origin);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  next();
});
```

## After Fix is Deployed

1. Hard refresh your Vercel site: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Clear browser cache
3. Try login again
4. Your 25 problems should be visible!

## Summary

✅ CORS configuration updated
✅ Wildcard for all Vercel deployments
✅ Proper preflight handling
✅ All HTTP methods allowed

**Next Step**: Push changes and redeploy on Render!

