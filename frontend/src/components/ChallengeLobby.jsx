import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { initializeSocket, connectSocket, disconnectSocket } from '../utils/socket';
import { challengeAPI } from '../utils/challengeAPI';
import './ChallengeLobby.css';

const ChallengeLobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [lobbyTimeLeft, setLobbyTimeLeft] = useState(300); // 5 minutes
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initialize socket first
    const socketInstance = initializeSocket(token);
    setSocket(socketInstance);

    // Setup socket event listeners before connecting
    socketInstance.on('room-joined', (data) => {
      console.log('✅ Socket: Room joined:', data);
      setIsHost(data.isHost);
      setLoading(false); // Set loading to false when socket confirms room join
      
      // Check if user is a spectator (not host and not opponent)
      let userIsParticipant = data.isHost;
      
      try {
        const token = localStorage.getItem('token');
        if (token && data.opponent) {
          const userId = JSON.parse(atob(token.split('.')[1])).sub;
          userIsParticipant = userIsParticipant || (data.opponent._id === userId);
        }
      } catch (error) {
        console.warn('Error parsing token for spectator detection:', error);
      }
      
      setIsSpectator(!userIsParticipant);
      
      // Update room data with socket info
      setRoomData(prev => ({ 
        ...prev, 
        ...data,
        status: data.status
      }));
      
      // Start lobby timer if provided
      if (data.lobbyExpiresAt && data.status === 'waiting') {
        const expiryTime = new Date(data.lobbyExpiresAt).getTime();
        updateLobbyTimer(expiryTime);
      }
      
      // If status is starting and user is a participant, enable ready button
      if (data.status === 'starting' && userIsParticipant) {
        setCanStart(true);
      }
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected');
      // Join room after connection is established
      setTimeout(() => {
        console.log('📡 Emitting join-room for:', roomId);
        socketInstance.emit('join-room', { roomId });
      }, 100);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socketInstance.on('opponent-joined', (data) => {
      console.log('Opponent joined:', data);
      setRoomData(prev => ({ ...prev, status: data.status || 'starting' }));
      setCanStart(data.canStart || false);
    });

    socketInstance.on('room-updated', (data) => {
      console.log('✅ Socket: Room updated:', data);
      setRoomData(data);
      
      // Check if user is still a participant after room update
      let userIsParticipant = data.isHost;
      
      try {
        const token = localStorage.getItem('token');
        if (token && data.opponent) {
          const userId = JSON.parse(atob(token.split('.')[1])).sub;
          userIsParticipant = userIsParticipant || (data.opponent._id === userId);
        }
      } catch (error) {
        console.warn('Error parsing token for spectator detection:', error);
      }
      
      setIsSpectator(!userIsParticipant);
      
      // Update lobby timer if room is still waiting and has new expiry
      if (data.lobbyExpiresAt && data.status === 'waiting') {
        const expiryTime = new Date(data.lobbyExpiresAt).getTime();
        updateLobbyTimer(expiryTime);
      }
      
      // If status is starting and user is a participant, enable ready button
      if (data.status === 'starting' && userIsParticipant) {
        setCanStart(true);
      }
    });

    socketInstance.on('opponent-ready-changed', (data) => {
      console.log('Opponent ready changed:', data);
      setOpponentReady(data.ready);
    });

    socketInstance.on('match-countdown', (data) => {
      console.log('Match countdown:', data.countdown);
      setCountdown(data.countdown);
    });

    socketInstance.on('match-started', (data) => {
      console.log('Match started:', data);
      // Redirect to IDE page
      navigate(`/challenge/${roomId}/duel`);
    });

    socketInstance.on('room-expired', (data) => {
      setError(data.message);
      setTimeout(() => {
        navigate('/challenges');
      }, 3000);
    });

    socketInstance.on('error', (data) => {
      console.error('Socket error:', data);
      setLoading(false);
      if (typeof data === 'string') {
        setError(data);
      } else if (data && data.message) {
        setError(data.message);
      } else {
        setError('An unknown socket error occurred');
      }
    });

    // Connect socket and fetch room details
    connectSocket();
    fetchRoomDetails();
    
    // Fallback timer in case socket doesn't connect
    const fallbackTimer = setTimeout(() => {
      console.warn('⚠️ Socket connection timeout, using API fallback');
      if (loading) {
        setLoading(false);
      }
    }, 5000);

    // Cleanup - only remove listeners, don't disconnect socket
    return () => {
      clearTimeout(fallbackTimer);
      if (socketInstance) {
        socketInstance.off('room-joined');
        socketInstance.off('room-updated');
        socketInstance.off('opponent-joined');
        socketInstance.off('opponent-ready-changed');
        socketInstance.off('match-countdown');
        socketInstance.off('match-started');
        socketInstance.off('room-expired');
        socketInstance.off('error');
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        // Don't emit leave-room or disconnect when navigating to duel
        // The socket needs to stay connected for the match
      }
    };
  }, [roomId, navigate]);

  const fetchRoomDetails = async () => {
    try {
      const data = await challengeAPI.getRoomDetails(roomId);
      console.log('Room details fetched:', data);
      setRoomData(data);
      
      // Set loading to false after successful fetch
      setLoading(false);
      
      // Start lobby timer if room is waiting (fallback for when socket doesn't connect)
      if (data.status === 'waiting' && data.lobbyExpiresAt) {
        const expiryTime = new Date(data.lobbyExpiresAt).getTime();
        console.log('⏰ Starting lobby timer via API fallback');
        updateLobbyTimer(expiryTime);
      }
      
      // Set up polling for room updates if socket isn't connected
      if (!socket?.connected) {
        console.log('📡 Socket not connected, setting up API polling');
        setupApiPolling();
      }
      
    } catch (err) {
      console.error('Failed to fetch room details:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const updateLobbyTimer = (expiryTime) => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setLobbyTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  const handleToggleReady = async () => {
    try {
      const newReadyState = !isReady;
      setIsReady(newReadyState);
      
      // Emit ready state change via socket
      if (socket) {
        socket.emit('player-ready', { roomId, ready: newReadyState });
      }
      
      // Only call API when marking as ready
      if (newReadyState) {
        await challengeAPI.markReady(roomId);
      }
    } catch (err) {
      console.error('Failed to toggle ready state:', err);
      setError(err.message);
      setIsReady(!isReady); // Revert state on error
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const setupApiPolling = () => {
    const pollingInterval = setInterval(async () => {
      try {
        const data = await challengeAPI.getRoomDetails(roomId);
        console.log('🔄 Polling room update:', data.status);
        
        // Update room data
        setRoomData(prev => ({ ...prev, ...data }));
        
        // Check if opponent joined
        if (data.status === 'starting' && data.opponent) {
          setCanStart(true);
          console.log('🎉 Opponent joined via polling!');
        }
        
        // Check if match started
        if (data.status === 'in_progress') {
          clearInterval(pollingInterval);
          navigate(`/challenge/${roomId}/duel`);
        }
        
        // Stop polling if room expired or finished
        if (data.status === 'expired' || data.status === 'finished') {
          clearInterval(pollingInterval);
          if (data.status === 'expired') {
            setError('Room has expired');
            setTimeout(() => navigate('/challenges'), 3000);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000); // Poll every 2 seconds
    
    // Store interval for cleanup
    return pollingInterval;
  };

  if (loading) {
    return (
      <div className="challenge-lobby">
        <div className="lobby-container">
          <div className="loading">Loading lobby...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="challenge-lobby">
        <div className="lobby-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (countdown !== null && countdown > 0) {
    return (
      <div className="challenge-lobby">
        <div className="lobby-container">
          <div className="countdown-container">
            <h1 className="countdown-title">Match Starting In</h1>
            <div className="countdown-number">{countdown}</div>
            <p className="countdown-subtext">Get ready to code! ⚡</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-lobby">
      <div className="lobby-container">
        {/* Debug Info (remove in production) */}
        <div style={{ 
          background: '#333', 
          color: '#fff', 
          padding: '10px', 
          marginBottom: '20px', 
          fontSize: '12px',
          borderRadius: '5px'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>Room ID: {roomId}</div>
          <div>Room Status: {roomData?.status || 'Unknown'}</div>
          <div>Is Host: {isHost ? 'Yes' : 'No'}</div>
          <div>Is Spectator: {isSpectator ? 'Yes' : 'No'}</div>
          <div>Socket Connected: {socket?.connected ? 'Yes' : 'No'}</div>
          <div>Can Start: {canStart ? 'Yes' : 'No'}</div>
          <div>Host Ready: {roomData?.hostReady ? 'Yes' : 'No'}</div>
          <div>Opponent Ready: {roomData?.opponentReady ? 'Yes' : 'No'}</div>
          <div>Lobby Time Left: {lobbyTimeLeft}s</div>
        </div>
        
        <div className="lobby-header">
          <h1>1v1 CodeDuel Lobby {isSpectator && <span className="spectator-badge">👁️ Spectating</span>}</h1>
          {roomData?.status === 'waiting' && (
            <div className="lobby-timer">
              <span className="timer-label">Lobby expires in:</span>
              <span className={`timer-value ${lobbyTimeLeft <= 30 ? 'timer-warning' : ''}`}>
                {formatTime(lobbyTimeLeft)}
              </span>
            </div>
          )}
        </div>

        <div className="lobby-content">
          <div className="room-info">
            <h2>Room ID</h2>
            <div className="room-id-container">
              <span className="room-id">{roomId}</span>
              <button onClick={copyRoomId} className="copy-btn">
                Copy ID
              </button>
            </div>
          </div>

          {roomData?.problem && (
            <div className="problem-info">
              <h2>Problem</h2>
              <div className="problem-details">
                <h3>{roomData.problem.title}</h3>
                <span className={`difficulty ${roomData.problem.difficulty.toLowerCase()}`}>
                  {roomData.problem.difficulty}
                </span>
              </div>
            </div>
          )}

          <div className="participants">
            <h2>Participants</h2>
            <div className="participant-list">
              <div className="participant host">
                <span className="participant-icon">👑</span>
                <span className="participant-name">
                  {roomData?.host?.username || 'Host'} {isHost && '(You)'}
                </span>
              </div>
              {roomData?.opponent ? (
                <div className="participant opponent">
                  <span className="participant-icon">⚔️</span>
                  <span className="participant-name">
                    {roomData.opponent.username} {!isHost && !isSpectator && '(You)'}
                  </span>
                </div>
              ) : (
                <div className="participant waiting">
                  <span className="participant-icon">⏳</span>
                  <span className="participant-name">Waiting for opponent...</span>
                </div>
              )}
              {isSpectator && (
                <div className="participant spectator">
                  <span className="participant-icon">👁️</span>
                  <span className="participant-name">You (Spectating)</span>
                </div>
              )}
            </div>
          </div>

          {roomData?.status === 'waiting' && !roomData?.opponent && (
            <div className="waiting-instructions">
              <p>
                {isSpectator 
                  ? 'Waiting for an opponent to join this match...' 
                  : isHost 
                    ? 'Share the Room ID with your opponent to start the match!' 
                    : 'Waiting for host to invite opponent...'
                }
              </p>
            </div>
          )}

          {roomData?.status === 'starting' && canStart && (
            <div className="start-section">
              <h2>{isSpectator ? 'Match Preparation' : 'Ready to Start?'}</h2>
              <p>{isSpectator ? 'You are spectating this match. Players are preparing to start.' : 'Both players must click "Ready" to begin the match.'}</p>
              
              <div className="readiness-status">
                <div className={`player-status ${isHost ? 'you' : ''}`}>
                  <span className="player-name">
                    {roomData?.host?.username || 'Host'} {isHost && '(You)'}
                  </span>
                  <span className={`ready-indicator ${(isHost ? isReady : opponentReady) ? 'ready' : 'not-ready'}`}>
                    {(isHost ? isReady : opponentReady) ? '✅ Ready' : '⏳ Not Ready'}
                  </span>
                </div>
                
                <div className={`player-status ${!isHost ? 'you' : ''}`}>
                  <span className="player-name">
                    {roomData?.opponent?.username || 'Opponent'} {!isHost && '(You)'}
                  </span>
                  <span className={`ready-indicator ${(!isHost ? isReady : opponentReady) ? 'ready' : 'not-ready'}`}>
                    {(!isHost ? isReady : opponentReady) ? '✅ Ready' : '⏳ Not Ready'}
                  </span>
                </div>
              </div>

              {!isSpectator && (
                <button
                  onClick={handleToggleReady}
                  className={`ready-btn ${isReady ? 'ready' : 'not-ready'}`}
                  disabled={loading}
                >
                  {isReady ? '✅ Ready - Click to Cancel' : '🚀 I\'m Ready!'}
                </button>
              )}
              
              {isReady && opponentReady && (
                <p className="countdown-notice">
                  🎉 Both players ready! Match will start in 3 seconds...
                </p>
              )}
            </div>
          )}

          {roomData?.status === 'finished' && isSpectator && (
            <div className="finished-section">
              <h2>🏁 Match Completed</h2>
              <p>This match has finished. You can review the results.</p>
              {roomData.winner && (
                <div className="winner-info">
                  <span className="winner-label">Winner:</span>
                  <span className="winner-name">{roomData.winner.username}</span>
                </div>
              )}
            </div>
          )}

          {(roomData?.status === 'in_progress' || roomData?.status === 'starting') && isSpectator && (
            <div className="spectator-info">
              <h3>👁️ Spectator Mode</h3>
              <p>You are watching this match. {roomData?.status === 'starting' ? 'The match will begin shortly.' : 'The match is in progress.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeLobby;

