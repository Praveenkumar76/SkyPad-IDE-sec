import { API_BASE_URL } from '../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MdTimer, 
  MdPerson, 
  MdPlayArrow, 
  MdCheckCircle, 
  MdError,
  MdCode,
  MdRefresh,
  MdExitToApp,
  MdCopyAll,
  MdArrowBack
} from 'react-icons/md';

const ChallengeRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [waitingTime, setWaitingTime] = useState(120);
  const [challengeTime, setChallengeTime] = useState(0);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isChallengeEnded, setIsChallengeEnded] = useState(false);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [winner, setWinner] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const intervalRef = useRef(null);
  const challengeIntervalRef = useRef(null);

  useEffect(() => {
    initializeRoom();
    loadProblems();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (challengeIntervalRef.current) clearInterval(challengeIntervalRef.current);
    };
  }, [roomId]);

  const initializeRoom = () => {
    // Check if this is a new room creation or joining existing room
    const savedRoom = localStorage.getItem(`challengeRoom_${roomId}`);
    if (savedRoom) {
      const roomData = JSON.parse(savedRoom);
      setRoom(roomData);
      setRoomName(roomData.name);
      setIsHost(roomData.host === localStorage.getItem('userId'));
      setPlayers(roomData.players || []);
      setScores(roomData.scores || {});
      
      // Restore waiting countdown without restarting
      if (!roomData.selectedProblem && roomData.waitingEndsAt) {
        const remaining = Math.max(0, Math.floor((new Date(roomData.waitingEndsAt).getTime() - Date.now()) / 1000));
        setWaitingTime(remaining);
        setIsWaiting(true);
        if (remaining > 0) startWaitingTimer(roomData.waitingEndsAt);
      }

      if (roomData.selectedProblem) {
        setSelectedProblem(roomData.selectedProblem);
        setIsWaiting(false);
        setIsChallengeActive(true);
        // Restore challenge timer from persisted end time
        if (roomData.challengeEndsAt) {
          const remaining = Math.max(0, Math.floor((new Date(roomData.challengeEndsAt).getTime() - Date.now()) / 1000));
          setChallengeTime(remaining);
          if (remaining > 0) startChallengeTimer(roomData.challengeEndsAt);
        }
      }
    } else {
      // Create new room
      const newRoom = {
        id: roomId,
        name: `Room ${roomId.substring(0, 8)}`,
        host: localStorage.getItem('userId'),
        players: [{
          id: localStorage.getItem('userId'),
          name: localStorage.getItem('userName') || 'Player',
          email: localStorage.getItem('userEmail') || '',
          joinedAt: new Date().toISOString()
        }],
        status: 'waiting', // waiting, active, ended
        createdAt: new Date().toISOString(),
        selectedProblem: null,
        scores: {},
        waitingEndsAt: new Date(Date.now() + 120000).toISOString()
      };
      
      setRoom(newRoom);
      setRoomName(newRoom.name);
      setIsHost(true);
      setPlayers(newRoom.players);
      localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(newRoom));
      
      // Start waiting timer
      startWaitingTimer(newRoom.waitingEndsAt);
    }
  };

  const loadProblems = async () => {
    try {
      setLoadingProblems(true);
      const response = await fetch(`${API_BASE_URL}/problems`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data || []);
      } else {
        console.error('Failed to load problems');
        setProblems([]);
      }
    } catch (error) {
      console.error('Error loading problems:', error);
      setProblems([]);
    } finally {
      setLoadingProblems(false);
    }
  };

  const startWaitingTimer = (endsAtIso) => {
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(endsAtIso).getTime() - Date.now()) / 1000));
      setWaitingTime(remaining);
      if (remaining <= 0) {
          clearInterval(intervalRef.current);
          if (players.length < 2) {
            alert('No one joined the challenge. Room will be closed.');
            navigate('/challenges');
          }
      }
    }, 1000);
  };

  const startChallengeTimer = (endsAtIso) => {
    challengeIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(endsAtIso).getTime() - Date.now()) / 1000));
      setChallengeTime(remaining);
      if (remaining <= 0) {
          clearInterval(challengeIntervalRef.current);
          endChallenge();
      }
    }, 1000);
  };

  const selectProblem = (problem) => {
    if (!isHost) return;
    
    console.log('Selecting problem:', problem);
    setSelectedProblem(problem);
    // Set challenge time based on difficulty
    const difficulty = problem.difficulty || 'Medium';
    const durationMap = { Easy: 15 * 60, Medium: 30 * 60, Hard: 50 * 60 };
    const durationSec = durationMap[difficulty] || 30 * 60;
    const challengeEndsAt = new Date(Date.now() + durationSec * 1000).toISOString();
    setChallengeTime(durationSec);
    const updatedRoom = {
      ...room,
      selectedProblem: problem,
      status: 'active',
      challengeEndsAt
    };
    
    setRoom(updatedRoom);
    setIsWaiting(false);
    setIsChallengeActive(true);
    localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(updatedRoom));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startChallengeTimer(challengeEndsAt);
  };

  const joinRoom = () => {
    const newPlayer = {
      id: localStorage.getItem('userId'),
      name: localStorage.getItem('userName') || 'Player',
      email: localStorage.getItem('userEmail') || '',
      joinedAt: new Date().toISOString()
    };
    
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    
    const updatedRoom = {
      ...room,
      players: updatedPlayers
    };
    
    setRoom(updatedRoom);
    localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(updatedRoom));
  };

  const runCode = async () => {
    if (!code.trim() || !selectedProblem) return;
    
    setIsRunning(true);
    try {
      const response = await fetch(`${API_BASE_URL}/problems/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: selectedProblem._id,
          code,
          language: selectedLanguage
        })
      });
      
      const result = await response.json();
      setTestResults(result);
      
      // Update scores
      const totalTests = (result.sampleResults?.length || 0) + (result.hiddenResults?.length || 0);
      const passedTests = (result.sampleResults?.filter(t => t.passed).length || 0) + 
                         (result.hiddenResults?.filter(t => t.passed).length || 0);
      
      const playerId = localStorage.getItem('userId');
      const newScores = {
        ...scores,
        [playerId]: {
          passed: passedTests,
          total: totalTests,
          percentage: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
          lastUpdated: new Date().toISOString()
        }
      };
      
      setScores(newScores);
      
      // Update room with new scores
      const updatedRoom = {
        ...room,
        scores: newScores
      };
      localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(updatedRoom));
      
      // Check for winner
      checkWinner(newScores);

      // If player solved all tests, end immediately and declare winner
      if (passedTests > 0 && passedTests === totalTests) {
        setWinner(playerId);
        endChallenge();
      }
      
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const checkWinner = (currentScores) => {
    const playerScores = Object.values(currentScores);
    if (playerScores.length < 2) return;
    
    const sortedScores = playerScores.sort((a, b) => {
      if (b.passed !== a.passed) return b.passed - a.passed;
      return b.percentage - a.percentage;
    });
    
    const topScore = sortedScores[0];
    const secondScore = sortedScores[1];
    
    if (topScore.passed > secondScore.passed) {
      // Clear winner
      const winnerId = Object.keys(currentScores).find(id => 
        currentScores[id].passed === topScore.passed
      );
      setWinner(winnerId);
      endChallenge();
    } else if (topScore.passed === secondScore.passed && topScore.percentage > secondScore.percentage) {
      // Winner by percentage
      const winnerId = Object.keys(currentScores).find(id => 
        currentScores[id].passed === topScore.passed && 
        currentScores[id].percentage === topScore.percentage
      );
      setWinner(winnerId);
      endChallenge();
    } else if (topScore.passed === secondScore.passed && topScore.percentage === secondScore.percentage) {
      // Tie
      setWinner('tie');
      endChallenge();
    }
  };

  const endChallenge = () => {
    setIsChallengeActive(false);
    setIsChallengeEnded(true);
    clearInterval(challengeIntervalRef.current);
    
    // Determine winner if not already decided (time ran out)
    if (!winner) {
      const playerScores = Object.values(scores);
      if (playerScores.length >= 2) {
        const entries = Object.entries(scores);
        const [aId, a] = entries[0];
        const [bId, b] = entries[1];
        const aScore = (a?.passed || 0);
        const bScore = (b?.passed || 0);
        const aPct = (a?.percentage || 0);
        const bPct = (b?.percentage || 0);
        if (aScore > bScore || (aScore === bScore && aPct > bPct)) setWinner(aId);
        else if (bScore > aScore || (aScore === bScore && bPct > aPct)) setWinner(bId);
        else setWinner('tie');
      }
    }

    // Reward coins for winner based on difficulty
    const difficulty = selectedProblem?.difficulty || 'Medium';
    const rewardMap = { Easy: 10, Medium: 20, Hard: 30 };
    const reward = rewardMap[difficulty] || 20;
    if (winner && winner !== 'tie') {
      const currentCoins = parseInt(localStorage.getItem('coins') || '0', 10);
      localStorage.setItem('coins', String(currentCoins + reward));
    }

    const updatedRoom = {
      ...room,
      status: 'ended',
      endedAt: new Date().toISOString()
    };
    localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(updatedRoom));
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading challenge room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={() => navigate('/challenges')}
                className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                title="Back to Challenges"
              >
                <MdArrowBack className="w-6 h-6 text-white" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  Challenge Room: {roomName}
                </h1>
                <p className="text-gray-300 mt-1">Room ID: {roomId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={copyRoomId}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <MdCopyAll className="w-4 h-4" />
                <span>Copy Room ID</span>
              </button>
              <button
                onClick={() => navigate('/challenges')}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <MdExitToApp className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status and Timers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Players */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MdPerson className="w-5 h-5 mr-2" />
              Players ({players.length}/2)
            </h3>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div key={player.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{player.name}</div>
                    <div className="text-gray-400 text-sm">{player.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waiting Timer */}
          {isWaiting && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MdTimer className="w-5 h-5 mr-2" />
                Waiting for Players
              </h3>
              <div className="text-3xl font-bold text-violet-400">
                {formatTime(waitingTime)}
              </div>
              <p className="text-gray-300 text-sm mt-2">
                Waiting for friend to join...
              </p>
            </div>
          )}

          {/* Challenge Timer */}
          {isChallengeActive && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MdTimer className="w-5 h-5 mr-2" />
                Challenge Time
              </h3>
              <div className="text-3xl font-bold text-green-400">
                {formatTime(challengeTime)}
              </div>
              <p className="text-gray-300 text-sm mt-2">
                Time remaining
              </p>
            </div>
          )}

          {/* Scores */}
          {Object.keys(scores).length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MdCheckCircle className="w-5 h-5 mr-2" />
                Scores
              </h3>
              <div className="space-y-2">
                {Object.entries(scores).map(([playerId, score]) => (
                  <div key={playerId} className="flex justify-between items-center">
                    <span className="text-white">{getPlayerName(playerId)}</span>
                    <span className="text-violet-400 font-bold">
                      {score.passed}/{score.total} ({score.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Problem Selection */}
        {isWaiting && isHost && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Select a Problem</h3>
            {loadingProblems ? (
              <div className="text-center py-8">
                <div className="text-gray-300">Loading problems...</div>
              </div>
            ) : problems && problems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {problems.map((problem) => (
                <div
                  key={problem._id}
                  onClick={() => selectProblem(problem)}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/20 hover:border-violet-400/50 cursor-pointer transition-all duration-300"
                >
                  <h4 className="text-white font-medium mb-2">{problem.title}</h4>
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{problem.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'text-green-400 bg-green-500/20' :
                      problem.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-500/20' :
                      'text-red-400 bg-red-500/20'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {problem.tags?.join(', ')}
                    </span>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-300">No problems available</div>
              </div>
            )}
          </div>
        )}

        {/* Challenge Interface */}
        {isChallengeActive && selectedProblem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problem Description */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">{selectedProblem.title}</h3>
              <div className="text-gray-300 whitespace-pre-wrap mb-4">
                {selectedProblem.description}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Constraints:</span>
                  <span className="text-white">{selectedProblem.constraints}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Languages:</span>
                  <span className="text-white">{selectedProblem.allowedLanguages?.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                >
                  {selectedProblem.allowedLanguages?.map(lang => (
                    <option key={lang} value={lang} className="bg-gray-800">{lang}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 text-xs">
                <p className="text-green-300">
                  ✅ <strong>Input sanitization enabled:</strong> Test inputs are automatically cleaned (brackets and commas removed) for easier parsing.
                </p>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your solution here..."
                className="w-full h-64 bg-black/20 border border-white/20 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-violet-400"
              />
              
              <div className="flex items-center space-x-4 mt-4">
                <button
                  onClick={runCode}
                  disabled={isRunning || !code.trim()}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                    isRunning || !code.trim()
                      ? 'bg-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 hover:scale-105'
                  }`}
                >
                  <MdPlayArrow className="w-4 h-4" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
              </div>

              {/* Test Results */}
              {testResults && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-white font-medium">Test Results:</h4>
                  <div className="text-sm text-gray-300">
                    Sample Tests: {testResults.sampleResults?.filter(t => t.passed).length || 0}/{testResults.sampleResults?.length || 0} passed
                  </div>
                  <div className="text-sm text-gray-300">
                    Hidden Tests: {testResults.hiddenResults?.filter(t => t.passed).length || 0}/{testResults.hiddenResults?.length || 0} passed
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {isChallengeEnded && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Challenge Ended!</h2>
            {winner === 'tie' ? (
              <div className="text-yellow-400 text-xl">It's a tie! 🎉</div>
            ) : (
              <div className="text-green-400 text-xl">
                {getPlayerName(winner)} wins! 🏆
              </div>
            )}
            <div className="mt-6 space-y-2">
              {Object.entries(scores).map(([playerId, score]) => (
                <div key={playerId} className="flex justify-between items-center text-white">
                  <span>{getPlayerName(playerId)}</span>
                  <span className="text-violet-400 font-bold">
                    {score.passed}/{score.total} tests passed ({score.percentage}%)
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/challenges')}
              className="mt-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Back to Challenges
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeRoom;
