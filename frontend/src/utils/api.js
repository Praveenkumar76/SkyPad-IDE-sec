// The backend URL is now loaded from an environment variable.
// It will use your public Render URL in production and fall back to localhost for local development.
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API functions
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  },

  register: async (email, username, fullName, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, fullName, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return response.json();
  }
};

export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }
    
    return response.json();
  },

  solveProblem: async ({ problemId, title, difficulty, topic, timeSpent = 0, language = 'JavaScript' }) => {
    const response = await fetch(`${API_BASE_URL}/users/solve-problem`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ problemId, title, difficulty, topic, timeSpent, language })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Failed to record problem solve');
    }
    return data;
  }
};

export const rewardsAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch rewards profile');
    }
    
    return response.json();
  },

  getShop: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/shop`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch shop items');
    }
    
    return response.json();
  },

  purchaseItem: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/rewards/purchase`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itemId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to purchase item');
    }
    
    return response.json();
  },

  activateBooster: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/rewards/activate-booster`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itemId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate booster');
    }
    
    return response.json();
  },

  claimDaily: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/claim-daily`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to claim daily reward');
    }
    
    return response.json();
  },

  getLeaderboard: async (type = 'coins') => {
    const response = await fetch(`${API_BASE_URL}/rewards/leaderboard?type=${type}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch leaderboard');
    }
    
    return response.json();
  }
};