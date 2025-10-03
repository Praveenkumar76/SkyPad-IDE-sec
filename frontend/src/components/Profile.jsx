import { API_BASE_URL } from '../utils/api';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Statistics State
  const [stats] = useState({
    problemsSolved: 247,
    winLossRatio: 0.78,
    totalSubmissions: 156,
    accuracy: 0.85,
    currentStreak: 12,
    longestStreak: 28,
    rank: 156,
    totalUsers: 15420,
    contestsParticipated: 23,
    contestsWon: 7,
    averageRating: 1850,
    maxRating: 2100
  });

  // Performance Metrics
  const [performanceData] = useState({
    easy: { solved: 89, total: 95, percentage: 94 },
    medium: { solved: 123, total: 180, percentage: 68 },
    hard: { solved: 35, total: 85, percentage: 41 }
  });

  // Recent Activity
  const [recentActivity] = useState([
    { type: 'problem', title: 'Two Sum', difficulty: 'Easy', status: 'Solved', time: '2 hours ago' },
    { type: 'contest', title: 'Weekly Contest 245', status: 'Ranked 156', time: '1 day ago' },
    { type: 'achievement', title: 'Problem Solver', status: 'Unlocked', time: '2 days ago' },
    { type: 'problem', title: 'Binary Tree Inorder', difficulty: 'Medium', status: 'Solved', time: '3 days ago' }
  ]);

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
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
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
      default: return <MdPerson className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div 
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, #667eea 0%, #764ba2 100%),
          radial-gradient(circle at 20% 80%, rgba(255,105,180,0.4) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,165,0,0.4) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120,119,198,0.3) 0%, transparent 50%)
        `,
        backgroundBlendMode: 'multiply, overlay, overlay, normal'
      }}
    >
      {/* Mountain silhouette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%),
            linear-gradient(45deg, transparent 60%, rgba(139,69,19,0.3) 70%, rgba(160,82,45,0.4) 80%, rgba(101,67,33,0.5) 90%, rgba(62,39,35,0.6) 100%)
          `
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <MdArrowBack className="w-6 h-6" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/code-editor')}
              className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 px-4 py-2 rounded-lg border border-violet-500/30 hover:from-violet-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center space-x-2"
            >
              <MdCode className="w-5 h-5" />
              <span>Code Editor</span>
            </button>
            <button className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 px-4 py-2 rounded-lg border border-violet-500/30 hover:from-violet-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center space-x-2">
              <MdSettings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
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
                      className="absolute bottom-2 right-2 w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors"
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
                <p className="text-violet-300 mb-4 capitalize">{profileData.role}</p>
                
                {/* Edit Button */}
                <div className="mb-6">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 px-6 py-2 rounded-lg border border-violet-500/30 hover:from-violet-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center space-x-2 mx-auto"
                    >
                      <MdEdit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-4 py-2 rounded-lg border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 flex items-center space-x-2"
                      >
                        <MdSave className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 flex items-center space-x-2"
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
                        className="flex-1 bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    ) : (
                      <span className="text-white/70">{profileData.email}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MdWork className="w-5 h-5 text-violet-400" />
                    {isEditing ? (
                      <select
                        value={profileData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="flex-1 bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="student">Student</option>
                        <option value="employee">Employee</option>
                      </select>
                    ) : (
                      <span className="text-white/70 capitalize">{profileData.role}</span>
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
                        className="flex-1 bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-white/50"
                      />
                    ) : (
                      <span className="text-white/70">{profileData.company}</span>
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
                          className="flex-1 bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-white/50"
                        />
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="State"
                          className="flex-1 bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-white/50"
                        />
                      </div>
                    ) : (
                      <span className="text-white/70">{profileData.city}, {profileData.state}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MdCake className="w-5 h-5 text-violet-400" />
                    {isEditing ? (
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        className="flex-1 bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                    ) : (
                      <span className="text-white/70">{profileData.age} years old</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MdTransgender className="w-5 h-5 text-violet-400" />
                    {isEditing ? (
                      <select
                        value={profileData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="flex-1 bg-white/20 text-white px-3 py-1 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <span className="text-white/70 capitalize">{profileData.gender}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
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
                    <div className="text-white/50 text-sm">{activity.time}</div>
                    {activity.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(activity.difficulty)} bg-white/10`}>
                        {activity.difficulty}
                      </span>
                    )}
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
