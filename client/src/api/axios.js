import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('iv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally without disrupting public browsing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('iv_token');
      localStorage.removeItem('iv_token');
      localStorage.removeItem('iv_user');
      // Only redirect if user was logged in and is on a protected route
      const currentPath = window.location.pathname;
      const isPublicPath = currentPath === '/' || currentPath === '/buy' || currentPath === '/marketplace' || currentPath.startsWith('/listings/') || currentPath === '/signin' || currentPath === '/signup';
      if (hadToken && !isPublicPath) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
