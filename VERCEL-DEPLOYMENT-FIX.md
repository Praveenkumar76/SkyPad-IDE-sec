# Vercel Deployment Fix Guide

## 🔍 Understanding the Problem

### What the Error Means
```
Unexpected token '<', "<!DOCTYPE ..." is not valid JSON
```

This error occurs when your frontend code expects a JSON response from the API (e.g., `{"success": true, "token": "..."}`), but instead receives an HTML page. The `<` is the first character of `<!DOCTYPE html>`, which is how every HTML page starts.

### The Root Cause
Your browser console shows:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
```

**This is the real problem.**

#### What's Happening:

1. ✅ **Your "Sign in" button is clicked**
2. ✅ **Your JavaScript code tries to send email/password to an API endpoint** (like `/api/auth/login`)
3. ❌ **On Vercel, that API endpoint cannot be found (404)**
4. ❌ **Vercel returns its default "404 Not Found" HTML page**
5. ❌ **Your code, expecting JSON, tries to parse the HTML page and crashes**

## 🏗️ Your Architecture

Your project uses a **separate frontend and backend** architecture:

- **Frontend**: React/Vite app → Deployed on **Vercel**
- **Backend**: Express/Node.js API → Deployed on **Render** (https://skypad-ide.onrender.com)

This is **NOT** a Next.js full-stack app, so Vercel doesn't have your API routes. Your frontend needs to communicate with the separate backend on Render.

## ✅ The Solution

### Step 1: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://skypad-ide.onrender.com/api`
   - **Environment**: Select all (Production, Preview, Development)

4. Click **Save**
5. **Redeploy your application** (Vercel → Deployments → Redeploy)

> ⚠️ **Important**: In Vite, environment variables MUST start with `VITE_` to be exposed to the client-side code.

### Step 2: Verify Backend is Running

Visit these URLs in your browser:

1. **Backend Health Check**: https://skypad-ide.onrender.com/api/health
   - Should return: `{"status":"ok","timestamp":"...","uptime":...}`

2. **Backend Root**: https://skypad-ide.onrender.com
   - Should return: `SkyPad-IDE API is running`

If these don't work, your backend on Render is down or not deployed.

### Step 3: Check CORS Configuration

Your backend CORS is already configured to allow all origins (which is fine for development/testing):

```javascript
// backend/src/server.js (line 27)
app.use(cors());
```

For production, you might want to restrict this to your Vercel domain:

```javascript
const corsOptions = {
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:5173', // for local development
    'http://localhost:5000'
  ],
  credentials: true
};
app.use(cors(corsOptions));
```

### Step 4: Verify Frontend API Configuration

Your `frontend/src/utils/api.js` is already set up correctly:

```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://skypad-ide.onrender.com/api');
```

This means:
- If `VITE_BACKEND_URL` is set in Vercel → uses that
- If running on localhost → uses `http://localhost:5000/api`
- Otherwise → falls back to `https://skypad-ide.onrender.com/api`

## 🧪 Testing

### Local Testing
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Try logging in

### Production Testing
1. Deploy to Vercel with environment variable set
2. Open your Vercel app URL
3. Open browser DevTools (F12) → Network tab
4. Try logging in
5. Check the request to `/api/auth/login`:
   - **Should go to**: `https://skypad-ide.onrender.com/api/auth/login`
   - **Should return**: JSON response with `{token: "...", user: {...}}`

## 🚨 Common Issues

### Issue 1: Backend Returns 404

**Symptoms**: 
- API endpoint not found
- HTML page instead of JSON

**Solutions**:
- Verify backend is deployed and running on Render
- Check the API URL is correct (no typos)
- Ensure route files are correctly named (case-sensitive on Linux)

### Issue 2: CORS Errors

**Symptoms**:
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Solutions**:
- Add your Vercel domain to CORS allowed origins
- Ensure credentials are properly configured

### Issue 3: Environment Variable Not Set

**Symptoms**:
- Frontend tries to call `/api/auth/login` on Vercel domain
- Gets 404 because Vercel doesn't have backend

**Solutions**:
- Verify `VITE_BACKEND_URL` is set in Vercel
- Redeploy after adding environment variable
- Check build logs for environment variables

### Issue 4: Render Backend Sleeping

**Symptoms**:
- First request takes 30+ seconds
- Backend eventually works

**Solutions**:
- Render free tier puts apps to sleep after inactivity
- Upgrade to paid tier for always-on
- Or accept the cold start delay

## 📝 Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Backend health check returns OK
- [ ] CORS configured to allow Vercel domain
- [ ] Environment variable `VITE_BACKEND_URL` set in Vercel
- [ ] Frontend redeployed after setting environment variable
- [ ] Tested login/register in production
- [ ] Browser DevTools shows correct API URL

## 🔧 Updated Files

I've improved the error handling in your API utilities to provide better error messages when the backend is unavailable.

## 🎯 Quick Fix Summary

**The fastest fix right now:**

1. **Set `VITE_BACKEND_URL` in Vercel** → `https://skypad-ide.onrender.com/api`
2. **Redeploy your app**
3. **Test login**

That's it! Your frontend will now properly connect to your backend on Render.

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Need Help?** If you're still experiencing issues:

1. Check browser DevTools → Network tab → Look at the failing request
2. Check Vercel deployment logs
3. Check Render backend logs
4. Verify all URLs and environment variables

