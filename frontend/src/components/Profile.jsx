import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { userActivityTracker } from '../utils/userActivityTracker';
import { simulateUserActivity } from '../utils/simulateUserActivity';
import { 
  MdEdit, 
  MdSave, 
  MdCancel, 
  MdPerson, 
  MdEmail, 
  MdLocationOn, 
  MdWork, 
  MdSchool, 
  MdCake, 
  MdTransgender, 
  MdTrendingUp, 
  MdTrendingDown, 
  MdCode, 
  MdEmojiEvents, 
  MdStar, 
  MdPhotoCamera,
  MdArrowBack,
  MdSettings
} from 'react-icons/md';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // User Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('userName') || 'John Doe',
    email: localStorage.getItem('userEmail') || 'john.doe@email.com',
    role: localStorage.getItem('userRole') || 'student',
    company: localStorage.getItem('userCompany') || 'University of Technology',
    city: localStorage.getItem('userCity') || 'New York',
    state: localStorage.getItem('userState') || 'NY',
    age: parseInt(localStorage.getItem('userAge')) || 25,
    gender: localStorage.getItem('userGender') || 'male',
    profilePicture: localStorage.getItem('userProfilePicture') || null,
    joinDate: localStorage.getItem('userJoinDate') || '2024-01-15'
  });

  // Dynamic Statistics State
  const [stats, setStats] = useState({
    problemsSolved: 0,
    winLossRatio: 0,
    totalSubmissions: 0,
    accuracy: 0,
    currentStreak: 0,
    longestStreak: 0,
    rank: 0,
    totalUsers: 0,
    contestsParticipated: 0,
    contestsWon: 0,
    averageRating: 0,
    maxRating: 0,
    weeklyActivity: 0,
    monthlyActivity: 0,
    totalTimeSpent: 0,
    favoriteTopic: 'Arrays',
    lastActive: '2 hours ago'
  });

  // Performance Metrics
  const [performanceData, setPerformanceData] = useState({
    easy: { solved: 0, total: 0, percentage: 0 },
    medium: { solved: 0, total: 0, percentage: 0 },
    hard: { solved: 0, total: 0, percentage: 0 }
  });

  // Recent Activity
  const [recentActivity, setRecentActivity] = useState([]);

  // Load real user activity data from database
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, using default stats');
          return;
        }

        // Fetch real user statistics from database
        const [statsResponse, activityResponse] = await Promise.all([
          fetch('http://localhost:5000/api/users/stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('http://localhost:5000/api/users/recent-activity', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (statsResponse.ok) {
          const realStats = await statsResponse.json();
          setStats(realStats);
          
          // Update performance data from real stats
          const realPerformance = {
            easy: realStats.difficultyStats?.easy || { solved: 0, total: 100, percentage: 0 },
            medium: realStats.difficultyStats?.medium || { solved: 0, total: 150, percentage: 0 },
            hard: realStats.difficultyStats?.hard || { solved: 0, total: 80, percentage: 0 }
          };
          setPerformanceData(realPerformance);
        }

        if (activityResponse.ok) {
          const realActivity = await activityResponse.json();
          setRecentActivity(realActivity);
        }
      } catch (error) {
        console.error('Failed to load user stats:', error);
        // Fallback to default stats if API fails
      }
    };

    loadUserStats();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      console.log('Saving profile with data:', {
        name: profileData.name,
        email: profileData.email,
        hasProfilePicture: !!profileData.profilePicture,
        profilePictureLength: profileData.profilePicture?.length
      });
      
      // Update backend
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fullName: profileData.name,
          email: profileData.email,
          username: profileData.name,
          profilePictureUrl: profileData.profilePicture || null
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update localStorage
        localStorage.setItem('userName', profileData.name);
        localStorage.setItem('userEmail', profileData.email);
        localStorage.setItem('userRole', profileData.role);
        localStorage.setItem('userCompany', profileData.company);
        localStorage.setItem('userCity', profileData.city);
        localStorage.setItem('userState', profileData.state);
        localStorage.setItem('userAge', profileData.age.toString());
        localStorage.setItem('userGender', profileData.gender);
        if (profileData.profilePicture) {
          localStorage.setItem('userProfilePicture', profileData.profilePicture);
          localStorage.setItem('userAvatar', profileData.profilePicture);
        }
        
        setIsEditing(false);
        alert('Profile updated successfully!');
        console.log('Profile saved:', updatedUser);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any unsaved changes
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File read successfully, base64 length:', e.target.result.length);
        setProfileData(prev => ({
          ...prev,
          profilePicture: e.target.result
        }));
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'problem': return <MdCode className="w-5 h-5 text-blue-400" />;
      case 'contest': return <MdEmojiEvents className="w-5 h-5 text-purple-400" />;
      case 'achievement': return <MdStar className="w-5 h-5 text-yellow-400" />;
      case 'streak': return <MdTrendingUp className="w-5 h-5 text-green-400" />;
      default: return <MdPerson className="w-5 h-5 text-gray-400" />;
    }
  };

  // Function to add a test problem solve (for demonstration)
  const addTestProblemSolve = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to solve problems');
        return;
      }

      const testProblems = [
        { id: 'test-1', title: 'Palindrome Number', difficulty: 'Easy', topic: 'String', timeSpent: 15 },
        { id: 'test-2', title: 'Longest Common Prefix', difficulty: 'Easy', topic: 'String', timeSpent: 20 },
        { id: 'test-3', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', timeSpent: 18 },
        { id: 'test-4', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Array', timeSpent: 35 },
        { id: 'test-5', title: 'Binary Tree Level Order', difficulty: 'Medium', topic: 'Tree', timeSpent: 28 }
      ];
      
      const randomProblem = testProblems[Math.floor(Math.random() * testProblems.length)];
      
      // Record problem solve in database
      const response = await fetch('http://localhost:5000/api/users/solve-problem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          problemId: randomProblem.id + '-' + Date.now(),
          title: randomProblem.title,
          difficulty: randomProblem.difficulty,
          topic: randomProblem.topic,
          timeSpent: randomProblem.timeSpent,
          language: 'JavaScript'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Problem solved! +${result.points} points`);
        
        // Refresh the stats from database
        const [statsResponse, activityResponse] = await Promise.all([
          fetch('http://localhost:5000/api/users/stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('http://localhost:5000/api/users/recent-activity', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (statsResponse.ok) {
          const realStats = await statsResponse.json();
          setStats(realStats);
          
          const realPerformance = {
            easy: realStats.difficultyStats?.easy || { solved: 0, total: 100, percentage: 0 },
            medium: realStats.difficultyStats?.medium || { solved: 0, total: 150, percentage: 0 },
            hard: realStats.difficultyStats?.hard || { solved: 0, total: 80, percentage: 0 }
          };
          setPerformanceData(realPerformance);
        }

        if (activityResponse.ok) {
          const realActivity = await activityResponse.json();
          setRecentActivity(realActivity);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error solving problem:', error);
      alert('Failed to solve problem. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Background gradient matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-violet-900/20 to-black"></div>
      
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none watermark-pulse">
        <span className="text-9xl font-bold text-violet-400">PROFILE</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton to="/dashboard" text="Back to Dashboard" />
          
          <div className="flex items-center space-x-4">
            <button
              onClick={addTestProblemSolve}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25 flex items-center space-x-2"
            >
              <MdCode className="w-5 h-5" />
              <span>Solve Test Problem</span>
            </button>
            <button
              onClick={() => navigate('/code-editor')}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25 flex items-center space-x-2"
            >
              <MdCode className="w-5 h-5" />
              <span>Code Editor</span>
            </button>
            <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25 flex items-center space-x-2">
              <MdSettings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-violet-900/20 rounded-lg border border-violet-500/20 p-8 shadow-2xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20">
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 overflow-hidden">
                    {profileData.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MdPerson className="w-16 h-16 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center shadow-lg hover:bg-violet-700 transition-all duration-300 transform hover:scale-105"
                    >
                      <MdPhotoCamera className="w-5 h-5 text-white" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Basic Info */}
                <h1 className="text-2xl font-bold text-white mb-2">{profileData.name}</h1>
                <p className="text-violet-400 mb-4 capitalize">{profileData.role}</p>
                
                {/* Edit Button */}
                <div className="mb-6">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25 flex items-center space-x-2 mx-auto"
                    >
                      <MdEdit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 flex items-center space-x-2"
                      >
                        <MdSave className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center space-x-2"
                      >
                        <MdCancel className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <MdEmail className="w-5 h-5 text-violet-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="flex-1 bg-violet-900/30 text-white px-3 py-1 rounded-lg border border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    ) : (
                      <span className="text-gray-300">{profileData.email}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MdWork className="w-5 h-5 text-violet-400" />
                    {isEditing ? (
                      <select
                        value={profileData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="flex-1 bg-violet-900/30 text-white px-3 py-1 rounded-lg border border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="student">Student</option>
                        <option value="employee">Employee</option>
                      </select>
                    ) : (
                      <span className="text-gray-300 capitalize">{profileData.role}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {profileData.role === 'student' ? (
                      <MdSchool className="w-5 h-5 text-violet-400" />
                    ) : (
                      <MdWork className="w-5 h-5 text-violet-400" />
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder={profileData.role === 'student' ? 'College/University' : 'Company'}
                        className="flex-1 bg-violet-900/30 text-white px-3 py-1 rounded-lg border border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-gray-400"
                      />
                    ) : (
                      <span className="text-gray-300">{profileData.company}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MdLocationOn className="w-5 h-5 text-violet-400" />
                    {isEditing ? (
                      <div className="flex space-x-2 flex-1">
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                          className="flex-1 bg-violet-900/30 text-white px-3 py-1 rounded-lg border border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-gray-400"
                        />
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="State"
                          className="flex-1 bg-violet-900/30 text-white px-3 py-1 rounded-lg border border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-gray-400"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-300">{profileData.city}, {profileData.state}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MdCake className="w-5 h-5 text-violet-400" />
                    {isEditing ? (
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        className="flex-1 bg-violet-900/30 text-white px-3 py-1 rounded-lg border border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    ) : (
                      <span className="text-gray-300">{profileData.age} years old</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MdTransgender className="w-5 h-5 text-violet-400" />
                    {isEditing ? (
                      <select
                        value={profileData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="flex-1 bg-violet-900/30 text-white px-3 py-1 rounded-lg border border-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <span className="text-gray-300 capitalize">{profileData.gender}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-violet-900/20 rounded-lg border border-violet-500/20 p-6 shadow-2xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20">
              <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Problems Solved</span>
                  <span className="text-violet-400 font-bold">{stats.problemsSolved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Win Rate</span>
                  <span className="text-green-400 font-bold">{(stats.winLossRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Current Streak</span>
                  <span className="text-yellow-400 font-bold">{stats.currentStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Global Rank</span>
                  <span className="text-purple-400 font-bold">#{stats.rank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Weekly Activity</span>
                  <span className="text-blue-400 font-bold">{stats.weeklyActivity} problems</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Time</span>
                  <span className="text-cyan-400 font-bold">{stats.totalTimeSpent}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Favorite Topic</span>
                  <span className="text-pink-400 font-bold">{stats.favoriteTopic}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Last Active</span>
                  <span className="text-orange-400 font-bold">{stats.lastActive}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Statistics and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
              <h3 className="text-white font-semibold mb-6">Performance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {Object.entries(performanceData).map(([difficulty, data]) => (
                  <div key={difficulty} className="text-center">
                    <div className="text-2xl font-bold text-white mb-2 capitalize">{difficulty}</div>
                    <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                      <div 
                        className={`h-4 rounded-full ${
                          difficulty === 'easy' ? 'bg-green-500' : 
                          difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-white/70">
                      {data.solved}/{data.total} ({data.percentage}%)
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-violet-400">{stats.totalSubmissions}</div>
                  <div className="text-sm text-white/70">Total Submissions</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">{(stats.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-sm text-white/70">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{stats.longestStreak}</div>
                  <div className="text-sm text-white/70">Longest Streak</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">{stats.contestsParticipated}</div>
                  <div className="text-sm text-white/70">Contests</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">{stats.contestsWon}</div>
                  <div className="text-sm text-white/70">Contests Won</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.monthlyActivity}</div>
                  <div className="text-sm text-white/70">Monthly Activity</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-pink-400">{stats.totalTimeSpent}h</div>
                  <div className="text-sm text-white/70">Total Time</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-orange-400">{stats.averageRating}</div>
                  <div className="text-sm text-white/70">Avg Rating</div>
                </div>
              </div>
            </div>

            {/* Rating Progress */}
            <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
              <h3 className="text-white font-semibold mb-6">Rating Progress</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70">Current Rating</span>
                    <span className="text-violet-400 font-bold">{stats.averageRating}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full"
                      style={{ width: `${(stats.averageRating / 3000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70">Max Rating</span>
                    <span className="text-green-400 font-bold">{stats.maxRating}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      style={{ width: `${(stats.maxRating / 3000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
              <h3 className="text-white font-semibold mb-6">Recent Activity</h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="text-white font-medium">{activity.title}</div>
                      <div className="text-white/70 text-sm">{activity.status}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.points && (
                        <span className="text-yellow-400 text-sm font-medium">+{activity.points} pts</span>
                      )}
                      <div className="text-white/50 text-sm">{activity.time}</div>
                      {activity.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(activity.difficulty)} bg-white/10`}>
                          {activity.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
