const express = require('express');
const Problem = require('../models/Problem');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/problems - Get all problems (public)
router.get('/', async (req, res) => {
  try {
    const { difficulty, search, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const problems = await Problem.find(query)
      .select('-hiddenTestCases -__v')
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Problem.countDocuments(query);
    
    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Failed to fetch problems' });
  }
});

// GET /api/problems/:id - Get single problem (public, without hidden test cases)
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, isActive: true })
      .select('-hiddenTestCases -__v')
      .populate('createdBy', 'username fullName');
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Failed to fetch problem' });
  }
});

// POST /api/problems - Create new problem (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      constraints,
      sampleTestCases,
      hiddenTestCases,
      allowedLanguages,
      timeLimit,
      memoryLimit,
      tags
    } = req.body;
    
    // Validation
    if (!title || !description || !difficulty || !constraints) {
      return res.status(400).json({ message: 'Title, description, difficulty, and constraints are required' });
    }
    
    if (!sampleTestCases || sampleTestCases.length === 0) {
      return res.status(400).json({ message: 'At least one sample test case is required' });
    }
    
    if (!hiddenTestCases || hiddenTestCases.length === 0) {
      return res.status(400).json({ message: 'At least one hidden test case is required' });
    }
    
    if (!allowedLanguages || allowedLanguages.length === 0) {
      return res.status(400).json({ message: 'At least one programming language must be selected' });
    }
    
    const problem = new Problem({
      title,
      description,
      difficulty,
      constraints,
      sampleTestCases,
      hiddenTestCases,
      allowedLanguages,
      timeLimit: timeLimit || 1000,
      memoryLimit: memoryLimit || 256,
      createdBy: req.user.id,
      tags: tags || []
    });
    
    await problem.save();
    
    res.status(201).json({
      message: 'Problem created successfully',
      problem: {
        id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty,
        createdAt: problem.createdAt
      }
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Failed to create problem' });
  }
});

// PUT /api/problems/:id - Update problem (authenticated, only by creator)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, createdBy: req.user.id });
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found or you are not authorized to edit it' });
    }
    
    const updates = req.body;
    delete updates.createdBy; // Prevent changing creator
    delete updates._id; // Prevent changing ID
    
    Object.assign(problem, updates);
    await problem.save();
    
    res.json({ message: 'Problem updated successfully' });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ message: 'Failed to update problem' });
  }
});

// DELETE /api/problems/:id - Delete problem (authenticated, only by creator)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, createdBy: req.user.id });
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found or you are not authorized to delete it' });
    }
    
    problem.isActive = false;
    await problem.save();
    
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ message: 'Failed to delete problem' });
  }
});

// GET /api/problems/my - Get current user's problems
router.get('/my/problems', authenticateToken, async (req, res) => {
  try {
    const problems = await Problem.find({ createdBy: req.user.id })
      .select('-hiddenTestCases -__v')
      .sort({ createdAt: -1 });
    
    res.json(problems);
  } catch (error) {
    console.error('Get my problems error:', error);
    res.status(500).json({ message: 'Failed to fetch your problems' });
  }
});

// POST /api/problems/run - Execute code against test cases (Python and JavaScript supported)
router.post('/run', authenticateToken, async (req, res) => {
  const { spawn } = require('child_process');
  const fs = require('fs');
  const os = require('os');
  const path = require('path');

  function trimOutput(s) {
    return String(s ?? '')
      .replace(/\r/g, '')
      .replace(/\n+$/g, '')
      .trim();
  }

  async function runOnce({ lang, code, input, timeLimitMs }) {
    return new Promise((resolve) => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skypad-'));
      let filePath;
      let child;
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      try {
        if (lang === 'python') {
          filePath = path.join(tmpDir, 'Main.py');
          fs.writeFileSync(filePath, code, 'utf8');
          child = spawn('python', [filePath], { stdio: ['pipe', 'pipe', 'pipe'] });
        } else if (lang === 'javascript' || lang === 'js') {
          filePath = path.join(tmpDir, 'main.js');
          fs.writeFileSync(filePath, code, 'utf8');
          child = spawn(process.execPath, [filePath], { stdio: ['pipe', 'pipe', 'pipe'] });
        } else {
          return resolve({ success: false, output: '', error: 'Language not supported', timeMs: 0, memory: 0 });
        }
      } catch (err) {
        return resolve({ success: false, output: '', error: err.message, timeMs: 0, memory: 0 });
      }

      const start = Date.now();
      const to = setTimeout(() => {
        timedOut = true;
        try { child.kill('SIGKILL'); } catch {}
      }, Math.max(1000, timeLimitMs || 3000));

      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));

      child.on('error', (err) => {
        clearTimeout(to);
        resolve({ success: false, output: '', error: err.message, timeMs: Date.now() - start, memory: 0 });
      });

      child.on('close', (codeExit) => {
        clearTimeout(to);
        const elapsed = Date.now() - start;
        if (timedOut) {
          resolve({ success: false, output: trimOutput(stdout), error: 'Time Limit Exceeded', timeMs: elapsed, memory: 0 });
        } else if (codeExit !== 0 && stderr) {
          resolve({ success: false, output: trimOutput(stdout), error: trimOutput(stderr), timeMs: elapsed, memory: 0 });
        } else {
          resolve({ success: true, output: trimOutput(stdout), error: '', timeMs: elapsed, memory: 0 });
        }
      });

      // Write input and end
      if (input != null) {
        child.stdin.write(String(input));
      }
      child.stdin.end();
    });
  }

  try {
    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'problemId, code, and language are required' });
    }

    let problem = await Problem.findOne({ _id: problemId, isActive: true });

    // Fallback: allow on-the-fly problem payload for non-DB problems
    if (!problem) {
      const p = req.body.problem || {};
      const sample = req.body.sampleTestCases || p.sampleTestCases || [];
      const hidden = req.body.hiddenTestCases || p.hiddenTestCases || [];
      const allowed = p.allowedLanguages || req.body.allowedLanguages || ['JavaScript', 'Python'];
      problem = {
        timeLimit: p.timeLimit || 1000,
        sampleTestCases: sample,
        hiddenTestCases: hidden,
        allowedLanguages: allowed
      };
    }

    const lang = String(language).toLowerCase();
    const allowedLower = (problem.allowedLanguages || ['JavaScript', 'Python']).map(l => String(l).toLowerCase());
    if (!allowedLower.includes(lang)) {
      return res.status(400).json({ message: 'Language not supported for this problem' });
    }

    const timeLimitMs = (problem.timeLimit || 1000);
    const sampleCases = Array.isArray(problem.sampleTestCases) ? problem.sampleTestCases : [];
    const hiddenCases = Array.isArray(problem.hiddenTestCases) ? problem.hiddenTestCases : [];

    async function evaluate(cases) {
      const results = [];
      for (const tc of cases) {
        const input = tc.input ?? tc.stdin ?? '';
        const expected = trimOutput(tc.output ?? tc.expectedOutput ?? '');
        const execRes = await runOnce({ lang, code, input, timeLimitMs });
        const actual = trimOutput(execRes.output);
        const passed = execRes.success && actual === expected;
        results.push({
          input,
          expectedOutput: expected,
          actualOutput: actual,
          passed,
          error: execRes.error || undefined,
          timeMs: execRes.timeMs
        });
        // Early stop on obvious runtime error for user feedback
        if (!execRes.success && execRes.error && execRes.error !== 'Time Limit Exceeded') {
          // Continue evaluating others? Keep going to show more, but it's fine to continue
        }
      }
      return results;
    }

    const sampleResults = await evaluate(sampleCases);
    const hiddenResults = await evaluate(hiddenCases);

    const totalTests = sampleResults.length + hiddenResults.length;
    const passedTests = [...sampleResults, ...hiddenResults].filter(r => r.passed).length;
    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    res.json({
      sampleResults,
      hiddenResults,
      score,
      executionTime: sampleResults.reduce((a, r) => a + (r.timeMs || 0), 0),
      memoryUsed: 0
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ message: 'Code execution failed' });
  }
});

module.exports = router;
