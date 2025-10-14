import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import BackButton from './BackButton';
import { dsaSheetData } from '../data/dsaSheetData';
import io from 'socket.io-client';
import { 
  MdTimer, 
  MdPerson, 
  MdPlayArrow, 
  MdCheckCircle, 
  MdError,
  MdCode,
  MdRefresh,
  MdExitToApp,
  MdCopyAll
} from 'react-icons/md';

const ChallengeRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [waitingTime, setWaitingTime] = useState(120); // 2 minutes waiting
  const [challengeTime, setChallengeTime] = useState(0);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [isChallengeEnded, setIsChallengeEnded] = useState(false);
  const [showProblemSelection, setShowProblemSelection] = useState(false);
  const [showWaitingForPlayers, setShowWaitingForPlayers] = useState(false);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [winner, setWinner] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [problemsError, setProblemsError] = useState(false);
  const [execOutput, setExecOutput] = useState('');
  
  const intervalRef = useRef(null);
  const challengeIntervalRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Setup socket connection
    const socket = io('http://localhost:3002', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Handle room/player events
    socket.on('player-joined', ({ player, players: playerList }) => {
      if (player) {
        setPlayers((prev) => {
          const exists = prev.some(p => p.id === player.id);
          const next = exists ? prev : [...prev, player];
          return next;
        });
      }
      if (playerList && playerList.length) {
        // Sync full list when provided
        setPlayers(playerList);
      }
      // If I'm the host, share the current room state to the newly joined peer
      if (isHost && room) {
        try { socketRef.current?.emit('room-state', { roomId, state: room }); } catch {}
      }
    });

    socket.on('player-left', ({ players: playerList }) => {
      if (Array.isArray(playerList)) setPlayers(playerList);
    });

    // Challenge room coordination
    socket.on('room-state', ({ state }) => {
      if (!state) return;
      setRoom(state);
      setRoomName(state.name || roomName);
      setPlayers(state.players || players);
      setScores(state.scores || scores);
      if (state.selectedProblem) setSelectedProblem(state.selectedProblem);
    });

    socket.on('problem-selected', ({ problem }) => {
      if (problem) {
        setSelectedProblem(problem);
        setShowWaitingForPlayers(true);
        setShowProblemSelection(false);
      }
    });

    socket.on('challenge-start', ({ startAt, duration, problem }) => {
      if (problem) setSelectedProblem(problem);
      setIsWaiting(false);
      setIsChallengeActive(true);
      setShowWaitingForPlayers(false);
      setShowProblemSelection(false);
      // Sync timer based on server-provided startAt/duration
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((startAt + duration * 1000 - now) / 1000));
      setChallengeTime(remaining);
      if (challengeIntervalRef.current) clearInterval(challengeIntervalRef.current);
      startChallengeTimer();
    });

    socket.on('score-update', ({ playerId, score }) => {
      if (!playerId || !score) return;
      setScores((prev) => ({ ...prev, [playerId]: score }));
    });

    socket.on('challenge-end', ({ winnerId, scores: finalScores }) => {
      if (finalScores) setScores(finalScores);
      setWinner(winnerId);
      setIsChallengeActive(false);
      setIsChallengeEnded(true);
    });

    initializeRoom();
    loadProblems();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (challengeIntervalRef.current) clearInterval(challengeIntervalRef.current);
      try {
        socket.emit('leave-room', { roomId });
      } catch {}
      socket.close();
    };
  }, [roomId]);

  const initializeRoom = () => {
    // Check if this is a new room creation or joining existing room
    const savedRoom = localStorage.getItem(`challengeRoom_${roomId}`);
    const currentUserId = localStorage.getItem('userId');
    const player = {
      id: currentUserId,
      name: localStorage.getItem('userName') || 'Player',
      email: localStorage.getItem('userEmail') || '',
      joinedAt: new Date().toISOString()
    };

    if (savedRoom) {
      // Return to an existing room from this browser
      const roomData = JSON.parse(savedRoom);
      setRoom(roomData);
      setRoomName(roomData.name);
      setIsHost(roomData.host === currentUserId);
      setPlayers(roomData.players || []);
      setScores(roomData.scores || {});
      
      // Join the socket.io room to enable real-time sync
      try { socketRef.current?.emit('join-room', { roomId, player }); } catch {}
      
      if (roomData.status === 'active' && roomData.selectedProblem) {
        setSelectedProblem(roomData.selectedProblem);
        setIsWaiting(false);
        setIsChallengeActive(true);
        setChallengeTime(getChallengeTimeByDifficulty(roomData.selectedProblem.difficulty));
        startChallengeTimer();
      } else if (roomData.status === 'waiting' && roomData.selectedProblem) {
        setSelectedProblem(roomData.selectedProblem);
        setShowWaitingForPlayers(true);
        setShowProblemSelection(false);
        startWaitingTimer();
      } else if (roomData.status === 'waiting' && (roomData.host === currentUserId)) {
        setShowProblemSelection(true);
      } else if (roomData.status === 'waiting') {
        setShowWaitingForPlayers(true);
      }
    } else {
      // Determine create vs join using the presence of a prepared room name
      const nameFromStorage = localStorage.getItem(`roomName_${roomId}`);
      if (nameFromStorage) {
        // Creator flow: first arrival becomes host and selects a problem
        const newRoom = {
          id: roomId,
          name: nameFromStorage,
          host: currentUserId,
          players: [player],
          status: 'waiting',
          createdAt: new Date().toISOString(),
          selectedProblem: null,
          scores: {}
        };
        setRoom(newRoom);
        setRoomName(newRoom.name);
        setIsHost(true);
        setPlayers(newRoom.players);
        localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(newRoom));
        // Join socket room and broadcast initial state to any listeners
        try {
          socketRef.current?.emit('join-room', { roomId, player });
          socketRef.current?.emit('room-state', { roomId, state: newRoom });
        } catch {}
        // Show problem selection for host only
        setShowProblemSelection(true);
        setShowWaitingForPlayers(false);
      } else {
        // Guest flow: join an existing room and wait for host state
        setIsHost(false);
        setShowProblemSelection(false);
        setShowWaitingForPlayers(true);
        setPlayers([]);
        setScores({});
        setRoom({ id: roomId, status: 'waiting' });
        try {
          socketRef.current?.emit('join-room', { roomId, player });
        } catch {}
      }
    }
  };

  const loadProblems = async () => {
    try {
      setLoadingProblems(true);
      setProblemsError(false);
      const response = await fetch('http://localhost:5000/api/problems', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems || data || []);
      } else {
        console.error('Failed to load problems from API, using sample problems');
        loadSampleProblems();
      }
    } catch (error) {
      console.error('Error loading problems:', error);
      loadSampleProblems();
    } finally {
      setLoadingProblems(false);
    }
  };

  const loadSampleProblems = () => {
    const sampleProblems = [];
    Object.values(dsaSheetData.problems).forEach(topicProblems => {
      topicProblems.forEach(problem => {
        sampleProblems.push({
          _id: problem.id,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: [problem.difficulty.toLowerCase()],
          constraints: problem.problem?.constraints || 'No specific constraints',
          allowedLanguages: problem.problem?.allowedLanguages || ['JavaScript', 'Python', 'Java', 'C++'],
          // Include testcases if present for proper local evaluation
          sampleTestCases: problem.problem?.sampleTestCases || [],
          hiddenTestCases: problem.problem?.hiddenTestCases || []
        });
      });
    });
    setProblems(sampleProblems);
    setProblemsError(true);
  };

  const getChallengeTimeByDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 600; // 10 minutes
      case 'Medium': return 1800; // 30 minutes
      case 'Hard': return 3000; // 50 minutes
      default: return 1800; // 30 minutes default
    }
  };

  // Optional: legacy waiting timer (not used for auto-start)
  const startWaitingTimer = () => {
    setWaitingTime(120);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setWaitingTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startChallengeCountdown = (seconds = 3) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setWaitingTime(seconds);
    intervalRef.current = setInterval(() => {
      setWaitingTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          startChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startChallenge = () => {
    setIsWaiting(false);
    setIsChallengeActive(true);
    setShowWaitingForPlayers(false);
    setShowProblemSelection(false);
    const duration = getChallengeTimeByDifficulty(selectedProblem.difficulty);
    setChallengeTime(duration);
    
    const updatedRoom = {
      ...room,
      status: 'active',
      selectedProblem: selectedProblem
    };
    setRoom(updatedRoom);
    localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(updatedRoom));

    // Broadcast the official start time to synchronize timers
    const startAt = Date.now();
    try {
      socketRef.current?.emit('challenge-start', { roomId, startAt, duration, problem: selectedProblem });
      socketRef.current?.emit('room-state', { roomId, state: updatedRoom });
    } catch {}
    
    startChallengeTimer();
  };

  const startChallengeTimer = () => {
    if (challengeIntervalRef.current) clearInterval(challengeIntervalRef.current);
    challengeIntervalRef.current = setInterval(() => {
      setChallengeTime(prev => {
        if (prev <= 1) {
          clearInterval(challengeIntervalRef.current);
          endChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectProblem = (problem) => {
    if (!isHost) return;
    
    setSelectedProblem(problem);
    setShowProblemSelection(false);
    setShowWaitingForPlayers(true);
    
    const updatedRoom = {
      ...room,
      selectedProblem: problem,
      status: 'waiting'
    };
    
    setRoom(updatedRoom);
    localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(updatedRoom));

    // Broadcast selection to room
    try {
      socketRef.current?.emit('problem-selected', { roomId, problem });
      socketRef.current?.emit('room-state', { roomId, state: updatedRoom });
    } catch {}

    // If both players are already here, auto-start a 3s countdown
    if ((players?.length || 0) >= 2) {
      startChallengeCountdown(3);
    }
  };

  // Auto 3s countdown when both players present and a problem is selected (host only)
  useEffect(() => {
    if (isHost && room?.status === 'waiting' && selectedProblem && (players?.length || 0) >= 2) {
      startChallengeCountdown(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, room?.status, selectedProblem, players.length]);


  const runCode = async () => {
    if (!code.trim() || !selectedProblem) return;
    
    setIsRunning(true);
    try {
      const token = localStorage.getItem('token');
      const lang = (selectedLanguage || 'JavaScript').toLowerCase();
      const response = await fetch('http://localhost:5000/api/problems/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: selectedProblem._id || selectedProblem.id,
          code,
          language: lang,
          // Provide inline testcases when using sample (non-DB) problems
          problem: !selectedProblem._id ? {
            sampleTestCases: selectedProblem.sampleTestCases || [],
            hiddenTestCases: selectedProblem.hiddenTestCases || [],
            allowedLanguages: selectedProblem.allowedLanguages || ['JavaScript', 'Python'],
            timeLimit: 1000
          } : undefined
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Execution failed' }));
        throw new Error(err.message || 'Execution failed');
      }
      const result = await response.json();
      setTestResults(result);

      // Build output log
      const details = [];
      const renderTests = (arr, label) => {
        (arr || []).forEach((t, idx) => {
          details.push(`[${label} ${idx + 1}]\nInput:\n${t.input ?? ''}\nExpected:\n${t.expectedOutput ?? ''}\nActual:\n${t.actualOutput ?? ''}\nResult: ${t.passed ? 'PASS' : 'FAIL'}\n`);
        });
      };
      renderTests(result.sampleResults, 'Sample');
      renderTests(result.hiddenResults, 'Hidden');
      setExecOutput(details.join('\n'));
      
      // Update scores based on actual results
      const totalTests = (result.sampleResults?.length || 0) + (result.hiddenResults?.length || 0);
      const passedTests = [...(result.sampleResults || []), ...(result.hiddenResults || [])].filter(t => t.passed).length;
      
      const playerId = localStorage.getItem('userId');
      const playerScore = {
        passed: passedTests,
        total: totalTests,
        percentage: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
        lastUpdated: new Date().toISOString()
      };
      const newScores = {
        ...scores,
        [playerId]: playerScore
      };
      setScores(newScores);
      
      // Update room with new scores
      const updatedRoom = {
        ...room,
        scores: newScores
      };
      localStorage.setItem(`challengeRoom_${roomId}`, JSON.stringify(updatedRoom));

      // Broadcast score update
      try {
        socketRef.current?.emit('score-update', { roomId, playerId, score: playerScore });
      } catch {}
      
    } catch (error) {
      console.error('Error running code:', error);
      setExecOutput(`Execution error: ${error.message || 'failed'}`);
      alert(error.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim() || !selectedProblem) return;
    
    setIsRunning(true);
    try {
      // Run code first to get results
      await runCode();
      
      // Recalculate from latest testResults state after runCode
      const res = testResults;
      const totalTests = (res?.sampleResults?.length || 0) + (res?.hiddenResults?.length || 0);
      const passedTests = [...(res?.sampleResults || []), ...(res?.hiddenResults || [])].filter(t => t.passed).length;
      
      if (passedTests === totalTests && totalTests > 0) {
        // All tests passed - this player wins!
        const playerId = localStorage.getItem('userId');
        setWinner(playerId);
        // Broadcast end of challenge to both users
        try {
          socketRef.current?.emit('challenge-end', { roomId, winnerId: playerId, scores });
        } catch {}
        endChallenge();
      } else {
        alert(`Only ${passedTests}/${totalTests} tests passed. Keep trying!`);
      }
      
    } catch (error) {
      console.error('Error submitting code:', error);
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
      // Clear winner by test cases passed
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

  const copyJoinLink = () => {
    const url = `${window.location.origin}/challenge-room/${roomId}`;
    navigator.clipboard.writeText(url);
    alert('Join link copied!');
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
            <div className="flex items-center space-x-6">
              <BackButton to="/challenges" text="Back to Challenges" />
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  Challenge Room: {roomName}
                </h1>
                <p className="text-gray-300 mt-1">Room ID: {roomId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isHost && (
                <button
                  onClick={copyJoinLink}
                  className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <MdCopyAll className="w-4 h-4" />
                  <span>Copy Join Link</span>
                </button>
              )}
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
              <DashboardNavbar />
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

          {/* Timer Display */}
          {(isWaiting || isChallengeActive) && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MdTimer className="w-5 h-5 mr-2" />
                {isChallengeActive ? 'Challenge Time' : 'Waiting Time'}
              </h3>
              <div className={`text-3xl font-bold ${
                isChallengeActive ? 'text-green-400' : 'text-violet-400'
              }`}>
                {formatTime(isChallengeActive ? challengeTime : waitingTime)}
              </div>
              <p className="text-gray-300 text-sm mt-2">
                {isChallengeActive ? 'Time remaining' : 
                 waitingTime <= 10 ? 'Starting in...' : 'Waiting for friend to join...'}
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

        {/* Problem Selection - Only show when host needs to select */}
        {showProblemSelection && isHost && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Select a Problem</h3>
              {problemsError && (
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 text-sm">Using sample problems</span>
                  <button
                    onClick={loadProblems}
                    className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors text-sm"
                  >
                    <MdRefresh className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                </div>
              )}
            </div>
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
                  className="bg-white/5 hover:bg-white/10 border border-white/20 hover:border-violet-400/50 cursor-pointer rounded-lg p-4 transition-all duration-300"
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
                <div className="text-gray-300 mb-4">No problems available</div>
                <button
                  onClick={loadProblems}
                  className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mx-auto"
                >
                  <MdRefresh className="w-4 h-4" />
                  <span>Retry Loading Problems</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Guest waiting hint - before the host selects a problem */}
        {!isHost && room?.status === 'waiting' && !selectedProblem && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
            <h3 className="text-xl font-semibold text-white mb-1">Waiting for host...</h3>
            <p className="text-gray-300">The host is selecting a problem. You’ll see a 3-second countdown when it’s ready.</p>
          </div>
        )}

        {/* Waiting for Players - Show when problem is selected but waiting for players */}
        {showWaitingForPlayers && selectedProblem && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Selected Problem</h3>
            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <h4 className="text-white font-medium mb-2">{selectedProblem.title}</h4>
              <p className="text-gray-300 text-sm mb-2">{selectedProblem.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedProblem.difficulty === 'Easy' ? 'text-green-400 bg-green-500/20' :
                  selectedProblem.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-500/20' :
                  'text-red-400 bg-red-500/20'
                }`}>
                  {selectedProblem.difficulty}
                </span>
                <span className="text-gray-400 text-xs">
                  Challenge Time: {formatTime(getChallengeTimeByDifficulty(selectedProblem.difficulty))}
                </span>
              </div>
            </div>
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
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105'
                  }`}
                >
                  <MdPlayArrow className="w-4 h-4" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
                <button
                  onClick={submitCode}
                  disabled={isRunning || !code.trim()}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                    isRunning || !code.trim()
                      ? 'bg-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105'
                  }`}
                >
                  <MdCheckCircle className="w-4 h-4" />
                  <span>{isRunning ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>

              {/* Integrated Output Panel */}
              <div className="mt-4 bg-black/30 border border-white/20 rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                  <h4 className="text-white font-medium">Output</h4>
                  {testResults && (
                    <div className="text-xs text-gray-300">
                      Sample: {testResults.sampleResults?.filter(t => t.passed).length || 0}/{testResults.sampleResults?.length || 0} •
                      Hidden: {testResults.hiddenResults?.filter(t => t.passed).length || 0}/{testResults.hiddenResults?.length || 0}
                    </div>
                  )}
                </div>
                <div className="max-h-64 overflow-auto p-4 bg-black/20">
                  <pre className="whitespace-pre-wrap text-sm text-gray-200">{execOutput || 'Run the code to see output and per-test details here.'}</pre>
                </div>
              </div>
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
