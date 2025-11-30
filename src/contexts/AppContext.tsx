import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { User } from '../types/entities';
import api, { setOnUnauthorizedCallback } from '../api/api'; 
import { userService } from '../features/user/services/userService'; 

interface AppContextData {
  user: User | null;
  signed: boolean;
  loading: boolean;
  showOnboarding: boolean;
  showPostLoginOnboarding: boolean;
  signIn: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>; 
  completeOnboarding: () => Promise<void>;
  completePostLoginOnboarding: () => Promise<void>;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showPostLoginOnboarding, setShowPostLoginOnboarding] = useState(false);
  
  const queryClient = useQueryClient(); 

  const signOut = useCallback(async () => {
    try {
      delete api.defaults.headers.Authorization;
      await AsyncStorage.removeItem('@TeamTacles:user');
      await AsyncStorage.removeItem('@TeamTacles:token');
      
      setShowPostLoginOnboarding(false);

      queryClient.clear(); //  resolve o erro  de salvar dados do login anterior quando o usuario faz logout e loga novamente
      await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setUser(null);
    }
  }, [queryClient]);

  useEffect(() => {
    setOnUnauthorizedCallback(signOut);
  }, [signOut]);

  useEffect(() => {
    async function loadStorageData() {
      try {

        const storedUser = await AsyncStorage.getItem('@TeamTacles:user');
        const storedToken = await AsyncStorage.getItem('@TeamTacles:token');
        const onboardingComplete = await AsyncStorage.getItem('@TeamTacles:onboardingComplete');

        console.log('[DEBUG] Storage Load:', { 
            hasUser: !!storedUser, 
            preOnboardingDone: onboardingComplete === 'true' 
        });

        if (storedUser && storedToken) {
          api.defaults.headers.Authorization = `Bearer ${storedToken}`;
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);

          const shouldShowPostLogin = !parsedUser.onboardingCompleted;
          console.log('[DEBUG] Post-Login Check (Storage):', { 
              statusNoBanco: parsedUser.onboardingCompleted, 
              vaiMostrar: shouldShowPostLogin 
          });
          
          setShowPostLoginOnboarding(shouldShowPostLogin);
        }
        
        setShowOnboarding(onboardingComplete !== 'true');

      } catch (error) {
        console.error("Erro ao carregar dados do storage:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = async (userData: User, token: string) => {
    try {
      await AsyncStorage.setItem('@TeamTacles:token', token);
      await AsyncStorage.setItem('@TeamTacles:user', JSON.stringify(userData));
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      const shouldShowPostLogin = !userData.onboardingCompleted;
      console.log('[DEBUG] Post-Login Check (SignIn):', { 
          statusNoBanco: userData.onboardingCompleted, 
          vaiMostrar: shouldShowPostLogin 
      });

      setShowPostLoginOnboarding(shouldShowPostLogin);
      setUser(userData);
    } catch (error) {
      console.error("Erro ao salvar dados de login:", error);
      throw error; 
    }
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser); 
    try {
      await AsyncStorage.setItem('@TeamTacles:user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Falha crítica ao persistir atualização do usuário:", error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@TeamTacles:onboardingComplete', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error("Erro ao salvar onboarding:", error);
    }
  };

  const completePostLoginOnboarding = async () => {
    try {
      const updatedUserFromApi = await userService.completeOnboarding();
      
      if (user) {
          const userAtualizado = { ...user, ...updatedUserFromApi, onboardingCompleted: true };
          
          setUser(userAtualizado);
          await AsyncStorage.setItem('@TeamTacles:user', JSON.stringify(userAtualizado));
      }

      setShowPostLoginOnboarding(false);
      
    } catch (error) {
      console.error("Erro ao salvar tutorial pós-login no backend:", error);
      setShowPostLoginOnboarding(false);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      signed: !!user, 
      loading, 
      showOnboarding, 
      showPostLoginOnboarding, 
      signIn, 
      signOut, 
      updateUser, 
      completeOnboarding, 
      completePostLoginOnboarding 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);