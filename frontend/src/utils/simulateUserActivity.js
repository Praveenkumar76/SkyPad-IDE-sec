// Simulate user activity for demonstration purposes
import { userActivityTracker } from './userActivityTracker';

export const simulateUserActivity = () => {
  // Check if we've already simulated activity
  if (localStorage.getItem('userActivitySimulated')) {
    return;
  }

  // Simulate some problems solved
  const sampleProblems = [
    { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', topic: 'Array', timeSpent: 15 },
    { id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'String', timeSpent: 20 },
    { id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Medium', topic: 'Linked List', timeSpent: 30 },
    { id: 'binary-tree-inorder', title: 'Binary Tree Inorder Traversal', difficulty: 'Medium', topic: 'Tree', timeSpent: 25 },
    { id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', timeSpent: 18 },
    { id: 'max-subarray', title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Array', timeSpent: 35 },
    { id: 'valid-anagram', title: 'Valid Anagram', difficulty: 'Easy', topic: 'String', timeSpent: 12 },
    { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', timeSpent: 22 },
    { id: 'house-robber', title: 'House Robber', difficulty: 'Medium', topic: 'Dynamic Programming', timeSpent: 28 },
    { id: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium', topic: 'Graph', timeSpent: 40 }
  ];

  // Record problems solved over the past few days
  const now = new Date();
  sampleProblems.forEach((problem, index) => {
    // Spread problems over the last 7 days
    const daysAgo = Math.floor(index / 2);
    const solvedAt = new Date(now);
    solvedAt.setDate(solvedAt.getDate() - daysAgo);
    solvedAt.setHours(now.getHours() - Math.floor(Math.random() * 24));
    
    // Record the problem solve
    userActivityTracker.recordProblemSolve(
      problem.id,
      problem.title,
      problem.difficulty,
      problem.topic,
      problem.timeSpent
    );
  });

  // Simulate some contest participation
  userActivityTracker.recordContestParticipation('contest-1', 'Weekly Contest 245', 156, false);
  userActivityTracker.recordContestParticipation('contest-2', 'Algorithm Challenge', 45, true);
  userActivityTracker.recordContestParticipation('contest-3', 'Data Structures Sprint', 89, false);

  // Simulate daily streaks for the last 5 days
  for (let i = 0; i < 5; i++) {
    const streakDate = new Date(now);
    streakDate.setDate(streakDate.getDate() - i);
    userActivityTracker.recordDailyStreak();
  }

  // Mark as simulated
  localStorage.setItem('userActivitySimulated', 'true');
  
  console.log('User activity simulation completed!');
};

// Function to add a new problem solve (for testing)
export const addProblemSolve = (problemId, title, difficulty, topic, timeSpent = 0) => {
  userActivityTracker.recordProblemSolve(problemId, title, difficulty, topic, timeSpent);
  console.log(`Recorded problem solve: ${title} (${difficulty})`);
};

// Function to add contest participation (for testing)
export const addContestParticipation = (contestId, contestName, rank, isWon = false) => {
  userActivityTracker.recordContestParticipation(contestId, contestName, rank, isWon);
  console.log(`Recorded contest participation: ${contestName}`);
};
