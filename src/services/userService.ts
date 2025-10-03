import api from './api';
import { RegisterPayload } from '../types/AuthTypes'; 

const registerUser = async (payload: RegisterPayload) => {
  try {
    const response = await api.post('/user/register', payload);
    return response.data;
  } catch (error) {
    console.error("Erro no serviço de registro:", error);
    throw error;
  }
};

export const userService = {
  registerUser,
};