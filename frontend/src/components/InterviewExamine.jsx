import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import DashboardNavbar from './DashboardNavbar';
import BackButton from './BackButton';
import { 
  MdCode, 
  MdPlayArrow, 
  MdShare, 
  MdCopyAll,
  MdSend,
  MdPerson,
  MdTimer,
  MdCheckCircle,
  MdError
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
  const socketRef = useRef(null);
  const editorRef = useRef(null);

  // Configure socket URL (Render/production) with fallback to local
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Always keep shareLink synced with current route/session id
  useEffect(() => {
    const id = sessionId || session?.id;
    if (id && typeof window !== 'undefined') {
      setShareLink(`${window.location.origin}/interv-examine/${id}`);
    }
  }, [sessionId, session?.id]);

  // Socket connect/join room and listeners
  useEffect(() => {
    // Connect once
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'], withCredentials: true });
    }

    const socket = socketRef.current;

    // Join room when we have an id
    const roomToJoin = sessionId || session?.id;
    if (roomToJoin) {
      socket.emit('join-room', roomToJoin);
    }

    // Receive chat messages
    const onChat = (payload) => {
      if (!payload) return;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: payload.senderName || payload.id || 'Anonymous',
          content: payload.message,
          timestamp: new Date().toISOString()
        }
      ]);
    };
    socket.on('chat', onChat);

    return () => {
      socket.off('chat', onChat);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, session?.id]);

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

    // Ensure shareLink exists for participants
    if (typeof window !== 'undefined') {
      setShareLink(`${window.location.origin}/interv-examine/${sessionId}`);
    }
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const runCode = async () => {
    if (!code.trim()) return;
    
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
    
    // Emit to room via socket for realtime delivery
    const room = sessionId || session?.id;
    if (socketRef.current && room) {
      socketRef.current.emit('chat', { roomId: room, message: newMessage.trim(), senderName: localStorage.getItem('userName') || 'Anonymous' });
    }

    // Locally append for instant feedback
    const localMessage = {
      id: Date.now(),
      sender: localStorage.getItem('userName') || 'Anonymous',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, localMessage];
    setMessages(updatedMessages);
    setNewMessage('');

    const updatedSession = { ...session, messages: updatedMessages };
    setSession(updatedSession);
    if (sessionId) {
      localStorage.setItem(`interviewSession_${sessionId}`, JSON.stringify(updatedSession));
    }
  };

  const copyShareLink = () => {
    const link = shareLink || (typeof window !== 'undefined' ? window.location.href : '');
    if (!link) return;
    navigator.clipboard.writeText(link);
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
    <div className="h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden flex flex-col">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton to="/dashboard" text="Back to Dashboard" />
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  Interview-Examine
                </h1>
                <p className="text-gray-300 text-sm">Collaborative coding session</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Shareable Link Control - Always Visible */}
              <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  placeholder="Generating link..."
                  className="px-3 py-2 bg-transparent text-white text-sm w-48 md:w-64 outline-none placeholder-gray-400"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 transition-colors"
                  title="Copy share link"
                >
                  <MdCopyAll className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={copyShareLink}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105"
              >
                <MdShare className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <DashboardNavbar />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            {/* Code Editor */}
            <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto">
              {/* Editor Header */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                  <div className="flex items-center space-x-3">
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
                      className={`px-3 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 text-sm ${
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

              {/* Collaboration Info */}
              <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 backdrop-blur-md rounded-xl p-3 border border-violet-400/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MdShare className="w-5 h-5 text-violet-300" />
                    <div>
                      <h4 className="text-white font-semibold text-sm">Invite Others to Collaborate</h4>
                      <p className="text-gray-300 text-xs">Share this link so others can join and code together</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={shareLink}
                      className="px-3 py-2 bg-black/20 border border-white/20 rounded text-white text-sm w-48 outline-none"
                    />
                    <button
                      onClick={copyShareLink}
                      className="bg-violet-500 hover:bg-violet-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                    >
                      <MdCopyAll className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Monaco Code Editor */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 flex-shrink-0" style={{ height: '400px' }}>
                <Editor
                  height="100%"
                  language={selectedLanguage.toLowerCase() === 'c++' ? 'cpp' : selectedLanguage.toLowerCase()}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoClosingOvertype: 'always',
                    autoSurround: 'languageDefined',
                    formatOnPaste: true,
                    formatOnType: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    quickSuggestions: true,
                    parameterHints: { enabled: true },
                    folding: true,
                    bracketPairColorization: { enabled: true },
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    matchBrackets: 'always',
                    occurrencesHighlight: true,
                    selectionHighlight: true,
                  }}
                />
              </div>

              {/* Output */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex-shrink-0">
                <h4 className="text-white font-medium mb-2 text-sm">Output</h4>
                <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-black/20 p-3 rounded border border-white/10 h-24 overflow-y-auto">
                  {output || 'No output yet...'}
                </pre>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto">
              {/* Participants */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex-shrink-0">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <MdPerson className="w-5 h-5 mr-2" />
                  Participants ({participants.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-medium truncate text-sm">{participant.name}</div>
                        <div className="text-gray-400 text-xs truncate">{participant.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modern Chat */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 flex-1 flex flex-col min-h-0 shadow-xl">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-b border-white/20 p-4 rounded-t-xl">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300 flex items-center">
                    <MdSend className="w-5 h-5 mr-2 text-violet-300" />
                    Live Chat
                  </h3>
                  <p className="text-gray-300 text-xs mt-1">Collaborate in real-time</p>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-violet-500/50 scrollbar-track-transparent">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-3">
                        <MdSend className="w-8 h-8 text-violet-300" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">No messages yet</p>
                      <p className="text-gray-500 text-xs mt-1">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isCurrentUser = message.sender === (localStorage.getItem('userName') || 'Anonymous');
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                              isCurrentUser
                                ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-br-sm'
                                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-bl-sm'
                            } shadow-lg`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <span
                                className={`text-xs font-semibold ${
                                  isCurrentUser ? 'text-white/90' : 'text-violet-300'
                                }`}
                              >
                                {message.sender}
                              </span>
                              <span
                                className={`text-xs ${
                                  isCurrentUser ? 'text-white/70' : 'text-gray-400'
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed break-words">{message.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                <div className="p-4 border-t border-white/20 bg-black/20 rounded-b-xl">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-all"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className={`px-4 py-3 rounded-xl font-medium flex items-center justify-center transition-all duration-300 min-w-[50px] ${
                        newMessage.trim()
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-violet-500/50 hover:scale-105 active:scale-95'
                          : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                      }`}
                      title="Send message"
                    >
                      <MdSend className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2 text-center">Press Enter to send</p>
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
