import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MdTimer, 
  MdPlayArrow, 
  MdCheck, 
  MdClose,
  MdCode,
  MdMemory,
  MdAssignment,
  MdLeaderboard,
  MdArrowBack
} from 'react-icons/md';
import BackButton from './BackButton';

const ContestInterface = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [submissions, setSubmissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [contestStatus, setContestStatus] = useState('loading');

  useEffect(() => {
    fetchContestData();
    const timer = setInterval(() => {
      updateTimeRemaining();
    }, 1000);

    return () => clearInterval(timer);
  }, [contestId]);

  const fetchContestData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to participate in contests');
        navigate('/login');
        return;
      }

      // Fetch contest questions
      const response = await fetch(`/api/contests/${contestId}/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch contest data');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setContest(data.contestInfo);
      
      // Set initial language
      if (data.contestInfo.allowedLanguages && data.contestInfo.allowedLanguages.length > 0) {
        setSelectedLanguage(data.contestInfo.allowedLanguages[0]);
      }

      updateContestStatus(data.contestInfo);
    } catch (error) {
      console.error('Failed to fetch contest data:', error);
      alert(error.message || 'Failed to load contest data');
      navigate('/challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const updateContestStatus = (contestInfo) => {
    const now = new Date();
    const startTime = new Date(contestInfo.startTime);
    const endTime = new Date(contestInfo.endTime);

    if (now < startTime) {
      setContestStatus('upcoming');
      setTimeRemaining(startTime - now);
    } else if (now >= startTime && now <= endTime) {
      setContestStatus('active');
      setTimeRemaining(endTime - now);
    } else {
      setContestStatus('ended');
      setTimeRemaining(0);
    }
  };

  const updateTimeRemaining = () => {
    if (!contest) return;

    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (now < startTime) {
      setContestStatus('upcoming');
      setTimeRemaining(startTime - now);
    } else if (now >= startTime && now <= endTime) {
      setContestStatus('active');
      setTimeRemaining(endTime - now);
    } else {
      setContestStatus('ended');
      setTimeRemaining(0);
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/contests/${contestId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: currentQuestion.questionId,
          code: code,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit solution');
      }

      const result = await response.json();
      
      // Update submissions state
      setSubmissions(prev => ({
        ...prev,
        [currentQuestion.questionId]: {
          status: result.status,
          points: result.points,
          testResults: result.testResults,
          alreadySolved: result.alreadySolved
        }
      }));

      // Show result
      const message = result.status === 'accepted' 
        ? `✅ Correct! You earned ${result.points} points!`
        : `❌ Wrong Answer. ${result.testResults?.filter(t => !t.passed)?.length || 0} test cases failed.`;
      
      alert(message);

    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex] || null;
  };

  const getQuestionStatus = (questionId) => {
    const submission = submissions[questionId];
    if (!submission) return 'unsolved';
    return submission.status === 'accepted' ? 'solved' : 'attempted';
  };

  const getLanguageDisplayName = (lang) => {
    const langMap = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C'
    };
    return langMap[lang] || lang;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Contest...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton to="/contests" text="Exit Contest" />
              <div>
                <h1 className="text-2xl font-bold text-white">{contest?.title}</h1>
                <p className="text-gray-300 text-sm">Contest ID: {contestId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                contestStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                contestStatus === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                <MdTimer className="w-5 h-5" />
                <span className="font-mono text-lg font-bold">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-sm">
                  {contestStatus === 'active' ? 'Remaining' :
                   contestStatus === 'upcoming' ? 'Starts in' : 'Ended'}
                </span>
              </div>

              {/* Leaderboard Button */}
              <button
                onClick={() => navigate(`/contest/${contestId}/leaderboard`)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <MdLeaderboard className="w-4 h-4" />
                <span>Leaderboard</span>
              </button>
            </div>
          </div>
        </div>

        {contestStatus !== 'active' && (
          <div className="bg-yellow-500/20 border-b border-yellow-500/30 p-4 text-center">
            <p className="text-yellow-300">
              {contestStatus === 'upcoming' 
                ? 'Contest has not started yet. Please wait...'
                : 'This contest has ended. You can view the results but cannot submit solutions.'}
            </p>
          </div>
        )}

        <div className="flex h-[calc(100vh-120px)]">
          {/* Question List Sidebar */}
          <div className="w-64 bg-black/20 backdrop-blur-md border-r border-white/10 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-4">Questions</h3>
              <div className="space-y-2">
                {questions.map((question, index) => {
                  const status = getQuestionStatus(question.questionId);
                  return (
                    <button
                      key={question.questionId}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        currentQuestionIndex === index
                          ? 'bg-violet-500/20 border border-violet-400/50'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {index + 1}. {question.title}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            status === 'solved' ? 'bg-green-400' :
                            status === 'attempted' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                          {status === 'solved' && <MdCheck className="w-4 h-4 text-green-400" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="text-gray-400 text-xs">{question.points} pts</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex">
            {/* Question Description */}
            <div className="flex-1 bg-black/10 overflow-y-auto">
              {currentQuestion && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {currentQuestionIndex + 1}. {currentQuestion.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span className={`px-2 py-1 rounded ${
                        currentQuestion.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        currentQuestion.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                      <span className="flex items-center space-x-1">
                        <MdTimer className="w-4 h-4" />
                        <span>{currentQuestion.timeLimit}ms</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MdMemory className="w-4 h-4" />
                        <span>{currentQuestion.memoryLimit}MB</span>
                      </span>
                      <span className="font-semibold text-violet-400">{currentQuestion.points} points</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                      <div className="bg-white/5 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                        {currentQuestion.description}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Constraints</h3>
                      <div className="bg-white/5 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                        {currentQuestion.constraints}
                      </div>
                    </div>

                    {currentQuestion.sampleTestCases && currentQuestion.sampleTestCases.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Sample Test Cases</h3>
                        {currentQuestion.sampleTestCases.map((testCase, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 mb-4">
                            <h4 className="text-white font-medium mb-3">Example {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-gray-400 text-sm font-medium mb-2">Input:</h5>
                                <pre className="bg-black/30 rounded p-3 text-green-400 text-sm overflow-x-auto">
                                  {testCase.input}
                                </pre>
                              </div>
                              <div>
                                <h5 className="text-gray-400 text-sm font-medium mb-2">Output:</h5>
                                <pre className="bg-black/30 rounded p-3 text-blue-400 text-sm overflow-x-auto">
                                  {testCase.output}
                                </pre>
                              </div>
                            </div>
                            {testCase.explanation && (
                              <div className="mt-3">
                                <h5 className="text-gray-400 text-sm font-medium mb-2">Explanation:</h5>
                                <p className="text-gray-300 text-sm">{testCase.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="w-1/2 bg-black/20 border-l border-white/10 flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                      disabled={contestStatus !== 'active'}
                    >
                      {contest?.allowedLanguages?.map(lang => (
                        <option key={lang} value={lang} className="bg-gray-800">
                          {getLanguageDisplayName(lang)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Write your ${getLanguageDisplayName(selectedLanguage)} solution here...`}
                  className="w-full h-full bg-black/30 border border-white/20 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-violet-400"
                  disabled={contestStatus !== 'active'}
                />
              </div>

              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting || contestStatus !== 'active'}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 ${
                    isSubmitting || contestStatus !== 'active'
                      ? 'bg-white/30 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 text-white'
                  }`}
                >
                  <MdPlayArrow className="w-5 h-5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Solution'}</span>
                </button>

                {submissions[currentQuestion?.questionId] && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Last Submission:</span>
                      <span className={`text-sm font-medium ${
                        submissions[currentQuestion.questionId].status === 'accepted' 
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {submissions[currentQuestion.questionId].status === 'accepted' 
                          ? '✅ Accepted' : '❌ Wrong Answer'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Points: {submissions[currentQuestion.questionId].points}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestInterface;