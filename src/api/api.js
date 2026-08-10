const BASE_URL = 'http://localhost';

// Helper to handle cookie credentials & headers automatically
async function apiFetch(endpoint, options = {}) {
  const config = {
    ...options,
    credentials: 'include', // Crucial: sends & receives Sanctum session cookies
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  // Return json if there's content, otherwise null (e.g. 204 responses)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}

// 1. Fetch CSRF Cookie
export const getCsrfCookie = () => apiFetch('/sanctum/csrf-cookie');

// 2. HTTP Helper Methods
export const api = {
  get: (url) => apiFetch(url, { method: 'GET' }),
  post: (url, body) => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }),
};

export default api;