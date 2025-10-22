# ⚡ QUICK FIX - Vercel 404 JSON Error

## 🎯 The Problem

Error: `Unexpected token '<', "<!DOCTYPE ..." is not valid JSON`

**Cause**: Your frontend on Vercel is trying to call API routes that don't exist on Vercel (they're on Render), so Vercel returns HTML 404 pages instead of JSON.

## ✅ The Solution (2 Steps)

### Step 1: Set Environment Variable in Vercel

1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://skypad-ide.onrender.com/api`
   - **Environments**: All (Production, Preview, Development)
3. Click **Save**

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click `...` on latest deployment → **Redeploy**

**OR** use CLI:
```bash
vercel --prod
```

## ✅ Verify It Worked

1. Open your Vercel app
2. Open browser DevTools (F12) → **Console**
3. You should see:
   ```
   🌐 API Base URL: https://skypad-ide.onrender.com/api
   ```
4. Try logging in - should work!

## 📚 Need More Help?

- **Complete Guide**: [VERCEL-DEPLOYMENT-FIX.md](VERCEL-DEPLOYMENT-FIX.md)
- **Setup Guide**: [frontend/VERCEL-SETUP.md](frontend/VERCEL-SETUP.md)
- **Environment Variables**: [frontend/ENV-SETUP.md](frontend/ENV-SETUP.md)
- **Test Tool**: Open `frontend/test-backend.html` in browser

## 🔍 Still Not Working?

### Test Backend First

Open this URL in your browser:
```
https://skypad-ide.onrender.com/api/health
```

Should return:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

If you get an error, your backend isn't running. Check Render.

### Check Environment Variable

In your deployed app's browser console, check if you see:
```
🌐 API Base URL: https://skypad-ide.onrender.com/api
```

If not, the environment variable isn't set correctly.

---

**That's it!** Set the env var, redeploy, and you're done. 🎉

