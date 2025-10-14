import React, { useState } from 'react';
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
  MdAssignment
} from 'react-icons/md';

const Challenges = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ongoing');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');

  const challenges = {
    ongoing: [
      {
        id: 'challenge-1',
        title: 'Weekly Coding Challenge',
        description: 'Solve 5 problems this week to win exclusive rewards',
        difficulty: 'Medium',
        participants: 1250,
        timeLeft: '3 days left',
        reward: '500 coins + Premium Badge',
        problems: 5,
        solved: 0,
        type: 'weekly'
      },
      {
        id: 'challenge-2',
        title: 'Algorithm Master',
        description: 'Master advanced algorithms in 30 days',
        difficulty: 'Hard',
        participants: 890,
        timeLeft: '15 days left',
        reward: '1000 coins + Master Badge',
        problems: 20,
        solved: 3,
        type: 'monthly'
      }
    ],
    upcoming: [
      {
        id: 'challenge-3',
        title: 'Data Structures Sprint',
        description: 'Complete all DSA sheet problems in 2 weeks',
        difficulty: 'Medium',
        participants: 0,
        timeLeft: 'Starts in 2 days',
        reward: '750 coins + Sprint Badge',
        problems: 15,
        solved: 0,
        type: 'sprint'
      },
      {
        id: 'challenge-4',
        title: 'Beginner Friendly',
        description: 'Perfect for newcomers to coding challenges',
        difficulty: 'Easy',
        participants: 0,
        timeLeft: 'Starts in 1 week',
        reward: '200 coins + Beginner Badge',
        problems: 8,
        solved: 0,
        type: 'beginner'
      }
    ],
    completed: [
      {
        id: 'challenge-5',
        title: 'Array Mastery',
        description: 'Master array manipulation techniques',
        difficulty: 'Medium',
        participants: 2100,
        timeLeft: 'Completed',
        reward: '300 coins + Array Badge',
        problems: 10,
        solved: 10,
        type: 'completed'
      }
    ]
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'weekly': return '📅';
      case 'monthly': return '📆';
      case 'sprint': return '🏃';
      case 'beginner': return '🌱';
      case 'completed': return '✅';
      default: return '🎯';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'weekly': return 'from-blue-500 to-cyan-500';
      case 'monthly': return 'from-purple-500 to-violet-500';
      case 'sprint': return 'from-orange-500 to-red-500';
      case 'beginner': return 'from-green-500 to-emerald-500';
      case 'completed': return 'from-gray-500 to-gray-600';
      default: return 'from-violet-500 to-fuchsia-500';
    }
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createRoom = () => {
    const roomId = generateRoomId();
    const finalRoomName = roomName.trim() || `Room ${roomId.substring(0, 8)}`;
    
    // Store the room name in localStorage so ChallengeRoom can access it
    localStorage.setItem(`roomName_${roomId}`, finalRoomName);
    
    navigate(`/challenge-room/${roomId}`);
  };

  const joinRoom = () => {
    if (!joinRoomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    navigate(`/challenge-room/${joinRoomId.trim()}`);
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
                  Challenges
                </h1>
                <p className="text-gray-300 mt-2">Compete with others and earn rewards</p>
              </div>
            </div>
            <DashboardNavbar />
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 mb-8 w-fit">
            {[
              { key: 'ongoing', label: 'Ongoing', count: challenges.ongoing.length },
              { key: 'upcoming', label: 'Upcoming', count: challenges.upcoming.length },
              { key: 'completed', label: 'Completed', count: challenges.completed.length },
              { key: 'one-vs-one', label: 'One vs One', count: 0 },
              { key: 'contest', label: 'Create Contest', count: 0 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges[activeTab]?.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 group"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getTypeIcon(challenge.type)}</span>
                        <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {challenge.title}
                        </h3>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">
                        {challenge.solved}/{challenge.problems}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getTypeColor(challenge.type)}`}
                        style={{ width: `${(challenge.solved / challenge.problems) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round((challenge.solved / challenge.problems) * 100)}% Complete
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <MdPeople className="w-4 h-4" />
                      <span>{challenge.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <MdTimer className="w-4 h-4" />
                      <span>{challenge.timeLeft}</span>
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="bg-violet-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-violet-300 text-sm">
                      <MdStar className="w-4 h-4" />
                      <span className="font-medium">Reward: {challenge.reward}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {challenge.type === 'completed' ? (
                      <button
                        disabled
                        className="w-full bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 cursor-not-allowed"
                      >
                        <MdStar className="w-4 h-4" />
                        <span>Completed</span>
                      </button>
                    ) : challenge.type === 'upcoming' ? (
                      <button
                        disabled
                        className="w-full bg-white/10 text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 cursor-not-allowed"
                      >
                        <MdTimer className="w-4 h-4" />
                        <span>Coming Soon</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/dsa-sheet')}
                        className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105"
                      >
                        <MdPlayArrow className="w-4 h-4" />
                        <span>Start Challenge</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contest Tab */}
          {activeTab === 'contest' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-2">
                  Contest Hub
                </h2>
                <p className="text-gray-300">Create and manage coding contests</p>
              </div>

              {/* Available Contests Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Available Contests</h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300">
                      <MdTimer className="w-4 h-4 inline mr-2" />
                      Live
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300">
                      <MdAssignment className="w-4 h-4 inline mr-2" />
                      Upcoming
                    </button>
                  </div>
                </div>

                {/* Contest Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sample Contest Cards */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <MdCode className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Weekly Algorithm Challenge</h4>
                          <p className="text-sm text-gray-400">Live Now</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Live</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">2h 30m</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Participants</span>
                        <span className="text-white">1,247</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Problems</span>
                        <span className="text-white">5</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                      Join Contest
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <MdAssignment className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Data Structures Master</h4>
                          <p className="text-sm text-gray-400">Starts in 2h</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Upcoming</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">3h 00m</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Participants</span>
                        <span className="text-white">892</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Problems</span>
                        <span className="text-white">8</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                      Register
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                          <MdEmojiEvents className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Championship Round</h4>
                          <p className="text-sm text-gray-400">Starts tomorrow</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Upcoming</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">4h 00m</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Participants</span>
                        <span className="text-white">2,156</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Problems</span>
                        <span className="text-white">12</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                      Register
                    </button>
                  </div>
                </div>
              </div>

              {/* Create Contest Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Create New Contest</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105">
                    <MdCode className="w-4 h-4 inline mr-2" />
                    Quick Create
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Contest Name *</label>
                        <input
                          type="text"
                          placeholder="Enter contest name"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                        <textarea
                          placeholder="Describe your contest..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 resize-none transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Contest Type</label>
                        <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400 transition-all duration-300">
                          <option value="individual">Individual</option>
                          <option value="team">Team</option>
                          <option value="practice">Practice</option>
                          <option value="rated">Rated</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty Level</label>
                        <div className="flex space-x-2">
                          {['Easy', 'Medium', 'Hard', 'Expert'].map((level) => (
                            <button
                              key={level}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                level === 'Medium'
                                  ? 'bg-violet-500 text-white'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Contest Settings */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Contest Settings</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Duration (hours)</label>
                          <input
                            type="number"
                            placeholder="2"
                            min="0.5"
                            max="24"
                            step="0.5"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Max Participants</label>
                          <input
                            type="number"
                            placeholder="1000"
                            min="1"
                            max="10000"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Registration Deadline</label>
                        <input
                          type="datetime-local"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Programming Languages</label>
                        <div className="flex flex-wrap gap-2">
                          {['C++', 'Java', 'Python', 'JavaScript', 'C#', 'Go'].map((lang) => (
                            <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={['C++', 'Java', 'Python'].includes(lang)}
                                className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-400"
                              />
                              <span className="text-gray-300 text-sm">{lang}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Scoring System</label>
                        <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400 transition-all duration-300">
                          <option value="acm">ACM Style</option>
                          <option value="ioi">IOI Style</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">Advanced Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="allow-upsolving"
                          className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-400"
                        />
                        <label htmlFor="allow-upsolving" className="text-gray-300 text-sm">
                          Allow upsolving after contest
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="show-rankings"
                          className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-400"
                          defaultChecked
                        />
                        <label htmlFor="show-rankings" className="text-gray-300 text-sm">
                          Show real-time rankings
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="allow-hacks"
                          className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-400"
                        />
                        <label htmlFor="allow-hacks" className="text-gray-300 text-sm">
                          Allow hacking phase
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300">
                      Save as Draft
                    </button>
                    <button className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105">
                      Create Contest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* One vs One Tab */}
          {activeTab === 'one-vs-one' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">One vs One Challenges</h2>
                <p className="text-gray-300">Challenge other users to coding duels</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create Challenge */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:border-violet-400/50 transition-all duration-300 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl mb-6">
                    ⚔️
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Create Challenge</h3>
                  <p className="text-gray-300 mb-6">
                    Create a new one vs one challenge room and invite friends to compete
                  </p>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name (optional)"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400"
                    />
                    <button
                      onClick={createRoom}
                      className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      Create Room
                    </button>
                    <p className="text-gray-400 text-sm text-center">
                      A unique room ID will be generated for sharing
                    </p>
                  </div>
                </div>

                {/* Join Challenge */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 hover:border-violet-400/50 transition-all duration-300 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-4xl mb-6">
                    🎯
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Join Challenge</h3>
                  <p className="text-gray-300 mb-6">
                    Join an existing challenge room using the room ID
                  </p>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      placeholder="Enter room ID"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400"
                    />
                    <button
                      onClick={joinRoom}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Duels */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Active Duels</h3>
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-2">No active duels</div>
                    <p className="text-gray-500">Create or join a challenge to start competing!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeTab !== 'one-vs-one' && activeTab !== 'contest' && challenges[activeTab] && challenges[activeTab].length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">
                No {activeTab} challenges available
              </div>
              <p className="text-gray-500">
                Check back later for new challenges!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
