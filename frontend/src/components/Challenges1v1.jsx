import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengeAPI } from '../utils/challengeAPI';
import { initializeSocket } from '../utils/socket';
import './Challenges1v1.css';

const Challenges1v1 = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initialize socket
    initializeSocket(token);

    // Fetch problems for challenge creation
    fetchProblems();
  }, [navigate]);

  const fetchProblems = async () => {
    try {
      const fetchedProblems = await challengeAPI.getProblems();
      console.log('Problems fetched for CodeDuel:', fetchedProblems);
      
      if (fetchedProblems && fetchedProblems.length > 0) {
        setProblems(fetchedProblems);
        setFilteredProblems(fetchedProblems);
        console.log(`Loaded ${fetchedProblems.length} problems from database`);
      } else {
        console.log('No problems in database');
        setProblems([]);
        setFilteredProblems([]);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
      setProblems([]);
      setFilteredProblems([]);
    }
  };


  // Filter problems based on search and difficulty
  useEffect(() => {
    let filtered = problems;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (problem.description && problem.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(problem =>
        problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    setFilteredProblems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, difficultyFilter, problems]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
  const startIndex = (currentPage - 1) * problemsPerPage;
  const endIndex = startIndex + problemsPerPage;
  const currentProblems = filteredProblems.slice(startIndex, endIndex);

  const handleCreateRoom = async () => {
    if (!selectedProblem) {
      setError('Please select a problem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await challengeAPI.createRoom(selectedProblem);
      // Navigate to lobby
      navigate(`/challenge/${result.roomId}/lobby`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomIdInput.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await challengeAPI.joinRoom(roomIdInput.trim());
      // Navigate to lobby
      navigate(`/challenge/${roomIdInput.trim().toUpperCase()}/lobby`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="challenges-1v1-page">
      <div className="challenges-container">
        <div className="challenges-header">
          <h1>1v1 CodeDuel Challenge</h1>
          <p>Compete head-to-head with another coder in real-time!</p>
        </div>

        <div className="challenge-actions">
          <div className="action-card">
            <div className="card-icon">🎮</div>
            <h2>Create Room</h2>
            <p>Select a problem and create a challenge room for others to join</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="action-btn create-btn"
            >
              Create New Room
            </button>
          </div>

          <div className="action-card">
            <div className="card-icon">🚪</div>
            <h2>Join Room</h2>
            <p>Enter a room ID to join an existing challenge</p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="action-btn join-btn"
            >
              Join Existing Room
            </button>
          </div>
        </div>

        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create or Join</h3>
              <p>Create a room with a problem or join using a room ID</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Wait for Opponent</h3>
              <p>Wait in the lobby for your opponent to join (5 min max)</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Code & Compete</h3>
              <p>Race to solve the problem - first to pass all tests wins!</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>View Results</h3>
              <p>See match results and earn rewards for winning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Challenge Room</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <h3>Select a Problem</h3>
              {error && <div className="error-message">{error}</div>}
              
              {/* Search and Filter Controls */}
              <div className="search-filter-container">
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${difficultyFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setDifficultyFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${difficultyFilter === 'easy' ? 'active' : ''}`}
                    onClick={() => setDifficultyFilter('easy')}
                  >
                    Easy
                  </button>
                  <button
                    className={`filter-btn ${difficultyFilter === 'medium' ? 'active' : ''}`}
                    onClick={() => setDifficultyFilter('medium')}
                  >
                    Medium
                  </button>
                  <button
                    className={`filter-btn ${difficultyFilter === 'hard' ? 'active' : ''}`}
                    onClick={() => setDifficultyFilter('hard')}
                  >
                    Hard
                  </button>
                </div>
              </div>
              
              <div className="problems-list">
                {filteredProblems.length === 0 ? (
                  <div className="empty-state">
                    {problems.length === 0 ? (
                      <>
                        <p>No problems available for CodeDuel challenges.</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Please upload problems via the "Upload Question" page first.
                        </p>
                        <button
                          onClick={() => navigate('/upload-question')}
                          className="mt-4 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
                        >
                          Upload Problem
                        </button>
                      </>
                    ) : (
                      <p>No problems match your search criteria.</p>
                    )}
                  </div>
                ) : (
                  <>
                    {currentProblems.map((problem) => (
                      <div
                        key={problem._id || problem.id}
                        className={`problem-item ${selectedProblem === (problem._id || problem.id) ? 'selected' : ''}`}
                        onClick={() => setSelectedProblem(problem._id || problem.id)}
                      >
                        <div className="problem-title">{problem.title}</div>
                        <span className={`problem-difficulty ${problem.difficulty.toLowerCase()}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="pagination-controls">
                        <button
                          className="pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        <div className="pagination-info">
                          <span>Page {currentPage} of {totalPages}</span>
                          <span className="text-sm text-gray-400">
                            ({filteredProblems.length} problems total)
                          </span>
                        </div>
                        <button
                          className="pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateRoom}
                disabled={loading || !selectedProblem}
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Join Challenge Room</h2>
              <button
                className="modal-close"
                onClick={() => setShowJoinModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <h3>Enter Room ID</h3>
              {error && <div className="error-message">{error}</div>}
              
              <input
                type="text"
                placeholder="e.g., ABC-123"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                className="room-id-input"
                maxLength={7}
              />
              <p className="input-hint">Room IDs are in the format: ABC-123</p>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleJoinRoom}
                disabled={loading || !roomIdInput.trim()}
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges1v1;

