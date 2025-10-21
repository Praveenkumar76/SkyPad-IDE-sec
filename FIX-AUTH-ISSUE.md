# 🔧 Fix Authentication Issue - Quick Guide

## Problem
Getting `401 Unauthorized` and "Invalid token" error when creating challenge rooms.

## Root Cause
The authentication middleware wasn't setting `req.user.sub` correctly, which the challenge routes expect.

## ✅ What Was Fixed

### File: `backend/src/middleware/auth.js`
1. Added `sub` field to `req.user` object (for consistency)
2. Added debug logging to track auth flow
3. Better error messages

**Changed:**
```javascript
req.user = {
  sub: user._id.toString(), // ✅ Now includes 'sub'
  id: user._id,
  email: user.email,
  username: user.username
};
```

## 🚀 Steps to Fix

### Step 1: Restart Backend Server

**Option A: If server is running in terminal**
1. Press `Ctrl + C` to stop the server
2. Restart with:
   ```powershell
   cd backend
   npm start
   ```

**Option B: If server is running in background**
1. Find the process and kill it
2. Restart:
   ```powershell
   cd backend
   npm start
   ```

### Step 2: Clear Frontend and Login Again

1. Open browser Developer Tools (F12)
2. Console tab, run:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. **Login** with your credentials
4. Go to **Challenges** → **1v1 CodeDuel**
5. Try creating a room

## 🔍 How to Verify It's Working

### Check Backend Logs
You should now see:
```
[Auth] Token decoded successfully for user: 673abc123def...
POST /api/challenges/rooms/create 201 123.456 ms
```

### No Longer See:
```
POST /api/challenges/rooms/create 401 5.146 ms - 27
```

### Frontend Should:
- ✅ No "Invalid token" error
- ✅ Modal shows problems list
- ✅ Room creation works

## 🐛 Still Not Working?

### Debug Checklist

1. **Check if MongoDB is running**
   ```powershell
   # MongoDB should be active
   mongod
   ```

2. **Check backend logs for:**
   ```
   [Auth] No token provided          → Token not sent
   [Auth] Error: JsonWebTokenError   → Token corrupted
   [Auth] Error: TokenExpiredError   → Need to login again
   ```

3. **Check browser console:**
   - Token should be in localStorage
   - API calls should include `Authorization: Bearer <token>`

4. **Force fresh login:**
   ```javascript
   // Browser console
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   location.href = '/login';
   ```

## 📝 Technical Details

### JWT Token Structure
```
{
  sub: "673abc123def456...",  // User ID
  email: "user@example.com",
  username: "testuser",
  iat: 1234567890,            // Issued at
  exp: 1234654290             // Expires at
}
```

### Auth Middleware Flow
```
1. Extract token from Authorization header
2. Verify token with JWT_SECRET
3. Decode token to get user ID (sub)
4. Fetch user from database
5. Set req.user with user details
6. Call next() to continue to route handler
```

### Challenge Route Expectation
```javascript
router.post('/rooms/create', authenticateToken, async (req, res) => {
  // Expects req.user.sub to be set
  const room = await ChallengeRoom.create({
    hostUserId: req.user.sub  // ✅ Now available
  });
});
```

## ✨ After Fix

Everything should work:
- ✅ Create room
- ✅ Join room
- ✅ Submit code
- ✅ Get room details

## 🎯 Quick Test

```bash
# Terminal 1: Restart backend
cd backend
npm start

# Browser: Clear and login
localStorage.clear();
location.reload();
# Then login

# Try creating a room
# Should work now! ✅
```

## 📊 Expected vs Actual

### Before Fix
```
Frontend → API Request → Backend → 401 Unauthorized
                            ↓
                    req.user.sub = undefined
                            ↓
                    Challenge route fails
```

### After Fix
```
Frontend → API Request → Backend → 200 OK
                            ↓
                    req.user.sub = "673abc..."
                            ↓
                    Challenge route succeeds ✅
```

---

**Fix Status: COMPLETE ✅**

Just restart the backend server and clear your browser storage, then login again!

