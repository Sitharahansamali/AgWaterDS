import { useState } from 'react'
import { NIGERIA_ADMIN_UNITS, INDICATOR_DEFINITIONS } from '../data/administrativeUnits'

export default function DataRequest() {
  // Form State
  const [country] = useState('Nigeria')
  const [adminUnit, setAdminUnit] = useState('')
  const [selectedIndicators, setSelectedIndicators] = useState([])
  const [waterBalanceMetrics, setWaterBalanceMetrics] = useState(['water_supply', 'water_demand', 'water_deficit'])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [outputFormat, setOutputFormat] = useState('CSV')
  const [description, setDescription] = useState('')

  // Validation & Feedback State
  const [errors, setErrors] = useState({})
  const [validatedSummary, setValidatedSummary] = useState(null)

  // Toggle Indicator Selection
  const handleToggleIndicator = (indicatorId) => {
    setSelectedIndicators((prev) => {
      const exists = prev.includes(indicatorId)
      const updated = exists ? prev.filter((id) => id !== indicatorId) : [...prev, indicatorId]

      // Reset errors for indicator field if user selects one
      if (updated.length > 0 && errors.indicators) {
        setErrors((prevErr) => ({ ...prevErr, indicators: null }))
      }

      return updated
    })

    // Dismiss existing validation summary on form change
    if (validatedSummary) setValidatedSummary(null)
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

    if (validatedSummary) setValidatedSummary(null)
  }

  // Reset Form
  const handleReset = () => {
    setAdminUnit('')
    setSelectedIndicators([])
    setWaterBalanceMetrics(['water_supply', 'water_demand', 'water_deficit'])
    setStartDate('')
    setEndDate('')
    setOutputFormat('CSV')
    setDescription('')
    setErrors({})
    setValidatedSummary(null)
  }

  // Frontend Form Validation (No API calls or simulated backend responses)
  const validateForm = () => {
    const newErrors = {}

    // 1. Geographic Validation
    if (!adminUnit) {
      newErrors.adminUnit = 'Please select an administrative area or choose national scope.'
    }

    // 2. Indicator Validation
    if (selectedIndicators.length === 0) {
      newErrors.indicators = 'Select at least one agricultural water indicator.'
    }

    // If Water Balance is selected, at least one metric must be chosen
    if (selectedIndicators.includes('water_balance') && waterBalanceMetrics.length === 0) {
      newErrors.waterBalanceMetrics = 'Select at least one metric for Water Balance (Supply, Demand, or Deficit).'
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

  // Form Submission Handler
  const handleSubmit = (e) => {
    e.preventDefault()
    setValidatedSummary(null)

    const isValid = validateForm()
    if (!isValid) {
      // Scroll to top of form or first error
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Prepare human-readable summary of the validated inputs
    const adminUnitObj = NIGERIA_ADMIN_UNITS.find((u) => u.id === adminUnit)
    const adminLabel = adminUnit === 'ALL'
      ? 'All Administrative Units (National Scope - 37 Units)'
      : adminUnitObj
        ? `${adminUnitObj.name} (${adminUnitObj.id})`
        : adminUnit

    const indicatorNames = selectedIndicators.map((id) => {
      const ind = INDICATOR_DEFINITIONS.find((d) => d.id === id)
      if (id === 'water_balance') {
        const metricsStr = waterBalanceMetrics
          .map((m) => m.replace('water_', '').toUpperCase())
          .join(', ')
        return `${ind ? ind.name : id} [${metricsStr}]`
      }
      return ind ? ind.name : id
    })

    setValidatedSummary({
      country,
      administrativeArea: adminLabel,
      indicators: indicatorNames,
      dateRange: `${startDate} to ${endDate}`,
      outputFormat,
      description: description.trim() || 'None provided',
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isWaterBalanceActive = selectedIndicators.includes('water_balance')

  return (
    <div className="data-request-form-container">
      {/* Page Header */}
      <div className="page-header-block">
        <h1 className="page-main-heading">Data Request</h1>
        <p className="page-sub-heading">
          Configure a structured agricultural water data request by specifying target geography,
          indicators, observation dates, and desired format.
        </p>
      </div>

      {/* Validation Error Summary Banner */}
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

      {/* Validated Request Summary Notice (No API dispatch in this stage) */}
      {validatedSummary && (
        <div className="submission-success-banner" role="status">
          <div className="success-banner-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Form Validation Passed
          </div>
          <p className="success-banner-body">
            All required data parameters have been validated on the client.
            <em> Note: In accordance with Stage 2 specifications, API transmission and backend data retrieval will be connected in subsequent stages.</em>
          </p>

          <table className="summary-details-table">
            <tbody>
              <tr>
                <td>Target Country</td>
                <td>{validatedSummary.country}</td>
              </tr>
              <tr>
                <td>Administrative Area</td>
                <td>{validatedSummary.administrativeArea}</td>
              </tr>
              <tr>
                <td>Selected Indicators</td>
                <td>{validatedSummary.indicators.join('; ')}</td>
              </tr>
              <tr>
                <td>Observation Date Range</td>
                <td>{validatedSummary.dateRange}</td>
              </tr>
              <tr>
                <td>Selected Format</td>
                <td><strong>{validatedSummary.outputFormat}</strong></td>
              </tr>
              <tr>
                <td>Request Description</td>
                <td>{validatedSummary.description}</td>
              </tr>
            </tbody>
          </table>
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
                    if (validatedSummary) setValidatedSummary(null)
                  }}
                >
                  <option value="">-- Select an Administrative Area --</option>
                  <option value="ALL">All Administrative Units (National Scope &bull; 37 Divisions)</option>
                  <optgroup label="Nigerian States & Federal Capital Territory (37 Units)">
                    {NIGERIA_ADMIN_UNITS.map((unit) => (
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
                    Choose an individual state or select all 37 administrative units.
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
                Select one or multiple agricultural water indicators to include in the data package.
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
                return (
                  <div
                    key={indicator.id}
                    className={`indicator-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleIndicator(indicator.id)}
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
                          aria-label={`Select ${indicator.name}`}
                        />
                        <span>{indicator.name}</span>
                      </label>
                      <span className="indicator-code-badge">{indicator.code}</span>
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
                    Select the specific components to retrieve for the water balance calculation:
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
                Specify the temporal observation period for the requested indicators.
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
                    if (validatedSummary) setValidatedSummary(null)
                  }}
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
                    if (validatedSummary) setValidatedSummary(null)
                  }}
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
                Select your preferred data delivery structure.
              </p>
            </div>

            <div className="output-format-grid">
              {[
                {
                  id: 'CSV',
                  label: 'CSV',
                  subtitle: 'Comma-Separated Values',
                  desc: 'Standard tabular format for spreadsheets, R, Python pandas, and statistical software.',
                },
                {
                  id: 'JSON',
                  label: 'JSON',
                  subtitle: 'JavaScript Object Notation',
                  desc: 'Lightweight structured format for API consumption, applications, and web services.',
                },
                {
                  id: 'GeoJSON',
                  label: 'GeoJSON',
                  subtitle: 'Geographic Data Format',
                  desc: 'Spatial format embedding administrative boundary polygons alongside indicator metrics for GIS analysis.',
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
                        onChange={() => {
                          setOutputFormat(format.id)
                          if (validatedSummary) setValidatedSummary(null)
                        }}
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
                Provide optional context or research objectives for record-keeping and audit logs.
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
                placeholder="e.g., Irrigation scheduling research, agricultural drought vulnerability assessment, or watershed water balance monitoring..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (validatedSummary) setValidatedSummary(null)
                }}
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
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Submit Data Request</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
