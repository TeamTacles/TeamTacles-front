import React from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from './src/contexts/AppContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import RootNavigator from './src/navigation/RootNavigator';
import { LogBox } from 'react-native';


export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NotificationProvider>
          <RootNavigator />
        </NotificationProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}