export const dsaSheetData = {
  topics: [
    {
      id: 'recursion',
      name: 'Recursion',
      icon: '🔄',
      color: 'from-blue-500 to-cyan-500',
      description: 'Master recursive thinking and backtracking algorithms',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'linkedlist',
      name: 'Linked List',
      icon: '🔗',
      color: 'from-green-500 to-emerald-500',
      description: 'Understand linked list operations and manipulations',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'array',
      name: 'Array',
      icon: '📊',
      color: 'from-purple-500 to-violet-500',
      description: 'Array manipulation and two-pointer techniques',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'string',
      name: 'String',
      icon: '📝',
      color: 'from-orange-500 to-red-500',
      description: 'String processing and pattern matching',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'stack',
      name: 'Stack',
      icon: '📚',
      color: 'from-indigo-500 to-blue-500',
      description: 'LIFO data structure and its applications',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'queue',
      name: 'Queue',
      icon: '🚶',
      color: 'from-teal-500 to-green-500',
      description: 'FIFO data structure and BFS algorithms',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'tree',
      name: 'Tree',
      icon: '🌳',
      color: 'from-yellow-500 to-orange-500',
      description: 'Binary trees, BST, and tree traversals',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'graph',
      name: 'Graph',
      icon: '🕸️',
      color: 'from-pink-500 to-rose-500',
      description: 'Graph algorithms and shortest path problems',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'dynamic-programming',
      name: 'Dynamic Programming',
      icon: '⚡',
      color: 'from-amber-500 to-yellow-500',
      description: 'Memoization and tabulation techniques',
      totalProblems: 10,
      solvedProblems: 0
    },
    {
      id: 'greedy',
      name: 'Greedy',
      icon: '🎯',
      color: 'from-lime-500 to-green-500',
      description: 'Greedy algorithms and optimization problems',
      totalProblems: 10,
      solvedProblems: 0
    }
  ],
  
  problems: {
    recursion: [
      {
        id: 'rec-1',
        title: 'Factorial',
        difficulty: 'Easy',
        description: 'Calculate factorial of a number using recursion',
        link: '/solve/rec-1',
        isSolved: false,
        problem: {
          title: 'Factorial',
          description: 'Write a function to calculate the factorial of a given number n using recursion.\n\n**Example:**\n- Input: n = 5\n- Output: 120\n- Explanation: 5! = 5 × 4 × 3 × 2 × 1 = 120\n\n**Constraints:**\n- 0 ≤ n ≤ 12\n- The result will fit in a 32-bit integer.',
          sampleTestCases: [
            { input: '5', expectedOutput: '120', explanation: '5! = 120' },
            { input: '3', expectedOutput: '6', explanation: '3! = 6' },
            { input: '0', expectedOutput: '1', explanation: '0! = 1' }
          ],
          hiddenTestCases: [
            { input: '1', expectedOutput: '1' },
            { input: '4', expectedOutput: '24' },
            { input: '6', expectedOutput: '720' },
            { input: '10', expectedOutput: '3628800' }
          ],
          constraints: '0 ≤ n ≤ 12',
          allowedLanguages: ['JavaScript', 'Python', 'Java', 'C++', 'C#']
        }
      },
      {
        id: 'rec-2',
        title: 'Fibonacci Series',
        difficulty: 'Easy',
        description: 'Generate Fibonacci series using recursion',
        link: '/solve/rec-2',
        isSolved: false,
        problem: {
          title: 'Fibonacci Series',
          description: 'Write a function to return the nth Fibonacci number using recursion.\n\n**Fibonacci Sequence:** 0, 1, 1, 2, 3, 5, 8, 13, 21, ...\n\n**Example:**\n- Input: n = 6\n- Output: 8\n- Explanation: F(6) = F(5) + F(4) = 5 + 3 = 8\n\n**Constraints:**\n- 0 ≤ n ≤ 30',
          sampleTestCases: [
            { input: '6', expectedOutput: '8', explanation: 'F(6) = 8' },
            { input: '2', expectedOutput: '1', explanation: 'F(2) = 1' },
            { input: '0', expectedOutput: '0', explanation: 'F(0) = 0' }
          ],
          hiddenTestCases: [
            { input: '1', expectedOutput: '1' },
            { input: '3', expectedOutput: '2' },
            { input: '7', expectedOutput: '13' },
            { input: '10', expectedOutput: '55' }
          ],
          constraints: '0 ≤ n ≤ 30',
          allowedLanguages: ['JavaScript', 'Python', 'Java', 'C++', 'C#']
        }
      },
      {
        id: 'rec-3',
        title: 'Tower of Hanoi',
        difficulty: 'Medium',
        description: 'Solve Tower of Hanoi puzzle using recursion',
        link: '/solve/rec-3',
        isSolved: false
      },
      {
        id: 'rec-4',
        title: 'Permutations',
        difficulty: 'Medium',
        description: 'Generate all permutations of a string',
        link: '/solve/rec-4',
        isSolved: false
      },
      {
        id: 'rec-5',
        title: 'N-Queens Problem',
        difficulty: 'Hard',
        description: 'Place N queens on a chessboard without attacking each other',
        link: '/solve/rec-5',
        isSolved: false
      }
    ],
    linkedlist: [
      {
        id: 'll-1',
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        description: 'Reverse a singly linked list',
        link: '/solve/ll-1',
        isSolved: false
      },
      {
        id: 'll-2',
        title: 'Detect Cycle',
        difficulty: 'Medium',
        description: 'Detect if a linked list has a cycle',
        link: '/solve/ll-2',
        isSolved: false
      },
      {
        id: 'll-3',
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        description: 'Merge two sorted linked lists',
        link: '/solve/ll-3',
        isSolved: false
      },
      {
        id: 'll-4',
        title: 'Remove Nth Node',
        difficulty: 'Medium',
        description: 'Remove the nth node from end of list',
        link: '/solve/ll-4',
        isSolved: false
      },
      {
        id: 'll-5',
        title: 'Copy List with Random Pointer',
        difficulty: 'Hard',
        description: 'Deep copy a linked list with random pointers',
        link: '/solve/ll-5',
        isSolved: false
      }
    ],
    array: [
      {
        id: 'arr-1',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: 'Find two numbers that add up to target',
        link: '/solve/arr-1',
        isSolved: false
      },
      {
        id: 'arr-2',
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        description: 'Find the contiguous subarray with maximum sum',
        link: '/solve/arr-2',
        isSolved: false
      },
      {
        id: 'arr-3',
        title: '3Sum',
        difficulty: 'Medium',
        description: 'Find all unique triplets that sum to zero',
        link: '/solve/arr-3',
        isSolved: false
      },
      {
        id: 'arr-4',
        title: 'Container With Most Water',
        difficulty: 'Medium',
        description: 'Find two lines that together with x-axis forms a container',
        link: '/solve/arr-4',
        isSolved: false
      },
      {
        id: 'arr-5',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        description: 'Calculate trapped rainwater between bars',
        link: '/solve/arr-5',
        isSolved: false
      }
    ],
    string: [
      {
        id: 'str-1',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        description: 'Check if two strings are anagrams',
        link: '/solve/str-1',
        isSolved: false
      },
      {
        id: 'str-2',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        description: 'Find length of longest substring without repeating characters',
        link: '/solve/str-2',
        isSolved: false
      },
      {
        id: 'str-3',
        title: 'Longest Palindromic Substring',
        difficulty: 'Medium',
        description: 'Find the longest palindromic substring',
        link: '/solve/str-3',
        isSolved: false
      },
      {
        id: 'str-4',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        description: 'Check if parentheses are valid',
        link: '/solve/str-4',
        isSolved: false
      },
      {
        id: 'str-5',
        title: 'Edit Distance',
        difficulty: 'Hard',
        description: 'Find minimum operations to convert one string to another',
        link: '/solve/str-5',
        isSolved: false
      }
    ],
    stack: [
      {
        id: 'stk-1',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        description: 'Check if parentheses are valid using stack',
        link: '/solve/stk-1',
        isSolved: false
      },
      {
        id: 'stk-2',
        title: 'Next Greater Element',
        difficulty: 'Medium',
        description: 'Find next greater element for each element',
        link: '/solve/stk-2',
        isSolved: false
      },
      {
        id: 'stk-3',
        title: 'Largest Rectangle in Histogram',
        difficulty: 'Hard',
        description: 'Find largest rectangle area in histogram',
        link: '/solve/stk-3',
        isSolved: false
      }
    ],
    queue: [
      {
        id: 'que-1',
        title: 'Implement Queue using Stacks',
        difficulty: 'Easy',
        description: 'Implement queue using two stacks',
        link: '/solve/que-1',
        isSolved: false
      },
      {
        id: 'que-2',
        title: 'Binary Tree Level Order Traversal',
        difficulty: 'Medium',
        description: 'Traverse binary tree level by level',
        link: '/solve/que-2',
        isSolved: false
      }
    ],
    tree: [
      {
        id: 'tree-1',
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        description: 'Find maximum depth of binary tree',
        link: '/solve/tree-1',
        isSolved: false
      },
      {
        id: 'tree-2',
        title: 'Validate Binary Search Tree',
        difficulty: 'Medium',
        description: 'Check if binary tree is valid BST',
        link: '/solve/tree-2',
        isSolved: false
      },
      {
        id: 'tree-3',
        title: 'Lowest Common Ancestor',
        difficulty: 'Medium',
        description: 'Find lowest common ancestor of two nodes',
        link: '/solve/tree-3',
        isSolved: false
      }
    ],
    graph: [
      {
        id: 'graph-1',
        title: 'Number of Islands',
        difficulty: 'Medium',
        description: 'Count number of islands in 2D grid',
        link: '/solve/graph-1',
        isSolved: false
      },
      {
        id: 'graph-2',
        title: 'Course Schedule',
        difficulty: 'Medium',
        description: 'Check if all courses can be completed',
        link: '/solve/graph-2',
        isSolved: false
      },
      {
        id: 'graph-3',
        title: 'Word Ladder',
        difficulty: 'Hard',
        description: 'Find shortest transformation sequence',
        link: '/solve/graph-3',
        isSolved: false
      }
    ],
    'dynamic-programming': [
      {
        id: 'dp-1',
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        description: 'Find number of ways to climb stairs',
        link: '/solve/dp-1',
        isSolved: false
      },
      {
        id: 'dp-2',
        title: 'House Robber',
        difficulty: 'Medium',
        description: 'Maximize money robbed from houses',
        link: '/solve/dp-2',
        isSolved: false
      },
      {
        id: 'dp-3',
        title: 'Longest Common Subsequence',
        difficulty: 'Medium',
        description: 'Find longest common subsequence',
        link: '/solve/dp-3',
        isSolved: false
      }
    ],
    greedy: [
      {
        id: 'greedy-1',
        title: 'Jump Game',
        difficulty: 'Medium',
        description: 'Check if you can reach the last index',
        link: '/solve/greedy-1',
        isSolved: false
      },
      {
        id: 'greedy-2',
        title: 'Gas Station',
        difficulty: 'Medium',
        description: 'Find starting gas station for circular route',
        link: '/solve/greedy-2',
        isSolved: false
      }
    ]
  }
};
