import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import BackButton from './BackButton';
import { 
  MdEmojiEvents, 
  MdTimer, 
  MdPeople, 
  MdPlayArrow,
  MdCode,
  MdAssignment,
  MdAdd,
  MdCalendarToday,
  // MdTrophy
} from 'react-icons/md';

const Contests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');
  const [contests, setContests] = useState({
    live: [],
    upcoming: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);

  // Sample data - replace with actual API calls
  const sampleContests = {
    live: [
      {
        id: 'contest-1',
        title: 'Weekly Algorithm Challenge',
        description: 'Test your algorithm skills with challenging problems',
        difficulty: 'Medium',
        participants: 1247,
        timeLeft: '2h 30m remaining',
        duration: '3h 00m',
        problems: 5,
        startTime: new Date(),
        endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
        status: 'live'
      },
      {
        id: 'contest-2',
        title: 'Speed Coding Sprint',
        description: 'Fast-paced coding challenge for quick thinkers',
        difficulty: 'Easy',
        participants: 892,
        timeLeft: '1h 15m remaining',
        duration: '2h 00m',
        problems: 4,
        startTime: new Date(),
        endTime: new Date(Date.now() + 1.25 * 60 * 60 * 1000),
        status: 'live'
      }
    ],
    upcoming: [
      {
        id: 'contest-3',
        title: 'Data Structures Master',
        description: 'Master advanced data structures and algorithms',
        difficulty: 'Hard',
        participants: 892,
        timeLeft: 'Starts in 2h',
        duration: '3h 00m',
        problems: 8,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        status: 'upcoming'
      },
      {
        id: 'contest-4',
        title: 'Championship Round',
        description: 'Compete for the grand prize in this championship',
        difficulty: 'Expert',
        participants: 2156,
        timeLeft: 'Starts tomorrow',
        duration: '4h 00m',
        problems: 12,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 28 * 60 * 60 * 1000),
        status: 'upcoming'
      },
      {
        id: 'contest-5',
        title: 'Beginner Friendly Contest',
        description: 'Perfect for newcomers to competitive programming',
        difficulty: 'Easy',
        participants: 450,
        timeLeft: 'Starts in 3 days',
        duration: '2h 00m',
        problems: 5,
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        status: 'upcoming'
      }
    ],
    completed: [
      {
        id: 'contest-6',
        title: 'Binary Search Mastery',
        description: 'Advanced binary search problems',
        difficulty: 'Medium',
        participants: 1876,
        timeLeft: 'Completed',
        duration: '2h 30m',
        problems: 6,
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000),
        status: 'completed'
      },
      {
        id: 'contest-7',
        title: 'Dynamic Programming Challenge',
        description: 'Solve complex DP problems',
        difficulty: 'Hard',
        participants: 1234,
        timeLeft: 'Completed',
        duration: '3h 00m',
        problems: 7,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        status: 'completed'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call - in production, replace with actual API call
    const loadContests = () => {
      setTimeout(() => {
        setContests(sampleContests);
        setLoading(false);
      }, 500);
    };
    
    loadContests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      case 'Expert': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'from-green-500 to-emerald-500';
      case 'upcoming': return 'from-blue-500 to-cyan-500';
      case 'completed': return 'from-gray-500 to-gray-600';
      default: return 'from-violet-500 to-fuchsia-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live': 
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full animate-pulse">● Live</span>;
      case 'upcoming': 
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Upcoming</span>;
      case 'completed': 
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Completed</span>;
      default: 
        return null;
    }
  };

  const handleContestAction = (contest) => {
    if (contest.status === 'live') {
      navigate(`/contest/${contest.id}`);
    } else if (contest.status === 'upcoming') {
      // Register for contest
      alert('Registration functionality coming soon!');
    } else {
      // View results/leaderboard
      navigate(`/contest/${contest.id}/leaderboard`);
    }
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
            <div className="flex items-center space-x-6">
              <BackButton to="/dashboard" text="Back to Dashboard" />
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  Contests
                </h1>
                <p className="text-gray-300 mt-2">Compete in coding contests and climb the leaderboard</p>
              </div>
            </div>
            <DashboardNavbar />
          </div>
        </div>

        <div className="p-6">
          {/* Tabs and Create Contest Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 w-fit">
              {[
                { key: 'live', label: 'Live Contests', count: contests.live.length, icon: <MdTimer className="w-4 h-4" /> },
                { key: 'upcoming', label: 'Upcoming', count: contests.upcoming.length, icon: <MdCalendarToday className="w-4 h-4" /> },
                { key: 'completed', label: 'Completed', count: contests.completed.length, icon: <MdTrophy className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label} ({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/join-contest')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <MdPlayArrow className="w-5 h-5" />
                <span>Join Contest</span>
              </button>
              <button
                onClick={() => navigate('/create-contest')}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create Contest</span>
              </button>
            </div>
          </div>

          {/* Contests Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-white text-xl">Loading contests...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests[activeTab]?.map((contest) => (
                <div
                  key={contest.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2 flex-1">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getStatusColor(contest.status)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          {contest.status === 'live' ? (
                            <MdCode className="w-5 h-5 text-white" />
                          ) : contest.status === 'upcoming' ? (
                            <MdAssignment className="w-5 h-5 text-white" />
                          ) : (
                            <MdEmojiEvents className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                            {contest.title}
                          </h4>
                          <p className="text-sm text-gray-400">{contest.timeLeft}</p>
                        </div>
                      </div>
                      {getStatusBadge(contest.status)}
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2">
                      {contest.description}
                    </p>

                    {/* Difficulty Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(contest.difficulty)}`}>
                        {contest.difficulty}
                      </span>
                      <span className="text-gray-400 text-sm">{contest.problems} problems</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <MdPeople className="w-4 h-4" />
                          <span>{contest.participants.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <MdTimer className="w-4 h-4" />
                          <span>{contest.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {contest.status === 'live' ? (
                        <button
                          onClick={() => handleContestAction(contest)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105"
                        >
                          <MdPlayArrow className="w-4 h-4" />
                          <span>Join Now</span>
                        </button>
                      ) : contest.status === 'upcoming' ? (
                        <button
                          onClick={() => handleContestAction(contest)}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105"
                        >
                          <MdCalendarToday className="w-4 h-4" />
                          <span>Register</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleContestAction(contest)}
                          className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105"
                        >
                          <MdTrophy className="w-4 h-4" />
                          <span>View Results</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && contests[activeTab] && contests[activeTab].length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">
                No {activeTab} contests available
              </div>
              <p className="text-gray-500 mb-6">
                Check back later or create your own contest!
              </p>
              <button
                onClick={() => navigate('/create-contest')}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2"
              >
                <MdAdd className="w-5 h-5" />
                <span>Create Contest</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contests;
