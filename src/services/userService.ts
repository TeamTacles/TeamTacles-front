import api from './api';
import { RegisterPayload } from '../types/AuthTypes';

interface UpdateProfilePayload {
  username?: string;
  email?: string;
}

interface ChangePasswordPayload {
  password: string;
  passwordConfirm: string;
}

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

const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await api.patch('/user', payload);
  return response.data;
};

const deleteAccount = async () => {
  const response = await api.delete('/user');
  return response.data;
};

export const userService = {
  registerUser,
  updateProfile,
  getCurrentUser,
  changePassword,
  deleteAccount,
};