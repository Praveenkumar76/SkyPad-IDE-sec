# Problem ID 404 Error - Fixed ✅

## Issue
When creating a 1v1 challenge room, the backend was returning:
```
POST /api/challenges/rooms/create 404 - Problem not found
```

## Root Cause
**Mismatch between frontend and backend:**
- **Frontend** was sending `_id` (MongoDB's default ObjectId) from the problem object
- **Backend** was expecting a custom `problemId` field and only searching for: 
  ```javascript
  Problem.findOne({ problemId: problemId })
  ```

This caused the backend to fail finding the problem because it was looking for the wrong field.

## Solution
Updated `backend/src/routes/challenges.js` to handle **both** MongoDB's `_id` and custom `problemId` field:

### Changes Made

#### 1. Room Creation (`POST /api/challenges/rooms/create`)
```javascript
// OLD: Only searched by problemId field
const problem = await Problem.findOne({ problemId: problemId });

// NEW: Try both _id (MongoDB) and problemId (custom)
let problem;
if (mongoose.Types.ObjectId.isValid(problemId)) {
  problem = await Problem.findById(problemId); // Try _id first
}
if (!problem) {
  problem = await Problem.findOne({ problemId: problemId }); // Fallback to custom field
}
```

#### 2. Room Join (`POST /api/challenges/rooms/join`)
Updated to fetch problem using both methods.

#### 3. Get Room Details (`GET /api/challenges/rooms/:roomId`)
Updated to fetch problem using both methods.

#### 4. Submit Code (`POST /api/challenges/rooms/:roomId/submit`)
Updated to fetch problem and test cases using both methods.

## Why This Fix Works

1. **Flexible ID Handling**: Now accepts either format:
   - MongoDB ObjectId: `"507f1f77bcf86cd799439011"`
   - Custom problemId: `"two-sum"` or `"problem-123"`

2. **Backward Compatible**: Works with existing problems that use custom `problemId` field

3. **Future-Proof**: Handles the standard MongoDB `_id` that most queries naturally use

## Testing
After this fix:
1. ✅ Can select any problem from the list
2. ✅ Room creation succeeds
3. ✅ Problem details load correctly
4. ✅ Match flow continues normally
5. ✅ Test cases evaluation works

## Technical Details

### Before:
```javascript
// Only looked for custom field
Problem.findOne({ problemId: "507f1f77bcf86cd799439011" })
// Returns null if problem only has _id
```

### After:
```javascript
// Tries MongoDB _id first
if (mongoose.Types.ObjectId.isValid(problemId)) {
  problem = await Problem.findById(problemId);
}
// Fallback to custom field if not found
if (!problem) {
  problem = await Problem.findOne({ problemId: problemId });
}
// Now finds the problem!
```

## API Response Format
Problem is now consistently returned with MongoDB `_id`:
```json
{
  "roomId": "ABC-123",
  "problemId": "507f1f77bcf86cd799439011",
  "problem": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Two Sum",
    "difficulty": "Easy",
    "description": "...",
    "examples": [...],
    "constraints": "..."
  }
}
```

## Status
✅ **FIXED** - Room creation now works with all problem IDs

---
**Date**: October 20, 2025
**Issue**: 404 Not Found on `/api/challenges/rooms/create`
**Resolution**: Updated backend to handle both `_id` and `problemId` fields

