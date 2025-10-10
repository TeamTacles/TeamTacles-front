// Arquivo: src/navigation/RootNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAppContext } from '../contexts/AppContext';
import { RootStackParamList } from "../types/Navigation";

import { LoginScreen } from '../screens/LoginScreen'; // <-- CORRIGIDO: Importação nomeada com chaves
import { RegisterScreen } from '../screens/RegisterScreen';
import { TaskForm } from '../screens/TaskFormScreen';
import { MenuNavigator } from './MenuNavigator';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { TeamDetailScreen } from '../screens/TeamDetailScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen'; 
import { ReportCenterScreen } from '../screens/ReportCenterScreen'; 
import { TaskDetailScreen } from '../screens/TaskDetailScreen'; 

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- Navegador para o fluxo NÃO AUTENTICADO ---
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// --- Navegador para o fluxo AUTENTICADO (com menu e modais) ---
const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Menu" screenOptions={{ headerShown: false }}>
    <Stack.Group screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Menu" component={MenuNavigator} />
    </Stack.Group>
    
    <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="TaskForm" component={TaskForm} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="ReportCenter" component={ReportCenterScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} /> 
    </Stack.Group>
  </Stack.Navigator>
);

// --- O "Porteiro" que decide qual navegador mostrar ---
const RootNavigator = () => {
  const { signed, loading } = useAppContext();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    // NavigationContainer>
    //  {signed ? <AppNavigator /> : <AuthNavigator />}
    //</NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;