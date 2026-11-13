import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import '../../styles/auth.css'

function getDisplayText(value, fallback) {
  let scalar = value

  while (Array.isArray(scalar)) {
    if (scalar.length !== 1) {
      return fallback
    }
    scalar = scalar[0]
  }

  const text = typeof scalar === 'string'
    ? scalar.trim()
    : typeof scalar === 'number' && Number.isFinite(scalar)
      ? String(scalar)
      : ''

  return text || fallback
}

export default function Header({ onToggleMobileNav }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const accountRef = useRef(null)

  useEffect(() => {
    function closeMenu(event) {
      if (!accountRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [])

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

  const displayName = getDisplayText(user?.full_name, 'Authorized Access')
  const displayRole = getDisplayText(user?.role, 'Researcher')
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || 'DS'

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
        <div className="auth-account" ref={accountRef}>
          <button type="button" className="auth-account-trigger" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-haspopup="menu">
            <div className="user-avatar-circle">{initials}</div>
            <div className="user-meta-text">
              <span className="user-name-label">{displayName}</span>
              <span className="user-sub-label">{displayRole}</span>
            </div>
            <span aria-hidden="true">⌄</span>
          </button>
          {menuOpen && (
            <div className="auth-account-menu" role="menu">
              <div className="auth-account-menu-header">
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </div>
              <Link to="/profile" role="menuitem" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button type="button" role="menuitem" onClick={async () => {
                setLogoutError('')
                try {
                  await logout()
                } catch (error) {
                  setLogoutError(error.message || 'Logout could not be confirmed.')
                } finally {
                  setMenuOpen(false)
                  navigate('/login', { replace: true })
                }
              }}>Sign out</button>
              {logoutError && <span className="auth-hint" role="alert">{logoutError}</span>}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

