import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import DataRequest from './pages/DataRequest'
import MyRequests from './pages/MyRequests'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/data-request" element={<DataRequest />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
