import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Caio
//const baseURL = 'http://192.168.15.14:8080/api'; 

// Pedro
const baseURL = 'http://192.168.15.148:8080/api'; // caro dev, para fim de testes, altere este IP para o IP da sua máquina local (CMD > ipconfig)

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em cada requisição
api.interceptors.request.use(
  async (config) => {
    //busco o token do armazenamento a cada requisição
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
    //  401 sem errorCode = token expirado
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