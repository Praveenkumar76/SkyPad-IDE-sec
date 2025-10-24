import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdAdd, 
  MdDelete, 
  MdCode, 
  MdTimer, 
  MdMemory, 
  MdTag,
  MdSave,
  MdArrowBack
} from 'react-icons/md';

const QuestionUpload = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    constraints: '',
    timeLimit: 1000,
    memoryLimit: 256,
    tags: '',
    allowedLanguages: ['JavaScript'],
    sampleTestCases: [{ input: '', output: '', explanation: '' }],
    hiddenTestCases: [{ input: '', output: '' }]
  });

  const [errors, setErrors] = useState({});

  const programmingLanguages = [
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'Python', label: 'Python' },
    { value: 'Java', label: 'Java' },
    { value: 'C++', label: 'C++' },
    { value: 'C', label: 'C' }
  ];

  const difficulties = [
    { value: 'Easy', label: 'Easy', color: 'text-green-400' },
    { value: 'Medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'Hard', label: 'Hard', color: 'text-red-400' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      allowedLanguages: prev.allowedLanguages.includes(language)
        ? prev.allowedLanguages.filter(lang => lang !== language)
        : [...prev.allowedLanguages, language]
    }));
  };

  const addSampleTestCase = () => {
    setFormData(prev => ({
      ...prev,
      sampleTestCases: [...prev.sampleTestCases, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeSampleTestCase = (index) => {
    if (formData.sampleTestCases.length > 1) {
      setFormData(prev => ({
        ...prev,
        sampleTestCases: prev.sampleTestCases.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSampleTestCase = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sampleTestCases: prev.sampleTestCases.map((testCase, i) => 
        i === index ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

  const addHiddenTestCase = () => {
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: [...prev.hiddenTestCases, { input: '', output: '' }]
    }));
  };

  const removeHiddenTestCase = (index) => {
    if (formData.hiddenTestCases.length > 1) {
      setFormData(prev => ({
        ...prev,
        hiddenTestCases: prev.hiddenTestCases.filter((_, i) => i !== index)
      }));
    }
  };

  const updateHiddenTestCase = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: prev.hiddenTestCases.map((testCase, i) => 
        i === index ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.constraints.trim()) newErrors.constraints = 'Constraints are required';
    if (formData.allowedLanguages.length === 0) newErrors.allowedLanguages = 'At least one language must be selected';
    
    // Validate sample test cases
    formData.sampleTestCases.forEach((testCase, index) => {
      if (!testCase.input.trim()) newErrors[`sampleInput${index}`] = 'Input is required';
      if (!testCase.output.trim()) newErrors[`sampleOutput${index}`] = 'Output is required';
    });

    // Validate hidden test cases
    formData.hiddenTestCases.forEach((testCase, index) => {
      if (!testCase.input.trim()) newErrors[`hiddenInput${index}`] = 'Input is required';
      if (!testCase.output.trim()) newErrors[`hiddenOutput${index}`] = 'Output is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addToDSASheet = (problem) => {
    // Map tags to DSA sheet topics
    const tagToTopic = {
      'recursion': 'recursion',
      'linkedlist': 'linkedlist',
      'array': 'array',
      'string': 'string',
      'stack': 'stack',
      'queue': 'queue',
      'tree': 'tree',
      'graph': 'graph',
      'dynamic-programming': 'dynamic-programming',
      'dp': 'dynamic-programming',
      'greedy': 'greedy'
    };

    // Find matching topic
    const tags = problem.tags || [];
    let matchedTopic = null;
    
    for (const tag of tags) {
      const lowerTag = tag.toLowerCase().trim();
      if (tagToTopic[lowerTag]) {
        matchedTopic = tagToTopic[lowerTag];
        break;
      }
    }

    if (matchedTopic) {
      // Add to localStorage for DSA sheet integration
      const dsaProblems = JSON.parse(localStorage.getItem('dsaProblems') || '{}');
      if (!dsaProblems[matchedTopic]) {
        dsaProblems[matchedTopic] = [];
      }
      
      const dsaProblem = {
        id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.description,
        link: `/solve/${problem._id}`,
        isSolved: false,
        problem: {
          title: problem.title,
          description: problem.description,
          sampleTestCases: problem.sampleTestCases || [],
          hiddenTestCases: problem.hiddenTestCases || [],
          constraints: problem.constraints || '',
          allowedLanguages: problem.allowedLanguages || ['JavaScript']
        }
      };
      
      dsaProblems[matchedTopic].push(dsaProblem);
      localStorage.setItem('dsaProblems', JSON.stringify(dsaProblems));
      console.log(`Question added to DSA sheet under topic: ${matchedTopic}`);
      console.log('Updated DSA problems:', dsaProblems);
    } else {
      console.log('Question has no matching tags for DSA sheet - will only appear in Problems section');
      console.log('Available tags:', tags);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to upload questions');
      }

      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload question');
      }

      const result = await response.json();
      
      // Add to DSA sheet based on tags
      addToDSASheet(result);
      
      // Trigger a custom event to refresh DSA sheet
      window.dispatchEvent(new CustomEvent('dsaProblemsUpdated'));
      
      alert('Question uploaded successfully and added to DSA sheet!');
      navigate('/dsa-sheet');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/30 to-black relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none watermark-pulse">
        <span className="text-9xl font-bold text-violet-400/30">SKYPAD</span>
      </div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
            >
              <MdArrowBack className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                Upload Question
              </h1>
              <p className="text-gray-300">Create a new coding problem for the community</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="dashboard-card rounded-xl p-6">
              <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 mb-6">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-medium-contrast text-sm font-medium mb-2">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors ${
                      errors.title ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter question title"
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-medium-contrast text-sm font-medium mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400 transition-colors"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value} className="bg-gray-800">
                        {diff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-medium-contrast text-sm font-medium mb-2">
                  Problem Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={8}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                    errors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Describe the problem in detail..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-medium-contrast text-sm font-medium mb-2">
                  Constraints *
                </label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) => handleInputChange('constraints', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                    errors.constraints ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="1 ≤ n ≤ 10^5, 1 ≤ arr[i] ≤ 10^9"
                />
                {errors.constraints && <p className="text-red-400 text-sm mt-1">{errors.constraints}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-medium-contrast text-sm font-medium mb-2">
                    <MdTimer className="w-4 h-4 inline mr-1" />
                    Time Limit (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors"
                    min="100"
                    max="10000"
                  />
                </div>

                <div>
                  <label className="block text-medium-contrast text-sm font-medium mb-2">
                    <MdMemory className="w-4 h-4 inline mr-1" />
                    Memory Limit (MB)
                  </label>
                  <input
                    type="number"
                    value={formData.memoryLimit}
                    onChange={(e) => handleInputChange('memoryLimit', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors"
                    min="64"
                    max="1024"
                  />
                </div>

                <div>
                  <label className="block text-medium-contrast text-sm font-medium mb-2">
                    <MdTag className="w-4 h-4 inline mr-1" />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors"
                    placeholder="array, sorting, two-pointers"
                  />
                </div>
              </div>
            </div>

            {/* Programming Languages */}
            <div className="dashboard-card rounded-xl p-6">
              <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 mb-6">
                <MdCode className="w-6 h-6 inline mr-2" />
                Supported Languages *
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {programmingLanguages.map(lang => (
                  <label key={lang.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowedLanguages.includes(lang.value)}
                      onChange={() => handleLanguageToggle(lang.value)}
                      className="w-5 h-5 accent-violet-500"
                    />
                    <span className="text-white font-medium">{lang.label}</span>
                  </label>
                ))}
              </div>
              {errors.allowedLanguages && <p className="text-red-400 text-sm mt-2">{errors.allowedLanguages}</p>}
            </div>

            {/* Sample Test Cases */}
            <div className="dashboard-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300">
                  Sample Test Cases *
                </h3>
                <button
                  type="button"
                  onClick={addSampleTestCase}
                  className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <MdAdd className="w-4 h-4" />
                  <span>Add Test Case</span>
                </button>
              </div>

              {formData.sampleTestCases.map((testCase, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Test Case {index + 1}</h4>
                    {formData.sampleTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSampleTestCase(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-medium-contrast text-sm font-medium mb-2">
                        Input *
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => updateSampleTestCase(index, 'input', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                          errors[`sampleInput${index}`] ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="Enter input"
                      />
                      {errors[`sampleInput${index}`] && <p className="text-red-400 text-sm mt-1">{errors[`sampleInput${index}`]}</p>}
                    </div>

                    <div>
                      <label className="block text-medium-contrast text-sm font-medium mb-2">
                        Expected Output *
                      </label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => updateSampleTestCase(index, 'output', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                          errors[`sampleOutput${index}`] ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="Enter expected output"
                      />
                      {errors[`sampleOutput${index}`] && <p className="text-red-400 text-sm mt-1">{errors[`sampleOutput${index}`]}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-medium-contrast text-sm font-medium mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={testCase.explanation}
                      onChange={(e) => updateSampleTestCase(index, 'explanation', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none"
                      placeholder="Explain the test case"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden Test Cases */}
            <div className="dashboard-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300">
                  Hidden Test Cases *
                </h3>
                <button
                  type="button"
                  onClick={addHiddenTestCase}
                  className="btn-primary px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <MdAdd className="w-4 h-4" />
                  <span>Add Test Case</span>
                </button>
              </div>

              {formData.hiddenTestCases.map((testCase, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Hidden Test Case {index + 1}</h4>
                    {formData.hiddenTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHiddenTestCase(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-medium-contrast text-sm font-medium mb-2">
                        Input *
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => updateHiddenTestCase(index, 'input', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                          errors[`hiddenInput${index}`] ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="Enter input"
                      />
                      {errors[`hiddenInput${index}`] && <p className="text-red-400 text-sm mt-1">{errors[`hiddenInput${index}`]}</p>}
                    </div>

                    <div>
                      <label className="block text-medium-contrast text-sm font-medium mb-2">
                        Expected Output *
                      </label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => updateHiddenTestCase(index, 'output', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                          errors[`hiddenOutput${index}`] ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="Enter expected output"
                      />
                      {errors[`hiddenOutput${index}`] && <p className="text-red-400 text-sm mt-1">{errors[`hiddenOutput${index}`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-white/30 cursor-not-allowed'
                    : 'btn-primary hover:scale-105'
                }`}
              >
                <MdSave className="w-5 h-5" />
                <span>{isSubmitting ? 'Uploading...' : 'Upload Question'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionUpload;
