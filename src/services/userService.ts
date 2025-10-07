import api from './api';
import { RegisterPayload } from '../types/AuthTypes'; 

const registerUser = async (payload: RegisterPayload) => {
  const response = await api.post('/user/register', payload);
  return response.data;
};

export const userService = {
  registerUser,
};