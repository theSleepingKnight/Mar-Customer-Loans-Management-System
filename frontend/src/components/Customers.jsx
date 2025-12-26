// Customers component - manage customer data
// This page lets you add, view, edit, and delete customers

import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

function Customers({ user }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    address: '',
    id_type: '',
    id_number: '',
    date_registered: new Date().toISOString().split('T')[0],
    status: 'Active'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers')
      setCustomers(response.data)
    } catch (error) {
      setError('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingCustomer) {
        // Update existing customer
        await api.put(`/customers/${editingCustomer.customer_id}`, formData)
        setSuccess('Customer information has been successfully updated.')
      } else {
        // Create new customer
        await api.post('/customers', formData)
        setSuccess('Customer has been successfully registered in the system.')
      }
      
      resetForm()
      fetchCustomers()
    } catch (error) {
      setError(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      full_name: customer.full_name,
      contact_number: customer.contact_number,
      address: customer.address,
      id_type: customer.id_type,
      id_number: customer.id_number,
      date_registered: customer.date_registered,
      status: customer.status
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      await api.delete(`/customers/${id}`)
      setSuccess('Customer record has been successfully removed from the system.')
      fetchCustomers()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete customer')
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      contact_number: '',
      address: '',
      id_type: '',
      id_number: '',
      date_registered: new Date().toISOString().split('T')[0],
      status: 'Active'
    })
    setEditingCustomer(null)
    setShowForm(false)
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/customers/export/excel', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setSuccess('Customer data exported successfully!')
    } catch (error) {
      setError('Failed to export customer data')
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

      const response = await api.post('/customers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSuccess(`${response.data.message} ${response.data.errors > 0 ? `(${response.data.errors} errors - check console)` : ''}`)
      if (response.data.errorDetails && response.data.errorDetails.length > 0) {
        console.error('Import errors:', response.data.errorDetails)
      }
      
      // Refresh the customer list
      fetchCustomers()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to import customer data')
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
          <h1 style={{ margin: 0, marginBottom: '5px' }}>Customer Management</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Manage client information and records</p>
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
                {showForm ? 'Cancel Registration' : 'Register New Customer'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '5px' }}>{editingCustomer ? 'Modify Customer Information' : 'Customer Registration Form'}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Please provide complete and accurate information</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>ID Type *</label>
                <select
                  value={formData.id_type}
                  onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                  required
                >
                  <option value="">Select ID Type</option>
                  <option value="National ID">National ID</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="Passport">Passport</option>
                  <option value="SSS ID">SSS ID</option>
                  <option value="TIN ID">TIN ID</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date Registered *</label>
                <input
                  type="date"
                  value={formData.date_registered}
                  onChange={(e) => setFormData({ ...formData, date_registered: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingCustomer ? 'Save Changes' : 'Submit Registration'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '5px' }}>Customer Directory</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Complete listing of registered clients</p>
        {customers.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No customer records found. Begin by registering your first client.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Contact Number</th>
                  <th>Address</th>
                  <th>ID Type</th>
                  <th>ID Number</th>
                  <th>Date Registered</th>
                  <th>Status</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>{customer.customer_id}</td>
                    <td>{customer.full_name}</td>
                    <td>{customer.contact_number}</td>
                    <td>{customer.address}</td>
                    <td>{customer.id_type}</td>
                    <td>{customer.id_number}</td>
                    <td>{new Date(customer.date_registered).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: customer.status === 'Active' ? '#d4edda' : '#f8d7da',
                        color: customer.status === 'Active' ? '#155724' : '#721c24'
                      }}>
                        {customer.status}
                      </span>
                    </td>
                    {(canEdit || canDelete) && (
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {canEdit && (
                            <button onClick={() => handleEdit(customer)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(customer.customer_id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
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

export default Customers

