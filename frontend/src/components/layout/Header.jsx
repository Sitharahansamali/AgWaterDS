import { useLocation } from 'react-router-dom'

export default function Header({ onToggleMobileNav }) {
  const location = useLocation()

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Home'
      case '/data-request':
        return 'Data Request'
      case '/my-requests':
        return 'My Requests'
      case '/profile':
        return 'User Profile'
      default:
        return 'AgWaterDS'
    }
  }

  return (
    <header className="app-top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={onToggleMobileNav}
          aria-label="Open navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="page-title-heading">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="header-user-area">
        <div className="user-profile-badge">
          <div className="user-avatar-circle">DS</div>
          <div className="user-meta-text">
            <span className="user-name-label">Authorized Access</span>
            <span className="user-sub-label">Scientific Portal</span>
          </div>
        </div>
      </div>
    </header>
  )
}

