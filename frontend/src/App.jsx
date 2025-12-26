// This is the main App component - it's like the control center
// It decides what to show based on whether the user is logged in

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Customers from './components/Customers'
import Loans from './components/Loans'
import Repayments from './components/Repayments'
import Payments from './components/Payments'
import Users from './components/Users'
import Reports from './components/Reports'
import Layout from './components/Layout'
import { getAuthToken, getUser } from './utils/auth'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken()
    const userData = getUser()
    
    if (token && userData) {
      setUser(userData)
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/*" 
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={user} />} />
                  <Route path="/customers" element={<Customers user={user} />} />
                  <Route path="/loans" element={<Loans user={user} />} />
                  <Route path="/repayments" element={<Repayments user={user} />} />
                  <Route path="/payments" element={<Payments user={user} />} />
                  {user.role === 'Admin' && (
                    <Route path="/users" element={<Users user={user} />} />
                  )}
                  <Route path="/reports" element={<Reports user={user} />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

