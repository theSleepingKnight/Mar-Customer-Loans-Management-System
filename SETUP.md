# Setup Guide - Customer Loans Management System

## Step-by-Step Installation Instructions

### Prerequisites
Before starting, make sure you have **Node.js** installed on your computer.
- Download from: https://nodejs.org/
- Choose the LTS (Long Term Support) version
- During installation, make sure to check "Add to PATH"

### Step 1: Install Backend Dependencies

1. Open your terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install all required packages:
   ```bash
   npm install
   ```
   This will download all the necessary code libraries for the backend server.

### Step 2: Install Frontend Dependencies

1. Open a NEW terminal/command prompt window
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Install all required packages:
   ```bash
   npm install
   ```
   This will download all the necessary code libraries for the frontend interface.

### Step 3: Start the Backend Server

1. In your first terminal (backend folder), run:
   ```bash
   npm start
   ```
2. You should see: "Server is running on http://localhost:3000"
3. Keep this terminal window open - don't close it!

### Step 4: Start the Frontend Application

1. In your second terminal (frontend folder), run:
   ```bash
   npm run dev
   ```
2. You should see a message with a local URL (usually http://localhost:5173)
3. Keep this terminal window open too!

### Step 5: Open the Application

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: http://localhost:5173
3. You should see the login page!

## Default Login Credentials

You can use these accounts to log in:

- **Admin/Manager Account:**
  - Username: `Admin`
  - Password: `Admin123`
  - Access: Full system access

- **Loan Officer Account:**
  - Username: `Loans`
  - Password: `Loans123`
  - Access: Can create/edit loans and customers, view reports

- **Cashier Account:**
  - Username: `Cashier`
  - Password: `Cashier123`
  - Access: Can record payments, view collections

## Troubleshooting

### Problem: "npm is not recognized"
**Solution:** Node.js is not installed or not in your PATH. Reinstall Node.js and make sure to check "Add to PATH" during installation.

### Problem: Port 3000 or 5173 is already in use
**Solution:** Another application is using that port. Close other applications or change the port in the configuration files.

### Problem: "Cannot find module" errors
**Solution:** Make sure you ran `npm install` in both the backend and frontend folders.

### Problem: Database errors
**Solution:** The database file will be created automatically when you first start the server. Make sure the backend folder has write permissions.

## What Each Part Does

- **Backend (server.js)**: Handles all data operations, like saving customers, loans, and payments
- **Frontend (React)**: The user interface you see in your browser
- **Database (SQLite)**: Stores all your data in a file called `database.sqlite`

## Next Steps

1. Log in with the admin account
2. Add some customers
3. Create loans for those customers
4. Record payments
5. View reports to see your data

Enjoy using your Loan Management System!

