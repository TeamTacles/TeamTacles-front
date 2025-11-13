import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnUnauthorizedCallback } from '../api/api';
import { login as loginService } from '../features/auth/services/authService';
import { LoginData } from '../types/auth';
import { userService } from '../features/user/services/userService';
import { getInitialsFromName } from '../utils/stringUtils';

// Interface para o objeto do usuário
interface User {
  id: number; 
  name: string;
  initials: string;
}
//Definindo o contrato pro restante do app
interface AppContextType {
  signed: boolean;
  loading: boolean;
  user: User | null; 
  signIn(credentials: LoginData): Promise<void>;
  signOut(): void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);

  // Função para carregar os dados do usuário da API / armazenado no AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser({
        id: userData.id,
        name: userData.username,
        initials: getInitialsFromName(userData.username)
      });
    } catch (error) {
      // Se falhar  desloga o usuário
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

    // caso o token expire (401), desloga o usuário automaticamente
    setOnUnauthorizedCallback(() => {
      signOut(); 
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
        user, 
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