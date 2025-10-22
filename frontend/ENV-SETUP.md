# Environment Variables Setup

## Frontend Environment Variables

The frontend uses environment variables to configure the backend API URL. In **Vite**, all environment variables that should be exposed to the client must be prefixed with `VITE_`.

### Required Variables

#### `VITE_BACKEND_URL`
- **Description**: The base URL of your backend API
- **Required**: No (has fallback)
- **Format**: Full URL with `/api` suffix, no trailing slash
- **Examples**:
  - Render: `https://skypad-ide.onrender.com/api`
  - Railway: `https://your-app.railway.app/api`
  - Heroku: `https://your-app.herokuapp.com/api`
  - Local: `http://localhost:5000/api`

### Default Behavior

If `VITE_BACKEND_URL` is **not set**, the app uses this logic:

```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://skypad-ide.onrender.com/api');
```

This means:
- ✅ Running on localhost → uses `http://localhost:5000/api`
- ✅ Running in production → uses `https://skypad-ide.onrender.com/api`
- ✅ But **you should still set it explicitly in Vercel** for clarity and control

## Setting Environment Variables

### Local Development

Create a `.env` file in the `frontend/` directory:

```bash
# frontend/.env
VITE_BACKEND_URL=http://localhost:5000/api
```

> ⚠️ **Note**: `.env` files are gitignored. Never commit them to version control.

### Vercel (Production)

1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Add:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://skypad-ide.onrender.com/api`
   - **Environments**: All (Production, Preview, Development)
4. **Save**
5. **Redeploy** your application

### Other Platforms

#### Netlify
1. **Site settings** → **Environment variables**
2. Add `VITE_BACKEND_URL`
3. Redeploy

#### Railway
1. **Variables** tab
2. Add `VITE_BACKEND_URL`
3. Redeploy

#### GitHub Pages
For static deployments, you'll need to set it during build:
```bash
VITE_BACKEND_URL=https://your-backend.com/api npm run build
```

## Verifying Configuration

### In Browser Console
When the app loads, you should see:
```
🌐 API Base URL: https://skypad-ide.onrender.com/api
🎮 Challenge API Base URL: https://skypad-ide.onrender.com/api
```

### In Network Tab
When making API calls:
- Requests should go to: `https://skypad-ide.onrender.com/api/auth/login`
- NOT to: `https://your-vercel-app.vercel.app/api/auth/login` ❌

## Common Mistakes

### ❌ Wrong: Missing `VITE_` prefix
```bash
BACKEND_URL=https://skypad-ide.onrender.com/api
```
This won't work! Vite won't expose it.

### ❌ Wrong: Trailing slash
```bash
VITE_BACKEND_URL=https://skypad-ide.onrender.com/api/
```
The trailing slash will cause incorrect URLs.

### ❌ Wrong: Missing `/api` suffix
```bash
VITE_BACKEND_URL=https://skypad-ide.onrender.com
```
The app expects the `/api` suffix.

### ✅ Correct
```bash
VITE_BACKEND_URL=https://skypad-ide.onrender.com/api
```

## Backend Environment Variables

The backend also requires environment variables. Create a `.env` file in the `backend/` directory:

```bash
# backend/.env

# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skypad-ide?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origins (comma-separated list)
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Setting Backend Variables on Render

1. Go to your Render service dashboard
2. **Environment** tab
3. Add each variable
4. **Save Changes** (will trigger redeploy)

## Testing

### Test Backend is Accessible

```bash
# Health check
curl https://skypad-ide.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Test Frontend in Development

```bash
cd frontend
npm run dev

# Check browser console for:
# 🌐 API Base URL: http://localhost:5000/api
```

### Test Frontend in Production

1. Deploy to Vercel with environment variable set
2. Open your Vercel URL
3. Check browser console for:
   ```
   🌐 API Base URL: https://skypad-ide.onrender.com/api
   ```
4. Try login/register

## Security Best Practices

1. ✅ **Never commit `.env` files** (they're gitignored)
2. ✅ **Use different values** for development and production
3. ✅ **Use strong JWT secrets** (random, 32+ characters)
4. ✅ **Restrict CORS** to specific domains in production
5. ✅ **Use HTTPS** in production (Vercel and Render provide this)
6. ✅ **Rotate secrets** if they're ever exposed

## Troubleshooting

### Environment Variable Not Loading

**Symptoms**: 
- Browser console shows wrong URL
- API calls go to wrong endpoint

**Solutions**:
1. Verify variable name starts with `VITE_`
2. Restart dev server (`npm run dev`)
3. Clear browser cache
4. For Vercel: Redeploy after setting variables

### CORS Errors

**Symptoms**:
```
Access to fetch has been blocked by CORS policy
```

**Solutions**:
1. Add your frontend URL to backend `CORS_ORIGINS`
2. Restart backend server
3. Verify backend CORS configuration

---

**Need Help?** See [VERCEL-DEPLOYMENT-FIX.md](../VERCEL-DEPLOYMENT-FIX.md) for detailed troubleshooting.

