// Loans component - manage loan data

import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

function Loans({ user }) {
  const [loans, setLoans] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_amount: '',
    interest_rate: '',
    loan_term: 'Monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    loan_status: 'Pending'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchLoans()
    fetchCustomers()
  }, [])

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans')
      setLoans(response.data)
    } catch (error) {
      setError('Failed to fetch loans')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers')
      setCustomers(response.data.filter(c => c.status === 'Active'))
    } catch (error) {
      console.error('Failed to fetch customers')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const submitData = {
        ...formData,
        loan_amount: parseFloat(formData.loan_amount),
        interest_rate: parseFloat(formData.interest_rate)
      }

      if (editingLoan) {
        await api.put(`/loans/${editingLoan.loan_id}`, submitData)
        setSuccess('Loan updated successfully!')
      } else {
        await api.post('/loans', submitData)
        setSuccess('Loan created successfully!')
      }
      
      resetForm()
      fetchLoans()
    } catch (error) {
      setError(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleEdit = (loan) => {
    setEditingLoan(loan)
    setFormData({
      customer_id: loan.customer_id,
      loan_amount: loan.loan_amount,
      interest_rate: loan.interest_rate,
      loan_term: loan.loan_term,
      start_date: loan.start_date,
      end_date: loan.end_date,
      loan_status: loan.loan_status
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) {
      return
    }

    try {
      await api.delete(`/loans/${id}`)
      setSuccess('Loan deleted successfully!')
      fetchLoans()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete loan')
    }
  }

  const resetForm = () => {
    setFormData({
      customer_id: '',
      loan_amount: '',
      interest_rate: '',
      loan_term: 'Monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      loan_status: 'Pending'
    })
    setEditingLoan(null)
    setShowForm(false)
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/loans/export/excel', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `loans_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setSuccess('Loan data exported successfully!')
    } catch (error) {
      setError('Failed to export loan data')
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImporting(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/loans/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSuccess(`${response.data.message} ${response.data.errors > 0 ? `(${response.data.errors} errors - check console)` : ''}`)
      if (response.data.errorDetails && response.data.errorDetails.length > 0) {
        console.error('Import errors:', response.data.errorDetails)
      }
      
      // Refresh the loan list
      fetchLoans()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to import loan data')
    } finally {
      setImporting(false)
    }
  }

  const canCreate = user.role === 'Admin' || user.role === 'Loan Officer'
  const canEdit = user.role === 'Admin' || user.role === 'Loan Officer'
  const canDelete = user.role === 'Admin'

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '5px' }}>Loan Portfolio Management</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Process and manage loan applications</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleExport} className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            📥 Export Data
          </button>
          {canCreate && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn btn-secondary"
                disabled={importing}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                {importing ? '⏳ Importing...' : '📤 Import Existing Data'}
              </button>
              <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                {showForm ? 'Cancel Processing' : 'Process New Loan'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '5px' }}>{editingLoan ? 'Modify Loan Details' : 'Loan Application Form'}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Enter complete loan information for processing</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Customer *</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  required
                  disabled={!!editingLoan}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.full_name} - {customer.contact_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Loan Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.loan_amount}
                  onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Loan Term *</label>
                <select
                  value={formData.loan_term}
                  onChange={(e) => setFormData({ ...formData, loan_term: e.target.value })}
                  required
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Loan Status *</label>
                <select
                  value={formData.loan_status}
                  onChange={(e) => setFormData({ ...formData, loan_status: e.target.value })}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingLoan ? 'Save Modifications' : 'Submit Application'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '5px' }}>Loan Portfolio</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Comprehensive listing of all loan accounts</p>
        {loans.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No loan records found. Begin by processing your first loan application.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Customer</th>
                  <th>Loan Amount</th>
                  <th>Interest Rate</th>
                  <th>Term</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.loan_id}>
                    <td>{loan.loan_id}</td>
                    <td>{loan.full_name}</td>
                    <td>₱{parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{loan.interest_rate}%</td>
                    <td>{loan.loan_term}</td>
                    <td>{new Date(loan.start_date).toLocaleDateString()}</td>
                    <td>{new Date(loan.end_date).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 
                          loan.loan_status === 'Active' ? '#d4edda' :
                          loan.loan_status === 'Pending' ? '#fff3cd' :
                          loan.loan_status === 'Approved' ? '#cfe2ff' : '#f8d7da',
                        color: 
                          loan.loan_status === 'Active' ? '#155724' :
                          loan.loan_status === 'Pending' ? '#856404' :
                          loan.loan_status === 'Approved' ? '#084298' : '#721c24'
                      }}>
                        {loan.loan_status}
                      </span>
                    </td>
                    {(canEdit || canDelete) && (
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {canEdit && (
                            <button onClick={() => handleEdit(loan)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(loan.loan_id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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

export default Loans

