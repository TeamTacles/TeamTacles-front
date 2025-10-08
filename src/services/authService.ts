// Arquivo: src/services/authService.ts

import api from './api'; // <-- CORRIGIDO: Importação default sem chaves
import { LoginData, AuthResponse } from '../types/AuthTypes';

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/authenticate', data); 
  return response.data;
};