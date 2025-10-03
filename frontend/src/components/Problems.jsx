import { API_BASE_URL } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import { 
  MdSearch, 
  MdCode, 
  MdTimer, 
  MdMemory, 
  MdTag, 
  MdPerson,
  MdPlayArrow,
  MdRefresh,
  MdArrowBack,
  MdCheckCircle
} from 'react-icons/md';

const Problems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [error, setError] = useState('');
  const [solvedProblems, setSolvedProblems] = useState(new Set());

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    fetchProblems();
    fetchSolvedProblems();
    
    // Listen for new problem uploads
    const handleProblemUpdate = () => {
      fetchProblems();
      fetchSolvedProblems();
    };
    
    window.addEventListener('dsaProblemsUpdated', handleProblemUpdate);
    return () => window.removeEventListener('dsaProblemsUpdated', handleProblemUpdate);
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
        
        // Also sync to localStorage for offline access
        localStorage.setItem('solvedProblems', JSON.stringify(data.solvedProblems || []));
      }
    } catch (error) {
      console.error('Error fetching solved problems:', error);
      // Fallback to localStorage
      const localSolved = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
      setSolvedProblems(new Set(localSolved));
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      // Fetch ALL problems from database (public endpoint, visible to all users)
      // Backend now defaults to limit=10000, so no need to specify
      const response = await fetch(`${API_BASE_URL}/problems`);
      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      const data = await response.json();
      setProblems(data.problems || []);
      console.log(`✅ Loaded ${data.problems?.length || 0} problems from database (public, all users' uploads)`);
      console.log(`📊 Total in DB: ${data.total || 0}`);
    } catch (err) {
      setError('Failed to load problems');
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢';
      case 'Medium': return '🟡';
      case 'Hard': return '🔴';
      default: return '⚪';
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (problem.tags && problem.tags.some(tag => 
                           tag.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading problems...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>
      
      <div className="relative z-10">
        {/* Main Content Area */}
        <div className="p-6">
          {/* Header and Search */}
          <div className="flex items-center justify-between mb-8">
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
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  All Problems
                </h2>
                <p className="text-gray-300 mt-2">Solve coding challenges and improve your skills</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Clear Cache Button (temporary debug) */}
              <button
                onClick={() => {
                  if (confirm('Clear old localStorage cache and reload fresh data from database?')) {
                    localStorage.removeItem('dsaProblems');
                    console.log('✅ Cleared dsaProblems cache');
                    fetchProblems();
                    fetchSolvedProblems();
                    window.dispatchEvent(new CustomEvent('dsaProblemsUpdated'));
                    alert('Cache cleared! Data is now loading from MongoDB database.');
                  }
                }}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                title="Clear old cache and fetch from database"
              >
                <MdRefresh className="w-4 h-4" />
                <span>Clear Cache</span>
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={() => {
                  fetchProblems();
                  fetchSolvedProblems();
                  window.dispatchEvent(new CustomEvent('dsaProblemsUpdated'));
                }}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                title="Refresh problems from database"
              >
                <MdRefresh className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 backdrop-blur-md text-white placeholder-gray-300 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-violet-400 w-64"
                />
                <MdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
              </div>
              
              <DashboardNavbar />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">Difficulty:</span>
              <div className="flex space-x-2">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      difficultyFilter === diff
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {diff !== 'All' && getDifficultyIcon(diff)} {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          {/* Problems Grid */}
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">
                {searchTerm || difficultyFilter !== 'All' 
                  ? 'No problems found matching your criteria' 
                  : 'No problems available yet'
                }
              </div>
              <button
                onClick={() => navigate('/upload-question')}
                className="btn-primary px-6 py-3 rounded-lg font-medium"
              >
                Upload First Problem
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProblems.map((problem) => {
                const isSolved = solvedProblems.has(problem._id);
                return (
                <div
                  key={problem._id}
                  className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:scale-105 cursor-pointer group ${
                    isSolved ? 'border-green-400/50 hover:border-green-400' : 'border-white/20 hover:border-violet-400/50'
                  }`}
                  onClick={() => navigate(`/solve/${problem._id}`)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                            {problem.title}
                          </h3>
                          {isSolved && <MdCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          <div className="flex items-center space-x-1 text-gray-400 text-xs">
                            <MdPerson className="w-3 h-3" />
                            <span>{problem.createdBy?.username || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl">
                        {getDifficultyIcon(problem.difficulty)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {problem.description}
                    </p>

                    {/* Constraints */}
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MdTimer className="w-3 h-3" />
                        <span>{problem.timeLimit}ms</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MdMemory className="w-3 h-3" />
                        <span>{problem.memoryLimit}MB</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-xs flex items-center space-x-1"
                          >
                            <MdTag className="w-2 h-2" />
                            <span>{tag.toLowerCase()}</span>
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                            +{problem.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1">
                      {problem.allowedLanguages.slice(0, 3).map((lang, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                        >
                          {lang}
                        </span>
                      ))}
                      {problem.allowedLanguages.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                          +{problem.allowedLanguages.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Solve Button */}
                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/solve/${problem._id}`);
                        }}
                        className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 ${
                          isSolved 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white'
                        }`}
                      >
                        {isSolved ? (
                          <>
                            <MdCheckCircle className="w-4 h-4" />
                            <span>Solved ✓</span>
                          </>
                        ) : (
                          <>
                            <MdPlayArrow className="w-4 h-4" />
                            <span>Solve Problem</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-gray-400">
                Showing {filteredProblems.length} of {problems.length} problems
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <MdCheckCircle className="w-4 h-4" />
                <span>{solvedProblems.size} Solved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problems;