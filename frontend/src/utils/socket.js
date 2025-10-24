import { io } from 'socket.io-client';

// For WebSocket connections, we need the actual backend URL
// Note: Vite proxy doesn't support WebSocket connections
const getSocketUrl = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://skypad-ide.onrender.com');
  
  // WebSocket connections don't use '/api' suffix
  return backendUrl;
};

const SOCKET_URL = getSocketUrl();

let socket = null;

export const initializeSocket = (token) => {
  console.log('🔌 Initializing socket with URL:', SOCKET_URL);
  
  if (socket) {
    console.log('🔌 Reusing existing socket');
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    autoConnect: false,
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true
  });

  // Add connection event logging
  socket.on('connect', () => {
    console.log('✅ Socket connected to:', SOCKET_URL);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message || error);
    console.error('Full error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  console.log('🔌 Socket initialized');
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const connectSocket = () => {
  console.log('🔌 Attempting to connect socket...');
  if (socket && !socket.connected) {
    console.log('🔌 Socket exists and not connected, connecting...');
    socket.connect();
  } else if (!socket) {
    console.error('❌ No socket to connect');
  } else if (socket.connected) {
    console.log('✅ Socket already connected');
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const cleanupSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

