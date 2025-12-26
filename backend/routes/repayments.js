// This file handles repayment schedule operations

const express = require('express');
const { query, run, get } = require('../database');
const { authenticateToken, checkAccess } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get all repayment schedules
router.get('/', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Repayment')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const schedules = await query(`
      SELECT rs.*, l.loan_amount, l.interest_rate, c.full_name
      FROM repayment_schedule rs
      JOIN loans l ON rs.loan_id = l.loan_id
      JOIN customers c ON l.customer_id = c.customer_id
      ORDER BY rs.due_date ASC
    `);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching repayment schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get repayment schedule by loan ID
router.get('/loan/:loanId', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Repayment')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const schedules = await query(`
      SELECT rs.*, l.loan_amount, c.full_name
      FROM repayment_schedule rs
      JOIN loans l ON rs.loan_id = l.loan_id
      JOIN customers c ON l.customer_id = c.customer_id
      WHERE rs.loan_id = ?
      ORDER BY rs.due_date ASC
    `, [req.params.loanId]);
    
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching loan repayment schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create repayment schedule (typically done when loan is approved)
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Only Admin can create repayment schedules.' });
    }

    const { loan_id, due_date, amount_due, outstanding_balance, status } = req.body;

    if (!loan_id || !due_date || !amount_due || outstanding_balance === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify loan exists
    const loan = await get('SELECT * FROM loans WHERE loan_id = ?', [loan_id]);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const result = await run(
      `INSERT INTO repayment_schedule (loan_id, due_date, amount_due, outstanding_balance, status)
       VALUES (?, ?, ?, ?, ?)`,
      [loan_id, due_date, amount_due, outstanding_balance, status || 'Unpaid']
    );

    const newSchedule = await get('SELECT * FROM repayment_schedule WHERE schedule_id = ?', [result.lastID]);
    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Error creating repayment schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update repayment schedule
router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Only Admin can update repayment schedules.' });
    }

    const { due_date, amount_due, outstanding_balance, status } = req.body;

    const existing = await get('SELECT * FROM repayment_schedule WHERE schedule_id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Repayment schedule not found' });
    }

    await run(
      `UPDATE repayment_schedule 
       SET due_date = ?, amount_due = ?, outstanding_balance = ?, status = ?
       WHERE schedule_id = ?`,
      [due_date, amount_due, outstanding_balance, status, req.params.id]
    );

    const updatedSchedule = await get('SELECT * FROM repayment_schedule WHERE schedule_id = ?', [req.params.id]);
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating repayment schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

