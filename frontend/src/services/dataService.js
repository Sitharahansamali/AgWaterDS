/**
 * AgWaterDS Data Service
 * Encapsulates backend API communication for administrative units and water indicators.
 */

import { apiRequest } from './api'

/**
 * Retrieves the list of administrative units from the backend database.
 * Endpoint: GET /api/admin-units
 *
 * @returns {Promise<Array<{admin_id: string, admin_name: string, country_name: string, area_sqkm: number, center_lat: number, center_lon: number}>>}
 */
export async function fetchAdminUnits() {
  const data = await apiRequest('/api/admin-units')
  if (!Array.isArray(data)) {
    throw new Error('Unexpected format received for administrative units.')
  }
  return data
}

/**
 * Retrieves evapotranspiration observations from the backend.
 * Endpoint: GET /api/evapotranspiration
 *
 * @param {object} params
 * @param {string} [params.admin_id] - Administrative unit identifier (e.g. 'NG001')
 * @param {string} params.start_date - Observation start date (YYYY-MM-DD)
 * @param {string} params.end_date - Observation end date (YYYY-MM-DD)
 * @returns {Promise<Array<{admin_id: string, observation_date: string, mean_et: number, unit: string, data_source: string}>>}
 */
export async function fetchEvapotranspiration({ admin_id, start_date, end_date }) {
  const queryParams = new URLSearchParams()

  // Include admin_id if specified and not set to national scope
  if (admin_id && admin_id !== 'ALL' && admin_id.trim()) {
    queryParams.append('admin_id', admin_id.trim())
  }

  if (start_date) {
    queryParams.append('start_date', start_date)
  }

  if (end_date) {
    queryParams.append('end_date', end_date)
  }

  const endpoint = `/api/evapotranspiration?${queryParams.toString()}`
  const data = await apiRequest(endpoint)

  if (!Array.isArray(data)) {
    throw new Error('Server returned an invalid data structure for evapotranspiration.')
  }

  return data
}

/**
 * Retrieves soil moisture observations from the backend.
 * Endpoint: GET /api/soil-moisture
 *
 * @param {object} params
 * @param {string} [params.admin_id] - Administrative unit identifier (e.g. 'NG001')
 * @param {string} params.start_date - Observation start date (YYYY-MM-DD)
 * @param {string} params.end_date - Observation end date (YYYY-MM-DD)
 * @returns {Promise<Array<{admin_id: string, observation_date: string, mean_soil_moisture: number, unit: string, data_source: string}>>}
 */
export async function fetchSoilMoisture({ admin_id, start_date, end_date }) {
  const queryParams = new URLSearchParams()

  if (admin_id && admin_id !== 'ALL' && admin_id.trim()) {
    queryParams.append('admin_id', admin_id.trim())
  }

  if (start_date) {
    queryParams.append('start_date', start_date)
  }

  if (end_date) {
    queryParams.append('end_date', end_date)
  }

  const endpoint = `/api/soil-moisture?${queryParams.toString()}`
  const data = await apiRequest(endpoint)

  if (!Array.isArray(data)) {
    throw new Error('Server returned an invalid data structure for soil moisture.')
  }

  return data
}

/**
 * Client-side CSV generator and file download trigger using actual returned records.
 * Dynamically resolves columns based on response fields (e.g. mean_soil_moisture vs mean_et).
 *
 * @param {Array<object>} records - Array of records returned from backend
 * @param {string} filename - Target filename for download
 * @param {Array<string>} [customHeaders] - Optional explicit header array
 */
export function downloadCSV(records, filename = 'agwaterds_export.csv', customHeaders = null) {
  if (!records || records.length === 0) {
    throw new Error('No data available to download.')
  }

  // Determine headers based on records structure
  let headers = customHeaders
  if (!headers || headers.length === 0) {
    if (records[0].mean_soil_moisture !== undefined) {
      headers = ['admin_id', 'observation_date', 'mean_soil_moisture', 'unit', 'data_source']
    } else if (records[0].mean_et !== undefined) {
      headers = ['admin_id', 'observation_date', 'mean_et', 'unit', 'data_source']
    } else {
      headers = Object.keys(records[0])
    }
  }

  // Format header row
  const csvLines = [headers.join(',')]

  // Format data rows with proper CSV escaping (RFC 4180)
  for (const row of records) {
    const rowValues = headers.map((key) => {
      const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : ''
      // Escape quotes and wrap in quotes if contains comma, quote or newline
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    csvLines.push(rowValues.join(','))
  }

  const csvContent = csvLines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const downloadAnchor = document.createElement('a')
  downloadAnchor.href = url
  downloadAnchor.setAttribute('download', filename)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  document.body.removeChild(downloadAnchor)

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
