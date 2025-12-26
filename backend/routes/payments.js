// This file handles payment recording operations

const express = require('express');
const { query, run, get } = require('../database');
const { authenticateToken, checkAccess } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get all payments
router.get('/', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Payment')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const payments = await query(`
      SELECT p.*, c.full_name, u.name as recorded_by_name
      FROM payments p
      JOIN customers c ON p.customer_id = c.customer_id
      JOIN users u ON p.recorded_by = u.user_id
      ORDER BY p.payment_date DESC, p.payment_id DESC
    `);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payments by loan ID
router.get('/loan/:loanId', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Payment')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const payments = await query(`
      SELECT p.*, c.full_name, u.name as recorded_by_name
      FROM payments p
      JOIN customers c ON p.customer_id = c.customer_id
      JOIN users u ON p.recorded_by = u.user_id
      WHERE p.loan_id = ?
      ORDER BY p.payment_date DESC
    `, [req.params.loanId]);
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching loan payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new payment
router.post('/', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'create', 'Payment')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { loan_id, customer_id, payment_date, amount_paid, payment_method, reference_number } = req.body;

    if (!loan_id || !customer_id || !payment_date || !amount_paid || !payment_method) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Verify loan and customer exist
    const loan = await get('SELECT * FROM loans WHERE loan_id = ?', [loan_id]);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const customer = await get('SELECT * FROM customers WHERE customer_id = ?', [customer_id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const result = await run(
      `INSERT INTO payments (loan_id, customer_id, payment_date, amount_paid, payment_method, reference_number, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [loan_id, customer_id, payment_date, amount_paid, payment_method, reference_number || null, req.user.userId]
    );

    // Update repayment schedule if payment matches a due amount
    // This is a simplified version - in production, you'd want more sophisticated matching
    const schedules = await query(
      'SELECT * FROM repayment_schedule WHERE loan_id = ? AND status = ? ORDER BY due_date ASC',
      [loan_id, 'Unpaid']
    );

    let remainingAmount = amount_paid;
    for (const schedule of schedules) {
      if (remainingAmount <= 0) break;
      
      if (remainingAmount >= schedule.amount_due) {
        // Full payment for this schedule
        const newOutstanding = schedule.outstanding_balance - schedule.amount_due;
        await run(
          'UPDATE repayment_schedule SET status = ?, outstanding_balance = ? WHERE schedule_id = ?',
          ['Paid', newOutstanding, schedule.schedule_id]
        );
        remainingAmount -= schedule.amount_due;
      } else {
        // Partial payment
        const newOutstanding = schedule.outstanding_balance - remainingAmount;
        await run(
          'UPDATE repayment_schedule SET outstanding_balance = ? WHERE schedule_id = ?',
          [newOutstanding, schedule.schedule_id]
        );
        remainingAmount = 0;
      }
    }

    const newPayment = await get(`
      SELECT p.*, c.full_name, u.name as recorded_by_name
      FROM payments p
      JOIN customers c ON p.customer_id = c.customer_id
      JOIN users u ON p.recorded_by = u.user_id
      WHERE p.payment_id = ?
    `, [result.lastID]);
    
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment (only Admin)
router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Only Admin can update payments.' });
    }

    const { payment_date, amount_paid, payment_method, reference_number } = req.body;

    const existing = await get('SELECT * FROM payments WHERE payment_id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await run(
      `UPDATE payments 
       SET payment_date = ?, amount_paid = ?, payment_method = ?, reference_number = ?
       WHERE payment_id = ?`,
      [payment_date, amount_paid, payment_method, reference_number, req.params.id]
    );

    const updatedPayment = await get(`
      SELECT p.*, c.full_name, u.name as recorded_by_name
      FROM payments p
      JOIN customers c ON p.customer_id = c.customer_id
      JOIN users u ON p.recorded_by = u.user_id
      WHERE p.payment_id = ?
    `, [req.params.id]);
    
    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

