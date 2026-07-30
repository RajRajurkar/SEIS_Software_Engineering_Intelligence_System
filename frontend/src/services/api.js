import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] Response ${response.status}:`, response.data);
    }
    return response.data;
  },
  (error) => {
    const status  = error.response?.status;
    const data    = error.response?.data;

    let message = 'Something went wrong. Please try again.';

    if (data?.detail) {
      message = Array.isArray(data.detail)
        ? data.detail.map((d) => d.msg || d).join(', ')
        : String(data.detail);
    } else if (data?.message) {
      message = data.message;
    } else if (error.message === 'Network Error') {
      message = 'Cannot connect to the backend. Make sure the server is running on port 8000.';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. The repository may be very large.';
    } else if (status === 404) {
      message = 'Resource not found.';
    } else if (status === 422) {
      message = 'Invalid request data.';
    } else if (status === 500) {
      message = 'Internal server error. Check the backend logs.';
    }

    if (import.meta.env.DEV) {
      console.error(`[API] Error ${status}:`, message, error.response?.data);
    }

    return Promise.reject({ message, status, raw: error.response?.data });
  },
);

export default api;