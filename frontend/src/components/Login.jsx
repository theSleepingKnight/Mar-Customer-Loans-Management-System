// Login page component
// This is where users enter their username and password

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { setAuthToken, setUser } from '../utils/auth'
import Logo from './Logo'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { username, password })
      
      // Save token and user data
      setAuthToken(response.data.token)
      setUser(response.data.user)
      
      // Notify parent component
      onLogin(response.data.user)
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0B1F3B 0%, #1e3a5f 100%)'
    }}>
      <div className="card" style={{ width: '450px', maxWidth: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Logo size={80} showText={false} />
        </div>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#0B1F3B', fontSize: '20px', fontWeight: 700 }}>
          Marfyang Customer and Loan Management System
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#64748b', fontSize: '18px', fontWeight: 500 }}>
          Secure Access Portal
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#94a3b8', fontSize: '14px' }}>
          Please enter your credentials to access the system
        </p>
        
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', background: '#F1F5F9', borderRadius: '4px', fontSize: '13px', color: '#0B1F3B' }}>
          <strong style={{ fontSize: '14px' }}>Authorized Access Credentials:</strong>
          <ul style={{ marginTop: '10px', paddingLeft: '20px', lineHeight: '1.8' }}>
            <li><strong>Administrator:</strong> Admin / Admin123</li>
            <li><strong>Loan Officer:</strong> Loans / Loans123</li>
            <li><strong>Cashier:</strong> Cashier / Cashier123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login

