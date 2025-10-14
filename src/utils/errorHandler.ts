import { ErrorCode } from '../types/ErrorCode';

export const getErrorMessage = (error: any): string => {
  const errorCode = error.response?.data?.errorCode;
  const backendMessage = error.response?.data?.message;
  
  const messages: Record<string, string> = {
    [ErrorCode.USERNAME_ALREADY_EXISTS]: 'Este nome de usuário já está em uso.',
    [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Este e-mail já está cadastrado.',
    [ErrorCode.PASSWORD_MISMATCH]: 'As senhas não coincidem.',
  };
  
  return messages[errorCode] || backendMessage || 'Erro desconhecido.';
};