// This file handles all loan-related operations

const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { query, run, get } = require('../database');
const { authenticateToken, checkAccess } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authenticateToken);

// Get all loans
router.get('/', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Loan')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const loans = await query(`
      SELECT l.*, c.full_name, c.contact_number 
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      ORDER BY l.loan_id DESC
    `);
    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single loan by ID
router.get('/:id', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Loan')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const loan = await get(`
      SELECT l.*, c.full_name, c.contact_number 
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      WHERE l.loan_id = ?
    `, [req.params.id]);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get loans by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Loan')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const loans = await query(`
      SELECT l.*, c.full_name 
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      WHERE l.customer_id = ?
      ORDER BY l.loan_id DESC
    `, [req.params.customerId]);
    
    res.json(loans);
  } catch (error) {
    console.error('Error fetching customer loans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new loan
router.post('/', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'create', 'Loan')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { customer_id, loan_amount, interest_rate, loan_term, start_date, end_date, loan_status } = req.body;

    if (!customer_id || !loan_amount || !interest_rate || !loan_term || !start_date || !end_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify customer exists
    const customer = await get('SELECT * FROM customers WHERE customer_id = ?', [customer_id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const result = await run(
      `INSERT INTO loans (customer_id, loan_amount, interest_rate, loan_term, start_date, end_date, loan_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, loan_amount, interest_rate, loan_term, start_date, end_date, loan_status || 'Pending']
    );

    const newLoan = await get(`
      SELECT l.*, c.full_name 
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      WHERE l.loan_id = ?
    `, [result.lastID]);
    
    res.status(201).json(newLoan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update loan
router.put('/:id', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'edit', 'Loan')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { loan_amount, interest_rate, loan_term, start_date, end_date, loan_status } = req.body;

    const existing = await get('SELECT * FROM loans WHERE loan_id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    await run(
      `UPDATE loans 
       SET loan_amount = ?, interest_rate = ?, loan_term = ?, start_date = ?, end_date = ?, loan_status = ?
       WHERE loan_id = ?`,
      [loan_amount, interest_rate, loan_term, start_date, end_date, loan_status, req.params.id]
    );

    const updatedLoan = await get(`
      SELECT l.*, c.full_name 
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      WHERE l.loan_id = ?
    `, [req.params.id]);
    
    res.json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete loan (only Admin)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Only Admin can delete loans.' });
    }

    const existing = await get('SELECT * FROM loans WHERE loan_id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    await run('DELETE FROM loans WHERE loan_id = ?', [req.params.id]);
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export loans to Excel/CSV
router.get('/export/excel', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Loan')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const loans = await query(`
      SELECT l.*, c.full_name, c.contact_number 
      FROM loans l
      JOIN customers c ON l.customer_id = c.customer_id
      ORDER BY l.loan_id DESC
    `);
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(loans);
    XLSX.utils.book_append_sheet(wb, ws, 'Loans');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=loans_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting loans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import loans from Excel/CSV
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'create', 'Loan')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid file format. Please upload Excel (.xlsx) or CSV file.' });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'File is empty or has no data' });
    }

    const imported = [];
    const errors = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Map column names (case-insensitive, handle variations)
        const customer_id = row['Customer ID'] || row['customer_id'] || row['CustomerID'] || row['Customer Id'];
        const loan_amount = row['Loan Amount'] || row['loan_amount'] || row['LoanAmount'] || row['Amount'] || row['amount'];
        const interest_rate = row['Interest Rate'] || row['interest_rate'] || row['InterestRate'] || row['Rate'] || row['rate'] || 0;
        const loan_term = row['Loan Term'] || row['loan_term'] || row['LoanTerm'] || row['Term'] || row['term'] || 'Monthly';
        const start_date = row['Start Date'] || row['start_date'] || row['StartDate'] || today;
        const end_date = row['End Date'] || row['end_date'] || row['EndDate'];
        const loan_status = row['Loan Status'] || row['loan_status'] || row['LoanStatus'] || row['Status'] || row['status'] || 'Pending';

        if (!customer_id || !loan_amount || !end_date) {
          errors.push(`Row ${i + 2}: Missing required fields (Customer ID, Loan Amount, End Date)`);
          continue;
        }

        // Verify customer exists
        const customer = await get('SELECT * FROM customers WHERE customer_id = ?', [customer_id]);
        if (!customer) {
          errors.push(`Row ${i + 2}: Customer ID ${customer_id} not found`);
          continue;
        }

        const result = await run(
          `INSERT INTO loans (customer_id, loan_amount, interest_rate, loan_term, start_date, end_date, loan_status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [customer_id, loan_amount, interest_rate, loan_term, start_date, end_date, loan_status]
        );

        const newLoan = await get(`
          SELECT l.*, c.full_name 
          FROM loans l
          JOIN customers c ON l.customer_id = c.customer_id
          WHERE l.loan_id = ?
        `, [result.lastID]);
        
        imported.push(newLoan);
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.json({
      message: `Import completed. ${imported.length} loans imported successfully.`,
      imported: imported.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Error importing loans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

