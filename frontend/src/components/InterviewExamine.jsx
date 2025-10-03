import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import DashboardNavbar from './DashboardNavbar';
import { 
  MdCode, 
  MdPlayArrow, 
  MdShare, 
  MdCopyAll,
  MdSend,
  MdPerson,
  MdTimer,
  MdCheckCircle,
  MdError,
  MdArrowBack
} from 'react-icons/md';

const InterviewExamine = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  // Prevent echo loop when applying remote updates
  const suppressNextEmitRef = useRef(false);
  // Debounce timer for code-change emits
  const debounceTimerRef = useRef(null);

  const SOCKET_URL = (
    import.meta?.env?.VITE_SOCKET_URL ||
    import.meta?.env?.VITE_BACKEND_URL ||
    'http://localhost:5000'
  );

  const languages = [
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'Python', label: 'Python' },
    { value: 'Java', label: 'Java' },
    { value: 'C++', label: 'C++' },
    { value: 'C', label: 'C' }
  ];

  useEffect(() => {
    if (sessionId) {
      loadSession();
    } else {
      createNewSession();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = () => {
    const newSessionId = generateSessionId();
    const newSession = {
      id: newSessionId,
      host: localStorage.getItem('userId'),
      participants: [{
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName') || 'Host',
        email: localStorage.getItem('userEmail') || '',
        joinedAt: new Date().toISOString()
      }],
      code: '',
      language: 'JavaScript',
      output: '',
      messages: [],
      createdAt: new Date().toISOString()
    };
    
    setSession(newSession);
    setIsHost(true);
    setParticipants(newSession.participants);
    setShareLink(`${window.location.origin}/interv-examine/${newSessionId}`);
    localStorage.setItem(`interviewSession_${newSessionId}`, JSON.stringify(newSession));
    
    // Navigate to the new session
    navigate(`/interv-examine/${newSessionId}`, { replace: true });
  };

  const loadSession = () => {
    const savedSession = localStorage.getItem(`interviewSession_${sessionId}`);
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      setSession(sessionData);
      setCode(sessionData.code || '');
      setSelectedLanguage(sessionData.language || 'JavaScript');
      setOutput(sessionData.output || '');
      setParticipants(sessionData.participants || []);
      setMessages(sessionData.messages || []);
      setIsHost(sessionData.host === localStorage.getItem('userId'));
      setShareLink(`${window.location.origin}/interv-examine/${sessionId}`);
    } else {
      // Join existing session
      joinSession();
    }
  };

  // Socket.IO setup for collaborative editing and chat
  useEffect(() => {
    if (!sessionId) return;

    const s = io(`${SOCKET_URL}/interview`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      path: '/socket.io'
    });

    s.on('connect', () => {
      setConnected(true);
      s.emit('join-session', {
        sessionId,
        user: {
          id: localStorage.getItem('userId'),
          name: localStorage.getItem('userName') || 'User'
        }
      });

      // Share current code to newly joined peers to bootstrap their editor
      // Emit only if we have something meaningful
      if (code && code.length > 0) {
        s.emit('code-change', {
          sessionId,
          code,
          language: selectedLanguage
        });
      }
    });

    s.on('disconnect', () => setConnected(false));

    s.on('code-update', (payload) => {
      if (typeof payload?.code === 'string') {
        // Mark that the next local change originates from remote to avoid re-emitting
        suppressNextEmitRef.current = true;
        setCode(payload.code);
        if (payload.language) setSelectedLanguage(payload.language);
      }
    });

    s.on('run-result', (result) => {
      setIsRunning(false);
      setOutput(result?.success ? String(result.output || '') : `Error: ${result?.output || 'Unknown'}`);
    });

    s.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on('chat-history', (history) => {
      if (Array.isArray(history)) {
        setMessages(history);
      }
    });

    s.on('participants', (list) => {
      if (Array.isArray(list)) setParticipants(list);
    });

    setSocket(s);
    return () => { s.close(); };
  }, [sessionId]);

  // Emit code changes in real-time with a small debounce
  useEffect(() => {
    if (!socket || !connected || !sessionId) return;

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    debounceTimerRef.current = setTimeout(() => {
      // If this update came from a remote 'code-update', do not echo back
      if (suppressNextEmitRef.current) {
        suppressNextEmitRef.current = false;
        return;
      }
      socket.emit('code-change', {
        sessionId,
        code,
        language: selectedLanguage
      });
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [code, selectedLanguage, socket, connected, sessionId]);

  const joinSession = () => {
    const newParticipant = {
      id: localStorage.getItem('userId'),
      name: localStorage.getItem('userName') || 'Participant',
      email: localStorage.getItem('userEmail') || '',
      joinedAt: new Date().toISOString()
    };

    const updatedParticipants = [...participants, newParticipant];
    setParticipants(updatedParticipants);
    setIsHost(false);

    const updatedSession = {
      ...session,
      participants: updatedParticipants
    };
    setSession(updatedSession);
    localStorage.setItem(`interviewSession_${sessionId}`, JSON.stringify(updatedSession));
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const runCode = async () => {
    if (!code.trim()) return;
    if (socket && connected && sessionId) {
      setIsRunning(true);
      socket.emit('run-code', { sessionId, code, language: selectedLanguage.toLowerCase() });
      return;
    }
    
    setIsRunning(true);
    try {
      // Create a simple code execution based on language
      let executionOutput = '';
      
      if (selectedLanguage === 'JavaScript') {
        // Simple JavaScript execution simulation
        try {
          // Extract console.log statements and evaluate basic expressions
          const lines = code.split('\n');
          const results = [];
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('console.log(')) {
              // Extract the content inside console.log
              const match = trimmedLine.match(/console\.log\((.+)\)/);
              if (match) {
                try {
                  // Simple evaluation for basic expressions
                  const expression = match[1];
                  let result;
                  if (expression.includes('"') || expression.includes("'")) {
                    // String literal
                    result = expression.replace(/['"]/g, '');
                  } else if (expression.includes('+') || expression.includes('-') || expression.includes('*') || expression.includes('/')) {
                    // Math expression
                    result = eval(expression);
                  } else if (expression.includes('=')) {
                    // Variable assignment
                    const [varName, value] = expression.split('=').map(s => s.trim());
                    result = `${varName} = ${value}`;
                  } else {
                    result = eval(expression);
                  }
                  results.push(result);
                } catch (e) {
                  results.push(`Error: ${e.message}`);
                }
              }
            } else if (trimmedLine && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('/*')) {
              // Try to evaluate other statements
              try {
                const result = eval(trimmedLine);
                if (result !== undefined) {
                  results.push(result);
                }
              } catch (e) {
                // Ignore evaluation errors for complex statements
              }
            }
          }
          
          executionOutput = results.length > 0 ? results.join('\n') : 'No output generated';
        } catch (error) {
          executionOutput = `Error: ${error.message}`;
        }
      } else if (selectedLanguage === 'Python') {
        // Python simulation
        const lines = code.split('\n');
        const results = [];
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('print(')) {
            const match = trimmedLine.match(/print\((.+)\)/);
            if (match) {
              const content = match[1].replace(/['"]/g, '');
              results.push(content);
            }
          }
        }
        
        executionOutput = results.length > 0 ? results.join('\n') : 'No output generated';
      } else {
        // For other languages, show a basic simulation
        executionOutput = `Code executed in ${selectedLanguage}\nOutput: ${code.substring(0, 100)}...`;
      }
      
      setOutput(executionOutput);
      
      // Update session
      const updatedSession = {
        ...session,
        code,
        language: selectedLanguage,
        output: executionOutput
      };
      setSession(updatedSession);
      localStorage.setItem(`interviewSession_${sessionId}`, JSON.stringify(updatedSession));
      
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message = {
      id: Date.now(),
      sender: localStorage.getItem('userName') || 'Anonymous',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    // Do not locally append to avoid duplicates; rely on server echo
    setNewMessage('');
    if (socket && connected && sessionId) {
      socket.emit('chat-message', { sessionId, message });
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                title="Back to Dashboard"
              >
                <MdArrowBack className="w-6 h-6 text-white" />
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  Interv-Examine
                </h1>
                <p className="text-gray-300 mt-2">Collaborative coding session</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={copyShareLink}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <MdShare className="w-4 h-4" />
                <span>Share Link</span>
              </button>
              <DashboardNavbar />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Code Editor */}
            <div className="lg:col-span-3 space-y-4">
              {/* Editor Header */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value} className="bg-gray-800">
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={runCode}
                      disabled={isRunning || !code.trim()}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                        isRunning || !code.trim()
                          ? 'bg-white/30 cursor-not-allowed'
                          : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 hover:scale-105'
                      }`}
                    >
                      <MdPlayArrow className="w-4 h-4" />
                      <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Textarea */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex-1">
                <textarea
                  ref={textAreaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault(); // Prevent default tab behavior (focus change)

                      const start = e.target.selectionStart;
                      const end = e.target.selectionEnd;

                      // Create the new value with the tab spaces
                      const updated = code.substring(0, start) + '  ' + code.substring(end);
                      setCode(updated);

                      // Schedule the cursor position update
                      // This ensures it runs AFTER React has updated the DOM
                      setTimeout(() => {
                        if (textAreaRef.current) {
                          const newCursorPosition = start + 2;
                          textAreaRef.current.selectionStart = newCursorPosition;
                          textAreaRef.current.selectionEnd = newCursorPosition;
                        }
                      }, 0);
                    }
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Write your code here..."
                  className="w-full h-64 bg-black/20 border border-white/20 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-violet-400"
                />
              </div>

              {/* Output */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h4 className="text-white font-medium mb-2">Output</h4>
                <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-black/20 p-3 rounded border border-white/10 min-h-[100px]">
                  {output || 'No output yet...'}
                </pre>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Participants */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MdPerson className="w-5 h-5 mr-2" />
                  Participants ({participants.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium truncate">{participant.name}</div>
                        <div className="text-gray-400 text-xs truncate">{participant.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex-1 min-h-0">
                <h3 className="text-lg font-semibold text-white mb-4">Chat</h3>
                <div className="h-48 overflow-y-auto space-y-2 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-violet-300 font-medium text-sm">{message.sender}</span>
                          <span className="text-gray-400 text-xs">{formatTime(message.timestamp)}</span>
                        </div>
                        <p className="text-white text-sm break-words">{message.content}</p>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      newMessage.trim() 
                        ? 'bg-violet-500 hover:bg-violet-600 text-white' 
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <MdSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewExamine;
