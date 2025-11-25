import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { User } from '../types/entities';
import api, { setOnUnauthorizedCallback } from '../api/api'; 

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
      // 1. Limpa o header de Authorization (síncrono)
      delete api.defaults.headers.Authorization;
      
      // 2. Limpa storage
      await AsyncStorage.removeItem('@TeamTacles:user');
      await AsyncStorage.removeItem('@TeamTacles:token');
      
      // 3. Limpa cache do React Query
      queryClient.clear(); 
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
        const postLoginOnboardingComplete = await AsyncStorage.getItem('@TeamTacles:postLoginOnboardingComplete');

        if (storedUser && storedToken) {
          api.defaults.headers.Authorization = `Bearer ${storedToken}`;
          setUser(JSON.parse(storedUser));
          setShowPostLoginOnboarding(postLoginOnboardingComplete !== 'true');
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
      // 1. Salva no disco PRIMEIRO (garante persistência)
      await AsyncStorage.setItem('@TeamTacles:token', token);
      await AsyncStorage.setItem('@TeamTacles:user', JSON.stringify(userData));
      
      // 2. Seta o header (síncrono - todas as requests futuras usarão)
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      // 3. Verifica onboarding
      const postLoginOnboardingComplete = await AsyncStorage.getItem('@TeamTacles:postLoginOnboardingComplete');
      setShowPostLoginOnboarding(postLoginOnboardingComplete !== 'true');
      
      // 4. Dispara re-render POR ÚLTIMO (após tudo estar pronto)
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
      await AsyncStorage.setItem('@TeamTacles:postLoginOnboardingComplete', 'true');
      setShowPostLoginOnboarding(false);
    } catch (error) {
      console.error("Erro ao salvar tutorial pós-login:", error);
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