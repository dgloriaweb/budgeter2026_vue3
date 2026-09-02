// Automatically selects URL based on environment:
// - On localhost dev, use same-origin requests (Vite proxy avoids CORS)
// - Otherwise, use VITE_API_BASE_URL (prod) with a safe fallback
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const BASE_URL = isLocalhost
  ? ''
  : import.meta.env.VITE_API_BASE_URL || 'https://dgloriaapi.co.uk'

const AUTH_TOKEN_STORAGE_KEY = 'budgeter2026_auth_token'

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function hasAuthToken() {
  return Boolean(getAuthToken())
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return
  if (!token) return
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

// Helper to extract cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift())
  return null
}

// Helper to handle cookie credentials & headers automatically
async function apiFetch(endpoint, options = {}) {
  // Extract CSRF token set by Laravel in client cookies
  const xsrfToken = getCookie('XSRF-TOKEN')
  const bearerToken = getAuthToken()

  const hasBody = options.body !== undefined && options.body !== null

  const config = {
    ...options,
    credentials: options.credentials ?? 'omit',
    headers: {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken }), // Pass CSRF token back to Laravel
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...options.headers,
    },
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    if (response.status === 401 && bearerToken) clearAuthToken()
    const errorData = await response.json().catch(() => ({}))
    let message = errorData.message || `Request failed with status ${response.status}`
    const errors = errorData?.errors
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0]
      const firstValue = errors[firstKey]
      const firstError =
        Array.isArray(firstValue) ? firstValue[0] : firstValue ? String(firstValue) : ''
      if (firstError) message = `${message}: ${firstError}`
    }

    const error = new Error(message)
    error.data = errorData
    throw error
  }

  // Return json if there's content, otherwise null (e.g. 204 responses)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  return null
}

// 1. Fetch CSRF Cookie
export const getCsrfCookie = () => apiFetch('/sanctum/csrf-cookie')

// 2. HTTP Helper Methods
export const api = {
  get: (url) => apiFetch(url, { method: 'GET' }),
  post: (url, body) => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }),
}

export default api
