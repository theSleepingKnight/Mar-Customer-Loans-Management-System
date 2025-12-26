# Customer Loans Management System

A web application for managing customer loans, repayments, and payments with role-based access control.

## User Roles
- **Admin/Manager**: Full access to all features
- **Loan Officer**: Can create/edit loans and customers, view reports
- **Cashier**: Can record payments and view collections

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

3. Open your browser and go to: https://mar-customer-loans-management-system-lckq-909n5tt8f.vercel.app/login

## Default Login Credentials

- **Admin/Manager**: username: `Admin`, password: `Admin123`
- **Loan Officer**: username: `Loans`, password: `Loans123`
- **Cashier**: username: `Cashier`, password: `Cashier123`

