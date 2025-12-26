// This file checks if a user is logged in and what role they have
// It's like a security guard checking IDs at the door

const jwt = require('jsonwebtoken');
const { get } = require('../database');

// Secret key for signing tokens (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware to verify if user is authenticated
function authenticateToken(req, res, next) {
  // Get the token from the request header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user; // Attach user info to request
    next(); // Continue to the next function
  });
}

// Middleware to check if user has required role
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin has access to everything
    if (req.user.role === 'Admin') {
      return next();
    }

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  };
}

// Helper function to check access for specific operations
function checkAccess(userRole, operation, resource) {
  // Admin has full access
  if (userRole === 'Admin') {
    return true;
  }

  // Define access rules
  const accessRules = {
    'Customer': {
      'Loan Officer': ['create', 'view', 'edit'],
      'Cashier': ['view']
    },
    'Loan': {
      'Loan Officer': ['create', 'view', 'edit'],
      'Cashier': ['view']
    },
    'Repayment': {
      'Loan Officer': ['view'],
      'Cashier': ['view']
    },
    'Payment': {
      'Loan Officer': ['view'],
      'Cashier': ['create', 'view', 'edit']
    },
    'User': {
      'Loan Officer': [],
      'Cashier': []
    },
    'Report': {
      'Loan Officer': ['view'],
      'Cashier': ['view'] // Only collections
    }
  };

  const allowedOps = accessRules[resource]?.[userRole] || [];
  return allowedOps.includes(operation);
}

module.exports = {
  authenticateToken,
  requireRole,
  checkAccess,
  JWT_SECRET
};

