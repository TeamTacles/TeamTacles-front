import api from '../../../api/api';
import { LoginData, AuthResponse, RegisterPayload } from '../../../types/auth';

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/authenticate', data);
  return response.data;
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post('/user/register', payload);
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

export interface ResendVerificationResponse {
  message: string;
}

export const resendVerification = async (email: string): Promise<ResendVerificationResponse> => {
  const response = await api.post<ResendVerificationResponse>('/auth/resend-verification', { email });
  return response.data;
};