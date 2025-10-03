# MongoDB Verification Guide - Make 25 Problems Visible to All Users

## Quick Fix (Most Likely Solution)

Your 25 problems ARE in the MongoDB database! The issue is your browser is showing old localStorage data instead of fetching from the database.

### **Instant Fix:**

1. Open browser console (F12) on any SkyPad page
2. Run this command:
```javascript
localStorage.removeItem('dsaProblems');
location.reload();
```

3. Check the console - you should see:
```
Loaded 25 problems from database (public, all users' uploads)
```

---

## Verify MongoDB is Running

### Step 1: Check Backend Connection

In your backend terminal, you should see:
```
[MongoDB] Connected
```

If you see:
```
[MongoDB] MONGODB_URI not set. Skipping DB connection.
```

Then you need to set up the environment variable.

### Step 2: Create/Check .env File

Create `backend/.env` file with:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/skypad-ide

# OR MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/skypad-ide?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Port
PORT=5000
```

### Step 3: Install dotenv (if not installed)

```bash
cd backend
npm install dotenv
```

### Step 4: Load .env in server.js

Check if `backend/src/server.js` has this at the top:

```javascript
require('dotenv').config();
```

## Verify Your 25 Problems Are in Database

### Method 1: Direct API Check

While backend is running, open in browser or use curl:

```
http://localhost:5000/api/problems?limit=100
```

You should see JSON with your 25 problems.

### Method 2: MongoDB Compass

1. Download MongoDB Compass (free GUI)
2. Connect to your MongoDB instance
3. Navigate to: `skypad-ide` database → `problems` collection
4. You should see your 25 documents

### Method 3: Command Line Check

```bash
# If using local MongoDB
mongosh
use skypad-ide
db.problems.countDocuments({ isActive: true })
# Should show: 25

db.problems.find({ isActive: true }).limit(5).pretty()
# Shows first 5 problems
```

## Understanding the Architecture

### Before (Old - Per User):
```
localStorage (Browser)
  ├─ dsaProblems (User A only)
  └─ solvedProblems (User A only)
```

### Now (Correct - Shared Database):
```
MongoDB (Shared Server)
  ├─ problems collection (ALL users see same 25 problems)
  └─ users collection
       └─ each user has their own solvedProblems array

Frontend fetches from MongoDB, not localStorage
```

## What Happens When You Upload a Problem

### Upload Flow:
```
1. Fill form in QuestionUpload.jsx
2. Click "Upload Question"
3. POST /api/problems → MongoDB saves it
4. Backend returns: { _id, title, tags, ... }
5. Frontend triggers 'dsaProblemsUpdated' event
6. Problems.jsx refetches from DB
7. DSASheet.jsx refetches and filters by tags
8. ALL users can now see this problem
```

## Migration Path for Your 25 Problems

### If problems were uploaded via QuestionUpload:
✅ They are in MongoDB
✅ Just clear localStorage cache
✅ Reload page

### If problems only exist in localStorage:
❌ They are NOT in database
❌ Need to re-upload via Upload Question page
❌ Or export and batch import

### How to Check:

Run in browser console:
```javascript
// Check localStorage
const cached = JSON.parse(localStorage.getItem('dsaProblems') || '{}');
let count = 0;
for (let topic in cached) {
    count += cached[topic].length;
}
console.log('LocalStorage problems:', count);

// Check database via API
fetch('http://localhost:5000/api/problems?limit=1000')
    .then(r => r.json())
    .then(d => console.log('Database problems:', d.problems.length));
```

## Final Checklist

- [ ] MongoDB is running (local or Atlas)
- [ ] `.env` file has correct `MONGODB_URI`
- [ ] Backend shows "[MongoDB] Connected"
- [ ] API endpoint returns your 25 problems
- [ ] Browser localStorage cache is cleared
- [ ] Page reload fetches from database
- [ ] Console shows "Loaded X problems from database"

## Still Not Working?

### Debug Steps:

1. **Check backend logs** - Any MongoDB errors?
2. **Check network tab** - Is `/api/problems` returning data?
3. **Check response** - Does it include your 25 problems?
4. **Check frontend state** - Are problems stored in React state?

### Get Help:

Share these details:
- Backend console output (MongoDB connection status)
- Response from `http://localhost:5000/api/problems?limit=100`
- Browser console output when loading Problems page
- Any error messages

## Quick Test Script

Save as `test-public-access.js` and run from another browser/incognito:

```javascript
// This simulates a different user
fetch('http://localhost:5000/api/problems?limit=100')
    .then(r => r.json())
    .then(data => {
        console.log('Total problems visible:', data.problems.length);
        console.log('First 3 problems:', data.problems.slice(0, 3).map(p => p.title));
    })
    .catch(err => console.error('Error:', err));
```

If this returns your 25 problems, they ARE public and visible to all users!

