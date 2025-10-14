// User Activity Tracker - Tracks and calculates real user statistics

export class UserActivityTracker {
  constructor() {
    this.ACTIVITY_KEY = 'userActivity';
    this.STATS_KEY = 'userStats';
    this.DSA_PROGRESS_KEY = 'dsaProgress';
  }

  // Initialize user activity data
  initializeUserData() {
    if (!localStorage.getItem(this.ACTIVITY_KEY)) {
      localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify({
        problemsSolved: [],
        contestsParticipated: [],
        achievements: [],
        dailyStreaks: [],
        timeSpent: 0,
        lastActive: new Date().toISOString()
      }));
    }
  }

  // Record a problem solve
  recordProblemSolve(problemId, title, difficulty, topic, timeSpent = 0) {
    const activity = this.getActivityData();
    const solvedProblem = {
      id: problemId,
      title,
      difficulty,
      topic,
      solvedAt: new Date().toISOString(),
      timeSpent
    };

    // Check if already solved to avoid duplicates
    const alreadySolved = activity.problemsSolved.some(p => p.id === problemId);
    if (!alreadySolved) {
      activity.problemsSolved.push(solvedProblem);
      activity.timeSpent += timeSpent;
      activity.lastActive = new Date().toISOString();
      this.saveActivityData(activity);
      this.updateStats();
    }
  }

  // Record contest participation
  recordContestParticipation(contestId, contestName, rank, isWon = false) {
    const activity = this.getActivityData();
    const contest = {
      id: contestId,
      name: contestName,
      rank,
      isWon,
      participatedAt: new Date().toISOString()
    };

    activity.contestsParticipated.push(contest);
    activity.lastActive = new Date().toISOString();
    this.saveActivityData(activity);
    this.updateStats();
  }

  // Record daily streak
  recordDailyStreak() {
    const activity = this.getActivityData();
    const today = new Date().toDateString();
    
    // Check if already recorded today
    const todayStreak = activity.dailyStreaks.find(s => s.date === today);
    if (!todayStreak) {
      activity.dailyStreaks.push({
        date: today,
        timestamp: new Date().toISOString()
      });
      activity.lastActive = new Date().toISOString();
      this.saveActivityData(activity);
      this.updateStats();
    }
  }

  // Get activity data
  getActivityData() {
    this.initializeUserData();
    return JSON.parse(localStorage.getItem(this.ACTIVITY_KEY));
  }

  // Save activity data
  saveActivityData(activity) {
    localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(activity));
  }

  // Calculate and update user statistics
  updateStats() {
    const activity = this.getActivityData();
    const stats = this.calculateStats(activity);
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    this.updateDSAProgress(activity);
  }

  // Calculate comprehensive user statistics
  calculateStats(activity) {
    const problemsSolved = activity.problemsSolved;
    const contests = activity.contestsParticipated;
    const streaks = activity.dailyStreaks;

    // Basic stats
    const totalProblemsSolved = problemsSolved.length;
    const totalSubmissions = totalProblemsSolved; // Assuming each solve is one submission
    const accuracy = totalProblemsSolved > 0 ? 0.85 : 0; // Base accuracy, can be improved

    // Difficulty breakdown
    const difficultyStats = this.calculateDifficultyStats(problemsSolved);
    
    // Topic breakdown
    const topicStats = this.calculateTopicStats(problemsSolved);
    
    // Streak calculations
    const currentStreak = this.calculateCurrentStreak(streaks);
    const longestStreak = this.calculateLongestStreak(streaks);
    
    // Contest stats
    const contestsParticipated = contests.length;
    const contestsWon = contests.filter(c => c.isWon).length;
    const winRate = contestsParticipated > 0 ? contestsWon / contestsParticipated : 0;
    
    // Rating calculation (simplified)
    const averageRating = this.calculateRating(problemsSolved, contests);
    const maxRating = Math.max(averageRating, 1200);
    
    // Activity metrics
    const weeklyActivity = this.calculateWeeklyActivity(problemsSolved);
    const monthlyActivity = this.calculateMonthlyActivity(problemsSolved);
    const totalTimeSpent = activity.timeSpent;
    
    // Favorite topic
    const favoriteTopic = this.getFavoriteTopic(topicStats);
    
    // Last active
    const lastActive = this.formatLastActive(activity.lastActive);
    
    // Global rank (simplified calculation)
    const globalRank = this.calculateGlobalRank(totalProblemsSolved);

    return {
      problemsSolved: totalProblemsSolved,
      winLossRatio: winRate,
      totalSubmissions,
      accuracy,
      currentStreak,
      longestStreak,
      rank: globalRank,
      totalUsers: 15000,
      contestsParticipated,
      contestsWon,
      averageRating: Math.round(averageRating),
      maxRating: Math.round(maxRating),
      weeklyActivity,
      monthlyActivity,
      totalTimeSpent: Math.round(totalTimeSpent),
      favoriteTopic,
      lastActive,
      difficultyStats,
      topicStats
    };
  }

  // Calculate difficulty-based statistics
  calculateDifficultyStats(problemsSolved) {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const stats = {};
    
    difficulties.forEach(difficulty => {
      const solved = problemsSolved.filter(p => p.difficulty === difficulty).length;
      const total = this.getTotalProblemsForDifficulty(difficulty);
      stats[difficulty.toLowerCase()] = {
        solved,
        total,
        percentage: total > 0 ? Math.round((solved / total) * 100) : 0
      };
    });
    
    return stats;
  }

  // Calculate topic-based statistics
  calculateTopicStats(problemsSolved) {
    const topics = ['Array', 'String', 'Tree', 'Graph', 'Dynamic Programming', 'Linked List', 'Stack', 'Queue', 'Greedy', 'Recursion'];
    const stats = {};
    
    topics.forEach(topic => {
      const solved = problemsSolved.filter(p => p.topic === topic).length;
      stats[topic] = solved;
    });
    
    return stats;
  }

  // Calculate current streak
  calculateCurrentStreak(streaks) {
    if (streaks.length === 0) return 0;
    
    const sortedStreaks = streaks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    let currentStreak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedStreaks.length; i++) {
      const streakDate = new Date(sortedStreaks[i].date);
      const daysDiff = Math.floor((currentDate - streakDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  }

  // Calculate longest streak
  calculateLongestStreak(streaks) {
    if (streaks.length === 0) return 0;
    
    const sortedStreaks = streaks.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedStreaks.length; i++) {
      const prevDate = new Date(sortedStreaks[i - 1].date);
      const currDate = new Date(sortedStreaks[i].date);
      const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  }

  // Calculate rating based on problems and contests
  calculateRating(problemsSolved, contests) {
    let baseRating = 1200;
    
    // Add points for problems solved
    problemsSolved.forEach(problem => {
      const difficultyMultiplier = {
        'Easy': 10,
        'Medium': 25,
        'Hard': 50
      };
      baseRating += difficultyMultiplier[problem.difficulty] || 10;
    });
    
    // Add points for contest performance
    contests.forEach(contest => {
      if (contest.isWon) {
        baseRating += 100;
      } else if (contest.rank <= 100) {
        baseRating += 50;
      } else if (contest.rank <= 500) {
        baseRating += 25;
      }
    });
    
    return Math.min(baseRating, 3000); // Cap at 3000
  }

  // Calculate weekly activity
  calculateWeeklyActivity(problemsSolved) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return problemsSolved.filter(problem => 
      new Date(problem.solvedAt) >= oneWeekAgo
    ).length;
  }

  // Calculate monthly activity
  calculateMonthlyActivity(problemsSolved) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return problemsSolved.filter(problem => 
      new Date(problem.solvedAt) >= oneMonthAgo
    ).length;
  }

  // Get favorite topic
  getFavoriteTopic(topicStats) {
    const topics = Object.entries(topicStats);
    if (topics.length === 0) return 'Arrays';
    
    const favorite = topics.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    return favorite[0];
  }

  // Format last active time
  formatLastActive(lastActiveISO) {
    const lastActive = new Date(lastActiveISO);
    const now = new Date();
    const diffMs = now - lastActive;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return 'Over a week ago';
  }

  // Calculate global rank (simplified)
  calculateGlobalRank(problemsSolved) {
    // Simplified ranking based on problems solved
    if (problemsSolved === 0) return 10000;
    if (problemsSolved < 10) return 8000;
    if (problemsSolved < 50) return 5000;
    if (problemsSolved < 100) return 2000;
    if (problemsSolved < 200) return 1000;
    if (problemsSolved < 500) return 500;
    return Math.max(1, Math.floor(1000 / Math.log(problemsSolved + 1)));
  }

  // Get total problems for difficulty (mock data)
  getTotalProblemsForDifficulty(difficulty) {
    const totals = {
      'Easy': 100,
      'Medium': 150,
      'Hard': 80
    };
    return totals[difficulty] || 50;
  }

  // Update DSA progress based on actual solved problems
  updateDSAProgress(activity) {
    const dsaProgress = {
      overall: {
        solved: 0,
        total: 100,
        percentage: 0
      },
      topics: {}
    };

    // Calculate overall progress
    dsaProgress.overall.solved = activity.problemsSolved.length;
    dsaProgress.overall.percentage = Math.round((dsaProgress.overall.solved / dsaProgress.overall.total) * 100);

    // Calculate topic-wise progress
    const topics = ['Array', 'String', 'Tree', 'Graph', 'Dynamic Programming', 'Linked List', 'Stack', 'Queue', 'Greedy', 'Recursion'];
    topics.forEach(topic => {
      const solved = activity.problemsSolved.filter(p => p.topic === topic).length;
      const total = 10; // Assuming 10 problems per topic
      dsaProgress.topics[topic] = {
        solved,
        total,
        percentage: Math.round((solved / total) * 100)
      };
    });

    localStorage.setItem(this.DSA_PROGRESS_KEY, JSON.stringify(dsaProgress));
  }

  // Get user statistics
  getUserStats() {
    this.initializeUserData();
    const stats = localStorage.getItem(this.STATS_KEY);
    return stats ? JSON.parse(stats) : this.calculateStats(this.getActivityData());
  }

  // Get DSA progress
  getDSAProgress() {
    this.initializeUserData();
    const progress = localStorage.getItem(this.DSA_PROGRESS_KEY);
    return progress ? JSON.parse(progress) : { overall: { solved: 0, total: 100, percentage: 0 }, topics: {} };
  }

  // Get recent activity
  getRecentActivity() {
    const activity = this.getActivityData();
    const recentActivity = [];

    // Add recent problems solved
    const recentProblems = activity.problemsSolved
      .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
      .slice(0, 3)
      .map(problem => ({
        type: 'problem',
        title: problem.title,
        difficulty: problem.difficulty,
        status: 'Solved',
        time: this.formatLastActive(problem.solvedAt),
        points: this.getPointsForDifficulty(problem.difficulty),
        topic: problem.topic
      }));

    // Add recent contests
    const recentContests = activity.contestsParticipated
      .sort((a, b) => new Date(b.participatedAt) - new Date(a.participatedAt))
      .slice(0, 2)
      .map(contest => ({
        type: 'contest',
        title: contest.name,
        status: contest.isWon ? 'Won' : `Ranked ${contest.rank}`,
        time: this.formatLastActive(contest.participatedAt),
        points: contest.isWon ? 100 : 50
      }));

    // Add streak achievements
    if (activity.dailyStreaks.length > 0) {
      const currentStreak = this.calculateCurrentStreak(activity.dailyStreaks);
      if (currentStreak > 0) {
        recentActivity.push({
          type: 'streak',
          title: 'Daily Streak',
          status: `Day ${currentStreak}`,
          time: 'Today',
          points: currentStreak * 5
        });
      }
    }

    return [...recentProblems, ...recentContests, ...recentActivity]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);
  }

  // Get points for difficulty
  getPointsForDifficulty(difficulty) {
    const points = {
      'Easy': 10,
      'Medium': 25,
      'Hard': 50
    };
    return points[difficulty] || 10;
  }
}

// Export singleton instance
export const userActivityTracker = new UserActivityTracker();
