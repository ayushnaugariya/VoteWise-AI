/**
 * Axios API Utility
 * Pre-configured instance for backend calls
 * Automatically attaches Firebase auth token
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Attach Firebase token if available
api.interceptors.request.use(async (config) => {
  try {
    // Dynamic import to avoid circular dependency
    const { auth } = await import('../firebase/config');
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch { /* No auth available */ }
  return config;
}, (err) => Promise.reject(err));

// Response interceptor: Normalize errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
