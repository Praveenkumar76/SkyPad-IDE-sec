import { API_BASE_URL } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import { dsaSheetData } from '../data/dsaSheetData';
import { 
  MdCheckCircle, 
  MdCircle, 
  MdPlayArrow, 
  MdTrendingUp,
  MdTimer,
  MdCode,
  MdAssignment,
  MdRefresh,
  MdArrowBack
} from 'react-icons/md';

const DSASheet = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [progress, setProgress] = useState({});
  const [topicProblems, setTopicProblems] = useState({});  // Store problems from DB
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch everything from database
    fetchSolvedProblems();
    fetchAllProblems();
    
    // Listen for custom DSA problems update event (when new problem is uploaded)
    const handleDSAUpdate = () => {
      fetchAllProblems();
      fetchSolvedProblems();
    };
    
    window.addEventListener('dsaProblemsUpdated', handleDSAUpdate);
    return () => {
      window.removeEventListener('dsaProblemsUpdated', handleDSAUpdate);
    };
  }, []);

  const fetchSolvedProblems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/solved`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSolvedProblems(new Set(data.solvedProblems || []));
        
        // Also sync to localStorage
        localStorage.setItem('solvedProblems', JSON.stringify(data.solvedProblems || []));
      }
    } catch (error) {
      console.error('Error fetching solved problems:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('solvedProblems');
      if (saved) {
        setSolvedProblems(new Set(JSON.parse(saved)));
      }
    }
  };

  const fetchAllProblems = async () => {
    try {
      setLoading(true);
      // Fetch ALL problems from database (public endpoint, no auth needed)
      // Backend defaults to limit=10000
      const response = await fetch(`${API_BASE_URL}/problems`);
      
      if (response.ok) {
        const data = await response.json();
        const problems = data.problems || [];
        console.log(`✅ DSA Sheet: Loaded ${problems.length} problems from database (all users' uploads)`);
        console.log(`📊 Total in DB: ${data.total || 0}`);
        
        const tagToTopic = {
          'recursion': 'recursion',
          'linkedlist': 'linkedlist',
          'array': 'array',
          'string': 'string',
          'stack': 'stack',
          'queue': 'queue',
          'tree': 'tree',
          'graph': 'graph',
          'dynamic-programming': 'dynamic-programming',
          'dp': 'dynamic-programming',
          'greedy': 'greedy'
        };

        // Organize problems by topic based on tags (from DATABASE, not localStorage)
        const dsaProblems = {};
        
        problems.forEach(problem => {
          const tags = problem.tags || [];
          for (const tag of tags) {
            const lowerTag = tag.toLowerCase().trim();
            if (tagToTopic[lowerTag]) {
              const matchedTopic = tagToTopic[lowerTag];
              if (!dsaProblems[matchedTopic]) {
                dsaProblems[matchedTopic] = [];
              }
              
              // Check if problem already exists in this topic
              const exists = dsaProblems[matchedTopic].some(p => p.id === problem._id);
              if (!exists) {
                dsaProblems[matchedTopic].push({
                  id: problem._id,
                  title: problem.title,
                  difficulty: problem.difficulty,
                  description: problem.description,
                  constraints: problem.constraints,
                  sampleTestCases: problem.sampleTestCases || [],
                  hiddenTestCases: problem.hiddenTestCases || [],
                  allowedLanguages: problem.allowedLanguages || ['JavaScript'],
                  timeLimit: problem.timeLimit,
                  memoryLimit: problem.memoryLimit,
                  createdBy: problem.createdBy
                });
              }
              break; // Only add to first matching topic
            }
          }
        });

        setTopicProblems(dsaProblems);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Calculate progress for each topic based on problems from DATABASE
    const newProgress = {};
    dsaSheetData.topics.forEach(topic => {
      const topicProbs = topicProblems[topic.id] || [];
      const solved = topicProbs.filter(p => solvedProblems.has(p.id)).length;
      newProgress[topic.id] = {
        solved,
        total: topicProbs.length,
        percentage: topicProbs.length > 0 ? Math.round((solved / topicProbs.length) * 100) : 0
      };
    });
    setProgress(newProgress);
  }, [solvedProblems, topicProblems]);

  // Add a refresh function that can be called manually
  const refreshDSASheet = async () => {
    await fetchAllProblems();
    await fetchSolvedProblems();
  };

  const handleProblemClick = (problemId) => {
    navigate(`/solve/${problemId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 70) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-gray-600';
  };

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
                  DSA Sheet
                </h1>
                <p className="text-gray-300 mt-2">Master Data Structures and Algorithms systematically</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Clear Cache Button */}
              <button
                onClick={() => {
                  if (confirm('Clear old cache and reload from database?')) {
                    localStorage.removeItem('dsaProblems');
                    console.log('✅ Cleared cache, reloading from MongoDB...');
                    refreshDSASheet();
                    alert('Cache cleared! Loading fresh data from database.');
                  }
                }}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                title="Clear old cache"
              >
                <MdRefresh className="w-4 h-4" />
                <span>Clear Cache</span>
              </button>
              
              <button
                onClick={refreshDSASheet}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <MdRefresh className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <DashboardNavbar />
            </div>
          </div>
        </div>

        <div className="p-6">
          {!selectedTopic ? (
            /* Topics Grid */
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Choose a Topic to Start</h2>
                <p className="text-gray-300">Select any topic to view problems and track your progress</p>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4 max-w-2xl mx-auto">
                  <p className="text-green-300 text-sm">
                    ✅ <strong>Input sanitization enabled:</strong> Test inputs are automatically cleaned for easier parsing with simple methods like <code className="bg-black/30 px-1 rounded">list(map(int, input().split()))</code>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {dsaSheetData.topics.map((topic) => {
                  const topicProgress = progress[topic.id] || { solved: 0, total: 0, percentage: 0 };
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                    >
                      <div className="text-center space-y-4">
                        {/* Topic Icon */}
                        <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-3xl shadow-lg`}>
                          {topic.icon}
                        </div>

                        {/* Topic Name */}
                        <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {topic.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {topic.description}
                        </p>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white font-medium">
                              {topicProgress.solved}/{topicProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(topicProgress.percentage)}`}
                              style={{ width: `${topicProgress.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {topicProgress.percentage}% Complete
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MdCode className="w-3 h-3" />
                            <span>{topicProgress.total} Problems</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MdCheckCircle className="w-3 h-3 text-green-400" />
                            <span>{topicProgress.solved} Solved</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Problems List */
            <div className="space-y-6">
              {/* Back Button and Topic Header */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dsaSheetData.topics.find(t => t.id === selectedTopic)?.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {dsaSheetData.topics.find(t => t.id === selectedTopic)?.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {dsaSheetData.topics.find(t => t.id === selectedTopic)?.name}
                      </h2>
                      <p className="text-gray-300">
                        {dsaSheetData.topics.find(t => t.id === selectedTopic)?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {progress[selectedTopic]?.solved || 0}/{progress[selectedTopic]?.total || 0}
                  </div>
                  <div className="text-sm text-gray-400">Problems Solved</div>
                </div>
              </div>

              {/* Problems List */}
              <div className="space-y-3">
                {(() => {
                  // Get problems from DATABASE based on selected topic
                  const topicProbs = topicProblems[selectedTopic] || [];
                  
                  if (topicProbs.length === 0) {
                    return (
                      <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
                        <p className="text-gray-400 mb-2">No problems found for this topic yet.</p>
                        <p className="text-gray-500 text-sm">Upload a problem with the "{selectedTopic}" tag to see it here!</p>
                      </div>
                    );
                  }
                  
                  return topicProbs.map((problem, index) => {
                  const isSolved = solvedProblems.has(problem.id);
                  return (
                    <div
                      key={problem.id}
                      className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 group ${
                        isSolved ? 'border-green-400/50 hover:border-green-400' : 'border-white/20 hover:border-violet-400/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Problem Number */}
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-sm">
                            {index + 1}
                          </div>

                          {/* Problem Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                                {problem.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                              {isSolved && (
                                <MdCheckCircle className="w-5 h-5 text-green-400" />
                              )}
                            </div>
                            <p className="text-gray-300 text-sm">
                              {problem.description}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleProblemClick(problem.id)}
                            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 hover:scale-105"
                          >
                            <MdPlayArrow className="w-4 h-4" />
                            <span>Solve</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                  });
                })()}
              </div>

              {/* Topic Progress Bar */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Topic Progress</h3>
                  <span className="text-violet-400 font-bold">
                    {progress[selectedTopic]?.percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(progress[selectedTopic]?.percentage || 0)}`}
                    style={{ width: `${progress[selectedTopic]?.percentage || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>{progress[selectedTopic]?.solved || 0} solved</span>
                  <span>{progress[selectedTopic]?.total || 0} total</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DSASheet;
