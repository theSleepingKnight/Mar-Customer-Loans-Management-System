// Reports component - view various reports

import { useState, useEffect } from 'react'
import api from '../utils/api'

function Reports({ user }) {
  const [activeTab, setActiveTab] = useState('active-loans')
  const [activeLoans, setActiveLoans] = useState(null)
  const [outstanding, setOutstanding] = useState([])
  const [collections, setCollections] = useState(null)
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('daily')

  useEffect(() => {
    if (activeTab === 'active-loans') {
      fetchActiveLoans()
    } else if (activeTab === 'outstanding') {
      fetchOutstanding()
    } else if (activeTab === 'collections') {
      fetchCollections()
    } else if (activeTab === 'overdue') {
      fetchOverdue()
    }
  }, [activeTab, period])

  const fetchActiveLoans = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reports/active-loans')
      setActiveLoans(response.data)
    } catch (error) {
      console.error('Failed to fetch active loans')
    } finally {
      setLoading(false)
    }
  }

  const fetchOutstanding = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reports/outstanding-balance')
      setOutstanding(response.data)
    } catch (error) {
      console.error('Failed to fetch outstanding balance')
    } finally {
      setLoading(false)
    }
  }

  const fetchCollections = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/reports/collections?period=${period}`)
      setCollections(response.data)
    } catch (error) {
      console.error('Failed to fetch collections')
    } finally {
      setLoading(false)
    }
  }

  const fetchOverdue = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reports/overdue')
      setOverdue(response.data)
    } catch (error) {
      console.error('Failed to fetch overdue loans')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'active-loans', label: 'Active Loan Portfolio' },
    { id: 'outstanding', label: 'Outstanding Balances' },
    { id: 'collections', label: 'Collection Reports' },
    { id: 'overdue', label: 'Delinquent Accounts' }
  ]

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, marginBottom: '5px' }}>Financial Reports & Analytics</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Comprehensive financial reports and performance metrics</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              color: activeTab === tab.id ? '#007bff' : '#666'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {activeTab === 'active-loans' && (
            <div className="card">
              <h2 style={{ marginBottom: '5px' }}>Active Loan Portfolio Report</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Summary of all active loan accounts</p>
              {activeLoans && (
                <>
                  <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
                    <p><strong>Total Active Loans:</strong> {activeLoans.summary.total}</p>
                    <p><strong>Total Loan Amount:</strong> ₱{parseFloat(activeLoans.summary.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  {activeLoans.loans.length === 0 ? (
                    <p>No active loans found.</p>
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
                          </tr>
                        </thead>
                        <tbody>
                          {activeLoans.loans.map(loan => (
                            <tr key={loan.loan_id}>
                              <td>{loan.loan_id}</td>
                              <td>{loan.full_name}</td>
                              <td>₱{parseFloat(loan.loan_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td>{loan.interest_rate}%</td>
                              <td>{loan.loan_term}</td>
                              <td>{new Date(loan.start_date).toLocaleDateString()}</td>
                              <td>{new Date(loan.end_date).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'outstanding' && (
            <div className="card">
              <h2 style={{ marginBottom: '5px' }}>Outstanding Balance Report</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Customer-wise outstanding balance summary</p>
              {outstanding.length === 0 ? (
                <p>No outstanding balances found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Customer ID</th>
                        <th>Customer Name</th>
                        <th>Contact Number</th>
                        <th>Active Loans</th>
                        <th>Total Outstanding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outstanding.map(item => (
                        <tr key={item.customer_id}>
                          <td>{item.customer_id}</td>
                          <td>{item.full_name}</td>
                          <td>{item.contact_number}</td>
                          <td>{item.active_loans}</td>
                          <td>₱{parseFloat(item.total_outstanding).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: '5px' }}>Collection Performance Report</h2>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Payment collection analysis and statistics</p>
                </div>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="form-group" style={{ width: 'auto' }}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {collections && (
                <>
                  <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
                    <p><strong>Total Payments:</strong> {collections.summary.total_payments}</p>
                    <p><strong>Total Amount Collected:</strong> ₱{parseFloat(collections.summary.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p><strong>Unique Customers:</strong> {collections.summary.unique_customers}</p>
                  </div>
                  {collections.collections.length === 0 ? (
                    <p>No collections found for this period.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Payment Date</th>
                            <th>Payment Count</th>
                            <th>Total Collected</th>
                            <th>Payment Method</th>
                            <th>Unique Customers</th>
                          </tr>
                        </thead>
                        <tbody>
                          {collections.collections.map((item, index) => (
                            <tr key={index}>
                              <td>{new Date(item.payment_date).toLocaleDateString()}</td>
                              <td>{item.payment_count}</td>
                              <td>₱{parseFloat(item.total_collected).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td>{item.payment_method}</td>
                              <td>{item.unique_customers}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'overdue' && (
            <div className="card">
              <h2 style={{ marginBottom: '5px' }}>Delinquent Accounts Report</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Accounts with overdue payments requiring attention</p>
              {overdue.length === 0 ? (
                <p>No overdue loans found.</p>
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
                        <th>Days Overdue</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdue.map(item => (
                        <tr key={item.schedule_id}>
                          <td>{item.schedule_id}</td>
                          <td>{item.loan_id}</td>
                          <td>{item.full_name}</td>
                          <td>{new Date(item.due_date).toLocaleDateString()}</td>
                          <td>₱{parseFloat(item.amount_due).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>₱{parseFloat(item.outstanding_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>{Math.floor(item.days_overdue || 0)} days</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#f8d7da',
                              color: '#721c24'
                            }}>
                              {item.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports

