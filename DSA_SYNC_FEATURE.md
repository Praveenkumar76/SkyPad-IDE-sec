# DSA Sheet Auto-Sync Feature

## Overview
Problems are now automatically synced to the DSA Sheet when created. The system fetches ALL problems from the database (not just 10) and automatically syncs them to the appropriate DSA Sheet topics based on their tags.

## Changes Made

### Backend Changes

#### 1. **Removed Pagination Limit** (`backend/src/routes/problem.js`)
- Changed default `limit` from `10` to `0` (unlimited)
- Added conditional pagination: only applies when `limit > 0`
- This ensures all problems are fetched by default

#### 2. **Enhanced Problem Creation Response** (`backend/src/routes/problem.js`)
- Now returns full problem data (with populated fields) after creation
- Includes all necessary data for frontend to sync to DSA sheet
- Returns properly formatted problem with `id` field

#### 3. **Updated Problem Model** (`backend/src/models/Problem.js`)
- Made `topic` field optional (was required)
- Added `tags` array field for flexible categorization
- Problems can now use tags OR topic for DSA sheet categorization

### Frontend Changes

#### 1. **Auto-Sync on Problem Creation** (`frontend/src/components/QuestionUpload.jsx`)
- When a problem is uploaded, it's automatically synced to DSA sheet
- Uses the full problem data returned from backend
- Dispatches `problemsUpdated` and `dsaProblemsUpdated` events
- Navigates to Problems page after successful upload

#### 2. **Auto-Refresh on Problems Page** (`frontend/src/components/Problems.jsx`)
- Listens for `problemsUpdated` event
- Automatically refreshes and syncs when new problems are added
- Fetches all problems (no pagination limit)

#### 3. **DSA Sheet Real-Time Updates** (`frontend/src/components/DSASheet.jsx`)
- Already has listeners for storage changes and custom events
- Automatically reflects new problems when they're synced

## How It Works

### Tag-to-Topic Mapping
Problems are synced to DSA Sheet topics based on their tags:

```javascript
{
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
}
```

### Sync Flow

1. **User uploads a problem** with tags (e.g., `array, sorting`)
2. **Backend creates the problem** and returns full data
3. **Frontend receives the problem** and checks tags
4. **If tags match DSA topics**, the problem is added to localStorage under that topic
5. **Events are dispatched** to notify Problems and DSA Sheet components
6. **UI auto-refreshes** to show the new problem

### Storage Structure
Problems are stored in localStorage as:
```javascript
{
  "dsaProblems": {
    "array": [
      {
        "id": "problem-id",
        "title": "Two Sum",
        "difficulty": "Easy",
        "description": "...",
        "link": "/solve/problem-id",
        "isSolved": false,
        "problem": { /* full problem data */ }
      }
    ],
    "tree": [ /* ... */ ]
  }
}
```

## API Changes

### GET /api/problems
**Before:**
- Default limit: 10 problems
- Always paginated

**After:**
- Default limit: 0 (all problems)
- Optional pagination (only when limit > 0)
- Returns all problems by default

### POST /api/problems
**Before:**
- Required `topic` field
- Returned minimal problem data

**After:**
- `topic` is optional
- `tags` field supported
- Returns full problem data with populated fields

## Benefits

1. ✅ **No Manual Sync** - Problems automatically appear in DSA sheet
2. ✅ **All Problems Visible** - Fetches all problems, not just 10
3. ✅ **Real-Time Updates** - UI updates immediately after upload
4. ✅ **Flexible Categorization** - Uses tags for better flexibility
5. ✅ **Backward Compatible** - Existing problems still work

## Usage

### For Users
1. Upload a problem with appropriate tags (e.g., `array`, `tree`, `dp`)
2. Problem automatically appears in Problems section
3. If tags match DSA topics, problem also appears in DSA Sheet
4. No manual refresh needed

### For Developers
- Problems with matching tags are automatically categorized
- Use the "Sync to DSA" button on Problems page to manually trigger sync
- DSA Sheet has "Refresh" button for manual sync if needed
- Check browser console for sync logs

## Testing

1. **Create a new problem** with tag `array`
   - Should appear in Problems page immediately
   - Should appear in DSA Sheet under "Array" topic

2. **Create a problem** with tag `tree`
   - Should appear under "Tree" topic in DSA Sheet

3. **Create a problem** without DSA tags
   - Should appear in Problems page only
   - Will not appear in DSA Sheet

## Notes

- Problems without matching DSA tags will only appear in the Problems section
- The sync is client-side (localStorage) for fast access
- Events ensure all components stay in sync
- Pagination can still be used by passing `?limit=X` query param
