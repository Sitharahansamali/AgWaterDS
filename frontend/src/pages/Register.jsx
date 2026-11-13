
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 12) {
      setError('Password must contain at least 12 characters.')
      return
    }

    setSubmitting(true)

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      })

      setSuccess('Your account has been created successfully.')

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1200)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create an Account</h1>

        <p style={styles.subtitle}>
          Register to access the Agricultural Water Data System
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full name"
            required
            maxLength={150}
            autoComplete="name"
            style={styles.input}
          />

          <label style={styles.label}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
            autoComplete="email"
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 12 characters"
            required
            minLength={12}
            autoComplete="new-password"
            style={styles.input}
          />

          <label style={styles.label}>Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            style={styles.input}
          />

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}

          {success && (
            <p role="status" style={styles.success}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={styles.button}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
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
    maxWidth: '440px',
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
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginTop: '16px',
    marginBottom: '8px',
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
  success: {
    color: '#15803d',
    fontSize: '14px',
    marginTop: '12px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '25px',
    color: '#64748b',
  },
}
