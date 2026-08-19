import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'chafadia_admin_token';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  // Server expects `contact` (email or phone), not `email` — see
  // server/controllers/authController.js's login().
  const { data } = await api.post('/auth/login', { contact: email, password });
  if (data.success) {
    if (data.user.role !== 'admin' && data.user.role !== 'main_admin') {
      throw new Error('Admin access required.');
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem('chafadia_admin_user', JSON.stringify(data.user));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('chafadia_admin_user');
  window.location.href = '/login';
};

export const getUser = () => {
  const u = localStorage.getItem('chafadia_admin_user');
  return u ? JSON.parse(u) : null;
};

export const isAuthenticated = () => !!localStorage.getItem(TOKEN_KEY);

export default api;
