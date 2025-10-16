export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string; 
};

export interface LoginData {
  email?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
}