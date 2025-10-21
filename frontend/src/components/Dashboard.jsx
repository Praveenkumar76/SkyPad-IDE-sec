import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import Footer from './Footer';
import { dashboardData } from '../data/dashboardData';
import { userAPI } from '../utils/api';
import { 
  MdCalendarToday,
  MdEmail,
  MdMonitor,
  MdPieChart,
  MdCheckCircle,
  MdDownload,
  MdEmojiEvents,
  MdSearch,
  MdTrendingUp,
  MdCode,
  MdAssignment,
  MdPerson,
  MdArrowDropDown,
  MdSettings,
  MdLogout,
  MdAccountCircle
} from 'react-icons/md';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const userMenuRef = useRef(null);
  
  // Get user data from localStorage or context (you can modify this based on your auth system)
  const [userData, setUserData] = useState(() => {
    // Safe localStorage access
    if (typeof window !== 'undefined') {
      return {
        name: localStorage.getItem('userName') || 'John Durairaj',
        email: localStorage.getItem('userEmail') || 'john.durairaj@email.com',
        avatar: localStorage.getItem('userAvatar') || 'JD'
      };
    }
    return {
      name: 'John Durairaj',
      email: 'john.durairaj@email.com',
      avatar: 'JD'
    };
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (token) {
          const profileData = await userAPI.getProfile();
          console.log('Profile data received:', profileData); // Debug log
          setUserData({
            name: profileData.fullName || 'User',
            email: profileData.email || '',
            avatar: profileData.fullName ? profileData.fullName.substring(0, 2).toUpperCase() : 'U',
            profilePictureUrl: profileData.profilePictureUrl || null,
          });
          // Update localStorage with fresh data
          if (profileData.fullName) localStorage.setItem('userName', profileData.fullName);
          if (profileData.email) localStorage.setItem('userEmail', profileData.email);
          if (profileData.fullName) localStorage.setItem('userAvatar', profileData.fullName.substring(0, 2).toUpperCase());
          if (profileData.profilePictureUrl) {
            localStorage.setItem('userProfilePicture', profileData.profilePictureUrl);
          } else {
            localStorage.removeItem('userProfilePicture');
          }
        } else {
          // No token, redirect to login
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setError('Failed to load profile data');
        // If token is invalid, redirect to login
        if (error.message.includes('token') || error.message.includes('unauthorized')) {
          localStorage.clear();
          navigate('/login');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusConfig = (statusColor) => {
    const configs = {
      green: 'bg-green-500/20 text-green-400',
      blue: 'bg-blue-500/20 text-blue-400',
      gray: 'bg-gray-500/20 text-gray-400'
    };
    return configs[statusColor] || configs.gray;
  };

  const getDifficultyBarColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/30 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/30 to-black flex items-center justify-center">
        <div className="text-red-400 text-xl">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/30 to-black relative overflow-hidden">
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none watermark-pulse">
          <span className="text-9xl font-bold text-violet-400/30">SKYPAD</span>
        </div>
        
        <div className="relative z-10">
          {/* Main Content Area */}
          <div className="p-6">
            {/* Top Header with Logo */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                {/* Company Logo */}
                <img
                  src="/logo.png"
                  alt="SKYPAD-IDE Logo"
                  className="h-8 w-8 mr-2 rounded"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="w-8 h-8 bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-white text-lg font-bold">{dashboardData.company.logo}</span>
                </div>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 text-xl font-semibold">{dashboardData.company.name}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-white/10 backdrop-blur-md text-white placeholder-gray-300 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-violet-400 w-64"
                  />
                  <MdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                </div>
                
                {/* User Menu consolidated into DashboardNavbar */}
                
                {/* Dashboard Navbar Component */}
                <DashboardNavbar />
              </div>
            </div>

            {/* Welcome Section */}
            <div className="flex items-center space-x-6 mb-8">
              {/* Profile Image */}
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 overflow-hidden">
                {console.log('Rendering profile picture:', userData.profilePictureUrl)} {/* Debug log */}
                {userData.profilePictureUrl ? (
                  <img 
                    src={userData.profilePictureUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src); // Debug log
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className="text-white text-2xl font-bold"
                  style={{ display: userData.profilePictureUrl ? 'none' : 'flex' }}
                >
                  {userData.avatar}
                </span>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">Welcome back, {userData.name}!</h2>
                <p className="text-gray-300">{dashboardData.user.title}</p>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Level Up Section */}
              <div className="bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-fuchsia-900/20 backdrop-blur-md rounded-xl p-6 border border-violet-500/30 shadow-lg shadow-violet-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 text-xl font-semibold mb-2">{dashboardData.levelUpSection.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      {dashboardData.levelUpSection.description}
                    </p>
                    <button 
                      onClick={() => navigate('/code-editor')}
                      className="btn-primary px-6 py-3 rounded-lg font-medium flex items-center space-x-2 focus-ring"
                    >
                      <MdCode className="w-5 h-5" />
                      <span>Open Code Editor</span>
                    </button>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <MdCode className="text-white w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Question Section */}
              <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-cyan-900/20 backdrop-blur-md rounded-xl p-6 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 text-xl font-semibold mb-2">Share Your Knowledge</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Create and upload coding problems for the community to solve.
                    </p>
                    <button 
                      onClick={() => navigate('/upload-question')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 focus-ring transition-all duration-300"
                    >
                      <MdAssignment className="w-5 h-5" />
                      <span>Upload Question</span>
                    </button>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <MdAssignment className="text-white w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="dashboard-card rounded-xl p-6">
                <h4 className="text-medium-contrast text-sm mb-2">{dashboardData.performanceCards.problemsSolved.label}</h4>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">{dashboardData.performanceCards.problemsSolved.value}</div>
              </div>
              
              <div className="dashboard-card rounded-xl p-6">
                <h4 className="text-medium-contrast text-sm mb-2">{dashboardData.performanceCards.winLossRatio.label}</h4>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">{dashboardData.performanceCards.winLossRatio.value}</div>
              </div>
              
              <div className="dashboard-card rounded-xl p-6">
                <h4 className="text-medium-contrast text-sm mb-2">{dashboardData.performanceCards.contestAttendance.label}</h4>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">{dashboardData.performanceCards.contestAttendance.value}</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Leaderboard */}
                <div className="dashboard-card rounded-xl p-6">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 font-semibold mb-6">Leaderboard</h3>
                  
                  <div className="overflow-hidden rounded-lg">
                    <table className="w-full data-table">
                      <thead>
                        <tr>
                          <th className="text-left p-3">Rank</th>
                          <th className="text-left p-3">User</th>
                          <th className="text-left p-3">Points</th>
                          <th className="text-left p-3">Last Submission</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-1">
                        {dashboardData.leaderboard.map((player) => (
                          <tr key={player.rank} className="border-t border-violet-500/20 hover:bg-gradient-to-r hover:from-violet-900/10 hover:to-purple-900/10">
                            <td className="p-3 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-medium">{player.rank}</td>
                            <td className="p-3 text-high-contrast">{player.user}</td>
                            <td className="p-3 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-medium">{player.points}</td>
                            <td className="p-3 text-medium-contrast text-sm">{player.lastSubmission}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Upcoming Contests */}
                <div className="dashboard-card rounded-xl p-6">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 font-semibold mb-6">Upcoming Contests</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-high-contrast text-lg font-medium mb-2">{dashboardData.upcomingContest.title}</h4>
                      <p className="text-medium-contrast text-sm mb-4">
                        {dashboardData.upcomingContest.description}
                      </p>
                      <button className="btn-primary px-6 py-2 rounded-lg font-medium focus-ring">
                        {dashboardData.upcomingContest.buttonText}
                      </button>
                    </div>
                    <div className="ml-8">
                      <div className="w-32 h-20 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <MdCode className="text-white w-12 h-12" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Challenges */}
                <div className="dashboard-card rounded-xl p-6">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 font-semibold mb-6">Recent Challenges</h3>
                  
                  <div className="overflow-hidden rounded-lg">
                    <table className="w-full data-table">
                      <thead>
                        <tr>
                          <th className="text-left p-3">Challenge</th>
                          <th className="text-left p-3">Difficulty</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recentChallenges.map((challenge, idx) => (
                          <tr key={idx} className="border-t border-violet-500/20 hover:bg-gradient-to-r hover:from-violet-900/10 hover:to-purple-900/10">
                            <td className="p-3 text-high-contrast">{challenge.name}</td>
                            <td className="p-3">
                              <span className={`text-sm ${getDifficultyColor(challenge.difficulty)}`}>
                                {challenge.difficulty}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusConfig(challenge.statusColor)}`}>
                                {challenge.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full"
                                  style={{width: `${challenge.progress}%`}}
                                ></div>
                              </div>
                              <span className="text-medium-contrast text-xs mt-1">{challenge.progress}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Performance Metrics */}
                <div className="dashboard-card rounded-xl p-6">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 font-semibold mb-6">Performance Metrics</h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-1">{dashboardData.performanceMetrics.submissions.value}</div>
                      <div className="text-medium-contrast text-sm mb-1">{dashboardData.performanceMetrics.submissions.label}</div>
                      <div className="data-positive text-xs">
                        {dashboardData.performanceMetrics.submissions.period} {dashboardData.performanceMetrics.submissions.growth}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 mb-1">{dashboardData.performanceMetrics.accuracy.value}</div>
                      <div className="text-medium-contrast text-sm mb-1">{dashboardData.performanceMetrics.accuracy.label}</div>
                      <div className="data-positive text-xs">
                        {dashboardData.performanceMetrics.accuracy.period} {dashboardData.performanceMetrics.accuracy.growth}
                      </div>
                    </div>
                  </div>

                  {/* Performance Chart */}
                  <div className="mb-6">
                    <div className="h-32 bg-violet-900/20 rounded-lg p-4 flex items-end justify-around">
                      {dashboardData.performanceMetrics.weeklyData.map((week, idx) => (
                        <div key={idx} className="text-center">
                          <div 
                            className="w-12 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded mb-2" 
                            style={{height: `${60 + (idx * 10)}px`}}
                          ></div>
                          <div className="text-medium-contrast text-xs">{week}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(dashboardData.performanceMetrics.difficultyBreakdown).map(([key, difficulty]) => (
                      <div key={key} className="text-center">
                        <div className="w-full bg-gray-700 h-16 rounded relative">
                          <div 
                            className="absolute bottom-0 w-full rounded bg-gradient-to-t from-violet-500 to-fuchsia-500"
                            style={{height: `${difficulty.percentage}%`}}
                          ></div>
                        </div>
                        <div className={`text-sm mt-2 ${getDifficultyColor(difficulty.label)}`}>
                          {difficulty.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DSA Sheet Progress */}
                <div className="dashboard-card rounded-xl p-6">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 font-semibold mb-4">DSA Sheet Progress</h3>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-high-contrast">{dashboardData.dsaProgress.title}</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-medium">{dashboardData.dsaProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-500 h-2 rounded-full" 
                        style={{width: `${dashboardData.dsaProgress.percentage}%`}}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Coins & Rewards */}
                <div className="dashboard-card rounded-xl p-6">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 font-semibold mb-4">Coins & Rewards</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-high-contrast font-medium mb-2">{dashboardData.coinsRewards.title}</h4>
                      <p className="text-medium-contrast text-sm mb-4">
                        {dashboardData.coinsRewards.description}
                      </p>
                      <button className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-700 transition-all duration-300 shadow-lg shadow-yellow-500/30 focus-ring">
                        {dashboardData.coinsRewards.buttonText}
                      </button>
                    </div>
                    <div className="ml-6">
                      <div className="w-24 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/30">
                        <span className="text-white text-2xl">🏆</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;