# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth authentication for SkyPad-IDE.

## ✅ What We've Implemented

Your application now supports **two methods** of Google authentication:

1. **Google Sign-In with ID Token** (Existing - already working)
   - Frontend gets ID token from Google
   - Backend verifies it using `google-auth-library`
   - Route: `POST /api/auth/google`

2. **Google OAuth 2.0 with Passport.js** (New - just added)
   - Full OAuth redirect flow
   - User clicks "Sign in with Google" → redirected to Google → back to your app with token
   - Routes: `GET /api/auth/google/oauth` and `GET /api/auth/google/callback`

## 📋 Prerequisites

- A Google Cloud Platform account
- Your Google Client ID and Client Secret

## 🔧 Setup Steps

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in required fields:
     - App name: `SkyPad-IDE`
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email` and `profile`
   - Save and continue

### Step 2: Configure OAuth Client

6. Select **Web application** as the application type
7. Give it a name (e.g., "SkyPad-IDE Web Client")

8. **Authorized JavaScript origins** (add all that apply):
   ```
   http://localhost:5173
   http://localhost:5000
   https://your-frontend-domain.com
   https://your-backend-domain.com
   ```

9. **Authorized redirect URIs** (CRITICAL - must match exactly):
   ```
   http://localhost:5000/api/auth/google/callback
   https://your-backend-domain.com/api/auth/google/callback
   ```

10. Click **Create**
11. Copy your **Client ID** and **Client Secret**

### Step 3: Configure Backend Environment

1. Navigate to `backend/` directory
2. Create a `.env` file (or update existing one):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Callback URL (must match what you set in Google Console)
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (for redirecting after successful auth)
FRONTEND_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-super-secret-key-change-in-production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/skypad-ide
```

### Step 4: Configure Frontend Environment

1. Navigate to `frontend/` directory
2. Create or update `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

## 🚀 How to Use

### Starting the Application

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Testing Google OAuth

1. Open your browser to `http://localhost:5173/login`
2. Click the **Google icon** button
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Grant permissions
6. You'll be redirected back to your app at `/auth/callback`
7. The app will store your JWT token and redirect to `/dashboard`

## 📁 Files Modified/Created

### Backend Files:
- ✅ `backend/src/models/User.js` - Added `googleId` field, made `passwordHash` optional
- ✅ `backend/src/config/passport.js` - New Passport.js configuration
- ✅ `backend/src/routes/auth.js` - Added OAuth routes
- ✅ `backend/src/server.js` - Initialized Passport middleware
- ✅ `backend/package.json` - Added `passport` and `passport-google-oauth20`

### Frontend Files:
- ✅ `frontend/src/components/Login.jsx` - Updated Google button to use OAuth
- ✅ `frontend/src/components/AuthCallback.jsx` - New callback handler
- ✅ `frontend/src/App.jsx` - Added `/auth/callback` route

## 🔄 Authentication Flow

```
User clicks "Sign in with Google"
    ↓
Frontend redirects to: /api/auth/google/oauth
    ↓
Backend redirects to Google's OAuth page
    ↓
User signs in and grants permissions
    ↓
Google redirects to: /api/auth/google/callback
    ↓
Backend:
  - Receives authorization code
  - Exchanges it for user profile
  - Creates or finds user in MongoDB
  - Generates JWT token
  - Redirects to: /auth/callback?token=<jwt>
    ↓
Frontend:
  - Extracts token from URL
  - Stores in localStorage
  - Redirects to /dashboard
```

## 🛠️ Troubleshooting

### "redirect_uri_mismatch" Error
- Double-check that your `GOOGLE_CALLBACK_URL` in `.env` exactly matches one of the authorized redirect URIs in Google Console
- Make sure there are no trailing slashes
- Protocol (http/https) must match exactly

### "Google OAuth not configured" Error
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your `.env` file
- Restart your backend server after changing `.env`

### User Not Being Saved to Database
- Check that MongoDB is running
- Verify `MONGODB_URI` is correct in `.env`
- Check backend logs for any errors

### Token Not Being Stored
- Open browser DevTools → Console
- Check for any JavaScript errors
- Verify the token is in the URL after redirect
- Check localStorage to see if token is saved

## 📚 API Endpoints

### Traditional Login/Register:
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password

### Google Authentication (ID Token):
- `POST /api/auth/google` - Verify Google ID token

### Google OAuth (Passport.js):
- `GET /api/auth/google/oauth` - Initiate OAuth flow
- `GET /api/auth/google/callback` - OAuth callback handler

### Protected Routes:
All other API routes require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔐 Security Notes

1. **Never commit `.env` files** to version control
2. Use strong, unique `JWT_SECRET` in production
3. Use HTTPS in production (required for Google OAuth)
4. Set `NODE_ENV=production` in production
5. Limit CORS origins in production to only your frontend domain
6. Regularly rotate your Google Client Secret

## 🎉 You're All Set!

Your application now has fully functional Google OAuth authentication! Users can sign in with their Google account and seamlessly access your platform.

If you have any issues, check the browser console and backend logs for detailed error messages.

