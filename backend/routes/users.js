// This file handles user account management (only Admin)

const express = require('express');
const bcrypt = require('bcryptjs');
const { query, run, get } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require Admin role
router.use(authenticateToken);
router.use(requireRole('Admin'));

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await query('SELECT user_id, name, username, role, status FROM users ORDER BY user_id DESC');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await get(
      'SELECT user_id, name, username, role, status FROM users WHERE user_id = ?',
      [req.params.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, username, password, role, status } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if username already exists
    const existing = await get('SELECT * FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await run(
      `INSERT INTO users (name, username, password, role, status)
       VALUES (?, ?, ?, ?, ?)`,
      [name, username, hashedPassword, role, status || 'Active']
    );

    const newUser = await get(
      'SELECT user_id, name, username, role, status FROM users WHERE user_id = ?',
      [result.lastID]
    );
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, username, password, role, status } = req.body;

    const existing = await get('SELECT * FROM users WHERE user_id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if username is being changed and if new username exists
    if (username && username !== existing.username) {
      const usernameExists = await get('SELECT * FROM users WHERE username = ? AND user_id != ?', [username, req.params.id]);
      if (usernameExists) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    // Update password only if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await run(
        `UPDATE users 
         SET name = ?, username = ?, password = ?, role = ?, status = ?
         WHERE user_id = ?`,
        [name || existing.name, username || existing.username, hashedPassword, role || existing.role, status || existing.status, req.params.id]
      );
    } else {
      await run(
        `UPDATE users 
         SET name = ?, username = ?, role = ?, status = ?
         WHERE user_id = ?`,
        [name || existing.name, username || existing.username, role || existing.role, status || existing.status, req.params.id]
      );
    }

    const updatedUser = await get(
      'SELECT user_id, name, username, role, status FROM users WHERE user_id = ?',
      [req.params.id]
    );
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const existing = await get('SELECT * FROM users WHERE user_id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    await run('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

