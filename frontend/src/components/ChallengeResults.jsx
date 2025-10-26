import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import BackButton from './BackButton';
import { challengeAPI } from '../utils/challengeAPI';
import { getSocket, disconnectSocket } from '../utils/socket';
import './ChallengeResults.css';

const ENCOURAGEMENT_PHRASES = [
  "Great effort! Keep practicing!",
  "You were close! Try again!",
  "Don't give up! Every attempt makes you better!",
  "Learning from defeats makes champions!",
  "Better luck next time! You've got this!",
  "Every master was once a beginner!",
  "Keep pushing! Success is just around the corner!"
];

const ChallengeResults = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isWinner = location.state?.isWinner || false;
  const encouragement = ENCOURAGEMENT_PHRASES[Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length)];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchResults();
    
    // Clean up socket connection and remove all challenge-related listeners
    try {
      const socket = getSocket();
      if (socket) {
        // Remove all challenge-related event listeners
        socket.off('room-joined');
        socket.off('opponent-joined');
        socket.off('opponent-ready-changed');
        socket.off('match-countdown');
        socket.off('match-started');
        socket.off('opponent-submitted');
        socket.off('match-finished');
        socket.off('room-expired');
        
        // Leave the current room if still connected
        socket.emit('leave-room');
      }
    } catch (err) {
      console.warn('Socket cleanup warning:', err);
    }
    
    // Cleanup function to ensure session is terminated
    return () => {
      try {
        const socket = getSocket();
        if (socket) {
          socket.emit('leave-room');
        }
      } catch (err) {
        console.warn('Socket cleanup on unmount warning:', err);
      }
    };
  }, [roomId, navigate]);

  const fetchResults = async () => {
    try {
      const data = await challengeAPI.getRoomDetails(roomId);
      setRoomData(data);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleBackToChallenges = () => {
    navigate('/challenges/1v1');
  };

  const handleRematch = () => {
    navigate('/challenges/1v1');
  };

  if (loading) {
    return (
      <div className="challenge-results">
        <div className="results-container">
          <div className="loading">Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-results">
      <div className="results-container">
        <div style={{ marginBottom: '20px' }}>
          <BackButton to="/challenges/1v1" text="Back to Challenges" />
        </div>
        <div className={`results-banner ${isWinner ? 'winner' : 'loser'}`}>
          {isWinner ? (
            <>
              <div className="banner-icon">🎉</div>
              <h1 className="banner-title">Congratulations!</h1>
              <p className="banner-subtitle">You Won the Match!</p>
            </>
          ) : (
            <>
              <div className="banner-icon">💪</div>
              <h1 className="banner-title">Better Luck Next Time!</h1>
              <p className="banner-subtitle">{encouragement}</p>
            </>
          )}
        </div>

        <div className="results-content">
          <div className="match-summary">
            <h2>Match Summary</h2>
            
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Room ID</span>
                <span className="summary-value">{roomData?.roomId || 'N/A'}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Problem</span>
                <span className="summary-value">{roomData?.problem?.title || 'N/A'}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Difficulty</span>
                <span className={`summary-value difficulty-${roomData?.problem?.difficulty.toLowerCase()}`}>
                  {roomData?.problem?.difficulty || 'N/A'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Match Duration</span>
                <span className="summary-value">{formatDuration(roomData?.matchDuration)}</span>
              </div>
            </div>
          </div>

          <div className="participants-results">
            <h2>Participants</h2>
            
            <div className="participants-grid">
              <div className={`participant-card ${roomData?.winner?.username === roomData?.host?.username ? 'winner-card' : ''}`}>
                <div className="participant-header">
                  {roomData?.winner?.username === roomData?.host?.username && (
                    <span className="winner-badge">👑 Winner</span>
                  )}
                </div>
                <div className="participant-info">
                  <div className="participant-avatar">👤</div>
                  <div className="participant-details">
                    <div className="participant-name">{roomData?.host?.username || 'Host'}</div>
                    <div className="participant-role">Host</div>
                  </div>
                </div>
              </div>

              <div className={`participant-card ${roomData?.winner?.username === roomData?.opponent?.username ? 'winner-card' : ''}`}>
                <div className="participant-header">
                  {roomData?.winner?.username === roomData?.opponent?.username && (
                    <span className="winner-badge">👑 Winner</span>
                  )}
                </div>
                <div className="participant-info">
                  <div className="participant-avatar">👤</div>
                  <div className="participant-details">
                    <div className="participant-name">{roomData?.opponent?.username || 'Opponent'}</div>
                    <div className="participant-role">Opponent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {roomData?.rewards && (
            <div className="rewards-section">
              <h2>Rewards Earned</h2>
              <div className="rewards-list">
                <div className="reward-item">
                  <span className="reward-icon">💰</span>
                  <span className="reward-text">
                    +{isWinner ? roomData.rewards.winnerCoins : roomData.rewards.loserCoins} Coins
                  </span>
                </div>
                {isWinner && (
                  <div className="reward-item">
                    <span className="reward-icon">🏆</span>
                    <span className="reward-text">Victory Achievement</span>
                  </div>
                )}
                {roomData.rewards.fastSolveBonus && isWinner && (
                  <div className="reward-item bonus">
                    <span className="reward-icon">⚡</span>
                    <span className="reward-text">Speed Bonus (+50%)</span>
                  </div>
                )}
                <div className="reward-item">
                  <span className="reward-icon">📈</span>
                  <span className="reward-text">Stats Updated</span>
                </div>
              </div>
              {!isWinner && (
                <p className="consolation-text">
                  You still earned coins for participating! Keep improving!
                </p>
              )}
            </div>
          )}

          <div className="results-actions">
            <button onClick={handleBackToChallenges} className="btn-secondary">
              Back to Challenges
            </button>
            <button onClick={handleRematch} className="btn-primary">
              New Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeResults;

