import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from 'react-native';
import { LoginScreen } from './screens/LoginScreen';

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#2A2A2A' }}>
        <LoginScreen />
    </SafeAreaProvider>
  );
}

