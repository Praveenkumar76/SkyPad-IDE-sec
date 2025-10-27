# Google OAuth Setup Guide for SkyPad-IDE

## Overview
This guide will help you set up Google OAuth authentication for SkyPad-IDE. The setup involves configuring Google Cloud Console, setting up environment variables, and testing the authentication flow.

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `SkyPad-IDE` (or your preferred name)
4. Click "Create"

### 1.2 Enable Google+ API
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google OAuth2 API" if available

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add your email to test users
   - Save and continue through all steps

### 1.4 Configure OAuth Client
1. Application type: "Web application"
2. Name: "SkyPad-IDE OAuth Client"
3. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:3000
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```
5. Click "Create"
6. **IMPORTANT:** Copy the Client ID and Client Secret - you'll need these for environment variables

## Step 2: Environment Configuration

### 2.1 Backend Environment Variables
1. Copy `backend/env.example` to `backend/.env`
2. Fill in the following values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/skypad-ide

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth Configuration (from Step 1.4)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Server Configuration
PORT=5000
CODE_EDITOR_PORT=4000
NODE_ENV=development
```

### 2.2 Frontend Environment Variables
1. Copy `frontend/env.example` to `frontend/.env`
2. Fill in the following values:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Step 3: Testing the Setup

### 3.1 Start the Servers
1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 3.2 Test Google OAuth
1. Open `http://localhost:5173/login`
2. Click the Google sign-in button
3. You should be redirected to Google's OAuth consent screen
4. After granting permission, you should be redirected back to the dashboard

## Step 4: Troubleshooting

### Common Issues and Solutions

#### 4.1 "OAuth not configured" Error
- **Cause:** Missing or incorrect environment variables
- **Solution:** Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `backend/.env`

#### 4.2 "Invalid redirect URI" Error
- **Cause:** Redirect URI in Google Console doesn't match the callback URL
- **Solution:** Ensure `http://localhost:5000/api/auth/google/callback` is added to Authorized redirect URIs

#### 4.3 "Invalid client" Error
- **Cause:** Wrong Client ID or Client Secret
- **Solution:** Double-check the credentials in Google Cloud Console and environment variables

#### 4.4 CORS Errors
- **Cause:** Frontend URL not allowed in CORS configuration
- **Solution:** Add `http://localhost:5173` to `CORS_ORIGINS` in backend `.env`

#### 4.5 Database Connection Issues
- **Cause:** MongoDB not running or wrong connection string
- **Solution:** Start MongoDB and check `MONGODB_URI` in backend `.env`

### 4.6 Debug Mode
To enable debug logging, add this to your backend `.env`:
```env
DEBUG=passport:*
```

## Step 5: Production Deployment

### 5.1 Update Google Cloud Console
For production deployment, update the OAuth client settings:
1. Add your production domain to "Authorized JavaScript origins"
2. Add your production callback URL to "Authorized redirect URIs"
3. Update OAuth consent screen with production information

### 5.2 Environment Variables for Production
Update your production environment variables:
```env
# Production URLs
FRONTEND_URL=https://your-domain.com
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback
CORS_ORIGINS=https://your-domain.com

# Production database
MONGODB_URI=mongodb://your-production-db-url

# Strong JWT secret
JWT_SECRET=your-production-jwt-secret
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong, unique JWT secrets** in production
3. **Regularly rotate OAuth credentials** for security
4. **Monitor OAuth usage** in Google Cloud Console
5. **Use HTTPS in production** for all OAuth flows

## Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check the backend server logs for authentication errors
3. Verify all environment variables are correctly set
4. Ensure Google Cloud Console configuration matches your setup

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google Cloud Console](https://console.cloud.google.com/)
