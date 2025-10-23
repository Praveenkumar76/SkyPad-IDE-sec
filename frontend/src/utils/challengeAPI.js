// Match the same logic as api.js for consistency
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://skypad-ide.onrender.com/api');

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

export const challengeAPI = {
  // Get all problems for challenge selection
  getProblems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/problems`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      const data = await parseResponse(response, 'Fetch problems');
      return data.problems || data || [];
    } catch (error) {
      console.error('Get problems error:', error);
      throw error;
    }
  },

  // Create a new challenge room
  createRoom: async (problemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/rooms/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ problemId }),
      });
      
      return await parseResponse(response, 'Create room');
    } catch (error) {
      console.error('Create room error:', error);
      throw error;
    }
  },

  // Join an existing challenge room
  joinRoom: async (roomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/rooms/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roomId }),
      });
      
      return await parseResponse(response, 'Join room');
    } catch (error) {
      console.error('Join room error:', error);
      throw error;
    }
  },

  // Get room details
  getRoomDetails: async (roomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/rooms/${roomId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return await parseResponse(response, 'Get room details');
    } catch (error) {
      console.error('Get room details error:', error);
      throw error;
    }
  },

  // Submit code for evaluation
  submitCode: async (roomId, code, language) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/rooms/${roomId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code, language }),
      });
      
      return await parseResponse(response, 'Submit code');
    } catch (error) {
      console.error('Submit code error:', error);
      throw error;
    }
  },

  // Mark player as ready to start match
  markReady: async (roomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/rooms/${roomId}/ready`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      return await parseResponse(response, 'Mark ready');
    } catch (error) {
      console.error('Mark ready error:', error);
      throw error;
    }
  }
};

// Log the API base URL on startup for debugging
console.log('🎮 Challenge API Base URL:', API_BASE_URL);

