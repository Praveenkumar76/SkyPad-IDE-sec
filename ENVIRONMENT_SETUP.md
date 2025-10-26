# Environment Variables Setup

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# ========================================
# DATABASE CONFIGURATION
# ========================================
MONGODB_URI=mongodb://localhost:27017/skypad-ide
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skypad-ide?retryWrites=true&w=majority

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-me-in-production

# ========================================
# GOOGLE OAUTH CONFIGURATION
# ========================================
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# ========================================
# FRONTEND CONFIGURATION
# ========================================
FRONTEND_URL=http://localhost:5173

# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=5000
NODE_ENV=development

# ========================================
# CORS CONFIGURATION
# ========================================
# Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

## Production Configuration

For production, update these values:

### Backend `.env`:
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=strong-random-secret-for-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
NODE_ENV=production
CORS_ORIGINS=https://your-frontend-domain.com
```

### Frontend `.env`:
```env
VITE_API_URL=https://your-backend-domain.com
```

## Google Console Configuration

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

**Authorized JavaScript origins:**
- Development: `http://localhost:5173` and `http://localhost:5000`
- Production: `https://your-frontend-domain.com` and `https://your-backend-domain.com`

**Authorized redirect URIs:**
- Development: `http://localhost:5000/api/auth/google/callback`
- Production: `https://your-backend-domain.com/api/auth/google/callback`

