
import { Routes, Route, Navigate } from 'react-router-dom'

import AppLayout from './components/layout/AppLayout'

import Home from './pages/Home'
import DataRequest from './pages/DataRequest'
import MyRequests from './pages/MyRequests'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

import ProtectedRoute from './auth/ProtectedRoute'
import { useAuth } from './auth/AuthContext'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>

      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : <Register />
        }
      />

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/data-request" element={<DataRequest />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}
