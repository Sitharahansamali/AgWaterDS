import { useState } from 'react'
import { downloadCSV } from '../../services/dataService'

export default function EvapotranspirationResults({
  records,
  requestParams,
  onReset,
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const totalRecords = records?.length || 0
  const totalPages = Math.ceil(totalRecords / pageSize) || 1

  const startIndex = (currentPage - 1) * pageSize
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize)

  // Detect whether data_source is synthetic_demo
  const isSynthetic = records.some((r) => r.data_source === 'synthetic_demo')

  // CSV download handler
  const handleDownloadCSV = () => {
    const adminPart = requestParams.adminId ? requestParams.adminId.toLowerCase() : 'all'
    const startPart = requestParams.startDate || 'start'
    const endPart = requestParams.endDate || 'end'
    const filename = `agwaterds_evapotranspiration_${adminPart}_${startPart}_to_${endPart}.csv`

    downloadCSV(records, filename)
  }

  return (
    <div className="results-container">
      {/* Summary Card */}
      <div className="results-summary-card">
        <div className="results-title-row">
          <div>
            <div className="results-badge-group">
              <span className="status-tag-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Query Completed
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Returned <strong>{totalRecords}</strong> {totalRecords === 1 ? 'record' : 'records'} from backend
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-teal)', marginTop: '0.5rem' }}>
              Evapotranspiration Data Delivery
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onReset}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
              </svg>
              <span>Modify Request</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownloadCSV}
              disabled={totalRecords === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="results-meta-grid">
          <div className="results-meta-item">
            <span className="results-meta-label">Indicator</span>
            <span className="results-meta-value">Evapotranspiration (ET)</span>
          </div>

          <div className="results-meta-item">
            <span className="results-meta-label">Administrative Area</span>
            <span className="results-meta-value">
              {requestParams.adminName || requestParams.adminId || 'All Units (National Scope)'}
            </span>
          </div>

          <div className="results-meta-item">
            <span className="results-meta-label">Observation Period</span>
            <span className="results-meta-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              {requestParams.startDate} &rarr; {requestParams.endDate}
            </span>
          </div>

          <div className="results-meta-item">
            <span className="results-meta-label">Total Observations</span>
            <span className="results-meta-value">{totalRecords} Records</span>
          </div>
        </div>
      </div>

      {/* Clear Indication for Synthetic Test Data */}
      {isSynthetic && (
        <div className="synthetic-callout-banner" role="note">
          <span className="synthetic-callout-tag">synthetic_demo</span>
          <div>
            <strong>Notice on Data Source:</strong> The returned records originate from{' '}
            <code>synthetic_demo</code>. These observations are calibrated synthetic development records
            served by the R Plumber backend for API verification and are not validated environmental measurements.
          </div>
        </div>
      )}

      {/* Results Table Card */}
      <div className="results-table-card">
        <div className="results-table-header-bar">
          <h3 className="results-table-title">Delivered Observations</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            Showing {totalRecords === 0 ? 0 : startIndex + 1} &ndash;{' '}
            {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} records
          </span>
        </div>

        {totalRecords === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 0.75rem auto', color: 'var(--color-border)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ fontWeight: 600, color: 'var(--color-primary-teal)', marginBottom: '0.35rem' }}>
              No Observations Found
            </p>
            <p style={{ fontSize: '0.88rem' }}>
              The database returned 0 records matching the administrative unit and observation period.
            </p>
          </div>
        ) : (
          <div className="results-table-wrapper">
            <table className="scientific-data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Observation Date</th>
                  <th>Admin ID</th>
                  <th>Mean ET</th>
                  <th>Unit</th>
                  <th>Data Source</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((row, idx) => (
                  <tr key={`${row.admin_id}-${row.observation_date}-${idx}`}>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                      {startIndex + idx + 1}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {row.observation_date}
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          backgroundColor: 'var(--color-light-mint)',
                          color: 'var(--color-primary-teal)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        {row.admin_id}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-secondary-water)' }}>
                      {typeof row.mean_et === 'number' ? row.mean_et.toFixed(3) : row.mean_et}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>
                      {row.unit}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: row.data_source === 'synthetic_demo' ? '#B45309' : 'var(--color-text-secondary)',
                          backgroundColor: row.data_source === 'synthetic_demo' ? '#FEF3C7' : 'transparent',
                          padding: row.data_source === 'synthetic_demo' ? '0.1rem 0.4rem' : '0',
                          borderRadius: '4px',
                        }}
                      >
                        {row.data_source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="table-pagination-footer">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                &larr; Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

