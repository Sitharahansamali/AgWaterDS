import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '../styles/auth.css'

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.6 5 8.6 5a16.6 16.6 0 0 1-3.1 3.5M6.2 6.2C3.7 7.9 2.4 10 2.4 10s3.4 5 9.6 5c.8 0 1.5-.1 2.2-.3" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2.4 12s3.4-5 9.6-5 9.6 5 9.6 5-3.4 5-9.6 5-9.6-5-9.6-5Z" /><circle cx="12" cy="12" r="2.5" /></svg>
  )
}

function PasswordField({ id, label, value, onChange, show, onToggle, autoComplete }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <input id={id} className="auth-input has-toggle" type={show ? 'text' : 'password'} value={value} onChange={onChange} required minLength={12} autoComplete={autoComplete} />
        <button className="auth-password-toggle" type="button" onClick={onToggle} aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={show}><EyeIcon hidden={show} /></button>
      </div>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      await register({ full_name: fullName.trim(), email: email.trim(), password })
      setSuccess('Your account has been created successfully. Redirecting to sign in...')
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
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
            <p className="auth-eyebrow">Join the research community</p>
            <h1>Turn water data into practical insight.</h1>
            <p>Create a secure workspace to explore agricultural water indicators and support resilient decision-making.</p>
          </div>
          <p className="auth-intro-note">Built for researchers, analysts and water professionals.</p>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <h2>Create your account</h2>
            <p>Set up your researcher access to AgWaterDS.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="register-name">Full name</label>
              <input id="register-name" className="auth-input" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="E.Sithara Hansamala" required maxLength={150} autoComplete="name" />
              <span className="auth-hint">Use letters, spaces, periods, apostrophes or hyphens.</span>
            </div>
            <div className="auth-field">
              <label htmlFor="register-email">Email address</label>
              <input id="register-email" className="auth-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.org" required autoComplete="email" />
            </div>
            <PasswordField id="register-password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="new-password" />
            <span className="auth-hint">Password must contain at least 12 characters.</span>
            <PasswordField id="register-confirm-password" label="Confirm password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} show={showConfirmPassword} onToggle={() => setShowConfirmPassword((visible) => !visible)} autoComplete="new-password" />

            {error && <p className="auth-message auth-message-error" role="alert">{error}</p>}
            {success && <p className="auth-message auth-message-success" role="status">{success}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting && <span className="spinner" aria-hidden="true" />}
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
        </section>
      </div>
    </main>
  )
}
