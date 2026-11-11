import { Link } from 'react-router-dom'

export default function MyRequests() {
  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary-teal)', marginBottom: '0.5rem' }}>
        My Requests
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        The request tracking and historical data delivery management view will be connected in subsequent stages.
        Users will be able to review previously submitted requests, monitor asynchronous processing status,
        and download completed data packages.
      </p>
      <div>
        <Link to="/" className="btn btn-secondary">
          &larr; Return to Home
        </Link>
      </div>
    </div>
  )
}
