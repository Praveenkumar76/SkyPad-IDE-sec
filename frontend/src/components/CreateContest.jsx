import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdAdd, 
  MdRemove, 
  MdEdit, 
  MdDelete,
  MdDragIndicator,
  MdPreview,
  MdSave,
  MdPublish,
  MdSchedule,
  MdLanguage,
  MdPeople,
  MdCode,
  MdTimer,
  MdCheckCircle,
  MdClose
} from 'react-icons/md';
import { API_BASE_URL } from '../utils/api';

const CreateContest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Contest form data
  const [contestData, setContestData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'Public',
    tags: [],
    allowedLanguages: ['JavaScript', 'Python', 'Java', 'C++'],
    collaboration: false,
    leaderboard: true,
    participants: []
  });

  const [newTag, setNewTag] = useState('');
  const [newParticipant, setNewParticipant] = useState('');

  const steps = [
    { id: 1, title: 'Contest Details', description: 'Basic information' },
    { id: 2, title: 'Add Problems', description: 'Select problems' },
    { id: 3, title: 'Settings & Publish', description: 'Final configuration' }
  ];

  const difficultyColors = {
    Easy: 'text-green-400 bg-green-500/20',
    Medium: 'text-yellow-400 bg-yellow-500/20',
    Hard: 'text-red-400 bg-red-500/20'
  };

  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'];

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoadingProblems(true);
      const response = await fetch(`${API_BASE_URL}/problems`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems || data || []);
      }
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleInputChange = (field, value) => {
    setContestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !contestData.tags.includes(newTag.trim())) {
      setContestData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setContestData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !contestData.participants.includes(newParticipant.trim())) {
      setContestData(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant.trim()]
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (participantToRemove) => {
    setContestData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participantToRemove)
    }));
  };

  const toggleLanguage = (language) => {
    setContestData(prev => ({
      ...prev,
      allowedLanguages: prev.allowedLanguages.includes(language)
        ? prev.allowedLanguages.filter(lang => lang !== language)
        : [...prev.allowedLanguages, language]
    }));
  };

  const addProblem = (problem) => {
    if (!selectedProblems.find(p => p._id === problem._id)) {
      setSelectedProblems(prev => [...prev, problem]);
    }
    setShowProblemModal(false);
  };

  const removeProblem = (problemId) => {
    setSelectedProblems(prev => prev.filter(p => p._id !== problemId));
  };

  const moveProblem = (fromIndex, toIndex) => {
    const newProblems = [...selectedProblems];
    const [movedProblem] = newProblems.splice(fromIndex, 1);
    newProblems.splice(toIndex, 0, movedProblem);
    setSelectedProblems(newProblems);
  };

  const calculateDuration = () => {
    if (contestData.startTime && contestData.endTime) {
      const start = new Date(contestData.startTime);
      const end = new Date(contestData.endTime);
      const diffMs = end - start;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
    return '0h 0m';
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return contestData.title.trim() && contestData.description.trim() && 
               contestData.startTime && contestData.endTime &&
               new Date(contestData.endTime) > new Date(contestData.startTime);
      case 2:
        return selectedProblems.length > 0;
      case 3:
        return contestData.allowedLanguages.length > 0;
      default:
        return false;
    }
  };

  const handleSaveDraft = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...contestData,
          problems: selectedProblems.map(p => p._id),
          status: 'Draft',
          duration: calculateDuration()
        })
      });

      if (response.ok) {
        alert('Contest saved as draft!');
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  const handlePublish = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert('Please complete all required fields before publishing.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...contestData,
          problems: selectedProblems.map(p => p._id),
          status: 'Published',
          duration: calculateDuration()
        })
      });

      if (response.ok) {
        alert('Contest published successfully!');
        navigate('/challenges');
      } else {
        throw new Error('Failed to publish contest');
      }
    } catch (error) {
      console.error('Error publishing contest:', error);
      alert('Failed to publish contest. Please try again.');
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      alert('Please complete all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/challenges')}
                className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                title="Back to Challenges"
              >
                <MdArrowBack className="w-6 h-6 text-white" />
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  Create Contest
                </h1>
                <p className="text-gray-300 mt-2">Build and publish coding contests</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveDraft}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <MdSave className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              <button
                onClick={handlePublish}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                <MdPublish className="w-4 h-4" />
                <span>Publish Contest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 border-violet-500 text-white'
                    : 'border-white/30 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <MdCheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-bold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <div className={`font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-400'}`}>
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-400">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          {currentStep === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6">Contest Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Contest Name *
                  </label>
                  <input
                    type="text"
                    value={contestData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter contest name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Contest Type
                  </label>
                  <select
                    value={contestData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="Public" className="bg-gray-800">Public</option>
                    <option value="Private" className="bg-gray-800">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={contestData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your contest..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={contestData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={contestData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              {contestData.startTime && contestData.endTime && (
                <div className="bg-violet-500/20 border border-violet-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-violet-300">
                    <MdTimer className="w-5 h-5" />
                    <span className="font-medium">Duration: {calculateDuration()}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {contestData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <MdClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded-lg transition-colors"
                  >
                    <MdAdd className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Add Problems</h2>
                <button
                  onClick={() => setShowProblemModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <MdAdd className="w-4 h-4" />
                  <span>Add Problem</span>
                </button>
              </div>

              {selectedProblems.length > 0 ? (
                <div className="space-y-4">
                  {selectedProblems.map((problem, index) => (
                    <div
                      key={problem._id}
                      className="flex items-center space-x-4 p-4 bg-white/5 border border-white/20 rounded-lg hover:border-violet-400/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-2 text-gray-400">
                        <MdDragIndicator className="w-5 h-5" />
                        <span className="font-mono text-sm">{index + 1}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{problem.title}</h3>
                        <p className="text-gray-300 text-sm line-clamp-2">{problem.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {problem.tags?.join(', ')}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeProblem(problem._id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No problems added yet</div>
                  <p className="text-gray-500">Click "Add Problem" to get started</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6">Settings & Publish</h2>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-4">
                  Allowed Languages *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {languages.map((language) => (
                    <label
                      key={language}
                      className="flex items-center space-x-2 p-3 bg-white/5 border border-white/20 rounded-lg hover:border-violet-400/50 cursor-pointer transition-all duration-300"
                    >
                      <input
                        type="checkbox"
                        checked={contestData.allowedLanguages.includes(language)}
                        onChange={() => toggleLanguage(language)}
                        className="w-4 h-4 text-violet-500 bg-white/10 border-white/20 rounded focus:ring-violet-500"
                      />
                      <span className="text-white text-sm">{language}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MdCode className="w-5 h-5 text-violet-400" />
                    <div>
                      <div className="text-white font-medium">Code Collaboration</div>
                      <div className="text-gray-400 text-sm">Allow participants to collaborate</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contestData.collaboration}
                      onChange={(e) => handleInputChange('collaboration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MdPeople className="w-5 h-5 text-violet-400" />
                    <div>
                      <div className="text-white font-medium">Live Leaderboard</div>
                      <div className="text-gray-400 text-sm">Show real-time rankings</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contestData.leaderboard}
                      onChange={(e) => handleInputChange('leaderboard', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                  </label>
                </div>
              </div>

              {contestData.type === 'Private' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Invite Participants
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {contestData.participants.map((participant, index) => (
                      <span
                        key={index}
                        className="flex items-center space-x-1 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm"
                      >
                        <span>{participant}</span>
                        <button
                          onClick={() => removeParticipant(participant)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <MdClose className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                      placeholder="Enter username or email"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400"
                    />
                    <button
                      onClick={addParticipant}
                      className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded-lg transition-colors"
                    >
                      <MdAdd className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/20">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <MdPreview className="w-4 h-4 mr-2" />
                Preview
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <span>Next</span>
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <MdPublish className="w-4 h-4" />
                  <span>Publish Contest</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Problem Selection Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Select Problems</h3>
              <button
                onClick={() => setShowProblemModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {loadingProblems ? (
                <div className="text-center py-8">
                  <div className="text-gray-300">Loading problems...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {problems.map((problem) => (
                    <div
                      key={problem._id}
                      onClick={() => addProblem(problem)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-violet-400/50 rounded-lg cursor-pointer transition-all duration-300"
                    >
                      <h4 className="text-white font-medium mb-2">{problem.title}</h4>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{problem.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {problem.tags?.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateContest;
