import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// EXPO_PUBLIC_API_URL is baked in at build time and must point to a
// server reachable from the physical device (a deployed backend for
// real-world use, or your machine's LAN IP for local dev — 10.0.2.2 and
// localhost only resolve inside emulators/simulators, never on a real phone).
const DEV_FALLBACK = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK;

const TOKEN_KEY = 'chafadia_auth_token';
const USER_KEY  = 'chafadia_user';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    }
    return Promise.reject(error);
  }
);

export const saveToken  = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken   = ()      => AsyncStorage.getItem(TOKEN_KEY);
export const saveUser   = (user)  => AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser    = async () => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};
export const clearAuth  = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

export { TOKEN_KEY, USER_KEY, BASE_URL };
export default api;
