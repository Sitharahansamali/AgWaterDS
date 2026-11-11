import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleToggleMobileNav = () => {
    setMobileNavOpen((prev) => !prev)
  }

  const handleCloseMobileNav = () => {
    setMobileNavOpen(false)
  }

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileNavOpen ? 'active' : ''}`}
        onClick={handleCloseMobileNav}
        aria-hidden="true"
      />

      {/* Left Sidebar */}
      <Sidebar
        isOpen={mobileNavOpen}
        onClose={handleCloseMobileNav}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <Header onToggleMobileNav={handleToggleMobileNav} />
        <main className="main-content-view">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
