import axios from 'axios';

// Determine base URL from environment (injected at build time)
const RAW_BASE = process.env.REACT_APP_API_URL || '';
// Trim and remove trailing slashes
const normalized = RAW_BASE.replace(/\/$/, '').trim();

// Final base (fallback left empty so relative requests can still work in dev proxy if configured)
// Fallback to same-origin when no env provided (avoids leaking localhost in prod builds)
export const API_BASE_URL = normalized || window.location.origin;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

// Warn if running on a non-local origin but still pointing to localhost API
if (typeof window !== 'undefined') {
  try {
    const host = window.location.hostname;
    const onProdLikeOrigin = host && host !== 'localhost' && host !== '127.0.0.1';
    if (onProdLikeOrigin && API_BASE_URL.includes('localhost')) {
      console.warn('[apiClient] WARNING: Deployed on', host, 'but API_BASE_URL is localhost. Set REACT_APP_API_URL to your backend URL before building.');
    }
  } catch (_) {}
}

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