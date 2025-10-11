import api from './api'; 
import { LoginData, AuthResponse } from '../types/AuthTypes';

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/authenticate', data); 
  return response.data;
};

export interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Não foi possível enviar o e-mail de recuperação.');
  }
};