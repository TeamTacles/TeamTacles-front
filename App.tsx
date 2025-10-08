import React from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from './src/contexts/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import { LogBox } from 'react-native';

// Opcional: Ignorar warnings comuns do React Navigation
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}