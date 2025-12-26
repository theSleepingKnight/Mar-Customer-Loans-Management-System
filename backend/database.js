// This file sets up our database
// Think of it like creating filing cabinets and organizing them

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'database.sqlite');

// Create connection to database
function getDatabase() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    }
  });
}

// Initialize database - create all tables if they don't exist
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    // Create Users table - stores login information
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('Admin', 'Loan Officer', 'Cashier')),
        status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Disabled'))
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
        reject(err);
        return;
      }
    });

    // Create Customers table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        address TEXT NOT NULL,
        id_type TEXT NOT NULL,
        id_number TEXT NOT NULL,
        date_registered TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive'))
      )
    `, (err) => {
      if (err) {
        console.error('Error creating customers table:', err);
        reject(err);
        return;
      }
    });

    // Create Loans table
    db.run(`
      CREATE TABLE IF NOT EXISTS loans (
        loan_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        loan_amount REAL NOT NULL,
        interest_rate REAL NOT NULL,
        loan_term TEXT NOT NULL CHECK(loan_term IN ('Weekly', 'Monthly')),
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        loan_status TEXT NOT NULL DEFAULT 'Pending' CHECK(loan_status IN ('Pending', 'Approved', 'Active', 'Closed')),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating loans table:', err);
        reject(err);
        return;
      }
    });

    // Create Repayment Schedule table
    db.run(`
      CREATE TABLE IF NOT EXISTS repayment_schedule (
        schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER NOT NULL,
        due_date TEXT NOT NULL,
        amount_due REAL NOT NULL,
        outstanding_balance REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Unpaid' CHECK(status IN ('Unpaid', 'Paid', 'Late')),
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating repayment_schedule table:', err);
        reject(err);
        return;
      }
    });

    // Create Payments table
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        payment_date TEXT NOT NULL,
        amount_paid REAL NOT NULL,
        payment_method TEXT NOT NULL CHECK(payment_method IN ('Cash', 'Bank', 'E-Wallet')),
        reference_number TEXT,
        recorded_by INTEGER NOT NULL,
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (recorded_by) REFERENCES users(user_id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating payments table:', err);
        reject(err);
        return;
      }

      // Create default users after all tables are created
      createDefaultUsers(db).then(() => {
        db.close();
        resolve();
      }).catch(reject);
    });
  });
}

// Create default users for testing
async function createDefaultUsers(db) {
  return new Promise((resolve, reject) => {
    // Check if users already exist
    db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        // Users already exist, skip creation
        resolve();
        return;
      }

      // Hash passwords (encrypt them for security)
      const adminPassword = await bcrypt.hash('Admin123', 10);
      const officerPassword = await bcrypt.hash('Loans123', 10);
      const cashierPassword = await bcrypt.hash('Cashier123', 10);

      // Insert default users
      const users = [
        ['Admin/Manager', 'Admin', adminPassword, 'Admin', 'Active'],
        ['Loan Officer', 'Loans', officerPassword, 'Loan Officer', 'Active'],
        ['Cashier', 'Cashier', cashierPassword, 'Cashier', 'Active']
      ];

      const stmt = db.prepare(`
        INSERT INTO users (name, username, password, role, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      let completed = 0;
      users.forEach((user) => {
        stmt.run(user, (err) => {
          if (err) {
            console.error('Error creating default user:', err);
          }
          completed++;
          if (completed === users.length) {
            stmt.finalize();
            resolve();
          }
        });
      });
    });
  });
}

// Helper function to run database queries
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to run database commands (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(sql, params, function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper function to get a single row
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(sql, params, (err, row) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  initDatabase,
  getDatabase,
  query,
  run,
  get
};

