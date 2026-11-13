
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSubmitting(true)

    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>AgWaterDS</h1>
        <p style={styles.subtitle}>
          Sign in to access the Agricultural Water Data System
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
            style={styles.input}
            autoComplete="username"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            style={styles.input}
            autoComplete="current-password"
          />

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={styles.button}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f6f4',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '36px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  title: {
    color: '#176b45',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748b',
    marginBottom: '30px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    marginTop: '18px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '15px',
  },
  button: {
    width: '100%',
    padding: '13px',
    marginTop: '25px',
    border: 'none',
    borderRadius: '6px',
    background: '#176b45',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '12px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '25px',
    color: '#64748b',
  },
}
