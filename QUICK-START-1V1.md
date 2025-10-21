# 🎮 Quick Start Guide - 1v1 CodeDuel

## 🚀 Start in 3 Steps

### Step 1: Start Services
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend
npm start

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

### Step 2: Add Problems (First Time Only)
1. Open browser → `http://localhost:5173`
2. Login/Register
3. Go to **Problems** page
4. Click **"Upload Question"**
5. Add at least one problem

**Quick Problem Example:**
- **Title**: Two Sum
- **Description**: Find two numbers that add up to target
- **Difficulty**: Easy
- **Topic**: Array
- **Sample Test Case**: 
  - Input: `[2,7,11,15], 9`
  - Output: `[0,1]`
- **Hidden Test Case**: (same as sample for testing)

### Step 3: Start Dueling
1. Go to **Challenges** → **1v1 CodeDuel**
2. Click **"Create New Room"**
3. Search or filter for your problem
4. Select problem → **"Create Room"**
5. Copy Room ID → Share with opponent
6. Opponent: **"Join Room"** → Enter ID
7. **Code and Win!** 🏆

## 🎯 Features at a Glance

### Create Room Screen
- 🔍 **Search Bar** - Find problems by name
- 🎚️ **Filters** - Easy, Medium, Hard
- ✨ **Real-time** - Instant results
- 📋 **Fallback** - 5 sample problems if DB empty

### Lobby
- 🆔 **Room ID** - ABC-123 format
- ⏱️ **2-min Timer** - Auto-expires
- 👥 **Players** - Host 👑 vs Opponent ⚔️
- ⏳ **3-sec Countdown** - Match starts

### IDE
- 💻 **Split View** - Problem + Editor
- 🌐 **4 Languages** - JS, Python, C++, Java
- ▶️ **Run Code** - Test locally
- ✅ **Submit** - Evaluate all tests
- ⚡ **Real-time** - See opponent status
- 🏆 **Instant Win** - First to pass wins

## 🐛 Troubleshooting

### "No problems loaded"
→ Add problems via Problems page OR use sample problems (automatic)

### "Room not found"
→ Room expired (2-min limit) OR wrong ID format

### "Database not available"
→ Start MongoDB OR system will use sample problems

### Socket connection failed
→ Restart backend server → Refresh browser

## 📱 Testing with 2 Users

### Option 1: Same Computer
1. Browser 1: Login as User A
2. Browser 2 (Incognito): Login as User B
3. User A: Create room
4. User B: Join with room ID

### Option 2: Different Computers
1. Both: Login to app
2. User A: Create room → Share ID
3. User B: Join with ID
4. Both: Code and compete!

## 🎨 Sample Problems (Auto-loaded)

If database is empty, system provides:
1. **Two Sum** - Find pair that sums to target
2. **Reverse String** - Reverse a string
3. **Valid Parentheses** - Check balanced brackets
4. **Fibonacci Number** - Calculate nth Fibonacci
5. **Factorial** - Calculate factorial

All are **Easy** difficulty for quick testing.

## ⚡ Speed Testing

Want to test quickly? Use this flow:
```
1. Open app → Login
2. Challenges → 1v1
3. Create Room (select any problem)
4. Open Incognito → Login as different user
5. Join Room (paste ID)
6. Both write simple code
7. First submit wins!
```

## 🔥 Pro Tips

1. **Use Search** - Type "two" to find "Two Sum"
2. **Filter First** - Click "Easy" for beginner problems
3. **Copy Fast** - Click "Copy ID" button in lobby
4. **Submit Quick** - Don't run, just submit!
5. **Watch Timer** - 2 minutes in lobby, unlimited in match

## 📊 What to Check

✅ Search filters problems in real-time
✅ Difficulty buttons highlight when active
✅ Room ID copied to clipboard
✅ Timer counts down in lobby
✅ Countdown shows 3, 2, 1
✅ Both users redirect to IDE together
✅ Match timer counts up
✅ Submit button evaluates code
✅ Winner sees congratulations
✅ Loser sees encouragement

## 🎬 Complete Flow (30 seconds)

```
Login → Challenges → 1v1 → Create → Select Problem → 
Create Room → Copy ID → (Opponent Joins) → Countdown → 
IDE → Write Code → Submit → Win! → Results
```

## 🆘 Need Help?

Check these files:
- **Full Guide**: `1V1-CHALLENGE-SETUP.md`
- **Fix Summary**: `CHALLENGE-FIX-SUMMARY.md`
- **Code Docs**: `CODEDUEL-FEATURE.md`

## ✨ You're Ready!

Everything is set up and working. Just:
1. Start the services
2. Add a problem (or use samples)
3. Create and join a room
4. Code and compete!

**Happy Dueling! 🏆⚔️👑**

