// This file handles login and authentication
// Think of it as the reception desk where people check in

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user in database
    const user = await get(
      'SELECT * FROM users WHERE username = ? AND status = ?',
      [username, 'Active']
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create token (like a temporary ID card)
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Send success response with user info and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token route (check if user is still logged in)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      res.json({ valid: true, user: decoded });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

