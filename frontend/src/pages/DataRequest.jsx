import { useState, useEffect } from 'react'
import { NIGERIA_ADMIN_UNITS, INDICATOR_DEFINITIONS } from '../data/administrativeUnits'
import { fetchAdminUnits, fetchEvapotranspiration, fetchSoilMoisture } from '../services/dataService'
import EvapotranspirationResults from '../components/results/EvapotranspirationResults'
import SoilMoistureResults from '../components/results/SoilMoistureResults'

// Currently integrated indicators in Stages 3 & 4
const INTEGRATED_INDICATOR_IDS = ['evapotranspiration', 'soil_moisture']

export default function DataRequest() {
  // Administrative Units State (loaded from backend or fallback)
  const [adminUnitsList, setAdminUnitsList] = useState(NIGERIA_ADMIN_UNITS)

  // Form State
  const [country] = useState('Nigeria')
  const [adminUnit, setAdminUnit] = useState('')
  const [selectedIndicators, setSelectedIndicators] = useState(['soil_moisture'])
  const [waterBalanceMetrics, setWaterBalanceMetrics] = useState(['water_supply', 'water_demand', 'water_deficit'])
  const [startDate, setStartDate] = useState('2025-05-01')
  const [endDate, setEndDate] = useState('2025-08-01')
  const [outputFormat, setOutputFormat] = useState('CSV')
  const [description, setDescription] = useState('')

  // Processing & Results State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiErrorMessage, setApiErrorMessage] = useState(null)
  const [results, setResults] = useState(null)
  const [activeResultTab, setActiveResultTab] = useState('soil_moisture')
  const [requestMetadata, setRequestMetadata] = useState(null)

  // Fetch actual administrative units from backend on mount
  useEffect(() => {
    let isMounted = true

    async function loadAdminUnits() {
      try {
        const units = await fetchAdminUnits()
        if (isMounted && Array.isArray(units) && units.length > 0) {
          // Normalize backend administrative units structure
          const formatted = units.map((u) => ({
            id: u.admin_id,
            name: u.admin_name,
            country: u.country_name || 'Nigeria',
            code: u.country_code || 'NGA',
          }))
          setAdminUnitsList(formatted)
        }
      } catch {
        // If backend is offline or loading, keep the canonical 37 Nigerian units
      }
    }

    loadAdminUnits()

    return () => {
      isMounted = false
    }
  }, [])

  // Analyze selected indicators against integrated ones
  const selectedIntegrated = selectedIndicators.filter((id) => INTEGRATED_INDICATOR_IDS.includes(id))
  const nonIntegratedSelected = selectedIndicators.filter((id) => !INTEGRATED_INDICATOR_IDS.includes(id))
  const hasIntegrated = selectedIntegrated.length > 0
  const hasNonIntegrated = nonIntegratedSelected.length > 0
  const isWaterBalanceActive = selectedIndicators.includes('water_balance')

  // Toggle Indicator Selection
  const handleToggleIndicator = (indicatorId) => {
    setSelectedIndicators((prev) => {
      const exists = prev.includes(indicatorId)
      const updated = exists ? prev.filter((id) => id !== indicatorId) : [...prev, indicatorId]

      if (updated.length > 0 && errors.indicators) {
        setErrors((prevErr) => ({ ...prevErr, indicators: null }))
      }

      return updated
    })

    if (apiErrorMessage) setApiErrorMessage(null)
  }

  // Toggle Water Balance Metric
  const handleToggleWaterBalanceMetric = (metricId) => {
    setWaterBalanceMetrics((prev) => {
      const exists = prev.includes(metricId)
      const updated = exists ? prev.filter((m) => m !== metricId) : [...prev, metricId]

      if (updated.length > 0 && errors.waterBalanceMetrics) {
        setErrors((prevErr) => ({ ...prevErr, waterBalanceMetrics: null }))
      }

      return updated
    })
  }

  // Reset Form
  const handleReset = () => {
    setAdminUnit('')
    setSelectedIndicators(['soil_moisture'])
    setWaterBalanceMetrics(['water_supply', 'water_demand', 'water_deficit'])
    setStartDate('2025-05-01')
    setEndDate('2025-08-01')
    setOutputFormat('CSV')
    setDescription('')
    setErrors({})
    setApiErrorMessage(null)
    setResults(null)
    setRequestMetadata(null)
    setActiveResultTab('soil_moisture')
  }

  // Frontend Form Validation
  const validateForm = () => {
    const newErrors = {}

    // 1. Geographic Validation
    if (!adminUnit) {
      newErrors.adminUnit = 'Please select an administrative area or choose national scope.'
    }

    // 2. Indicator Validation
    if (selectedIndicators.length === 0) {
      newErrors.indicators = 'Select at least one agricultural water indicator.'
    } else if (!hasIntegrated) {
      newErrors.indicators =
        'Live backend data retrieval is currently supported for Evapotranspiration and Soil Moisture. Please select Evapotranspiration and/or Soil Moisture to submit.'
    }

    // 3. Date Validation
    if (!startDate) {
      newErrors.startDate = 'Start date is required.'
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required.'
    }
    if (startDate && endDate && endDate < startDate) {
      newErrors.dateRange = 'End date cannot be earlier than the start date.'
    }

    // 4. Output Format
    if (!outputFormat) {
      newErrors.outputFormat = 'Please choose a data output format.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form Submission Handler calling live backend APIs
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiErrorMessage(null)

    // Prevent duplicate submissions
    if (isSubmitting) return

    const isValid = validateForm()
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    // Identify selected administrative unit name
    const unitObj = adminUnitsList.find((u) => u.id === adminUnit)
    const adminLabel = adminUnit === 'ALL'
      ? 'All Administrative Units (National Scope)'
      : unitObj
        ? `${unitObj.name} (${unitObj.id})`
        : adminUnit

    try {
      const promises = {}

      if (selectedIndicators.includes('evapotranspiration')) {
        promises.evapotranspiration = fetchEvapotranspiration({
          admin_id: adminUnit,
          start_date: startDate,
          end_date: endDate,
        })
      }

      if (selectedIndicators.includes('soil_moisture')) {
        promises.soil_moisture = fetchSoilMoisture({
          admin_id: adminUnit,
          start_date: startDate,
          end_date: endDate,
        })
      }

      // Execute queries in parallel
      const keys = Object.keys(promises)
      const dataArray = await Promise.all(Object.values(promises))
      const combinedResults = {}
      keys.forEach((key, index) => {
        combinedResults[key] = dataArray[index]
      })

      // Store responses and metadata in state
      setResults(combinedResults)
      setRequestMetadata({
        adminId: adminUnit === 'ALL' ? '' : adminUnit,
        adminName: adminLabel,
        startDate,
        endDate,
        outputFormat,
        description: description.trim(),
      })

      // Set active tab to first available indicator
      if (combinedResults.soil_moisture) {
        setActiveResultTab('soil_moisture')
      } else if (combinedResults.evapotranspiration) {
        setActiveResultTab('evapotranspiration')
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setApiErrorMessage(err.message || 'An unexpected error occurred while contacting the server.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If results have been successfully received, display the results view
  if (results !== null && requestMetadata !== null) {
    const hasETResult = Boolean(results.evapotranspiration)
    const hasSMResult = Boolean(results.soil_moisture)
    const showTabs = hasETResult && hasSMResult

    return (
      <div className="data-request-form-container">
        <div className="page-header-block">
          <h1 className="page-main-heading">Data Delivery Results</h1>
          <p className="page-sub-heading">
            Review the delivered observation datasets from the R Plumber API and export to CSV.
          </p>
        </div>

        {/* Tab navigation when multiple indicators were retrieved */}
        {showTabs && (
          <div className="results-tabs-nav" role="tablist" aria-label="Delivered Datasets">
            <button
              type="button"
              className={`results-tab-pill ${activeResultTab === 'soil_moisture' ? 'active' : ''}`}
              onClick={() => setActiveResultTab('soil_moisture')}
              role="tab"
              aria-selected={activeResultTab === 'soil_moisture'}
            >
              <span>Soil Moisture</span>
              <span
                style={{
                  backgroundColor: 'var(--color-secondary-water)',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                {results.soil_moisture?.length || 0}
              </span>
            </button>

            <button
              type="button"
              className={`results-tab-pill ${activeResultTab === 'evapotranspiration' ? 'active' : ''}`}
              onClick={() => setActiveResultTab('evapotranspiration')}
              role="tab"
              aria-selected={activeResultTab === 'evapotranspiration'}
            >
              <span>Evapotranspiration</span>
              <span
                style={{
                  backgroundColor: 'var(--color-primary-teal)',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                {results.evapotranspiration?.length || 0}
              </span>
            </button>
          </div>
        )}

        {/* Render appropriate indicator results view */}
        {activeResultTab === 'soil_moisture' && hasSMResult && (
          <SoilMoistureResults
            records={results.soil_moisture}
            requestParams={requestMetadata}
            onReset={() => {
              setResults(null)
              setRequestMetadata(null)
            }}
          />
        )}

        {activeResultTab === 'evapotranspiration' && hasETResult && (
          <EvapotranspirationResults
            records={results.evapotranspiration}
            requestParams={requestMetadata}
            onReset={() => {
              setResults(null)
              setRequestMetadata(null)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="data-request-form-container">
      {/* Page Header */}
      <div className="page-header-block">
        <h1 className="page-main-heading">Data Request</h1>
        <p className="page-sub-heading">
          Configure a structured agricultural water data request. Connected to the live
          <strong> Evapotranspiration API</strong> and <strong>Soil Moisture API</strong> (<code>GET /api/soil-moisture</code>).
        </p>
      </div>

      {/* Backend / Network Error Banner */}
      {apiErrorMessage && (
        <div className="validation-error-summary-banner" role="alert">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong style={{ fontSize: '0.95rem' }}>Backend API Communication Notice:</strong>
            <p style={{ marginTop: '0.25rem', fontSize: '0.86rem', lineHeight: 1.45 }}>
              {apiErrorMessage}
            </p>
            <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#7F1D1D' }}>
              Ensure that the R Plumber backend service is running locally on <code>http://127.0.0.1:8000</code>.
            </p>
          </div>
        </div>
      )}

      {/* Form Validation Errors Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="validation-error-summary-banner" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Form validation requirements:</strong>
            <ul>
              {errors.adminUnit && <li>{errors.adminUnit}</li>}
              {errors.indicators && <li>{errors.indicators}</li>}
              {errors.waterBalanceMetrics && <li>{errors.waterBalanceMetrics}</li>}
              {errors.startDate && <li>{errors.startDate}</li>}
              {errors.endDate && <li>{errors.endDate}</li>}
              {errors.dateRange && <li>{errors.dateRange}</li>}
              {errors.outputFormat && <li>{errors.outputFormat}</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Clear Informational Notice for Non-Integrated Indicators */}
      {hasNonIntegrated && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            color: '#1E40AF',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
          role="status"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Indicator Integration Status:</strong>
            <p style={{ marginTop: '0.2rem' }}>
              You have selected indicators (
              <em>
                {nonIntegratedSelected
                  .map((id) => INDICATOR_DEFINITIONS.find((d) => d.id === id)?.name || id)
                  .join(', ')}
              </em>
              ) that are scheduled for subsequent stages. Currently,{' '}
              <strong>Evapotranspiration</strong> and <strong>Soil Moisture</strong> are connected to the live backend API.
              {hasIntegrated
                ? ' Submitting this form will query and retrieve live records for the integrated indicators only.'
                : ' Please select Evapotranspiration and/or Soil Moisture to execute a live data request.'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* =================================================================
              Section 1: Geographic Selection
             ================================================================= */}
          <section className="form-section-card">
            <div className="form-section-card-header">
              <span className="form-section-number-tag">Section 1</span>
              <h2 className="form-section-title">Geographic Selection</h2>
              <p className="form-section-instruction">
                Specify the country and administrative division for data extraction.
              </p>
            </div>

            <div className="form-fields-grid-2">
              {/* Country Selection */}
              <div className="form-field-group">
                <label htmlFor="country-select" className="form-field-label">
                  Country
                  <span className="required-star">*</span>
                </label>
                <select
                  id="country-select"
                  className="form-field-select"
                  value={country}
                  disabled
                >
                  <option value="Nigeria">Nigeria (Federal Republic of Nigeria)</option>
                </select>
                <span className="form-field-hint">
                  Active database coverage is currently configured for Nigeria (37 administrative units).
                </span>
              </div>

              {/* Administrative Area Selection */}
              <div className="form-field-group">
                <label htmlFor="admin-unit-select" className="form-field-label">
                  Administrative Area
                  <span className="required-star">*</span>
                </label>
                <select
                  id="admin-unit-select"
                  className={`form-field-select ${errors.adminUnit ? 'has-error' : ''}`}
                  value={adminUnit}
                  onChange={(e) => {
                    setAdminUnit(e.target.value)
                    if (errors.adminUnit) {
                      setErrors((prev) => ({ ...prev, adminUnit: null }))
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">-- Select an Administrative Area --</option>
                  <option value="ALL">All Administrative Units (National Scope &bull; 37 Divisions)</option>
                  <optgroup label="Nigerian States & Federal Capital Territory (37 Units)">
                    {adminUnitsList.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.id})
                      </option>
                    ))}
                  </optgroup>
                </select>
                {errors.adminUnit ? (
                  <span className="form-field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.adminUnit}
                  </span>
                ) : (
                  <span className="form-field-hint">
                    Select an administrative unit ID to query the backend database.
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* =================================================================
              Section 2: Indicator Selection
             ================================================================= */}
          <section className="form-section-card">
            <div className="form-section-card-header">
              <span className="form-section-number-tag">Section 2</span>
              <h2 className="form-section-title">Indicator Selection</h2>
              <p className="form-section-instruction">
                Select one or multiple agricultural water indicators. Evapotranspiration and Soil Moisture are integrated with live backend delivery.
              </p>
            </div>

            {errors.indicators && (
              <div className="form-field-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.indicators}
              </div>
            )}

            {/* Indicator Selectable Cards */}
            <div className="indicator-cards-grid">
              {INDICATOR_DEFINITIONS.map((indicator) => {
                const isSelected = selectedIndicators.includes(indicator.id)
                const isIntegrated = INTEGRATED_INDICATOR_IDS.includes(indicator.id)

                return (
                  <div
                    key={indicator.id}
                    className={`indicator-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => !isSubmitting && handleToggleIndicator(indicator.id)}
                    style={{
                      borderLeft: isIntegrated ? '4px solid var(--color-secondary-water)' : undefined,
                    }}
                  >
                    <div className="indicator-card-top-row">
                      <label
                        className="indicator-card-checkbox-label"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleIndicator(indicator.id)}
                          disabled={isSubmitting}
                          aria-label={`Select ${indicator.name}`}
                        />
                        <span>{indicator.name}</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {isIntegrated ? (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              backgroundColor: 'var(--color-light-mint)',
                              color: 'var(--color-secondary-water)',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '3px',
                              textTransform: 'uppercase',
                            }}
                          >
                            Live API
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              backgroundColor: 'var(--color-bg-page)',
                              color: 'var(--color-text-secondary)',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '3px',
                            }}
                          >
                            Next Stage
                          </span>
                        )}
                        <span className="indicator-code-badge">{indicator.code}</span>
                      </div>
                    </div>

                    <p className="indicator-card-desc">{indicator.description}</p>
                    <div className="indicator-card-unit">Unit: {indicator.unit}</div>
                  </div>
                )
              })}
            </div>

            {/* Conditional Sub-Selection for Water Balance */}
            {isWaterBalanceActive && (
              <div className="water-balance-metrics-panel" aria-live="polite">
                <div className="metrics-panel-header">
                  <h3 className="metrics-panel-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    Water Balance Metric Options
                  </h3>
                  <p className="metrics-panel-subtitle">
                    Select the specific components to retrieve for the water balance calculation (scheduled for integration):
                  </p>
                </div>

                {errors.waterBalanceMetrics && (
                  <div className="form-field-error" style={{ marginBottom: '0.75rem', fontSize: '0.82rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.waterBalanceMetrics}
                  </div>
                )}

                <div className="metric-options-row">
                  {[
                    { id: 'water_supply', label: 'Water Supply', desc: 'Inflow & precipitation' },
                    { id: 'water_demand', label: 'Water Demand', desc: 'Agricultural crop requirement' },
                    { id: 'water_deficit', label: 'Water Deficit', desc: 'Net moisture deficit' },
                  ].map((metric) => {
                    const isMetricSelected = waterBalanceMetrics.includes(metric.id)
                    return (
                      <label
                        key={metric.id}
                        className={`metric-choice-pill ${isMetricSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={isMetricSelected}
                          onChange={() => handleToggleWaterBalanceMetric(metric.id)}
                          disabled={isSubmitting}
                        />
                        <span>
                          <strong>{metric.label}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.35rem' }}>
                            ({metric.desc})
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          {/* =================================================================
              Section 3: Date Selection
             ================================================================= */}
          <section className="form-section-card">
            <div className="form-section-card-header">
              <span className="form-section-number-tag">Section 3</span>
              <h2 className="form-section-title">Date Selection</h2>
              <p className="form-section-instruction">
                Specify the temporal observation period for data retrieval.
              </p>
            </div>

            <div className="form-fields-grid-2">
              {/* Start Date */}
              <div className="form-field-group">
                <label htmlFor="start-date-input" className="form-field-label">
                  Start Date
                  <span className="required-star">*</span>
                </label>
                <input
                  id="start-date-input"
                  type="date"
                  className={`form-field-input ${errors.startDate || errors.dateRange ? 'has-error' : ''}`}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (errors.startDate || errors.dateRange) {
                      setErrors((prev) => ({ ...prev, startDate: null, dateRange: null }))
                    }
                  }}
                  disabled={isSubmitting}
                />
                {errors.startDate && (
                  <span className="form-field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.startDate}
                  </span>
                )}
                <span className="form-field-hint">Format: YYYY-MM-DD</span>
              </div>

              {/* End Date */}
              <div className="form-field-group">
                <label htmlFor="end-date-input" className="form-field-label">
                  End Date
                  <span className="required-star">*</span>
                </label>
                <input
                  id="end-date-input"
                  type="date"
                  className={`form-field-input ${errors.endDate || errors.dateRange ? 'has-error' : ''}`}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    if (errors.endDate || errors.dateRange) {
                      setErrors((prev) => ({ ...prev, endDate: null, dateRange: null }))
                    }
                  }}
                  disabled={isSubmitting}
                />
                {errors.endDate && (
                  <span className="form-field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.endDate}
                  </span>
                )}
                {errors.dateRange && (
                  <span className="form-field-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.dateRange}
                  </span>
                )}
                <span className="form-field-hint">End date cannot be earlier than start date.</span>
              </div>
            </div>
          </section>

          {/* =================================================================
              Section 4: Output Format
             ================================================================= */}
          <section className="form-section-card">
            <div className="form-section-card-header">
              <span className="form-section-number-tag">Section 4</span>
              <h2 className="form-section-title">Output Format</h2>
              <p className="form-section-instruction">
                Select your preferred data delivery structure (CSV download enabled).
              </p>
            </div>

            <div className="output-format-grid">
              {[
                {
                  id: 'CSV',
                  label: 'CSV',
                  subtitle: 'Comma-Separated Values',
                  desc: 'Standard tabular format for spreadsheets, R, and statistical software (Direct download enabled).',
                },
                {
                  id: 'JSON',
                  label: 'JSON',
                  subtitle: 'JavaScript Object Notation',
                  desc: 'Structured format returned natively by the Plumber REST API endpoint.',
                },
                {
                  id: 'GeoJSON',
                  label: 'GeoJSON',
                  subtitle: 'Geographic Data Format',
                  desc: 'Spatial format embedding administrative boundary polygons (Scheduled for spatial map integration).',
                },
              ].map((format) => {
                const isFormatSelected = outputFormat === format.id
                return (
                  <label
                    key={format.id}
                    className={`format-choice-card ${isFormatSelected ? 'selected' : ''}`}
                  >
                    <div className="format-card-top">
                      <input
                        type="radio"
                        name="outputFormat"
                        value={format.id}
                        className="custom-radio"
                        checked={isFormatSelected}
                        onChange={() => setOutputFormat(format.id)}
                        disabled={isSubmitting}
                      />
                      <div>
                        <div className="format-label-title">{format.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          {format.subtitle}
                        </div>
                      </div>
                    </div>
                    <p className="format-card-desc">{format.desc}</p>
                  </label>
                )
              })}
            </div>
          </section>

          {/* =================================================================
              Section 5: Additional Information
             ================================================================= */}
          <section className="form-section-card">
            <div className="form-section-card-header">
              <span className="form-section-number-tag">Section 5</span>
              <h2 className="form-section-title">Additional Information</h2>
              <p className="form-section-instruction">
                Provide optional context or research objectives for record-keeping.
              </p>
            </div>

            <div className="form-field-group">
              <label htmlFor="request-description" className="form-field-label">
                Request Description &amp; Purpose
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                  (Optional)
                </span>
              </label>
              <textarea
                id="request-description"
                rows="3"
                className="form-field-textarea"
                placeholder="e.g., Root-zone soil moisture analysis, agricultural drought vulnerability assessment, or irrigation scheduling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
              <span className="form-field-hint">
                Briefly describe the research purpose or operational project reference.
              </span>
            </div>
          </section>

          {/* =================================================================
              Section 6: Form Actions
             ================================================================= */}
          <div className="form-actions-toolbar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '220px' }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  <span>Querying Backend API...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Submit Data Request</span>
                </>
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
