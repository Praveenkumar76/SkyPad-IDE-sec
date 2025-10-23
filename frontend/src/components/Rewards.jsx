import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import { rewardsAPI } from '../utils/api';
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
  MdInfo,
  MdClose,
  MdTrendingUp,
  MdTimer,
  MdRedeem,
  MdRocket,
  MdPalette,
  MdExtension,
  MdLeaderboard,
  MdBarChart,
  MdRefresh
} from 'react-icons/md';

const Rewards = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('badges');
  const [rewardsData, setRewardsData] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyReward, setDailyReward] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState('coins');

  useEffect(() => {
    loadRewardsData();
    loadShopItems();
    loadLeaderboard();
  }, []);

  // Refresh data when component becomes visible (user returns from solving problems)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const needs = localStorage.getItem('rewardsNeedsRefresh');
        if (needs === '1') {
          loadRewardsData();
          try { localStorage.removeItem('rewardsNeedsRefresh'); } catch {}
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadRewardsData = async () => {
    try {
      const data = await rewardsAPI.getProfile();
      setRewardsData(data);
    } catch (error) {
      console.error('Failed to load rewards data:', error);
      // Fallback to mock data
      setRewardsData({
        coins: 1250,
        xp: 5000,
        level: 5,
        badges: [],
        ownedItems: [],
        activeBoosters: [],
        achievements: [],
        weeklyChallenges: [],
        monthlyChallenges: [],
        profileCustomization: {
          frameStyle: 'default',
          theme: 'default',
          avatar: null
        },
        dailyRewards: {
          lastClaimed: null,
          streak: 0,
          nextReward: 1
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadShopItems = async () => {
    try {
      const data = await rewardsAPI.getShop();
      setShopItems(data.items);
    } catch (error) {
      console.error('Failed to load shop items:', error);
    }
  };

  const loadLeaderboard = async (type = 'coins') => {
    try {
      const data = await rewardsAPI.getLeaderboard(type);
      setLeaderboard(data.leaderboard);
      setLeaderboardType(type);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const handlePurchase = async (item) => {
    try {
      setSelectedItem(item);
      setShowPurchaseModal(true);
    } catch (error) {
      console.error('Failed to prepare purchase:', error);
    }
  };

  const confirmPurchase = async () => {
    try {
      const result = await rewardsAPI.purchaseItem(selectedItem.id);
      setRewardsData(prev => ({
        ...prev,
        coins: result.newCoins || prev.coins - selectedItem.price
      }));
      setShowPurchaseModal(false);
      setSelectedItem(null);
      // Show success message
    } catch (error) {
      console.error('Failed to purchase item:', error);
      alert(error.message);
    }
  };

  const handleClaimDaily = async () => {
    try {
      const result = await rewardsAPI.claimDaily();
      setDailyReward(result);
      setShowDailyModal(true);
      setRewardsData(prev => ({
        ...prev,
        coins: result.newCoins,
        xp: result.newXp,
        level: result.newLevel,
        dailyRewards: {
          ...prev.dailyRewards,
          lastClaimed: new Date(),
          streak: result.streak
        }
      }));
    } catch (error) {
      console.error('Failed to claim daily reward:', error);
      alert(error.message);
    }
  };

  const activateBooster = async (itemId) => {
    try {
      await rewardsAPI.activateBooster(itemId);
      loadRewardsData(); // Refresh data
    } catch (error) {
      console.error('Failed to activate booster:', error);
      alert(error.message);
    }
  };

  const canClaimDaily = () => {
    if (!rewardsData?.dailyRewards?.lastClaimed) return true;
    try {
      const lastClaimed = new Date(rewardsData.dailyRewards.lastClaimed);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return lastClaimed < today;
    } catch (error) {
      console.error('Error checking daily claim:', error);
      return true;
    }
  };

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
      case 'boosters': return '🚀';
      case 'cosmetics': return '💎';
      case 'mystery': return '🎁';
      default: return '🎁';
    }
  };

  const getBadgeIcon = (badgeId) => {
    const icons = {
      'first-solve': '🎯',
      'algorithm-expert': '🧠',
      'frontend-wizard': '⚡',
      'backend-architect': '🏗️',
      'array-master': '📊',
      'recursion-king': '🔄',
      'speed-demon': '⚡',
      'perfectionist': '💎',
      'lucky': '🍀'
    };
    return icons[badgeId] || '🏆';
  };

  const getBadgeGradient = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-green-500 to-emerald-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      case 'epic': return 'from-purple-500 to-violet-500';
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'mythic': return 'from-pink-500 to-rose-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-violet-300">Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (!rewardsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load rewards data</p>
          <button 
            onClick={loadRewardsData}
            className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
          >
            Retry
          </button>
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
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                Rewards & Shop
              </h1>
              <p className="text-gray-300 mt-2">Earn coins, unlock achievements, and shop for exclusive items</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Stats */}
              <div className="flex items-center space-x-4">
                {/* Refresh Button */}
                <button
                  onClick={loadRewardsData}
                  className="bg-violet-500/20 backdrop-blur-md rounded-lg px-3 py-2 border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
                  title="Refresh data"
                >
                  <MdRefresh className="w-5 h-5 text-violet-400" />
                </button>
                {/* XP */}
                <div className="bg-violet-500/20 backdrop-blur-md rounded-lg px-4 py-2 border border-violet-500/30">
                  <div className="flex items-center space-x-2">
                    <MdStar className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold text-lg">{(rewardsData.xp || 0).toLocaleString()}</span>
                    <span className="text-yellow-300 text-sm">XP</span>
                  </div>
                </div>
                {/* Level */}
                <div className="bg-violet-500/20 backdrop-blur-md rounded-lg px-4 py-2 border border-violet-500/30">
                  <div className="flex items-center space-x-2">
                    <MdTrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-bold text-lg">Lv.{rewardsData.level || 1}</span>
                  </div>
                </div>
                {/* Coins */}
              <div className="bg-violet-500/20 backdrop-blur-md rounded-lg px-4 py-2 border border-violet-500/30">
                <div className="flex items-center space-x-2">
                  <MdDiamond className="w-5 h-5 text-violet-400" />
                    <span className="text-white font-bold text-lg">{(rewardsData.coins || 0).toLocaleString()}</span>
                  <span className="text-violet-300 text-sm">coins</span>
                </div>
                </div>
                {/* Daily Reward Button */}
                {canClaimDaily() && (
                  <button
                    onClick={handleClaimDaily}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                  >
                    <MdRedeem className="w-5 h-5" />
                    <span>Daily</span>
                  </button>
                )}
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
              { key: 'achievements', label: 'Achievements', icon: '⭐' },
              { key: 'stats', label: 'Stats', icon: '📊' },
              { key: 'leaderboard', label: 'Leaderboard', icon: '🏅' }
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
                <h2 className="text-2xl font-bold text-white mb-2">Your Badge Collection</h2>
                <p className="text-gray-300">Show off your achievements with exclusive badges</p>
                <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-400">
                  <span>Total: {rewardsData.badges?.length || 0} badges</span>
                  <span>•</span>
                  <span>Common: {rewardsData.badges?.filter(b => b.rarity === 'common').length || 0}</span>
                  <span>•</span>
                  <span>Rare: {rewardsData.badges?.filter(b => b.rarity === 'rare').length || 0}</span>
                  <span>•</span>
                  <span>Epic: {rewardsData.badges?.filter(b => b.rarity === 'epic').length || 0}</span>
                  <span>•</span>
                  <span>Legendary: {rewardsData.badges?.filter(b => b.rarity === 'legendary').length || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rewardsData.badges?.map((badge) => (
                  <div
                    key={badge.badgeId}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-violet-400/50 hover:border-violet-400 transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="text-center space-y-4">
                      {/* Badge Icon */}
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getBadgeGradient(badge.rarity)} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {getBadgeIcon(badge.badgeId)}
                      </div>

                      {/* Badge Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
                          {badge.name}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          {badge.description}
                        </p>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity.toUpperCase()}
                        </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300">
                            {badge.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-center space-x-2">
                            <MdCheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">Earned</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Badge Detail Modal */}
              {selectedBadge && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 max-w-md w-full">
                    <div className="text-center space-y-6">
                      <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getBadgeGradient(selectedBadge.rarity)} flex items-center justify-center text-5xl shadow-lg`}>
                        {getBadgeIcon(selectedBadge.badgeId)}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h3>
                        <p className="text-gray-300 mb-4">{selectedBadge.description}</p>
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(selectedBadge.rarity)}`}>
                            {selectedBadge.rarity.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-violet-500/20 text-violet-300">
                            {selectedBadge.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedBadge(null)}
                        className="w-full px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Shop</h2>
                <p className="text-gray-300">Spend your coins on exclusive items and upgrades</p>
              </div>

              {/* Shop Categories */}
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {['all', 'boosters', 'cosmetics', 'themes', 'mystery'].map(category => (
                  <button
                    key={category}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shopItems?.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="space-y-4">
                      {/* Item Icon */}
                      <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl shadow-lg">
                        {getCategoryIcon(item.category)}
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
                          {item.type === 'booster' && (
                            <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-300">
                              {item.multiplier}x
                            </span>
                          )}
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
                          onClick={() => handlePurchase(item)}
                          disabled={rewardsData.coins < item.price}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            rewardsData.coins >= item.price
                              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white hover:scale-105'
                              : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {rewardsData.coins >= item.price ? (
                            <>
                              <MdShoppingCart className="w-4 h-4 inline mr-2" />
                              {item.type === 'mystery' ? 'Open Box' : 'Buy Now'}
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

              {/* Active Boosters */}
              {rewardsData.activeBoosters?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">Active Boosters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewardsData.activeBoosters?.map((booster, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-lg p-4 border border-orange-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">
                              {booster.type === 'xp' ? 'XP Boost' : 'Coin Boost'}
                            </h4>
                            <p className="text-orange-300 text-sm">
                              {booster.multiplier}x multiplier
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-orange-300 text-sm">
                              <MdTimer className="w-4 h-4 inline mr-1" />
                              {Math.ceil((new Date(booster.expiresAt) - new Date()) / (1000 * 60))}m left
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Achievements & Challenges</h2>
                <p className="text-gray-300">Complete challenges to unlock rewards and achievements</p>
              </div>

              {/* Tier-Based Milestones */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Tier Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { tier: 'Bronze', target: 10, reward: '100 coins', color: 'from-amber-600 to-amber-500', progress: Math.min(rewardsData.achievements?.find(a => a.tier === 'bronze')?.progress || 0, 10) },
                    { tier: 'Silver', target: 50, reward: '300 coins', color: 'from-gray-400 to-gray-300', progress: Math.min(rewardsData.achievements?.find(a => a.tier === 'silver')?.progress || 0, 50) },
                    { tier: 'Gold', target: 100, reward: '600 coins + badge', color: 'from-yellow-500 to-yellow-400', progress: Math.min(rewardsData.achievements?.find(a => a.tier === 'gold')?.progress || 0, 100) },
                    { tier: 'Platinum', target: 500, reward: '2000 coins + badge', color: 'from-purple-500 to-purple-400', progress: Math.min(rewardsData.achievements?.find(a => a.tier === 'platinum')?.progress || 0, 500) }
                  ].map((tier, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center text-2xl mb-3`}>
                          {tier.tier === 'Bronze' ? '🥉' : tier.tier === 'Silver' ? '🥈' : tier.tier === 'Gold' ? '🥇' : '💎'}
                        </div>
                        <h4 className="text-white font-semibold mb-2">{tier.tier} Tier</h4>
                        <p className="text-gray-300 text-sm mb-3">{tier.reward}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${tier.color}`}
                            style={{ width: `${(tier.progress / tier.target) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400">{tier.progress}/{tier.target}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Challenges */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Weekly Challenges</h3>
              <div className="space-y-4">
                  {rewardsData.weeklyChallenges?.length > 0 ? (
                    rewardsData.weeklyChallenges?.map((challenge) => (
                  <div
                        key={challenge.challengeId}
                    className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 ${
                          challenge.completed 
                        ? 'border-green-400/50' 
                        : 'border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                              challenge.completed 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                        }`}>
                              {challenge.completed ? '✅' : '🎯'}
                        </div>
                        <div>
                              <h4 className="text-lg font-semibold text-white mb-1">
                                {challenge.name}
                              </h4>
                          <p className="text-gray-300 text-sm mb-2">
                                {challenge.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-violet-400 font-medium">
                                  Reward: {challenge.reward} coins
                            </span>
                            <span className="text-gray-400">
                                  {challenge.progress}/{challenge.target}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-32 bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full ${
                                  challenge.completed 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                            }`}
                                style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400">
                              {Math.round((challenge.progress / challenge.target) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No weekly challenges available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Challenges */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Monthly Challenges</h3>
              <div className="space-y-4">
                  {rewardsData.monthlyChallenges?.length > 0 ? (
                    rewardsData.monthlyChallenges?.map((challenge) => (
                  <div
                        key={challenge.challengeId}
                    className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 ${
                          challenge.completed 
                        ? 'border-green-400/50' 
                        : 'border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                              challenge.completed 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                        }`}>
                              {challenge.completed ? '✅' : '🎯'}
                        </div>
                        <div>
                              <h4 className="text-lg font-semibold text-white mb-1">
                                {challenge.name}
                              </h4>
                          <p className="text-gray-300 text-sm mb-2">
                                {challenge.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-violet-400 font-medium">
                                  Reward: {challenge.reward} coins
                            </span>
                            <span className="text-gray-400">
                                  {challenge.progress}/{challenge.target}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-32 bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full ${
                                  challenge.completed 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                            }`}
                                style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400">
                              {Math.round((challenge.progress / challenge.target) * 100)}%
                        </div>
                      </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No monthly challenges available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Your Statistics</h2>
                <p className="text-gray-300">Track your progress and achievements</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total XP</p>
                      <p className="text-2xl font-bold text-white">{(rewardsData.xp || 0).toLocaleString()}</p>
                    </div>
                    <MdStar className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Current Level</p>
                      <p className="text-2xl font-bold text-white">Lv.{rewardsData.level || 1}</p>
                    </div>
                    <MdTrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Badges Earned</p>
                      <p className="text-2xl font-bold text-white">{rewardsData.badges?.length || 0}</p>
                    </div>
                    <MdEmojiEvents className="w-8 h-8 text-violet-400" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Coins Earned</p>
                      <p className="text-2xl font-bold text-white">{(rewardsData.coins || 0).toLocaleString()}</p>
                    </div>
                    <MdDiamond className="w-8 h-8 text-violet-400" />
                  </div>
                </div>
              </div>

              {/* Daily Streak */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Daily Streak</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">{rewardsData.dailyRewards?.streak || 0} days</p>
                    <p className="text-gray-400">Current streak</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Next reward in</p>
                    <p className="text-violet-400 font-semibold">{rewardsData.dailyRewards?.nextReward || 1} days</p>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {rewardsData.transactionHistory?.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === 'earned' ? 'bg-green-400' : 
                          transaction.type === 'spent' ? 'bg-red-400' : 'bg-blue-400'
                        }`}></div>
                        <div>
                          <p className="text-white text-sm">{transaction.description}</p>
                          <p className="text-gray-400 text-xs">{transaction.source}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.type === 'earned' ? 'text-green-400' : 
                          transaction.type === 'spent' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {transaction.type === 'earned' ? '+' : transaction.type === 'spent' ? '-' : '+'}{transaction.amount}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Leaderboards</h2>
                <p className="text-gray-300">See how you rank against other developers</p>
              </div>

              {/* Leaderboard Tabs */}
              <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 mb-8 w-fit mx-auto">
                {[
                  { key: 'coins', label: 'Coins', icon: '💎' },
                  { key: 'xp', label: 'XP', icon: '⭐' },
                  { key: 'badges', label: 'Badges', icon: '🏆' },
                  { key: 'streak', label: 'Streak', icon: '🔥' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => loadLeaderboard(tab.key)}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Leaderboard List */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="space-y-4">
                  {leaderboard?.map((user, index) => (
                    <div key={index} className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                          'bg-violet-500/20 text-violet-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{user.username}</p>
                          <p className="text-gray-400 text-sm">
                            {leaderboardType === 'coins' && `${user.coins} coins`}
                            {leaderboardType === 'xp' && `${user.xp} XP`}
                            {leaderboardType === 'badges' && `${user.badges} badges`}
                            {leaderboardType === 'streak' && `${user.streak} days`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-violet-400 font-semibold">
                          {leaderboardType === 'coins' && user.coins.toLocaleString()}
                          {leaderboardType === 'xp' && user.xp.toLocaleString()}
                          {leaderboardType === 'badges' && user.badges}
                          {leaderboardType === 'streak' && user.streak}
                        </p>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 max-w-md w-full">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl shadow-lg">
                {getCategoryIcon(selectedItem.category)}
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h3>
                <p className="text-gray-300 mb-4">{selectedItem.description}</p>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="text-xs text-gray-400">{getCategoryIcon(selectedItem.category)}</span>
                  <span className="text-xs text-gray-400 capitalize">{selectedItem.category}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <MdDiamond className="w-6 h-6 text-violet-400" />
                  <span className="text-white font-bold text-xl">{selectedItem.price.toLocaleString()}</span>
                  <span className="text-violet-300">coins</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-colors"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Reward Modal */}
      {showDailyModal && dailyReward && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 max-w-md w-full">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-5xl shadow-lg">
                <MdRedeem />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Daily Reward Claimed!</h3>
                <p className="text-gray-300 mb-4">
                  You earned <span className="text-green-400 font-bold">{dailyReward.reward} coins</span> and <span className="text-yellow-400 font-bold">{dailyReward.newXp - (rewardsData.xp || 0)} XP</span>!
                </p>
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <p className="text-white font-semibold">Streak: {dailyReward.streak} days</p>
                  <p className="text-gray-400 text-sm">Keep it up for bigger rewards!</p>
                </div>
                {dailyReward.leveledUp && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4">
                    <p className="text-purple-300 font-semibold">🎉 Level Up!</p>
                    <p className="text-white">You're now level {dailyReward.newLevel}!</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDailyModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
