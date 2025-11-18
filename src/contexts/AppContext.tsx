import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnUnauthorizedCallback } from '../api/api';
import { login as loginService } from '../features/auth/services/authService';
import { LoginData } from '../types/auth';
import { userService } from '../features/user/services/userService';
import { getInitialsFromName } from '../utils/stringUtils';

interface User {
  id: number; 
  name: string;
  initials: string;
  onboardingCompleted: boolean; 
}

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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPostLoginOnboarding, setShowPostLoginOnboarding] = useState(false); 

  const loadUserData = async () => {
    try {
      const userData = await userService.getCurrentUser();
      
      const hasOnboardedPreLogin = await AsyncStorage.getItem(ONBOARDING_KEY); 

      const mappedUser: User = {
        id: userData.id,
        name: userData.username,
        initials: getInitialsFromName(userData.username),
        onboardingCompleted: userData.onboardingCompleted 
      };
      
      setUser(mappedUser);

      const shouldShowPostLogin = mappedUser.onboardingCompleted === false;
      
      setShowPostLoginOnboarding(shouldShowPostLogin);

    } catch (error) {
      signOut();
    }
  };

  useEffect(() => {
    async function loadStorageData() {
      try {
        const [hasOnboarded, storedToken] = await Promise.all([
            AsyncStorage.getItem(ONBOARDING_KEY),
            AsyncStorage.getItem(TOKEN_KEY),
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
      const updatedUser = await userService.completeOnboarding();
      
      setUser(prev => ({ 
          ...prev!, 
          onboardingCompleted: true, 
          name: updatedUser.username,
          initials: getInitialsFromName(updatedUser.username)
      }));

      setShowPostLoginOnboarding(false);

    } catch (e) {
      console.error("Erro ao completar/salvar flag de onboarding pós-login", e);
      setShowPostLoginOnboarding(false);
    }
  }

  async function signOut() {
    await AsyncStorage.removeItem(TOKEN_KEY); 
    setToken(null);
  }

  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
      
      if (token) {
        loadUserData();
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