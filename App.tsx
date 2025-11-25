import React from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './src/contexts/AppContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import RootNavigator  from './src/navigation/RootNavigator';
import { LogBox } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados "frescos"
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo no cache (antes era cacheTime)
      retry: 2, // Tenta 2 vezes em caso de erro
      refetchOnWindowFocus: false, // NÃO refaz GET ao voltar pra aba
      refetchOnReconnect: true, // Refaz quando reconectar internet
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppProvider>
          <NotificationProvider>
            <RootNavigator />
          </NotificationProvider>
        </AppProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}