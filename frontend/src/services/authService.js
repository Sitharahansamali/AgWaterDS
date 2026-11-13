
import { apiRequest } from './api'

// Register a new user
export async function registerUser({ full_name, email, password }) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ full_name, email, password }),
  })
}

// Log in an existing user
export async function loginUser({ email, password }) {
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const token = response?.session?.token

  if (!token) {
    throw new Error('Login response did not contain a session token.')
  }

  sessionStorage.setItem('agwaterds_token', token)

  return response
}

// Get the currently authenticated user
export async function getCurrentUser() {
  return apiRequest('/api/auth/me')
}

// Log out the current user
export async function logoutUser() {
  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
    })
  } finally {
    sessionStorage.removeItem('agwaterds_token')
  }
}
