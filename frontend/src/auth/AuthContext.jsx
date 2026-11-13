
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from '../services/authService'

// Create authentication context
const AuthContext = createContext(null)

// Authentication provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check whether an existing session is still valid
  useEffect(() => {
    let isMounted = true

    async function checkAuthentication() {
      const token = sessionStorage.getItem('agwaterds_token')

      if (!token) {
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      try {
        const response = await getCurrentUser()

        if (isMounted) {
          setUser(response?.user ?? null)
        }
      } catch (error) {
        console.error('Session validation failed:', error)

        sessionStorage.removeItem('agwaterds_token')

        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAuthentication()

    return () => {
      isMounted = false
    }
  }, [])

  // Login
  async function login(credentials) {
    const response = await loginUser(credentials)

    const loggedInUser = response?.user

    if (!loggedInUser) {
      sessionStorage.removeItem('agwaterds_token')
      throw new Error('Login response did not contain user details.')
    }

    setUser(loggedInUser)

    return loggedInUser
  }

  // Register
  async function register(userDetails) {
    return registerUser(userDetails)
  }

  // Logout
  async function logout() {
    try {
      await logoutUser()
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for accessing authentication
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider.'
    )
  }

  return context
}
