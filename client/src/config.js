import axios from 'axios';

// Dynamically determine backend URLs based on frontend access URL
const getBackendURL = () => {
  // If env variable is set, use it (for production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Otherwise, use the same hostname as the frontend
  const hostname = window.location.hostname;
  return `http://${hostname}:5000`;
};

const getMediaURL = () => {
  // If env variable is set, use it
  if (process.env.REACT_APP_MEDIA_URL) {
    return process.env.REACT_APP_MEDIA_URL;
  }
  
  // Otherwise, use the same hostname as the frontend
  const hostname = window.location.hostname;
  return `http://${hostname}:8888`;
};

// API Configuration
export const API_URL = getBackendURL();
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL;
export const MEDIA_URL = getMediaURL();

// Debug logging
console.log('🔧 CONFIG LOADED:', {
  API_URL,
  SOCKET_URL,
  MEDIA_URL,
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_SOCKET_URL: process.env.REACT_APP_SOCKET_URL,
    REACT_APP_MEDIA_URL: process.env.REACT_APP_MEDIA_URL
  }
});

// Set axios default base URL
axios.defaults.baseURL = API_URL;

// Add authentication token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request:', config.url);
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors and IP bans globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle IP ban (403 with ipBanned flag)
    if (error.response?.status === 403 && error.response?.data?.ipBanned) {
      console.error('🚫 IP BANNED - Access denied to entire platform');
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Show ban message
      alert('🚫 YOUR IP HAS BEEN PERMANENTLY BANNED FROM THIS PLATFORM\n\nYou violated the Terms of Service and your access has been revoked.');
      // Redirect to login (which will also be blocked by IP ban)
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - Token invalid or expired');
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecting to login...');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const config = {
  API_URL,
  SOCKET_URL,
  MEDIA_URL
};

export default config;

