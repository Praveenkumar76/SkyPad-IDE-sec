import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import BackButton from './BackButton';
import { 
  MdEmojiEvents, 
  MdTimer, 
  MdPeople, 
  MdStar, 
  MdPlayArrow,
  MdCode,
  MdAssignment,
  MdAdd,
  MdSchedule,
  MdLock,
  MdPublic
} from 'react-icons/md';

const Contests = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState('all'); // all, live, upcoming, completed

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/contests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contests');
      }

      const data = await response.json();
      setContests(data.contests || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      // For now, use mock data if API fails
      setContests([
        {
          id: 'contest-1',
          title: 'Weekly Algorithm Challenge',
          description: 'Test your algorithmic skills with our weekly contest',
          difficulty: 'Medium',
          participants: 1250,
          maxParticipants: 2000,
          timeLeft: '2 hours left',
          status: 'live',
          problems: 5,
          duration: '2 hours',
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          endTime: new Date(Date.now() + 90 * 60 * 1000), // 90 minutes from now
          isPasswordProtected: false,
          isPublic: true,
          creator: 'Admin'
        },
        {
          id: 'contest-2',
          title: 'Data Structures Master',
          description: 'Master data structures with challenging problems',
          difficulty: 'Hard',
          participants: 0,
          maxParticipants: 500,
          timeLeft: 'Starts in 2 days',
          status: 'upcoming',
          problems: 8,
          duration: '3 hours',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours after start
          isPasswordProtected: true,
          isPublic: true,
          creator: 'Moderator'
        },
        {
          id: 'contest-3',
          title: 'Beginner Friendly Contest',
          description: 'Perfect for newcomers to competitive programming',
          difficulty: 'Easy',
          participants: 2100,
          maxParticipants: 3000,
          timeLeft: 'Completed',
          status: 'completed',
          problems: 6,
          duration: '1.5 hours',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours after start
          isPasswordProtected: false,
          isPublic: true,
          creator: 'Admin'
        }
      ]);
    } finally {
      setIsLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'text-green-400 bg-green-500/20';
      case 'upcoming': return 'text-blue-400 bg-blue-500/20';
      case 'completed': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredContests = contests.filter(contest => {
    if (filter === 'all') return true;
    return contest.status === filter;
  });

  const handleJoinContest = (contestId) => {
    navigate(`/contest/${contestId}`);
  };

  const handleCreateContest = () => {
    navigate('/create-contest');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <DashboardNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading contests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavbar />
      
      <div className="pt-20 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <BackButton />
            <div className="text-center mt-6">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-2">
                Contest Hub
              </h1>
              <p className="text-gray-300 text-lg">Join coding contests and compete with developers worldwide</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filter === 'all' 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                All Contests
              </button>
              <button
                onClick={() => setFilter('live')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filter === 'live' 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <MdTimer className="w-4 h-4 inline mr-2" />
                Live
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filter === 'upcoming' 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <MdSchedule className="w-4 h-4 inline mr-2" />
                Upcoming
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  filter === 'completed' 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <MdAssignment className="w-4 h-4 inline mr-2" />
                Completed
              </button>
            </div>
            
            <button
              onClick={handleCreateContest}
              className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-violet-500/25"
            >
              <MdAdd className="w-5 h-5" />
              <span>Create Contest</span>
            </button>
          </div>

          {/* Contests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => (
              <div key={contest.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <MdEmojiEvents className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                        {contest.title}
                      </h4>
                      <p className="text-sm text-gray-400">by {contest.creator}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(contest.status)}`}>
                      {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                    </span>
                    {contest.isPasswordProtected && (
                      <MdLock className="w-4 h-4 text-yellow-400" />
                    )}
                    {contest.isPublic && (
                      <MdPublic className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {contest.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Difficulty</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(contest.difficulty)}`}>
                      {contest.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Problems</span>
                    <span className="text-white">{contest.problems}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">{contest.duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Participants</span>
                    <span className="text-white">{contest.participants}/{contest.maxParticipants}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white">{contest.timeLeft}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {contest.status === 'live' && (
                    <button
                      onClick={() => handleJoinContest(contest.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <MdPlayArrow className="w-4 h-4" />
                      <span>Join Now</span>
                    </button>
                  )}
                  
                  {contest.status === 'upcoming' && (
                    <button
                      onClick={() => handleJoinContest(contest.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <MdSchedule className="w-4 h-4" />
                      <span>Register</span>
                    </button>
                  )}
                  
                  {contest.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/contest/${contest.id}/leaderboard`)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <MdStar className="w-4 h-4" />
                      <span>View Results</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredContests.length === 0 && (
            <div className="text-center py-12">
              <MdEmojiEvents className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No contests found</h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'No contests are available at the moment.' 
                  : `No ${filter} contests found.`}
              </p>
              <button
                onClick={handleCreateContest}
                className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-violet-500/25 mx-auto"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create First Contest</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contests;
