# Code Editor Setup Guide

## 🎯 Two-Server Architecture

Your SkyPad-IDE has **TWO separate backend servers**:

### 1. Main API Server (Port 5000)
- **Purpose**: Authentication, Problems, Contests, Challenges
- **Requires**: JWT Token authentication
- **Start**: `cd backend && npm start`
- **Used by**: Login, Problem Solver, Contests, 1v1 Challenges

### 2. Code Editor Server (Port 3002)
- **Purpose**: Real-time code execution and collaboration
- **Requires**: NO authentication (open for all users)
- **Start**: `cd backend && npm run code-editor`
- **Used by**: Code Editor page only

## 🚀 Starting Both Servers

### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Main Server:**
```bash
cd backend
npm start
```

**Terminal 2 - Code Editor Server:**
```bash
cd backend
npm run code-editor
```

### Option 2: Both at Once
```bash
cd backend
npm run dev:all
```

## ✅ Verification

### Check Main Server (Port 5000)
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "environment": "development",
  "version": "0.2.0"
}
```

### Check Code Editor Server (Port 3002)
```bash
curl http://localhost:3002/health
```

Should return:
```json
{
  "status": "OK",
  "service": "Code Editor Backend",
  "timestamp": "..."
}
```

## 🔧 Frontend Configuration

### Local Development
The frontend automatically uses:
- Main API: `http://localhost:5000/api`
- Code Editor: `http://localhost:3002`

### Production (Vercel)
Set these environment variables in Vercel:

```
VITE_BACKEND_URL=https://skypad-ide.onrender.com/api
VITE_CODE_EDITOR_URL=https://skypad-code-editor.onrender.com
```

> ⚠️ **Note**: You'll need to deploy the code editor server separately on Render if you want it in production.

## 🐛 Troubleshooting

### Code Editor Shows "Disconnected"

**Cause**: Code editor server (port 3002) is not running

**Fix**:
```bash
cd backend
npm run code-editor
```

Then refresh your browser.

### Main App Not Working (Login, Problems, etc.)

**Cause**: Main server (port 5000) is not running

**Fix**:
```bash
cd backend
npm start
```

## 📝 What Changed

### Before (Broken)
```javascript
// CodeEditor.jsx was trying to connect to port 5000
const newSocket = io('http://localhost:5000');
// ❌ This server requires authentication!
```

### After (Fixed)
```javascript
// CodeEditor.jsx now connects to dedicated code editor server
const CODE_EDITOR_URL = import.meta.env.VITE_CODE_EDITOR_URL || 'http://localhost:3002';
const newSocket = io(CODE_EDITOR_URL);
// ✅ This server is open for all users!
```

## 🚀 Quick Commands

```bash
# Start main server
npm start

# Start code editor server
npm run code-editor

# Start both servers simultaneously
npm run dev:all

# Development mode with auto-restart (main server)
npm run dev

# Development mode with auto-restart (code editor)
npm run dev:code-editor
```

## 🎮 Testing

1. **Start both servers** (see above)
2. **Start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Open Code Editor**: http://localhost:5173/chat (or your code editor route)
4. **Check connection status**: Should show green "Connected"
5. **Try running code**: Click "Run Code" button

## 🌐 Production Deployment

### Deploy Main Server (Already Done)
✅ https://skypad-ide.onrender.com

### Deploy Code Editor Server (If Needed)
1. Create a new web service on Render
2. Set **Build Command**: `npm install`
3. Set **Start Command**: `npm run code-editor`
4. Set **Environment Variable**: `PORT=3002`
5. Deploy and get URL
6. Add to Vercel: `VITE_CODE_EDITOR_URL=https://your-code-editor-url.onrender.com`

## 📊 Current Status

✅ Main Server: Running on http://localhost:5000
✅ Code Editor Server: Running on http://localhost:3002
✅ Frontend: Updated to use correct ports

**Your code editor should now be CONNECTED!** 🎉

