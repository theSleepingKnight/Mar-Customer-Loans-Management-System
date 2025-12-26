// Users component - manage system users (Admin only)

import { useState, useEffect } from 'react'
import api from '../utils/api'

function Users({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Loan Officer',
    status: 'Active'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.user_id}`, formData)
        setSuccess('User updated successfully!')
      } else {
        if (!formData.password) {
          setError('Password is required for new users')
          return
        }
        await api.post('/users', formData)
        setSuccess('User created successfully!')
      }
      
      resetForm()
      fetchUsers()
    } catch (error) {
      setError(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleEdit = (userData) => {
    setEditingUser(userData)
    setFormData({
      name: userData.name,
      username: userData.username,
      password: '', // Don't pre-fill password
      role: userData.role,
      status: userData.status
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await api.delete(`/users/${id}`)
      setSuccess('User deleted successfully!')
      fetchUsers()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete user')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'Loan Officer',
      status: 'Active'
    })
    setEditingUser(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '5px' }}>System User Administration</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Manage system access and user accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel Registration' : 'Create New User Account'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '5px' }}>{editingUser ? 'Modify User Account' : 'User Account Registration'}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Configure user access credentials and permissions</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password {!editingUser && '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder={editingUser ? "Leave blank to keep current password" : ""}
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Loan Officer">Loan Officer</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Save Account Modifications' : 'Create User Account'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '5px' }}>Registered User Accounts</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Complete directory of system users</p>
        {users.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No user accounts registered. Begin by creating your first user account.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.user_id}>
                    <td>{userItem.user_id}</td>
                    <td>{userItem.name}</td>
                    <td>{userItem.username}</td>
                    <td>{userItem.role}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: userItem.status === 'Active' ? '#d4edda' : '#f8d7da',
                        color: userItem.status === 'Active' ? '#155724' : '#721c24'
                      }}>
                        {userItem.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleEdit(userItem)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(userItem.user_id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          Delete
                        </button>
                      </div>
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

export default Users

