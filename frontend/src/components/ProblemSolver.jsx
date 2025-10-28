import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { 
  MdArrowBack, 
  MdPlayArrow, 
  MdCheckCircle, 
  MdError, 
  MdCode, 
  MdTimer,
  MdMemory,
  MdTag,
  MdPerson
} from 'react-icons/md';
import { dsaSheetData } from '../data/dsaSheetData';
import { userAPI } from '../utils/api';
import BackButton from './BackButton';

const ProblemSolver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('testcases'); // 'testcases' or 'output'
  const editorRef = useRef(null);

  const languages = [
    { value: 'JavaScript', label: 'JavaScript', extension: 'js' },
    { value: 'Python', label: 'Python', extension: 'py' },
    { value: 'Java', label: 'Java', extension: 'java' },
    { value: 'C++', label: 'C++', extension: 'cpp' },
    { value: 'C', label: 'C', extension: 'c' }
  ];

  useEffect(() => {
    fetchProblem();
    checkIfSolved();
  }, [id]);

  const checkIfSolved = () => {
    const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
    setIsSubmitted(solvedProblems.includes(id));
  };

  const recordProblemSolve = async () => {
    try {
      return await userAPI.solveProblem({
        problemId: id,
        title: problem.title,
        difficulty: problem.difficulty,
        topic: problem.topic,
        timeSpent: 0,
        language: selectedLanguage
      });
    } catch (error) {
      console.error('Error recording problem solve:', error);
      return null;
    }
  };

  useEffect(() => {
    // Keep code editor empty - users should write all code themselves
    if (problem && problem.allowedLanguages.includes(selectedLanguage)) {
      setCode(''); // Always start with empty code
    }
  }, [selectedLanguage, problem]);

  const fetchProblem = async () => {
    try {
      // Check if it's a DSA sheet problem first
      const dsaProblem = findDSAProblem(id);
      if (dsaProblem) {
        setProblem(dsaProblem.problem);
        if (dsaProblem.problem.allowedLanguages.length > 0) {
          setSelectedLanguage(dsaProblem.problem.allowedLanguages[0]);
        }
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      const response = await fetch(`/api/problems/${id}`);
      if (!response.ok) {
        throw new Error('Problem not found');
      }
      const data = await response.json();
      setProblem(data);
      if (data.allowedLanguages.length > 0) {
        setSelectedLanguage(data.allowedLanguages[0]);
      }
    } catch (err) {
      setError('Failed to load problem');
      console.error('Error fetching problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const findDSAProblem = (problemId) => {
    // Search through all DSA sheet problems
    for (const topicId in dsaSheetData.problems) {
      const problems = dsaSheetData.problems[topicId];
      const problem = problems.find(p => p.id === problemId);
      if (problem) {
        return problem;
      }
    }
    return null;
  };

  const runCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setIsRunning(true);
    setError('');
    setTestResults(null);
    setActiveTab('output'); // Switch to output tab when running

    try {
      const response = await fetch('/api/problems/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: id,
          code,
          language: selectedLanguage
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Execution failed');
      }

      setTestResults(result);
    } catch (err) {
      setError(err.message || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // First run the code to check if it passes all tests
      const runResponse = await fetch('/api/problems/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: id,
          code,
          language: selectedLanguage
        })
      });

      const runResult = await runResponse.json();
      
      if (!runResponse.ok) {
        throw new Error(runResult.message || 'Execution failed');
      }

      // Check if all tests pass
      const allTestsPass = [...runResult.sampleResults, ...runResult.hiddenResults].every(test => test.passed);
      
      if (allTestsPass) {
        // Mark as solved
        const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
        if (!solvedProblems.includes(id)) {
          solvedProblems.push(id);
          localStorage.setItem('solvedProblems', JSON.stringify(solvedProblems));
        }
        
        // Record problem solve in backend
        try {
          const recordResponse = await fetch('/api/users/solve-problem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              problemId: id,
              title: problem.title,
              difficulty: problem.difficulty,
              topic: problem.topic || 'General',
              timeSpent: Math.floor(Math.random() * 30) + 5, // Mock time spent (5-35 min)
              language: selectedLanguage
            })
          });
          
          if (recordResponse.ok) {
            const recordResult = await recordResponse.json();
            console.log('Problem recorded in backend:', recordResult);
          }
        } catch (recordError) {
          console.error('Failed to record problem solve:', recordError);
          // Don't show error to user, as the problem is still marked as solved locally
        }
        
        setIsSubmitted(true);
        setTestResults(runResult);
        alert('Congratulations! Problem solved successfully! 🎉');
      } else {
        setTestResults(runResult);
        setActiveTab('output'); // Show output to see failures
        alert('Some test cases failed. Please fix your solution and try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTestResultIcon = (passed) => {
    return passed ? (
      <MdCheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <MdError className="w-5 h-5 text-red-400" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/30 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading problem...</div>
      </div>
    );
  }

  if (error && !problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/30 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/problems')}
            className="btn-primary px-6 py-3 rounded-lg"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/30 to-black flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton to="/problems" text="Back to Problems" className="text-lg" />
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                {problem.title}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <MdTimer className="w-4 h-4" />
                  <span>{problem.timeLimit}ms</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <MdMemory className="w-4 h-4" />
                  <span>{problem.memoryLimit}MB</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400"
            >
              {problem.allowedLanguages.map(lang => (
                <option key={lang} value={lang} className="bg-gray-800">
                  {lang}
                </option>
              ))}
            </select>
            <button
              onClick={runCode}
              disabled={isRunning || !code.trim()}
              className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                isRunning || !code.trim()
                  ? 'bg-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105'
              }`}
            >
              <MdPlayArrow className="w-5 h-5" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
            <button
              onClick={submitSolution}
              disabled={isSubmitting || !code.trim() || isSubmitted}
              className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                isSubmitting || !code.trim() || isSubmitted
                  ? 'bg-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105'
              }`}
            >
              {isSubmitted ? (
                <>
                  <MdCheckCircle className="w-5 h-5" />
                  <span>Solved ✓</span>
                </>
              ) : (
                <>
                  <MdCheckCircle className="w-5 h-5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className="w-1/2 overflow-y-auto border-r border-white/10 p-6">
          <div className="space-y-6">
            {/* Problem Info */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Problem Description</h2>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <MdPerson className="w-4 h-4" />
                  <span>By {problem.createdBy?.username || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {problem.description}
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Constraints</h3>
              <div className="text-gray-300 whitespace-pre-wrap">
                {problem.constraints}
              </div>
            </div>

            {/* Sample Test Cases */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Sample Test Cases</h3>
              <div className="space-y-4">
                {problem.sampleTestCases.map((testCase, index) => (
                  <div key={index} className="bg-black/20 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Input:</h4>
                        <pre className="text-gray-300 text-sm bg-black/30 p-3 rounded border border-white/10 whitespace-pre-wrap">
                          {testCase.input || testCase.stdin || '(No input)'}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Expected Output:</h4>
                        <pre className="text-gray-300 text-sm bg-black/30 p-3 rounded border border-white/10 whitespace-pre-wrap">
                          {testCase.expectedOutput || testCase.output || testCase.stdout || '(No output)'}
                        </pre>
                      </div>
                    </div>
                    {testCase.explanation && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Explanation:</h4>
                        <p className="text-gray-300 text-sm">{testCase.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm flex items-center space-x-1"
                    >
                      <MdTag className="w-3 h-3" />
                      <span>{tag.toLowerCase()}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Vertical Split (Code Editor + Results) */}
        <div className="w-1/2 flex flex-col">
          <PanelGroup direction="vertical">
            {/* Code Editor Panel */}
            <Panel defaultSize={50} minSize={20}>
              <div className="h-full flex flex-col">
                <div className="bg-black/20 backdrop-blur-md p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <MdCode className="w-5 h-5" />
                      <span>Code Editor</span>
                    </h3>
                    <div className="text-sm text-gray-400">
                      {selectedLanguage}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    language={selectedLanguage.toLowerCase() === 'c++' ? 'cpp' : selectedLanguage.toLowerCase()}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={(editor) => {
                      editorRef.current = editor;
                    }}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      autoClosingBrackets: 'always',
                      autoClosingQuotes: 'always',
                      formatOnPaste: true,
                      formatOnType: true,
                      suggestOnTriggerCharacters: true,
                      acceptSuggestionOnEnter: 'on',
                      quickSuggestions: true,
                      parameterHints: { enabled: true },
                      folding: true,
                      bracketPairColorization: { enabled: true },
                      renderLineHighlight: 'all',
                      cursorBlinking: 'smooth',
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </div>
            </Panel>
            
            {/* Resize Handle */}
            <PanelResizeHandle className="h-2 bg-white/5 hover:bg-violet-500/50 transition-colors cursor-row-resize flex items-center justify-center group">
              <div className="w-12 h-1 bg-white/20 group-hover:bg-violet-400 rounded-full transition-colors"></div>
            </PanelResizeHandle>

            {/* Results Section Panel */}
            <Panel defaultSize={50} minSize={20}>
              <div className="h-full flex flex-col">
                {/* Tab Header */}
                <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
                  <div className="flex space-x-1 p-2">
                    <button
                      onClick={() => setActiveTab('testcases')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'testcases'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Testcases
                    </button>
                    <button
                      onClick={() => setActiveTab('output')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'output'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Output
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-black/10">
              {activeTab === 'testcases' && (
                <div className="space-y-3">
                  {!testResults ? (
                    // Show problem test cases before running
                    <>
                      <h4 className="text-white font-medium mb-2">Sample Test Cases</h4>
                      {problem.sampleTestCases.map((testCase, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-sm text-gray-400 mb-2">Test Case {index + 1}</div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-gray-500">Input:</span>
                              <pre className="text-gray-300 text-xs bg-black/30 p-2 rounded mt-1 whitespace-pre-wrap">
                                {testCase.input || testCase.stdin || '(No input)'}
                              </pre>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Expected Output:</span>
                              <pre className="text-gray-300 text-xs bg-black/30 p-2 rounded mt-1 whitespace-pre-wrap">
                                {testCase.expectedOutput || testCase.output || testCase.stdout || '(No output)'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Show execution results after running
                    <>
                      <h4 className="text-white font-medium mb-3">Test Results</h4>
                      {testResults.sampleResults?.map((result, index) => (
                        <div key={index} className={`rounded-lg p-4 border ${
                          result.passed 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getTestResultIcon(result.passed)}
                              <span className="text-white font-medium">Test {index + 1}</span>
                            </div>
                            <span className={`text-sm font-medium ${
                              result.passed ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {result.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-400">Input:</span>
                              <pre className="text-gray-300 bg-black/30 p-2 rounded mt-1">
                                {result.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-gray-400">Expected Output:</span>
                              <pre className="text-gray-300 bg-black/30 p-2 rounded mt-1">
                                {result.expectedOutput}
                              </pre>
                            </div>
                            <div>
                              <span className="text-gray-400">Your Output:</span>
                              <pre className={`p-2 rounded mt-1 ${
                                result.passed ? 'text-green-300' : 'text-red-300'
                              } bg-black/30`}>
                                {result.actualOutput}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'output' && (
                <div>
                  {!testResults && !error && (
                    <div className="text-center text-gray-400 py-8">
                      Run your code to see the output here
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-400">
                        <MdError className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {testResults && (
                    <div className="space-y-4">
                      {/* Score */}
                      <div className="bg-violet-500/20 border border-violet-500/50 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            Score: {testResults.score}%
                          </div>
                          <div className="text-sm text-gray-300">
                            {[...testResults.sampleResults, ...testResults.hiddenResults].filter(r => r.passed).length} / {testResults.sampleResults.length + testResults.hiddenResults.length} tests passed
                          </div>
                        </div>
                      </div>

                      {/* Sample Results */}
                      <div>
                        <h4 className="text-white font-medium mb-3">Sample Test Results</h4>
                        <div className="space-y-2">
                          {testResults.sampleResults?.map((result, index) => (
                            <div key={index} className={`rounded-lg p-4 border ${
                              result.passed 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : 'bg-red-500/10 border-red-500/30'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {getTestResultIcon(result.passed)}
                                  <span className="text-white font-medium">Test {index + 1}</span>
                                </div>
                                <span className={`text-sm font-medium ${
                                  result.passed ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {result.passed ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-400">Input:</span>
                                  <pre className="text-gray-300 bg-black/30 p-2 rounded mt-1">
                                    {result.input}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-gray-400">Expected Output:</span>
                                  <pre className="text-gray-300 bg-black/30 p-2 rounded mt-1">
                                    {result.expectedOutput}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-gray-400">Your Output:</span>
                                  <pre className={`p-2 rounded mt-1 ${
                                    result.passed ? 'text-green-300' : 'text-red-300'
                                  } bg-black/30`}>
                                    {result.actualOutput}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hidden Results */}
                      {testResults.hiddenResults && testResults.hiddenResults.length > 0 && (
                        <div>
                          <h4 className="text-white font-medium mb-3">Hidden Test Results</h4>
                          <div className="space-y-2">
                            {testResults.hiddenResults.map((result, index) => (
                              <div key={index} className={`rounded-lg p-3 border ${
                                result.passed 
                                  ? 'bg-green-500/10 border-green-500/30' 
                                  : 'bg-red-500/10 border-red-500/30'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getTestResultIcon(result.passed)}
                                    <span className="text-white text-sm">Hidden Test {index + 1}</span>
                                  </div>
                                  <span className={`text-xs font-medium ${
                                    result.passed ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {result.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Execution Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-gray-400 text-xs mb-1">Execution Time</div>
                          <div className="text-white font-medium">{testResults.executionTime?.toFixed(2)}ms</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-gray-400 text-xs mb-1">Memory Used</div>
                          <div className="text-white font-medium">{testResults.memoryUsed?.toFixed(2)}MB</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver;
