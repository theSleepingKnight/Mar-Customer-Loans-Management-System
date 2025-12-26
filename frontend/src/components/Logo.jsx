// Logo component for Marfyang Customer and Loan Management System

function Logo({ size = 40, showText = true, textColor = 'white' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background gradient circle */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#3A6EA5', stopOpacity: 0.3}} />
            <stop offset="100%" style={{stopColor: '#0B1F3B', stopOpacity: 0.2}} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)"/>
        
        {/* Main icon - Modern Building/Finance symbol */}
        <rect x="30" y="35" width="40" height="50" rx="4" fill="#3A6EA5"/>
        <rect x="35" y="45" width="8" height="8" rx="1" fill="white" opacity="0.9"/>
        <rect x="48" y="45" width="8" height="8" rx="1" fill="white" opacity="0.9"/>
        <rect x="57" y="45" width="8" height="8" rx="1" fill="white" opacity="0.9"/>
        <rect x="35" y="58" width="8" height="8" rx="1" fill="white" opacity="0.9"/>
        <rect x="48" y="58" width="8" height="8" rx="1" fill="white" opacity="0.9"/>
        <rect x="57" y="58" width="8" height="8" rx="1" fill="white" opacity="0.9"/>
        
        {/* Currency symbol overlay with gradient */}
        <circle cx="50" cy="30" r="12" fill="#0B1F3B"/>
        <text x="50" y="36" fontSize="16" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="Arial, sans-serif">₱</text>
        
        {/* Decorative accent lines */}
        <line x1="20" y1="50" x2="30" y2="50" stroke="#3A6EA5" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
        <line x1="70" y1="50" x2="80" y2="50" stroke="#3A6EA5" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
      </svg>
      
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            color: textColor,
            lineHeight: '1.2'
          }}>
            Marfyang
          </span>
          <span style={{ 
            fontSize: '10px', 
            color: textColor === 'white' ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
            lineHeight: '1.2',
            marginTop: '2px'
          }}>
            Loan Management
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo

