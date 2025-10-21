# 1v1 CodeDuel - Quick Testing Guide

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. MongoDB connected
3. Socket.io server initialized
4. At least 10+ problems in database (for pagination)
5. Problems have test cases defined

## Quick Test Steps

### Test 1: Create & Wait (2-Minute Timeout)
```
1. Navigate to /challenges
2. Click "1v1 CodeDuel" button
3. Click "Create New Room"
4. Select any problem (use pagination if 10+ problems)
5. Click "Create Room"
6. Copy Room ID
7. Wait 2 minutes → Room should expire with message
```

### Test 2: Create & Join (Full Flow)
```
Player 1:
1. Navigate to /challenges
2. Click "1v1 CodeDuel"
3. Click "Create New Room"
4. Select problem from page 1
5. Click "Create Room"
6. Copy Room ID (e.g., ABC-123)
7. Wait in lobby...

Player 2 (different browser/incognito):
1. Navigate to /challenges
2. Click "1v1 CodeDuel"
3. Click "Join Existing Room"
4. Paste Room ID
5. Click "Join Room"

Both Players:
6. See "another person is live" indicator
7. Watch 3-second countdown (3, 2, 1)
8. Redirected to CodeDuel IDE
9. See match timer counting up
10. Write code or use starter template
11. Click "Run Code" → See sample test results
12. Click "Submit" → See all test results

Player 1 (submit first):
13. Submit working solution
14. All tests pass
15. See "You won! Redirecting..." message
16. Auto-redirect to Results page
17. See victory screen with rewards

Player 2:
13. See "Opponent has submitted!" notification
14. Match automatically ends
15. Auto-redirect to Results page
16. See "Better luck next time" screen
```

### Test 3: Pagination
```
1. Go to /challenges/1v1
2. Click "Create New Room"
3. Verify problems list shows only 10 items
4. Click "Next" → Page 2 loads
5. Verify page counter shows "Page 2 of X"
6. Click "Previous" → Back to page 1
7. Use search filter
8. Use difficulty filter
9. Verify pagination resets to page 1 after filter
```

### Test 4: Socket Connection
```
Player 1:
1. Create room
2. Open browser DevTools → Network → WS
3. Verify WebSocket connection established

Player 2:
4. Join room
5. Check WebSocket in DevTools
6. Verify "opponent-joined" event in console

Both:
7. During countdown → Check "match-countdown" events
8. In IDE → Check "code-submitted" events
9. After winner → Check "match-finished" event
10. On results page → Socket should still be connected
```

### Test 5: Error Handling
```
1. Join with invalid Room ID → See error
2. Try to join expired room → See error
3. Submit empty code → See validation message
4. Submit code with syntax error → See error feedback
5. Close browser mid-match → Opponent should still be able to finish
```

## Expected Behaviors

### Countdown (3-2-1)
- Each number displays for 1 second
- Animated pulse effect on each number
- "Get ready to code! ⚡" message
- Both players redirect simultaneously

### Test Results Display
```
Run Code:
✓ Sample Test 1 - Passed
✓ Sample Test 2 - Passed
✓ Sample Test 3 - Passed

Submit:
✅ ALL TEST CASES PASSED!
Result: ACCEPTED
Tests Passed: 8/8
🎉 Congratulations! You won the match!
```

### Results Page
**Winner Sees:**
- 🎉 Icon
- "Congratulations! You Won!"
- Match summary (duration, problem, difficulty)
- Rewards section (rating, achievements, XP)
- Winner badge on their card

**Loser Sees:**
- 💪 Icon  
- "Better Luck Next Time!"
- Random encouragement phrase
- Match summary
- No rewards section
- Winner badge on opponent's card

## Debug Console Messages

Look for these in browser console:

```javascript
// Socket Events
"User connected: {username}"
"Room joined: {roomId}"
"Opponent joined"
"Match countdown: 3"
"Match countdown: 2"
"Match countdown: 1"
"Match started"
"Opponent submitted"
"Match finished, winner: {userId}"

// API Calls
"POST /api/challenges/rooms/create"
"POST /api/challenges/rooms/join"
"GET /api/challenges/rooms/{roomId}"
"POST /api/challenges/rooms/{roomId}/submit"
```

## Common Issues & Solutions

### Issue: Socket not connecting
**Solution:** Check `VITE_BACKEND_URL` environment variable

### Issue: Room not found
**Solution:** Verify MongoDB is running and connected

### Issue: Test cases not running
**Solution:** Ensure problem has `hiddenTestCases` array in database

### Issue: Countdown skips numbers
**Solution:** Check server logs for socket event timing

### Issue: Winner not determined
**Solution:** Verify backend `/submit` endpoint logic

### Issue: Results page shows wrong winner
**Solution:** Check `location.state.isWinner` in navigation

## Performance Checks

- [ ] Room creation < 500ms
- [ ] Room join < 300ms
- [ ] Countdown timing accurate (±100ms)
- [ ] Code submission < 2s
- [ ] Results page load < 500ms
- [ ] Socket latency < 50ms

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if Mac available)
- [ ] Mobile browsers (responsive design)

## Load Testing (Optional)

```
1. Create 5 simultaneous rooms
2. Join all with different users
3. All start matches at same time
4. Submit code simultaneously
5. Verify all matches complete correctly
6. Check server logs for errors
```

## Success Criteria

✅ All test flows complete without errors
✅ Socket remains connected throughout
✅ Countdown displays correctly (3-2-1)
✅ Test results show properly
✅ Winner determination is accurate
✅ Results page displays correct information
✅ No console errors
✅ No memory leaks
✅ Pagination works smoothly
✅ Real-time updates work reliably

---

**Ready to Test!** 🚀

For issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Backend logs for server errors
4. MongoDB for data persistence

