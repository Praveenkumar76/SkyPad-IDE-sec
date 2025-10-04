# CORS Fix for Vercel Deployment

## Problem
The frontend hosted on Vercel (`https://sky-pad-ide.vercel.app`) cannot make requests to the backend on Render (`https://skypad-ide.onrender.com`) due to CORS policy.

## Solution Applied

### 1. Frontend API Configuration Fixed
- Updated `frontend/src/utils/api.js` to use the correct Render backend URL in production
- Added fallback logic to use `https://skypad-ide.onrender.com/api` when not on localhost

### 2. Backend CORS Configuration Updated
- Updated `backend/src/server.js` to allow requests from Vercel domains
- Added debugging logs to track CORS requests
- Added support for all `.vercel.app` subdomains

## Deployment Steps

### For Vercel (Frontend):
1. The code changes are already applied
2. Redeploy your frontend to Vercel
3. The API will automatically use the correct backend URL

### For Render (Backend):
1. The CORS configuration is updated
2. Redeploy your backend to Render
3. The backend will now accept requests from Vercel

## Environment Variables (Optional)
If you want to explicitly set the API URL, add this to your Vercel environment variables:

```
VITE_API_URL=https://skypad-ide.onrender.com/api
```

## Testing
After deployment:
1. Open your Vercel frontend
2. Open browser developer tools (F12)
3. Check the console for API URL logs
4. Try logging in - it should now work

## Debugging
If issues persist:
1. Check browser console for CORS errors
2. Check Render logs for CORS debugging messages
3. Verify the API URL is correct in the frontend console logs