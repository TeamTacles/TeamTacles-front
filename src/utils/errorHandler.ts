// src/utils/errorHandler.ts
import { ErrorCode } from '../types/api';
import { isAxiosError } from 'axios'; // Importar isAxiosError

export const getErrorMessage = (error: any): string => {
  // Tenta pegar o errorCode específico do AxiosError
  const errorCode = isAxiosError(error) ? error.response?.data?.errorCode : undefined;
  // Tenta pegar a errorMessage específica do AxiosError
  const backendMessage = isAxiosError(error) ? error.response?.data?.errorMessage : undefined;

  // Mensagens mapeadas para ErrorCodes conhecidos
  const messages: Partial<Record<ErrorCode, string>> = { // Use Partial<>
    [ErrorCode.USERNAME_ALREADY_EXISTS]: 'Este nome de usuário já está em uso.',
    [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Este e-mail já está cadastrado.',
    [ErrorCode.PASSWORD_MISMATCH]: 'As senhas não coincidem.',
    [ErrorCode.SAME_AS_CURRENT_PASSWORD]: 'A nova senha não pode ser igual à senha atual.',
    [ErrorCode.INVALID_CREDENTIALS]: 'Email ou senha incorretos.',
    [ErrorCode.ACCOUNT_NOT_VERIFIED]: 'Sua conta não foi verificada. Verifique seu email.',
    [ErrorCode.RESOURCE_NOT_FOUND]: 'Recurso não encontrado.',
    // Adiciona a mensagem específica para o erro de título do projeto
    [ErrorCode.PROJECT_TITLE_ALREADY_EXISTS]: 'Você já possui um projeto com este título.',
    // Mapeia o erro genérico do backend também, se existir
    [ErrorCode.RESOURCE_ALREADY_EXISTS]: backendMessage || 'Este recurso já existe.',
  };

  // Retorna a mensagem específica do errorCode, se mapeada
  if (errorCode && messages[errorCode as ErrorCode]) {
      return messages[errorCode as ErrorCode]!;
  }

  // Se não houver errorCode mapeado, tenta retornar a errorMessage do backend
  if (backendMessage) {
      return backendMessage;
  }

  // Se for um erro genérico (não Axios ou sem detalhes), retorna a mensagem padrão
  if (error instanceof Error) {
      return error.message;
  }

  // Fallback final
  return 'Ocorreu um erro desconhecido.';
};

// Função específica para tratamento de erro de convite por email
export const getInviteErrorMessage = (error: any): string => {
  const errorCode = isAxiosError(error) ? error.response?.data?.errorCode : undefined;

  if (errorCode === ErrorCode.RESOURCE_NOT_FOUND) {
    // Verifica se a mensagem de erro do backend menciona 'User not found'
    const backendMessage = error.response?.data?.errorMessage || '';
    if (backendMessage.toLowerCase().includes('user not found')) {
        return 'Usuário não encontrado. Certifique-se de que a pessoa já possui uma conta.';
    }
    // Se for outro RESOURCE_NOT_FOUND, usa a mensagem genérica
    return getErrorMessage(error);
  }

  // Para outros erros, usa a lógica padrão
  return getErrorMessage(error);
};