import { ErrorCode } from '../types/ErrorCode';

export const getErrorMessage = (error: any): string => {
  const errorCode = error.response?.data?.errorCode;
  
  const backendMessage = error.response?.data?.errorMessage;

  const messages: Record<string, string> = {
    [ErrorCode.USERNAME_ALREADY_EXISTS]: 'Este nome de usuário já está em uso.',
    [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Este e-mail já está cadastrado.',
    [ErrorCode.PASSWORD_MISMATCH]: 'As senhas não coincidem.',
    [ErrorCode.SAME_AS_CURRENT_PASSWORD]: 'A nova senha não pode ser igual à senha atual.',
    [ErrorCode.INVALID_CREDENTIALS]: 'Email ou senha incorretos.',
    [ErrorCode.ACCOUNT_NOT_VERIFIED]: 'Sua conta não foi verificada. Verifique seu email.',
  };

  return messages[errorCode] || backendMessage || 'Erro desconhecido.';
};