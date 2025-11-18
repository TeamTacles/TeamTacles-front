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
  showPostLoginOnboarding: boolean; 
  completeOnboarding(): void; 
  completePostLoginOnboarding(): void; 
  signIn(credentials: LoginData): Promise<void>;
  signOut(): void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TOKEN_KEY = '@TeamTacles:token';
const ONBOARDING_KEY = '@TeamTacles:hasOnboarded';
const POST_LOGIN_ONBOARDING_KEY = '@TeamTacles:hasCompletedPostLoginOnboarding'; 

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPostLoginOnboarding, setShowPostLoginOnboarding] = useState(false); 

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
        // CORREÇÃO: Adicionando hasCompletedPostLoginOnboarding ao Promise.all
        const [hasOnboarded, storedToken, hasCompletedPostLoginOnboarding] = await Promise.all([
            AsyncStorage.getItem(ONBOARDING_KEY),
            AsyncStorage.getItem(TOKEN_KEY),
            AsyncStorage.getItem(POST_LOGIN_ONBOARDING_KEY)
        ]);

        if (storedToken) {
          setToken(storedToken);
        }
        if (!hasOnboarded) { 
          setShowOnboarding(true);
        } else if (storedToken && !hasCompletedPostLoginOnboarding) { 
          // Se completou o pré-login E está logado E não completou o pós-login
          setShowPostLoginOnboarding(true);
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

  // CORREÇÃO: Este useEffect absorve a lógica de 'loadUserData' e a checagem do pós-login
  useEffect(() => {
    if (token) {
      loadUserData();
      // Verifica se deve mostrar o Onboarding Pós-Login após o login
      AsyncStorage.getItem(ONBOARDING_KEY).then(hasOnboarded => {
        if (hasOnboarded) {
          AsyncStorage.getItem(POST_LOGIN_ONBOARDING_KEY).then(hasCompleted => {
            if (!hasCompleted) {
              setShowPostLoginOnboarding(true);
            }
          });
        }
      });
      
    } else {
      setUser(null);
      // Garante que o onboarding pós-login não apareça na tela de login/registro
      setShowPostLoginOnboarding(false);
    }
  }, [token]);


  async function signIn(credentials: LoginData) {
    const response = await loginService(credentials);
    const { token: newToken } = response;

    setToken(newToken);
    await AsyncStorage.setItem('@TeamTacles:token', newToken);
  }

  async function completePostLoginOnboarding() { 
    try {
      await AsyncStorage.setItem(POST_LOGIN_ONBOARDING_KEY, 'true');
      setShowPostLoginOnboarding(false);
    } catch (e) {
      console.error("Erro ao salvar flag de onboarding pós-login", e);
      setShowPostLoginOnboarding(false);
    }
  }

  async function signOut() {
    await AsyncStorage.clear(); 
    setToken(null);
  }

  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
      // Se completar o pré-onboarding, exibe o pós-login se já estiver logado (o useEffect do [token] vai lidar com o hasCompleted)
      if (token) {
         setShowPostLoginOnboarding(true);
      }
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
        completePostLoginOnboarding,
        showPostLoginOnboarding, 
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