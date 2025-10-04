import { API_BASE_URL } from '../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import { 
  MdSearch, 
  MdCode, 
  MdTimer, 
  MdMemory, 
  MdTag, 
  MdPerson,
  MdPlayArrow,
  MdRefresh,
  MdArrowBack,
  MdCheckCircle,
  MdError,
  MdExpandMore,
  MdExpandLess,
  MdDragIndicator,
  MdClose
} from 'react-icons/md';

const Problems = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [error, setError] = useState('');
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  
  // LeetCode-style state
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  
  // Resizable panel state
  const [panelHeight, setPanelHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const dragRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const languages = [
    { value: 'JavaScript', label: 'JavaScript', extension: 'js' },
    { value: 'Python', label: 'Python', extension: 'py' },
    { value: 'Java', label: 'Java', extension: 'java' },
    { value: 'C++', label: 'C++', extension: 'cpp' },
    { value: 'C', label: 'C', extension: 'c' }
  ];

  // Default code templates
  const defaultCode = {
    JavaScript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim();\n// Input is sanitized, use simple parsing\nconst arr = input.split(" ").map(Number);\nconsole.log(result);',
    Python: 'import sys\ndata = sys.stdin.read().strip()\n# Input is sanitized, use simple parsing\narr = list(map(int, data.split()))\nprint(result)',
    Java: 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // Input is sanitized, use simple parsing\n    System.out.println(result);\n  }\n}',
    'C++': '#include <iostream>\nusing namespace std;\nint main() {\n  // Input is sanitized, use simple parsing\n  cout << result;\n  return 0;\n}',
    C: '#include <stdio.h>\nint main() {\n  // Input is sanitized, use simple parsing\n  printf("%d", result);\n  return 0;\n}'
  };

  useEffect(() => {
    fetchProblems();
    fetchSolvedProblems();
    
    // Listen for new problem uploads
    const handleProblemUpdate = () => {
      fetchProblems();
      fetchSolvedProblems();
    };
    
    window.addEventListener('dsaProblemsUpdated', handleProblemUpdate);
    return () => window.removeEventListener('dsaProblemsUpdated', handleProblemUpdate);
  }, []);

  // Handle problem selection
  useEffect(() => {
    if (id && problems.length > 0) {
      const problem = problems.find(p => p._id === id);
      if (problem) {
        setSelectedProblem(problem);
        setIsSolved(solvedProblems.has(problem._id));
        if (problem.allowedLanguages && problem.allowedLanguages.length > 0) {
          setSelectedLanguage(problem.allowedLanguages[0]);
        }
        setCode(defaultCode[selectedLanguage] || '');
      }
    }
  }, [id, problems, solvedProblems, selectedLanguage]);

  const fetchSolvedProblems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/solved`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSolvedProblems(new Set(data.solvedProblems || []));
        
        // Also sync to localStorage for offline access
        localStorage.setItem('solvedProblems', JSON.stringify(data.solvedProblems || []));
      }
    } catch (error) {
      console.error('Error fetching solved problems:', error);
      // Fallback to localStorage
      const localSolved = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
      setSolvedProblems(new Set(localSolved));
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      // Fetch ALL problems from database (public endpoint, visible to all users)
      // Backend now defaults to limit=10000, so no need to specify
      const response = await fetch(`${API_BASE_URL}/problems`);
      if (!response.ok) {
        throw new Error('Failed to fetch problems');
      }
      const data = await response.json();
      setProblems(data.problems || []);
      console.log(`✅ Loaded ${data.problems?.length || 0} problems from database (public, all users' uploads)`);
      console.log(`📊 Total in DB: ${data.total || 0}`);
    } catch (err) {
      setError('Failed to load problems');
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '🟢';
      case 'Medium': return '🟡';
      case 'Hard': return '🔴';
      default: return '⚪';
    }
  };

  // Code execution functions
  const runCode = async () => {
    if (!code.trim() || !selectedProblem) return;
    
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/problems/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: selectedProblem._id,
          code,
          language: selectedLanguage
        })
      });
      
      const result = await response.json();
      setTestResults(result);
      
      // Check if all tests pass
      const allTestsPass = [...(result.sampleResults || []), ...(result.hiddenResults || [])].every(test => test.passed);
      
      if (allTestsPass) {
        // Auto-mark as solved
        markAsSolved();
      }
      
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!code.trim() || !selectedProblem) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/problems/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: selectedProblem._id,
          code,
          language: selectedLanguage
        })
      });
      
      const result = await response.json();
      setTestResults(result);
      
      // Check if all tests pass
      const allTestsPass = [...(result.sampleResults || []), ...(result.hiddenResults || [])].every(test => test.passed);
      
      if (allTestsPass) {
        markAsSolved();
        alert('Congratulations! Problem solved successfully! 🎉');
      } else {
        alert('Some test cases failed. Please fix your solution and try again.');
      }
      
    } catch (error) {
      console.error('Error submitting solution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsSolved = async () => {
    if (!selectedProblem) return;
    
    // Update local state
    setIsSolved(true);
    setSolvedProblems(prev => new Set([...prev, selectedProblem._id]));
    
    // Update localStorage
    const solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
    if (!solvedProblems.includes(selectedProblem._id)) {
      solvedProblems.push(selectedProblem._id);
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
          problemId: selectedProblem._id,
          language: selectedLanguage
        })
      });
    } catch (syncError) {
      console.error('Failed to sync solved status with backend:', syncError);
    }
  };

  // Panel resize functions
  const handleMouseDown = (e) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - e.clientY;
    const newHeight = Math.max(150, Math.min(400, startHeightRef.current + deltaY));
    setPanelHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Enhanced code editor with indentation and syntax highlighting
  const handleEditorKeyDown = (e) => {
    const target = e.target;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const value = code;

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const tab = '  '; // 2 spaces for indentation
      const newValue = value.slice(0, start) + tab + value.slice(end);
      setCode(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = start + tab.length;
        target.selectionEnd = start + tab.length;
      });
      return;
    }

    // Handle Enter key for auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const lines = value.slice(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      const indent = currentLine.match(/^(\s*)/)[0];
      
      // Auto-indent for C++/Java/C (after { or :)
      const shouldIndent = /[{}:]\s*$/.test(currentLine.trim());
      const newIndent = shouldIndent ? indent + '  ' : indent;
      
      const newValue = value.slice(0, start) + '\n' + newIndent + value.slice(end);
      setCode(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = start + 1 + newIndent.length;
        target.selectionEnd = start + 1 + newIndent.length;
      });
      return;
    }

    // Auto-close pairs
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
      requestAnimationFrame(() => {
        target.selectionStart = start + 1;
        target.selectionEnd = start + 1;
      });
      return;
    }

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

  // Syntax highlighting function
  const getSyntaxHighlightedCode = (code, language) => {
    if (!code) return '';
    
    const keywords = {
      'cpp': ['#include', 'using', 'namespace', 'std', 'int', 'main', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'const', 'static', 'void', 'bool', 'char', 'string', 'vector', 'cin', 'cout', 'endl'],
      'c': ['#include', 'int', 'main', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'const', 'static', 'void', 'char', 'printf', 'scanf'],
      'java': ['public', 'class', 'static', 'void', 'main', 'String', 'int', 'boolean', 'char', 'double', 'float', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'import', 'package'],
      'python': ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'lambda', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None'],
      'javascript': ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'class', 'extends', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'finally']
    };

    const lang = language.toLowerCase().replace('c++', 'cpp');
    const langKeywords = keywords[lang] || [];
    
    return code.split('\n').map(line => {
      let highlightedLine = line;
      
      // Highlight keywords
      langKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlightedLine = highlightedLine.replace(regex, `<span class="keyword">${keyword}</span>`);
      });
      
      // Highlight strings
      highlightedLine = highlightedLine.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
      
      // Highlight comments
      if (lang === 'cpp' || lang === 'c' || lang === 'java' || lang === 'javascript') {
        highlightedLine = highlightedLine.replace(/\/\/.*$/g, '<span class="comment">$&</span>');
        highlightedLine = highlightedLine.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
      } else if (lang === 'python') {
        highlightedLine = highlightedLine.replace(/#.*$/g, '<span class="comment">$&</span>');
      }
      
      // Highlight numbers
      highlightedLine = highlightedLine.replace(/\b\d+\.?\d*\b/g, '<span class="number">$&</span>');
      
      return highlightedLine;
    }).join('\n');
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (problem.tags && problem.tags.some(tag => 
                           tag.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading problems...</div>
      </div>
    );
  }

  // LeetCode-style layout
  if (selectedProblem) {
    return (
      <>
        {/* Syntax highlighting styles */}
        <style jsx>{`
          .keyword {
            color: #c792ea;
            font-weight: bold;
          }
          .string {
            color: #c3e88d;
          }
          .comment {
            color: #676e95;
            font-style: italic;
          }
          .number {
            color: #f78c6c;
          }
        `}</style>
        <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedProblem(null)}
              className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              title="Back to Problems List"
            >
              <MdArrowBack className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                {selectedProblem.title}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProblem.difficulty)}`}>
                  {selectedProblem.difficulty}
                </span>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <MdTimer className="w-4 h-4" />
                  <span>{selectedProblem.timeLimit}ms</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <MdMemory className="w-4 h-4" />
                  <span>{selectedProblem.memoryLimit}MB</span>
                </div>
                {isSolved && <MdCheckCircle className="w-5 h-5 text-green-400" />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:border-violet-400"
            >
              {selectedProblem.allowedLanguages?.map(lang => (
                <option key={lang} value={lang} className="bg-gray-800">
                  {lang}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCode(defaultCode[selectedLanguage] || '')}
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
              disabled={isSubmitting || !code.trim() || isSolved}
              className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                isSubmitting || !code.trim() || isSolved
                  ? 'bg-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105'
              }`}
            >
              {isSolved ? (
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
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white hover:scale-105"
              title={isPanelCollapsed ? "Show test results" : "Hide test results"}
            >
              {isPanelCollapsed ? <MdExpandMore className="w-5 h-5" /> : <MdExpandLess className="w-5 h-5" />}
              <span>{isPanelCollapsed ? 'Show Results' : 'Hide Results'}</span>
            </button>
            <DashboardNavbar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Problem Description */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Input/Output Guide */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                <h3 className="text-green-300 font-semibold mb-2 flex items-center space-x-2">
                  <MdCode className="w-4 h-4" />
                  <span>Input Sanitization Enabled</span>
                </h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Test inputs are automatically cleaned (brackets and commas removed)</p>
                  <p>• Use simple parsing like <code className="bg-black/40 px-1 rounded">list(map(int, input().split()))</code></p>
                  <p>• Your program receives sanitized input via stdin</p>
                </div>
              </div>

              {/* Problem Description */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Problem Description</h2>
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <MdPerson className="w-4 h-4" />
                    <span>By {selectedProblem.createdBy?.username || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedProblem.description}
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Constraints</h3>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {selectedProblem.constraints}
                </div>
              </div>

              {/* Sample Test Cases */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Sample Test Cases</h3>
                <div className="space-y-4">
                  {selectedProblem.sampleTestCases?.map((testCase, index) => (
                    <div key={index} className="bg-black/20 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Input (stdin):</h4>
                          <pre className="text-gray-300 text-sm bg-black/30 p-3 rounded border font-mono">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Expected Output (stdout):</h4>
                          <pre className="text-gray-300 text-sm bg-black/30 p-3 rounded border font-mono">
                            {testCase.output}
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
              {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProblem.tags.map((tag, index) => (
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

          {/* Right Panel - Code Editor and Test Results */}
          <div className="w-1/2 border-l border-white/10 flex flex-col">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
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
# Input is automatically sanitized, use simple parsing:
arr = list(map(int, data.split()))
print(result)`}</pre>
                  )}
                  {selectedLanguage === 'JavaScript' && (
                    <pre className="text-yellow-200 bg-black/30 p-2 rounded mt-1 text-xs overflow-x-auto">
{`const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();
// Input is automatically sanitized, use simple parsing:
const arr = input.split(' ').map(Number);
console.log(result);`}</pre>
                  )}
                  {(selectedLanguage === 'Java' || selectedLanguage === 'C++' || selectedLanguage === 'C') && (
                    <p className="text-yellow-200 text-xs">Input is automatically sanitized, use simple parsing (split by spaces)</p>
                  )}
                </div>
                <div className="flex-1 w-full bg-black/30 rounded-lg border border-white/20 focus-within:border-violet-400 relative">
                  {/* Syntax highlighted background */}
                  <div 
                    className="absolute inset-0 p-4 font-mono text-sm text-transparent pointer-events-none whitespace-pre-wrap overflow-hidden"
                    dangerouslySetInnerHTML={{ 
                      __html: getSyntaxHighlightedCode(code, selectedLanguage) 
                    }}
                  />
                  {/* Actual textarea */}
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    className="w-full h-full bg-transparent text-white font-mono text-sm p-4 rounded-lg border-none focus:outline-none resize-none relative z-10"
                    placeholder={`Write your ${selectedLanguage} solution here...

📖 Tip: Check the yellow hint box above for a working example!

Basic template for ${selectedLanguage}:
${
                    selectedLanguage === 'JavaScript' ? 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim();\n// Input is sanitized, use simple parsing\nconst arr = input.split(" ").map(Number);\nconsole.log(result);' :
                    selectedLanguage === 'Python' ? 'import sys\ndata = sys.stdin.read().strip()\n# Input is sanitized, use simple parsing\narr = list(map(int, data.split()))\nprint(result)' :
                    selectedLanguage === 'Java' ? 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // Input is sanitized, use simple parsing\n    System.out.println(result);\n  }\n}' :
                    selectedLanguage === 'C++' ? '#include <iostream>\nusing namespace std;\nint main() {\n  // Input is sanitized, use simple parsing\n  cout << result;\n  return 0;\n}' :
                    selectedLanguage === 'C' ? '#include <stdio.h>\nint main() {\n  // Input is sanitized, use simple parsing\n  printf("%d", result);\n  return 0;\n}' :
                    'Read from stdin, process, write to stdout'
                  }`}
                    spellCheck={false}
                    style={{ 
                      color: 'transparent',
                      caretColor: 'white'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Resizable Test Results Panel */}
            <div 
              className="border-t border-white/10 bg-black/20 backdrop-blur-md"
              style={{ height: isPanelCollapsed ? '40px' : `${panelHeight}px` }}
            >
              {/* Panel Header with Drag Handle */}
              <div 
                className="flex items-center justify-between p-3 border-b border-white/10 cursor-pointer select-none"
                onDoubleClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              >
                <div className="flex items-center space-x-2">
                  <MdDragIndicator className="w-4 h-4 text-gray-400" />
                  <h4 className="text-lg font-semibold text-white">Test Results</h4>
                  {testResults && (
                    <span className="text-sm text-gray-400">
                      ({testResults.sampleResults?.length || 0} sample, {testResults.hiddenResults?.length || 0} hidden)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {testResults && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">Score:</span>
                      <span className="text-white font-bold">{testResults.score || 0}%</span>
                      <span className="text-gray-400">Time:</span>
                      <span className="text-white">{Math.round(testResults.executionTime || 0)}ms</span>
                    </div>
                  )}
                  <button
                    onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {isPanelCollapsed ? <MdExpandMore className="w-5 h-5 text-gray-400" /> : <MdExpandLess className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Drag Handle */}
              {!isPanelCollapsed && (
                <div
                  ref={dragRef}
                  className="h-1 bg-violet-500/30 hover:bg-violet-500/50 cursor-row-resize transition-colors"
                  onMouseDown={handleMouseDown}
                />
              )}

              {/* Test Results Content */}
              {!isPanelCollapsed && testResults && (
                <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
                  <div className="space-y-3">
                    {/* Sample Test Results */}
                    {testResults.sampleResults?.map((result, index) => (
                      <div key={index} className="bg-black/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {result.passed ? (
                              <MdCheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <MdError className="w-5 h-5 text-red-400" />
                            )}
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

                    {/* Hidden Test Results */}
                    {testResults.hiddenResults && (
                      <div className="mt-2 space-y-2">
                        <h5 className="text-sm font-medium text-gray-400">Hidden Tests</h5>
                        {testResults.hiddenResults.map((result, index) => (
                          <div key={index} className="bg-black/30 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {result.passed ? (
                                  <MdCheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <MdError className="w-5 h-5 text-red-400" />
                                )}
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

                    {/* Summary Stats */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>Memory: <span className="text-white">{Math.round(testResults.memoryUsed || 0)}MB</span></div>
                      <div className="text-right">Total Tests: <span className="text-white">{(testResults.sampleResults?.length || 0) + (testResults.hiddenResults?.length || 0)}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isPanelCollapsed && !testResults && (
                <div className="p-4 text-center text-gray-400">
                  <MdCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Run your code to see test results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Problems List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-black relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
        <span className="text-9xl font-bold text-violet-400">SKYPAD</span>
      </div>
      
      <div className="relative z-10">
        {/* Main Content Area */}
        <div className="p-6">
          {/* Header and Search */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                title="Back to Dashboard"
              >
                <MdArrowBack className="w-6 h-6 text-white" />
              </button>
              
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
                  All Problems
                </h2>
                <p className="text-gray-300 mt-2">Solve coding challenges and improve your skills</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Clear Cache Button */}
              <button
                onClick={() => {
                  if (confirm('Clear old localStorage cache and reload fresh data from database?')) {
                    localStorage.removeItem('dsaProblems');
                    console.log('✅ Cleared dsaProblems cache');
                    fetchProblems();
                    fetchSolvedProblems();
                    window.dispatchEvent(new CustomEvent('dsaProblemsUpdated'));
                    alert('Cache cleared! Data is now loading from MongoDB database.');
                  }
                }}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                title="Clear old cache and fetch from database"
              >
                <MdRefresh className="w-4 h-4" />
                <span>Clear Cache</span>
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={() => {
                  fetchProblems();
                  fetchSolvedProblems();
                  window.dispatchEvent(new CustomEvent('dsaProblemsUpdated'));
                }}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                title="Refresh problems from database"
              >
                <MdRefresh className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 backdrop-blur-md text-white placeholder-gray-300 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-violet-400 w-64"
                />
                <MdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
              </div>
              
              <DashboardNavbar />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">Difficulty:</span>
              <div className="flex space-x-2">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      difficultyFilter === diff
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {diff !== 'All' && getDifficultyIcon(diff)} {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          {/* Problems Grid */}
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">
                {searchTerm || difficultyFilter !== 'All' 
                  ? 'No problems found matching your criteria' 
                  : 'No problems available yet'
                }
              </div>
              <button
                onClick={() => navigate('/upload-question')}
                className="btn-primary px-6 py-3 rounded-lg font-medium"
              >
                Upload First Problem
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProblems.map((problem) => {
                const isSolved = solvedProblems.has(problem._id);
                return (
                <div
                  key={problem._id}
                  className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:scale-105 cursor-pointer group ${
                    isSolved ? 'border-green-400/50 hover:border-green-400' : 'border-white/20 hover:border-violet-400/50'
                  }`}
                  onClick={() => setSelectedProblem(problem)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                            {problem.title}
                          </h3>
                          {isSolved && <MdCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          <div className="flex items-center space-x-1 text-gray-400 text-xs">
                            <MdPerson className="w-3 h-3" />
                            <span>{problem.createdBy?.username || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl">
                        {getDifficultyIcon(problem.difficulty)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {problem.description}
                    </p>

                    {/* Constraints */}
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MdTimer className="w-3 h-3" />
                        <span>{problem.timeLimit}ms</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MdMemory className="w-3 h-3" />
                        <span>{problem.memoryLimit}MB</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-xs flex items-center space-x-1"
                          >
                            <MdTag className="w-2 h-2" />
                            <span>{tag.toLowerCase()}</span>
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                            +{problem.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1">
                      {problem.allowedLanguages.slice(0, 3).map((lang, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                        >
                          {lang}
                        </span>
                      ))}
                      {problem.allowedLanguages.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                          +{problem.allowedLanguages.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Solve Button */}
                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProblem(problem);
                        }}
                        className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 ${
                          isSolved 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white'
                        }`}
                      >
                        {isSolved ? (
                          <>
                            <MdCheckCircle className="w-4 h-4" />
                            <span>Solved ✓</span>
                          </>
                        ) : (
                          <>
                            <MdPlayArrow className="w-4 h-4" />
                            <span>Solve Problem</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-gray-400">
                Showing {filteredProblems.length} of {problems.length} problems
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <MdCheckCircle className="w-4 h-4" />
                <span>{solvedProblems.size} Solved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problems;