# CodeArena Contest Platform - Implementation Guide

## ✅ Completed Backend Implementation

### Models Created:
1. ✅ **Contest Model** (`backend/src/models/Contest.js`)
2. ✅ **ContestRegistration Model** (`backend/src/models/ContestRegistration.js`)
3. ✅ **ContestSubmission Model** (`backend/src/models/ContestSubmission.js`)

### API Routes Created:
- ✅ `POST /api/contests/create` - Create contest (Creator only)
- ✅ `GET /api/contests/list` - List all public contests
- ✅ `GET /api/contests/:contestId` - Get contest details
- ✅ `POST /api/contests/:contestId/register` - Register for contest
- ✅ `GET /api/contests/:contestId/registration` - Check registration status
- ✅ `GET /api/contests/:contestId/leaderboard` - Get leaderboard
- ✅ `POST /api/contests/:contestId/submit` - Submit solution
- ✅ `GET /api/contests/:contestId/my-submissions` - Get user submissions
- ✅ `GET /api/contests/:contestId/problems/:problemId` - Get problem details

### WebSocket Features:
- ✅ Real-time leaderboard updates via Socket.io
- ✅ Contest room management (join-contest, leave-contest events)
- ✅ Automatic leaderboard broadcast on score changes

## 📋 Frontend Components to Implement

### 1. Contest API Utility (`frontend/src/utils/contestAPI.js`)

```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const contestAPI = {
  // Create contest
  createContest: async (contestData) => {
    const response = await fetch(`${API_BASE_URL}/contests/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contestData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create contest');
    }
    return response.json();
  },

  // List contests
  listContests: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/contests/list?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch contests');
    return response.json();
  },

  // Get contest details
  getContest: async (contestId) => {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Contest not found');
    return response.json();
  },

  // Register for contest
  register: async (contestId) => {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register');
    }
    return response.json();
  },

  // Check registration
  checkRegistration: async (contestId) => {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}/registration`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to check registration');
    return response.json();
  },

  // Get leaderboard
  getLeaderboard: async (contestId) => {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}/leaderboard`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  // Submit solution
  submitSolution: async (contestId, problemId, code, language) => {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ problemId, code, language }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit');
    }
    return response.json();
  },

  // Get my submissions
  getMySubmissions: async (contestId) => {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}/my-submissions`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },

  // Get problem details
  getProblem: async (contestId, problemId) => {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}/problems/${problemId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Problem not found');
    return response.json();
  }
};
```

### 2. Contest Creator Component (`frontend/src/components/ContestCreator.jsx`)

**Features:**
- Form with fields: title, description (rich text), start/end time pickers
- Problem selection UI with search
- Points assignment for each problem
- Visibility toggle (public/private)
- Max participants setting
- Preview of selected problems
- Create button

**Key State:**
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  visibility: 'public',
  problems: [], // [{ problemId, points }]
  maxParticipants: null
});
```

**UI Flow:**
1. Show form
2. "Add Problem" button opens modal
3. Modal shows problem list with search/filter
4. Select problem → Set points → Add to list
5. Submit form → Create contest → Show shareable link

### 3. Contest List Component (`frontend/src/components/ContestList.jsx`)

**Features:**
- Grid/list of contests
- Filters: upcoming, active, ended
- Each card shows:
  - Title
  - Start/end time
  - Status badge
  - Participant count
  - Creator name
- Click to navigate to contest page

### 4. Contest Landing Page (`frontend/src/components/ContestLanding.jsx`)

**URL:** `/contest/:contestId`

**Features Based on State:**

**A) Pre-Contest (Upcoming):**
```jsx
<div className="contest-landing pre-contest">
  <h1>{contest.title}</h1>
  <div className="contest-description">{contest.description}</div>
  
  <div className="contest-timeline">
    <p>Starts: {formatDate(contest.startTime)}</p>
    <p>Ends: {formatDate(contest.endTime)}</p>
  </div>
  
  <div className="countdown-timer">
    <h2>Contest Starts In</h2>
    <div className="timer-display">
      <span>{days}d</span>
      <span>{hours}h</span>
      <span>{minutes}m</span>
      <span>{seconds}s</span>
    </div>
  </div>
  
  {!registered ? (
    <button onClick={handleRegister}>Register</button>
  ) : (
    <div className="registered-badge">✓ Registered</div>
  )}
  
  <div className="contest-info">
    <h3>Problems ({contest.problems.length})</h3>
    <ul>
      {contest.problems.map(p => (
        <li key={p.problemId}>
          {p.title} - {p.points} points
        </li>
      ))}
    </ul>
  </div>
</div>
```

**B) Active Contest:**
```jsx
// Redirect to Contest Arena (active contest page)
useEffect(() => {
  if (contest.state === 'active') {
    navigate(`/contest/${contestId}/arena`);
  }
}, [contest.state]);
```

**C) Ended Contest:**
```jsx
<div className="contest-landing ended">
  <h1>{contest.title}</h1>
  <div className="ended-badge">Contest Ended</div>
  
  <div className="final-leaderboard">
    <h2>Final Standings</h2>
    {/* Show leaderboard */}
  </div>
  
  <div className="review-section">
    <p>You can review problems but cannot submit solutions</p>
    <button onClick={() => navigate(`/contest/${contestId}/arena`)}>
      View Problems
    </button>
  </div>
</div>
```

### 5. Contest Arena Component (`frontend/src/components/ContestArena.jsx`)

**URL:** `/contest/:contestId/arena`

**Features:**
- Persistent header with contest timer
- Three tabs: Problems, My Submissions, Leaderboard
- WebSocket connection for real-time updates

**Header:**
```jsx
<div className="contest-header">
  <div className="contest-title">{contest.title}</div>
  <div className="contest-timer">
    {contest.state === 'active' ? (
      <div className="timer">
        Time Remaining: {formatTimer(timeRemaining)}
      </div>
    ) : (
      <div className="ended">Contest Ended</div>
    )}
  </div>
  <div className="user-stats">
    Score: {userScore} | Solved: {problemsSolved}/{totalProblems}
  </div>
</div>
```

**Problems Tab:**
```jsx
<div className="problems-tab">
  <div className="problems-list">
    {contest.problems.map(problem => (
      <div 
        key={problem.problemId}
        className={`problem-card ${solved.includes(problem.problemId) ? 'solved' : ''}`}
        onClick={() => navigate(`/contest/${contestId}/solve/${problem.problemId}`)}
      >
        <div className="problem-header">
          <h3>{problem.title}</h3>
          {solved.includes(problem.problemId) && <span className="checkmark">✓</span>}
        </div>
        <div className="problem-meta">
          <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
          <span className="points">{problem.points} points</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

**My Submissions Tab:**
```jsx
<div className="submissions-tab">
  <table className="submissions-table">
    <thead>
      <tr>
        <th>Problem</th>
        <th>Language</th>
        <th>Status</th>
        <th>Points</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      {submissions.map(sub => (
        <tr key={sub.submissionId}>
          <td>{sub.problemTitle}</td>
          <td>{sub.language}</td>
          <td className={`status ${sub.status}`}>{sub.status}</td>
          <td>{sub.points}</td>
          <td>{formatTime(sub.timestamp)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Leaderboard Tab:**
```jsx
<div className="leaderboard-tab">
  <div className="leaderboard-header">
    <h2>Live Leaderboard</h2>
    <span className="auto-refresh">● Auto-refreshing</span>
  </div>
  
  <table className="leaderboard-table">
    <thead>
      <tr>
        <th>Rank</th>
        <th>Username</th>
        <th>Score</th>
        <th>Problems Solved</th>
      </tr>
    </thead>
    <tbody>
      {leaderboard.map(entry => (
        <tr key={entry.username} className={entry.username === currentUser ? 'current-user' : ''}>
          <td className="rank">
            {entry.rank === 1 && '🥇'}
            {entry.rank === 2 && '🥈'}
            {entry.rank === 3 && '🥉'}
            {entry.rank > 3 && entry.rank}
          </td>
          <td>{entry.username}</td>
          <td className="score">{entry.score}</td>
          <td>{entry.problemsSolved}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**WebSocket Integration:**
```javascript
useEffect(() => {
  const socket = getSocket();
  
  // Join contest room
  socket.emit('join-contest', { contestId });
  
  // Listen for leaderboard updates
  socket.on('leaderboard-update', (data) => {
    setLeaderboard(data.leaderboard);
  });
  
  return () => {
    socket.emit('leave-contest');
    socket.off('leaderboard-update');
  };
}, [contestId]);
```

### 6. Contest IDE Component (`frontend/src/components/ContestIDE.jsx`)

**URL:** `/contest/:contestId/solve/:problemId`

**Features:**
- Reuse CodeDuelIDE structure
- Left: Problem description
- Right: Editor + submission
- Submit button calls `contestAPI.submitSolution()`
- Show result + updated score
- Back button to arena

**Key Differences from 1v1:**
- No opponent tracking
- Submit updates contest score
- Disable submit if contest ended
- Show points earned on successful submission

### 7. Routes to Add (`frontend/src/App.jsx`)

```javascript
import ContestCreator from './components/ContestCreator';
import ContestList from './components/ContestList';
import ContestLanding from './components/ContestLanding';
import ContestArena from './components/ContestArena';
import ContestIDE from './components/ContestIDE';

// Add these routes:
<Route path="/contests" element={<ContestList />} />
<Route path="/contests/create" element={<ContestCreator />} />
<Route path="/contest/:contestId" element={<ContestLanding />} />
<Route path="/contest/:contestId/arena" element={<ContestArena />} />
<Route path="/contest/:contestId/solve/:problemId" element={<ContestIDE />} />
```

## 🎨 Styling Guidelines

### Color Scheme:
- **Active Contest**: Green gradient (#11998e to #38ef7d)
- **Upcoming Contest**: Blue gradient (#667eea to #764ba2)
- **Ended Contest**: Gray gradient (#757F9A to #D7DDE8)
- **Leaderboard Ranks**: Gold (#FFD700), Silver (#C0C0C0), Bronze (#CD7F32)

### Key CSS Classes:
```css
.contest-timer {
  font-size: 1.5rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.countdown-timer {
  text-align: center;
  padding: 3rem;
}

.timer-display span {
  font-size: 3rem;
  margin: 0 1rem;
  padding: 1rem 2rem;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table tr.current-user {
  background: #fff3e0;
  font-weight: bold;
}

.problem-card.solved {
  border-left: 4px solid #4caf50;
  background: #f1f8f4;
}

.status.accepted {
  color: #4caf50;
  font-weight: bold;
}

.status.wrong_answer {
  color: #f44336;
}
```

## 🔧 Testing the Feature

### 1. Create a Contest:
```bash
# Login as admin/creator
# Navigate to /contests/create
# Fill form:
  - Title: "Weekly Coding Challenge #1"
  - Description: "Test your skills!"
  - Start: Now + 2 minutes
  - End: Now + 1 hour
  - Add 2-3 problems with points
# Click Create
# Copy the shareable link
```

### 2. Register as Participant:
```bash
# Login with different account
# Visit shareable link
# Click Register
# See countdown timer
# Wait for contest to start
```

### 3. During Contest:
```bash
# Auto-redirect to arena when contest starts
# Click on a problem
# Write solution
# Submit
# See score update
# Check leaderboard (should update in real-time)
# Try another problem
```

### 4. After Contest:
```bash
# Visit contest link after end time
# See final leaderboard
# Can view problems but not submit
```

## 📊 Database Schema Summary

### Contest:
- contestId, title, description
- startTime, endTime
- visibility, shareableLink
- creatorId
- problems: [{ problemId, points, order }]
- stats: { totalParticipants, totalSubmissions }
- status: draft|scheduled|active|ended

### ContestRegistration:
- contestId, userId
- score, problemsSolved
- submissionsCount, rank

### ContestSubmission:
- contestId, problemId, userId
- code, language, status
- points, timestamp

## 🚀 Next Steps

1. **Implement Frontend Components** (5-6 components)
2. **Add Navigation Links** (Dashboard → Contests)
3. **Style Components** (CSS files)
4. **Test Complete Flow**
5. **Add Contest History** (User profile)
6. **Implement Admin Panel** (Manage contests)

## 📝 Additional Features to Consider

- **Email Notifications**: Remind users when contest starts
- **Practice Mode**: Solve past contest problems
- **Editorial**: Show solutions after contest ends
- **Plagiarism Detection**: Check for copied code
- **Contest Series**: Link multiple contests
- **Team Contests**: Allow team participation
- **Virtual Participation**: Join ended contests
- **Contest Analytics**: Detailed statistics

---

The backend is **100% complete and ready**. The frontend components follow the same patterns as the 1v1 CodeDuel feature, so they can be implemented similarly with the specifications above.

