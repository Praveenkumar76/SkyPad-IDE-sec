import { API_BASE_URL } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdPlayArrow, 
  MdCheckCircle, 
  MdError, 
  MdCode, 
  MdTimer,
  MdMemory,
  MdTag,
  MdPerson,
  MdRefresh
} from 'react-icons/md';
import { dsaSheetData } from '../data/dsaSheetData';

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

  const languages = [
    { value: 'JavaScript', label: 'JavaScript', extension: 'js' },
    { value: 'Python', label: 'Python', extension: 'py' },
    { value: 'Java', label: 'Java', extension: 'java' },
    { value: 'C++', label: 'C++', extension: 'cpp' },
    { value: 'C', label: 'C', extension: 'c' }
  ];

  // Editor starts empty; users must write full solutions themselves
  const defaultCode = {
    JavaScript: '',
    Python: '',
    Java: '',
    'C++': '',
    C: ''
  };

  useEffect(() => {
    fetchProblem();
    checkIfSolved();
  }, [id]);

  const checkIfSolved = () => {
    const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
    setIsSubmitted(solvedProblems.includes(id));
  };

  useEffect(() => {
    if (problem && problem.allowedLanguages.includes(selectedLanguage)) {
      setCode(defaultCode[selectedLanguage] || '');
    }
  }, [selectedLanguage, problem]);

  // Auto-close pairs for (), {}, [], '', "", ``
  const handleEditorKeyDown = (e) => {
    const target = e.target;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const value = code;

    const pairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`'
    };

    const key = e.key;
    if (pairs[key]) {
      e.preventDefault();
      const insert = key + pairs[key];
      const newValue = value.slice(0, start) + insert + value.slice(end);
      setCode(newValue);
      // place cursor between the pair
      requestAnimationFrame(() => {
        target.selectionStart = start + 1;
        target.selectionEnd = start + 1;
      });
      return;
    }

    // If closing char typed and exactly next char matches, just move cursor over it
    const closers = new Set(Object.values(pairs));
    if (closers.has(key)) {
      if (value[end] === key && start === end) {
        e.preventDefault();
        requestAnimationFrame(() => {
          target.selectionStart = start + 1;
          target.selectionEnd = start + 1;
        });
      }
    }
  };

  const fetchProblem = async () => {
    try {
      // Always fetch from DATABASE API (single source of truth)
      const response = await fetch(`${API_BASE_URL}/problems/${id}`);
      if (!response.ok) {
        throw new Error('Problem not found');
      }
      const data = await response.json();
      setProblem(data);
      if (data.allowedLanguages && data.allowedLanguages.length > 0) {
        setSelectedLanguage(data.allowedLanguages[0]);
      }
      console.log('Problem loaded from database:', data.title);
    } catch (err) {
      setError('Failed to load problem');
      console.error('Error fetching problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setIsRunning(true);
    setError('');
    setTestResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/problems/run`, {
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
      const runResponse = await fetch(`${API_BASE_URL}/problems/run`, {
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
        // Mark as solved in localStorage
        const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
        if (!solvedProblems.includes(id)) {
          solvedProblems.push(id);
          localStorage.setItem('solvedProblems', JSON.stringify(solvedProblems));
        }
        
        // Sync with backend
        try {
          await fetch(`${API_BASE_URL}/users/solved`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              problemId: id,
              language: selectedLanguage
            })
          });
        } catch (syncError) {
          console.error('Failed to sync solved status with backend:', syncError);
        }
        
        setIsSubmitted(true);
        setTestResults(runResult);
        alert('Congratulations! Problem solved successfully! 🎉');
      } else {
        setTestResults(runResult);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/30 to-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/problems')}
              className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
            >
              <MdArrowBack className="w-6 h-6 text-white" />
            </button>
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
              onClick={() => setCode('')}
              className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white hover:scale-105"
              title="Reset code editor"
            >
              <MdRefresh className="w-5 h-5" />
              <span>Reset</span>
            </button>
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Problem Description */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Input/Output Guide */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-4 mb-4">
              <h3 className="text-violet-300 font-semibold mb-2 flex items-center space-x-2">
                <MdCode className="w-4 h-4" />
                <span>How to Read Input & Print Output</span>
              </h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• Your program receives input via <strong className="text-white">standard input (stdin)</strong></p>
                <p>• You must print output to <strong className="text-white">standard output (stdout)</strong></p>
                <p>• Test inputs are passed exactly as shown (e.g., <code className="bg-black/40 px-1 rounded">1</code> or <code className="bg-black/40 px-1 rounded">1, 2, 3, 4</code>)</p>
                <p>• Parse the input as needed for your solution</p>
              </div>
            </div>

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
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Important:</strong> Your program should read from <code className="bg-black/30 px-2 py-1 rounded">stdin</code> and write to <code className="bg-black/30 px-2 py-1 rounded">stdout</code>. 
                  The test input shown below will be passed as stdin to your program.
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ <strong>Notice:</strong> If input shows brackets like <code className="bg-black/30 px-1 rounded">[2, 2, 1]</code>, 
                  your stdin will receive the <strong>exact string</strong> <code className="bg-black/30 px-1 rounded">[2, 2, 1]</code> including brackets. 
                  You must parse it accordingly (remove brackets, split by comma, convert to integers).
                </p>
              </div>
              <div className="space-y-4">
                {problem.sampleTestCases.map((testCase, index) => (
                  <div key={index} className="bg-black/20 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Input (stdin):</h4>
                        <pre className="text-gray-300 text-sm bg-black/30 p-3 rounded border font-mono">
                          {testCase.input}
                        </pre>
                        <p className="text-xs text-gray-500 mt-1">Your program receives this exact string</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Expected Output (stdout):</h4>
                        <pre className="text-gray-300 text-sm bg-black/30 p-3 rounded border font-mono">
                          {testCase.output}
                        </pre>
                        <p className="text-xs text-gray-500 mt-1">Your program should print this</p>
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

        {/* Code Editor */}
        <div className="w-1/2 border-l border-white/10 flex flex-col">
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

          <div className="flex-1 p-4 flex flex-col">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-2 text-xs">
              <p className="text-yellow-300 mb-2">
                <strong>📝 Reading stdin in {selectedLanguage}:</strong>
              </p>
              {selectedLanguage === 'Python' && (
                <pre className="text-yellow-200 bg-black/30 p-2 rounded mt-1 text-xs overflow-x-auto">
{`import sys
data = sys.stdin.read().strip()
# If input is "[2, 2, 1]", parse it:
data = data.strip('[]')  # Remove brackets
arr = list(map(int, data.split(', ')))
print(sum(arr))`}</pre>
              )}
              {selectedLanguage === 'JavaScript' && (
                <pre className="text-yellow-200 bg-black/30 p-2 rounded mt-1 text-xs overflow-x-auto">
{`const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();
// If input is "[2, 2, 1]", parse it:
const arr = input.slice(1, -1).split(', ').map(Number);
console.log(arr.reduce((a,b) => a+b, 0));`}</pre>
              )}
              {(selectedLanguage === 'Java' || selectedLanguage === 'C++' || selectedLanguage === 'C') && (
                <p className="text-yellow-200 text-xs">Read the full stdin string and parse accordingly (remove brackets, split by delimiter)</p>
              )}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              className="flex-1 w-full bg-black/30 text-white font-mono text-sm p-4 rounded-lg border border-white/20 focus:outline-none focus:border-violet-400 resize-none"
              placeholder={`Write your ${selectedLanguage} solution here...

📖 Tip: Check the yellow hint box above for a working example!

Basic template for ${selectedLanguage}:
${
                selectedLanguage === 'JavaScript' ? 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim();\n// Parse input here\nconsole.log(result);' :
                selectedLanguage === 'Python' ? 'import sys\ndata = sys.stdin.read().strip()\n# Parse data here\nprint(result)' :
                selectedLanguage === 'Java' ? 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // Read and parse input\n    System.out.println(result);\n  }\n}' :
                selectedLanguage === 'C++' ? '#include <iostream>\nusing namespace std;\nint main() {\n  // Read and parse input\n  cout << result;\n  return 0;\n}' :
                selectedLanguage === 'C' ? '#include <stdio.h>\nint main() {\n  // Read and parse input\n  printf("%d", result);\n  return 0;\n}' :
                'Read from stdin, process, write to stdout'
              }`}
              spellCheck={false}
            />
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="border-t border-white/10 p-4 bg-black/20">
              <h4 className="text-lg font-semibold text-white mb-3">Test Results</h4>
              <div className="space-y-3">
                {testResults.sampleResults?.map((result, index) => (
                  <div key={index} className="bg-black/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTestResultIcon(result.passed)}
                        <span className="text-white">Sample Test {index + 1}</span>
                      </div>
                      <div className={`text-sm ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </div>
                    </div>
                    {!result.passed && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Input</div>
                          <pre className="bg-black/40 border rounded p-2 text-gray-200 whitespace-pre-wrap">{result.input}</pre>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Expected</div>
                          <pre className="bg-black/40 border rounded p-2 text-gray-200 whitespace-pre-wrap">{result.expectedOutput}</pre>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Your Output</div>
                          <pre className="bg-black/40 border rounded p-2 text-gray-200 whitespace-pre-wrap">{result.actualOutput}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {testResults.hiddenResults && (
                  <div className="mt-2 space-y-2">
                    <h5 className="text-sm font-medium text-gray-400">Hidden Tests</h5>
                    {testResults.hiddenResults.map((result, index) => (
                      <div key={index} className="bg-black/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getTestResultIcon(result.passed)}
                            <span className="text-white text-sm">Hidden Test {index + 1}</span>
                          </div>
                          <div className={`text-sm ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </div>
                        </div>
                        {!result.passed && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <div className="text-gray-400 mb-1">Input</div>
                              <pre className="bg-black/40 border rounded p-2 text-gray-200 whitespace-pre-wrap">{result.input}</pre>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-1">Expected</div>
                              <pre className="bg-black/40 border rounded p-2 text-gray-200 whitespace-pre-wrap">{result.expectedOutput}</pre>
                            </div>
                            <div>
                              <div className="text-gray-400 mb-1">Your Output</div>
                              <pre className="bg-black/40 border rounded p-2 text-gray-200 whitespace-pre-wrap">{result.actualOutput}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>Score: <span className="text-white">{testResults.score || 0}%</span></div>
                  <div className="text-right">Time: {Math.round(testResults.executionTime || 0)}ms · Memory: {Math.round(testResults.memoryUsed || 0)}MB</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="border-t border-white/10 p-4 bg-red-500/20">
              <div className="flex items-center space-x-2 text-red-400">
                <MdError className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver;
