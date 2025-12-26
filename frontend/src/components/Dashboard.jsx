// Dashboard component - shows overview statistics
// This is like a control panel showing key information at a glance

import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeLoans: 0,
    totalOutstanding: 0,
    todayCollections: 0
  })
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState('daily')
  const [collectionsData, setCollectionsData] = useState({ total: 0 })
  const [loanPeriodData, setLoanPeriodData] = useState({ total_amount: 0 })
  const [outstandingData, setOutstandingData] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchCharts(chartPeriod)
  }, [chartPeriod])

  const fetchStats = async () => {
    try {
      // Fetch customers count
      const customersRes = await api.get('/customers')
      const totalCustomers = customersRes.data.length

      // Fetch active loans
      const loansRes = await api.get('/reports/active-loans')
      const activeLoans = loansRes.data.summary.total || 0

      // Fetch outstanding balance
      const outstandingRes = await api.get('/reports/outstanding-balance')
      const totalOutstanding = outstandingRes.data.reduce((sum, item) => sum + (item.total_outstanding || 0), 0)

      // Fetch today's collections
      const collectionsRes = await api.get('/reports/collections?period=daily')
      const todayCollections = collectionsRes.data.summary.total_amount || 0

      setStats({
        totalCustomers,
        activeLoans,
        totalOutstanding,
        todayCollections
      })
      setOutstandingData(totalOutstanding)
      setCollectionsData({ total: todayCollections })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCharts = async (period) => {
    try {
      const collectionsRes = await api.get(`/reports/collections?period=${period}`)
      const loansPeriodRes = await api.get(`/reports/loans-by-period?period=${period}`)
      const outstandingRes = await api.get('/reports/outstanding-balance')

      setCollectionsData({
        total: collectionsRes.data?.summary?.total_amount || 0
      })

      setLoanPeriodData({
        total_amount: loansPeriodRes.data?.summary?.total_amount || 0
      })

      const totalOutstanding = outstandingRes.data.reduce((sum, item) => sum + (item.total_outstanding || 0), 0)
      setOutstandingData(totalOutstanding)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  if (loading) {
    return <div className="spinner"></div>
  }

  const donutData = {
    labels: ['Collections (Selected Period)', 'Outstanding Balance'],
    datasets: [
      {
        data: [
          collectionsData.total || 0,
          outstandingData || 0
        ],
        backgroundColor: ['#3A6EA5', '#0B1F3B'],
        borderWidth: 0,
      },
    ],
  }

  const barData = {
    labels: [chartPeriod.charAt(0).toUpperCase() + chartPeriod.slice(1)],
    datasets: [
      {
        label: 'Collections',
        data: [collectionsData.total || 0],
        backgroundColor: '#3A6EA5',
      },
      {
        label: 'Loans Disbursed',
        data: [loanPeriodData.total_amount || 0],
        backgroundColor: '#0B1F3B',
      },
    ],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y || 0
            return `${context.dataset.label}: ₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `₱${Number(value).toLocaleString('en-US')}`
        }
      }
    }
  }

  return (
    <div>
      <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '15px' }}>
        Welcome back, <strong>{user.name}</strong>. Below is a comprehensive overview of your financial portfolio and operational metrics.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div className="card">
          <h3 style={{ color: '#64748b', marginBottom: '10px', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Client Base</h3>
          <h2 style={{ fontSize: '36px', color: '#0B1F3B', margin: 0, fontWeight: 600 }}>{stats.totalCustomers}</h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px', margin: 0 }}>Registered customers</p>
        </div>

        <div className="card">
          <h3 style={{ color: '#64748b', marginBottom: '10px', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Loan Portfolio</h3>
          <h2 style={{ fontSize: '36px', color: '#3A6EA5', margin: 0, fontWeight: 600 }}>{stats.activeLoans}</h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px', margin: 0 }}>Current loans in progress</p>
        </div>

        <div className="card">
          <h3 style={{ color: '#64748b', marginBottom: '10px', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outstanding Balance</h3>
          <h2 style={{ fontSize: '36px', color: '#dc3545', margin: 0, fontWeight: 600 }}>
            ₱{stats.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px', margin: 0 }}>Total amount due</p>
        </div>

        <div className="card">
          <h3 style={{ color: '#64748b', marginBottom: '10px', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Collections</h3>
          <h2 style={{ fontSize: '36px', color: '#3A6EA5', margin: 0, fontWeight: 600 }}>
            ₱{stats.todayCollections.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px', margin: 0 }}>Today's receipts</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2 style={{ color: '#0B1F3B', marginBottom: '10px', fontSize: '18px', fontWeight: 600 }}>Quick Actions</h2>
        <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Access frequently used functions and operations</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
          <a href="/customers" className="btn btn-primary">Register New Customer</a>
          <a href="/loans" className="btn btn-primary">Process New Loan</a>
          <a href="/payments" className="btn btn-success">Record Payment Transaction</a>
          <a href="/reports" className="btn btn-secondary">Generate Reports</a>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ color: '#0B1F3B', marginBottom: '6px', fontSize: '18px', fontWeight: 600 }}>Collections vs Loans (Bar)</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Compare collected amounts against loan disbursements</p>
          </div>
          <div>
            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2 style={{ color: '#0B1F3B', marginBottom: '6px', fontSize: '18px', fontWeight: 600 }}>Collections vs Outstanding (Donut)</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Visual distribution of collected funds versus outstanding balance</p>
        <div style={{ maxWidth: '380px', margin: '0 auto' }}>
          <Doughnut data={donutData} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

