import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import { 
  MdEmojiEvents, 
  MdStar, 
  MdDiamond, 
  MdCardGiftcard, 
  MdShoppingCart,
  MdCheckCircle,
  MdLock,
  MdCode,
  MdAssignment,
  MdArrowBack
} from 'react-icons/md';

const Rewards = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('badges');
  const [userCoins, setUserCoins] = useState(1250); // Mock user coins

  const badges = [
    {
      id: 'first-solve',
      name: 'First Solve',
      description: 'Solve your first problem',
      icon: '🎯',
      color: 'from-green-500 to-emerald-500',
      earned: true,
      rarity: 'common'
    },
    {
      id: 'array-master',
      name: 'Array Master',
      description: 'Complete all array problems',
      icon: '📊',
      color: 'from-blue-500 to-cyan-500',
      earned: true,
      rarity: 'rare'
    },
    {
      id: 'recursion-king',
      name: 'Recursion King',
      description: 'Master recursive algorithms',
      icon: '🔄',
      color: 'from-purple-500 to-violet-500',
      earned: false,
      rarity: 'epic'
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Solve 10 problems in one day',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      earned: false,
      rarity: 'legendary'
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Solve 50 problems without any wrong submissions',
      icon: '💎',
      color: 'from-pink-500 to-rose-500',
      earned: false,
      rarity: 'mythic'
    }
  ];

  const shopItems = [
    {
      id: 'premium-theme',
      name: 'Premium Theme',
      description: 'Unlock dark premium theme',
      price: 500,
      icon: '🎨',
      category: 'themes'
    },
    {
      id: 'code-editor-upgrade',
      name: 'Advanced Code Editor',
      description: 'Enhanced code editor with AI suggestions',
      price: 1000,
      icon: '💻',
      category: 'tools'
    },
    {
      id: 'exclusive-badge',
      name: 'Exclusive Badge',
      description: 'Limited edition golden badge',
      price: 2000,
      icon: '⭐',
      category: 'badges'
    },
    {
      id: 'priority-support',
      name: 'Priority Support',
      description: 'Get priority customer support',
      price: 750,
      icon: '🎧',
      category: 'services'
    }
  ];

  const achievements = [
    {
      id: 'streak-7',
      name: '7-Day Streak',
      description: 'Solve problems for 7 consecutive days',
      reward: '100 coins',
      progress: 5,
      target: 7,
      completed: false
    },
    {
      id: 'solve-100',
      name: 'Century Club',
      description: 'Solve 100 problems total',
      reward: '500 coins + Special Badge',
      progress: 23,
      target: 100,
      completed: false
    },
    {
      id: 'perfect-week',
      name: 'Perfect Week',
      description: 'Solve all daily problems for a week',
      reward: '300 coins',
      progress: 7,
      target: 7,
      completed: true
    }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-green-400 bg-green-500/20';
      case 'rare': return 'text-blue-400 bg-blue-500/20';
      case 'epic': return 'text-purple-400 bg-purple-500/20';
      case 'legendary': return 'text-yellow-400 bg-yellow-500/20';
      case 'mythic': return 'text-pink-400 bg-pink-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'themes': return '🎨';
      case 'tools': return '🛠️';
      case 'badges': return '🏆';
      case 'services': return '🎧';
      default: return '🎁';
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
                  Rewards & Shop
                </h1>
                <p className="text-gray-300 mt-2">Earn coins, unlock achievements, and shop for exclusive items</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Coins */}
              <div className="bg-violet-500/20 backdrop-blur-md rounded-lg px-4 py-2 border border-violet-500/30">
                <div className="flex items-center space-x-2">
                  <MdDiamond className="w-5 h-5 text-violet-400" />
                  <span className="text-white font-bold text-lg">{userCoins.toLocaleString()}</span>
                  <span className="text-violet-300 text-sm">coins</span>
                </div>
              </div>
              <DashboardNavbar />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 mb-8 w-fit">
            {[
              { key: 'badges', label: 'Badges', icon: '🏆' },
              { key: 'shop', label: 'Shop', icon: '🛒' },
              { key: 'achievements', label: 'Achievements', icon: '⭐' }
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
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Your Badges</h2>
                <p className="text-gray-300">Show off your achievements with exclusive badges</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 ${
                      badge.earned 
                        ? 'border-violet-400/50 hover:border-violet-400' 
                        : 'border-white/20 opacity-60'
                    }`}
                  >
                    <div className="text-center space-y-4">
                      {/* Badge Icon */}
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-4xl shadow-lg`}>
                        {badge.earned ? badge.icon : '🔒'}
                      </div>

                      {/* Badge Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {badge.name}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          {badge.description}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity.toUpperCase()}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-center space-x-2">
                        {badge.earned ? (
                          <>
                            <MdCheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">Earned</span>
                          </>
                        ) : (
                          <>
                            <MdLock className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-400 text-sm">Locked</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Shop</h2>
                <p className="text-gray-300">Spend your coins on exclusive items and upgrades</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shopItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="space-y-4">
                      {/* Item Icon */}
                      <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl shadow-lg">
                        {item.icon}
                      </div>

                      {/* Item Info */}
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors mb-2">
                          {item.name}
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <span className="text-xs text-gray-400">{getCategoryIcon(item.category)}</span>
                          <span className="text-xs text-gray-400 capitalize">{item.category}</span>
                        </div>
                      </div>

                      {/* Price and Buy Button */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2">
                          <MdDiamond className="w-5 h-5 text-violet-400" />
                          <span className="text-white font-bold text-lg">{item.price.toLocaleString()}</span>
                          <span className="text-violet-300 text-sm">coins</span>
                        </div>
                        <button
                          disabled={userCoins < item.price}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            userCoins >= item.price
                              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white hover:scale-105'
                              : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {userCoins >= item.price ? (
                            <>
                              <MdShoppingCart className="w-4 h-4 inline mr-2" />
                              Buy Now
                            </>
                          ) : (
                            'Not Enough Coins'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Achievements</h2>
                <p className="text-gray-300">Complete challenges to unlock rewards and achievements</p>
              </div>

              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 ${
                      achievement.completed 
                        ? 'border-green-400/50' 
                        : 'border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          achievement.completed 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                        }`}>
                          {achievement.completed ? '✅' : '🎯'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {achievement.name}
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-violet-400 font-medium">
                              Reward: {achievement.reward}
                            </span>
                            <span className="text-gray-400">
                              {achievement.progress}/{achievement.target}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-32 bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full ${
                              achievement.completed 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                            }`}
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {Math.round((achievement.progress / achievement.target) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
