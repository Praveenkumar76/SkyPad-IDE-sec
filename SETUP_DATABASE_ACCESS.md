# How to Make Your 25 Uploaded Problems Visible to All Users

## Issue Diagnosis

Your 25 problems are likely stored in **MongoDB**, but you need to verify the database connection is working properly.

## Step 1: Check MongoDB Connection

### Option A: Check if MongoDB is Running

```powershell
# In PowerShell (backend directory)
cd backend
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET')"
```

### Option B: Check Environment Variables

1. Look for `.env` file in `backend/` folder
2. It should contain:
```env
MONGODB_URI=mongodb://localhost:27017/skypad-ide
# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skypad-ide
JWT_SECRET=your-secret-key-here
PORT=5000
```

## Step 2: Verify Problems Are in Database

### Quick Database Check

Run this in the backend directory to see how many problems are in your database:

```javascript
// Create a file: backend/check-problems.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Problem = require('./src/models/Problem');
    const problems = await Problem.find({ isActive: true });
    
    console.log(`\n📊 Total Active Problems: ${problems.length}\n`);
    
    problems.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} (${p.difficulty}) - Tags: ${p.tags.join(', ')}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProblems();
```

Then run:
```powershell
node backend/check-problems.js
```

## Step 3: Clear Browser Cache (Important!)

Your browser might be showing cached localStorage data instead of fresh database data.

### Clear Cache in Browser:

1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** → Your site URL
4. Delete these keys:
   - `dsaProblems` (old localStorage storage)
   - Any other cached problem data
5. Refresh the page

### Or Use This Quick Fix:

Add this temporary button to clear cache. In `Problems.jsx`, add:

```javascript
// Temporary debug button
<button
  onClick={() => {
    localStorage.removeItem('dsaProblems');
    alert('Cache cleared! Refreshing...');
    window.location.reload();
  }}
  className="bg-red-500 text-white px-4 py-2 rounded"
>
  Clear Cache & Reload
</button>
```

## Step 4: Test the API Directly

### Check if problems are accessible:

```bash
# Test 1: Get all problems (should show your 25 problems)
curl http://localhost:5000/api/problems?limit=100

# Test 2: Check specific problem
curl http://localhost:5000/api/problems/YOUR_PROBLEM_ID
```

Or open in browser:
```
http://localhost:5000/api/problems?limit=100
```

## Step 5: Verify Frontend is Fetching from DB

### Check Browser Console

1. Open Problems page
2. Open DevTools Console (F12)
3. You should see:
   ```
   Loaded 25 problems from database (public, all users' uploads)
   ```

4. Open DSA Sheet
5. You should see:
   ```
   DSA Sheet: Loaded 25 problems from database (all users' uploads)
   ```

## Quick Fix Script

I'll create a cleanup script for you:

```javascript
// frontend/src/utils/clearCache.js
export function clearProblemCache() {
  // Remove old localStorage-based problem storage
  localStorage.removeItem('dsaProblems');
  console.log('✅ Cleared old problem cache');
  console.log('🔄 Reload the page to fetch fresh data from database');
}

// Call this once to clean up
// clearProblemCache();
```

## Expected Behavior After Fix:

### Test Scenario:
1. **User A** uploads a problem with tag "array"
2. **User B** (different browser/computer) visits the site
3. **User B** should see:
   - Problem in "Problems" section ✓
   - Problem in "DSA Sheet" → "Array" topic ✓
4. **User B** solves it → checkmark appears ✓
5. **User A** opens the site → sees User B's solved status? NO (solved is per-user)

### What's Shared vs Personal:

**Shared (All Users):**
- ✅ Uploaded problems
- ✅ Problem details (title, description, test cases)
- ✅ Tags

**Personal (Per User):**
- ✅ Solved problems list
- ✅ User progress
- ✅ User statistics

## If Problems Still Don't Appear:

### Checklist:

1. ✅ MongoDB is running (check with `mongod` or Atlas dashboard)
2. ✅ `.env` file has correct `MONGODB_URI`
3. ✅ Backend server is connected to DB (check console for "[MongoDB] Connected")
4. ✅ Frontend is calling the right API endpoint
5. ✅ Browser cache is cleared
6. ✅ No localStorage override

### Migration Script

If your 25 problems are stuck in localStorage, here's how to migrate them:

```javascript
// Run this in browser console on Problems page:

(async function migratePreviously() {
  const oldProblems = JSON.parse(localStorage.getItem('dsaProblems') || '{}');
  
  for (const topic in oldProblems) {
    for (const problem of oldProblems[topic]) {
      console.log('Found cached problem:', problem.title);
      // These are already in DB if you uploaded them
      // Just clear the cache and reload from DB
    }
  }
  
  console.log('If you uploaded these via QuestionUpload, they are in DB');
  console.log('Just clear localStorage.dsaProblems and reload!');
})();
```

## The Real Solution:

**Just clear your browser's localStorage and reload!**

Your 25 problems are in MongoDB (if you uploaded via the Upload Question page). The frontend will fetch them from the database on page load.

```javascript
// Run in browser console:
localStorage.clear();
location.reload();
```

Then check the console - you should see:
```
Loaded 25 problems from database (public, all users' uploads)
```

