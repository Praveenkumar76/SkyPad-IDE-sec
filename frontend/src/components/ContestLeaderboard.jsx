import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MdLeaderboard, 
  MdEmojiEvents, 
  MdTimer, 
  MdPeople,
  MdAdd,
  MdRemove,
  MdArrowBack,
  MdRefresh,
  MdStar
} from 'react-icons/md';
import BackButton from './BackButton';

const ContestLeaderboard = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [contestInfo, setContestInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh leaderboard every 30 seconds
    const interval = setInterval(() => {
      fetchLeaderboard(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [contestId]);

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Fetch contest info first
      const contestResponse = await fetch(`/api/contests/${contestId}`);
      if (!contestResponse.ok) {
        throw new Error('Contest not found');
      }
      const contestData = await contestResponse.json();
      setContestInfo(contestData);

      // Fetch leaderboard
      const leaderboardResponse = await fetch(`/api/contests/${contestId}/leaderboard`);
      if (!leaderboardResponse.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData.leaderboard || []);

    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      alert(error.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getRankMedal = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400 bg-yellow-500/20';
      case 2: return 'text-gray-300 bg-gray-500/20';
      case 3: return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getContestStatus = () => {
    if (!contestInfo) return 'Loading...';
    const now = new Date();
    const startTime = new Date(contestInfo.startTime);
    const endTime = new Date(contestInfo.endTime);

    if (now < startTime) return 'Upcoming';
    if (now >= startTime && now <= endTime) return 'Live';
    return 'Ended';
  };

  const getStatusColor = () => {
    const status = getContestStatus();
    switch (status) {
      case 'Live': return 'text-green-400 bg-green-500/20';
      case 'Upcoming': return 'text-yellow-400 bg-yellow-500/20';
      case 'Ended': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

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
            <BackButton to={`/contest/${contestId}`} text="Back to Contest" />
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                Contest Leaderboard
              </h1>
              <p className="text-gray-300">{contestInfo?.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-lg font-medium ${getStatusColor()}`}>
              {getContestStatus()}
            </span>
            <button
              onClick={() => fetchLeaderboard(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Contest Stats */}
        {contestInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <MdPeople className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">Participants</p>
                  <p className="text-2xl font-bold text-white">{contestInfo.stats?.totalParticipants || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <MdStar className="w-8 h-8 text-violet-400" />
                <div>
                  <p className="text-gray-300 text-sm">Total Submissions</p>
                  <p className="text-2xl font-bold text-white">{contestInfo.stats?.totalSubmissions || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <MdEmojiEvents className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-gray-300 text-sm">Problems Solved</p>
                  <p className="text-2xl font-bold text-white">{contestInfo.stats?.problemsSolved || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <MdTimer className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-300 text-sm">Questions Count</p>
                  <p className="text-2xl font-bold text-white">{contestInfo.questions?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MdLeaderboard className="w-6 h-6 text-violet-400" />
                <h2 className="text-2xl font-bold text-white">Rankings</h2>
              </div>
              <span className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-300 font-medium">Rank</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Participant</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Score</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Solved</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Submissions</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Last Submission</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((participant, index) => (
                    <tr 
                      key={participant.username} 
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        participant.rank <= 3 ? 'bg-white/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-lg font-bold text-lg ${getRankColor(participant.rank)}`}>
                            #{participant.rank}
                          </span>
                          {getRankMedal(participant.rank) && (
                            <span className="text-2xl">{getRankMedal(participant.rank)}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-semibold">{participant.username}</p>
                          <p className="text-gray-400 text-sm">{participant.fullName}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-2xl font-bold text-violet-400">{participant.score}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-lg font-semibold text-green-400">{participant.problemsSolved}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-gray-300">{participant.submissionsCount}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-gray-400 text-sm">{formatTime(participant.lastSubmissionTime)}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center">
                      <div className="text-gray-400">
                        <MdLeaderboard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No participants yet</p>
                        <p className="text-sm">Be the first to join and submit solutions!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => navigate(`/contest/${contestId}`)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <MdArrowBack className="w-5 h-5" />
            <span>Back to Contest</span>
          </button>
          
          <button
            onClick={() => navigate('/challenges')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <MdLeaderboard className="w-5 h-5" />
            <span>View All Contests</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestLeaderboard;