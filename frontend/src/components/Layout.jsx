// Layout component - wraps all pages with sidebar navigation
// This is like the frame around a picture

import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { 
  DashboardIcon, 
  CustomersIcon, 
  LoansIcon, 
  RepaymentsIcon, 
  PaymentsIcon, 
  ReportsIcon, 
  UsersIcon,
  LogoutIcon 
} from './Icons'

function Layout({ user, onLogout, children }) {
  const location = useLocation()

  // Determine which navigation items to show based on user role
  const getNavItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
      { path: '/customers', label: 'Customers', Icon: CustomersIcon },
      { path: '/loans', label: 'Loans', Icon: LoansIcon },
      { path: '/repayments', label: 'Repayments', Icon: RepaymentsIcon },
      { path: '/payments', label: 'Payments', Icon: PaymentsIcon },
      { path: '/reports', label: 'Reports', Icon: ReportsIcon }
    ]

    // Only Admin can see Users
    if (user.role === 'Admin') {
      items.splice(5, 0, { path: '/users', label: 'Users', Icon: UsersIcon })
    }

    return items
  }

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Logo size={45} showText={true} />
        </div>
        
        <div className="sidebar-user">
          <div className="sidebar-user-info">Welcome, {user.name}</div>
          <div className="sidebar-user-role">{user.role}</div>
        </div>

        <nav>
          <ul className="sidebar-nav">
            {getNavItems().map((item) => {
              const Icon = item.Icon
              const isActive = location.pathname === item.path
              return (
                <li key={item.path} className="sidebar-nav-item">
                  <Link 
                    to={item.path}
                    className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="sidebar-nav-link-icon">
                      <Icon size={20} color={isActive ? '#3A6EA5' : 'rgba(255,255,255,0.7)'} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="sidebar-logout">
          <button onClick={onLogout} className="sidebar-logout-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogoutIcon size={18} color="currentColor" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="top-bar">
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#0B1F3B' }}>
            {getNavItems().find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>
        </div>
        
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
