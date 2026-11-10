import { Link } from 'react-router-dom'

export default function Profile() {
  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary-teal)', marginBottom: '0.5rem' }}>
        User Profile &amp; Access Details
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        The user profile and access configuration area will be connected once backend authentication
        and institutional role services are deployed.
      </p>
      <div>
        <Link to="/" className="btn btn-secondary">
          &larr; Return to Home
        </Link>
      </div>
    </div>
  )
}

