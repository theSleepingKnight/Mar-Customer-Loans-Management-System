// This file handles all customer-related operations
// Like adding, viewing, editing, and deleting customer records

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

// All routes require authentication
router.use(authenticateToken);

// Get all customers
router.get('/', async (req, res) => {
  try {
    // Check access permission
    if (!checkAccess(req.user.role, 'view', 'Customer')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const customers = await query('SELECT * FROM customers ORDER BY customer_id DESC');
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single customer by ID
router.get('/:id', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Customer')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const customer = await get('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    // Check access permission
    if (!checkAccess(req.user.role, 'create', 'Customer')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { full_name, contact_number, address, id_type, id_number, date_registered, status } = req.body;

    // Validate required fields
    if (!full_name || !contact_number || !address || !id_type || !id_number || !date_registered) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await run(
      `INSERT INTO customers (full_name, contact_number, address, id_type, id_number, date_registered, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, contact_number, address, id_type, id_number, date_registered, status || 'Active']
    );

    const newCustomer = await get('SELECT * FROM customers WHERE customer_id = ?', [result.lastID]);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    // Check access permission
    if (!checkAccess(req.user.role, 'edit', 'Customer')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { full_name, contact_number, address, id_type, id_number, status } = req.body;

    // Check if customer exists
    const existing = await get('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await run(
      `UPDATE customers 
       SET full_name = ?, contact_number = ?, address = ?, id_type = ?, id_number = ?, status = ?
       WHERE customer_id = ?`,
      [full_name, contact_number, address, id_type, id_number, status, req.params.id]
    );

    const updatedCustomer = await get('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer (only Admin)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Only Admin can delete customers.' });
    }

    const existing = await get('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await run('DELETE FROM customers WHERE customer_id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export customers to Excel/CSV
router.get('/export/excel', async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'view', 'Customer')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const customers = await query('SELECT * FROM customers ORDER BY customer_id DESC');
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(customers);
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=customers_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import customers from Excel/CSV
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!checkAccess(req.user.role, 'create', 'Customer')) {
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
        const full_name = row['Full Name'] || row['full_name'] || row['FullName'] || row['Name'] || row['name'];
        const contact_number = row['Contact Number'] || row['contact_number'] || row['ContactNumber'] || row['Phone'] || row['phone'] || row['Contact'];
        const address = row['Address'] || row['address'];
        const id_type = row['ID Type'] || row['id_type'] || row['IDType'] || row['Id Type'] || 'National ID';
        const id_number = row['ID Number'] || row['id_number'] || row['IDNumber'] || row['Id Number'];
        const date_registered = row['Date Registered'] || row['date_registered'] || row['DateRegistered'] || today;
        const status = row['Status'] || row['status'] || 'Active';

        if (!full_name || !contact_number || !address || !id_number) {
          errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        const result = await run(
          `INSERT INTO customers (full_name, contact_number, address, id_type, id_number, date_registered, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [full_name, contact_number, address, id_type, id_number, date_registered, status]
        );

        const newCustomer = await get('SELECT * FROM customers WHERE customer_id = ?', [result.lastID]);
        imported.push(newCustomer);
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.json({
      message: `Import completed. ${imported.length} customers imported successfully.`,
      imported: imported.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Error importing customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

