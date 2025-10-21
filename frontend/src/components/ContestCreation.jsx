import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdArrowForward, 
  MdAdd, 
  MdDelete, 
  MdTimer, 
  MdMemory, 
  MdTag,
  MdSave,
  MdEmojiEvents,
  MdSchedule,
  MdLock,
  MdShare
} from 'react-icons/md';
import BackButton from './BackButton';

const ContestCreation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: '',
    description: '',
    password: '',
    difficulty: 'Medium',
    maxParticipants: '',
    allowedLanguages: ['JavaScript', 'Python'],
    visibility: 'public',

    // Step 2: Questions
    questions: [{
      title: '',
      description: '',
      difficulty: 'Easy',
      constraints: '',
      timeLimit: 2000,
      memoryLimit: 256,
      points: 100,
      tags: '',
      sampleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }]
    }],

    // Step 3: Schedule & Time Slots
    contestDate: '',
    timeSlots: []
  });

  const steps = [
    { number: 1, title: 'Basic Info', icon: MdEmojiEvents },
    { number: 2, title: 'Questions', icon: MdTag },
    { number: 3, title: 'Schedule', icon: MdSchedule }
  ];

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

  const handleInputChange = (field, value, questionIndex = null, testCaseIndex = null, testCaseType = null) => {
    setFormData(prev => {
      if (questionIndex !== null) {
        const newQuestions = [...prev.questions];
        
        if (testCaseIndex !== null && testCaseType) {
          newQuestions[questionIndex][testCaseType][testCaseIndex][field] = value;
        } else {
          newQuestions[questionIndex][field] = value;
        }
        
        return { ...prev, questions: newQuestions };
      }
      
      return { ...prev, [field]: value };
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  // Question management functions
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        title: '',
        description: '',
        difficulty: 'Easy',
        constraints: '',
        timeLimit: 2000,
        memoryLimit: 256,
        points: 100,
        tags: '',
        sampleTestCases: [{ input: '', output: '', explanation: '' }],
        hiddenTestCases: [{ input: '', output: '' }]
      }]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const addTestCase = (questionIndex, type) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      if (type === 'sample') {
        newQuestions[questionIndex].sampleTestCases.push({ input: '', output: '', explanation: '' });
      } else {
        newQuestions[questionIndex].hiddenTestCases.push({ input: '', output: '' });
      }
      return { ...prev, questions: newQuestions };
    });
  };

  const removeTestCase = (questionIndex, testCaseIndex, type) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      if (type === 'sample' && newQuestions[questionIndex].sampleTestCases.length > 1) {
        newQuestions[questionIndex].sampleTestCases = newQuestions[questionIndex].sampleTestCases.filter((_, i) => i !== testCaseIndex);
      } else if (type === 'hidden' && newQuestions[questionIndex].hiddenTestCases.length > 1) {
        newQuestions[questionIndex].hiddenTestCases = newQuestions[questionIndex].hiddenTestCases.filter((_, i) => i !== testCaseIndex);
      }
      return { ...prev, questions: newQuestions };
    });
  };

  // Time slot management
  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM
    const slotDuration = 2; // 2 hours per slot

    for (let hour = startHour; hour < endHour; hour += slotDuration) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(hour + slotDuration, 0, 0, 0);

      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isSelected: false,
        label: `${hour}:00 - ${hour + slotDuration}:00`
      });
    }

    return slots;
  };

  const handleDateChange = (date) => {
    const timeSlots = generateTimeSlots(date);
    setFormData(prev => ({
      ...prev,
      contestDate: date,
      timeSlots
    }));
  };

  const toggleTimeSlot = (slotIndex) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, index) => ({
        ...slot,
        isSelected: index === slotIndex ? !slot.isSelected : false // Only one slot can be selected
      }))
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.allowedLanguages.length === 0) newErrors.allowedLanguages = 'At least one language must be selected';
    } else if (step === 2) {
      formData.questions.forEach((question, qIndex) => {
        if (!question.title.trim()) newErrors[`question${qIndex}Title`] = 'Question title is required';
        if (!question.description.trim()) newErrors[`question${qIndex}Description`] = 'Question description is required';
        if (!question.constraints.trim()) newErrors[`question${qIndex}Constraints`] = 'Constraints are required';
        
        question.sampleTestCases.forEach((testCase, tcIndex) => {
          if (!testCase.input.trim()) newErrors[`q${qIndex}SampleInput${tcIndex}`] = 'Input is required';
          if (!testCase.output.trim()) newErrors[`q${qIndex}SampleOutput${tcIndex}`] = 'Output is required';
        });

        question.hiddenTestCases.forEach((testCase, tcIndex) => {
          if (!testCase.input.trim()) newErrors[`q${qIndex}HiddenInput${tcIndex}`] = 'Input is required';
          if (!testCase.output.trim()) newErrors[`q${qIndex}HiddenOutput${tcIndex}`] = 'Output is required';
        });
      });
    } else if (step === 3) {
      if (!formData.contestDate) newErrors.contestDate = 'Contest date is required';
      if (formData.timeSlots.length === 0) newErrors.timeSlots = 'Please select a contest date to generate time slots';
      if (!formData.timeSlots.some(slot => slot.isSelected)) newErrors.selectedSlot = 'Please select a time slot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to create contests');
      }

      // Prepare questions data
      const processedQuestions = formData.questions.map(question => ({
        ...question,
        tags: question.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }));

      const response = await fetch('http://localhost:5000/api/contests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          password: formData.password,
          visibility: formData.visibility,
          questions: processedQuestions,
          timeSlots: formData.timeSlots,
          allowedLanguages: formData.allowedLanguages.map(lang => lang.toLowerCase()),
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create contest');
      }

      const result = await response.json();
      alert(`Contest created successfully! Contest ID: ${result.contestId}`);
      navigate('/challenges');
    } catch (error) {
      console.error('Contest creation error:', error);
      alert(error.message || 'Failed to create contest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderQuestions();
      case 3:
        return renderSchedule();
      default:
        return renderBasicInfo();
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Contest Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors ${
              errors.title ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder="Enter contest title"
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Difficulty Level
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

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Contest Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
            errors.description ? 'border-red-500' : 'border-white/20'
          }`}
          placeholder="Describe your contest..."
        />
        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <MdLock className="w-4 h-4 inline mr-1" />
            Contest Password *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors ${
              errors.password ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder="Enter contest password (min 6 chars)"
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Max Participants
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors"
            placeholder="Leave empty for unlimited"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Allowed Programming Languages *
        </label>
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
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Contest Questions</h3>
        <button
          type="button"
          onClick={addQuestion}
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-all duration-300"
        >
          <MdAdd className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {formData.questions.map((question, qIndex) => (
        <div key={qIndex} className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-white">Question {qIndex + 1}</h4>
            {formData.questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <MdDelete className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  value={question.title}
                  onChange={(e) => handleInputChange('title', e.target.value, qIndex)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors ${
                    errors[`question${qIndex}Title`] ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter question title"
                />
                {errors[`question${qIndex}Title`] && (
                  <p className="text-red-400 text-sm mt-1">{errors[`question${qIndex}Title`]}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Difficulty
                </label>
                <select
                  value={question.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value, qIndex)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400 transition-colors"
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value} className="bg-gray-800">
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Problem Description *
              </label>
              <textarea
                value={question.description}
                onChange={(e) => handleInputChange('description', e.target.value, qIndex)}
                rows={6}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                  errors[`question${qIndex}Description`] ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="Describe the problem in detail..."
              />
              {errors[`question${qIndex}Description`] && (
                <p className="text-red-400 text-sm mt-1">{errors[`question${qIndex}Description`]}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Constraints *
              </label>
              <textarea
                value={question.constraints}
                onChange={(e) => handleInputChange('constraints', e.target.value, qIndex)}
                rows={2}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                  errors[`question${qIndex}Constraints`] ? 'border-red-500' : 'border-white/20'
                }`}
                placeholder="1 ≤ n ≤ 10^5, 1 ≤ arr[i] ≤ 10^9"
              />
              {errors[`question${qIndex}Constraints`] && (
                <p className="text-red-400 text-sm mt-1">{errors[`question${qIndex}Constraints`]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <MdTimer className="w-4 h-4 inline mr-1" />
                  Time Limit (ms)
                </label>
                <input
                  type="number"
                  value={question.timeLimit}
                  onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value), qIndex)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors"
                  min="100"
                  max="10000"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <MdMemory className="w-4 h-4 inline mr-1" />
                  Memory (MB)
                </label>
                <input
                  type="number"
                  value={question.memoryLimit}
                  onChange={(e) => handleInputChange('memoryLimit', parseInt(e.target.value), qIndex)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors"
                  min="64"
                  max="1024"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value), qIndex)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors"
                  min="10"
                  max="1000"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <MdTag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <input
                  type="text"
                  value={question.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value, qIndex)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors"
                  placeholder="array, sorting"
                />
              </div>
            </div>

            {/* Sample Test Cases */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-medium text-white">Sample Test Cases</h5>
                <button
                  type="button"
                  onClick={() => addTestCase(qIndex, 'sample')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center space-x-1 transition-colors"
                >
                  <MdAdd className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {question.sampleTestCases.map((testCase, tcIndex) => (
                <div key={tcIndex} className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 font-medium">Sample Test Case {tcIndex + 1}</span>
                    {question.sampleTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(qIndex, tcIndex, 'sample')}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Input *</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleInputChange('input', e.target.value, qIndex, tcIndex, 'sampleTestCases')}
                        rows={3}
                        className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                          errors[`q${qIndex}SampleInput${tcIndex}`] ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="Enter input"
                      />
                      {errors[`q${qIndex}SampleInput${tcIndex}`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`q${qIndex}SampleInput${tcIndex}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Expected Output *</label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => handleInputChange('output', e.target.value, qIndex, tcIndex, 'sampleTestCases')}
                        rows={3}
                        className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                          errors[`q${qIndex}SampleOutput${tcIndex}`] ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="Enter expected output"
                      />
                      {errors[`q${qIndex}SampleOutput${tcIndex}`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`q${qIndex}SampleOutput${tcIndex}`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-400 text-sm font-medium mb-2">Explanation (Optional)</label>
                    <textarea
                      value={testCase.explanation}
                      onChange={(e) => handleInputChange('explanation', e.target.value, qIndex, tcIndex, 'sampleTestCases')}
                      rows={2}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none"
                      placeholder="Explain the test case"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden Test Cases */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-medium text-white">Hidden Test Cases</h5>
                <button
                  type="button"
                  onClick={() => addTestCase(qIndex, 'hidden')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center space-x-1 transition-colors"
                >
                  <MdAdd className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {question.hiddenTestCases.map((testCase, tcIndex) => (
                <div key={tcIndex} className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 font-medium">Hidden Test Case {tcIndex + 1}</span>
                    {question.hiddenTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(qIndex, tcIndex, 'hidden')}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Input *</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleInputChange('input', e.target.value, qIndex, tcIndex, 'hiddenTestCases')}
                        rows={3}
                        className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                          errors[`q${qIndex}HiddenInput${tcIndex}`] ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="Enter input"
                      />
                      {errors[`q${qIndex}HiddenInput${tcIndex}`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`q${qIndex}HiddenInput${tcIndex}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Expected Output *</label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => handleInputChange('output', e.target.value, qIndex, tcIndex, 'hiddenTestCases')}
                        rows={3}
                        className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition-colors resize-none ${
                          errors[`q${qIndex}HiddenOutput${tcIndex}`] ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="Enter expected output"
                      />
                      {errors[`q${qIndex}HiddenOutput${tcIndex}`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`q${qIndex}HiddenOutput${tcIndex}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Contest Date *
        </label>
        <input
          type="date"
          value={formData.contestDate}
          onChange={(e) => handleDateChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:border-violet-400 transition-colors ${
            errors.contestDate ? 'border-red-500' : 'border-white/20'
          }`}
        />
        {errors.contestDate && <p className="text-red-400 text-sm mt-1">{errors.contestDate}</p>}
      </div>

      {formData.timeSlots.length > 0 && (
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-4">
            Available Time Slots *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.timeSlots.map((slot, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleTimeSlot(index)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  slot.isSelected
                    ? 'border-violet-400 bg-violet-400/20 text-white'
                    : 'border-white/20 bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MdSchedule className="w-5 h-5" />
                  <span className="font-medium">{slot.label}</span>
                </div>
              </button>
            ))}
          </div>
          {errors.selectedSlot && <p className="text-red-400 text-sm mt-2">{errors.selectedSlot}</p>}
        </div>
      )}

      {errors.timeSlots && <p className="text-red-400 text-sm">{errors.timeSlots}</p>}

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Contest Summary</h4>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between">
            <span>Title:</span>
            <span className="text-white font-medium">{formData.title || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span>Questions:</span>
            <span className="text-white font-medium">{formData.questions.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Points:</span>
            <span className="text-white font-medium">
              {formData.questions.reduce((total, q) => total + (q.points || 100), 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Languages:</span>
            <span className="text-white font-medium">{formData.allowedLanguages.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="text-white font-medium">{formData.contestDate || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span>Time Slot:</span>
            <span className="text-white font-medium">
              {formData.timeSlots.find(slot => slot.isSelected)?.label || 'Not selected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton to="/challenges" text="Back to Challenges" />
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                Create Contest
              </h1>
              <p className="text-gray-300">Create your own coding contest for the community</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    currentStep >= step.number 
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white' 
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    currentStep > step.number ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/10'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                  currentStep === 1
                    ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <MdArrowBack className="w-5 h-5" />
                <span>Previous</span>
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 hover:scale-105"
                >
                  <span>Next</span>
                  <MdArrowForward className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105'
                  } text-white`}
                >
                  <MdSave className="w-5 h-5" />
                  <span>{isSubmitting ? 'Creating Contest...' : 'Create Contest'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestCreation;