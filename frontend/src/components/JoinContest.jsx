import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdLock, 
  MdEmojiEvents, 
  MdArrowBack, 
  MdLogin,
  MdInfo
} from 'react-icons/md';
import BackButton from './BackButton';

const JoinContest = () => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [formData, setFormData] = useState({
    contestId: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [contestInfo, setContestInfo] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contestId.trim()) {
      newErrors.contestId = 'Contest ID is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinContest = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsJoining(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to join contests');
      }

      const response = await fetch('/api/contests/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contestId: formData.contestId.trim(),
          password: formData.password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join contest');
      }

      const result = await response.json();
      setContestInfo(result.contestInfo);
      
      // Show success message
      alert(result.message);
      
      // Navigate to contest page or dashboard after successful join
      setTimeout(() => {
        navigate(`/contest/${formData.contestId}`);
      }, 1000);
      
    } catch (error) {
      console.error('Join contest error:', error);
      alert(error.message || 'Failed to join contest');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton to="/contests" text="Back to Contests" />
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                Join Contest
              </h1>
              <p className="text-gray-300">Enter contest ID and password to participate</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          {!contestInfo ? (
            // Join Form
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdEmojiEvents className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Join Contest</h2>
                <p className="text-gray-300">Enter the contest details provided by the organizer</p>
              </div>

              <form onSubmit={handleJoinContest} className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Contest ID *
                  </label>
                  <input
                    type="text"
                    value={formData.contestId}
                    onChange={(e) => handleInputChange('contestId', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors ${
                      errors.contestId ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="e.g., c-abc123"
                  />
                  {errors.contestId && <p className="text-red-400 text-sm mt-1">{errors.contestId}</p>}
                  <p className="text-gray-400 text-xs mt-1">Contest ID is provided by the contest organizer</p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <MdLock className="w-4 h-4 inline mr-1" />
                    Contest Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors ${
                      errors.password ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter contest password"
                  />
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isJoining}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 ${
                    isJoining
                      ? 'bg-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 hover:scale-105'
                  } text-white`}
                >
                  <MdLogin className="w-5 h-5" />
                  <span>{isJoining ? 'Joining Contest...' : 'Join Contest'}</span>
                </button>
              </form>

              {/* Help Section */}
              <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start space-x-3">
                  <MdInfo className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-blue-400 font-medium mb-2">Need Help?</h3>
                    <ul className="text-blue-300 text-sm space-y-1">
                      <li>• Contact your contest organizer for the Contest ID and Password</li>
                      <li>• Contest ID format: c-xxxxxx (e.g., c-abc123)</li>
                      <li>• Make sure you have the correct credentials</li>
                      <li>• Ensure you're logged into your account</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Contest Info Display (after successful join)
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdEmojiEvents className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Successfully Joined!</h2>
                <p className="text-gray-300">You've joined the contest successfully</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">{contestInfo.title}</h3>
                  <p className="text-gray-300 mb-4">{contestInfo.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-400">Questions:</span>
                      <span className="text-white font-medium">{contestInfo.questionsCount}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-400">Start Time:</span>
                      <span className="text-white font-medium">
                        {new Date(contestInfo.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-400">End Time:</span>
                      <span className="text-white font-medium">
                        {new Date(contestInfo.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white font-medium">
                        {Math.round((new Date(contestInfo.endTime) - new Date(contestInfo.startTime)) / (1000 * 60 * 60))} hours
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 mb-4">Redirecting to contest page...</p>
                  <button
                    onClick={() => navigate(`/contest/${formData.contestId}`)}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    Go to Contest
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinContest;