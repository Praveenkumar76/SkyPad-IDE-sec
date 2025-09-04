const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');

const router = express.Router();

function createToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { email, username, fullName, password } = req.body || {};
    if (!email || !username || !fullName || !password) {
      return res.status(400).json({ message: 'email, username, fullName and password are required' });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, fullName, passwordHash });
    const safeFullName = user.fullName || user.username;
    const token = createToken({ sub: user.id, email: user.email, username: user.username, fullName: safeFullName });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username, fullName: safeFullName } });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Update last login and record login log
    user.lastLoginAt = new Date();
    await user.save();

    await LoginLog.create({
      userId: user._id,
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    const safeFullName = user.fullName || user.username;
    const token = createToken({ sub: user.id, email: user.email, username: user.username, fullName: safeFullName });
    return res.json({ token, user: { id: user.id, email: user.email, username: user.username, fullName: safeFullName }, lastLoginAt: user.lastLoginAt });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;