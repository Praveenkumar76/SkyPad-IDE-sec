# SkyPad IDE - Architecture Summary

## ✅ Complete Architecture (Single Source of Truth: MongoDB)

### Data Flow

```
User Uploads Question → MongoDB (Public) → Visible to ALL Users
                                          ↓
                        ┌─────────────────┴─────────────────┐
                        ↓                                   ↓
                  Problems Section                    DSA Sheet
                (Shows ALL problems)            (Filters by tags)
```

### 1. **Problem Upload Flow**

**When ANY user uploads a problem:**

1. **Frontend** (`QuestionUpload.jsx`) → POST `/api/problems`
2. **Backend** (`problems.js`) → Saves to MongoDB
   - Stored with: title, description, difficulty, tags, test cases, etc.
   - `createdBy` field tracks who uploaded it
   - `isActive: true` makes it publicly visible
3. **Response** → Returns complete problem object with `_id`
4. **Event** → Triggers `dsaProblemsUpdated` custom event
5. **Auto-refresh** → Problems and DSASheet components reload from DB

### 2. **Problems Section** (`Problems.jsx`)

**Shows ALL problems from ALL users:**

```javascript
// Fetches from PUBLIC endpoint (no auth required)
GET /api/problems?limit=1000

// Returns: { problems: [...], total: X, totalPages: Y }
```

**Features:**
- ✅ Displays ALL uploaded problems (any user)
- ✅ Shows green checkmark for solved problems
- ✅ Green border for solved problem cards
- ✅ Tracks solved count from backend
- ✅ Filters by difficulty
- ✅ Search functionality
- ✅ Refresh button to reload from DB

### 3. **DSA Sheet** (`DSASheet.jsx`)

**Shows problems filtered by tags from DATABASE:**

```javascript
// Fetches ALL problems from DB
GET /api/problems?limit=1000

// Filters client-side by tags:
const tagToTopic = {
  'recursion': 'recursion',
  'linkedlist': 'linkedlist',
  'array': 'array',
  'string': 'string',
  'stack': 'stack',
  'queue': 'queue',
  'tree': 'tree',
  'graph': 'graph',
  'dynamic-programming': 'dynamic-programming',
  'dp': 'dynamic-programming',
  'greedy': 'greedy'
};
```

**Features:**
- ✅ Fetches from DATABASE (not localStorage)
- ✅ Organizes problems by tags automatically
- ✅ Shows problems from ALL users
- ✅ Tracks progress per topic
- ✅ Green checkmarks for solved problems
- ✅ Progress bars based on solved/total
- ✅ No separate storage - same data as Problems section

### 4. **Problem Solver** (`ProblemSolver.jsx`)

**Fetches individual problem from DB:**

```javascript
GET /api/problems/:id
```

**Features:**
- ✅ Loads from database (single source)
- ✅ Empty editor by default
- ✅ Reset button to clear code
- ✅ Auto-closing brackets
- ✅ Detailed test failure output
- ✅ Stdin/stdout format guide
- ✅ Language-specific hints
- ✅ Syncs solved status to backend

### 5. **Solved Problems Tracking**

**Backend** (`User` model):
```javascript
solvedProblems: [{
  problemId: ObjectId,
  solvedAt: Date,
  language: String
}]
```

**API Endpoints:**
- `POST /api/users/solved` - Mark problem as solved
- `GET /api/users/solved` - Get user's solved problems

**Flow:**
1. User solves all test cases
2. Frontend calls `POST /api/users/solved`
3. Backend saves to user's `solvedProblems` array
4. All pages fetch and display checkmarks
5. Progress updates automatically

### 6. **No localStorage for Problems**

**Before (❌ Wrong):**
- Each user had separate localStorage
- Problems not shared between users
- DSA Sheet and Problems had duplicate storage

**Now (✅ Correct):**
- MongoDB is single source of truth
- ALL users see ALL uploaded problems
- DSA Sheet filters same problems by tags
- localStorage only used for:
  - Solved problems cache (synced with backend)
  - User session data

## Summary

### ✅ What Works Now:

1. **User A uploads a problem** → Saved to MongoDB
2. **User B opens Problems page** → Sees User A's problem
3. **User B opens DSA Sheet** → If problem has matching tags, it appears there too
4. **User B solves the problem** → Marked in backend
5. **User B sees checkmark** → In both Problems and DSA Sheet
6. **User C opens the app** → Sees all problems from Users A, B, and everyone else

### Key Points:

- ✅ **Single database** (MongoDB) for all problems
- ✅ **Public access** - everyone sees everyone's uploads
- ✅ **Tag-based filtering** for DSA Sheet
- ✅ **No duplication** - Problems and DSA Sheet use same data
- ✅ **Backend tracking** for solved problems
- ✅ **Real-time sync** via custom events

## How to Use

### Upload a Question:
1. Go to "Upload Question"
2. Fill in title, description, test cases
3. **Important:** Add tags like `array`, `recursion`, `string`, etc.
4. Question saved to DB → visible to ALL users
5. Appears in Problems section immediately
6. Appears in DSA Sheet (if has matching tags)

### Solve a Question:
1. Open from Problems or DSA Sheet
2. Both fetch from same database
3. Write code reading from stdin
4. Test cases show raw stdin format
5. Submit → syncs to backend
6. Checkmark appears for all users

## Test Input Format

**Important:** Test inputs are **raw text**, not code!

### ✅ Correct Format:
```
Input: 1
Output: 1

Input: 5
Output: 120

Input: 1 2 3 4
Output: 10
```

### ❌ Wrong Format:
```
Input: arr = [1]  ❌ (This is Python code, not stdin!)
Input: n = 5      ❌ (This is variable assignment!)
```

Your code must parse the raw stdin text!

