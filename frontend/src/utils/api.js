// Resolve API base URL from environment with safe fallbacks
const envBase = (
  import.meta?.env?.VITE_API_URL ||
  import.meta?.env?.VITE_BACKEND_URL ||
  import.meta?.env?.PUBLIC_API_URL ||
  ''
);

export const API_BASE_URL = (() => {
  const isBrowser = typeof window !== 'undefined';
  const origin = isBrowser && window.location?.origin ? window.location.origin.replace(/\/$/, '') : '';
  const trimmedEnv = typeof envBase === 'string' ? envBase.trim().replace(/\/$/, '') : '';

  // If an env base is provided and it is not pointing to localhost in production, use it
  if (trimmedEnv) {
    const isEnvLocalhost = /^(http|https):\/\/localhost(?::\d+)?/i.test(trimmedEnv);
    const isProdHost = isBrowser && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    if (!isEnvLocalhost || !isProdHost) {
      console.log('Using environment API URL:', trimmedEnv);
      return trimmedEnv;
    }
    // Ignore localhost env in production; fall through to origin
  }

  // Production fallback - use Render backend URL
  if (isBrowser && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('Using production API URL: https://skypad-ide.onrender.com/api');
    return 'https://skypad-ide.onrender.com/api';
  }

  if (origin) {
    console.log('Using origin-based API URL:', `${origin}/api`);
    return `${origin}/api`;
  }
  console.log('Using localhost API URL: http://localhost:5000/api');
  return 'http://localhost:5000/api';
})();

// Helper function to get auth headers
export const getAuthHeaders = () => {
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
  
  getSolvedProblems: async () => {
    const response = await fetch(`${API_BASE_URL}/users/solved`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch solved problems');
    }
    
    return response.json();
  },
  
  markProblemSolved: async (problemId, language) => {
    const response = await fetch(`${API_BASE_URL}/users/solved`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ problemId, language }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark problem as solved');
    }
    
    return response.json();
  }
};
