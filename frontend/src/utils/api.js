// Use relative path to leverage Vite proxy
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to parse response with better error handling
const parseResponse = async (response, actionName) => {
  const contentType = response.headers.get('content-type');
  
  // Check if response is HTML instead of JSON (common when API is not found)
  if (contentType && contentType.includes('text/html')) {
    console.error(`Received HTML instead of JSON from ${response.url}`);
    throw new Error(
      `Backend API not found or not responding correctly. ` +
      `Please ensure the backend is running and the API URL is correct. ` +
      `(Expected JSON but got HTML - likely a 404 error)`
    );
  }
  
  // Try to parse JSON response
  try {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `${actionName} failed`);
    }
    
    return data;
  } catch (error) {
    // If JSON parsing fails
    if (error instanceof SyntaxError) {
      console.error(`Failed to parse JSON response from ${response.url}:`, error);
      throw new Error(
        `Backend returned invalid response. ` +
        `The server may be down or misconfigured.`
      );
    }
    throw error;
  }
};

// API functions
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      return await parseResponse(response, 'Login');
    } catch (error) {
      // Network errors (backend completely unreachable)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  },

  register: async (email, username, fullName, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, fullName, password }),
      });
      
      return await parseResponse(response, 'Registration');
    } catch (error) {
      // Network errors (backend completely unreachable)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  }
};

export const userAPI = {
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return await parseResponse(response, 'Fetch profile');
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  }
};

export const rewardsAPI = {
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return await parseResponse(response, 'Fetch rewards profile');
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  },

  getShop: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/shop`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return await parseResponse(response, 'Fetch shop items');
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  },

  purchaseItem: async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/purchase`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ itemId }),
      });
      
      return await parseResponse(response, 'Purchase item');
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  },

  activateBooster: async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/activate-booster`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ itemId }),
      });
      
      return await parseResponse(response, 'Activate booster');
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  },

  claimDaily: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/claim-daily`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      return await parseResponse(response, 'Claim daily reward');
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  },

  getLeaderboard: async (type = 'coins') => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/leaderboard?type=${type}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return await parseResponse(response, 'Fetch leaderboard');
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error when trying to reach backend:', error);
        throw new Error(
          `Cannot connect to backend server. ` +
          `Please check if the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }
  }
};