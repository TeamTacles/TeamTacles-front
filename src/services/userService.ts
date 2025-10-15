import api from './api';

interface UpdateProfilePayload {
  username?: string;
  email?: string;
}

interface ChangePasswordPayload {
  password: string;
  passwordConfirm: string;
}

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
  updateProfile,
  getCurrentUser,
  changePassword,
  deleteAccount,
};