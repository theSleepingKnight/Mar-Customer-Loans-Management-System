// Payments component - record and view payments

import { useState, useEffect } from 'react'
import api from '../utils/api'

function Payments({ user }) {
  const [payments, setPayments] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    loan_id: '',
    customer_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount_paid: '',
    payment_method: 'Cash',
    reference_number: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPayments()
    fetchLoans()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments')
      setPayments(response.data)
    } catch (error) {
      setError('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans')
      setLoans(response.data.filter(l => l.loan_status === 'Active'))
    } catch (error) {
      console.error('Failed to fetch loans')
    }
  }

  const handleLoanChange = (loanId) => {
    const selectedLoan = loans.find(l => l.loan_id === parseInt(loanId))
    if (selectedLoan) {
      setFormData({
        ...formData,
        loan_id: loanId,
        customer_id: selectedLoan.customer_id
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const submitData = {
        ...formData,
        loan_id: parseInt(formData.loan_id),
        customer_id: parseInt(formData.customer_id),
        amount_paid: parseFloat(formData.amount_paid)
      }

      await api.post('/payments', submitData)
      setSuccess('Payment transaction has been successfully recorded and processed.')
      resetForm()
      fetchPayments()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to record payment')
    }
  }

  const resetForm = () => {
    setFormData({
      loan_id: '',
      customer_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      amount_paid: '',
      payment_method: 'Cash',
      reference_number: ''
    })
    setShowForm(false)
  }

  const canCreate = user.role === 'Admin' || user.role === 'Cashier'

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '5px' }}>Payment Transaction Management</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Record and track payment transactions</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel Transaction' : 'Record Payment Transaction'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '5px' }}>Payment Transaction Form</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Enter payment details to process transaction</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Loan *</label>
                <select
                  value={formData.loan_id}
                  onChange={(e) => handleLoanChange(e.target.value)}
                  required
                >
                  <option value="">Select Loan</option>
                  {loans.map(loan => (
                    <option key={loan.loan_id} value={loan.loan_id}>
                      Loan #{loan.loan_id} - {loan.full_name} (₱{parseFloat(loan.loan_amount).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount Paid *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference Number</label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                Process Transaction
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '5px' }}>Payment Transaction History</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Complete record of all payment transactions</p>
        {payments.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No payment transactions recorded. Begin by recording your first payment.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Loan ID</th>
                  <th>Customer</th>
                  <th>Payment Date</th>
                  <th>Amount Paid</th>
                  <th>Payment Method</th>
                  <th>Reference Number</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>{payment.payment_id}</td>
                    <td>{payment.loan_id}</td>
                    <td>{payment.full_name}</td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>₱{parseFloat(payment.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{payment.payment_method}</td>
                    <td>{payment.reference_number || '-'}</td>
                    <td>{payment.recorded_by_name}</td>
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

export default Payments

