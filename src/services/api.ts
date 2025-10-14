import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = 'http://192.168.0.137:8080/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona token nas requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@TeamTacles:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Callback de logout
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Logout automático quando token expira
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ✅ 401 sem errorCode = token expirado
    if (error.response?.status === 401 && !error.response?.data?.errorCode) {
      await AsyncStorage.removeItem('@TeamTacles:token');
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;