import { Link } from 'react-router-dom'

export default function Home() {
  const workflowSteps = [
    {
      step: 1,
      title: 'Select geographical area',
      description: 'Choose your region or administrative division to focus the water resource analysis.',
    },
    {
      step: 2,
      title: 'Choose agricultural water indicators',
      description: 'Select required parameters such as evapotranspiration, soil moisture, water balance, or crop water demand.',
    },
    {
      step: 3,
      title: 'Specify date range & output format',
      description: 'Define the temporal observation window and select preferred data format (JSON, CSV, or GeoJSON).',
    },
    {
      step: 4,
      title: 'Submit and retrieve the results',
      description: 'Send the structured request to the processing server, track delivery status, and download validated datasets.',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Card */}
      <section className="welcome-card" aria-labelledby="welcome-heading">
        <h2 id="welcome-heading" className="welcome-title">
          Welcome to AgWaterDS
        </h2>
        <p className="welcome-description">
          AgWaterDS is an institutional agricultural water data system designed to deliver secure,
          standardized datasets to researchers, water managers, and agricultural authorities.
          Submit targeted data requests for hydrological and crop-water indicators, monitor processing,
          and securely retrieve datasets formatted for scientific and operational analysis.
        </p>

        <div className="welcome-actions">
          <Link to="/data-request" className="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Create Data Request</span>
          </Link>

          <Link to="/my-requests" className="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>View My Requests</span>
          </Link>
        </div>
      </section>

      {/* Simple Request Workflow Section */}
      <section className="workflow-section" aria-labelledby="workflow-heading">
        <h3 id="workflow-heading" className="section-heading">
          Data Request Workflow
        </h3>
        <p className="section-intro">
          Follow the four-step workflow to generate and receive authorized agricultural water data packages:
        </p>

        <div className="workflow-steps-grid">
          {workflowSteps.map((item) => (
            <div key={item.step} className="workflow-step-item">
              <div className="step-number-badge">{item.step}</div>
              <h4 className="step-title">{item.title}</h4>
              <p className="step-details">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

