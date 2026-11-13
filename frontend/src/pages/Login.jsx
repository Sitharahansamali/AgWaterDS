import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '../styles/auth.css'

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.6 5 8.6 5a16.6 16.6 0 0 1-3.1 3.5M6.2 6.2C3.7 7.9 2.4 10 2.4 10s3.4 5 9.6 5c.8 0 1.5-.1 2.2-.3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2.4 12s3.4-5 9.6-5 9.6 5 9.6 5-3.4 5-9.6 5-9.6-5-9.6-5Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-intro">
          <div className="auth-brand"><span className="auth-brand-mark">≈</span> AgWaterDS</div>
          <div className="auth-intro-content">
            <p className="auth-eyebrow">Research intelligence for water</p>
            <h1>Understand water. Support better decisions.</h1>
            <p>Access trusted agricultural water indicators, spatial insights and data tools in one focused workspace.</p>
          </div>
          <p className="auth-intro-note">A research-oriented platform for evidence-based water management.</p>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your AgWaterDS workspace.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input id="login-email" className="auth-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.org" required autoComplete="username" />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <input id="login-password" className="auth-input has-toggle" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required autoComplete="current-password" />
                <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>
            </div>

            {error && <p className="auth-message auth-message-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting && <span className="spinner" aria-hidden="true" />}
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">New to AgWaterDS? <Link to="/register">Create an account</Link></p>
        </section>
      </div>
    </main>
  )
}
