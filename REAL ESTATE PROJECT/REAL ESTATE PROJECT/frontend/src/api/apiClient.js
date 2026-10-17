// Base API client with JWT token injection and error handling

const API_BASE_URL = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  // Prevent double prefixing /api
  let cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
  if (cleanEndpoint === '/api') cleanEndpoint = '';
  if (!cleanEndpoint.startsWith('/')) cleanEndpoint = '/' + cleanEndpoint;

  try {
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);
    
    // Handle empty responses (like 204 or void returns)
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      let errorMessage = data?.message || `Request failed with status ${response.status}`;
      if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        const fieldErrors = Object.entries(data.data)
          .map(([k, v]) => `${v}`)
          .filter(Boolean);
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('; ');
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      error.message = error.message || 'Network error or backend is not reachable.';
    }
    throw error;
  }
}

export default request;
