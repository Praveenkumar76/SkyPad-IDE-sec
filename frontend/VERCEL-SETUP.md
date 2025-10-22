# Vercel Deployment Setup Guide

This is a **quick reference** for deploying the SkyPad-IDE frontend to Vercel. For a detailed explanation of the 404/JSON error, see [VERCEL-DEPLOYMENT-FIX.md](../VERCEL-DEPLOYMENT-FIX.md).

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- ✅ Backend deployed on Render (or similar service)
- ✅ Backend is running and accessible
- ✅ Vercel account created

### Step 1: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name? skypad-ide-frontend (or your choice)
# - Directory? ./
# - Override settings? No
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Set **Root Directory** to `frontend`
4. Click **Deploy**

### Step 2: Configure Environment Variables

**This is the most important step!**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_BACKEND_URL` | `https://skypad-ide.onrender.com/api` | Production, Preview, Development |

4. Click **Save**

> ⚠️ **Important**: Replace the URL with your actual backend URL if different.

### Step 3: Redeploy

After adding environment variables, you **must redeploy**:

1. Go to **Deployments** tab
2. Click the three dots `...` on the latest deployment
3. Click **Redeploy**
4. Check "Use existing Build Cache"
5. Click **Redeploy**

Alternatively, use the CLI:
```bash
vercel --prod
```

### Step 4: Test Your Deployment

1. Open your Vercel app URL (e.g., `https://skypad-ide-frontend.vercel.app`)
2. Open browser DevTools (F12) → **Console** tab
3. You should see:
   ```
   🌐 API Base URL: https://skypad-ide.onrender.com/api
   ```
4. Try to log in or register
5. Check **Network** tab:
   - Request should go to `https://skypad-ide.onrender.com/api/auth/login`
   - Should return JSON response with `{token: "...", user: {...}}`

## ✅ Verification Checklist

Before testing, verify:

- [ ] Backend is running (visit `https://skypad-ide.onrender.com/api/health`)
- [ ] `VITE_BACKEND_URL` is set in Vercel environment variables
- [ ] Environment variable value is correct (no typos, includes `/api` suffix)
- [ ] App has been redeployed after setting environment variables
- [ ] Browser console shows correct API URL on page load
- [ ] Login/Register works without errors

## 🔧 Build Configuration

Vercel should auto-detect your build settings, but if needed:

**Framework Preset**: Vite

**Build Command**:
```bash
npm run build
```

**Output Directory**:
```
dist
```

**Install Command**:
```bash
npm install
```

**Node Version**: 18.x or higher

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

## 🐛 Troubleshooting

### Issue: Still getting 404 errors after deployment

**Solution**:
1. Verify environment variable is set correctly
2. Check you redeployed after setting the variable
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check Vercel deployment logs for errors

### Issue: Environment variable not working

**Solution**:
1. Ensure the variable name starts with `VITE_`
2. Check for typos in the variable name
3. Redeploy after making changes
4. Check browser console for the logged API URL

### Issue: CORS errors in production

**Solution**:
1. Add your Vercel domain to backend CORS whitelist
2. Update `backend/src/server.js` CORS configuration:
   ```javascript
   const corsOptions = {
     origin: [
       'https://your-app.vercel.app',
       'http://localhost:5173'
     ],
     credentials: true
   };
   app.use(cors(corsOptions));
   ```
3. Redeploy backend

### Issue: Backend takes 30+ seconds to respond

**Cause**: Render free tier puts apps to sleep after inactivity

**Solutions**:
- Wait for cold start (first request takes longer)
- Upgrade to Render paid tier for always-on
- Use a service like UptimeRobot to ping your backend every 5 minutes

## 📊 Monitoring Your Deployment

### View Logs
```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

### Check Deployment Status
```bash
vercel inspect [deployment-url]
```

### List All Deployments
```bash
vercel ls
```

## 🔄 Update Your Deployment

### For Code Changes
Just push to your Git repository. Vercel will auto-deploy.

Or use CLI:
```bash
vercel --prod
```

### For Environment Variable Changes
1. Update in Vercel dashboard
2. **Must redeploy** for changes to take effect

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Main Fix Guide](../VERCEL-DEPLOYMENT-FIX.md)

## 🆘 Still Having Issues?

1. Check browser DevTools → Console tab for errors
2. Check browser DevTools → Network tab for failing requests
3. Verify backend is accessible: `https://skypad-ide.onrender.com/api/health`
4. Check Vercel deployment logs
5. Check backend logs on Render

---

**Quick Summary**: Set `VITE_BACKEND_URL` in Vercel, redeploy, and you're done! 🎉

