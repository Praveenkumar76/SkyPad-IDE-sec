# SkyPad Code Editor Setup Guide

## Overview
The SkyPad Code Editor is now integrated into your dashboard with a beautiful violet/purple theme that matches your existing design. It includes real-time collaboration, multiple language support, and a modern interface.

## Features
- 🎨 **Dashboard Theme Integration** - Matches your violet/purple gradient theme
- 🔧 **Multiple Language Support** - JavaScript, Python, C++, Java, C
- ⚡ **Real-time Collaboration** - WebSocket-based code sharing
- 🚀 **Code Execution** - Run code directly in the browser
- 📱 **Responsive Design** - Works on all device sizes
- ⚙️ **Customizable Settings** - Font size, themes, and more

## Setup Instructions

### 1. Install Dependencies

#### Frontend (React)
```bash
cd frontend
npm install @monaco-editor/react socket.io-client
```

#### Backend (Node.js)
```bash
cd backend
npm install socket.io
```

### 2. Start the Servers

#### Start Code Editor Backend
```bash
cd backend
npm run dev:code-editor
```
This will start the code editor server on port 3002.

#### Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access the Code Editor

1. Navigate to your dashboard at `/dashboard`
2. Click the "Open Code Editor" button in the Level Up section
3. Or directly visit `/code-editor`

## File Structure

```
frontend/src/components/
├── CodeEditor.jsx          # Main code editor component
├── Dashboard.jsx           # Updated with code editor button

backend/src/
├── codeEditorServer.js     # WebSocket server for code editor
├── server.js               # Main backend server

frontend/src/App.jsx        # Updated with code editor route
```

## Configuration

### Backend Port
The code editor server runs on port 3002 by default. You can change this by setting the `CODE_EDITOR_PORT` environment variable.

### Supported Languages
- JavaScript (Node.js)
- Python (requires Python installation)
- C++ (requires g++ compiler)
- Java (requires JDK)
- C (requires gcc compiler)

### CORS Settings
The backend is configured to accept connections from:
- `http://localhost:3000` (Next.js default)
- `http://localhost:5173` (Vite default)

## Usage

### Basic Code Editing
1. Select your programming language from the dropdown
2. Write or paste your code in the editor
3. Click "Run Code" to execute
4. View output in the right panel

### Collaboration Features
- Code changes are automatically shared with other connected users
- Real-time updates across all connected clients
- Language changes are synchronized

### Settings
- **Font Size**: Adjustable from 12px to 24px
- **Theme**: Choose between Dark, Light, and High Contrast
- **Language**: Switch between supported programming languages

## Troubleshooting

### Common Issues

1. **Code Editor Not Loading**
   - Ensure both frontend and backend are running
   - Check browser console for errors
   - Verify WebSocket connection on port 3002

2. **Code Execution Fails**
   - Ensure required compilers are installed (gcc, g++, javac)
   - Check if Python is available in PATH
   - Verify backend server is running

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check if all CSS classes are being applied

### Performance Tips
- Use the settings panel to adjust font size for better readability
- Enable/disable minimap based on your preference
- Use the word wrap feature for long lines of code

## Next Steps

### Enhanced Features to Add
1. **File Management**: Save/load code files
2. **Project Templates**: Pre-built project structures
3. **Git Integration**: Version control within the editor
4. **Debugging Tools**: Breakpoints and step-through execution
5. **Code Formatting**: Auto-format on save
6. **IntelliSense**: Enhanced code completion

### Backend Enhancements
1. **User Authentication**: Secure code execution
2. **Code Storage**: Persistent code saving
3. **Execution History**: Track code runs and results
4. **Resource Limits**: Prevent abuse of execution resources

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all dependencies are installed
3. Ensure both servers are running
4. Check network connectivity and firewall settings

---

**Happy Coding! 🚀**
