import axios from 'axios';

// !!! PEDRÃO lembre-se de substituir o IP pelo IP da sua máquina na rede Wi-Fi !!!
const baseURL = 'http://192.168.0.137:8080/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;