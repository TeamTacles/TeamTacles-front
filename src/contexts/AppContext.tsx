import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnUnauthorizedCallback } from '../api/api';
import { login as loginService } from '../features/auth/services/authService';
import { LoginData } from '../types/auth';
import { userService } from '../features/user/services/userService';
import { getInitialsFromName } from '../utils/stringUtils';

// Interface para o objeto do usuário
interface User {
  id: number; // <<< LINHA ADICIONADA
  name: string;
  initials: string;
}

interface AppContextType {
  signed: boolean;
  loading: boolean;
  user: User | null; // Adiciona o usuário ao tipo do contexto
  signIn(credentials: LoginData): Promise<void>;
  signOut(): void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Estado para os dados do usuário
  const [loading, setLoading] = useState(true);

  // Função para carregar os dados do usuário da API
  const loadUserData = async () => {
    try {
      // Supondo que userService.getCurrentUser() retorna { id, username, email }
      const userData = await userService.getCurrentUser();
      setUser({
        id: userData.id, // <<< LINHA ADICIONADA: Armazena o ID
        name: userData.username,
        initials: getInitialsFromName(userData.username)
      });
    } catch (error) {
      // Se falhar (ex: token inválido), desloga o usuário
      console.error("Falha ao carregar dados do usuário, deslogando.", error);
      signOut();
    }
  };

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = await AsyncStorage.getItem('@TeamTacles:token');
      if (storedToken) {
        setToken(storedToken);
        await loadUserData(); // Carrega os dados do usuário se o token existir
      }
      setLoading(false);
    }
    loadStorageData();

    setOnUnauthorizedCallback(() => {
      signOut(); // Usa a função signOut para limpar tudo
    });
  }, []);

  async function signIn(credentials: LoginData) {
    const response = await loginService(credentials);
    const { token: newToken } = response;

    setToken(newToken);
    await AsyncStorage.setItem('@TeamTacles:token', newToken);
    await loadUserData(); 
  }

  async function signOut() {
    await AsyncStorage.clear();
    setToken(null);
    setUser(null); // Limpa o estado do usuário ao deslogar
  }

  return (
    <AppContext.Provider
      value={{
        signed: !!token,
        loading,
        user, // Disponibiliza o usuário no contexto
        signIn,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('o useAppContext deve ser usado dentro de um AppProvider.');
  }
  return context;
};