// This is the main server file - it's like the brain of our application
// It listens for requests from the frontend and responds with data

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import our database and routes
const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const loanRoutes = require('./routes/loans');
const repaymentRoutes = require('./routes/repayments');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = 3000;

// Middleware - these are like helpers that process requests before they reach our code
app.use(cors()); // Allows frontend to talk to backend
app.use(express.json()); // Converts request data to JavaScript objects

// Routes - these are like different doors to different parts of our system
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/repayments', repaymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Simple health check so hitting http://localhost:3000 shows something
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Loan Management API is running' });
});

// Initialize database when server starts
initDatabase().then(() => {
  console.log('Database initialized successfully');
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Loan Management System is ready!');
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

