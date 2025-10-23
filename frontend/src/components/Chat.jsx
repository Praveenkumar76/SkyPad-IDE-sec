import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import BackButton from './BackButton';
import { 
  MdSend,
  MdPerson,
  MdChat,
  MdNotifications,
  MdSettings
} from 'react-icons/md';

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Configure socket URL with fallback to local
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');

    if (!token || !userName) {
      navigate('/login');
      return;
    }

    setCurrentUser({
      id: userId,
      name: userName,
      email: userEmail,
      avatar: userName.substring(0, 2).toUpperCase()
    });

    // Initialize socket connection
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { 
        transports: ['websocket'], 
        withCredentials: true 
      });

      const socket = socketRef.current;

      // Join general chat room
      socket.emit('join-room', 'general-chat');

      // Send user info when connecting
      socket.emit('user-joined', {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail')
      });

      // Listen for chat messages
      socket.on('chat', (payload) => {
        if (!payload) return;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            sender: payload.senderName || payload.id || 'Anonymous',
            senderId: payload.senderId,
            content: payload.message,
            timestamp: new Date().toISOString()
          }
        ]);
      });

      // Listen for online users updates
      socket.on('users-online', (users) => {
        setOnlineUsers(users || []);
      });

      // Listen for user join/leave events
      socket.on('user-joined', (user) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: 'system',
            content: `${user.name} joined the chat`,
            timestamp: new Date().toISOString()
          }
        ]);
      });

      socket.on('user-left', (user) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: 'system',
            content: `${user.name} left the chat`,
            timestamp: new Date().toISOString()
          }
        ]);
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !currentUser) return;

    const messageData = {
      message: newMessage.trim(),
      senderName: currentUser.name,
      senderId: currentUser.id,
      timestamp: new Date().toISOString()
    };

    socketRef.current.emit('chat', messageData);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="backdrop-blur-lg bg-white/5 min-h-screen">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <BackButton to="/dashboard" text="Back to Dashboard" />
              <div className="text-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  SkyPad Chat
                </h1>
                <p className="text-gray-300 mt-1">Connect with the coding community</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.avatar}
                  </div>
                  <span className="hidden sm:block">{currentUser.name}</span>
                </div>
                <DashboardNavbar />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Main Chat Area */}
            <div className="lg:col-span-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MdChat className="w-6 h-6 text-violet-400" />
                    <h2 className="text-xl font-semibold text-white">General Chat</h2>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">{onlineUsers.length} online</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <MdChat className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Welcome to SkyPad Chat!</p>
                      <p className="text-sm">Start a conversation with fellow developers</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                      {message.type === 'system' ? (
                        <div className="text-center w-full">
                          <div className="inline-block bg-white/10 rounded-full px-4 py-2 text-gray-300 text-sm">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.senderId === currentUser.id
                            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
                            : 'bg-white/10 text-white'
                        }`}>
                          {message.senderId !== currentUser.id && (
                            <div className="text-xs font-medium text-violet-300 mb-1">
                              {message.sender}
                            </div>
                          )}
                          <div className="break-words">{message.content}</div>
                          <div className={`text-xs mt-1 opacity-70 ${
                            message.senderId === currentUser.id ? 'text-right' : 'text-left'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/20">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 resize-none focus:outline-none focus:border-violet-400 transition-colors"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                      newMessage.trim()
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 hover:scale-105 text-white'
                        : 'bg-white/20 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <MdSend className="w-5 h-5" />
                    <span className="hidden sm:block">Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Online Users */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MdPerson className="w-5 h-5 mr-2 text-violet-400" />
                  Online Users ({onlineUsers.length})
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {onlineUsers.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">
                      No users online
                    </div>
                  ) : (
                    onlineUsers.map((user, index) => (
                      <div key={user.id || index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium truncate">
                            {user.name || 'Anonymous'}
                            {user.id === currentUser.id && ' (You)'}
                          </div>
                          {user.email && (
                            <div className="text-gray-400 text-xs truncate">{user.email}</div>
                          )}
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/problems')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    Browse Problems
                  </button>
                  <button
                    onClick={() => navigate('/code-editor')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    Open Code Editor
                  </button>
                  <button
                    onClick={() => navigate('/challenges')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    Join Challenges
                  </button>
                  <button
                    onClick={() => navigate('/interv-examine')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                  >
                    Interview Practice
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

export default Chat;