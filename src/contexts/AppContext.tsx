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
  showOnboarding: boolean;
  completeOnboarding(): void; 
  signIn(credentials: LoginData): Promise<void>;
  signOut(): void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TOKEN_KEY = '@TeamTacles:token';
const ONBOARDING_KEY = '@TeamTacles:hasOnboarded';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
      // Se falhar (ex: token expirou mas ainda existia), desloga o usuário
      signOut();
    }
  };

  useEffect(() => {
    async function loadStorageData() {
      try {
        const [hasOnboarded, storedToken] = await Promise.all([
            AsyncStorage.getItem(ONBOARDING_KEY),
            AsyncStorage.getItem(TOKEN_KEY)
        ]);

        if (storedToken) {
          setToken(storedToken);
        }
        if (!hasOnboarded) { 
          setShowOnboarding(true);
        }

      } catch (e) {
        console.error("Falha ao carregar dados do storage", e);
      } finally {
        setLoading(false);
      }
    }
    
    loadStorageData();

    setOnUnauthorizedCallback(() => {
      signOut(); 
    });
  }, []); 

  useEffect(() => {
    if (token) {
      loadUserData();
    } else {
      setUser(null);
    }
  }, [token]); 

  async function signIn(credentials: LoginData) {
    const response = await loginService(credentials);
    const { token: newToken } = response;

    setToken(newToken);
    await AsyncStorage.setItem('@TeamTacles:token', newToken);
  }

  async function signOut() {
    await AsyncStorage.clear(); 
    setToken(null);
  }

  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (e) {
      console.error("Erro ao salvar flag de onboarding", e);
      setShowOnboarding(false);
    }
  }

  return (
    <AppContext.Provider
      value={{
        signed: !!token,
        loading,
        user, 
        showOnboarding, 
        completeOnboarding,
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