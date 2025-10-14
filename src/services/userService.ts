import api from './api';
import { RegisterPayload } from '../types/AuthTypes'; 

const registerUser = async (payload: RegisterPayload) => {
  const response = await api.post('/user/register', payload);
  return response.data;
};


const updateProfile = async (payload: UpdateProfilePayload) => {
  const response = await api.patch('/user', payload);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get('/user');
  return response.data;
};

interface UpdateProfilePayload {
  username?: string;
  email?: string;
}



export const userService = {
  registerUser,
  updateProfile,
  getCurrentUser,
};