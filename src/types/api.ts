// src/types/api.ts
// Tipos relacionados à API e respostas HTTP

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export enum ErrorCode {
    USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
    PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
    SAME_AS_CURRENT_PASSWORD = 'SAME_AS_CURRENT_PASSWORD',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS', 
    PROJECT_TITLE_ALREADY_EXISTS = 'PROJECT_TITLE_ALREADY_EXISTS',
}
