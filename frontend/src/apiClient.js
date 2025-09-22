import axios from 'axios';

// Determine base URL from environment (injected at build time)
const RAW_BASE = process.env.REACT_APP_API_URL || '';
// Trim and remove trailing slashes
const normalized = RAW_BASE.replace(/\/$/, '').trim();

// Final base (fallback left empty so relative requests can still work in dev proxy if configured)
export const API_BASE_URL = normalized || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

// Attach Authorization token automatically if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional response logging (only in development build)
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error('[apiClient]', err?.response?.status, err?.response?.data || err.message);
      return Promise.reject(err);
    }
  );
}

export default apiClient;
