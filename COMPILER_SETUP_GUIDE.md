# 🚀 Code Compiler & Execution Guide

## Overview

SkyPad-IDE has **three code execution environments** across different sections of the application, each optimized for its specific use case.

---

## 1️⃣ Code Editor - Standalone Compiler

**Location**: `/code-editor` route  
**Component**: `frontend/src/components/CodeEditor.jsx`  
**Backend**: `backend/src/codeEditorServer.js` (Port 4000)

### Features:
- ✅ **Multi-language support**: JavaScript, Python, C++, Java, C
- ✅ **Real-time execution** via WebSocket
- ✅ **Interactive I/O** - Send input during execution
- ✅ **Live output streaming**
- ✅ **Syntax highlighting** with Monaco Editor
- ✅ **Code templates** for each language
- ✅ **Download & Copy** code functionality
- ✅ **Customizable settings** (theme, font size)

### How to Use:

#### Start the Code Editor Server:
```bash
cd backend
npm run code-editor
# Or
node src/codeEditorServer.js
```

The server will start on **port 4000**.

#### Access the Editor:
1. Navigate to `http://localhost:5173/code-editor`
2. Select your language from the dropdown
3. Write your code
4. Click **Run** button
5. View real-time output

#### Interactive Input (Python/C++):
When your program asks for input:
1. Type input in the input box at the bottom
2. Press Enter or click Send
3. Your program continues execution

### Architecture:
```
Frontend (Code Editor)
    ↓ WebSocket (port 4000)
Code Editor Server
    ↓ Child Process
Execute Code (node/python/g++/gcc/javac)
    ↓ Stream Output
Back to Frontend
```

---

## 2️⃣ Problem Solver - Integrated Compiler

**Location**: `/solve/:problemId` route  
**Component**: `frontend/src/components/ProblemSolver.jsx`  
**Backend**: `backend/src/routes/problem.js` (Port 5000)

### Features:
- ✅ **Problem-specific execution**
- ✅ **Test case validation**
- ✅ **Multiple language support**
- ✅ **Run Code** - Test with sample inputs
- ✅ **Submit Solution** - Validate against all test cases
- ✅ **Tabbed interface** (Test Cases / Output)
- ✅ **Resizable panels** (Problem description / Code editor / Output)
- ✅ **Solution tracking** - Marks problems as solved

### How to Use:

#### From Problems Page:
1. Go to `/problems`
2. Click any problem card or "Solve" button
3. You'll be redirected to `/solve/:problemId`

#### From DSA Sheet:
1. Go to `/dsa-sheet`
2. Select a topic
3. Click any problem
4. Opens in ProblemSolver

#### In the Solver:
1. **Read the problem** in the left panel
2. **Write your solution** in the center panel
3. **Select language** from dropdown
4. **Run Code** to test with sample test cases
5. **Submit** when ready to validate all test cases

### Test Flow:
```
User clicks "Run Code"
    ↓
POST /api/problems/run
    ↓
Backend executes code with sample inputs
    ↓
Returns: pass/fail for each test case
    ↓
Display results in Output tab
```

### Submit Flow:
```
User clicks "Submit"
    ↓
POST /api/problems/submit
    ↓
Backend runs all test cases (including hidden)
    ↓
Returns: overall pass/fail + details
    ↓
Update user stats if successful
    ↓
Mark problem as solved
```

---

## 3️⃣ CodeDuel - Competitive Compiler

**Location**: `/challenge/:roomId/duel` route  
**Component**: `frontend/src/components/CodeDuelIDE.jsx`  
**Backend**: `backend/src/socketServer.js` (Port 5000)

### Features:
- ✅ **Real-time 1v1** code battles
- ✅ **Timed execution**
- ✅ **Opponent progress tracking**
- ✅ **Auto-submit** when time runs out
- ✅ **Live match updates**
- ✅ **Winner determination** based on speed + correctness

### How to Use:
1. Go to `/challenges/1v1`
2. Create or join a room
3. Wait in lobby for opponent
4. Match starts automatically
5. Solve the problem faster than opponent
6. Submit solution
7. Winner announced when both submit or time ends

---

## 🔧 Backend Execution Methods

### Method 1: WebSocket Execution (Code Editor)
**File**: `backend/src/codeEditorServer.js`  
**Port**: 4000

```javascript
// Client sends
socket.emit('run-code', { code, language });

// Server responds
socket.on('code-output', (data) => {
  // Real-time output streaming
});

socket.on('code-finished', (result) => {
  // Execution complete
});
```

**Advantages**:
- Real-time streaming
- Interactive I/O
- Process management
- Can send input during execution

### Method 2: HTTP API Execution (Problem Solver)
**File**: `backend/src/routes/problem.js`  
**Port**: 5000

```javascript
// Run with test cases
POST /api/problems/run
Body: { code, language, problemId }

// Submit solution
POST /api/problems/submit  
Body: { code, language, problemId }
```

**Advantages**:
- Test case validation
- Batch execution
- Result aggregation
- Progress tracking

---

## 📝 Supported Languages

| Language | Extension | Compiler/Interpreter | Version Command |
|----------|-----------|---------------------|----------------|
| JavaScript | `.js` | Node.js | `node --version` |
| Python | `.py` | Python | `python --version` |
| C++ | `.cpp` | g++ (GCC) | `g++ --version` |
| C | `.c` | gcc (GCC) | `gcc --version` |
| Java | `.java` | javac (JDK) | `javac -version` |

---

## 🛠️ Setup Instructions

### Prerequisites:
```bash
# Check if compilers are installed
node --version      # JavaScript
python --version    # Python  
g++ --version       # C++
gcc --version       # C
javac -version      # Java
```

### Install Missing Compilers:

#### Windows:
```bash
# Python
choco install python

# GCC (C/C++)
choco install mingw

# Java
choco install openjdk
```

#### macOS:
```bash
# Install Xcode Command Line Tools (includes gcc, g++)
xcode-select --install

# Python (via Homebrew)
brew install python

# Java
brew install openjdk
```

#### Linux:
```bash
# Update package list
sudo apt update

# Install compilers
sudo apt install python3 gcc g++ default-jdk

# Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 🚀 Start All Servers

### Terminal 1 - Main Backend (Port 5000):
```bash
cd backend
npm run dev
```

### Terminal 2 - Code Editor Server (Port 4000):
```bash
cd backend
npm run code-editor
```

### Terminal 3 - Frontend (Port 5173):
```bash
cd frontend
npm run dev
```

---

## 🎯 Usage Summary

| Section | Route | Compiler Type | Use Case |
|---------|-------|---------------|----------|
| **Code Editor** | `/code-editor` | WebSocket | Quick coding, practice, testing |
| **Problems** | `/problems` → `/solve/:id` | HTTP API | Solve coding problems with validation |
| **DSA Sheet** | `/dsa-sheet` → `/solve/:id` | HTTP API | Structured DSA practice |
| **CodeDuel** | `/challenge/:roomId/duel` | WebSocket | 1v1 competitive coding |

---

## 🐛 Troubleshooting

### Issue: "Not connected to backend"
**Solution**: Make sure code editor server is running on port 4000
```bash
cd backend
npm run code-editor
```

### Issue: "Compiler not found"
**Solution**: Install the required compiler for your language
```bash
# Example for C++
sudo apt install g++  # Linux
choco install mingw   # Windows
```

### Issue: "Code execution timeout"
**Solution**: 
- Check for infinite loops
- Reduce input size
- Optimize algorithm
- Default timeout is 10 seconds

### Issue: "Permission denied"
**Solution** (Linux/Mac):
```bash
# Make sure temp directory is writable
chmod +x backend/src/temp
```

---

## 📊 Execution Limits

| Resource | Limit | Configurable |
|----------|-------|--------------|
| Timeout | 10 seconds | Yes (in code) |
| Memory | System dependent | No |
| File Size | 1MB | Yes |
| Output Size | 1MB | Yes |

---

## 🔒 Security Notes

1. **Sandboxing**: Code runs in separate processes
2. **Timeout**: Automatic termination after 10s
3. **Temp Files**: Auto-deleted after execution
4. **Input Validation**: All inputs are sanitized
5. **Rate Limiting**: Prevent abuse (future enhancement)

---

## 🎨 Customization

### Adding New Language:

#### 1. Update `codeEditorServer.js`:
```javascript
const languageConfigs = {
  // ... existing languages
  go: { extension: '.go', command: 'go' }
};
```

#### 2. Update `CodeEditor.jsx`:
```javascript
const languageTemplates = {
  // ... existing templates
  go: '// Go code here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}'
};
```

#### 3. Update execution logic in `executeCodeInteractive()` function

---

## 📖 API Reference

### Run Code Endpoint
```http
POST /api/problems/run
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "console.log('Hello');",
  "language": "JavaScript",
  "problemId": "problem123"
}

Response:
{
  "success": true,
  "testResults": [
    {
      "input": "5",
      "expectedOutput": "5",
      "actualOutput": "5",
      "passed": true
    }
  ]
}
```

### Submit Solution Endpoint
```http
POST /api/problems/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "function solve(n) { return n; }",
  "language": "JavaScript",
  "problemId": "problem123"
}

Response:
{
  "success": true,
  "allTestsPassed": true,
  "passedTests": 5,
  "totalTests": 5,
  "points": 100
}
```

---

## ✅ Summary

Your SkyPad-IDE has **three fully-functional code execution environments**:

1. **Code Editor** - For quick practice and testing
2. **Problem Solver** - For structured problem-solving with validation
3. **CodeDuel** - For competitive 1v1 battles

All three use robust backend execution with proper error handling, timeouts, and security measures.

**Everything is already implemented and ready to use!** 🎉

---

## 🔗 Related Files

- `frontend/src/components/CodeEditor.jsx`
- `frontend/src/components/ProblemSolver.jsx`
- `frontend/src/components/CodeDuelIDE.jsx`
- `backend/src/codeEditorServer.js`
- `backend/src/routes/problem.js`
- `backend/src/socketServer.js`

---

**Need help?** Check the console logs for detailed error messages during execution.

