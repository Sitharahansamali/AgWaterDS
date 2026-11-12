/**
 * AgWaterDS API Service Client
 * Centralized HTTP request handler for the R Plumber API backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Custom error class capturing HTTP status code and server error details
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Universal fetch wrapper with standard error and response handling
 *
 * @param {string} endpoint - API path, e.g. '/api/evapotranspiration'
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  // Construct absolute or relative URL based on configuration
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    'Accept': 'application/json',
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  let response
  try {
    response = await fetch(url, config)
  } catch (networkError) {
    throw new ApiError(
      `Unable to connect to the backend server at ${API_BASE_URL || 'http://127.0.0.1:8000'}. Please ensure the R Plumber API is running.`,
      0,
      { originalError: networkError.message }
    )
  }

  // Parse JSON response
  let responseData
  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json') || contentType.includes('application/geo+json')) {
      responseData = await response.json()
    } else {
      const text = await response.text()
      try {
        responseData = JSON.parse(text)
      } catch {
        responseData = text
      }
    }
  } catch {
    responseData = null
  }

  // Handle HTTP error statuses
  if (!response.ok) {
    let errorMessage = `Server error ${response.status} (${response.statusText})`

    if (responseData && typeof responseData === 'object' && responseData.message) {
      errorMessage = responseData.message
    } else if (response.status === 400) {
      errorMessage = 'Invalid query parameters provided. Please check the administrative area and date format.'
    } else if (response.status === 404) {
      errorMessage = 'Requested API endpoint was not found on the backend server.'
    } else if (response.status === 500) {
      errorMessage = responseData?.message || 'Unexpected server error occurred while retrieving data.'
    }

    throw new ApiError(errorMessage, response.status, responseData)
  }

  return responseData
}

export default {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'POST', body }),
}

