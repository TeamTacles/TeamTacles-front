import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// !!! PEDRÃO lembre-se de substituir o IP pelo IP da sua máquina na rede Wi-Fi !!!
const baseURL = 'http://192.168.0.137:8080/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===================================================================
// INTERCEPTADOR DE REQUISIÇÃO
// ===================================================================
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@TeamTacles:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===================================================================
// CALLBACK DE LOGOUT (para sincronizar com AppContext)
// ===================================================================
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// ===================================================================
// INTERCEPTADOR DE RESPOSTA
// ===================================================================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Verifica se o erro é 401 (Não Autorizado) e se não é uma tentativa de retry.
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Interceptor de API: Token expirado ou inválido (status 401).');

      // Limpa os dados de autenticação do armazenamento.
      await AsyncStorage.removeItem('@TeamTacles:token');

      // Chama o callback para notificar o AppContext
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    // Repassa o erro para que ele possa ser tratado no ponto da chamada (num bloco catch).
    return Promise.reject(error);
  }
);

export default api;