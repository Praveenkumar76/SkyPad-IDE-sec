import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getSocket } from '../utils/socket';
import { challengeAPI } from '../utils/challengeAPI';
import './CodeDuelIDE.css';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' }
];

const DEFAULT_CODE = {
  javascript: '',
  python: '',
  cpp: '',
  java: ''
};

const CodeDuelIDE = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [matchTime, setMatchTime] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0); // Time limit based on difficulty
  const [error, setError] = useState('');
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [matchFinished, setMatchFinished] = useState(false);
  const [matchStatus, setMatchStatus] = useState('in_progress');
  const editorRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get socket instance
    try {
      const socketInstance = getSocket();
      setSocket(socketInstance);

      // Join the room via socket to receive real-time updates
      socketInstance.emit('join-room', { roomId: roomId.toUpperCase() });
      console.log('Joining socket room:', roomId);

      // Socket event listeners
      socketInstance.on('opponent-submitted', (data) => {
        setOpponentSubmitted(true);
        setOutput(prev => prev + `\n\n⚠️ ${data.username} has submitted their solution!`);
      });

      socketInstance.on('match-finished', (data) => {
        console.log('Match finished event received:', data);
        setMatchFinished(true);
        setMatchStatus('finished');
        setIsSubmitting(false); // Stop any ongoing submission
        
        const currentUserId = JSON.parse(atob(token.split('.')[1])).sub;
        const isWinner = data.winnerId && (data.winnerId === currentUserId || data.winnerId.toString() === currentUserId);
        
        console.log('Winner check:', { currentUserId, winnerId: data.winnerId, isWinner });
        
        // Show match finished message
        setOutput(prev => prev + `\n\n🏁 Match has ended!\n${isWinner ? '🎉 You won!' : '😔 You lost.'} Redirecting to results...`);
        
        // Redirect to results page after a short delay
        setTimeout(() => {
          navigate(`/challenge/${roomId}/results`, {
            state: {
              isWinner,
              winner: data.winner,
              matchDuration: data.matchDuration
            }
          });
        }, 2000); // Reduced to 2 seconds for faster redirect
      });

      socketInstance.on('error', (data) => {
        setError(data.message);
      });
    } catch (err) {
      console.error('Socket error:', err);
      setError('Failed to connect to match. Please refresh the page.');
    }

    // Fetch room and problem details
    fetchRoomDetails();

    // Start match timer
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setMatchTime(elapsed);
      
      // Auto-submit when time runs out
      if (timeLimit > 0 && elapsed >= timeLimit && !isSubmitting && !matchFinished && matchStatus === 'in_progress' && code.trim()) {
        console.log('Time limit reached, auto-submitting code...');
        setOutput(prev => prev + '\n\n⏰ Time up! Auto-submitting your current code...');
        setTimeout(() => {
          handleSubmitCode();
        }, 1000); // Small delay to ensure UI update
      }
    }, 1000);

    // Cleanup - only remove listeners and clear timer
    // Keep socket connected until match is finished
    return () => {
      clearInterval(timerInterval);
      if (socketInstance) {
        socketInstance.off('opponent-submitted');
        socketInstance.off('match-finished');
        socketInstance.off('error');
        socketInstance.emit('leave-room');
        console.log('Left socket room on unmount');
      }
    };
  }, [roomId, navigate]);

  const fetchRoomDetails = async () => {
    try {
      const data = await challengeAPI.getRoomDetails(roomId);
      setProblem(data.problem);
      
      // Set match status from room data
      if (data.status) {
        setMatchStatus(data.status);
        if (data.status === 'finished' || data.status === 'expired') {
          setMatchFinished(true);
          
          // If match is already finished, redirect to results immediately
          const token = localStorage.getItem('token');
          const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;
          const isWinner = data.winner && currentUserId && 
            (data.winner._id === currentUserId || data.winner.id === currentUserId);
          
          console.log('Match already finished, redirecting to results');
          setTimeout(() => {
            navigate(`/challenge/${roomId}/results`, {
              state: { isWinner }
            });
          }, 1000);
          return;
        }
      }
      
      // Set time limit based on problem difficulty
      if (data.problem && data.problem.difficulty) {
        const difficulty = data.problem.difficulty.toLowerCase();
        let limit = 0;
        
        switch (difficulty) {
          case 'easy':
            limit = 15 * 60; // 15 minutes
            break;
          case 'medium':
            limit = 30 * 60; // 30 minutes
            break;
          case 'hard':
            limit = 60 * 60; // 60 minutes
            break;
          default:
            limit = 30 * 60; // Default to 30 minutes
        }
        
        setTimeLimit(limit);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(''); // Always start with empty code
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput('Error: Code cannot be empty');
      return;
    }

    setOutput('Running code against test cases...\n');
    setIsRunning(true);
    setTestResults(null);
    setError('');

    try {
      // Call backend API to run against all test cases (sample + hidden)
      const response = await fetch('/api/problems/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: problem?.id,
          code,
          language: language === 'cpp' ? 'C++' : language.charAt(0).toUpperCase() + language.slice(1)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Combine sample and hidden results
      const allResults = [...(result.sampleResults || []), ...(result.hiddenResults || [])];
      const sampleCount = result.sampleResults?.length || 0;
      const hiddenCount = result.hiddenResults?.length || 0;
      const totalTests = allResults.length;
      const passedTests = allResults.filter(test => test.passed).length;
      const samplePassed = (result.sampleResults || []).filter(test => test.passed).length;
      const hiddenPassed = (result.hiddenResults || []).filter(test => test.passed).length;
      
      setTestResults({
        sampleResults: result.sampleResults || [],
        hiddenResults: result.hiddenResults || [],
        allResults: allResults,
        allPassed: passedTests === totalTests
      });

      if (totalTests === 0) {
        setOutput('No test cases available.');
      } else {
        let outputMsg = `Test Results: ${passedTests}/${totalTests} passed\n`;
        if (sampleCount > 0) {
          outputMsg += `Sample Tests: ${samplePassed}/${sampleCount} passed\n`;
        }
        if (hiddenCount > 0) {
          outputMsg += `Hidden Tests: ${hiddenPassed}/${hiddenCount} passed\n`;
        }
        outputMsg += `\n${passedTests === totalTests ? '✅ All tests passed!' : '❌ Some tests failed'}`;
        outputMsg += `\nScore: ${result.score || 0}%`;
        
        // Check if all tests passed
        if (passedTests === totalTests && totalTests > 0) {
          outputMsg += `\n\n🎉 PERFECT SOLUTION! All ${totalTests} test cases passed!`;
          outputMsg += `\n⏱️ Auto-submitting in 3 seconds... (Click Submit to submit now)`;
          setOutput(outputMsg);
          
          // Auto-submit when all tests pass
          setTimeout(async () => {
            // Only auto-submit if match is still active and no manual submission happened
            if (!isSubmitting && !matchFinished && matchStatus === 'in_progress') {
              try {
                setOutput(prev => prev + `\n\n🚀 Auto-submitting perfect solution...`);
                await handleSubmitCode();
              } catch (err) {
                console.error('Auto-submit failed:', err);
                setOutput(prev => prev + `\n\n❌ Auto-submit failed. Please click Submit manually.`);
              }
            }
          }, 3000);
        } else {
          outputMsg += `\n\nNote: Click "Submit" to submit your final solution.`;
          setOutput(outputMsg);
        }
      }
    } catch (err) {
      console.error('Run code error:', err);
      setOutput(`Error: ${err.message || 'Failed to run code'}`);
      setError(err.message || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleEndMatch = async () => {
    const confirmMessage = code.trim() 
      ? 'Are you sure you want to end the match?\n\nThis will submit your current solution and finish the game. Your opponent may still be working on their solution.'
      : 'Are you sure you want to end the match?\n\nYou have no code written. This will forfeit the match.';
      
    if (window.confirm(confirmMessage)) {
      try {
        setOutput('Ending match voluntarily...\n');
        
        // If there's code, submit it first
        if (code.trim()) {
          setOutput(prev => prev + 'Submitting your current solution...\n');
          await handleSubmitCode();
        } else {
          // If no code, forfeit the match
          setMatchFinished(true);
          setMatchStatus('finished');
          setOutput('Match ended voluntarily with no solution submitted.\n\nRedirecting to results...');
          
          // Redirect to results after delay
          setTimeout(() => {
            navigate(`/challenge/${roomId}/results`);
          }, 2000);
        }
      } catch (err) {
        console.error('End match error:', err);
        setOutput('Failed to end match properly. Please try submitting manually.');
        setError('Failed to end match properly');
      }
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setOutput('Error: Code cannot be empty');
      return;
    }
    
    // Check if match is still active
    if (matchFinished || matchStatus !== 'in_progress') {
      setOutput('❌ Cannot submit: Match has ended');
      return;
    }

    setOutput('Submitting code for evaluation...\n');
    setIsSubmitting(true);
    setError('');

    try {
      // Submit code to backend for evaluation against all test cases
      const result = await challengeAPI.submitCode(roomId, code, language);
      
      // Notify opponent via socket that code was submitted
      if (socket) {
        socket.emit('code-submitted', { roomId });
      }

      // Check if match finished during submission (race condition)
      if (result.result === 'finished' || result.matchFinished) {
        setMatchFinished(true);
        setMatchStatus('finished');
        const message = result.isWinner 
          ? '🎉 Congratulations! You won the match!\n\nRedirecting to results...'
          : '⏰ Match ended! Your opponent finished first.\n\nRedirecting to results...';
        setOutput(message);
        
        // Redirect to results after delay
        setTimeout(() => {
          navigate(`/challenge/${roomId}/results`);
        }, 2000);
        return;
      }

      // Process results
      const totalTests = result.testResults?.length || 0;
      const passedTests = result.testResults?.filter(t => t.passed).length || 0;

      setTestResults({
        testResults: result.testResults,
        allPassed: result.result === 'accepted'
      });

      if (result.result === 'accepted') {
        setOutput(
          `✅ ALL TEST CASES PASSED!\n\n` +
          `Result: ACCEPTED\n` +
          `Tests Passed: ${passedTests}/${totalTests}\n\n` +
          `${result.isWinner ? '🎉 Congratulations! You won the match!\n\nRedirecting to results...' : '⏳ Waiting for opponent...'}`
        );
        
        // If winner, the socket will receive match-finished event and redirect automatically
      } else {
        const failedTests = result.testResults?.filter(t => !t.passed) || [];
        const sampleFailed = failedTests.filter(t => t.isSample);
        const hiddenFailed = failedTests.filter(t => !t.isSample);
        
        setOutput(
          `❌ SOME TEST CASES FAILED\n\n` +
          `Result: REJECTED\n` +
          `Tests Passed: ${passedTests}/${totalTests}\n` +
          `Tests Failed: ${failedTests.length}\n` +
          `  - Sample Tests Failed: ${sampleFailed.length}\n` +
          `  - Hidden Tests Failed: ${hiddenFailed.length}\n\n` +
          `💡 Review your logic and try again!\n` +
          `${opponentSubmitted ? '⚠️ Your opponent has already submitted! Hurry!' : ''}`
        );
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to submit code';
      
      // Handle specific "match not in progress" error
      if (errorMsg.includes('Match is not in progress') || errorMsg.includes('Match has already been won')) {
        setMatchFinished(true);
        setMatchStatus('finished');
        setOutput('❌ Match has ended - submissions are no longer accepted.\n\nRedirecting to results...');
        
        // Redirect to results after delay
        setTimeout(() => {
          navigate(`/challenge/${roomId}/results`);
        }, 2000);
      } else {
        setOutput(`❌ Submission Error\n\n${errorMsg}`);
        setError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRemainingTime = () => {
    if (timeLimit === 0) return formatTime(matchTime);
    
    const remaining = Math.max(0, timeLimit - matchTime);
    return formatTime(remaining);
  };

  const getTimeWarningClass = () => {
    if (timeLimit === 0) return '';
    
    const remaining = timeLimit - matchTime;
    const percentLeft = remaining / timeLimit;
    
    if (percentLeft <= 0.1) return 'time-critical'; // Less than 10% left
    if (percentLeft <= 0.2) return 'time-warning'; // Less than 20% left
    return '';
  };

  if (error && !problem) {
    return (
      <div className="code-duel-ide">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/challenges')}>Back to Challenges</button>
        </div>
      </div>
    );
  }

  return (
    <div className="code-duel-ide">
      <div className="ide-header">
        <div className="header-left">
          <h2>1v1 CodeDuel</h2>
          <span className="room-badge">Room: {roomId}</span>
        </div>
        <div className="header-right">
          <div className={`match-timer ${getTimeWarningClass()}`}>
            <span className="timer-icon">⏱️</span>
            <span className="timer-value">{formatRemainingTime()}</span>
            {timeLimit > 0 && (
              <span className="timer-label">
                {timeLimit === matchTime ? 'Time Up!' : 'remaining'}
              </span>
            )}
          </div>
          {matchFinished && (
            <div className="match-status finished">
              <span className="status-icon">🏁</span>
              <span>Match Ended</span>
            </div>
          )}
          {!matchFinished && opponentSubmitted && (
            <div className="opponent-status">
              <span className="status-icon">⚠️</span>
              <span>Opponent submitted!</span>
            </div>
          )}
        </div>
      </div>

      <div className="ide-content">
        <div className="problem-panel">
          <div className="problem-header">
            <h3>{problem?.title || 'Loading...'}</h3>
            {problem && (
              <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
            )}
          </div>

          <div className="problem-body">
            {problem ? (
              <>
                <div className="problem-section">
                  <h4>Description</h4>
                  <p>{problem.description}</p>
                </div>

                {problem.examples && problem.examples.length > 0 && (
                  <div className="problem-section">
                    <h4>Examples</h4>
                    {problem.examples.map((example, index) => (
                      <div key={index} className="example">
                        <div className="example-item">
                          <strong>Input:</strong>
                          <pre>{example.input}</pre>
                        </div>
                        <div className="example-item">
                          <strong>Output:</strong>
                          <pre>{example.expectedOutput || example.output}</pre>
                        </div>
                        {example.explanation && (
                          <div className="example-item">
                            <strong>Explanation:</strong>
                            <p>{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints && (
                  <div className="problem-section">
                    <h4>Constraints</h4>
                    {typeof problem.constraints === 'string' ? (
                      <p>{problem.constraints}</p>
                    ) : Array.isArray(problem.constraints) ? (
                      <ul>
                        {problem.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <div className="loading">Loading problem...</div>
            )}
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="language-select"
              disabled={isSubmitting}
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="toolbar-actions">
              <button
                onClick={handleRunCode}
                disabled={isSubmitting || isRunning || matchFinished}
                className="run-btn"
              >
                {isRunning ? '⏳ Running...' : '▶ Run Code'}
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={isSubmitting || isRunning || matchFinished || matchStatus !== 'in_progress'}
                className={`submit-btn ${matchFinished ? 'disabled' : ''}`}
              >
                {matchFinished ? '❌ Match Ended' : isSubmitting ? '⏳ Submitting...' : '✓ Submit'}
              </button>
              <button
                onClick={handleEndMatch}
                disabled={isSubmitting || isRunning || matchFinished || matchStatus !== 'in_progress'}
                className="end-match-btn"
              >
                🏁 End Match
              </button>
            </div>
          </div>

          <div className="editor-container">
            <Editor
              height="60vh"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="output-container">
            <div className="output-header">
              <h4>Output</h4>
            </div>
            <pre className="output-content">{output || 'Run or submit your code to see output...'}</pre>
            
            {/* Test Results Display */}
            {testResults && testResults.testResults && testResults.testResults.length > 0 && (
              <div className="test-results-panel">
                <h5 className="test-results-title">Test Results:</h5>
                <div className="test-results-grid">
                  {testResults.testResults.slice(0, 5).map((result, index) => (
                    <div 
                      key={index} 
                      className={`test-result-item ${result.passed ? 'passed' : 'failed'}`}
                    >
                      <span className="test-icon">{result.passed ? '✓' : '✗'}</span>
                      <span className="test-label">
                        {result.isSample ? 'Sample' : 'Hidden'} Test {result.testCaseIndex || index + 1}
                      </span>
                    </div>
                  ))}
                  {testResults.testResults.length > 5 && (
                    <div className="test-result-item more">
                      <span className="test-label">
                        +{testResults.testResults.length - 5} more tests...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDuelIDE;

