import { downloadCSV } from '../../services/dataService'
import IndicatorMap from '../../maps/IndicatorMap'

const STATUS_LABELS = {
  processing: 'Processing',
  completed: 'Completed',
  no_data: 'No data available',
  failed: 'Failed',
}

const FIELD_LABELS = {
  admin_id: 'Admin ID',
  observation_date: 'Observation Date',
  mean_et: 'Mean ET',
  mean_soil_moisture: 'Mean Soil Moisture',
  water_supply: 'Water Supply',
  water_demand: 'Water Demand',
  water_deficit: 'Water Deficit',
  unit: 'Unit',
  data_source: 'Data Source',
}

const METRIC_LABELS = {
  water_supply: 'Water Supply',
  water_demand: 'Water Demand',
  water_deficit: 'Water Deficit',
}

function formatValue(value) {
  return typeof value === 'number' ? value.toFixed(3) : value ?? ''
}

export default function IndicatorResults({
  indicator,
  result,
  requestParams,
  metricIds = [],
  mapResults = {},
  mapLoading = false,
  mapDate,
}) {
  const records = result?.records || []
  const isWaterBalance = indicator.id === 'water_balance'
  const columns = records.length > 0
    ? Object.keys(records[0]).filter((field) => (
        !metricIds.length
        || !['water_supply', 'water_demand', 'water_deficit'].includes(field)
        || metricIds.includes(field)
      ))
    : []
  const mapsToDisplay = isWaterBalance
    ? metricIds.map((metric) => ({
        key: metric,
        name: METRIC_LABELS[metric] || metric,
        result: mapResults[metric],
      }))
    : [{ key: indicator.id, name: indicator.name, result: mapResults[indicator.id] }]
  const adminPart = requestParams.adminId ? requestParams.adminId.toLowerCase() : 'all'

  const handleDownload = () => {
    downloadCSV(
      records,
      `agwaterds_${indicator.id.replaceAll('_', '-')}_${adminPart}_${requestParams.startDate}_to_${requestParams.endDate}.csv`,
      columns
    )
  }

  return (
    <section className="results-container" aria-labelledby={`${indicator.id}-results-heading`}>
      <div className="results-summary-card">
        <div className="results-title-row">
          <div>
            <div className="results-badge-group">
              <span className={result?.status === 'failed' ? 'status-tag-error' : 'status-tag-success'}>
                {STATUS_LABELS[result?.status] || 'Pending'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Returned <strong>{records.length}</strong> {records.length === 1 ? 'record' : 'records'}
              </span>
            </div>
            <h2 id={`${indicator.id}-results-heading`} style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-teal)', marginTop: '0.5rem' }}>
              {indicator.name} Data Delivery
            </h2>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={records.length === 0}>
            Download CSV
          </button>
        </div>

        <div className="results-meta-grid">
          <div className="results-meta-item"><span className="results-meta-label">Indicator</span><span className="results-meta-value">{indicator.name}</span></div>
          <div className="results-meta-item"><span className="results-meta-label">Administrative Area</span><span className="results-meta-value">{requestParams.adminName}</span></div>
          <div className="results-meta-item"><span className="results-meta-label">Observation Period</span><span className="results-meta-value">{requestParams.startDate} &rarr; {requestParams.endDate}</span></div>
          <div className="results-meta-item"><span className="results-meta-label">Total Observations</span><span className="results-meta-value">{records.length} Records</span></div>
        </div>
      </div>

      {result?.error && <div className="validation-error-summary-banner" role="alert">{result.error}</div>}

      <div className="results-table-card">
        <div className="results-table-header-bar">
          <h3 className="results-table-title">Geographic Distribution</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Map observation date: {mapDate}</span>
        </div>
        {mapsToDisplay.map(({ key, name, result: mapResult }) => (
          <div key={key} style={{ padding: '1rem' }}>
            {isWaterBalance && <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary-teal)' }}>{name}</h3>}
            {mapLoading ? (
              <div className="indicator-map-message" role="status">Loading map data...</div>
            ) : mapResult?.status === 'completed' ? (
              <IndicatorMap geojson={mapResult.data} indicatorName={name} />
            ) : (
              <div className="indicator-map-message" role="status">
                {mapResult?.error ? `Map unavailable: ${mapResult.error}` : 'Map data is not available for this selection.'}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="results-table-card">
        <div className="results-table-header-bar">
          <h3 className="results-table-title">Returned Records</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Units and source are returned by the backend</span>
        </div>
        {records.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontWeight: 600, color: 'var(--color-primary-teal)' }}>{result?.status === 'failed' ? 'Request failed' : 'No records found'}</p>
            <p style={{ fontSize: '0.88rem' }}>{result?.status === 'failed' ? result.error : 'The database returned no records for this selection.'}</p>
          </div>
        ) : (
          <div className="results-table-wrapper">
            <table className="scientific-data-table">
              <thead><tr>{columns.map((field) => <th key={field}>{FIELD_LABELS[field] || field}</th>)}</tr></thead>
              <tbody>{records.map((record, index) => (
                <tr key={`${record.admin_id || indicator.id}-${record.observation_date || index}-${index}`}>
                  {columns.map((field) => <td key={field}>{formatValue(record[field])}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
