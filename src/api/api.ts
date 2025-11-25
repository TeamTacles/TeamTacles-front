import axios from 'axios';
// Caio
//const baseURL = 'http://192.168.15.42:8080/api'; 

// Pedro
//const baseURL = 'http://192.168.15.148:8080/api'; // caro dev, para fim de testes, altere este IP para o IP da sua máquina local (CMD > ipconfig)

// DigitalOcean
const baseURL = 'https://teamtacles-cc5eu.ondigitalocean.app/api'; // caro dev, para fim de testes, altere este IP para o IP da sua máquina local (CMD > ipconfig)

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// O token é setado via api.defaults.headers.Authorization no AppContext (signIn e loadStorageData)

// Callback de logout
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Logout automático quando token expira
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 sem errorCode = token expirado
    if (error.response?.status === 401 && !error.response?.data?.errorCode) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback(); // signOut() limpa token, cache e headers
      }
    }
    return Promise.reject(error);
  }
);

export default api;