
import { apiRequest } from './api'

function normalizeScalar(value) {
  let scalar = value

  while (Array.isArray(scalar)) {
    if (scalar.length !== 1) {
      return ''
    }
    scalar = scalar[0]
  }

  if (typeof scalar === 'string') {
    return scalar.trim()
  }

  if (typeof scalar === 'number' && Number.isFinite(scalar)) {
    return String(scalar)
  }

  return ''
}

// Normalize scalar fields that may be represented as one-element arrays by R JSON serialization.
export function normalizeUser(user) {
  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    throw new Error('Authentication response did not contain valid user details.')
  }

  const fullName = normalizeScalar(user.full_name)
  const role = normalizeScalar(user.role)

  if (!fullName || !role) {
    throw new Error('Authentication response contained invalid user details.')
  }

  return {
    ...user,
    full_name: fullName,
    role,
  }
}

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
