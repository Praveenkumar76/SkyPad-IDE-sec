# 1v1 CodeDuel Feature Documentation

## Overview
The 1v1 CodeDuel Mode is a real-time competitive coding feature that allows two users to compete head-to-head to solve a specific programming problem. The first user to pass all test cases wins the match.

## Feature Components

### Backend Components

#### 1. **ChallengeRoom Model** (`backend/src/models/ChallengeRoom.js`)
- Stores challenge room state
- Tracks participants (host and opponent)
- Manages room status: `waiting`, `starting`, `in_progress`, `finished`, `expired`
- Stores submissions and match results
- Generates unique room IDs (format: ABC-123)

#### 2. **Challenge Routes** (`backend/src/routes/challenges.js`)
- **POST `/api/challenges/rooms/create`** - Create a new challenge room
- **POST `/api/challenges/rooms/join`** - Join an existing room
- **GET `/api/challenges/rooms/:roomId`** - Get room details
- **POST `/api/challenges/rooms/:roomId/submit`** - Submit code for evaluation

#### 3. **Socket Server** (`backend/src/socketServer.js`)
- Real-time WebSocket communication using Socket.io
- Event handlers:
  - `join-room` - User joins a room
  - `leave-room` - User leaves a room
  - `opponent-joined` - Notifies host when opponent joins
  - `match-countdown` - 3-second countdown before match starts
  - `match-started` - Notifies both users to redirect to IDE
  - `room-expired` - Notifies host when 2-minute lobby timer expires
  - `match-finished` - Notifies both users when match ends

#### 4. **Server Integration** (`backend/src/server.js`)
- HTTP server upgraded to support WebSocket connections
- Socket.io initialized with CORS configuration
- Challenge routes mounted at `/api/challenges`

### Frontend Components

#### 1. **Challenges1v1 Component** (`frontend/src/components/Challenges1v1.jsx`)
- Main landing page for 1v1 challenges
- Two main actions:
  - **Create Room**: Select a problem and generate a room
  - **Join Room**: Enter a room ID to join
- "How It Works" section with step-by-step guide

#### 2. **ChallengeLobby Component** (`frontend/src/components/ChallengeLobby.jsx`)
- Waiting room before match starts
- Features:
  - Displays room ID with copy functionality
  - Shows problem details
  - Lists participants (host and opponent)
  - 2-minute countdown timer (only for waiting rooms)
  - 3-second countdown before match starts
  - Real-time updates via WebSocket

#### 3. **CodeDuelIDE Component** (`frontend/src/components/CodeDuelIDE.jsx`)
- Split-screen IDE interface
- Left panel: Problem description, examples, constraints
- Right panel: Code editor with:
  - Language selector (JavaScript, Python, C++, Java)
  - Monaco Editor for code editing
  - Run Code button (test with examples)
  - Submit button (evaluate against all test cases)
  - Output console
- Match timer showing elapsed time
- Real-time opponent submission notifications

#### 4. **ChallengeResults Component** (`frontend/src/components/ChallengeResults.jsx`)
- Post-match results page
- Shows:
  - Winner/Loser banner
  - Match summary (problem, difficulty, duration)
  - Participant information
  - Rewards (for winners)
  - Encouragement phrases (for losers)
- Actions:
  - Back to Challenges
  - New Challenge

### Utility Files

#### 1. **Socket Utility** (`frontend/src/utils/socket.js`)
- Socket.io client initialization
- Connection management
- Cleanup functions

#### 2. **Challenge API** (`frontend/src/utils/challengeAPI.js`)
- API wrapper for challenge endpoints
- Functions for creating, joining, and submitting

## User Flow

### Phase 1: Room Creation (Host)
1. User navigates to `/challenges/1v1`
2. Clicks "Create Room"
3. Selects a problem from the list
4. System generates unique Room ID
5. User is redirected to `/challenge/{roomId}/lobby`
6. 2-minute lobby timer starts
7. Host waits for opponent

### Phase 2: Room Joining (Opponent)
1. Opponent receives Room ID from host
2. Navigates to `/challenges/1v1`
3. Clicks "Join Room"
4. Enters Room ID
5. System validates room (must be waiting and not expired)
6. Opponent is redirected to `/challenge/{roomId}/lobby`
7. Both users see "Opponent joined" notification

### Phase 3: Match Start
1. Lobby timer is cleared
2. 3-second countdown displayed to both users
3. Room status changes to `in_progress`
4. Both users automatically redirected to `/challenge/{roomId}/duel`
5. Match timer starts

### Phase 4: The Duel
1. Both users see the same problem
2. Users write code in their chosen language
3. Users can:
   - Run code (test with examples)
   - Submit code (evaluate against all test cases)
4. First user to get all test cases correct wins
5. Match ends immediately when someone wins

### Phase 5: Results
1. Winner sees "Congratulations" modal
2. Loser sees "Better Luck Next Time" modal
3. Both redirected to `/challenge/{roomId}/results`
4. Results show:
   - Winner
   - Match duration
   - Rewards (for winner)
   - Encouragement (for loser)

## Technical Implementation

### Real-Time Communication
- Socket.io for bidirectional communication
- Server-authoritative timers for synchronization
- Event-driven architecture

### Security
- JWT authentication for all API endpoints
- JWT authentication for WebSocket connections
- Input validation on all requests
- Atomic winner selection (prevents race conditions)

### Code Execution
- Currently uses mock execution (placeholder)
- TODO: Implement sandboxed execution using Docker
- TODO: Integrate with Judge0 or similar service

### Database Schema
```javascript
{
  roomId: String (unique, indexed),
  problemId: String,
  hostUserId: ObjectId,
  opponentUserId: ObjectId,
  status: Enum ['waiting', 'starting', 'in_progress', 'finished', 'expired'],
  winnerId: ObjectId,
  lobbyExpiresAt: Date,
  startedAt: Date,
  finishedAt: Date,
  submissions: Array,
  matchDuration: Number
}
```

## Routes

### Backend Routes
- `POST /api/challenges/rooms/create` - Create room
- `POST /api/challenges/rooms/join` - Join room
- `GET /api/challenges/rooms/:roomId` - Get room details
- `POST /api/challenges/rooms/:roomId/submit` - Submit code

### Frontend Routes
- `/challenges/1v1` - Main challenges page
- `/challenge/:roomId/lobby` - Lobby waiting room
- `/challenge/:roomId/duel` - IDE page
- `/challenge/:roomId/results` - Results page

## Installation & Setup

### Backend
```bash
cd backend
npm install socket.io uuid
npm start
```

### Frontend
```bash
cd frontend
npm install socket.io-client @monaco-editor/react
npm run dev
```

## Testing the Feature

1. Open two browser windows (or use incognito mode)
2. Login with different accounts in each window
3. Window 1: Go to `/challenges/1v1` → Create Room → Select problem
4. Window 2: Go to `/challenges/1v1` → Join Room → Enter Room ID
5. Both windows will show countdown and redirect to IDE
6. Write code and submit
7. First to pass all tests wins
8. Both see results page

## Future Enhancements

### High Priority
- [ ] Implement real sandboxed code execution
- [ ] Add rate limiting on submissions
- [ ] Implement match history tracking
- [ ] Add rating/ELO system

### Medium Priority
- [ ] Add spectator mode
- [ ] Implement rematch functionality
- [ ] Add chat between participants
- [ ] Show opponent's code after match ends

### Low Priority
- [ ] Add tournament mode (multiple rounds)
- [ ] Implement leaderboards
- [ ] Add achievements and badges
- [ ] Create replay system

## Known Limitations

1. **Code Execution**: Currently uses mock execution. Does not actually run user code.
2. **No Reconnection**: If a user disconnects, they cannot rejoin the match.
3. **No Persistence**: Match data is not fully archived for history.
4. **No Rate Limiting**: Users can spam submissions.
5. **Single Language**: Problem test cases assume single language output format.

## Configuration

### Environment Variables

**Backend** (`.env`):
```env
MONGODB_URI=mongodb://localhost:27017/skypad-ide
JWT_SECRET=your-secret-key
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://localhost:5000
```

**Frontend** (`.env`):
```env
VITE_BACKEND_URL=http://localhost:5000
```

## Troubleshooting

### Socket Connection Issues
- Ensure CORS is properly configured
- Check that JWT token is valid
- Verify Socket.io server is running

### Room Expiration
- Rooms expire after 2 minutes if opponent doesn't join
- Create a new room if expired

### Match Not Starting
- Ensure both users are connected via WebSocket
- Check browser console for errors
- Verify both users have valid authentication

## API Examples

### Create Room
```javascript
POST /api/challenges/rooms/create
Headers: { Authorization: "Bearer {token}" }
Body: { problemId: "two-sum" }

Response: {
  roomId: "ABC-123",
  problemId: "two-sum",
  status: "waiting",
  expiresAt: "2025-01-01T00:02:00Z"
}
```

### Join Room
```javascript
POST /api/challenges/rooms/join
Headers: { Authorization: "Bearer {token}" }
Body: { roomId: "ABC-123" }

Response: {
  roomId: "ABC-123",
  problemId: "two-sum",
  problem: { ... },
  status: "starting"
}
```

### Submit Code
```javascript
POST /api/challenges/rooms/ABC-123/submit
Headers: { Authorization: "Bearer {token}" }
Body: { 
  code: "function solution() { ... }",
  language: "javascript"
}

Response: {
  result: "accepted",
  testResults: [...],
  isWinner: true,
  matchFinished: true
}
```

## Credits

Developed as part of the SkyPad-IDE project.
Feature implements real-time competitive coding with WebSocket technology.

