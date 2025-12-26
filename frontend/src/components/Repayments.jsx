// Repayments component - view repayment schedules

import { useState, useEffect } from 'react'
import api from '../utils/api'

function Repayments({ user }) {
  const [repayments, setRepayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLoan, setSelectedLoan] = useState('')
  const [loans, setLoans] = useState([])

  useEffect(() => {
    fetchLoans()
    fetchRepayments()
  }, [selectedLoan])

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans')
      setLoans(response.data)
    } catch (error) {
      console.error('Failed to fetch loans')
    }
  }

  const fetchRepayments = async () => {
    try {
      setLoading(true)
      let response
      if (selectedLoan) {
        response = await api.get(`/repayments/loan/${selectedLoan}`)
      } else {
        response = await api.get('/repayments')
      }
      setRepayments(response.data)
    } catch (error) {
      console.error('Failed to fetch repayments')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, marginBottom: '5px' }}>Repayment Schedule Management</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Monitor and review loan repayment schedules</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Filter by Loan Account</label>
          <select
            value={selectedLoan}
            onChange={(e) => setSelectedLoan(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            <option value="">All Loans</option>
            {loans.map(loan => (
              <option key={loan.loan_id} value={loan.loan_id}>
                Loan #{loan.loan_id} - {loan.full_name} (₱{parseFloat(loan.loan_amount).toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '5px' }}>Repayment Schedule Overview</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Detailed breakdown of scheduled repayments</p>
        {repayments.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No repayment schedules available for display.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Schedule ID</th>
                  <th>Loan ID</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Amount Due</th>
                  <th>Outstanding Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {repayments.map((repayment) => (
                  <tr key={repayment.schedule_id}>
                    <td>{repayment.schedule_id}</td>
                    <td>{repayment.loan_id}</td>
                    <td>{repayment.full_name}</td>
                    <td>{new Date(repayment.due_date).toLocaleDateString()}</td>
                    <td>₱{parseFloat(repayment.amount_due).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>₱{parseFloat(repayment.outstanding_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 
                          repayment.status === 'Paid' ? '#d4edda' :
                          repayment.status === 'Late' ? '#f8d7da' : '#fff3cd',
                        color: 
                          repayment.status === 'Paid' ? '#155724' :
                          repayment.status === 'Late' ? '#721c24' : '#856404'
                      }}>
                        {repayment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Repayments

