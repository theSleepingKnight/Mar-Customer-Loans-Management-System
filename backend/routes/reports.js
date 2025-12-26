// This file generates various reports for the loan management system

const express = require('express');
const { query } = require('../database');
const { authenticateToken, checkAccess } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get total active loans
router.get('/active-loans', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Report')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const activeLoans = await query(`
      SELECT COUNT(*) as total, SUM(loan_amount) as total_amount
      FROM loans
      WHERE loan_status = 'Active'
    `);

    const detailedLoans = await query(`
      SELECT l.*, c.full_name, c.contact_number
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      WHERE l.loan_status = 'Active'
      ORDER BY l.loan_id DESC
    `);

    res.json({
      summary: activeLoans[0],
      loans: detailedLoans
    });
  } catch (error) {
    console.error('Error generating active loans report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get outstanding balance per customer
router.get('/outstanding-balance', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Report')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const outstanding = await query(`
      SELECT 
        c.customer_id,
        c.full_name,
        c.contact_number,
        COUNT(DISTINCT l.loan_id) as active_loans,
        SUM(rs.outstanding_balance) as total_outstanding
      FROM customers c
      JOIN loans l ON c.customer_id = l.customer_id
      JOIN repayment_schedule rs ON l.loan_id = rs.loan_id
      WHERE l.loan_status = 'Active' AND rs.status != 'Paid'
      GROUP BY c.customer_id, c.full_name, c.contact_number
      HAVING total_outstanding > 0
      ORDER BY total_outstanding DESC
    `);

    res.json(outstanding);
  } catch (error) {
    console.error('Error generating outstanding balance report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get collections report (daily/weekly/monthly)
router.get('/collections', async (req, res) => {
  try {
    // Cashier can only view collections
    if (!checkAccess(req.user.role, 'view', 'Report')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { period = 'daily', startDate, endDate } = req.query;

    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `WHERE p.payment_date BETWEEN '${startDate}' AND '${endDate}'`;
    } else if (period === 'daily') {
      dateFilter = `WHERE DATE(p.payment_date) = DATE('now')`;
    } else if (period === 'weekly') {
      dateFilter = `WHERE DATE(p.payment_date) >= DATE('now', '-7 days')`;
    } else if (period === 'monthly') {
      dateFilter = `WHERE DATE(p.payment_date) >= DATE('now', '-30 days')`;
    }

    const collections = await query(`
      SELECT 
        p.payment_date,
        COUNT(*) as payment_count,
        SUM(p.amount_paid) as total_collected,
        p.payment_method,
        COUNT(DISTINCT p.customer_id) as unique_customers
      FROM payments p
      ${dateFilter}
      GROUP BY DATE(p.payment_date), p.payment_method
      ORDER BY p.payment_date DESC
    `);

    const summary = await query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount_paid) as total_amount,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM payments
      ${dateFilter}
    `);

    res.json({
      period,
      summary: summary[0],
      collections
    });
  } catch (error) {
    console.error('Error generating collections report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get loans created within a period (daily/weekly/monthly or custom range)
router.get('/loans-by-period', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Report')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { period = 'daily', startDate, endDate } = req.query;

    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `WHERE DATE(l.start_date) BETWEEN '${startDate}' AND '${endDate}'`;
    } else if (period === 'daily') {
      dateFilter = `WHERE DATE(l.start_date) = DATE('now')`;
    } else if (period === 'weekly') {
      dateFilter = `WHERE DATE(l.start_date) >= DATE('now', '-7 days')`;
    } else if (period === 'monthly') {
      dateFilter = `WHERE DATE(l.start_date) >= DATE('now', '-30 days')`;
    }

    const summary = await query(`
      SELECT 
        COUNT(*) as total_loans,
        SUM(l.loan_amount) as total_amount
      FROM loans l
      ${dateFilter}
    `);

    const breakdown = await query(`
      SELECT 
        DATE(l.start_date) as loan_date,
        COUNT(*) as loan_count,
        SUM(l.loan_amount) as total_amount
      FROM loans l
      ${dateFilter}
      GROUP BY DATE(l.start_date)
      ORDER BY loan_date DESC
    `);

    res.json({
      period,
      summary: summary[0],
      breakdown
    });
  } catch (error) {
    console.error('Error generating loans-by-period report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get overdue loans
router.get('/overdue', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Report')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const overdue = await query(`
      SELECT 
        rs.*,
        l.loan_id,
        l.loan_amount,
        l.loan_term,
        c.customer_id,
        c.full_name,
        c.contact_number,
        CASE 
          WHEN DATE(rs.due_date) < DATE('now') AND rs.status = 'Unpaid' THEN 'Overdue'
          ELSE rs.status
        END as payment_status,
        JULIANDAY('now') - JULIANDAY(rs.due_date) as days_overdue
      FROM repayment_schedule rs
      JOIN loans l ON rs.loan_id = l.loan_id
      JOIN customers c ON l.customer_id = c.customer_id
      WHERE DATE(rs.due_date) < DATE('now') AND rs.status = 'Unpaid'
      ORDER BY rs.due_date ASC
    `);

    // Update status to 'Late' for overdue payments
    for (const item of overdue) {
      if (item.status === 'Unpaid') {
        await query(
          'UPDATE repayment_schedule SET status = ? WHERE schedule_id = ?',
          ['Late', item.schedule_id]
        );
      }
    }

    res.json(overdue);
  } catch (error) {
    console.error('Error generating overdue loans report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

