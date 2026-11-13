
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  // Wait until the existing session is checked
  if (loading) {
    return <div>Checking authentication...</div>
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Allow authenticated users to access protected pages
  return <Outlet />
}
