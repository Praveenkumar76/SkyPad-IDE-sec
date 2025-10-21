const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const challengeAPI = {
  // Get all problems for challenge selection
  getProblems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/problems`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      
      const data = await response.json();
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
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create room');
      }
      
      return response.json();
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
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join room');
      }
      
      return response.json();
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
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get room details');
      }
      
      return response.json();
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
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit code');
      }
      
      return response.json();
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
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark ready');
      }
      
      return response.json();
    } catch (error) {
      console.error('Mark ready error:', error);
      throw error;
    }
  }
};

